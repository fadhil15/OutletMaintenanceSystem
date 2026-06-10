<template>
  <AppLayout search-placeholder="Cari worklog, aktivitas, atau follow-up...">
    <!-- Header -->
    <div class="page-header">
      <div class="page-header-text">
        <h2>Worklog</h2>
        <p>Catatan aktivitas, follow-up, dan keputusan kerja harian</p>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <span class="material-symbols-outlined">add</span>
        Tambah Log
      </button>
    </div>

    <!-- TAL Lark Table Embed -->
    <section class="wl-tal-card" aria-labelledby="tal-table-title">
      <div class="wl-tal-header">
        <div class="wl-tal-heading">
          <span class="wl-tal-mark" aria-hidden="true">TAL</span>
          <div>
            <h3 id="tal-table-title">Tabel Akses TAL</h3>
            <p>Live view dari Lark untuk monitoring TAL yang tersambung langsung.</p>
          </div>
        </div>
        <a
          class="wl-tal-open"
          :href="talLarkTableUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Buka tabel akses TAL di Lark"
        >
          <span aria-hidden="true">↗</span>
          Buka Lark
        </a>
      </div>
      <div class="wl-tal-frame-wrap">
        <iframe
          class="wl-tal-frame"
          :src="talLarkTableUrl"
          title="Tabel akses TAL di Lark"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </section>

    <!-- Summary Cards -->
    <div class="wl-summary-grid">
      <div class="wl-summary-card">
        <div class="wl-summary-icon" style="background: rgba(0,87,190,0.1); color: #0057be;">
          <span class="material-symbols-outlined">edit_note</span>
        </div>
        <div>
          <div class="wl-summary-value">{{ worklogs.length }}</div>
          <div class="wl-summary-label">Total Log</div>
        </div>
      </div>
      <div class="wl-summary-card">
        <div class="wl-summary-icon" style="background: rgba(217,119,6,0.1); color: #d97706;">
          <span class="material-symbols-outlined">pending_actions</span>
        </div>
        <div>
          <div class="wl-summary-value">{{ openFollowUpCount }}</div>
          <div class="wl-summary-label">Open Follow Up</div>
        </div>
      </div>
      <div class="wl-summary-card">
        <div class="wl-summary-icon" style="background: rgba(234,88,12,0.1); color: #ea580c;">
          <span class="material-symbols-outlined">schedule</span>
        </div>
        <div>
          <div class="wl-summary-value">{{ dueTodayCount }}</div>
          <div class="wl-summary-label">Due Today</div>
        </div>
      </div>
      <div class="wl-summary-card">
        <div class="wl-summary-icon" style="background: rgba(179,27,37,0.1); color: #b31b25;">
          <span class="material-symbols-outlined">priority_high</span>
        </div>
        <div>
          <div class="wl-summary-value">{{ urgentCount }}</div>
          <div class="wl-summary-label">Urgent</div>
        </div>
      </div>
    </div>

    <!-- Today's Focus -->
    <div v-if="todayFocus.total > 0" class="wl-today-focus">
      <div class="wl-focus-header">
        <span class="material-symbols-outlined" style="font-size: 1.125rem;">notifications_active</span>
        <span class="wl-focus-title">Today's Focus</span>
      </div>
      <div class="wl-focus-items">
        <button v-if="todayFocus.overdue.length" class="wl-focus-chip wl-focus-overdue" @click="setQuickFilter('overdue')">
          <span class="material-symbols-outlined" style="font-size: 0.875rem;">warning</span>
          {{ todayFocus.overdue.length }} Overdue
        </button>
        <button v-if="todayFocus.dueToday.length" class="wl-focus-chip wl-focus-due" @click="setQuickFilter('dueToday')">
          <span class="material-symbols-outlined" style="font-size: 0.875rem;">schedule</span>
          {{ todayFocus.dueToday.length }} Due Today
        </button>
        <button v-if="todayFocus.urgentOpen.length" class="wl-focus-chip wl-focus-urgent" @click="setQuickFilter('urgent')">
          <span class="material-symbols-outlined" style="font-size: 0.875rem;">priority_high</span>
          {{ todayFocus.urgentOpen.length }} Urgent Open
        </button>
      </div>
    </div>

    <!-- Quick Filters -->
    <div class="wl-quick-filters">
      <button v-for="qf in quickFilters" :key="qf.key" class="pill" :class="{ active: activeQuickFilter === qf.key }" @click="setQuickFilter(qf.key)">{{ qf.label }}</button>
    </div>

    <!-- Filters -->
    <div class="wl-filters">
      <div class="wl-search">
        <span class="material-symbols-outlined">search</span>
        <input v-model="search" type="text" placeholder="Cari log..." />
      </div>

      <div class="wl-filter-group">
        <select class="wl-filter-select" v-model="filterTipe">
          <option value="">Semua Tipe</option>
          <option v-for="t in WORKLOG_ACTIVITY_TYPES" :key="t">{{ t }}</option>
        </select>
        <select class="wl-filter-select" v-model="filterModul">
          <option value="">Semua Modul</option>
          <option v-for="m in WORKLOG_MODULES" :key="m">{{ m }}</option>
        </select>
        <select class="wl-filter-select" v-model="filterOutlet">
          <option value="">Semua Outlet</option>
          <option v-for="o in WORKLOG_OUTLETS" :key="o">{{ o }}</option>
        </select>
        <select class="wl-filter-select" v-model="filterPrioritas">
          <option value="">Semua Prioritas</option>
          <option v-for="p in WORKLOG_PRIORITIES" :key="p">{{ p }}</option>
        </select>
        <select class="wl-filter-select" v-model="filterStatus">
          <option value="">Semua Status</option>
          <option v-for="s in WORKLOG_FOLLOW_UP_STATUSES" :key="s">{{ s }}</option>
        </select>
        <input class="wl-filter-date" v-model="filterTanggal" type="date" title="Filter tanggal" />
      </div>

      <button
        v-if="hasActiveFilter"
        class="btn-ghost wl-reset-btn"
        @click="resetFilters"
      >
        <span class="material-symbols-outlined">filter_alt_off</span>
        Reset
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="wl-status-card">
      <span class="material-symbols-outlined spin">progress_activity</span>
      <span>Memuat data worklog...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="wl-status-card wl-error">
      <span class="material-symbols-outlined">error</span>
      <div>
        <strong>Gagal memuat worklog</strong>
        <p>{{ error }}</p>
      </div>
      <button class="btn-ghost" @click="fetchWorklogs">Coba Lagi</button>
    </div>

    <!-- Data Table -->
    <div v-else class="table-wrapper" style="margin-top: 1rem;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Tanggal & Waktu</th>
            <th>Tipe</th>
            <th>Modul</th>
            <th>Outlet/Cabang</th>
            <th>Judul Aktivitas</th>
            <th>PIC</th>
            <th>Prioritas</th>
            <th>Status</th>
            <th>Follow Up</th>
            <th style="text-align: right;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="w in filtered"
            :key="w.idLog"
            class="wl-row"
            :class="{ 'wl-row-urgent': w.prioritas === 'Urgent' }"
            @click="openDetail(w)"
          >
            <!-- Tanggal & Waktu -->
            <td style="white-space: nowrap;">
              <div class="wl-date">{{ w.tanggal }}</div>
              <div class="wl-time">{{ w.waktu }}</div>
              <div class="wl-id-sub">{{ w.idLog }}</div>
            </td>
            <!-- Tipe -->
            <td>
              <span class="wl-tipe-badge">{{ w.tipeAktivitas || '—' }}</span>
            </td>
            <!-- Modul -->
            <td style="font-size: 0.8125rem; color: var(--color-on-surface-variant);">{{ w.modulTerkait || '—' }}</td>
            <!-- Outlet/Cabang -->
            <td style="font-weight: 600;">{{ w.outletCabang || '—' }}</td>
            <!-- Judul -->
            <td>
              <div class="wl-judul">{{ truncate(w.judulAktivitas, 50) }}</div>
              <div v-if="w.referensiId" class="wl-ref">
                <span class="material-symbols-outlined" style="font-size: 0.6875rem;">link</span>
                {{ w.referensiId }}
              </div>
            </td>
            <!-- PIC -->
            <td style="font-size: 0.8125rem;">{{ w.pic || '—' }}</td>
            <!-- Prioritas -->
            <td>
              <span class="wl-badge" :class="priorityClass(w.prioritas)">{{ w.prioritas || 'Medium' }}</span>
            </td>
            <!-- Status Follow Up -->
            <td>
              <span class="wl-badge" :class="statusClass(w.statusFollowUp)">
                <span class="badge-dot"></span>
                {{ w.statusFollowUp || 'Open' }}
              </span>
            </td>
            <!-- Tanggal Follow Up + Reminder badges -->
            <td>
              <div v-if="w.tanggalFollowUp" style="font-size: 0.75rem; color: var(--color-on-surface-variant);">{{ formatDate(w.tanggalFollowUp) }}</div>
              <span v-else style="font-size: 0.75rem; color: var(--color-on-surface-variant);">—</span>
              <span v-if="getReminderBadge(w)" class="wl-reminder" :class="getReminderBadge(w) === 'Overdue' ? 'wl-reminder-overdue' : 'wl-reminder-due'">
                {{ getReminderBadge(w) }}
              </span>
            </td>
            <!-- Aksi -->
            <td>
              <div class="action-btns" @click.stop>
                <button class="action-btn edit" title="Edit" @click="openEditModal(w)">
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="action-btn wl-action-done" title="Mark as Done" @click="handleMarkDone(w.idLog)" v-if="w.statusFollowUp !== 'Done'">
                  <span class="material-symbols-outlined">check_circle</span>
                </button>
                <button class="action-btn delete" title="Hapus" @click="confirmDelete(w)">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="10" style="text-align:center; padding: 3rem; color: var(--color-on-surface-variant);">
              <span class="material-symbols-outlined" style="font-size: 2.5rem; display:block; margin-bottom: 0.5rem; opacity: 0.4;">edit_note</span>
              <template v-if="worklogs.length === 0">
                Belum ada worklog. Tambahkan log pertama untuk mulai mencatat aktivitas kerja.
              </template>
              <template v-else>
                Tidak ada worklog yang cocok dengan filter saat ini.
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Worklog Form Modal -->
    <WorklogForm
      v-if="showFormModal"
      :worklog="editingWorklog"
      @close="showFormModal = false"
      @save="handleSave"
    />

    <!-- Detail Drawer -->
    <WorklogDetailDrawer
      v-if="showDetail && detailWorklog"
      :worklog="detailWorklog"
      @close="showDetail = false"
      @edit="handleDetailEdit"
      @markDone="handleMarkDone"
    />

    <!-- Delete Confirmation -->
    <div class="modal-overlay" v-if="showDeleteConfirm" @click.self="showDeleteConfirm = false">
      <div class="modal-card wl-delete-card">
        <div class="wl-delete-icon">
          <span class="material-symbols-outlined">warning</span>
        </div>
        <h2 class="modal-title" style="text-align: center;">Hapus Log?</h2>
        <p class="modal-subtitle" style="text-align: center;">
          Yakin ingin menghapus log ini? Data yang dihapus tidak bisa dikembalikan.
        </p>
        <div v-if="deletingWorklog" class="wl-delete-preview">
          <span class="mono-cell">{{ deletingWorklog.idLog }}</span>
          <span>{{ deletingWorklog.judulAktivitas }}</span>
        </div>
        <div class="form-actions" style="justify-content: center;">
          <button class="btn-ghost" @click="showDeleteConfirm = false">Batal</button>
          <button class="btn-delete" @click="handleDelete">
            <span class="material-symbols-outlined">delete</span>
            Hapus
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import WorklogForm from '@/components/worklog/WorklogForm.vue'
import WorklogDetailDrawer from '@/components/worklog/WorklogDetailDrawer.vue'
import { useWorklog } from '@/composables/useWorklog'
import {
  WORKLOG_ACTIVITY_TYPES,
  WORKLOG_MODULES,
  WORKLOG_OUTLETS,
  WORKLOG_PRIORITIES,
  WORKLOG_FOLLOW_UP_STATUSES
} from '@/constants/worklog'

