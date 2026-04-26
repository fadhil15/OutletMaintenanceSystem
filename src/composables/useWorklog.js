/**
 * Composable: useWorklog
 *
 * Provides reactive state and CRUD operations for the Worklog module.
 * Uses a dedicated Apps Script Web App endpoint for worklog operations.
 * Falls back to the generic CRUD endpoint if the dedicated one is not configured.
 */
import { computed } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { generateWorklogId, mapWorklogToRow, createEmptyWorklog, getTodayFocusWorklogs } from '@/utils/worklogHelpers'

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

  // ─── Internal: build worklog payload object ───
  function buildWorklogPayload(worklog) {
    return {
      'ID Log':           worklog.idLog,
      'Tanggal':          worklog.tanggal,
      'Waktu':            worklog.waktu,
      'Tipe Aktivitas':   worklog.tipeAktivitas,
      'Modul Terkait':    worklog.modulTerkait,
      'Referensi ID':     worklog.referensiId,
      'Outlet/Cabang':    worklog.outletCabang,
      'Judul Aktivitas':  worklog.judulAktivitas,
      'Catatan Detail':   worklog.catatanDetail,
      'PIC':              worklog.pic,
      'Prioritas':        worklog.prioritas,
      'Status Follow Up': worklog.statusFollowUp,
      'Tanggal Follow Up': worklog.tanggalFollowUp,
      'Created By':       worklog.createdBy
    }
  }

  // ─── Internal: send to the appropriate endpoint ───
  async function sendWorklogRequest(payload) {
    // Prefer dedicated Worklog API
    if (store.worklogConnected && store.worklogApiUrl) {
      return await store.sendToWorklogApi(payload)
    }
    // Fallback: generic CRUD endpoint
    return await store.sendToAppsScript(payload)
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

    // Persist via dedicated endpoint or fallback
    const success = await sendWorklogRequest({
      action: 'addWorklog',
      data: buildWorklogPayload(worklog)
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

    const success = await sendWorklogRequest({
      action: 'updateWorklog',
      idLog,
      data: buildWorklogPayload(updated)
    })

    return { success, worklog: updated }
  }

  // ─── Delete ───
  async function deleteWorklog(idLog) {
    const idx = store.worklog.findIndex(w => w.idLog === idLog)
    if (idx === -1) return false

    // Optimistic update
    store.worklog.splice(idx, 1)

    const success = await sendWorklogRequest({
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

    const success = await sendWorklogRequest({
      action: 'markWorklogDone',
      idLog
    })

    return { success }
  }

  // ─── Auto Worklog ───
  /**
   * Create an auto-generated worklog entry from another module.
   * This is fire-and-forget: failures are logged but do NOT block the caller.
   *
   * @param {Object} params
   * @param {string} params.tipeAktivitas
   * @param {string} params.modulTerkait
   * @param {string} [params.referensiId]
   * @param {string} [params.outletCabang]
   * @param {string} params.judulAktivitas
   * @param {string} [params.catatanDetail]
   * @param {string} [params.pic]
   * @param {string} [params.prioritas='Medium']
   * @param {string} [params.statusFollowUp='Open']
   * @param {string} [params.tanggalFollowUp]
   * @param {string} [params.createdBy='System']
   */
  async function createAutoWorklog(params) {
    try {
      const payload = {
        tipeAktivitas: params.tipeAktivitas || '',
        modulTerkait: params.modulTerkait || '',
        referensiId: params.referensiId || '',
        outletCabang: params.outletCabang || '',
        judulAktivitas: params.judulAktivitas || '',
        catatanDetail: params.catatanDetail || '',
        pic: params.pic || '',
        prioritas: params.prioritas || 'Medium',
        statusFollowUp: params.statusFollowUp || 'Open',
        tanggalFollowUp: params.tanggalFollowUp || '',
        createdBy: params.createdBy || 'System'
      }
      await addWorklog(payload)
    } catch (e) {
      console.error('[AutoWorklog] Gagal membuat auto log:', e)
      // Silently fail — main operation must not be blocked
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
