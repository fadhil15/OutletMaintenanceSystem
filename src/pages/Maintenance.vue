<template>
  <AppLayout search-placeholder="Cari project maintenance atau bisdev...">
    <div class="page-header">
      <div class="page-header-text">
        <h2>Maintenance &amp; Bisdev</h2>
        <p>Manage project maintenance dan bisdev lintas cabang.</p>
      </div>
      <button class="btn-primary" @click="openModal()">
        <span class="material-symbols-outlined">add</span>
        Tambah Project
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="mnt-summary" style="margin-bottom: 1.5rem;">
      <div class="mnt-summary-card" v-for="s in summaryCards" :key="s.label" :style="{ borderTop: `3px solid ${s.color}` }">
        <div class="mnt-summary-value" :style="{ color: s.color }">{{ s.value }}</div>
        <div class="mnt-summary-label">{{ s.label }}</div>
      </div>
    </div>

    <!-- Branch Filter + Sub Nav -->
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
      <div class="filter-pills">
        <button v-for="c in ['Semua', ...CABANG]" :key="c" class="pill" :class="{ active: cabangFilter === c }" @click="cabangFilter = c">{{ c }}</button>
      </div>
      <div class="sub-nav">
        <button v-for="v in views" :key="v.key" class="sub-nav-btn" :class="{ active: activeView === v.key }" @click="activeView = v.key">
          <span class="material-symbols-outlined">{{ v.icon }}</span>
          {{ v.label }}
        </button>
      </div>
    </div>

    <!-- Kanban View -->
    <div v-if="activeView === 'kanban'" class="kanban-board">
      <div v-for="col in kanbanCols" :key="col.status" class="kanban-col">
        <div class="kanban-col-header" :style="{ borderTop: `3px solid ${col.color}` }">
          <span>{{ col.status }}</span>
          <span class="kanban-count" :style="{ background: col.color + '20', color: col.color }">{{ filteredByStatus(col.status).length }}</span>
        </div>
        <div class="kanban-cards">
          <div v-for="item in filteredByStatus(col.status)" :key="item.id" class="kanban-card">
            <div class="kanban-card-header">
              <span class="kanban-id">{{ item.id }}</span>
              <StatusBadge :status="item.status" />
            </div>
            <div class="kanban-task">{{ item.pekerjaan }}</div>
            <div class="kanban-meta">
              <span style="font-weight: 600; color: var(--color-on-surface);">{{ item.cabang }}</span>
              <span style="color: var(--color-on-surface-variant);">{{ formatDate(item.startDate) }} → {{ formatDate(item.endDate) }}</span>
            </div>
            <div class="kanban-footer">
              <div class="kanban-pic">{{ item.pic?.charAt(0) || '?' }}</div>
              <span style="font-size: 0.75rem; color: var(--color-on-surface-variant); flex: 1;">{{ item.pic }}</span>
              <button class="action-btn edit" @click="openModal(item)" style="width: 26px; height: 26px;"><span class="material-symbols-outlined" style="font-size: 0.875rem;">edit</span></button>
              <button class="action-btn delete" @click="deleteItem(item.id)" style="width: 26px; height: 26px;"><span class="material-symbols-outlined" style="font-size: 0.875rem;">delete</span></button>
            </div>
          </div>
          <div v-if="filteredByStatus(col.status).length === 0" class="kanban-empty">
            <span>Tidak ada task</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Gantt Timeline View -->
    <div v-else-if="activeView === 'timeline'" class="gantt-container">
      <div class="gantt-header">
        <div class="gantt-label-col">Project</div>
        <div class="gantt-timeline-col">
          <div v-for="w in ganttWeeks" :key="w" class="gantt-week-label">{{ w }}</div>
        </div>
      </div>
      <div v-for="item in filteredMnt" :key="item.id" class="gantt-row">
        <div class="gantt-label">
          <div class="gantt-label-name">{{ item.pekerjaan }}</div>
          <div class="gantt-label-sub">{{ item.cabang }} · {{ item.pic }}</div>
        </div>
        <div class="gantt-bar-track">
          <div
            class="gantt-bar"
            :style="ganttBarStyle(item)"
            :title="`${item.pekerjaan}: ${item.startDate} - ${item.endDate}`"
          >
            <StatusBadge :status="item.status" style="font-size: 0.5rem;" />
          </div>
        </div>
      </div>
      <div v-if="filteredMnt.length === 0" style="text-align: center; padding: 2rem; color: var(--color-on-surface-variant);">Tidak ada data</div>
    </div>

    <!-- Data Table View -->
    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cabang</th>
            <th>Kategori</th>
            <th>Pekerjaan</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>PIC</th>
            <th>Status</th>
            <th style="text-align: right;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in filteredMnt" :key="m.id">
            <td class="mono-cell">{{ m.id }}</td>
            <td style="font-weight: 600;">{{ m.cabang }}</td>
            <td style="color: var(--color-on-surface-variant); font-size: 0.8125rem;">{{ m.kategori }}</td>
            <td>{{ m.pekerjaan }}</td>
            <td style="color: var(--color-on-surface-variant); font-size: 0.75rem;">{{ formatDate(m.startDate) }}</td>
            <td style="color: var(--color-on-surface-variant); font-size: 0.75rem;">{{ formatDate(m.endDate) }}</td>
            <td style="font-size: 0.8125rem;">{{ m.pic }}</td>
            <td>
              <select class="inline-select" v-model="m.status" @change="onStatusChange(m)">
                <option>To Do</option>
                <option>Sudah CO</option>
                <option>Proses Pengerjaan</option>
                <option>Pengerjaan Selesai</option>
              </select>
            </td>
            <td>
              <div class="action-btns">
                <button class="action-btn edit" @click="openModal(m)"><span class="material-symbols-outlined">edit</span></button>
                <button class="action-btn delete" @click="deleteItem(m.id)"><span class="material-symbols-outlined">delete</span></button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredMnt.length === 0">
            <td colspan="9" style="text-align:center; padding: 3rem; color: var(--color-on-surface-variant);">
              <span class="material-symbols-outlined" style="font-size: 2.5rem; display:block; margin-bottom: 0.5rem; opacity: 0.4;">build</span>
              Tidak ada project
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" v-if="showModal" @click.self="showModal = false">
      <div class="modal-card">
        <h2 class="modal-title">{{ editingItem ? 'Edit Project' : 'Tambah Project Baru' }}</h2>
        <p class="modal-subtitle">{{ editingItem ? 'Perbarui data project maintenance/bisdev' : 'Tambahkan project baru' }}</p>
        <form @submit.prevent="saveItem">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;">
            <div class="form-group">
              <label class="form-label">ID Project</label>
              <input class="form-input" v-model="form.id" placeholder="MNT-001" required />
            </div>
            <div class="form-group">
              <label class="form-label">Cabang</label>
              <select class="form-select form-input" v-model="form.cabang" required>
                <option value="">Pilih cabang</option>
                <option v-for="c in CABANG" :key="c">{{ c }}</option>
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;">
            <div class="form-group">
              <label class="form-label">Kategori</label>
              <select class="form-select form-input" v-model="form.kategori" required>
                <option>Renovasi</option>
                <option>Instalasi</option>
                <option>Perbaikan</option>
                <option>Bisdev</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-select form-input" v-model="form.status" required>
                <option>To Do</option>
                <option>Sudah CO</option>
                <option>Proses Pengerjaan</option>
                <option>Pengerjaan Selesai</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Nama Pekerjaan</label>
            <input class="form-input" v-model="form.pekerjaan" placeholder="Wallboard dan Vynil Playground" required />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;">
            <div class="form-group">
              <label class="form-label">Start Date</label>
              <input class="form-input" v-model="form.startDate" type="date" />
            </div>
            <div class="form-group">
              <label class="form-label">End Date</label>
              <input class="form-input" v-model="form.endDate" type="date" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">PIC</label>
            <input class="form-input" v-model="form.pic" placeholder="Nama penanggung jawab" />
          </div>
          <div class="form-actions">
            <button type="button" class="btn-ghost" @click="showModal = false">Batal</button>
            <button type="submit" class="btn-primary">
              <span class="material-symbols-outlined">{{ editingItem ? 'save' : 'add' }}</span>
              {{ editingItem ? 'Simpan' : 'Tambah' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { useDataStore } from '@/stores/dataStore'

const store = useDataStore()
const cabangFilter = ref('Semua')
const activeView = ref('kanban')
const showModal = ref(false)
const editingItem = ref(null)
const form = ref({})

const CABANG = ['Antapani', 'Arcamanik', 'Cianjur', 'Cirebon', 'Suci', 'Kopo', 'Gedebage', 'Ayam Mirasa']

const views = [
  { key: 'timeline', icon: 'calendar_month', label: 'Timeline' },
  { key: 'kanban', icon: 'view_kanban', label: 'Kanban' },
  { key: 'table', icon: 'table_rows', label: 'Data Table' },
]

const kanbanCols = [
  { status: 'To Do', color: '#6b7280' },
  { status: 'Sudah CO', color: '#d97706' },
  { status: 'Proses Pengerjaan', color: '#0057be' },
  { status: 'Pengerjaan Selesai', color: '#059669' },
]

const summaryCards = computed(() => [
  { label: 'To Do', value: store.maintenance.filter(m => m.status === 'To Do').length, color: '#6b7280' },
  { label: 'Sudah CO', value: store.maintenance.filter(m => m.status === 'Sudah CO').length, color: '#d97706' },
  { label: 'Proses Pengerjaan', value: store.maintenance.filter(m => m.status === 'Proses Pengerjaan').length, color: '#0057be' },
  { label: 'Pengerjaan Selesai', value: store.maintenance.filter(m => m.status === 'Pengerjaan Selesai').length, color: '#059669' },
])

const filteredMnt = computed(() => store.maintenance.filter(m =>
  cabangFilter.value === 'Semua' || m.cabang === cabangFilter.value
))

function filteredByStatus(status) {
  return filteredMnt.value.filter(m => m.status === status)
}

// Gantt helpers
const ganttStart = new Date('2026-03-15')
const ganttEnd = new Date('2026-04-30')
const ganttTotalDays = Math.ceil((ganttEnd - ganttStart) / 86400000)

const ganttWeeks = computed(() => {
  const weeks = []
  let d = new Date(ganttStart)
  while (d < ganttEnd) {
    weeks.push(d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }))
    d.setDate(d.getDate() + 7)
  }
  return weeks
})

