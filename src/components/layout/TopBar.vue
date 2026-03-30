<template>
  <header class="topbar">
    <!-- Search -->
    <div class="topbar-search">
      <span class="material-symbols-outlined">search</span>
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        @keyup.enter="$emit('search', searchQuery)"
      />
    </div>

    <!-- Actions -->
    <div class="topbar-actions">
      <button class="icon-btn" title="Notifications">
        <span class="material-symbols-outlined">notifications</span>
      </button>
      <router-link to="/settings" class="icon-btn" title="Settings">
        <span class="material-symbols-outlined">settings</span>
      </router-link>

      <div class="topbar-divider"></div>

      <div class="topbar-profile">
        <div class="topbar-profile-info">
          <div class="name">Administrator</div>
          <div class="role">Profile Active</div>
        </div>
        <div class="avatar">
          <span class="material-symbols-outlined ms-filled" style="font-size: 1.25rem; color: var(--color-on-primary-container);">person</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Search outlet, asset, or ticket...'
  }
})

const emit = defineEmits(['search'])
const searchQuery = ref('')
</script>
