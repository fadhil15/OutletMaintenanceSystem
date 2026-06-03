import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mapRowToWorklog } from '@/utils/worklogHelpers'
import { WORKLOG_SHEET_CONFIG } from '@/constants/worklog'

export const useDataStore = defineStore('data', () => {
  // Connection state
  const sheetsUrl = ref(localStorage.getItem('oms_sheets_url') || 'https://docs.google.com/spreadsheets/d/1X4o9LeUKI9fh4i5SSOSVnGzuZJCQpR20YRkToAvRrhQ/edit?usp=sharing')
  const crudUrl = ref(localStorage.getItem('oms_crud_url') || 'https://script.google.com/macros/s/AKfycbztW1H2ol7cad7LU1l2-t_RFs5nb_EYB7toZYYA4mc7VGHj1l1h1FDMNks7vkMNVN8/exec')
  const sheetsConnected = ref(false)
  const crudConnected = ref(false)
  const crudStatusMessage = ref('Belum dites')
  const crudLastChecked = ref('')
  const isLoading = ref(false)

  // Data arrays
  const masterLink = ref([])
  const ticketing = ref([])
  const pengadaan = ref([])
  const dbOutlet = ref([])
  const maintenance = ref([])
  const worklog = ref([])
  const worklogError = ref(null)

  // Computed stats
  const stats = computed(() => ({
    totalKatalog: masterLink.value.length,
    tiketPending: ticketing.value.filter(t => String(t.status).trim() === 'Pending').length,
    dalamPengiriman: pengadaan.value.filter(p => !String(p.status).includes('Diterima')).length,
    asetAktif: dbOutlet.value.filter(a => String(a.kondisi).trim() === 'Aktif').length,
    asetRusak: dbOutlet.value.filter(a => String(a.kondisi).trim() === 'Rusak').length,
  }))

  const chartData = computed(() => {
    const tiketTotal = ticketing.value.length || 1
    const tiketSelesai = ticketing.value.filter(t => String(t.status).trim() === 'Selesai').length
    const tiketPct = Math.round((tiketSelesai / tiketTotal) * 100)

    const asetTotal = dbOutlet.value.length || 1
    const asetAktif = dbOutlet.value.filter(a => String(a.kondisi).trim() === 'Aktif').length
    const asetPct = Math.round((asetAktif / asetTotal) * 100)

    const pgdTotal = pengadaan.value.length || 1
    const pgdDiterima = pengadaan.value.filter(p => String(p.status).includes('Diterima')).length
    const pgdPct = Math.round((pgdDiterima / pgdTotal) * 100)

    return { tiketPct, asetPct, pgdPct }
  })

  const recentTickets = computed(() =>
    [...ticketing.value]
      // Try to parse the DD/MM/YYYY HH:mm time format or rely on simple string sort for now
      .slice(0, 4)
  )

  // ─── GOOGLE SHEETS API UTILS ───
  function extractSpreadsheetId(input) {
    if (!input) return null
    input = input.replace(/\s+/g, '').trim()
    const urlMatch = input.match(/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
    if (urlMatch) return urlMatch[1]
    if (/^[a-zA-Z0-9_-]{20,}$/.test(input)) return input
    return null
  }

  function fetchSheetJSONP(spreadsheetId, sheetName) {
    return new Promise((resolve, reject) => {
      const cbName = '_gvizCb_' + Math.random().toString(36).substr(2, 9)
      const timeout = setTimeout(() => {
        cleanup()
        reject(new Error(`Timeout loading: ${sheetName}`))
      }, 15000)

      function cleanup() {
        clearTimeout(timeout)
        delete window[cbName]
        const el = document.getElementById(cbName)
        if (el) el.remove()
      }

      window[cbName] = function (response) {
        cleanup()
        if (response.status === 'error') {
          reject(new Error(response.errors?.[0]?.detailed_message || 'Error'))
          return
        }
        resolve(response.table)
      }

      const script = document.createElement('script')
      script.id = cbName
      script.src = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=responseHandler:${cbName}&sheet=${encodeURIComponent(sheetName)}`
      script.onerror = () => {
        cleanup()
        reject(new Error(`Gagal load: ${sheetName}`))
      }
      document.head.appendChild(script)
    })
  }

  function parseGVizTable(table) {
    if (!table || !table.rows) return []
    return table.rows
      .filter(row => row.c && row.c[0] && row.c[0].v)
      .map(row => row.c.map(cell => {
        if (!cell || cell.v === null || cell.v === undefined) return ''
        let val = cell.v
        if (typeof val === 'string' && val.startsWith('#')) return ''
        if (cell.f) return cell.f
        return String(val)
      }))
  }


  function getCrudRequestUrl(action) {
    const params = new URLSearchParams()
    if (action) params.set('action', action)
    return `/api/apps-script${params.toString() ? `?${params.toString()}` : ''}`
  }

  function getCrudRequestHeaders(extra = {}) {
    return {
      ...extra,
      'x-apps-script-url': crudUrl.value
    }
  }

  // ─── ACTIONS ───
  async function connectSheets(url) {
    if (!url) return
    sheetsUrl.value = url
    localStorage.setItem('oms_sheets_url', url)
    const sid = extractSpreadsheetId(url)
    if (!sid) {
      console.warn('Spreadsheet ID format tidak dikenali.')
      return
    }

    isLoading.value = true
    try {
      const [mLink, tkt, pgd, dbOut, mnt, wlog] = await Promise.all([
        fetchSheetJSONP(sid, '1. Master Link CO').catch(e => { console.warn(e); return null; }),
        fetchSheetJSONP(sid, '2. Ticketing').catch(e => { console.warn(e); return null; }),
        fetchSheetJSONP(sid, '3. Tracker Pengadaan').catch(e => { console.warn(e); return null; }),
        fetchSheetJSONP(sid, '4. Database Outlet').catch(e => { console.warn(e); return null; }),
        fetchSheetJSONP(sid, '5. Maintenance').catch(e => { console.warn(e); return null; }),
        fetchSheetJSONP(sid, WORKLOG_SHEET_CONFIG.name).catch(e => { console.warn(e); return null; })
      ])

      if (mLink) {
        masterLink.value = parseGVizTable(mLink).map(r => ({
          kode: r[0] || '', kategori: r[1] || '', nama: r[2] || '', 
          linkCO: r[3] || '', toko: r[4] || '', 
          harga: parseFloat((r[5] || '0').replace(/[^\d]/g, '')) || 0
        }))
      }

      if (tkt) {
        ticketing.value = parseGVizTable(tkt).map(r => ({
          id: r[0] || '', waktu: r[1] || '', outlet: r[2] || '', barang: r[3] || '',
          kendala: r[4] || '', foto: r[5] || '', linkCO: r[6] || '',
          status: r[7] || 'Pending', pic: r[8] || ''
        }))
      }

      if (pgd) {
        pengadaan.value = parseGVizTable(pgd).map(r => ({
          id: r[0] || '', idTiket: r[1] || '', barang: r[2] || '', outlet: r[3] || '',
          tglCO: r[4] || '', resi: r[5] || '', estimasi: r[6] || '', status: r[7] || 'Dikemas'
        }))
      }

      if (dbOut) {
        dbOutlet.value = parseGVizTable(dbOut).map(r => ({
          kodeAset: r[0] || '', outlet: r[1] || '', barang: r[2] || '',
          tglMulai: r[3] || '', kondisi: r[4] || 'Aktif', catatan: r[5] || ''
        }))
      }

      if (mnt) {
        maintenance.value = parseGVizTable(mnt).map(r => ({
          id: r[0] || '', cabang: r[1] || '', kategori: r[2] || '', pekerjaan: r[3] || '',
          status: r[4] || 'To Do', startDate: r[5] || '', endDate: r[6] || '', pic: r[7] || ''
        }))
      }

      if (wlog) {
        worklog.value = parseGVizTable(wlog).map(r => mapRowToWorklog(r))
        worklogError.value = null
      }

      sheetsConnected.value = true
    } catch (e) {
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  async function testCrudConnection(url = crudUrl.value) {
    if (!url) {
      crudConnected.value = false
      crudStatusMessage.value = 'URL Apps Script belum diisi'
      crudLastChecked.value = new Date().toISOString()
      return false
    }

    crudStatusMessage.value = 'Mengecek koneksi Apps Script...'
    try {
      const previousUrl = crudUrl.value
      crudUrl.value = url
      const resp = await fetch(getCrudRequestUrl('getWorklogs'), {
        method: 'GET',
        headers: getCrudRequestHeaders({ Accept: 'application/json' })
      })
      crudUrl.value = previousUrl

      const contentType = resp.headers.get('content-type') || ''
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} ${resp.statusText || ''}`.trim())
      }
      if (!contentType.includes('application/json')) {
        throw new Error(`Response bukan JSON (${contentType || 'tanpa content-type'}). Pastikan Web App bisa diakses Anyone, bukan hanya akun Google Anda.`)
      }

      const json = await resp.json()
      const rows = Array.isArray(json)
        ? json
        : (json.data || json.worklogs || json.rows || [])
      const statusOk = json.ok === true || json.status === 'ok' || Array.isArray(json) || Array.isArray(rows)
      if (!statusOk) {
        throw new Error(json.error || json.message || 'Format response Apps Script tidak dikenali')
      }

      crudConnected.value = true
      crudStatusMessage.value = `Terhubung (${Array.isArray(rows) ? rows.length : 0} worklog terbaca)`
      crudLastChecked.value = new Date().toISOString()
      return true
    } catch (e) {
      crudConnected.value = false
      crudStatusMessage.value = `Gagal koneksi Apps Script: ${e.message}`
      crudLastChecked.value = new Date().toISOString()
      console.warn('[CRUD] Connection test failed:', e)
      return false
    }
  }

  async function connectCrud(url) {
    if (!url) return false
    crudUrl.value = url
    localStorage.setItem('oms_crud_url', url)
    return await testCrudConnection(url)
  }

  async function sendToAppsScript(payload) {
    if (!crudUrl.value) {
      crudConnected.value = false
      crudStatusMessage.value = 'CRUD tidak aktif: URL Apps Script belum diisi'
      console.warn('CRUD tidak aktif')
      return false
    }

    // Jangan blokir POST hanya karena test GET gagal.
    // Apps Script sering tidak mengizinkan response dibaca browser (CORS),
    // sementara POST no-cors tetap bisa dieksekusi kalau deployment public.
    if (!crudConnected.value) {
      await testCrudConnection(crudUrl.value)
    }

    try {
      const resp = await fetch(getCrudRequestUrl(), {
        method: 'POST',
        headers: getCrudRequestHeaders({ 'Content-Type': 'text/plain' }),
        body: JSON.stringify(payload)
      })
      if (!resp.ok) {
        const text = await resp.text().catch(() => '')
        throw new Error(`HTTP ${resp.status}${text ? `: ${text.slice(0, 180)}` : ''}`)
      }
      crudConnected.value = true
      crudStatusMessage.value = 'Request CRUD berhasil dikirim'
      crudStatusMessage.value = 'Request CRUD terkirim (mode no-cors, status tulis tidak bisa dibaca browser)'
      return true
    } catch (e) {
      crudConnected.value = false
      crudStatusMessage.value = `CRUD Request Failed: ${e.message}`
      console.error('CRUD Request Failed', e)
      return false
    }
  }

  // ─── WORKLOG FETCH ───
  // Menggunakan CRUD endpoint yang sama dengan ?action=getWorklogs
  // Fallback ke Google Sheets JSONP jika CRUD tidak terkonfigurasi
  async function fetchWorklog() {
    worklogError.value = null
    isLoading.value = true

    // Method 1: CRUD endpoint (sama dengan endpoint modul lain)
    if (crudConnected.value && crudUrl.value) {
      try {
        const resp = await fetch(getCrudRequestUrl('getWorklogs'), {
          headers: getCrudRequestHeaders({ Accept: 'application/json' })
        })
        const json = await resp.json()
        const rows = Array.isArray(json) ? json : (json.data || json.worklogs || json.rows || null)
        if (rows) {
          worklog.value = rows.map(row => ({
            idLog:           row['ID Log'] || '',
            tanggal:         row['Tanggal'] || '',
            waktu:           row['Waktu'] || '',
            tipeAktivitas:   row['Tipe Aktivitas'] || '',
            modulTerkait:    row['Modul Terkait'] || '',
            referensiId:     row['Referensi ID'] || '',
            outletCabang:    row['Outlet/Cabang'] || '',
            judulAktivitas:  row['Judul Aktivitas'] || '',
            catatanDetail:   row['Catatan Detail'] || '',
            pic:             row['PIC'] || '',
            prioritas:       row['Prioritas'] || 'Medium',
            statusFollowUp:  row['Status Follow Up'] || 'Open',
            tanggalFollowUp: row['Tanggal Follow Up'] || '',
            createdBy:       row['Created By'] || ''
          }))
          console.log(`[Worklog] Fetched ${worklog.value.length} entries via CRUD API`)
        }
      } catch (e) {
        console.warn('[Worklog] CRUD fetch gagal, fallback ke JSONP:', e)
        // Jika gagal (mis. CORS), lanjut ke fallback
        await fetchWorklogViaJsonp()
      } finally {
        isLoading.value = false
      }
      return
    }

    // Method 2: Fallback — Google Sheets JSONP (read-only, tidak perlu auth)
    await fetchWorklogViaJsonp()
    isLoading.value = false
  }

  async function fetchWorklogViaJsonp() {
    const sid = extractSpreadsheetId(sheetsUrl.value)
    if (!sid) return
    try {
      const wlog = await fetchSheetJSONP(sid, WORKLOG_SHEET_CONFIG.name)
      if (wlog) {
        worklog.value = parseGVizTable(wlog).map(r => mapRowToWorklog(r))
        console.log(`[Worklog] Fetched ${worklog.value.length} entries via JSONP`)
      }
    } catch (e) {
      console.error('[Worklog] JSONP fetch gagal:', e)
      worklogError.value = e.message || 'Gagal memuat data worklog'
    }
  }

  function formatRupiah(num) {
    if (!num) return '0'
    return new Intl.NumberFormat('id-ID').format(num)
  }

  return {
    sheetsUrl, crudUrl, sheetsConnected, crudConnected, crudStatusMessage, crudLastChecked, isLoading,
    masterLink, ticketing, pengadaan, dbOutlet, maintenance,
    worklog, worklogError,
    stats, chartData, recentTickets,
    connectSheets, connectCrud, testCrudConnection, formatRupiah, sendToAppsScript,
    fetchWorklog
  }
})
