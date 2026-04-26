/**
 * Worklog Helper Utilities
 */

/**
 * Generate a unique Worklog ID based on today's date.
 *
 * Format: LOG-YYYYMMDD-NNN
 * Example: LOG-20260426-001
 *
 * @param {Array} existingWorklogs - Array of worklog objects (must have `idLog` field)
 * @returns {string} Generated worklog ID
 */
export function generateWorklogId(existingWorklogs = []) {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const dateStr = `${yyyy}${mm}${dd}`
  const prefix = `LOG-${dateStr}-`

  // Count how many logs already exist for today
  const todayCount = existingWorklogs.filter(w => {
    return w.idLog && w.idLog.startsWith(prefix)
  }).length

  const seq = String(todayCount + 1).padStart(3, '0')
  return `${prefix}${seq}`
}

/**
 * Map a raw Google Sheets row (array of strings) to a Worklog object.
 *
 * Column order must match WORKLOG_COLUMNS in constants/worklog.js
 */
export function mapRowToWorklog(row) {
  return {
    idLog:           row[0]  || '',
    tanggal:         row[1]  || '',
    waktu:           row[2]  || '',
    tipeAktivitas:   row[3]  || '',
    modulTerkait:    row[4]  || '',
    referensiId:     row[5]  || '',
    outletCabang:    row[6]  || '',
    judulAktivitas:  row[7]  || '',
    catatanDetail:   row[8]  || '',
    pic:             row[9]  || '',
    prioritas:       row[10] || '',
    statusFollowUp:  row[11] || '',
    tanggalFollowUp: row[12] || '',
    createdBy:       row[13] || ''
  }
}

/**
 * Map a Worklog object back to a flat array for Apps Script payload.
 * The order matches the Google Sheets column order.
 */
export function mapWorklogToRow(worklog) {
  return [
    worklog.idLog,
    worklog.tanggal,
    worklog.waktu,
    worklog.tipeAktivitas,
    worklog.modulTerkait,
    worklog.referensiId,
    worklog.outletCabang,
    worklog.judulAktivitas,
    worklog.catatanDetail,
    worklog.pic,
    worklog.prioritas,
    worklog.statusFollowUp,
    worklog.tanggalFollowUp,
    worklog.createdBy
  ]
}

/**
 * Create an empty Worklog object with default values.
 */
export function createEmptyWorklog() {
  return {
    idLog: '',
    tanggal: '',
    waktu: '',
    tipeAktivitas: '',
    modulTerkait: '',
    referensiId: '',
    outletCabang: '',
    judulAktivitas: '',
    catatanDetail: '',
    pic: '',
    prioritas: 'Medium',
    statusFollowUp: 'Open',
    tanggalFollowUp: '',
    createdBy: ''
  }
}

// ─── Reminder helpers ───

/**
 * Determine the reminder badge for a worklog entry.
 * @returns {'Due Today'|'Overdue'|null}
 */
export function getWorklogReminderBadge(w) {
  if (w.statusFollowUp === 'Done' || w.statusFollowUp === 'Cancelled') return null
  if (!w.tanggalFollowUp) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const fu = new Date(w.tanggalFollowUp)
  fu.setHours(0, 0, 0, 0)
  if (fu.getTime() === today.getTime()) return 'Due Today'
  if (fu < today) return 'Overdue'
  return null
}

/**
 * Get Today Focus worklogs — items that need attention right now.
 *
 * Returns an object with categorised arrays:
 *  - overdue: Open/Waiting with follow-up date in the past
 *  - dueToday: Open/Waiting with follow-up date = today
 *  - urgentOpen: Urgent priority that are still Open/Waiting
 *  - recentOpen: Latest Open/Waiting items (up to 5)
 *
 * @param {Array} worklogs
 * @returns {{ overdue: Array, dueToday: Array, urgentOpen: Array, recentOpen: Array, total: number }}
 */
export function getTodayFocusWorklogs(worklogs = []) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isActive = w => w.statusFollowUp === 'Open' || w.statusFollowUp === 'Waiting'

  const overdue = worklogs.filter(w => {
    if (!isActive(w) || !w.tanggalFollowUp) return false
    const fu = new Date(w.tanggalFollowUp)
    fu.setHours(0, 0, 0, 0)
    return fu < today
  })

  const dueToday = worklogs.filter(w => {
    if (!isActive(w) || !w.tanggalFollowUp) return false
    const fu = new Date(w.tanggalFollowUp)
    fu.setHours(0, 0, 0, 0)
    return fu.getTime() === today.getTime()
  })

  const urgentOpen = worklogs.filter(w =>
    isActive(w) && w.prioritas === 'Urgent'
  )

  // Deduplicate: items already in overdue/dueToday/urgent won't appear in recentOpen
  const focusIds = new Set([
    ...overdue.map(w => w.idLog),
    ...dueToday.map(w => w.idLog),
    ...urgentOpen.map(w => w.idLog)
  ])

  const recentOpen = worklogs
    .filter(w => isActive(w) && !focusIds.has(w.idLog))
    .slice(0, 5)

  return {
    overdue,
    dueToday,
    urgentOpen,
    recentOpen,
    total: overdue.length + dueToday.length + urgentOpen.length
  }
}
