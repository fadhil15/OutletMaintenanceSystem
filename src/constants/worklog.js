/**
 * Worklog / Activity Log — Dropdown Constants
 * Sheet: 6. Worklog
 */

export const WORKLOG_ACTIVITY_TYPES = [
  "Follow Up",
  "Update Status",
  "Catatan Keputusan",
  "Kendala",
  "Reminder",
  "Progress",
  "Vendor",
  "Pengadaan",
  "Ticketing",
  "Maintenance",
  "Lainnya"
]

export const WORKLOG_MODULES = [
  "Ticketing",
  "Pengadaan",
  "Database Outlet",
  "Maintenance",
  "Listing Asset",
  "General"
]

export const WORKLOG_OUTLETS = [
  "Antapani",
  "Arcamanik",
  "Cianjur",
  "Cirebon",
  "Ayam Mirasa",
  "Suci",
  "Kopo",
  "Gedebage",
  "Batununggal",
  "Ciwastra",
  "General"
]

export const WORKLOG_PRIORITIES = [
  "Low",
  "Medium",
  "High",
  "Urgent"
]

export const WORKLOG_FOLLOW_UP_STATUSES = [
  "Open",
  "Waiting",
  "Done",
  "Cancelled"
]

/**
 * Column headers mapping for Google Sheets (6. Worklog)
 * Index order must match the sheet column order exactly.
 */
export const WORKLOG_COLUMNS = [
  "ID Log",
  "Tanggal",
  "Waktu",
  "Tipe Aktivitas",
  "Modul Terkait",
  "Referensi ID",
  "Outlet/Cabang",
  "Judul Aktivitas",
  "Catatan Detail",
  "PIC",
  "Prioritas",
  "Status Follow Up",
  "Tanggal Follow Up",
  "Created By"
]

/**
 * Sheet configuration for Worklog
 */
export const WORKLOG_SHEET_CONFIG = {
  key: "worklog",
  name: "6. Worklog"
}