const { worklogs, isLoading, error, fetchWorklogs, addWorklog, updateWorklog, deleteWorklog, markWorklogAsDone, todayFocus } = useWorklog()
const addToast = inject('addToast', () => {})
const talLarkTableUrl = 'https://ujpdwqpe82rz.jp.larksuite.com/wiki/D6OvwUIDkiKIM4kfBBZjT3F3pfc?sheet=Dx6hMA'

// ─── State ───
const search = ref('')
const filterTipe = ref('')
const filterModul = ref('')
const filterOutlet = ref('')
const filterPrioritas = ref('')
const filterStatus = ref('')
const filterTanggal = ref('')
const activeQuickFilter = ref('all')

const showFormModal = ref(false)
const editingWorklog = ref(null)

const showDetail = ref(false)
const detailWorklog = ref(null)

const showDeleteConfirm = ref(false)
const deletingWorklog = ref(null)

// ─── Mount ───
onMounted(() => {
  if (worklogs.value.length === 0) {
    fetchWorklogs()
  }
})

// ─── Summary computed ───
const todayStr = computed(() => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
})

const openFollowUpCount = computed(() =>
  worklogs.value.filter(w => w.statusFollowUp === 'Open' || w.statusFollowUp === 'Waiting').length
)

const dueTodayCount = computed(() => {
  const today = todayStr.value
  return worklogs.value.filter(w => {
    if (w.statusFollowUp !== 'Open' && w.statusFollowUp !== 'Waiting') return false
    if (!w.tanggalFollowUp) return false
    const fu = new Date(w.tanggalFollowUp)
    fu.setHours(0, 0, 0, 0)
    return fu.getTime() === today.getTime()
  }).length
})

