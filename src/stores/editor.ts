import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { cloneDeep, isEqual } from 'lodash-es'
import { HISTORY_LIMIT } from '../constants/editDocument'
import { createEmptyEditDocument } from '../utils/editDocument'
import type {
  Adjustments,
  CropRect,
  EditDocument,
  FilterValues,
} from '../schemas/editDocument'

export interface SourceImage {
  src: string
  name: string
  width: number
  height: number
}

export const useEditorStore = defineStore('editor', () => {
  const source = ref<SourceImage | null>(null)
  const editDocument = ref<EditDocument>(createEmptyEditDocument())
  const undoStack = ref<EditDocument[]>([])
  const redoStack = ref<EditDocument[]>([])

  let isStroking = false

  const hasImage = computed(() => source.value !== null)
  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)

  const filterString = computed(() => {
    const { brightness, contrast, saturation } = editDocument.value.adjustments
    const { grayscale, sepia } = editDocument.value.filters
    return [
      `brightness(${brightness})`,
      `contrast(${contrast})`,
      `saturate(${saturation})`,
      `grayscale(${grayscale})`,
      `sepia(${sepia})`,
    ].join(' ')
  })

  const isModified = computed(
    () => !isEqual(editDocument.value, createEmptyEditDocument()),
  )

  function snapshot() {
    undoStack.value.push(cloneDeep(editDocument.value))
    if (undoStack.value.length > HISTORY_LIMIT) {
      undoStack.value.shift()
    }
    redoStack.value = []
  }

  function beginStroke() {
    snapshot()
    isStroking = true
  }

  function endStroke() {
    isStroking = false
  }

  function undo() {
    const previous = undoStack.value.pop()
    if (!previous) {
      return
    }
    redoStack.value.push(cloneDeep(editDocument.value))
    editDocument.value = previous
  }

  function redo() {
    const next = redoStack.value.pop()
    if (!next) {
      return
    }
    undoStack.value.push(cloneDeep(editDocument.value))
    editDocument.value = next
  }

  function loadImage(image: SourceImage) {
    source.value = image
    editDocument.value = createEmptyEditDocument()
    undoStack.value = []
    redoStack.value = []
  }

  function setCrop(crop: CropRect | null) {
    snapshot()
    editDocument.value.crop = crop
  }

  function setAdjustment<K extends keyof Adjustments>(key: K, value: number) {
    if (!isStroking) {
      snapshot()
    }
    editDocument.value.adjustments[key] = value
  }

  function setFilter<K extends keyof FilterValues>(key: K, value: number) {
    if (!isStroking) {
      snapshot()
    }
    editDocument.value.filters[key] = value
  }

  function reset() {
    if (!isModified.value) {
      return
    }
    snapshot()
    editDocument.value = createEmptyEditDocument()
  }

  function clearImage() {
    source.value = null
    editDocument.value = createEmptyEditDocument()
    undoStack.value = []
    redoStack.value = []
  }

  function loadDocument(doc: EditDocument) {
    snapshot()
    editDocument.value = doc
  }

  return {
    source,
    editDocument,
    hasImage,
    canUndo,
    canRedo,
    filterString,
    isModified,
    beginStroke,
    endStroke,
    undo,
    redo,
    loadImage,
    setCrop,
    setAdjustment,
    setFilter,
    reset,
    clearImage,
    loadDocument,
  }
})
