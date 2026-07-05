import { useBase64 } from '@vueuse/core'
import { useEditorStore } from '../stores/editor'
import { SVG_RASTER_TARGET } from '../constants/image'
import { loadImage, rasterizeToPng } from '../utils/image'

export function useLoadImageFile() {
  const editorStore = useEditorStore()

  async function loadImageFile(file: File) {
    const dataUrl = await useBase64(file).promise.value
    const probe = await loadImage(dataUrl)
    const source =
      file.type === 'image/svg+xml'
        ? rasterizeToPng(probe, SVG_RASTER_TARGET)
        : { src: dataUrl, width: probe.naturalWidth, height: probe.naturalHeight }

    editorStore.loadImage({ ...source, name: file.name })
  }

  return { loadImageFile }
}
