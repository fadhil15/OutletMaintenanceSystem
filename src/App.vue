<template>
  <RouterView />
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'

const store = useDataStore()

onMounted(() => {
  if (store.sheetsUrl) {
    store.connectSheets(store.sheetsUrl)
  }
})
</script>