function ganttBarStyle(item) {
  const start = new Date(item.startDate)
  const end = new Date(item.endDate)
  const left = Math.max(0, (start - ganttStart) / 86400000 / ganttTotalDays * 100)
  const width = Math.max(2, (end - start) / 86400000 / ganttTotalDays * 100)
  const colors = { 'To Do': '#9ca3af', 'Sudah CO': '#d97706', 'Proses Pengerjaan': '#0057be', 'Pengerjaan Selesai': '#059669' }
  return { left: left + '%', width: width + '%', background: colors[item.status] || '#9ca3af' }
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '—' }

function onStatusChange(item) {
  store.sendToAppsScript({
    action: 'update',
    sheet: 'maintenance',
    data: [item.id, item.cabang, item.kategori, item.pekerjaan, item.status, item.startDate, item.endDate, item.pic],
    rowId: item.id
  })
}

function openModal(item = null) {
  editingItem.value = item
  const today = new Date().toISOString().split('T')[0]
  form.value = item ? { ...item } : { id: '', cabang: '', kategori: 'Renovasi', pekerjaan: '', status: 'To Do', startDate: today, endDate: '', pic: '' }
  showModal.value = true
}
function saveItem() {
  const isEditing = !!editingItem.value
  if (isEditing) {
    const idx = store.maintenance.findIndex(m => m.id === editingItem.value.id)
    if (idx !== -1) store.maintenance[idx] = { ...form.value }
  } else {
    store.maintenance.push({ ...form.value })
  }
  store.sendToAppsScript({
    action: isEditing ? 'update' : 'add',
    sheet: 'maintenance',
    data: [form.value.id, form.value.cabang, form.value.kategori, form.value.pekerjaan, form.value.status, form.value.startDate, form.value.endDate, form.value.pic],
    rowId: isEditing ? editingItem.value.id : null
  })
  showModal.value = false
}
function deleteItem(id) {
  if (confirm('Hapus project ini?')) {
    const idx = store.maintenance.findIndex(m => m.id === id)
    if (idx !== -1) {
      store.maintenance.splice(idx, 1)
      store.sendToAppsScript({ action: 'delete', sheet: 'maintenance', rowId: id })
    }
  }
}
</script>

