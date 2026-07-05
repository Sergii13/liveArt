<script setup lang="ts">
const emit = defineEmits<{ (event: 'toggle-drawer'): void }>()
</script>

<template>
  <VAppBar flat border="b" density="comfortable">
    <template #prepend>
      <VAppBarNavIcon @click="emit('toggle-drawer')" />
    </template>

    <VToolbarTitle class="text-center font-weight-bold text-h6">
      LiveArt
    </VToolbarTitle>

    <template #append>
      <div style="width: 48px" />
    </template>
  </VAppBar>
</template>
