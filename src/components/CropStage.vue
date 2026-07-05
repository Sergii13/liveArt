<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import { useEditorStore } from '../stores/editor'
import type { CropRect } from '../schemas/editDocument'

const editorStore = useEditorStore()
const { source, editDocument } = storeToRefs(editorStore)

const imageRef = ref<HTMLImageElement | null>(null)
let cropper: Cropper | null = null

onMounted(() => {
  if (!imageRef.value) return
  cropper = new Cropper(imageRef.value, {
    viewMode: 1,
    autoCropArea: 1,
    background: false,
    ready() {
      const crop = editDocument.value.crop
      if (crop && cropper) {
        cropper.setData({ ...crop, rotate: 0, scaleX: 1, scaleY: 1 })
      }
    },
  })
})

onBeforeUnmount(() => {
  cropper?.destroy()
  cropper = null
})

function getCropRect(): CropRect | null {
  if (!cropper) return null
  const { x, y, width, height } = cropper.getData(true)
  return { x, y, width, height }
}

defineExpose({ getCropRect })
</script>

<template>
  <div
    class="w-100 h-100 d-flex align-center justify-center"
    style="min-height: 0; overflow: hidden"
  >
    <img
      ref="imageRef"
      :src="source?.src"
      alt="Crop source"
      style="display: block; max-width: 100%; max-height: 100%"
    />
  </div>
</template>
