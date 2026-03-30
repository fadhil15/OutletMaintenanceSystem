<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast-${toast.type}`"
        >
          <span class="material-symbols-outlined ms-filled">
            {{ iconMap[toast.type] || 'info' }}
          </span>
          <span>{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { inject } from 'vue'

const toasts = inject('toasts', [])

const iconMap = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  transform: translateY(1rem);
  opacity: 0;
}

.toast-success { border-left: 3px solid #059669; }
.toast-error { border-left: 3px solid var(--color-error); }
.toast-warning { border-left: 3px solid #d97706; }
.toast-info { border-left: 3px solid var(--color-primary); }
</style>
