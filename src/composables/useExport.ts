import { ref } from 'vue'
import { useEditorStore } from '../stores/editor'
import { loadImage } from '../utils/image'

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type))
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

function stripExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(0, dot) : name
}

export function useExport() {
  const editorStore = useEditorStore()
  const isExporting = ref(false)

  async function renderCanvas(): Promise<HTMLCanvasElement | null> {
    const source = editorStore.source
    if (!source) return null

    const image = await loadImage(source.src)
    const crop = editorStore.editDocument.crop
    const sx = crop ? crop.x : 0
    const sy = crop ? crop.y : 0
    const sw = crop ? crop.width : image.naturalWidth
    const sh = crop ? crop.height : image.naturalHeight

    const canvas = document.createElement('canvas')
    canvas.width = sw
    canvas.height = sh

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.filter = editorStore.filterString
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh)
    return canvas
  }

  async function exportImage() {
    const source = editorStore.source
    if (!source) return

    isExporting.value = true
    try {
      const canvas = await renderCanvas()
      if (!canvas) return
      const blob = await canvasToBlob(canvas, 'image/png')
      if (!blob) return
      downloadBlob(blob, `${stripExtension(source.name)}.png`)
    } finally {
      isExporting.value = false
    }
  }

  function exportJson() {
    const source = editorStore.source
    if (!source) return

    const payload = {
      version: editorStore.editDocument.version,
      source: {
        name: source.name,
        width: source.width,
        height: source.height,
      },
      operations: {
        crop: editorStore.editDocument.crop,
        adjustments: editorStore.editDocument.adjustments,
        filters: editorStore.editDocument.filters,
      },
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    downloadBlob(blob, `${stripExtension(source.name)}.json`)
  }

  return { exportImage, exportJson, isExporting }
}
