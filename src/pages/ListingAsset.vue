<template>
  <AppLayout search-placeholder="Cari barang, kode, atau vendor...">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-text">
        <h2>Listing Asset</h2>
        <p>Manage and track procurement links for all outlet inventory.</p>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-search">
        <span class="material-symbols-outlined">search</span>
        <input v-model="search" type="text" placeholder="Cari barang..." />
      </div>
      <div class="filter-pills">
        <button
          v-for="k in ['Semua', 'Kitchen', 'Dinning', 'Elektronik', 'Sparepart']"
          :key="k"
          class="pill"
          :class="{ active: kategoriFilter === k }"
          @click="kategoriFilter = k"
        >{{ k }}</button>
      </div>
      <button class="btn-primary" @click="openModal()">
        <span class="material-symbols-outlined">add</span>
        Tambah
      </button>
    </div>

    <!-- Table -->
    <div class="table-wrapper" style="margin-top: 1rem;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Kode Barang</th>
            <th>Kategori</th>
            <th>Nama Barang</th>
            <th>Link CO</th>
            <th>Toko/Vendor</th>
            <th>Harga (Rupiah)</th>
            <th style="text-align: right;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedFiltered" :key="item.kode">
            <td class="mono-cell">{{ item.kode }}</td>
            <td><StatusBadge :status="item.kategori" /></td>
            <td>{{ item.nama }}</td>
            <td>
              <a :href="item.linkCO" target="_blank" rel="noopener" class="link-cell">
                {{ truncate(item.linkCO, 30) }}
              </a>
            </td>
            <td>{{ item.toko }}</td>
            <td class="mono-cell" style="color: var(--color-on-surface);">{{ formatRupiah(item.harga) }}</td>
            <td>
              <div class="action-btns">
                <button class="action-btn edit" @click="openModal(item)" title="Edit">
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="action-btn delete" @click="deleteItem(item.kode)" title="Hapus">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="7" style="text-align: center; padding: 3rem; color: var(--color-on-surface-variant);">
              <span class="material-symbols-outlined" style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem; opacity: 0.4;">inventory_2</span>
              Tidak ada data
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginationControls
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filtered.length"
    />

    <!-- Summary Stats Bar -->
    <div class="summary-bar">
      <div class="summary-stat">
        <span class="summary-label">Total Assets</span>
        <span class="summary-value">{{ store.masterLink.length.toLocaleString() }}</span>
      </div>
      <div class="summary-stat">
        <span class="summary-label">Top Category</span>
        <span class="summary-value">Kitchen</span>
        <span class="summary-sub" style="color: #ea580c;">{{ kitchenCount }} items</span>
      </div>
      <div class="summary-stat">
        <span class="summary-label">Total Value</span>
        <span class="summary-value">Rp {{ formatRupiahShort(totalValue) }}</span>
        <span class="summary-sub" style="color: #059669;">estimated</span>
      </div>
    </div>

    <!-- Modal Add/Edit -->
    <div class="modal-overlay" v-if="showModal" @click.self="showModal = false">
      <div class="modal-card">
        <h2 class="modal-title">{{ editingItem ? 'Edit Asset' : 'Tambah Asset Baru' }}</h2>
        <p class="modal-subtitle">{{ editingItem ? 'Perbarui informasi katalog' : 'Tambahkan item baru ke katalog master' }}</p>
        <form @submit.prevent="saveItem">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;">
            <div class="form-group">
              <label class="form-label">Kode Barang</label>
              <input class="form-input" v-model="form.kode" placeholder="KTCH-001" required />
            </div>
            <div class="form-group">
              <label class="form-label">Kategori</label>
              <select class="form-select form-input" v-model="form.kategori" required>
                <option value="">Pilih kategori</option>
                <option>Kitchen</option>
                <option>Dinning</option>
                <option>Elektronik</option>
                <option>Sparepart</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Nama Barang</label>
            <input class="form-input" v-model="form.nama" placeholder="Saringan Kuah Bakso 30cm" required />
          </div>
          <div class="form-group">
            <label class="form-label">Link CO (Shopee/Tokped)</label>
            <input class="form-input" v-model="form.linkCO" placeholder="https://shopee.co.id/..." type="url" />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;">
            <div class="form-group">
              <label class="form-label">Toko/Vendor</label>
              <input class="form-input" v-model="form.toko" placeholder="Toko Peralatan Dapur" />
            </div>
            <div class="form-group">
              <label class="form-label">Harga Estimasi</label>
              <input class="form-input" v-model="form.harga" placeholder="45000" type="number" />
            </div>
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
import { ref, computed, watch } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import PaginationControls from '@/components/shared/PaginationControls.vue'
import { useDataStore } from '@/stores/dataStore'

