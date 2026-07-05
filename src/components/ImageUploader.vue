<script setup lang="ts">
import { useLoadImageFile } from '../composables/useLoadImageFile'

const { loadImageFile } = useLoadImageFile()

function handleFile(value: File | File[] | null) {
  const file = Array.isArray(value) ? value[0] : value
  if (!file) {
    return
  }
  loadImageFile(file)
}
</script>

<template>
  <VFileUpload
    accept="image/*"
    title="Drop an image here or click to upload"
    icon="mdi-image-plus-outline"
    density="comfortable"
    class="w-100"
    @update:model-value="handleFile"
  />
</template>
