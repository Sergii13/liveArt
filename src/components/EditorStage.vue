<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { onKeyStroke, useFileDialog } from '@vueuse/core'
import { useEditorStore } from '../stores/editor'
import { useNotificationStore } from '../stores/notification'
import { useExport } from '../composables/useExport'
import { useLoadImageFile } from '../composables/useLoadImageFile'
import { useCroppedPreview } from '../composables/useCroppedPreview'
import ImageUploader from './ImageUploader.vue'
import CropStage from './CropStage.vue'

const editorStore = useEditorStore()
const { source, editDocument, hasImage, isModified, filterString, canUndo, canRedo } =
  storeToRefs(editorStore)
const { notify } = useNotificationStore()
const { exportImage, exportJson, isExporting } = useExport()
const { loadImageFile } = useLoadImageFile()
const { previewSrc } = useCroppedPreview()
const changeImageDialog = useFileDialog({ accept: 'image/*', multiple: false, reset: true })

const isCropping = ref(false)
const cropStageRef = ref<InstanceType<typeof CropStage> | null>(null)
const zoom = ref<number | null>(null)

const ZOOM_STEP = 1.25
const ZOOM_MIN = 0.1
const ZOOM_MAX = 8

const baseWidth = computed(
  () => editDocument.value.crop?.width ?? source.value?.width ?? 0,
)
const zoomedWidth = computed(() =>
  zoom.value === null ? 0 : Math.round(baseWidth.value * zoom.value),
)
const zoomLabel = computed(() =>
  zoom.value === null ? 'Fit' : `${Math.round(zoom.value * 100)}%`,
)

watch(() => previewSrc.value, zoomFit)

onKeyStroke(['z', 'Z'], (event) => {
  if (!(event.ctrlKey || event.metaKey) || isCropping.value) {
    return
  }
  event.preventDefault()
  if (event.shiftKey) {
    editorStore.redo()
  } else {
    editorStore.undo()
  }
})

changeImageDialog.onChange((files) => {
  const file = files?.[0]
  if (!file) {
    return
  }
  loadImageFile(file)
})

function zoomBy(factor: number) {
  const next = (zoom.value ?? 1) * factor
  zoom.value = Math.min(Math.max(next, ZOOM_MIN), ZOOM_MAX)
}

function zoomFit() {
  zoom.value = null
}

function onWheel(event: WheelEvent) {
  zoomBy(event.deltaY < 0 ? 1.1 : 1 / 1.1)
}

function applyCrop() {
  const rect = cropStageRef.value?.getCropRect()
  if (rect) {
    editorStore.setCrop(rect)
    notify('Crop applied', 'success')
  }
  isCropping.value = false
}
</script>

<template>
  <VCard
    variant="outlined"
    class="d-flex flex-column flex-grow-1"
    style="min-height: 400px"
  >
    <VCardText
      class="flex-grow-1 d-flex align-center justify-center pa-4"
      style="min-height: 0; overflow: hidden"
    >
      <ImageUploader v-if="!hasImage" />
      <CropStage v-else-if="isCropping" ref="cropStageRef" />
      <div
        v-else
        class="position-relative w-100 h-100 d-flex"
        style="min-height: 0"
        @wheel.prevent="onWheel"
      >
        <VImg
          v-if="zoom === null"
          :src="previewSrc ?? undefined"
          :style="{ filter: filterString }"
          class="w-100 h-100"
        />
        <div v-else class="w-100 h-100 overflow-auto d-flex">
          <img
            :src="previewSrc ?? undefined"
            :style="{ filter: filterString, width: `${zoomedWidth}px`, maxWidth: 'none' }"
            class="ma-auto d-block"
            alt="Preview"
          />
        </div>

        <VBtnGroup
          density="compact"
          variant="elevated"
          class="position-absolute"
          style="top: 8px; right: 8px"
        >
          <VBtn icon="mdi-magnify-minus-outline" @click="zoomBy(1 / ZOOM_STEP)" />
          <VBtn min-width="64" @click="zoomFit">{{ zoomLabel }}</VBtn>
          <VBtn icon="mdi-magnify-plus-outline" @click="zoomBy(ZOOM_STEP)" />
        </VBtnGroup>
      </div>
    </VCardText>

    <template v-if="hasImage">
      <VDivider />

      <VCardActions v-if="isCropping" class="px-4 py-2 justify-end">
        <VTooltip text="Cancel" location="top">
          <template #activator="{ props }">
            <VBtn v-bind="props" icon="mdi-close" variant="text" @click="isCropping = false" />
          </template>
        </VTooltip>
        <VTooltip text="Apply crop" location="top">
          <template #activator="{ props }">
            <VBtn v-bind="props" icon="mdi-check" color="primary" variant="tonal" @click="applyCrop" />
          </template>
        </VTooltip>
      </VCardActions>

      <VCardActions v-else class="px-4 py-2 flex-nowrap" style="overflow-x: auto">
        <VTooltip text="Change image" location="top">
          <template #activator="{ props }">
            <VBtn v-bind="props" icon="mdi-image-refresh-outline" variant="text" @click="changeImageDialog.open()" />
          </template>
        </VTooltip>
        <VTooltip text="Crop" location="top">
          <template #activator="{ props }">
            <VBtn v-bind="props" icon="mdi-crop" variant="text" @click="isCropping = true" />
          </template>
        </VTooltip>
        <VSpacer />
        <VTooltip text="Undo (Ctrl+Z)" location="top">
          <template #activator="{ props }">
            <VBtn v-bind="props" icon="mdi-undo" variant="text" :disabled="!canUndo" @click="editorStore.undo()" />
          </template>
        </VTooltip>
        <VTooltip text="Redo (Ctrl+Shift+Z)" location="top">
          <template #activator="{ props }">
            <VBtn v-bind="props" icon="mdi-redo" variant="text" :disabled="!canRedo" @click="editorStore.redo()" />
          </template>
        </VTooltip>
        <VTooltip text="Reset / view original" location="top">
          <template #activator="{ props }">
            <VBtn
              v-bind="props"
              icon="mdi-restore"
              variant="text"
              :disabled="!isModified"
              @click="editorStore.reset()"
            />
          </template>
        </VTooltip>
        <VTooltip text="Export JSON" location="top">
          <template #activator="{ props }">
            <VBtn v-bind="props" icon="mdi-code-json" variant="text" @click="exportJson()" />
          </template>
        </VTooltip>
        <VTooltip text="Export image" location="top">
          <template #activator="{ props }">
            <VBtn
              v-bind="props"
              icon="mdi-download"
              color="primary"
              variant="tonal"
              :loading="isExporting"
              @click="exportImage()"
            />
          </template>
        </VTooltip>
      </VCardActions>
    </template>
  </VCard>
</template>
