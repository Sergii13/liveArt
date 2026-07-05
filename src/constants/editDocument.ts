import type { Adjustments, FilterValues } from '../schemas/editDocument'

export const EDIT_DOCUMENT_VERSION = 1

export const HISTORY_LIMIT = 50

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 1,
  contrast: 1,
  saturation: 1,
}

export const DEFAULT_FILTERS: FilterValues = {
  grayscale: 0,
  sepia: 0,
}
