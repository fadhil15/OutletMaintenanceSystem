<template>
  <AppLayout search-placeholder="Cari aset, outlet, atau kondisi...">
    <div class="page-header">
      <div class="page-header-text">
        <h2>Database Outlet</h2>
        <p>Inventaris aset fisik yang terpasang di setiap outlet.</p>
      </div>
      <button class="btn-primary" @click="openModal()">
        <span class="material-symbols-outlined">add</span>
        Tambah Aset
      </button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-search">
        <span class="material-symbols-outlined">search</span>
        <input v-model="search" type="text" placeholder="Cari aset..." />
      </div>
      <div class="filter-pills" style="flex: 1;">
        <button v-for="o in ['Semua', ...OUTLETS]" :key="o" class="pill" :class="{ active: outletFilter === o }" @click="outletFilter = o">{{ o }}</button>
      </div>
      <div class="filter-pills">
        <button v-for="k in ['Semua Kondisi', 'Aktif', 'Rusak', 'Maintenance']" :key="k" class="pill" :class="{ active: kondisiFilter === k }" @click="kondisiFilter = k" style="font-size: 0.6875rem;">{{ k }}</button>
      </div>
    </div>

    <div class="table-wrapper" style="margin-top: 1rem;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Kode Aset</th>
            <th>Outlet</th>
            <th>Nama Barang</th>
            <th>Tgl Mulai Dipakai</th>
            <th>Kondisi</th>
            <th>Catatan Riwayat</th>
            <th style="text-align: right;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in filtered" :key="a.kodeAset">
            <td class="mono-cell">{{ a.kodeAset }}</td>
            <td style="font-weight: 600;">{{ a.outlet }}</td>
            <td>{{ a.barang }}</td>
            <td style="color: var(--color-on-surface-variant); font-size: 0.75rem;">{{ formatDate(a.tglMulai) }}</td>
            <td><StatusBadge :status="a.kondisi" /></td>
            <td style="max-width: 250px; color: var(--color-on-surface-variant); font-size: 0.8125rem;">{{ a.catatan || '—' }}</td>
            <td>
              <div class="action-btns">
                <button class="action-btn edit" @click="openModal(a)"><span class="material-symbols-outlined">edit</span></button>
                <button class="action-btn delete" @click="deleteItem(a.kodeAset)"><span class="material-symbols-outlined">delete</span></button>
              </div>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="7" style="text-align:center; padding: 3rem; color: var(--color-on-surface-variant);">
              <span class="material-symbols-outlined" style="font-size: 2.5rem; display:block; margin-bottom: 0.5rem; opacity: 0.4;">storefront</span>
              Tidak ada aset ditemukan
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" v-if="showModal" @click.self="showModal = false">
      <div class="modal-card">
        <h2 class="modal-title">{{ editingItem ? 'Edit Aset' : 'Tambah Aset Baru' }}</h2>
        <p class="modal-subtitle">{{ editingItem ? 'Perbarui data inventaris aset outlet' : 'Daftarkan aset fisik di outlet' }}</p>
        <form @submit.prevent="saveItem">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;">
            <div class="form-group">
              <label class="form-label">Kode Aset</label>
              <input class="form-input" v-model="form.kodeAset" placeholder="AST-ANT-001" required />
            </div>
            <div class="form-group">
              <label class="form-label">Outlet</label>
              <select class="form-select form-input" v-model="form.outlet" required>
                <option value="">Pilih outlet</option>
                <option v-for="o in OUTLETS" :key="o">{{ o }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Nama Barang</label>
            <input class="form-input" v-model="form.barang" placeholder="Nama barang / aset" required />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;">
            <div class="form-group">
              <label class="form-label">Tanggal Mulai Dipakai</label>
              <input class="form-input" v-model="form.tglMulai" type="date" />
            </div>
            <div class="form-group">
              <label class="form-label">Kondisi</label>
              <select class="form-select form-input" v-model="form.kondisi" required>
                <option>Aktif</option>
                <option>Rusak</option>
                <option>Maintenance</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Catatan Riwayat</label>
            <textarea class="form-textarea form-input" v-model="form.catatan" placeholder="Catatan kondisi, riwayat perbaikan..." rows="3"></textarea>
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
const kondisiFilter = ref('Semua Kondisi')
const showModal = ref(false)
const editingItem = ref(null)
const form = ref({})

const OUTLETS = ['Antapani', 'Arcamanik', 'Cianjur', 'Cirebon', 'Ayam Mirasa', 'Suci', 'Kopo', 'Gedebage']

const filtered = computed(() => store.dbOutlet.filter(a => {
  const q = search.value.toLowerCase()
  const matchSearch = !q || [a.kodeAset, a.outlet, a.barang, a.catatan].join(' ').toLowerCase().includes(q)
  const matchOutlet = outletFilter.value === 'Semua' || a.outlet === outletFilter.value
  const matchKondisi = kondisiFilter.value === 'Semua Kondisi' || a.kondisi === kondisiFilter.value
  return matchSearch && matchOutlet && matchKondisi
}))

function formatDate(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' }

function openModal(item = null) {
  editingItem.value = item
  const today = new Date().toISOString().split('T')[0]
  form.value = item ? { ...item } : { kodeAset: '', outlet: '', barang: '', tglMulai: today, kondisi: 'Aktif', catatan: '' }
  showModal.value = true
}
function saveItem() {
  const isEditing = !!editingItem.value
  if (isEditing) {
    const idx = store.dbOutlet.findIndex(i => i.kodeAset === editingItem.value.kodeAset)
    if (idx !== -1) store.dbOutlet[idx] = { ...form.value }
  } else {
    store.dbOutlet.push({ ...form.value })
  }
  store.sendToAppsScript({
    action: isEditing ? 'update' : 'add',
    sheet: 'database',
    data: [form.value.kodeAset, form.value.outlet, form.value.barang, form.value.tglMulai, form.value.kondisi, form.value.catatan],
    rowId: isEditing ? editingItem.value.kodeAset : null
  })
  showModal.value = false
}
function deleteItem(kode) {
  if (confirm('Hapus aset ini?')) {
    const idx = store.dbOutlet.findIndex(i => i.kodeAset === kode)
    if (idx !== -1) {
      store.dbOutlet.splice(idx, 1)
      store.sendToAppsScript({ action: 'delete', sheet: 'database', rowId: kode })
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
