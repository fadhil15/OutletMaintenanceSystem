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
    <!-- Operations KPI Strip -->
    <section class="ops-kpi-section" aria-label="Operations KPI indicators">
      <div class="ops-health-card" :class="operationsHealth.tone" @click="$router.push('/worklog')">
        <div class="ops-health-top">
          <div>
            <p class="ops-eyebrow">Operations Health</p>
            <div class="ops-health-score">
              <span>{{ operationsHealth.score }}%</span>
              <small>{{ operationsHealth.label }}</small>
            </div>
          </div>
          <span class="material-symbols-outlined ops-health-icon">monitoring</span>
        </div>
        <div class="ops-progress-track">
          <div class="ops-progress-fill" :style="{ width: operationsHealth.score + '%' }"></div>
        </div>
        <div class="ops-health-breakdown">
          <span>Ticket {{ ticketHealthPct }}%</span>
          <span>Aset {{ assetHealthPct }}%</span>
          <span>Pengadaan {{ procurementHealthPct }}%</span>
          <span>Maintenance {{ maintenanceHealthPct }}%</span>
          <span>Follow-up {{ followUpHealthPct }}%</span>
        </div>
      </div>

      <button
        v-for="kpi in operationsKpis"
        :key="kpi.key"
        class="ops-kpi-card"
        :class="kpi.tone"
        @click="$router.push(kpi.route)"
      >
        <span class="material-symbols-outlined ops-kpi-icon">{{ kpi.icon }}</span>
        <span class="ops-kpi-content">
          <span class="ops-kpi-label">{{ kpi.label }}</span>
          <strong>{{ kpi.value }}</strong>
          <small>{{ kpi.caption }}</small>
        </span>
      </button>
    </section>

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
              <StatusBadge :status="normalizeTicketStatus(ticket.status)" />
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
import { TICKETING_OUTLETS } from '@/constants/ticketing'

const store = useDataStore()

const OUTLETS = TICKETING_OUTLETS

function normalizeTicketStatus(status) {
  const raw = String(status || '').trim()
  const compact = raw.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ')

  if (!compact) return 'Pending'
  if (compact.includes('selesai') || compact.includes('done') || compact.includes('complete')) return 'Selesai'
  if (compact.includes('proses') || compact.includes('process') || compact.includes('progress')) return 'Sedang Diproses'
  if (compact.includes('pending') || compact.includes('open') || compact.includes('baru')) return 'Pending'

  return raw
}

// Computed helpers for ticket status
const tiketPending = computed(() => store.ticketing.filter(t => normalizeTicketStatus(t.status) === 'Pending').length)
const tiketDiproses = computed(() => store.ticketing.filter(t => normalizeTicketStatus(t.status) === 'Sedang Diproses').length)
const tiketSelesai = computed(() => store.ticketing.filter(t => normalizeTicketStatus(t.status) === 'Selesai').length)
const pgdDiterima = computed(() => store.pengadaan.filter(p => String(p.status || '').includes('Diterima')).length)

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

const openTickets = computed(() => tiketPending.value + tiketDiproses.value)
const assetRiskCount = computed(() => store.stats.asetRusak)
const procurementInTransit = computed(() => store.stats.dalamPengiriman)

function isMaintenanceDone(status) {
  return String(status || '').toLowerCase().includes('selesai')
}

const activeMaintenanceCount = computed(() =>
  store.maintenance.filter(item => !isMaintenanceDone(item.status)).length
)

const maintenanceHealthPct = computed(() => {
  const total = store.maintenance.length
  if (total === 0) return 100
  const done = store.maintenance.filter(item => isMaintenanceDone(item.status)).length
  return Math.round((done / total) * 100)
})

function parseDateOnly(value) {
  if (!value) return null
  const raw = String(value).trim()
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))

  const local = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/)
  if (local) {
    const year = Number(local[3].length === 2 ? `20${local[3]}` : local[3])
    return new Date(year, Number(local[2]) - 1, Number(local[1]))
  }

  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return null
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

const todayDate = computed(() => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
})

function isOpenFollowUp(worklog) {
  const status = String(worklog.statusFollowUp || '').trim()
  return status !== 'Done' && status !== 'Cancelled'
}

