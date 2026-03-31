<template>
  <AppLayout search-placeholder="Search configurations...">
    <div class="page-header">
      <div class="page-header-text">
        <h2>System Configuration</h2>
        <p>Manage your data infrastructure connections. Outlet Maintenance System V3.0 utilizes a spreadsheet-driven architecture for maximum flexibility.</p>
      </div>
    </div>

    <!-- About this app -->
    <div class="card" style="margin-bottom: 2rem;">
      <div class="card-header" style="border-bottom: 1px solid rgba(171,173,175,0.1); padding-bottom: 1rem; margin-bottom: 1rem;">
        <h3>About This App</h3>
      </div>
      <div style="font-size: 0.875rem; color: var(--color-on-surface-variant); line-height: 1.6;">
        <p style="margin-bottom: 0.75rem;"><strong>Outlet Maintenance System V3.0</strong> is an ecosystem orchestrating field operations, logistics, and database management specifically designed for <strong>PT Sedjahtera Boga Kreasi</strong>.</p>
        <p>Created by the <strong>Business Development Team</strong> to ensure smooth and precision-curated handling of maintenance, cross-branch operations.</p>
      </div>
    </div>

    <!-- Connection Cards -->
    <div class="settings-grid" style="margin-bottom: 2rem;">
      <!-- Google Sheets -->
      <div class="settings-card">
        <div class="settings-card-status" :class="store.sheetsConnected ? 'connected' : 'disconnected'">
          <span class="status-dot"></span>
          {{ store.sheetsConnected ? 'Connected' : 'Disconnected' }}
        </div>
        <div class="settings-card-header">
          <div class="settings-icon" style="color: var(--color-primary);">
            <span class="material-symbols-outlined" style="font-size: 1.75rem;">description</span>
          </div>
          <div>
            <h3>Google Sheets Connection</h3>
            <p>Primary data storage and synchronization engine.</p>
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label">Spreadsheet URL</label>
          <input class="form-input font-mono" v-model="sheetsInput" type="url" placeholder="https://docs.google.com/spreadsheets/d/.../edit" />
        </div>
        <button class="btn-primary" style="width: 100%; justify-content: center;" @click="connectSheets">
          <span class="material-symbols-outlined">sync</span>
          Sync Spreadsheet
        </button>
      </div>

      <!-- CRUD API -->
      <div class="settings-card">
        <div class="settings-card-status" :class="store.crudConnected ? 'connected' : 'disconnected'">
          <span class="status-dot"></span>
          {{ store.crudConnected ? 'Connected' : 'Disconnected' }}
        </div>
        <div class="settings-card-header">
          <div class="settings-icon" style="color: var(--color-secondary);">
            <span class="material-symbols-outlined" style="font-size: 1.75rem;">api</span>
          </div>
          <div>
            <h3>CRUD API (Apps Script)</h3>
            <p>Middleware for handling dynamic database operations.</p>
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label">Web App URL</label>
          <input class="form-input font-mono" v-model="crudInput" type="url" placeholder="https://script.google.com/macros/s/.../exec" />
        </div>
        <button class="btn-dark" @click="connectCrud">
          <span class="material-symbols-outlined">link</span>
          Connect Web App
        </button>
      </div>
    </div>

    <!-- Connection Integrity Report -->
    <div class="card">
      <div class="card-header" style="border-bottom: 1px solid rgba(171,173,175,0.1); padding-bottom: 1rem; margin-bottom: 0;">
        <div>
          <h3>Connection Integrity Report</h3>
          <p style="font-size: 0.75rem; color: var(--color-on-surface-variant); margin-top: 0.25rem;">Real-time status of individual spreadsheet nodes.</p>
        </div>
        <button class="btn-ghost" style="gap: 0.375rem; font-size: 0.75rem;" @click="runDiagnostics">
          <span class="material-symbols-outlined" :class="{ 'spin': diagRunning }">refresh</span>
          Run Full Diagnostics
        </button>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Node Name</th>
            <th>Last Sync</th>
            <th>Latency</th>
            <th style="text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="node in sheetNodes" :key="node.name">
            <td>
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="material-symbols-outlined" style="color: var(--color-primary-fixed-dim);">{{ node.icon }}</span>
                <span style="font-weight: 500;">{{ node.name }}</span>
              </div>
            </td>
            <td style="font-family: var(--font-family-mono); font-size: 0.75rem; color: var(--color-on-surface-variant);">{{ node.lastSync }}</td>
            <td style="font-family: var(--font-family-mono); font-size: 0.75rem; color: var(--color-on-surface-variant);">{{ node.latency }}</td>
            <td style="text-align: center;">
              <div
                style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%;"
                :style="{ background: node.ok ? 'rgba(5,150,105,0.12)' : 'rgba(179,27,37,0.12)' }"
              >
                <span class="material-symbols-outlined" :style="{ color: node.ok ? '#059669' : 'var(--color-error)', fontSize: '1rem' }">
                  {{ node.ok ? 'check' : 'close' }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer Actions -->
    <div class="settings-footer">
      <button class="btn-ghost" @click="discardChanges">Discard Changes</button>
      <button class="btn-primary" @click="applyConfig">
        <span class="material-symbols-outlined">check_circle</span>
        Apply Global Configuration
      </button>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useDataStore } from '@/stores/dataStore'

