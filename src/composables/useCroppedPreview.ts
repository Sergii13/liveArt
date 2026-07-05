import { ref, watch } from 'vue'
import { useEditorStore } from '../stores/editor'
import { loadImage } from '../utils/image'

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

export function useCroppedPreview() {
  const editorStore = useEditorStore()
  const previewSrc = ref<string | null>(null)

  let requestId = 0
  let objectUrl: string | null = null

  function setPreview(src: string | null) {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrl = null
    }
    previewSrc.value = src
  }

  watch(
    [() => editorStore.source, () => editorStore.editDocument.crop],
    async ([source, crop]) => {
      const id = ++requestId

      if (!source) {
        setPreview(null)
        return
      }
      if (!crop) {
        setPreview(source.src)
        return
      }

      const image = await loadImage(source.src)
      if (id !== requestId) return

      const canvas = document.createElement('canvas')
      canvas.width = crop.width
      canvas.height = crop.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setPreview(source.src)
        return
      }
      ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)

      const blob = await canvasToBlob(canvas)
      if (id !== requestId) return
      if (!blob) {
        setPreview(source.src)
        return
      }

      const url = URL.createObjectURL(blob)
      setPreview(url)
      objectUrl = url
    },
    { immediate: true },
  )

  return { previewSrc }
}
