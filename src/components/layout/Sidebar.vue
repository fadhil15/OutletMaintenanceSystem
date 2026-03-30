<template>
  <aside class="sidebar" :class="{ open: sidebarOpen }">
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="sidebar-logo">
        <span class="material-symbols-outlined ms-filled">inventory_2</span>
      </div>
      <div class="sidebar-brand-text">
        <h1>OMS v3.0</h1>
        <p>Precision Curator</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="nav-item"
        :class="{ active: $route.path === item.path }"
        @click="closeSidebar"
      >
        <span class="material-symbols-outlined">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </router-link>

      <div style="height: 1px; background: rgba(171,173,175,0.15); margin: 0.5rem 0;"></div>

      <router-link
        to="/settings"
        class="nav-item"
        :class="{ active: $route.path === '/settings' }"
        @click="closeSidebar"
      >
        <span class="material-symbols-outlined">settings</span>
        <span>Settings</span>
      </router-link>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="connection-status">
        <span class="material-symbols-outlined ms-filled">sensors</span>
        <span>{{ store.sheetsConnected ? 'Live Data' : 'Sample Data' }}</span>
      </div>
      <div
        class="connection-status"
        style="margin-top: 0.375rem; color: var(--color-on-surface-variant); font-size: 0.6875rem;"
      >
        <span class="material-symbols-outlined" style="font-size: 0.875rem;">{{ store.crudConnected ? 'check_circle' : 'radio_button_unchecked' }}</span>
        <span>CRUD {{ store.crudConnected ? 'On' : 'Off' }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useDataStore } from '@/stores/dataStore'

const store = useDataStore()

const props = defineProps({
  sidebarOpen: Boolean
})

const emit = defineEmits(['close'])
function closeSidebar() {
  emit('close')
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: 'dashboard', label: 'Dashboard' },
  { name: 'ListingAsset', path: '/listing-asset', icon: 'inventory_2', label: 'Listing Asset' },
  { name: 'Ticketing', path: '/ticketing', icon: 'confirmation_number', label: 'Ticketing' },
  { name: 'TrackerPengadaan', path: '/tracker-pengadaan', icon: 'local_shipping', label: 'Tracker Pengadaan' },
  { name: 'DatabaseOutlet', path: '/database-outlet', icon: 'storefront', label: 'Database Outlet' },
  { name: 'Maintenance', path: '/maintenance', icon: 'build', label: 'Maintenance & Bisdev' },
]
</script>
