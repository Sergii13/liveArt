import {
  DEFAULT_ADJUSTMENTS,
  DEFAULT_FILTERS,
  EDIT_DOCUMENT_VERSION,
} from '../constants/editDocument'
import type { CropRect, EditDocument, SettingsFile } from '../schemas/editDocument'

export function createEmptyEditDocument(): EditDocument {
  return {
    version: EDIT_DOCUMENT_VERSION,
    crop: null,
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    filters: { ...DEFAULT_FILTERS },
  }
}

export function documentFromSettingsFile(file: SettingsFile): EditDocument {
  return {
    version: file.version,
    crop: file.operations.crop,
    adjustments: file.operations.adjustments,
    filters: file.operations.filters,
  }
}

export function clampCropToImage(
  crop: CropRect | null,
  imageWidth: number,
  imageHeight: number,
): CropRect | null {
  if (!crop) {
    return null
  }

  const x = Math.min(Math.max(Math.round(crop.x), 0), imageWidth)
  const y = Math.min(Math.max(Math.round(crop.y), 0), imageHeight)
  const width = Math.min(Math.round(crop.width), imageWidth - x)
  const height = Math.min(Math.round(crop.height), imageHeight - y)

  if (width <= 0 || height <= 0) {
    return null
  }
  return { x, y, width, height }
}
