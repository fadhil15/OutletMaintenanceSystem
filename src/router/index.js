import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/pages/Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: 'Dashboard — OMS v3.0' }
  },
  {
    path: '/listing-asset',
    name: 'ListingAsset',
    component: () => import('@/pages/ListingAsset.vue'),
    meta: { title: 'Listing Asset — OMS v3.0' }
  },
  {
    path: '/ticketing',
    name: 'Ticketing',
    component: () => import('@/pages/Ticketing.vue'),
    meta: { title: 'Ticketing — OMS v3.0' }
  },
  {
    path: '/tracker-pengadaan',
    name: 'TrackerPengadaan',
    component: () => import('@/pages/TrackerPengadaan.vue'),
    meta: { title: 'Tracker Pengadaan — OMS v3.0' }
  },
  {
    path: '/database-outlet',
    name: 'DatabaseOutlet',
    component: () => import('@/pages/DatabaseOutlet.vue'),
    meta: { title: 'Database Outlet — OMS v3.0' }
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: () => import('@/pages/Maintenance.vue'),
    meta: { title: 'Maintenance & Bisdev — OMS v3.0' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/Settings.vue'),
    meta: { title: 'Settings — OMS v3.0' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Update document title
router.afterEach((to) => {
  document.title = to.meta.title || 'OMS v3.0'
})

export default router