const urgentCount = computed(() =>
  worklogs.value.filter(w => w.prioritas === 'Urgent').length
)

// ─── Filter logic ───
const hasActiveFilter = computed(() =>
  search.value || filterTipe.value || filterModul.value || filterOutlet.value || filterPrioritas.value || filterStatus.value || filterTanggal.value
)

function resetFilters() {
  search.value = ''
  filterTipe.value = ''
  filterModul.value = ''
  filterOutlet.value = ''
  filterPrioritas.value = ''
  filterStatus.value = ''
  filterTanggal.value = ''
  activeQuickFilter.value = 'all'
}

// ─── Quick Filters ───
const quickFilters = [
  { key: 'all', label: 'Semua' },
  { key: 'open', label: 'Open' },
  { key: 'dueToday', label: 'Due Today' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'done', label: 'Done' },
]

function setQuickFilter(key) {
  activeQuickFilter.value = key
  // Reset advanced filters when using quick filter
  filterTipe.value = ''
  filterModul.value = ''
  filterOutlet.value = ''
  filterPrioritas.value = ''
  filterStatus.value = ''
  filterTanggal.value = ''
}

const filtered = computed(() => {
  let data = [...worklogs.value]

  // Apply quick filter first
  const qf = activeQuickFilter.value
  const today = todayStr.value
  if (qf === 'open') {
    data = data.filter(w => w.statusFollowUp === 'Open' || w.statusFollowUp === 'Waiting')
  } else if (qf === 'dueToday') {
    data = data.filter(w => {
      if (w.statusFollowUp !== 'Open' && w.statusFollowUp !== 'Waiting') return false
      if (!w.tanggalFollowUp) return false
      const fu = new Date(w.tanggalFollowUp); fu.setHours(0,0,0,0)
      return fu.getTime() === today.getTime()
    })
  } else if (qf === 'overdue') {
    data = data.filter(w => {
      if (w.statusFollowUp !== 'Open' && w.statusFollowUp !== 'Waiting') return false
      if (!w.tanggalFollowUp) return false
      const fu = new Date(w.tanggalFollowUp); fu.setHours(0,0,0,0)
      return fu < today
    })
  } else if (qf === 'urgent') {
    data = data.filter(w => w.prioritas === 'Urgent' && (w.statusFollowUp === 'Open' || w.statusFollowUp === 'Waiting'))
  } else if (qf === 'done') {
    data = data.filter(w => w.statusFollowUp === 'Done')
  }

  // Sort: Overdue first, then Due Today, then Urgent, then newest
  data.sort((a, b) => {
    const ra = getReminderRank(a)
    const rb = getReminderRank(b)
    if (ra !== rb) return ra - rb
    const da = parseDateId(a.tanggal, a.waktu)
    const db = parseDateId(b.tanggal, b.waktu)
    return db - da
  })

  // Apply text search
  const q = search.value.toLowerCase()
  if (q) {
    data = data.filter(w =>
      [w.idLog, w.judulAktivitas, w.catatanDetail, w.pic, w.referensiId, w.outletCabang]
        .join(' ').toLowerCase().includes(q)
    )
  }
  // Apply advanced dropdown filters
  if (filterTipe.value) data = data.filter(w => w.tipeAktivitas === filterTipe.value)
  if (filterModul.value) data = data.filter(w => w.modulTerkait === filterModul.value)
  if (filterOutlet.value) data = data.filter(w => w.outletCabang === filterOutlet.value)
  if (filterPrioritas.value) data = data.filter(w => w.prioritas === filterPrioritas.value)
  if (filterStatus.value) data = data.filter(w => w.statusFollowUp === filterStatus.value)
  if (filterTanggal.value) {
    data = data.filter(w => {
      if (!w.tanggal) return false
      if (w.tanggal === filterTanggal.value) return true
      const parts = w.tanggal.split('/')
      if (parts.length === 3) {
        const isoFromSheet = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
        return isoFromSheet === filterTanggal.value
      }
      return false
    })
  }

  return data
})