<style scoped>
/* Summary */
.mnt-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
.mnt-summary-card {
  background: var(--color-surface-container-lowest);
  border-radius: 0.75rem;
  padding: 1.25rem 1.5rem;
}
.mnt-summary-value {
  font-family: var(--font-family-mono);
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 0.375rem;
}
.mnt-summary-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-on-surface-variant);
}

/* Sub Nav */
.sub-nav {
  display: flex;
  gap: 0.25rem;
  background: var(--color-surface-container);
  border-radius: 0.625rem;
  padding: 0.25rem;
}
.sub-nav-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  border: none;
  background: transparent;
  font-family: var(--font-family-body);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-on-surface-variant);
  cursor: pointer;
  transition: all 0.15s ease;
}
.sub-nav-btn .material-symbols-outlined { font-size: 1rem; }
.sub-nav-btn.active {
  background: var(--color-surface-container-lowest);
  color: var(--color-primary);
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
.sub-nav-btn:hover:not(.active) {
  background: var(--color-surface-container-high);
}

/* Kanban */
.kanban-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  align-items: start;
}
.kanban-col {
  background: var(--color-surface-container-low);
  border-radius: 0.75rem;
  overflow: hidden;
}
.kanban-col-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  background: var(--color-surface-container-low);
}
.kanban-count {
  font-family: var(--font-family-mono);
  font-size: 0.6875rem;
  font-weight: 800;
  padding: 0.1875rem 0.5rem;
  border-radius: 9999px;
}
.kanban-cards {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  min-height: 80px;
}
.kanban-card {
  background: var(--color-surface-container-lowest);
  border-radius: 0.625rem;
  padding: 0.875rem 1rem;
  box-shadow: 0 1px 4px rgba(44,47,49,0.06);
  transition: all 0.2s ease;
  cursor: default;
}
.kanban-card:hover {
  box-shadow: 0 4px 16px rgba(44,47,49,0.1);
  transform: translateY(-1px);
}
.kanban-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.kanban-id {
  font-family: var(--font-family-mono);
  font-size: 0.625rem;
  color: var(--color-on-surface-variant);
  font-weight: 700;
}
.kanban-task {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-on-surface);
  margin-bottom: 0.375rem;
  line-height: 1.3;
}
.kanban-meta {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  font-size: 0.6875rem;
  margin-bottom: 0.75rem;
}
.kanban-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.kanban-pic {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 800;
  flex-shrink: 0;
}
.kanban-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  color: var(--color-on-surface-variant);
  font-size: 0.8125rem;
  opacity: 0.6;
}

