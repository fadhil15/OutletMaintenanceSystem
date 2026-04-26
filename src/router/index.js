import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/pages/Dashboard.vue'
import Login from '@/pages/Login.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: 'Login — OMS V3.0' }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: 'Dashboard — OMS V3.0' }
  },
  {
    path: '/listing-asset',
    name: 'ListingAsset',
    component: () => import('@/pages/ListingAsset.vue'),
    meta: { title: 'Listing Asset — OMS V3.0' }
  },
  {
    path: '/ticketing',
    name: 'Ticketing',
    component: () => import('@/pages/Ticketing.vue'),
    meta: { title: 'Ticketing — OMS V3.0' }
  },
  {
    path: '/tracker-pengadaan',
    name: 'TrackerPengadaan',
    component: () => import('@/pages/TrackerPengadaan.vue'),
    meta: { title: 'Tracker Pengadaan — OMS V3.0' }
  },
  {
    path: '/database-outlet',
    name: 'DatabaseOutlet',
    component: () => import('@/pages/DatabaseOutlet.vue'),
    meta: { title: 'Database Outlet — OMS V3.0' }
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: () => import('@/pages/Maintenance.vue'),
    meta: { title: 'Maintenance & Bisdev — OMS V3.0' }
  },
  {
    path: '/worklog',
    name: 'Worklog',
    component: () => import('@/pages/Worklog.vue'),
    meta: { title: 'Worklog — OMS V3.0' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/Settings.vue'),
    meta: { title: 'Settings — OMS V3.0' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Update document title
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('oms_auth_token') === 'sedjahtera2026'
  
  if (to.name !== 'Login' && !isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

router.afterEach((to) => {
  document.title = to.meta.title || 'Outlet Maintenance System V3.0'
})

export default router