// Priority sort rank: overdue=0, dueToday=1, urgent=2, else=3
function getReminderRank(w) {
  const badge = getReminderBadge(w)
  if (badge === 'Overdue') return 0
  if (badge === 'Due Today') return 1
  if (w.prioritas === 'Urgent' && (w.statusFollowUp === 'Open' || w.statusFollowUp === 'Waiting')) return 2
  return 3
}

// ─── Helpers ───
function parseDateId(tanggal, waktu) {
  if (!tanggal) return 0
  // Handle DD/MM/YYYY
  const parts = tanggal.split('/')
  if (parts.length === 3) {
    const [d, m, y] = parts
    const timeStr = waktu || '00:00'
    return new Date(`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}T${timeStr}`).getTime() || 0
  }
  return new Date(tanggal).getTime() || 0
}

function formatDate(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
  } catch {
    return d
  }
}

function truncate(str, max) {
  return str && str.length > max ? str.slice(0, max) + '...' : (str || '')
}

function priorityClass(p) {
  const m = { Low: 'wl-badge-low', Medium: 'wl-badge-medium', High: 'wl-badge-high', Urgent: 'wl-badge-urgent' }
  return m[p] || 'wl-badge-medium'
}

function statusClass(s) {
  const m = { Open: 'wl-badge-open', Waiting: 'wl-badge-waiting', Done: 'wl-badge-done', Cancelled: 'wl-badge-cancelled' }
  return m[s] || 'wl-badge-open'
}