/* Gantt */
.gantt-container {
  background: var(--color-surface-container-lowest);
  border-radius: 0.75rem;
  overflow: hidden;
}
.gantt-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-surface-container-low);
}
.gantt-label-col {
  width: 240px;
  flex-shrink: 0;
  font-family: var(--font-family-mono);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-on-surface-variant);
  font-weight: 700;
}
.gantt-timeline-col {
  flex: 1;
  display: flex;
}
.gantt-week-label {
  flex: 1;
  font-size: 0.6rem;
  font-family: var(--font-family-mono);
  color: var(--color-on-surface-variant);
  text-align: center;
  font-weight: 600;
}
.gantt-row {
  display: flex;
  align-items: center;
  padding: 0.625rem 1rem;
  border-bottom: 1px solid rgba(171,173,175,0.06);
  transition: background 0.15s;
}
.gantt-row:hover { background: var(--color-surface-container-low); }
.gantt-label {
  width: 240px;
  flex-shrink: 0;
  padding-right: 1rem;
}
.gantt-label-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gantt-label-sub {
  font-size: 0.6875rem;
  color: var(--color-on-surface-variant);
}
.gantt-bar-track {
  flex: 1;
  height: 32px;
  position: relative;
}
.gantt-bar {
  position: absolute;
  height: 28px;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  min-width: 40px;
  transition: opacity 0.2s;
  overflow: hidden;
  opacity: 0.85;
}
.gantt-bar:hover { opacity: 1; }

/* Inline status select */
.inline-select {
  background: var(--color-surface-container);
  border: none;
  outline: none;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-family: var(--font-family-body);
  color: var(--color-on-surface);
  cursor: pointer;
}
.inline-select:focus { box-shadow: 0 0 0 2px rgba(0,87,190,0.15); }
</style>