const followUpTotal = computed(() =>
  store.worklog.filter(worklog => String(worklog.statusFollowUp || '').trim()).length
)

const followUpDoneCount = computed(() =>
  store.worklog.filter(worklog => String(worklog.statusFollowUp || '').trim() === 'Done').length
)

const overdueFollowUps = computed(() =>
  store.worklog.filter(worklog => {
    if (!isOpenFollowUp(worklog)) return false
    const followUpDate = parseDateOnly(worklog.tanggalFollowUp)
    return followUpDate && followUpDate.getTime() < todayDate.value.getTime()
  }).length
)

const dueTodayFollowUps = computed(() =>
  store.worklog.filter(worklog => {
    if (!isOpenFollowUp(worklog)) return false
    const followUpDate = parseDateOnly(worklog.tanggalFollowUp)
    return followUpDate && followUpDate.getTime() === todayDate.value.getTime()
  }).length
)

const urgentOpenFollowUps = computed(() =>
  store.worklog.filter(worklog => worklog.prioritas === 'Urgent' && isOpenFollowUp(worklog)).length
)

const followUpHealthPct = computed(() => {
  if (followUpTotal.value === 0) return 100
  const completionPct = Math.round((followUpDoneCount.value / followUpTotal.value) * 100)
  return Math.max(0, completionPct - (overdueFollowUps.value * 5))
})

const ticketHealthPct = computed(() => store.ticketing.length === 0 ? 100 : tiketWeightedPct.value)
const assetHealthPct = computed(() => store.dbOutlet.length === 0 ? 100 : store.chartData.asetPct)
const procurementHealthPct = computed(() => store.pengadaan.length === 0 ? 100 : store.chartData.pgdPct)

const operationsHealth = computed(() => {
  const score = Math.round(
    (ticketHealthPct.value * 0.30) +
    (assetHealthPct.value * 0.20) +
    (procurementHealthPct.value * 0.20) +
    (maintenanceHealthPct.value * 0.20) +
    (followUpHealthPct.value * 0.10)
  )

  if (score >= 85) return { score, label: 'Healthy', tone: 'is-healthy' }
  if (score >= 70) return { score, label: 'Watch', tone: 'is-watch' }
  if (score >= 50) return { score, label: 'At Risk', tone: 'is-risk' }
  return { score, label: 'Critical', tone: 'is-critical' }
})

const operationsKpis = computed(() => [
  {
    key: 'open-tickets',
    label: 'Open Tickets',
    value: openTickets.value,
    caption: `${tiketPending.value} pending · ${tiketDiproses.value} diproses`,
    icon: 'confirmation_number',
    route: '/ticketing',
    tone: openTickets.value > 0 ? 'is-watch' : 'is-healthy'
  },
  {
    key: 'overdue-followups',
    label: 'Overdue Follow-up',
    value: overdueFollowUps.value,
    caption: `${dueTodayFollowUps.value} due today · ${urgentOpenFollowUps.value} urgent`,
    icon: 'notification_important',
    route: '/worklog',
    tone: overdueFollowUps.value > 0 ? 'is-critical' : 'is-healthy'
  },
  {
    key: 'asset-risk',
    label: 'Asset Risk',
    value: assetRiskCount.value,
    caption: `${assetHealthPct.value}% asset healthy`,
    icon: 'construction',
    route: '/database-outlet',
    tone: assetRiskCount.value > 0 ? 'is-risk' : 'is-healthy'
  },
  {
    key: 'procurement-transit',
    label: 'In Transit',
    value: procurementInTransit.value,
    caption: `${procurementHealthPct.value}% delivered`,
    icon: 'local_shipping',
    route: '/tracker-pengadaan',
    tone: procurementInTransit.value > 0 ? 'is-watch' : 'is-healthy'
  },
  {
    key: 'active-maintenance',
    label: 'Active Maintenance',
    value: activeMaintenanceCount.value,
    caption: `${maintenanceHealthPct.value}% complete`,
    icon: 'handyman',
    route: '/maintenance',
    tone: activeMaintenanceCount.value > 0 ? 'is-watch' : 'is-healthy'
  }
])


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

