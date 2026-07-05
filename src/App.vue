<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationStore } from './stores/notification'
import AppHeader from './components/AppHeader.vue'
import FilterPanel from './components/FilterPanel.vue'
import EditorStage from './components/EditorStage.vue'

const { messages } = storeToRefs(useNotificationStore())
const drawer = ref(true)
</script>

<template>
  <VApp>
    <AppHeader @toggle-drawer="drawer = !drawer" />

    <VNavigationDrawer v-model="drawer" width="320">
      <FilterPanel />
    </VNavigationDrawer>

    <VMain class="h-screen" style="min-height: 400px">
      <VContainer fluid class="pa-4 fill-height align-stretch d-flex">
        <EditorStage />
      </VContainer>
    </VMain>

    <VSnackbarQueue v-model="messages" location="top" :timeout="3000" />
  </VApp>
</template>
