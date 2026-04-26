import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mapRowToWorklog } from '@/utils/worklogHelpers'
import { WORKLOG_SHEET_CONFIG } from '@/constants/worklog'

export const useDataStore = defineStore('data', () => {
  // Connection state
  const sheetsUrl = ref(localStorage.getItem('oms_sheets_url') || 'https://docs.google.com/spreadsheets/d/1X4o9LeUKI9fh4i5SSOSVnGzuZJCQpR20YRkToAvRrhQ/edit?usp=sharing')
  const crudUrl = ref(localStorage.getItem('oms_crud_url') || 'https://script.google.com/macros/s/AKfycbxG0XFL61JB9XNhOUUbS4En0AlYeAURXcHfLKhYaA2bqHL-4cMsXe2WiXA-31i1oeRE/exec')
  const worklogApiUrl = ref(localStorage.getItem('oms_worklog_url') || '')
  const sheetsConnected = ref(false)
  const crudConnected = ref(true) // Default true as per user request
  const worklogConnected = ref(!!localStorage.getItem('oms_worklog_url'))
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

  function connectCrud(url) {
    if (!url) return
    crudUrl.value = url
    localStorage.setItem('oms_crud_url', url)
    crudConnected.value = true
  }

  async function sendToAppsScript(payload) {
    if (!crudConnected.value || !crudUrl.value) {
      console.warn('CRUD tidak aktif')
      return false
    }
    try {
      await fetch(crudUrl.value, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      })
      return true
    } catch (e) {
      console.error('CRUD Request Failed', e)
      return false
    }
  }

  // ─── WORKLOG API ───
  function connectWorklogApi(url) {
    if (!url) return
    worklogApiUrl.value = url
    localStorage.setItem('oms_worklog_url', url)
    worklogConnected.value = true
  }

  /**
   * Send a POST request to the dedicated Worklog Apps Script endpoint.
   * Returns the parsed JSON response or null on failure.
   */
  async function sendToWorklogApi(payload) {
    if (!worklogConnected.value || !worklogApiUrl.value) {
      console.warn('[Worklog API] Endpoint belum dikonfigurasi')
      return null
    }
    try {
      const resp = await fetch(worklogApiUrl.value, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      })
      return true
    } catch (e) {
      console.error('[Worklog API] Request Failed:', e)
      return null
    }
  }

  // ─── WORKLOG STANDALONE FETCH ───
  async function fetchWorklog() {
    worklogError.value = null
    isLoading.value = true

    // Method 1: Dedicated Worklog API endpoint (preferred)
    if (worklogConnected.value && worklogApiUrl.value) {
      try {
        const url = `${worklogApiUrl.value}?action=getWorklogs`
        const resp = await fetch(url)
        const json = await resp.json()
        if (json && json.data && Array.isArray(json.data)) {
          worklog.value = json.data.map(row => ({
            idLog:           row['ID Log'] || row.idLog || '',
            tanggal:         row['Tanggal'] || row.tanggal || '',
            waktu:           row['Waktu'] || row.waktu || '',
            tipeAktivitas:   row['Tipe Aktivitas'] || row.tipeAktivitas || '',
            modulTerkait:    row['Modul Terkait'] || row.modulTerkait || '',
            referensiId:     row['Referensi ID'] || row.referensiId || '',
            outletCabang:    row['Outlet/Cabang'] || row.outletCabang || '',
            judulAktivitas:  row['Judul Aktivitas'] || row.judulAktivitas || '',
            catatanDetail:   row['Catatan Detail'] || row.catatanDetail || '',
            pic:             row['PIC'] || row.pic || '',
            prioritas:       row['Prioritas'] || row.prioritas || 'Medium',
            statusFollowUp:  row['Status Follow Up'] || row.statusFollowUp || 'Open',
            tanggalFollowUp: row['Tanggal Follow Up'] || row.tanggalFollowUp || '',
            createdBy:       row['Created By'] || row.createdBy || ''
          }))
        } else if (json && Array.isArray(json)) {
          // If API returns flat array
          worklog.value = json.map(row => ({
            idLog:           row['ID Log'] || row.idLog || '',
            tanggal:         row['Tanggal'] || row.tanggal || '',
            waktu:           row['Waktu'] || row.waktu || '',
            tipeAktivitas:   row['Tipe Aktivitas'] || row.tipeAktivitas || '',
            modulTerkait:    row['Modul Terkait'] || row.modulTerkait || '',
            referensiId:     row['Referensi ID'] || row.referensiId || '',
            outletCabang:    row['Outlet/Cabang'] || row.outletCabang || '',
            judulAktivitas:  row['Judul Aktivitas'] || row.judulAktivitas || '',
            catatanDetail:   row['Catatan Detail'] || row.catatanDetail || '',
            pic:             row['PIC'] || row.pic || '',
            prioritas:       row['Prioritas'] || row.prioritas || 'Medium',
            statusFollowUp:  row['Status Follow Up'] || row.statusFollowUp || 'Open',
            tanggalFollowUp: row['Tanggal Follow Up'] || row.tanggalFollowUp || '',
            createdBy:       row['Created By'] || row.createdBy || ''
          }))
        }
        console.log(`[Worklog API] Fetched ${worklog.value.length} entries`)
      } catch (e) {
        console.error('[Worklog API] Fetch failed:', e)
        worklogError.value = e.message || 'Gagal memuat data worklog dari API'
      } finally {
        isLoading.value = false
      }
      return
    }

    // Method 2: Fallback — Google Sheets JSONP
    const sid = extractSpreadsheetId(sheetsUrl.value)
    if (!sid) {
      isLoading.value = false
      return
    }
    try {
      const wlog = await fetchSheetJSONP(sid, WORKLOG_SHEET_CONFIG.name)
      if (wlog) {
        worklog.value = parseGVizTable(wlog).map(r => mapRowToWorklog(r))
      }
    } catch (e) {
      console.error('Gagal fetch worklog:', e)
      worklogError.value = e.message || 'Gagal memuat data worklog'
    } finally {
      isLoading.value = false
    }
  }

  function formatRupiah(num) {
    if (!num) return '0'
    return new Intl.NumberFormat('id-ID').format(num)
  }

  return {
    sheetsUrl, crudUrl, worklogApiUrl, sheetsConnected, crudConnected, worklogConnected, isLoading,
    masterLink, ticketing, pengadaan, dbOutlet, maintenance,
    worklog, worklogError,
    stats, chartData, recentTickets,
    connectSheets, connectCrud, connectWorklogApi, formatRupiah, sendToAppsScript, sendToWorklogApi,
    fetchWorklog
  }
})
