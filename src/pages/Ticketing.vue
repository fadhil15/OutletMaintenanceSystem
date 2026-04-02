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
      <div class="filter-pills" style="flex: 1;">
        <button
          v-for="o in ['Semua', ...OUTLETS]"
          :key="o"
          class="pill"
          :class="{ active: outletFilter === o }"
          @click="outletFilter = o"
        >{{ o }}</button>
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
            <td><StatusBadge :status="t.status" /></td>
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
              <label class="form-label">ID Tiket</label>
              <input class="form-input" v-model="form.id" placeholder="TKT-XXXX-001" required />
            </div>
            <div class="form-group">
              <label class="form-label">Waktu Lapor</label>
              <input class="form-input" v-model="form.waktu" type="date" required />
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;">
            <div class="form-group">
              <label class="form-label">Outlet</label>
              <select class="form-select form-input" v-model="form.outlet" required>
                <option value="">Pilih outlet</option>
                <option v-for="o in OUTLETS" :key="o">{{ o }}</option>
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { useDataStore } from '@/stores/dataStore'

const store = useDataStore()
const route = useRoute()
const search = ref('')
const outletFilter = ref('Semua')
const showModal = ref(false)
const editingItem = ref(null)
const form = ref({})
const highlightId = ref(route.query.highlight || null)
const highlightRef = ref(null)

const OUTLETS = ['Antapani', 'Arcamanik', 'Cianjur', 'Cirebon', 'Ayam Mirasa', 'Suci', 'Kopo', 'Gedebage']

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

// Find pengadaan entries linked to a ticket
function linkedPengadaan(ticketId) {
  return store.pengadaan.filter(p => p.idTiket && p.idTiket.trim() === ticketId.trim())
}



const filtered = computed(() => store.ticketing.filter(t => {
  const q = search.value.toLowerCase()
  const matchSearch = !q || [t.id, t.outlet, t.barang, t.kendala, t.pic].join(' ').toLowerCase().includes(q)
  const matchOutlet = outletFilter.value === 'Semua' || t.outlet === outletFilter.value
  return matchSearch && matchOutlet
}))

function formatDate(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' }
function truncate(str, max) { return str && str.length > max ? str.slice(0, max) + '...' : (str || '') }

function openModal(item = null) {
  editingItem.value = item
  const today = new Date().toISOString().split('T')[0]
  form.value = item ? { ...item } : { id: '', waktu: today, outlet: '', barang: '', kendala: '', foto: '', linkCO: '', status: 'Pending', pic: '' }
  showModal.value = true
}
function saveItem() {
  const isEditing = !!editingItem.value
  if (isEditing) {
    const idx = store.ticketing.findIndex(i => i.id === editingItem.value.id)
    if (idx !== -1) store.ticketing[idx] = { ...form.value }
  } else {
    store.ticketing.push({ ...form.value })
  }
  store.sendToAppsScript({
    action: isEditing ? 'update' : 'add',
    sheet: 'ticketing',
    data: [form.value.id, form.value.waktu, form.value.outlet, form.value.barang, form.value.kendala, form.value.foto, form.value.linkCO, form.value.status, form.value.pic],
    rowId: isEditing ? editingItem.value.id : null
  })
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
.toolbar { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.toolbar-search { position: relative; flex: 0 0 200px; }
.toolbar-search .material-symbols-outlined { position: absolute; left: 0.625rem; top: 50%; transform: translateY(-50%); color: var(--color-on-surface-variant); font-size: 1rem; }
.toolbar-search input { width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.25rem; background: var(--color-surface-container-highest); border: none; border-radius: 0.5rem; font-size: 0.875rem; font-family: var(--font-family-body); color: var(--color-on-surface); outline: none; }
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
</style>
