<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card wl-modal-card">
      <h2 class="modal-title">{{ isEdit ? 'Edit Log' : 'Tambah Log Baru' }}</h2>
      <p class="modal-subtitle">{{ isEdit ? 'Perbarui catatan aktivitas kerja' : 'Catat aktivitas, follow-up, atau keputusan kerja' }}</p>

      <form @submit.prevent="handleSubmit">
        <!-- Row 1: Tipe Aktivitas + Modul -->
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Tipe Aktivitas</label>
            <select class="form-select form-input" v-model="form.tipeAktivitas" required>
              <option value="">Pilih tipe</option>
              <option v-for="t in WORKLOG_ACTIVITY_TYPES" :key="t">{{ t }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Modul Terkait</label>
            <select class="form-select form-input" v-model="form.modulTerkait" required>
              <option value="">Pilih modul</option>
              <option v-for="m in WORKLOG_MODULES" :key="m">{{ m }}</option>
            </select>
          </div>
        </div>

        <!-- Row 2: Referensi ID + Outlet -->
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Referensi ID</label>
            <input class="form-input" v-model="form.referensiId" placeholder="TKT-0001, PGD-001, dll" />
          </div>
          <div class="form-group">
            <label class="form-label">Outlet/Cabang</label>
            <select class="form-select form-input" v-model="form.outletCabang" required>
              <option value="">Pilih outlet</option>
              <option v-for="o in WORKLOG_OUTLETS" :key="o">{{ o }}</option>
            </select>
          </div>
        </div>

        <!-- Judul Aktivitas -->
        <div class="form-group">
          <label class="form-label">Judul Aktivitas</label>
          <input class="form-input" v-model="form.judulAktivitas" placeholder="Contoh: Follow up vendor AC unit" required />
        </div>

        <!-- Catatan Detail -->
        <div class="form-group">
          <label class="form-label">Catatan Detail</label>
          <textarea class="form-textarea form-input" v-model="form.catatanDetail" placeholder="Deskripsi lengkap aktivitas..." rows="3"></textarea>
        </div>

        <!-- Row 3: PIC + Prioritas -->
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">PIC</label>
            <input class="form-input" v-model="form.pic" placeholder="Nama penanggung jawab" />
          </div>
          <div class="form-group">
            <label class="form-label">Prioritas</label>
            <select class="form-select form-input" v-model="form.prioritas">
              <option v-for="p in WORKLOG_PRIORITIES" :key="p">{{ p }}</option>
            </select>
          </div>
        </div>

        <!-- Row 4: Status + Tanggal Follow Up -->
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Status Follow Up</label>
            <select class="form-select form-input" v-model="form.statusFollowUp">
              <option v-for="s in WORKLOG_FOLLOW_UP_STATUSES" :key="s">{{ s }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tanggal Follow Up</label>
            <input class="form-input" v-model="form.tanggalFollowUp" type="date" />
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" class="btn-ghost" @click="$emit('close')">Batal</button>
          <button type="submit" class="btn-primary">
            <span class="material-symbols-outlined">{{ isEdit ? 'save' : 'add' }}</span>
            {{ isEdit ? 'Simpan' : 'Tambah Log' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  WORKLOG_ACTIVITY_TYPES,
  WORKLOG_MODULES,
  WORKLOG_OUTLETS,
  WORKLOG_PRIORITIES,
  WORKLOG_FOLLOW_UP_STATUSES
} from '@/constants/worklog'
import { createEmptyWorklog } from '@/utils/worklogHelpers'

const props = defineProps({
  worklog: { type: Object, default: null }
})

const emit = defineEmits(['close', 'save'])

const isEdit = ref(false)
const form = ref(createEmptyWorklog())

watch(() => props.worklog, (val) => {
  if (val) {
    isEdit.value = true
    form.value = { ...val }
  } else {
    isEdit.value = false
    form.value = {
      ...createEmptyWorklog(),
      prioritas: 'Medium',
      statusFollowUp: 'Open',
      createdBy: 'Saya'
    }
  }
}, { immediate: true })

function handleSubmit() {
  emit('save', { ...form.value }, isEdit.value)
}
</script>

<style scoped>
.wl-modal-card {
  max-width: 580px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
}

@media (max-width: 560px) {
  .wl-modal-card {
    max-width: 100%;
  }
  .form-row-2 {
    grid-template-columns: 1fr;
  }
}
</style>