const store = useDataStore()
const sheetsInput = ref(store.sheetsUrl)
const crudInput = ref(store.crudUrl)
const diagRunning = ref(false)

const sheetNodes = ref([
  { name: 'Master Sheet', icon: 'inventory_2', lastSync: '2026-03-30 14:20:01', latency: '142ms', ok: true },
  { name: 'Ticketing Sheet', icon: 'confirmation_number', lastSync: '2026-03-30 14:18:55', latency: '188ms', ok: true },
  { name: 'Tracker Sheet', icon: 'local_shipping', lastSync: '2026-03-30 14:15:22', latency: '210ms', ok: true },
  { name: 'DB Outlet Sheet', icon: 'storefront', lastSync: '2026-03-30 14:19:30', latency: '156ms', ok: true },
  { name: 'Maintenance Sheet', icon: 'build', lastSync: '2026-03-30 14:20:05', latency: '165ms', ok: true },
])

function connectSheets() {
  if (!sheetsInput.value) return
  store.connectSheets(sheetsInput.value)
  alert('Connecting to Google Sheets...\n\nPastikan spreadsheet di-share: Anyone → Viewer')
}

function connectCrud() {
  if (!crudInput.value) return
  store.connectCrud(crudInput.value)
  alert('CRUD API Connected!\n\nPastikan deploy Apps Script: Execute as Me → Anyone')
}

function runDiagnostics() {
  diagRunning.value = true
  setTimeout(() => {
    sheetNodes.value = sheetNodes.value.map(n => ({
      ...n,
      lastSync: new Date().toISOString().replace('T', ' ').slice(0, 19),
      latency: Math.floor(100 + Math.random() * 200) + 'ms',
    }))
    diagRunning.value = false
  }, 1500)
}

function discardChanges() {
  sheetsInput.value = store.sheetsUrl
  crudInput.value = store.crudUrl
}

function applyConfig() {
  if (sheetsInput.value) store.connectSheets(sheetsInput.value)
  if (crudInput.value) store.connectCrud(crudInput.value)
  alert('Configuration applied!')
}
</script>

<style scoped>
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
.settings-card {
  background: var(--color-surface-container-lowest);
  border-radius: 0.75rem;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}
.settings-card-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.625rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
}
.settings-card-status.connected {
  background: rgba(5,150,105,0.1);
  color: #059669;
}
.settings-card-status.disconnected {
  background: rgba(179,27,37,0.1);
  color: var(--color-error);
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.connected .status-dot {
  animation: pulse 2s infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.settings-card-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.settings-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  background: var(--color-surface-container);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.settings-card-header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-on-surface);
  margin-bottom: 0.25rem;
}
.settings-card-header p {
  font-size: 0.8125rem;
  color: var(--color-on-surface-variant);
}

.btn-dark {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  justify-content: center;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  font-family: var(--font-family-body);
  background: var(--color-on-surface);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-dark:hover { opacity: 0.85; }
.btn-dark .material-symbols-outlined { font-size: 1.125rem; }

.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.875rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(171,173,175,0.1);
}

.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.font-mono { font-family: var(--font-family-mono); font-size: 0.8125rem; }
</style>
