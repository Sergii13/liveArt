export interface RasterizedImage {
  src: string
  width: number
  height: number
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

export function rasterizeToPng(image: HTMLImageElement, targetMax: number): RasterizedImage {
  const naturalWidth = image.naturalWidth || targetMax
  const naturalHeight = image.naturalHeight || targetMax
  const scale = Math.max(1, targetMax / Math.max(naturalWidth, naturalHeight))
  const width = Math.round(naturalWidth * scale)
  const height = Math.round(naturalHeight * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return { src: image.src, width: naturalWidth, height: naturalHeight }
  }

  ctx.drawImage(image, 0, 0, width, height)
  return { src: canvas.toDataURL('image/png'), width, height }
}