function getReminderBadge(w) {
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

// ─── Modal Handlers ───
function openAddModal() {
  editingWorklog.value = null
  showFormModal.value = true
}

function openEditModal(w) {
  editingWorklog.value = { ...w }
  showFormModal.value = true
}

function openDetail(w) {
  detailWorklog.value = { ...w }
  showDetail.value = true
}

function handleDetailEdit(w) {
  showDetail.value = false
  openEditModal(w)
}

async function handleSave(formData, isEdit) {
  if (isEdit) {
    await updateWorklog(formData.idLog, formData)
    addToast('Log berhasil diperbarui', 'success')
  } else {
    await addWorklog(formData)
    addToast('Log baru berhasil ditambahkan', 'success')
  }
  showFormModal.value = false
}

async function handleMarkDone(idLog) {
  await markWorklogAsDone(idLog)
  addToast('Status diubah menjadi Done', 'success')
  // Update detail if open
  if (showDetail.value && detailWorklog.value?.idLog === idLog) {
    detailWorklog.value = { ...detailWorklog.value, statusFollowUp: 'Done' }
  }
}

function confirmDelete(w) {
  deletingWorklog.value = w
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!deletingWorklog.value) return
  await deleteWorklog(deletingWorklog.value.idLog)
  addToast('Log berhasil dihapus', 'success')
  showDeleteConfirm.value = false
  deletingWorklog.value = null
}
</script>