.ops-kpi-section {
  display: grid;
  grid-template-columns: minmax(280px, 1.35fr) repeat(5, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.ops-health-card,
.ops-kpi-card {
  background: var(--color-surface-container-lowest);
  border: 1px solid rgba(116, 119, 121, 0.14);
  box-shadow: 0 10px 26px rgba(44, 47, 49, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.ops-health-card {
  border-radius: 1rem;
  cursor: pointer;
  padding: 1.15rem 1.25rem;
}
.ops-health-card:hover,
.ops-kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 34px rgba(44, 47, 49, 0.09);
}
.ops-health-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.ops-eyebrow,
.ops-kpi-label {
  font-family: var(--font-family-mono);
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}
.ops-health-score {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-top: 0.2rem;
}
.ops-health-score span {
  font-size: 2.15rem;
  font-weight: 900;
  line-height: 1;
  color: var(--color-on-surface);
}
.ops-health-score small {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--color-on-surface-variant);
}
.ops-health-icon {
  width: 46px;
  height: 46px;
  border-radius: 0.875rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 87, 190, 0.1);
  color: var(--color-primary);
}
.ops-progress-track {
  height: 8px;
  overflow: hidden;
  margin: 1rem 0 0.8rem;
  border-radius: 9999px;
  background: var(--color-surface-container-high);
}
.ops-progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0057be, #059669);
  transition: width 0.35s ease;
}
.ops-health-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.ops-health-breakdown span {
  padding: 0.18rem 0.5rem;
  border-radius: 9999px;
  background: var(--color-surface-container-low);
  color: var(--color-on-surface-variant);
  font-size: 0.65rem;
  font-weight: 700;
}
.ops-kpi-card {
  min-height: 132px;
  border-radius: 0.9rem;
  padding: 1rem;
  border-left: 4px solid var(--color-outline-variant);
  cursor: pointer;
  font-family: var(--font-family-body);
  color: var(--color-on-surface);
  text-align: left;
}
.ops-kpi-icon {
  width: 38px;
  height: 38px;
  border-radius: 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  background: var(--color-surface-container-low);
  color: var(--color-primary);
}
.ops-kpi-content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.ops-kpi-content strong {
  font-size: 1.55rem;
  line-height: 1;
  font-weight: 900;
}
.ops-kpi-content small {
  color: var(--color-on-surface-variant);
  font-size: 0.68rem;
  font-weight: 700;
}
.ops-health-card.is-healthy,
.ops-kpi-card.is-healthy { border-color: rgba(5, 150, 105, 0.26); }
.ops-health-card.is-watch,
.ops-kpi-card.is-watch { border-color: rgba(217, 119, 6, 0.28); }
.ops-health-card.is-risk,
.ops-kpi-card.is-risk { border-color: rgba(234, 88, 12, 0.3); }
.ops-health-card.is-critical,
.ops-kpi-card.is-critical { border-color: rgba(179, 27, 37, 0.3); }
.ops-kpi-card.is-healthy .ops-kpi-icon { background: rgba(5, 150, 105, 0.1); color: #059669; }
.ops-kpi-card.is-watch .ops-kpi-icon { background: rgba(217, 119, 6, 0.1); color: #d97706; }
.ops-kpi-card.is-risk .ops-kpi-icon { background: rgba(234, 88, 12, 0.1); color: #ea580c; }
.ops-kpi-card.is-critical .ops-kpi-icon { background: rgba(179, 27, 37, 0.12); color: #b31b25; }
.ops-health-card.is-healthy .ops-progress-fill { background: linear-gradient(90deg, #0057be, #059669); }
.ops-health-card.is-watch .ops-progress-fill { background: linear-gradient(90deg, #0057be, #d97706); }
.ops-health-card.is-risk .ops-progress-fill { background: linear-gradient(90deg, #d97706, #ea580c); }
.ops-health-card.is-critical .ops-progress-fill { background: linear-gradient(90deg, #ea580c, #b31b25); }

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

@media (max-width: 1280px) {
  .ops-kpi-section {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .ops-health-card {
    grid-column: span 3;
  }
}
@media (max-width: 768px) {
  .ops-kpi-section {
    grid-template-columns: 1fr;
  }
  .ops-health-card {
    grid-column: auto;
  }
}

</style>