const store = useDataStore()
const search = ref('')
const kategoriFilter = ref('Semua')
const showModal = ref(false)
const editingItem = ref(null)
const page = ref(1)
const pageSize = ref(10)

const form = ref({ kode: '', kategori: '', nama: '', linkCO: '', toko: '', harga: 0 })

const filtered = computed(() => store.masterLink.filter(item => {
  const matchSearch = !search.value || [item.kode, item.nama, item.toko].join(' ').toLowerCase().includes(search.value.toLowerCase())
  const matchKat = kategoriFilter.value === 'Semua' || item.kategori === kategoriFilter.value
  return matchSearch && matchKat
}))

const paginatedFiltered = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

watch([search, kategoriFilter, pageSize], () => { page.value = 1 })

const kitchenCount = computed(() => store.masterLink.filter(i => i.kategori === 'Kitchen').length)
const totalValue = computed(() => store.masterLink.reduce((s, i) => s + (i.harga || 0), 0))

function formatRupiah(n) { return new Intl.NumberFormat('id-ID').format(n) }
function formatRupiahShort(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'Jt'
  return (n / 1e3).toFixed(0) + 'K'
}
function truncate(str, max) { return str && str.length > max ? str.slice(0, max) + '...' : str }

function openModal(item = null) {
  editingItem.value = item
  form.value = item ? { ...item } : { kode: '', kategori: '', nama: '', linkCO: '', toko: '', harga: 0 }
  showModal.value = true
}

function saveItem() {
  const isEditing = !!editingItem.value
  if (isEditing) {
    const idx = store.masterLink.findIndex(i => i.kode === editingItem.value.kode)
    if (idx !== -1) store.masterLink[idx] = { ...form.value }
  } else {
    store.masterLink.push({ ...form.value })
  }
  store.sendToAppsScript({
    action: isEditing ? 'update' : 'add',
    sheet: 'masterLink',
    data: [form.value.kode, form.value.kategori, form.value.nama, form.value.linkCO, form.value.toko, form.value.harga],
    rowId: isEditing ? editingItem.value.kode : null
  })
  showModal.value = false
}

function deleteItem(kode) {
  if (confirm('Hapus item ini?')) {
    const idx = store.masterLink.findIndex(i => i.kode === kode)
    if (idx !== -1) {
      store.masterLink.splice(idx, 1)
      store.sendToAppsScript({ action: 'delete', sheet: 'masterLink', rowId: kode })
    }
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.toolbar-search {
  position: relative;
  flex: 0 0 220px;
}
.toolbar-search .material-symbols-outlined {
  position: absolute;
  left: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-on-surface-variant);
  font-size: 1rem;
}
.toolbar-search input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  background: var(--color-surface-container-highest);
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-family: var(--font-family-body);
  color: var(--color-on-surface);
  outline: none;
}
.toolbar-search input:focus {
  box-shadow: 0 0 0 2px rgba(0,87,190,0.15);
}
.link-cell {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.75rem;
}
.link-cell:hover { text-decoration: underline; }

.summary-bar {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  padding: 1rem 1.5rem;
  background: var(--color-surface-container-lowest);
  border-radius: 0.75rem;
}
.summary-stat {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 120px;
}
.summary-label {
  font-family: var(--font-family-mono);
  font-size: 0.5625rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-on-surface-variant);
  font-weight: 700;
}
.summary-value {
  font-family: var(--font-family-mono);
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-on-surface);
}
.summary-sub {
  font-size: 0.6875rem;
  font-weight: 600;
}
</style>