<style scoped>
/* ─── TAL Lark Embed ─── */
.wl-tal-card {
  background: linear-gradient(180deg, var(--color-surface-container-lowest) 0%, rgba(255, 255, 255, 0.92) 100%);
  border: 1px solid rgba(0, 87, 190, 0.12);
  border-radius: 1rem;
  box-shadow: 0 12px 30px rgba(44, 47, 49, 0.06);
  margin-bottom: 1.5rem;
  overflow: hidden;
}
.wl-tal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-surface-container-high);
}
.wl-tal-heading {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  min-width: 0;
}
.wl-tal-mark {
  width: 42px;
  height: 42px;
  border-radius: 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 87, 190, 0.1);
  color: var(--color-primary);
  flex-shrink: 0;
  font-family: var(--font-family-mono);
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.04em;
}
.wl-tal-heading h3 {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-on-surface);
  line-height: 1.2;
}
.wl-tal-heading p {
  margin-top: 0.125rem;
  font-size: 0.8125rem;
  color: var(--color-on-surface-variant);
}
.wl-tal-open {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.55rem 0.85rem;
  border-radius: 9999px;
  background: rgba(0, 87, 190, 0.1);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s ease;
}
.wl-tal-open:hover {
  background: var(--color-primary);
  color: var(--color-on-primary);
  transform: translateY(-1px);
}
.wl-tal-open span {
  font-size: 0.875rem;
  line-height: 1;
}
.wl-tal-frame-wrap {
  background: var(--color-surface-container-low);
  height: clamp(320px, 44vh, 520px);
  min-height: 320px;
}
.wl-tal-frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: white;
}

/* ─── Summary ─── */
.wl-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.wl-summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: var(--color-surface-container-lowest);
  border-radius: 0.75rem;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.wl-summary-card:hover {
  box-shadow: 0 4px 16px rgba(44, 47, 49, 0.08);
  transform: translateY(-1px);
}
.wl-summary-icon {
  width: 44px;
  height: 44px;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.wl-summary-icon .material-symbols-outlined {
  font-size: 1.5rem;
}
.wl-summary-value {
  font-family: var(--font-family-mono);
  font-size: 1.75rem;
  font-weight: 900;
  line-height: 1;
  color: var(--color-on-surface);
}
.wl-summary-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-on-surface-variant);
  margin-top: 0.125rem;
}

/* ─── Filters ─── */
.wl-filters {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
}
.wl-search {
  position: relative;
  flex: 0 0 200px;
}
.wl-search .material-symbols-outlined {
  position: absolute;
  left: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-on-surface-variant);
  font-size: 1rem;
}
.wl-search input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  background: var(--color-surface-container-highest);
  border: none;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-family: var(--font-family-body);
  color: var(--color-on-surface);
  outline: none;
  transition: all 0.2s ease;
}
.wl-search input:focus {
  background: var(--color-surface-container-lowest);
  box-shadow: 0 0 0 2px rgba(0, 87, 190, 0.15);
}
.wl-filter-group {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
  flex: 1;
}
.wl-filter-select,
.wl-filter-date {
  padding: 0.4375rem 0.625rem;
  background: var(--color-surface-container);
  border: none;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-family: var(--font-family-body);
  color: var(--color-on-surface);
  outline: none;
  cursor: pointer;
  appearance: auto;
  transition: all 0.15s ease;
}
.wl-filter-select:focus,
.wl-filter-date:focus {
  box-shadow: 0 0 0 2px rgba(0, 87, 190, 0.15);
}
.wl-filter-date {
  width: 130px;
}
.wl-reset-btn {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  white-space: nowrap;
}
.wl-reset-btn .material-symbols-outlined {
  font-size: 0.875rem;
}

/* ─── Status/Loading ─── */
.wl-status-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  background: var(--color-surface-container-lowest);
  border-radius: 0.75rem;
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
  margin-top: 1rem;
}
.wl-error {
  border-left: 3px solid #ef4444;
  color: #ef4444;
}
.wl-error p {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-on-surface-variant);
}

/* ─── Table Row ─── */
.wl-row {
  cursor: pointer;
}

.wl-date {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-on-surface);
}
.wl-time {
  font-family: var(--font-family-mono);
  font-size: 0.6875rem;
  color: var(--color-on-surface-variant);
}
.wl-id-sub {
  font-family: var(--font-family-mono);
  font-size: 0.5625rem;
  color: var(--color-primary);
  opacity: 0.7;
  margin-top: 1px;
}

