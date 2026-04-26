<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="drawer-card">
      <!-- Header -->
      <div class="drawer-header">
        <div>
          <h2 class="modal-title">Detail Log</h2>
          <p class="drawer-id">{{ worklog.idLog }}</p>
        </div>
        <button class="icon-btn" @click="$emit('close')">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Priority + Status badges row -->
      <div class="drawer-badges">
        <span class="wl-badge" :class="priorityClass(worklog.prioritas)">
          {{ worklog.prioritas || 'Medium' }}
        </span>
        <span class="wl-badge" :class="statusClass(worklog.statusFollowUp)">
          <span class="badge-dot"></span>
          {{ worklog.statusFollowUp || 'Open' }}
        </span>
        <span v-if="reminderBadge" class="wl-badge" :class="reminderBadge === 'Overdue' ? 'wl-badge-urgent' : 'wl-badge-due'">
          <span class="material-symbols-outlined" style="font-size: 0.75rem;">{{ reminderBadge === 'Overdue' ? 'warning' : 'schedule' }}</span>
          {{ reminderBadge }}
        </span>
      </div>

      <!-- Content -->
      <div class="drawer-body">
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Tanggal & Waktu</span>
            <span class="detail-value">{{ worklog.tanggal }} · {{ worklog.waktu }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tipe Aktivitas</span>
            <span class="detail-value">{{ worklog.tipeAktivitas || '—' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Modul Terkait</span>
            <span class="detail-value">{{ worklog.modulTerkait || '—' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Referensi ID</span>
            <span class="detail-value mono">{{ worklog.referensiId || '—' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Outlet/Cabang</span>
            <span class="detail-value" style="font-weight: 700;">{{ worklog.outletCabang || '—' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">PIC</span>
            <span class="detail-value">{{ worklog.pic || '—' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tanggal Follow Up</span>
            <span class="detail-value">{{ worklog.tanggalFollowUp || '—' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Created By</span>
            <span class="detail-value">{{ worklog.createdBy || '—' }}</span>
          </div>
        </div>

        <!-- Judul -->
        <div class="detail-section">
          <span class="detail-label">Judul Aktivitas</span>
          <p class="detail-judul">{{ worklog.judulAktivitas || '—' }}</p>
        </div>

        <!-- Catatan Detail -->
        <div class="detail-section">
          <span class="detail-label">Catatan Detail</span>
          <div class="detail-catatan">{{ worklog.catatanDetail || 'Tidak ada catatan.' }}</div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="drawer-footer">
        <button
          v-if="worklog.statusFollowUp !== 'Done'"
          class="btn-done"
          @click="$emit('markDone', worklog.idLog)"
        >
          <span class="material-symbols-outlined">check_circle</span>
          Mark as Done
        </button>
        <button class="btn-ghost" @click="$emit('edit', worklog)">
          <span class="material-symbols-outlined">edit</span>
          Edit
        </button>
        <button class="btn-ghost" @click="$emit('close')" style="margin-left: auto;">
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  worklog: { type: Object, required: true }
})

defineEmits(['close', 'edit', 'markDone'])

function priorityClass(p) {
  const m = { Low: 'wl-badge-low', Medium: 'wl-badge-medium', High: 'wl-badge-high', Urgent: 'wl-badge-urgent' }
  return m[p] || 'wl-badge-medium'
}

function statusClass(s) {
  const m = { Open: 'wl-badge-open', Waiting: 'wl-badge-waiting', Done: 'wl-badge-done', Cancelled: 'wl-badge-cancelled' }
  return m[s] || 'wl-badge-open'
}

const reminderBadge = computed(() => {
  const s = props.worklog.statusFollowUp
  if (s === 'Done' || s === 'Cancelled') return null
  const fu = props.worklog.tanggalFollowUp
  if (!fu) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const fuDate = new Date(fu)
  fuDate.setHours(0, 0, 0, 0)
  if (fuDate.getTime() === today.getTime()) return 'Due Today'
  if (fuDate < today) return 'Overdue'
  return null
})
</script>

<style scoped>
.drawer-card {
  background: var(--color-surface-container-lowest);
  border-radius: 1.25rem;
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  box-shadow: 0 32px 64px rgba(11, 15, 16, 0.18);
  animation: modalSlideIn 0.25s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.75rem 2rem 0;
}
.drawer-id {
  font-family: var(--font-family-mono);
  font-size: 0.75rem;
  color: var(--color-on-surface-variant);
  margin-top: 0.25rem;
}

.drawer-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  flex-wrap: wrap;
}

.drawer-body {
  padding: 0 2rem 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.detail-label {
  font-family: var(--font-family-mono);
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-on-surface-variant);
}

.detail-value {
  font-size: 0.875rem;
  color: var(--color-on-surface);
}
.detail-value.mono {
  font-family: var(--font-family-mono);
  color: var(--color-primary);
}

.detail-section {
  margin-bottom: 1.25rem;
}

.detail-judul {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-on-surface);
  margin-top: 0.25rem;
  line-height: 1.4;
}

.detail-catatan {
  background: var(--color-surface-container);
  border-radius: 0.625rem;
  padding: 1rem 1.25rem;
  font-size: 0.8125rem;
  color: var(--color-on-surface);
  line-height: 1.7;
  margin-top: 0.375rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.drawer-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-top: 1px solid rgba(171, 173, 175, 0.1);
}

.btn-done {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 700;
  font-family: var(--font-family-body);
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-done:hover {
  background: rgba(5, 150, 105, 0.2);
}
.btn-done .material-symbols-outlined {
  font-size: 1rem;
}

/* Badge styles (shared with parent) */
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
.wl-badge-due       { background: rgba(217,119,6,0.12); color: #d97706; }

@media (max-width: 560px) {
  .drawer-card { max-width: 100%; border-radius: 1rem; }
  .drawer-header, .drawer-badges, .drawer-body, .drawer-footer { padding-left: 1.25rem; padding-right: 1.25rem; }
  .detail-grid { grid-template-columns: 1fr; }
}
</style>
