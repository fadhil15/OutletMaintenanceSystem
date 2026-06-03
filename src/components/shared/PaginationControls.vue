<template>
  <div v-if="total > 0" class="pagination-controls">
    <div class="pagination-info">
      Menampilkan <strong>{{ startItem }}</strong>-<strong>{{ endItem }}</strong> dari <strong>{{ total }}</strong> data
    </div>

    <div class="pagination-actions">
      <label class="page-size-label">
        Show
        <select :value="pageSize" class="page-size-select" @change="handlePageSizeChange">
          <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
        </select>
      </label>

      <button class="page-btn" :disabled="page <= 1" @click="emit('update:page', page - 1)">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <span class="page-count">{{ page }} / {{ totalPages }}</span>
      <button class="page-btn" :disabled="page >= totalPages" @click="emit('update:page', page + 1)">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  total: { type: Number, required: true },
  page: { type: Number, required: true },
  pageSize: { type: Number, required: true },
  pageSizeOptions: {
    type: Array,
    default: () => [10, 25, 50]
  }
})

const emit = defineEmits(['update:page', 'update:pageSize'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const startItem = computed(() => props.total === 0 ? 0 : ((props.page - 1) * props.pageSize) + 1)
const endItem = computed(() => Math.min(props.total, props.page * props.pageSize))

function handlePageSizeChange(event) {
  emit('update:pageSize', Number(event.target.value))
  emit('update:page', 1)
}
</script>

<style scoped>
.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.875rem 1rem;
  background: var(--color-surface-container-lowest);
  border-radius: 0.75rem;
  flex-wrap: wrap;
}
.pagination-info {
  font-size: 0.75rem;
  color: var(--color-on-surface-variant);
}
.pagination-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.page-size-label {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--color-on-surface-variant);
}
.page-size-select {
  border: none;
  border-radius: 0.5rem;
  background: var(--color-surface-container-highest);
  color: var(--color-on-surface);
  padding: 0.375rem 0.5rem;
  font-family: var(--font-family-body);
  font-size: 0.75rem;
  outline: none;
}
.page-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--color-surface-container-highest);
  color: var(--color-on-surface);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.page-btn .material-symbols-outlined {
  font-size: 1rem;
}
.page-count {
  min-width: 3.25rem;
  text-align: center;
  font-family: var(--font-family-mono);
  font-size: 0.75rem;
  color: var(--color-on-surface-variant);
}
</style>
