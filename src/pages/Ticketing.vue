<template>
  <AppLayout search-placeholder="Cari tiket, outlet, atau barang...">
    <div class="page-header">
      <div class="page-header-text">
        <h2>Ticketing</h2>
        <p>Kelola laporan kerusakan dan permintaan dari crew outlet.</p>
      </div>
      <button class="btn-primary" @click="openModal()">
        <span class="material-symbols-outlined">add</span>
        Buat Tiket
      </button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-search">
        <span class="material-symbols-outlined">search</span>
        <input v-model="search" type="text" placeholder="Cari tiket..." />
      </div>
      <div class="ticket-filter-stack">
        <div class="filter-pills">
          <button
            v-for="o in ['Semua', ...TICKETING_OUTLETS]"
            :key="o"
            class="pill"
            :class="{ active: outletFilter === o }"
            @click="outletFilter = o"
          >{{ o }}</button>
        </div>
        <div class="filter-pills ticket-status-pills" aria-label="Filter status tiket">
          <button
            v-for="status in ['Semua Status', ...TICKETING_STATUSES]"
            :key="status"
            class="pill"
            :class="{ active: statusFilter === status }"
            @click="statusFilter = status"
          >{{ status }}</button>
        </div>
      </div>
    </div>

    <div class="table-wrapper" style="margin-top: 1rem;">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID Tiket</th>
            <th>Waktu Lapor</th>
            <th>Outlet</th>
            <th>Nama Barang</th>
            <th>Kendala</th>
            <th>Foto</th>
            <th>Status</th>
            <th>PIC</th>
            <th style="text-align: right;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="t in filtered"
            :key="t.id"
            :class="{ highlighted: highlightId === t.id }"
            :ref="el => { if (highlightId === t.id) highlightRef = el }"
          >
            <td class="mono-cell">
              <div style="display:flex; align-items:center; gap:0.375rem;">
                {{ t.id }}
                <span
                  v-if="linkedPengadaan(t.id).length > 0"
                  class="linked-badge"
                  :title="'Terhubung ke ' + linkedPengadaan(t.id).length + ' pengadaan'"
                >
                  <span class="material-symbols-outlined" style="font-size:0.75rem;">local_shipping</span>
                  {{ linkedPengadaan(t.id).length }}
                </span>
                <span
                  v-if="linkedMaintenance(t.id).length > 0"
                  class="linked-badge linked-maintenance"
                  :title="'Terhubung ke ' + linkedMaintenance(t.id).length + ' maintenance'"
                >
                  <span class="material-symbols-outlined" style="font-size:0.75rem;">handyman</span>
                  {{ linkedMaintenance(t.id).length }}
                </span>
              </div>
            </td>
            <td style="white-space: nowrap; color: var(--color-on-surface-variant); font-size: 0.75rem;">{{ formatDate(t.waktu) }}</td>
            <td style="font-weight: 600;">{{ t.outlet }}</td>
            <td>{{ t.barang }}</td>
            <td style="max-width: 200px; color: var(--color-on-surface-variant); font-size: 0.8125rem;">{{ truncate(t.kendala, 50) }}</td>
            <td>
              <a v-if="t.foto" :href="t.foto" target="_blank" rel="noopener" class="photo-link">
                <span class="material-symbols-outlined" style="font-size: 0.875rem;">photo_camera</span>
                Lihat
              </a>
              <span v-else style="color: var(--color-on-surface-variant); font-size: 0.75rem;">—</span>
            </td>
            <td><StatusBadge :status="normalizeTicketStatus(t.status)" /></td>
            <td style="font-size: 0.8125rem;">{{ t.pic || '—' }}</td>
            <td>
              <div class="action-btns">
                <button class="action-btn edit" @click="openModal(t)"><span class="material-symbols-outlined">edit</span></button>
                <button class="action-btn delete" @click="deleteItem(t.id)"><span class="material-symbols-outlined">delete</span></button>
              </div>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="9" style="text-align:center; padding: 3rem; color: var(--color-on-surface-variant);">
              <span class="material-symbols-outlined" style="font-size: 2.5rem; display:block; margin-bottom: 0.5rem; opacity: 0.4;">confirmation_number</span>
              Tidak ada tiket
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" v-if="showModal" @click.self="showModal = false">
      <div class="modal-card">
        <h2 class="modal-title">{{ editingItem ? 'Edit Tiket' : 'Buat Tiket Baru' }}</h2>
        <p class="modal-subtitle">{{ editingItem ? 'Perbarui informasi tiket laporan' : 'Catat laporan kerusakan dari outlet' }}</p>
        <form @submit.prevent="saveItem">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;">
            <div class="form-group">
              <label class="form-label">Waktu Lapor</label>
              <input class="form-input" v-model="form.waktu" type="date" required />
            </div>
            <div class="form-group">
              <label class="form-label">Outlet</label>
              <select class="form-select form-input" v-model="form.outlet" required>
                <option value="">Pilih outlet</option>
                <option v-for="o in TICKETING_OUTLETS" :key="o">{{ o }}</option>
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;">
            <div class="form-group">
              <label class="form-label">Tipe Proses</label>
              <select class="form-select form-input" v-model="form.prosesTiket" required>
                <option v-for="type in TICKETING_PROCESS_TYPES" :key="type">{{ type }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-select form-input" v-model="form.status" required>
                <option>Pending</option>
                <option>Sedang Diproses</option>
                <option>Selesai</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">ID Tiket Otomatis</label>
            <input class="form-input ticket-id-preview" :value="form.id || 'Pilih outlet dan tanggal lapor dulu'" readonly />
            <small class="form-hint">Format: kode outlet-tanggal-urutan, contoh KPO-6102026-002.</small>
          </div>
          <div class="form-group">
            <label class="form-label">Nama Barang</label>
            <input class="form-input" v-model="form.barang" placeholder="Nama barang yang rusak" required />
          </div>
          <div class="form-group">
            <label class="form-label">Kendala/Alasan</label>
            <textarea class="form-textarea form-input" v-model="form.kendala" placeholder="Deskripsikan masalah..." rows="3"></textarea>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;">
            <div class="form-group">
              <label class="form-label">Link Foto Eviden</label>
              <input class="form-input" v-model="form.foto" placeholder="https://drive.google.com/..." type="url" />
            </div>
            <div class="form-group">
              <label class="form-label">PIC</label>
              <input class="form-input" v-model="form.pic" placeholder="Nama penanggung jawab" />
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-ghost" @click="showModal = false">Batal</button>
            <button type="submit" class="btn-primary">
              <span class="material-symbols-outlined">{{ editingItem ? 'save' : 'add' }}</span>
              {{ editingItem ? 'Simpan' : 'Buat Tiket' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, inject } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { useDataStore } from '@/stores/dataStore'
import { useWorklog } from '@/composables/useWorklog'
import { TICKETING_OUTLETS, TICKETING_STATUSES, TICKETING_PROCESS_TYPES } from '@/constants/ticketing'

const store = useDataStore()
const route = useRoute()
const { createAutoWorklog } = useWorklog()
const addToast = inject('addToast', () => {})
const search = ref('')
const outletFilter = ref('Semua')
const statusFilter = ref('Semua Status')
const showModal = ref(false)
const editingItem = ref(null)
const form = ref({})
const highlightId = ref(route.query.highlight || null)
const highlightRef = ref(null)


function normalizeTicketStatus(status) {
  const raw = String(status || '').trim()
  const compact = raw.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ')

  if (!compact) return 'Pending'
  if (compact.includes('selesai') || compact.includes('done') || compact.includes('complete')) return 'Selesai'
  if (compact.includes('proses') || compact.includes('process') || compact.includes('progress')) return 'Sedang Diproses'
  if (compact.includes('pending') || compact.includes('open') || compact.includes('baru')) return 'Pending'

  return raw
}

// Scroll to highlighted row on mount
onMounted(async () => {
  if (highlightId.value) {
    await nextTick()
    setTimeout(() => {
      if (highlightRef.value) {
        highlightRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      // Clear highlight after 3 seconds
      setTimeout(() => { highlightId.value = null }, 3000)
    }, 300)
  }
})

// Watch for route changes (if already on ticketing page)
watch(() => route.query.highlight, async (val) => {
  if (val) {
    highlightId.value = val
    await nextTick()
    setTimeout(() => {
      if (highlightRef.value) {
        highlightRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      setTimeout(() => { highlightId.value = null }, 3000)
    }, 100)
  }
})

watch(
  () => [form.value.outlet, form.value.waktu, form.value.prosesTiket],
  () => {
    if (!editingItem.value) assignGeneratedTicketId()
  }
)

// Find pengadaan entries linked to a ticket
function linkedPengadaan(ticketId) {
  return store.pengadaan.filter(p => p.idTiket && p.idTiket.trim() === ticketId.trim())
}

function linkedMaintenance(ticketId) {
  const id = String(ticketId || '').trim()
  return store.maintenance.filter(m => String(m.id || '').trim() === id)
}

const OUTLET_CODES = {
  Antapani: 'ATP',
  Arcamanik: 'ARC',
  Cianjur: 'CJR',
  Cirebon: 'CRB',
  'Ayam Mirasa': 'AMR',
  Suci: 'SCI',
  Kopo: 'KPO',
  Gedebage: 'GDB',
  Batununggal: 'BTN',
  Ciwastra: 'CWS'
}

function outletCode(outlet) {
  if (OUTLET_CODES[outlet]) return OUTLET_CODES[outlet]
  return String(outlet || '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 3) || 'OTL'
}

function ticketDateCode(dateValue) {
  if (!dateValue) return ''
  const raw = String(dateValue).trim()
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) return `${Number(iso[3])}${Number(iso[2])}${iso[1]}`

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getDate()}${date.getMonth() + 1}${date.getFullYear()}`
}

function nextTicketSequence(prefix, dateCode, currentId = '') {
  const base = `${prefix}-${dateCode}-`
  const sequences = store.ticketing
    .map(t => String(t.id || ''))
    .filter(id => id.startsWith(base) && id !== currentId)
    .map(id => Number(id.slice(base.length)))
    .filter(Number.isFinite)

  return Math.max(0, ...sequences) + 1
}

function generateTicketId(outlet, dateValue, currentId = '') {
  if (!outlet || !dateValue) return ''
  const prefix = outletCode(outlet)
  const dateCode = ticketDateCode(dateValue)
  const sequence = nextTicketSequence(prefix, dateCode, currentId)
  return `${prefix}-${dateCode}-${String(sequence).padStart(3, '0')}`
}

function assignGeneratedTicketId() {
  if (!form.value) return
  const generatedId = generateTicketId(form.value.outlet, form.value.waktu, form.value.id)
  if (generatedId) form.value.id = generatedId
}

function createLinkedMaintenanceFromTicket(ticket) {
  if (linkedMaintenance(ticket.id).length > 0) return

  const maintenanceItem = {
    id: ticket.id,
    cabang: ticket.outlet,
    kategori: 'Maintenance',
    pekerjaan: ticket.barang || ticket.kendala || 'Maintenance dari tiket',
    status: 'To Do',
    startDate: ticket.waktu,
    endDate: '',
    pic: ticket.pic || ''
  }

  store.maintenance.push(maintenanceItem)
  store.sendToAppsScript({
    action: 'add',
    sheet: 'maintenance',
    data: [maintenanceItem.id, maintenanceItem.cabang, maintenanceItem.kategori, maintenanceItem.pekerjaan, maintenanceItem.status, maintenanceItem.startDate, maintenanceItem.endDate, maintenanceItem.pic]
  })

  createAutoWorklog({
    tipeAktivitas: 'Maintenance',
    modulTerkait: 'Maintenance',
    referensiId: maintenanceItem.id,
    outletCabang: maintenanceItem.cabang,
    judulAktivitas: 'Tiket maintenance otomatis dibuat',
    catatanDetail: `Tiket ${ticket.id} dibuat sebagai pekerjaan maintenance.\nPekerjaan: ${maintenanceItem.pekerjaan}\nKendala: ${ticket.kendala || '-'}`,
    pic: maintenanceItem.pic,
    prioritas: 'Medium',
    statusFollowUp: 'Open'
  })
}

const filtered = computed(() => store.ticketing.filter(t => {
  const q = search.value.toLowerCase()
  const normalizedStatus = normalizeTicketStatus(t.status)
  const matchSearch = !q || [t.id, t.outlet, t.barang, t.kendala, t.pic, normalizedStatus].join(' ').toLowerCase().includes(q)
  const matchOutlet = outletFilter.value === 'Semua' || t.outlet === outletFilter.value
  const matchStatus = statusFilter.value === 'Semua Status' || normalizedStatus === statusFilter.value
  return matchSearch && matchOutlet && matchStatus
}))

function formatDate(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' }
function truncate(str, max) { return str && str.length > max ? str.slice(0, max) + '...' : (str || '') }

function openModal(item = null) {
  editingItem.value = item
  const today = new Date().toISOString().split('T')[0]
  form.value = item
    ? { prosesTiket: linkedMaintenance(item.id).length > 0 ? 'Maintenance' : 'Pengadaan', ...item }
    : { id: '', waktu: today, outlet: '', prosesTiket: 'Pengadaan', barang: '', kendala: '', foto: '', linkCO: '', status: 'Pending', pic: '' }
  if (!item) assignGeneratedTicketId()
  showModal.value = true
}
function saveItem() {
  const isEditing = !!editingItem.value
  if (!isEditing) assignGeneratedTicketId()
  const oldStatus = isEditing ? normalizeTicketStatus(editingItem.value.status) : null
  const ticketPayload = { ...form.value }
  delete ticketPayload.prosesTiket

  if (isEditing) {
    const idx = store.ticketing.findIndex(i => i.id === editingItem.value.id)
    if (idx !== -1) store.ticketing[idx] = ticketPayload
  } else {
    store.ticketing.push(ticketPayload)
  }
  store.sendToAppsScript({
    action: isEditing ? 'update' : 'add',
    sheet: 'ticketing',
    data: [form.value.id, form.value.waktu, form.value.outlet, form.value.barang, form.value.kendala, form.value.foto, form.value.linkCO, form.value.status, form.value.pic],
    rowId: isEditing ? editingItem.value.id : null
  })
  // Auto worklog — new ticket
  if (!isEditing) {
    createAutoWorklog({
      tipeAktivitas: 'Ticketing',
      modulTerkait: 'Ticketing',
      referensiId: form.value.id,
      outletCabang: form.value.outlet,
      judulAktivitas: 'Tiket baru dibuat',
      catatanDetail: `Tipe Proses: ${form.value.prosesTiket}\nBarang: ${form.value.barang}\nKendala: ${form.value.kendala || '-'}`,
      pic: form.value.pic || '',
      prioritas: normalizeTicketStatus(form.value.status) === 'Pending' ? 'High' : 'Medium',
      statusFollowUp: 'Open'
    })

    if (form.value.prosesTiket === 'Maintenance') {
      createLinkedMaintenanceFromTicket(form.value)
      addToast('Tiket maintenance otomatis masuk ke modul Maintenance', 'success')
    }
  }
  // Auto worklog — ticket completed (guard: old !== new)
  if (isEditing && normalizeTicketStatus(form.value.status) === 'Selesai' && oldStatus !== 'Selesai') {
    createAutoWorklog({
      tipeAktivitas: 'Update Status',
      modulTerkait: 'Ticketing',
      referensiId: form.value.id,
      outletCabang: form.value.outlet,
      judulAktivitas: 'Tiket diselesaikan',
      catatanDetail: `Tiket ${form.value.id} untuk ${form.value.barang} sudah diselesaikan.`,
      pic: form.value.pic || '',
      prioritas: 'Medium',
      statusFollowUp: 'Done'
    })
  }
  showModal.value = false
}
function deleteItem(id) {
  if (confirm('Hapus tiket ini?')) {
    const idx = store.ticketing.findIndex(i => i.id === id)
    if (idx !== -1) {
      store.ticketing.splice(idx, 1)
      store.sendToAppsScript({ action: 'delete', sheet: 'ticketing', rowId: id })
    }
  }
}
</script>

<style scoped>
.toolbar { display: flex; align-items: flex-start; gap: 0.75rem; flex-wrap: wrap; }
.ticket-filter-stack { display: flex; flex: 1; flex-direction: column; gap: 0.5rem; min-width: min(100%, 320px); }
.ticket-status-pills .pill { font-size: 0.6875rem; }
.toolbar-search { position: relative; flex: 0 0 200px; }
.toolbar-search .material-symbols-outlined { position: absolute; left: 0.625rem; top: 50%; transform: translateY(-50%); color: var(--color-on-surface-variant); font-size: 1rem; }
.toolbar-search input { width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.25rem; background: var(--color-surface-container-highest); border: none; border-radius: 0.5rem; font-size: 0.875rem; font-family: var(--font-family-body); color: var(--color-on-surface); outline: none; }
.ticket-id-preview {
  font-family: var(--font-family-mono);
  font-weight: 800;
  letter-spacing: 0.02em;
}
.form-hint {
  display: block;
  margin-top: 0.35rem;
  color: var(--color-on-surface-variant);
  font-size: 0.6875rem;
}
.photo-link { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; color: var(--color-primary); text-decoration: none; font-weight: 600; }
.photo-link:hover { text-decoration: underline; }

.highlighted {
  background: rgba(0, 87, 190, 0.08) !important;
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
  border-radius: 0.5rem;
  animation: highlightFade 3s ease forwards;
}
@keyframes highlightFade {
  0%, 50% { background: rgba(0, 87, 190, 0.12); }
  100% { background: transparent; outline-color: transparent; }
}

.linked-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  background: rgba(5, 150, 105, 0.12);
  color: #059669;
  border: 1px solid rgba(5, 150, 105, 0.25);
  border-radius: 9999px;
  padding: 0.0625rem 0.375rem;
  font-size: 0.625rem;
  font-weight: 800;
  cursor: default;
  white-space: nowrap;
}
.linked-maintenance {
  background: rgba(0, 87, 190, 0.12);
  color: var(--color-primary);
  border-color: rgba(0, 87, 190, 0.25);
}
</style>
