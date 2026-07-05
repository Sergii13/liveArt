import { ref, watch } from 'vue'
import { useEditorStore } from '../stores/editor'
import { loadImage } from '../utils/image'

export function useCroppedPreview() {
  const editorStore = useEditorStore()
  const previewSrc = ref<string | null>(null)

  watch(
    [() => editorStore.source, () => editorStore.editDocument.crop],
    async ([source, crop]) => {
      if (!source) {
        previewSrc.value = null
        return
      }
      if (!crop) {
        previewSrc.value = source.src
        return
      }

      const image = await loadImage(source.src)
      const canvas = document.createElement('canvas')
      canvas.width = crop.width
      canvas.height = crop.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        previewSrc.value = source.src
        return
      }
      ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)
      previewSrc.value = canvas.toDataURL()
    },
    { immediate: true, deep: true },
  )

  return { previewSrc }
}
