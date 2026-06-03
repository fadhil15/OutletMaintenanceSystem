<template>
  <AppLayout search-placeholder="Search outlet ID, asset code, or tickets...">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-text">
        <h2>Operations Overview</h2>
        <p>Real-time logistics and maintenance tracking for all regional outlets.</p>
      </div>
      <router-link to="/ticketing" class="btn-primary">
        <span class="material-symbols-outlined">add</span>
        New Ticket Request
      </router-link>
    </div>

    <!-- KPI Donut Charts -->
    <section class="kpi-grid">
      <!-- Status Tiket -->
      <div class="kpi-card" @click="$router.push('/ticketing')">
        <div class="kpi-card-info">
          <h3>Status Tiket</h3>
          <div style="display: flex; align-items: baseline; gap: 0.375rem;">
            <span class="value" style="color: var(--color-primary);">{{ tiketWeightedPct }}%</span>
            <span class="label">Progress</span>
          </div>
          <div class="kpi-legend" style="margin-top: 0.75rem;">
            <div class="legend-item">
              <span class="legend-dot" style="background: #d97706;"></span>
              <span>Pending: {{ tiketPending }}</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: #0057be;"></span>
              <span>Diproses: {{ tiketDiproses }}</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: #059669;"></span>
              <span>Selesai: {{ tiketSelesai }}</span>
            </div>
          </div>
          <div class="kpi-spill" v-if="ticketSpill">
            <span class="material-symbols-outlined">{{ ticketSpill.icon }}</span>
            <div>
              <strong>{{ ticketSpill.title }}</strong>
              <p>{{ ticketSpill.meta }}</p>
            </div>
          </div>
        </div>
        <div class="donut-chart">
          <svg viewBox="0 0 100 100">
            <circle class="donut-track" cx="50" cy="50" r="40" />
            <!-- Selesai segment (green, from top) -->
            <circle
              class="donut-fill"
              cx="50" cy="50" r="40"
              stroke="#059669"
              :stroke-dasharray="`${tiketSegments.selesai} 251.3`"
              :stroke-dashoffset="0"
            />
            <!-- Diproses segment (blue, after selesai) -->
            <circle
              class="donut-fill"
              cx="50" cy="50" r="40"
              stroke="#0057be"
              :stroke-dasharray="`${tiketSegments.diproses} 251.3`"
              :stroke-dashoffset="-(tiketSegments.selesai)"
            />
            <!-- Pending segment (amber, after diproses) -->
            <circle
              class="donut-fill"
              cx="50" cy="50" r="40"
              stroke="#d97706"
              :stroke-dasharray="`${tiketSegments.pending} 251.3`"
              :stroke-dashoffset="-(tiketSegments.selesai + tiketSegments.diproses)"
            />
          </svg>
          <div class="donut-center">
            <span class="pct" style="color: var(--color-primary);">{{ tiketWeightedPct }}%</span>
          </div>
        </div>
      </div>

      <!-- Maintenance & Bisdev -->
      <div class="kpi-card" @click="$router.push('/maintenance')">
        <div class="kpi-card-info">
          <h3>Maintenance &amp; Bisdev</h3>
          <div style="display: flex; align-items: baseline; gap: 0.375rem;">
            <span class="value" style="color: var(--color-secondary);">{{ maintenanceActiveCount }}</span>
            <span class="label">Active Projects</span>
          </div>
          <div class="kpi-legend" style="margin-top: 0.75rem;">
            <div class="legend-item">
              <span class="legend-dot" style="background: #6b7280;"></span>
              <span>To Do: {{ maintenanceTodo }}</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: #d97706;"></span>
              <span>Sudah CO: {{ maintenanceSudahCO }}</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: #0057be;"></span>
              <span>Proses: {{ maintenanceProses }}</span>
            </div>
          </div>
          <div class="kpi-spill" v-if="maintenanceSpill">
            <span class="material-symbols-outlined">{{ maintenanceSpill.icon }}</span>
            <div>
              <strong>{{ maintenanceSpill.title }}</strong>
              <p>{{ maintenanceSpill.meta }}</p>
            </div>
          </div>
        </div>
        <div class="donut-chart">
          <svg viewBox="0 0 100 100">
            <circle class="donut-track" cx="50" cy="50" r="40" />
            <circle
              class="donut-fill"
              cx="50" cy="50" r="40"
              stroke="#6b7280"
              :stroke-dasharray="`${maintenanceSegments.todo} 251.3`"
              :stroke-dashoffset="0"
            />
            <circle
              class="donut-fill"
              cx="50" cy="50" r="40"
              stroke="#d97706"
              :stroke-dasharray="`${maintenanceSegments.sudahCO} 251.3`"
              :stroke-dashoffset="-(maintenanceSegments.todo)"
            />
            <circle
              class="donut-fill"
              cx="50" cy="50" r="40"
              stroke="#0057be"
              :stroke-dasharray="`${maintenanceSegments.proses} 251.3`"
              :stroke-dashoffset="-(maintenanceSegments.todo + maintenanceSegments.sudahCO)"
            />
          </svg>
          <div class="donut-center">
            <span class="pct" style="color: var(--color-secondary);">{{ maintenanceActiveCount }}</span>
          </div>
        </div>
      </div>

      <!-- Status Pengadaan -->
      <div class="kpi-card" @click="$router.push('/tracker-pengadaan')">
        <div class="kpi-card-info">
          <h3>Status Pengadaan</h3>
          <div style="display: flex; align-items: baseline; gap: 0.375rem;">
            <span class="value" style="color: var(--color-tertiary);">{{ store.chartData.pgdPct }}%</span>
            <span class="label">Delivered</span>
          </div>
          <div class="kpi-legend" style="margin-top: 0.75rem;">
            <div class="legend-item">
              <span class="legend-dot" style="background: #059669;"></span>
              <span>Diterima: {{ pgdDiterima }}</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: #0e7490;"></span>
              <span>Dikirim: {{ store.stats.dalamPengiriman }}</span>
            </div>
          </div>
          <div class="kpi-spill" v-if="pengadaanSpill">
            <span class="material-symbols-outlined">{{ pengadaanSpill.icon }}</span>
            <div>
              <strong>{{ pengadaanSpill.title }}</strong>
              <p>{{ pengadaanSpill.meta }}</p>
            </div>
          </div>
        </div>
        <div class="donut-chart">
          <svg viewBox="0 0 100 100">
            <circle class="donut-track" cx="50" cy="50" r="40" />
            <circle
              class="donut-fill"
              cx="50" cy="50" r="40"
              :stroke="'#006576'"
              :stroke-dasharray="`${store.chartData.pgdPct * 2.513} 251.3`"
              stroke-dashoffset="0"
            />
          </svg>
          <div class="donut-center">
            <span class="pct" style="color: var(--color-tertiary);">{{ store.chartData.pgdPct }}%</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Stat Cards -->
    <section class="stat-grid">
      <div class="stat-card" @click="$router.push('/listing-asset')">
        <span class="material-symbols-outlined icon" style="color: var(--color-primary);">inventory_2</span>
        <p class="stat-label">Total Katalog</p>
        <p class="stat-value">{{ String(store.stats.totalKatalog).padStart(2, '0') }}</p>
      </div>
      <div class="stat-card" @click="$router.push('/ticketing')">
        <span class="material-symbols-outlined icon" style="color: var(--color-error);">priority_high</span>
        <p class="stat-label">Tiket Pending</p>
        <p class="stat-value" style="color: var(--color-error);">{{ String(store.stats.tiketPending).padStart(2, '0') }}</p>
      </div>
      <div class="stat-card" @click="$router.push('/tracker-pengadaan')">
        <span class="material-symbols-outlined icon" style="color: var(--color-secondary);">local_shipping</span>
        <p class="stat-label">Dalam Pengiriman</p>
        <p class="stat-value">{{ String(store.stats.dalamPengiriman).padStart(2, '0') }}</p>
      </div>
      <div class="stat-card" @click="$router.push('/database-outlet')">
        <span class="material-symbols-outlined icon" style="color: var(--color-primary-dim);">verified</span>
        <p class="stat-label">Aset Aktif</p>
        <p class="stat-value">{{ String(store.stats.asetAktif).padStart(2, '0') }}</p>
      </div>
      <div class="stat-card" @click="$router.push('/database-outlet')">
        <span class="material-symbols-outlined icon" style="color: var(--color-on-surface-variant); opacity: 0.5;">build</span>
        <p class="stat-label">Aset Rusak</p>
        <p class="stat-value">{{ String(store.stats.asetRusak).padStart(2, '0') }}</p>
      </div>
    </section>

    <!-- Workflow Section -->
    <section style="margin-bottom: 1.5rem;">
      <div class="section-header">
        <div class="accent-bar"></div>
        <h3>Operational Flow Ecosystem</h3>
      </div>
      <div class="workflow-container">
        <div class="workflow-grid">
          <div class="workflow-step" v-for="step in workflowSteps" :key="step.id">
            <div class="workflow-icon" :style="{ background: step.iconBg, color: step.iconColor }">
              <span class="material-symbols-outlined ms-filled">{{ step.icon }}</span>
            </div>
            <h4>{{ step.title }}</h4>
            <p>{{ step.desc }}</p>
            <div
              class="workflow-tag"
              :style="{ background: step.tagBg, color: step.tagColor }"
            >{{ step.tag }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom Grid: Recent Tickets + Outlet Distribution -->
    <section class="bottom-grid">
      <!-- Recent Maintenance Tickets -->
      <div class="card">
        <div class="card-header">
          <h3>Recent Tiket Laporan</h3>
          <router-link to="/ticketing" class="card-link">
            View All
            <span class="material-symbols-outlined">arrow_forward</span>
          </router-link>
        </div>
        <div>
          <div
            v-for="ticket in store.recentTickets"
            :key="ticket.id"
            class="ticket-item"
          >
            <div class="ticket-item-left">
              <div
                class="ticket-icon"
                :style="ticketIconStyle(ticket.status)"
              >
                <span class="material-symbols-outlined">{{ ticketIconName(ticket.status) }}</span>
              </div>
              <div>
                <div class="ticket-name">{{ ticket.barang }}</div>
                <div class="ticket-id">{{ ticket.id }} · {{ ticket.outlet }}</div>
              </div>
            </div>
            <div class="ticket-meta">
              <StatusBadge :status="ticket.status" />
              <div class="ticket-time">{{ formatDate(ticket.waktu) }}</div>
            </div>
          </div>

          <div v-if="store.recentTickets.length === 0" style="text-align: center; color: var(--color-on-surface-variant); padding: 2rem; font-size: 0.8125rem;">
            Belum ada tiket
          </div>
        </div>
      </div>

      <!-- Outlet Asset Distribution -->
      <div class="card">
        <div class="card-header">
          <h3>Distribusi Aset per Outlet</h3>
          <router-link to="/database-outlet" class="card-link">
            Detail
            <span class="material-symbols-outlined">arrow_forward</span>
          </router-link>
        </div>
        <div class="outlet-distribution">
          <div
            v-for="outlet in outletDistribution"
            :key="outlet.name"
            class="outlet-bar-item"
          >
            <span class="outlet-name">{{ outlet.name }}</span>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{ width: outlet.pct + '%', background: outlet.color }"
              ></div>
            </div>
            <span class="outlet-count">{{ outlet.count }}</span>
          </div>
        </div>

        <!-- Summary footer -->
        <div style="margin-top: 1.25rem; padding: 0.875rem 1rem; background: var(--color-surface-container-low); border-radius: 0.625rem; display: flex; justify-content: space-between; align-items: center;">
          <p style="font-size: 0.6875rem; color: var(--color-on-surface-variant);">
            Total outlet aktif: <strong style="color: var(--color-primary);">{{ OUTLETS.length }}</strong> cabang
          </p>
          <div style="display: flex; align-items: center; gap: 0.375rem; font-size: 0.6875rem; font-weight: 600; color: #059669;">
            <span class="material-symbols-outlined ms-filled" style="font-size: 0.875rem;">trending_up</span>
            +2 outlet this quarter
          </div>
        </div>
      </div>
    </section>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { useDataStore } from '@/stores/dataStore'

const store = useDataStore()

const OUTLETS = ['Antapani', 'Arcamanik', 'Cianjur', 'Cirebon', 'Ayam Mirasa', 'Suci', 'Kopo', 'Gedebage', 'Batununggal', 'Ciwastra']
const spillIndex = ref(0)
let spillTimer = null

onMounted(() => {
  spillTimer = setInterval(() => { spillIndex.value += 1 }, 4500)
})

onUnmounted(() => {
  if (spillTimer) clearInterval(spillTimer)
})

// Computed helpers for ticket status
const tiketPending = computed(() => store.ticketing.filter(t => t.status === 'Pending').length)
const tiketDiproses = computed(() => store.ticketing.filter(t => t.status === 'Sedang Diproses').length)
const tiketSelesai = computed(() => store.ticketing.filter(t => t.status === 'Selesai').length)
const pgdDiterima = computed(() => store.pengadaan.filter(p => p.status === 'Diterima Outlet').length)
const maintenanceTodo = computed(() => store.maintenance.filter(m => m.status === 'To Do').length)
const maintenanceSudahCO = computed(() => store.maintenance.filter(m => m.status === 'Sudah CO').length)
const maintenanceProses = computed(() => store.maintenance.filter(m => m.status === 'Proses Pengerjaan').length)
const maintenanceActiveCount = computed(() => maintenanceTodo.value + maintenanceSudahCO.value + maintenanceProses.value)

// Weighted progress: Pending=0pt, Diproses=0.5pt, Selesai=1pt
const tiketWeightedPct = computed(() => {
  const total = store.ticketing.length
  if (total === 0) return 0
  const score = tiketSelesai.value * 1 + tiketDiproses.value * 0.5
  return Math.round((score / total) * 100)
})

// Arc lengths for 3-segment donut (circumference = 251.3)
const tiketSegments = computed(() => {
  const total = store.ticketing.length
  if (total === 0) return { selesai: 0, diproses: 0, pending: 0 }
  const C = 251.3
  return {
    selesai: Math.round((tiketSelesai.value / total) * C * 10) / 10,
    diproses: Math.round((tiketDiproses.value / total) * C * 10) / 10,
    pending: Math.round((tiketPending.value / total) * C * 10) / 10,
  }
})

const maintenanceSegments = computed(() => {
  const total = maintenanceActiveCount.value
  if (total === 0) return { todo: 0, sudahCO: 0, proses: 0 }
  const C = 251.3
  return {
    todo: Math.round((maintenanceTodo.value / total) * C * 10) / 10,
    sudahCO: Math.round((maintenanceSudahCO.value / total) * C * 10) / 10,
    proses: Math.round((maintenanceProses.value / total) * C * 10) / 10,
  }
})

function pickRotating(items) {
  if (!items.length) return null
  return items[spillIndex.value % items.length]
}

function shortText(value, max = 34) {
  const text = String(value || '').trim()
  return text.length > max ? text.slice(0, max) + '…' : text
}

const ticketSpills = computed(() => {
  const priority = store.ticketing.filter(t => t.status !== 'Selesai')
  const source = priority.length ? priority : store.ticketing
  return source.slice(0, 5).map(t => ({
    icon: t.status === 'Pending' ? 'priority_high' : 'confirmation_number',
    title: `${t.id || 'Tiket'} · ${shortText(t.barang || 'Item')}`,
    meta: `${t.outlet || 'Outlet'} · ${t.status || 'Pending'}${t.pic ? ' · ' + t.pic : ''}`
  }))
})

const maintenanceSpills = computed(() => {
  const source = store.maintenance.filter(m => m.status !== 'Pengerjaan Selesai').slice(0, 5)
  return source.map(m => ({
    icon: m.status === 'To Do' ? 'playlist_add_check' : 'construction',
    title: `${m.id || 'Project'} · ${shortText(m.pekerjaan || 'Maintenance')}`,
    meta: `${m.cabang || 'Cabang'} · ${m.status || 'To Do'}${m.pic ? ' · ' + m.pic : ''}`
  }))
})

const pengadaanSpills = computed(() => {
  const source = store.pengadaan.filter(p => p.status !== 'Diterima Outlet').slice(0, 5)
  return source.map(p => ({
    icon: p.status === 'Dikirim' ? 'local_shipping' : 'inventory_2',
    title: `${p.id || 'Pengadaan'} · ${shortText(p.barang || 'Barang')}`,
    meta: `${p.outlet || 'Outlet'} · ${p.status || 'Dikemas'}${p.resi ? ' · ' + shortText(p.resi, 18) : ''}`
  }))
})

const ticketSpill = computed(() => pickRotating(ticketSpills.value))
const maintenanceSpill = computed(() => pickRotating(maintenanceSpills.value))
const pengadaanSpill = computed(() => pickRotating(pengadaanSpills.value))

// Outlet distribution data
const outletDistribution = computed(() => {
  const counts = {}
  store.dbOutlet.forEach(a => {
    counts[a.outlet] = (counts[a.outlet] || 0) + 1
  })

  const maxCount = Math.max(...Object.values(counts), 1)
  const colors = [
    '#0057be', '#6a37d4', '#006576', '#ea580c',
    '#059669', '#d97706', '#db2777', '#0e7490'
  ]

  return Object.entries(counts).map(([name, count], i) => ({
    name,
    count,
    pct: Math.round((count / maxCount) * 100),
    color: colors[i % colors.length]
  }))
})

// Workflow steps
const workflowSteps = [
  {
    id: 1,
    icon: 'confirmation_number',
    iconBg: 'rgba(0,87,190,0.1)',
    iconColor: 'var(--color-primary)',
    title: 'Masuk Ticketing',
    desc: 'Crew/SM input semua laporan, request, kerusakan, dan kebutuhan lewat Ticketing OMS.',
    tag: 'SINGLE ENTRY',
    tagBg: 'rgba(0,87,190,0.1)',
    tagColor: 'var(--color-primary)',
  },
  {
    id: 2,
    icon: 'rule',
    iconBg: 'rgba(106,55,212,0.1)',
    iconColor: 'var(--color-secondary)',
    title: 'Screening Kebutuhan',
    desc: 'Admin/Bizdev cek apakah tiket cukup diselesaikan, butuh equipment, maintenance, atau keduanya.',
    tag: 'TRIAGE',
    tagBg: 'rgba(106,55,212,0.1)',
    tagColor: 'var(--color-secondary)',
  },
  {
    id: 3,
    icon: 'local_shipping',
    iconBg: 'rgba(0,101,118,0.1)',
    iconColor: 'var(--color-tertiary)',
    title: 'Pengadaan Jika Equipment',
    desc: 'Jika butuh equipment, masuk Tracker Pengadaan untuk CO, resi, pengiriman, sampai diterima outlet.',
    tag: 'PROCUREMENT',
    tagBg: 'rgba(0,101,118,0.1)',
    tagColor: 'var(--color-tertiary)',
  },
  {
    id: 4,
    icon: 'build',
    iconBg: 'rgba(217,119,6,0.1)',
    iconColor: '#d97706',
    title: 'Maintenance / Closing',
    desc: 'Jika maintenance tanpa barang, langsung ke Maintenance. Jika perlu barang, lanjut setelah pengadaan siap.',
    tag: 'EXECUTE & CLOSE',
    tagBg: 'rgba(217,119,6,0.1)',
    tagColor: '#d97706',
  },
]

// Helpers
function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function ticketIconName(status) {
  const map = {
    'Pending': 'pending_actions',
    'Sedang Diproses': 'sync',
    'Selesai': 'check_circle',
  }
  return map[status] || 'confirmation_number'
}

function ticketIconStyle(status) {
  const map = {
    'Pending': { background: 'rgba(179,27,37,0.1)', color: 'var(--color-error)' },
    'Sedang Diproses': { background: 'rgba(0,87,190,0.1)', color: 'var(--color-primary)' },
    'Selesai': { background: 'rgba(5,150,105,0.1)', color: '#059669' },
  }
  return map[status] || { background: 'rgba(89,92,94,0.1)', color: 'var(--color-on-surface-variant)' }
}
</script>

<style scoped>
.kpi-legend {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.6875rem;
  color: var(--color-on-surface-variant);
}
.legend-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.kpi-spill {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 0.875rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.625rem;
  background: var(--color-surface-container-low);
  max-width: 15rem;
}
.kpi-spill .material-symbols-outlined {
  font-size: 1rem;
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 0.0625rem;
}
.kpi-spill strong {
  display: block;
  font-size: 0.6875rem;
  line-height: 1.3;
  color: var(--color-on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 12rem;
}
.kpi-spill p {
  font-size: 0.625rem;
  line-height: 1.35;
  color: var(--color-on-surface-variant);
  margin: 0.125rem 0 0;
}
</style>
