<template>
  <AppLayout search-placeholder="Cari pengadaan, resi, atau outlet...">
    <div class="page-header">
      <div class="page-header-text">
        <h2>Tracker Pengadaan</h2>
        <p>Tracking pembelian dan status pengiriman barang ke outlet.</p>
      </div>
      <button class="btn-primary" @click="openModal()">
        <span class="material-symbols-outlined">add</span>
        Tambah Pengadaan
      </button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-search">
        <span class="material-symbols-outlined">search</span>
        <input v-model="search" type="text" placeholder="Cari pengadaan..." />
      </div>
      <div class="filter-pills" style="flex: 1;">
        <button v-for="o in ['Semua', ...OUTLETS]" :key="o" class="pill" :class="{ active: outletFilter === o }" @click="outletFilter = o">{{ o }}</button>
      </div>
    </div>

    <div class="table-wrapper" style="margin-top: 1rem;">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID Pengadaan</th>
            <th>ID Tiket</th>
            <th>Nama Barang</th>
            <th>Outlet Tujuan</th>
            <th>Tgl CO</th>
            <th>Nomor Resi / Kurir</th>
            <th>Estimasi Tiba</th>
            <th>Status</th>
            <th style="text-align: right;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filtered" :key="p.id">
            <td class="mono-cell">{{ p.id }}</td>
            <td class="mono-cell">{{ p.idTiket }}</td>
            <td>{{ p.barang }}</td>
            <td style="font-weight: 600;">{{ p.outlet }}</td>
            <td style="color: var(--color-on-surface-variant); font-size: 0.75rem;">{{ formatDate(p.tglCO) }}</td>
            <td style="font-family: var(--font-family-mono); font-size: 0.6875rem; color: var(--color-on-surface-variant);">{{ p.resi || '—' }}</td>
            <td style="color: var(--color-on-surface-variant); font-size: 0.75rem;">{{ formatDate(p.estimasi) }}</td>
            <td><StatusBadge :status="p.status" /></td>
            <td>
              <div class="action-btns">
                <button class="action-btn edit" @click="openModal(p)"><span class="material-symbols-outlined">edit</span></button>
                <button class="action-btn delete" @click="deleteItem(p.id)"><span class="material-symbols-outlined">delete</span></button>
              </div>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="9" style="text-align:center; padding: 3rem; color: var(--color-on-surface-variant);">
              <span class="material-symbols-outlined" style="font-size: 2.5rem; display:block; margin-bottom: 0.5rem; opacity: 0.4;">local_shipping</span>
              Tidak ada data pengadaan
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" v-if="showModal" @click.self="showModal = false">
      <div class="modal-card">
        <h2 class="modal-title">{{ editingItem ? 'Edit Pengadaan' : 'Tambah Pengadaan' }}</h2>
        <p class="modal-subtitle">{{ editingItem ? 'Perbarui data pengadaan' : 'Catat pembelian dan pengiriman barang baru' }}</p>
        <form @submit.prevent="saveItem">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;">
            <div class="form-group">
              <label class="form-label">ID Pengadaan</label>
              <input class="form-input" v-model="form.id" placeholder="PGD-001" required />
            </div>
            <div class="form-group">
              <label class="form-label">ID Tiket Relasi</label>
              <input class="form-input" v-model="form.idTiket" placeholder="TKT-XXXX-001" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Nama Barang</label>
            <input class="form-input" v-model="form.barang" placeholder="Nama barang yang dipesan" required />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;">
            <div class="form-group">
              <label class="form-label">Outlet Tujuan</label>
              <select class="form-select form-input" v-model="form.outlet" required>
                <option value="">Pilih outlet</option>
                <option v-for="o in OUTLETS" :key="o">{{ o }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Status Pengiriman</label>
              <select class="form-select form-input" v-model="form.status" required>
                <option>Dikemas</option>
                <option>Dikirim</option>
                <option>Diterima Outlet</option>
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;">
            <div class="form-group">
              <label class="form-label">Tanggal CO</label>
              <input class="form-input" v-model="form.tglCO" type="date" />
            </div>
            <div class="form-group">
              <label class="form-label">Estimasi Tiba</label>
              <input class="form-input" v-model="form.estimasi" type="date" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Nomor Resi / Kurir</label>
            <input class="form-input" v-model="form.resi" placeholder="JNT20260318-12345" />
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
const search = ref('')
const outletFilter = ref('Semua')
const showModal = ref(false)
const editingItem = ref(null)
const form = ref({})

const OUTLETS = ['Antapani', 'Arcamanik', 'Cianjur', 'Cirebon', 'Ayam Mirasa', 'Suci', 'Kopo', 'Gedebage']

const filtered = computed(() => store.pengadaan.filter(p => {
  const q = search.value.toLowerCase()
  const matchSearch = !q || [p.id, p.idTiket, p.barang, p.outlet, p.resi].join(' ').toLowerCase().includes(q)
  const matchOutlet = outletFilter.value === 'Semua' || p.outlet === outletFilter.value
  return matchSearch && matchOutlet
}))

function formatDate(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' }

function openModal(item = null) {
  editingItem.value = item
  const today = new Date().toISOString().split('T')[0]
  form.value = item ? { ...item } : { id: '', idTiket: '', barang: '', outlet: '', tglCO: today, resi: '', estimasi: '', status: 'Dikemas' }
  showModal.value = true
}
function saveItem() {
  const isEditing = !!editingItem.value
  if (isEditing) {
    const idx = store.pengadaan.findIndex(i => i.id === editingItem.value.id)
    if (idx !== -1) store.pengadaan[idx] = { ...form.value }
  } else {
    store.pengadaan.push({ ...form.value })
  }
  store.sendToAppsScript({
    action: isEditing ? 'update' : 'add',
    sheet: 'pengadaan',
    data: [form.value.id, form.value.idTiket, form.value.barang, form.value.outlet, form.value.tglCO, form.value.resi, form.value.estimasi, form.value.status],
    rowId: isEditing ? editingItem.value.id : null
  })
  showModal.value = false
}
function deleteItem(id) {
  if (confirm('Hapus data pengadaan ini?')) {
    const idx = store.pengadaan.findIndex(i => i.id === id)
    if (idx !== -1) {
      store.pengadaan.splice(idx, 1)
      store.sendToAppsScript({ action: 'delete', sheet: 'pengadaan', rowId: id })
    }
  }
}
</script>

<style scoped>
.toolbar { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.toolbar-search { position: relative; flex: 0 0 200px; }
.toolbar-search .material-symbols-outlined { position: absolute; left: 0.625rem; top: 50%; transform: translateY(-50%); color: var(--color-on-surface-variant); font-size: 1rem; }
.toolbar-search input { width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.25rem; background: var(--color-surface-container-highest); border: none; border-radius: 0.5rem; font-size: 0.875rem; font-family: var(--font-family-body); color: var(--color-on-surface); outline: none; }
</style>
