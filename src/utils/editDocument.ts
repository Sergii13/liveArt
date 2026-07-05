import {
  DEFAULT_ADJUSTMENTS,
  DEFAULT_FILTERS,
  EDIT_DOCUMENT_VERSION,
} from '../constants/editDocument'
import type { EditDocument, SettingsFile } from '../schemas/editDocument'

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
