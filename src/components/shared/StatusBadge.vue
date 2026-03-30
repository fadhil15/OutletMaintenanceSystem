<template>
  <span class="badge" :class="badgeClass">
    <span class="badge-dot"></span>
    {{ status }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const badgeMap = {
  'Pending': 'badge-pending',
  'Sedang Diproses': 'badge-proses',
  'Selesai': 'badge-selesai',
  'Dikemas': 'badge-dikemas',
  'Dikirim': 'badge-dikirim',
  'Diterima Outlet': 'badge-diterima',
  'Aktif': 'badge-aktif',
  'Rusak': 'badge-rusak',
  'Maintenance': 'badge-maintenance',
  'To Do': 'badge-todo',
  'Sudah CO': 'badge-co',
  'Proses Pengerjaan': 'badge-proses',
  'Kitchen': 'badge-kitchen',
  'Dinning': 'badge-dinning',
  'Elektronik': 'badge-elektronik',
  'Sparepart': 'badge-sparepart',
}

const badgeClass = computed(() => badgeMap[props.status] || 'badge-todo')
</script>
