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

      <!-- Kondisi Aset -->
      <div class="kpi-card" @click="$router.push('/database-outlet')">
        <div class="kpi-card-info">
          <h3>Kondisi Aset</h3>
          <div style="display: flex; align-items: baseline; gap: 0.375rem;">
            <span class="value" style="color: var(--color-secondary);">{{ store.chartData.asetPct }}%</span>
            <span class="label">Healthy</span>
          </div>
          <div class="kpi-legend" style="margin-top: 0.75rem;">
            <div class="legend-item">
              <span class="legend-dot" style="background: #059669;"></span>
              <span>Aktif: {{ store.stats.asetAktif }}</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: var(--color-error);"></span>
              <span>Rusak: {{ store.stats.asetRusak }}</span>
            </div>
          </div>
        </div>
        <div class="donut-chart">
          <svg viewBox="0 0 100 100">
            <circle class="donut-track" cx="50" cy="50" r="40" />
            <circle
              class="donut-fill"
              cx="50" cy="50" r="40"
              :stroke="'#6a37d4'"
              :stroke-dasharray="`${store.chartData.asetPct * 2.513} 251.3`"
              stroke-dashoffset="0"
            />
          </svg>
          <div class="donut-center">
            <span class="pct" style="color: var(--color-secondary);">{{ store.chartData.asetPct }}%</span>
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
import { computed } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { useDataStore } from '@/stores/dataStore'

const store = useDataStore()

const OUTLETS = ['Antapani', 'Arcamanik', 'Cianjur', 'Cirebon', 'Ayam Mirasa', 'Suci', 'Kopo', 'Gedebage']

// Computed helpers for ticket status
const tiketPending = computed(() => store.ticketing.filter(t => t.status === 'Pending').length)
const tiketDiproses = computed(() => store.ticketing.filter(t => t.status === 'Sedang Diproses').length)
const tiketSelesai = computed(() => store.ticketing.filter(t => t.status === 'Selesai').length)
const pgdDiterima = computed(() => store.pengadaan.filter(p => p.status === 'Diterima Outlet').length)

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
    icon: 'chat',
    iconBg: 'rgba(16,185,129,0.1)',
    iconColor: '#059669',
    title: 'Lapor via WA',
    desc: 'Admin outlet mengirim keluhan via WhatsApp Bot',
    tag: 'TRIGGER ACTIVE',
    tagBg: 'rgba(16,185,129,0.1)',
    tagColor: '#059669',
  },
  {
    id: 2,
    icon: 'bolt',
    iconBg: 'rgba(0,87,190,0.1)',
    iconColor: 'var(--color-primary)',
    title: 'Ditangkap n8n',
    desc: 'Automation engine memproses data ke database OMS',
    tag: 'PROCESSING...',
    tagBg: 'rgba(0,87,190,0.1)',
    tagColor: 'var(--color-primary)',
  },
  {
    id: 3,
    icon: 'shopping_cart_checkout',
    iconBg: 'rgba(106,55,212,0.1)',
    iconColor: 'var(--color-secondary)',
    title: 'Checkout & Resi',
    desc: 'Item diproses dan nomor resi kurir diterbitkan',
    tag: 'WAITING LOGISTICS',
    tagBg: 'var(--color-surface-container-high)',
    tagColor: 'var(--color-on-surface-variant)',
  },
  {
    id: 4,
    icon: 'inventory',
    iconBg: 'rgba(0,101,118,0.1)',
    iconColor: 'var(--color-tertiary)',
    title: 'Barang Tiba',
    desc: 'Admin konfirmasi penerimaan dan update status aset',
    tag: 'FINAL VALIDATION',
    tagBg: 'var(--color-surface-container-high)',
    tagColor: 'var(--color-on-surface-variant)',
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
</style>
