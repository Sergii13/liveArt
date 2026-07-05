import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { isEqual } from 'lodash-es'
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

  const hasImage = computed(() => source.value !== null)

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

  function loadImage(image: SourceImage) {
    source.value = image
    editDocument.value = createEmptyEditDocument()
  }

  function setCrop(crop: CropRect | null) {
    editDocument.value.crop = crop
  }

  function setAdjustment<K extends keyof Adjustments>(key: K, value: number) {
    editDocument.value.adjustments[key] = value
  }

  function setFilter<K extends keyof FilterValues>(key: K, value: number) {
    editDocument.value.filters[key] = value
  }

  function reset() {
    editDocument.value = createEmptyEditDocument()
  }

  function clearImage() {
    source.value = null
    reset()
  }

  function loadDocument(doc: EditDocument) {
    editDocument.value = doc
  }

  return {
    source,
    editDocument,
    hasImage,
    filterString,
    isModified,
    loadImage,
    setCrop,
    setAdjustment,
    setFilter,
    reset,
    clearImage,
    loadDocument,
  }
})
