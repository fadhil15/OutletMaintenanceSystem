/**
 * Composable: useWorklog
 *
 * Provides reactive state and CRUD operations for the Worklog module.
 * Menggunakan CRUD Apps Script endpoint yang sama dengan modul lain.
 * Payload menggunakan action names: addWorklog, updateWorklog, deleteWorklog, markWorklogDone
 */
import { computed } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { generateWorklogId, createEmptyWorklog, getTodayFocusWorklogs } from '@/utils/worklogHelpers'

export function useWorklog() {
  const store = useDataStore()

  // ─── Reactive state (delegated to store) ───
  const worklogs = computed(() => store.worklog)
  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.worklogError)
  const todayFocus = computed(() => getTodayFocusWorklogs(store.worklog))

  // ─── Fetch ───
  async function fetchWorklogs() {
    await store.fetchWorklog()
  }

  // ─── Build payload object dengan key nama kolom sheet ───
  function buildPayload(worklog) {
    return {
      'ID Log':            worklog.idLog,
      'Tanggal':           worklog.tanggal,
      'Waktu':             worklog.waktu,
      'Tipe Aktivitas':    worklog.tipeAktivitas,
      'Modul Terkait':     worklog.modulTerkait,
      'Referensi ID':      worklog.referensiId,
      'Outlet/Cabang':     worklog.outletCabang,
      'Judul Aktivitas':   worklog.judulAktivitas,
      'Catatan Detail':    worklog.catatanDetail,
      'PIC':               worklog.pic,
      'Prioritas':         worklog.prioritas,
      'Status Follow Up':  worklog.statusFollowUp,
      'Tanggal Follow Up': worklog.tanggalFollowUp,
      'Created By':        worklog.createdBy
    }
  }

  // ─── Add ───
  async function addWorklog(payload) {
    const newId = generateWorklogId(store.worklog)
    const now = new Date()
    const tanggal = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const waktu = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

    const worklog = {
      ...createEmptyWorklog(),
      ...payload,
      idLog: newId,
      tanggal,
      waktu
    }

    // Optimistic update
    store.worklog.push(worklog)

    // POST ke CRUD Apps Script dengan action "addWorklog"
    const success = await store.sendToAppsScript({
      action: 'addWorklog',
      data: buildPayload(worklog)
    })

    return { success, worklog }
  }

  // ─── Update ───
  async function updateWorklog(idLog, payload) {
    const idx = store.worklog.findIndex(w => w.idLog === idLog)
    if (idx === -1) return { success: false }

    const updated = { ...store.worklog[idx], ...payload }

    // Optimistic update
    store.worklog[idx] = updated

    const success = await store.sendToAppsScript({
      action: 'updateWorklog',
      idLog,
      data: buildPayload(updated)
    })

    return { success, worklog: updated }
  }

  // ─── Delete ───
  async function deleteWorklog(idLog) {
    const idx = store.worklog.findIndex(w => w.idLog === idLog)
    if (idx === -1) return false

    // Optimistic update
    store.worklog.splice(idx, 1)

    const success = await store.sendToAppsScript({
      action: 'deleteWorklog',
      idLog
    })

    return success
  }

  // ─── Mark as Done ───
  async function markWorklogAsDone(idLog) {
    const idx = store.worklog.findIndex(w => w.idLog === idLog)
    if (idx !== -1) {
      // Optimistic update
      store.worklog[idx] = { ...store.worklog[idx], statusFollowUp: 'Done' }
    }

    const success = await store.sendToAppsScript({
      action: 'markWorklogDone',
      idLog
    })

    return { success }
  }

  // ─── Auto Worklog (dari modul lain) ───
  /**
   * Buat log otomatis dari modul lain (Maintenance, Ticketing, Pengadaan).
   * Fire-and-forget: error tidak memblokir operasi utama.
   */
  async function createAutoWorklog(params) {
    try {
      await addWorklog({
        tipeAktivitas:   params.tipeAktivitas || '',
        modulTerkait:    params.modulTerkait || '',
        referensiId:     params.referensiId || '',
        outletCabang:    params.outletCabang || '',
        judulAktivitas:  params.judulAktivitas || '',
        catatanDetail:   params.catatanDetail || '',
        pic:             params.pic || '',
        prioritas:       params.prioritas || 'Medium',
        statusFollowUp:  params.statusFollowUp || 'Open',
        tanggalFollowUp: params.tanggalFollowUp || '',
        createdBy:       params.createdBy || 'System'
      })
    } catch (e) {
      console.error('[AutoWorklog] Gagal:', e)
      // Silently fail — operasi utama tidak boleh terganggu
    }
  }

  return {
    worklogs,
    isLoading,
    error,
    todayFocus,
    fetchWorklogs,
    addWorklog,
    updateWorklog,
    deleteWorklog,
    markWorklogAsDone,
    createAutoWorklog,
    generateWorklogId: () => generateWorklogId(store.worklog)
  }
}
