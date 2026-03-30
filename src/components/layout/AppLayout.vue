<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <Sidebar :sidebar-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="mobile-overlay"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main content -->
    <div class="main-content">
      <TopBar :placeholder="searchPlaceholder" />
      <div class="page-content">
        <slot />
      </div>
    </div>

    <!-- Toast -->
    <ToastNotification />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'
import ToastNotification from '@/components/shared/ToastNotification.vue'

defineProps({
  searchPlaceholder: {
    type: String,
    default: 'Search outlet, asset, or ticket...'
  }
})

const sidebarOpen = ref(false)

// Provide toast
const toasts = ref([])
provide('toasts', toasts)
provide('addToast', (message, type = 'info') => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 4000)
})
</script>

<style scoped>
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(11, 15, 16, 0.5);
  z-index: 49;
  backdrop-filter: blur(2px);
}
</style>
