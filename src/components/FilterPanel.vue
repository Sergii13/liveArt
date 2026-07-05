<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useFileDialog } from '@vueuse/core'
import { useEditorStore } from '../stores/editor'
import { useNotificationStore } from '../stores/notification'
import { useImport } from '../composables/useImport'
import type { Adjustments, FilterName } from '../schemas/editDocument'

const editorStore = useEditorStore()
const { editDocument, hasImage } = storeToRefs(editorStore)
const { notify } = useNotificationStore()
const { importSettings } = useImport()
const importDialog = useFileDialog({ accept: 'application/json', multiple: false, reset: true })

const importError = ref<string | null>(null)

const adjustments: { key: keyof Adjustments; label: string; icon: string }[] = [
  { key: 'brightness', label: 'Brightness', icon: 'mdi-brightness-6' },
  { key: 'contrast', label: 'Contrast', icon: 'mdi-contrast-circle' },
  { key: 'saturation', label: 'Saturation', icon: 'mdi-palette-outline' },
]

const filters: { key: FilterName; label: string; icon: string }[] = [
  { key: 'grayscale', label: 'Grayscale', icon: 'mdi-invert-colors' },
  { key: 'sepia', label: 'Sepia', icon: 'mdi-image-filter-vintage' },
]

importDialog.onChange(async (files) => {
  const file = files?.[0]
  if (!file) {
    return
  }

  importError.value = null
  const result = await importSettings(file)
  if (result.ok) {
    notify('Settings loaded successfully', 'success')
  } else {
    importError.value = result.error
  }
})
</script>

<template>
  <VCard
    title="Image setup"
    prepend-icon="mdi-image-edit-outline"
    variant="flat"
    class="d-flex flex-column h-100"
  >
    <VCardText>
      <template v-for="control in adjustments" :key="control.key">
        <div class="d-flex align-center mb-1">
          <VIcon :icon="control.icon" size="small" class="mr-2" />
          <span class="text-body-2">{{ control.label }}</span>
        </div>
        <VSlider
          :model-value="editDocument.adjustments[control.key]"
          :min="0"
          :max="2"
          :step="0.01"
          :disabled="!hasImage"
          thumb-label
          class="mb-2"
          @start="editorStore.beginStroke()"
          @end="editorStore.endStroke()"
          @update:model-value="(value: number) => editorStore.setAdjustment(control.key, value)"
        />
      </template>

      <VDivider class="my-3" />

      <template v-for="filter in filters" :key="filter.key">
        <div class="d-flex align-center mb-1">
          <VIcon :icon="filter.icon" size="small" class="mr-2" />
          <span class="text-body-2">{{ filter.label }}</span>
        </div>
        <VSlider
          :model-value="editDocument.filters[filter.key]"
          :min="0"
          :max="1"
          :step="0.01"
          :disabled="!hasImage"
          thumb-label
          class="mb-2"
          @start="editorStore.beginStroke()"
          @end="editorStore.endStroke()"
          @update:model-value="(value: number) => editorStore.setFilter(filter.key, value)"
        />
      </template>

      <VDivider class="my-3" />

      <VBtn
        block
        variant="tonal"
        prepend-icon="mdi-file-import-outline"
        :disabled="!hasImage"
        @click="importDialog.open()"
      >
        Import settings from JSON
      </VBtn>

      <VAlert
        v-if="importError"
        type="error"
        variant="tonal"
        density="compact"
        closable
        class="mt-3"
        @click:close="importError = null"
      >
        {{ importError }}
      </VAlert>
    </VCardText>
  </VCard>
</template>