.wl-judul {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-on-surface);
  line-height: 1.3;
}
.wl-ref {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  font-family: var(--font-family-mono);
  font-size: 0.625rem;
  color: var(--color-primary);
  margin-top: 2px;
}

/* ─── Tipe badge ─── */
.wl-tipe-badge {
  display: inline-flex;
  padding: 0.1875rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 600;
  background: var(--color-surface-container);
  color: var(--color-on-surface);
  white-space: nowrap;
}

/* ─── Priority/Status badges ─── */
.wl-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.wl-badge-low       { background: rgba(107,114,128,0.1); color: #6b7280; }
.wl-badge-medium    { background: rgba(0,87,190,0.1);   color: #0057be; }
.wl-badge-high      { background: rgba(234,88,12,0.1);  color: #ea580c; }
.wl-badge-urgent    { background: rgba(179,27,37,0.12); color: #b31b25; }
.wl-badge-open      { background: rgba(0,87,190,0.1);   color: #0057be; }
.wl-badge-waiting   { background: rgba(217,119,6,0.1);  color: #d97706; }
.wl-badge-done      { background: rgba(5,150,105,0.1);  color: #059669; }
.wl-badge-cancelled { background: rgba(107,114,128,0.1); color: #6b7280; }

/* ─── Reminder badges ─── */
.wl-reminder {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.5625rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 0.1875rem;
}
.wl-reminder-due {
  background: rgba(217,119,6,0.12);
  color: #d97706;
}
.wl-reminder-overdue {
  background: rgba(179,27,37,0.12);
  color: #b31b25;
}

/* ─── Mark-done action button ─── */
.action-btn.wl-action-done {
  color: #059669;
}
.action-btn.wl-action-done:hover {
  background: rgba(5, 150, 105, 0.1);
}

/* ─── Delete confirmation ─── */
.wl-delete-card {
  max-width: 400px;
  text-align: center;
}
.wl-delete-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(179,27,37,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}
.wl-delete-icon .material-symbols-outlined {
  font-size: 1.75rem;
  color: #b31b25;
}
.wl-delete-preview {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  background: var(--color-surface-container);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.8125rem;
  text-align: left;
}
.btn-delete {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  font-family: var(--font-family-body);
  background: #b31b25;
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-delete:hover {
  background: #9f0519;
  box-shadow: 0 4px 16px rgba(179, 27, 37, 0.3);
}
.btn-delete .material-symbols-outlined {
  font-size: 1rem;
}

/* ─── Spinner ─── */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.spin {
  animation: spin 1s linear infinite;
}

/* ─── Today's Focus ─── */
.wl-today-focus {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, rgba(179,27,37,0.06) 0%, rgba(217,119,6,0.06) 100%);
  border: 1px solid rgba(179,27,37,0.1);
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.wl-focus-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--color-on-surface);
}
.wl-focus-title {
  font-family: var(--font-family-mono);
  font-size: 0.6875rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.wl-focus-items {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.wl-focus-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  font-family: var(--font-family-body);
  transition: all 0.15s ease;
}
.wl-focus-chip:hover { transform: translateY(-1px); }
.wl-focus-overdue { background: rgba(179,27,37,0.12); color: #b31b25; }
.wl-focus-due    { background: rgba(217,119,6,0.12); color: #d97706; }
.wl-focus-urgent { background: rgba(234,88,12,0.12); color: #ea580c; }

/* ─── Quick Filters ─── */
.wl-quick-filters {
  display: flex;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

/* ─── Urgent row highlight ─── */
.wl-row-urgent {
  border-left: 3px solid #b31b25;
}

/* ─── Responsive ─── */
@media (max-width: 1024px) {
  .wl-summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .wl-summary-grid {
    grid-template-columns: 1fr 1fr;
  }
  .wl-filters {
    flex-direction: column;
    align-items: stretch;
  }
  .wl-search {
    flex: none;
  }
  .wl-filter-group {
    flex: none;
  }
  .wl-today-focus {
    flex-direction: column;
    align-items: flex-start;
  }
  .wl-tal-header {
    align-items: flex-start;
    flex-direction: column;
  }
  .wl-tal-open {
    width: 100%;
  }
  .wl-tal-frame-wrap {
    height: 360px;
  }
}
@media (max-width: 480px) {
  .wl-summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
