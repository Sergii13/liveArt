import { z } from 'zod'

export const cropRectSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
})

export const adjustmentsSchema = z.object({
  brightness: z.number().min(0).max(2),
  contrast: z.number().min(0).max(2),
  saturation: z.number().min(0).max(2),
})

export const filterValuesSchema = z.object({
  grayscale: z.number().min(0).max(1),
  sepia: z.number().min(0).max(1),
})

export const operationsSchema = z.object({
  crop: cropRectSchema.nullable(),
  adjustments: adjustmentsSchema,
  filters: filterValuesSchema,
})

export const editDocumentSchema = operationsSchema.extend({
  version: z.number(),
})

export const settingsFileSchema = z.object({
  version: z.number(),
  source: z
    .object({
      name: z.string(),
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  operations: operationsSchema,
})

export type CropRect = z.infer<typeof cropRectSchema>
export type Adjustments = z.infer<typeof adjustmentsSchema>
export type FilterValues = z.infer<typeof filterValuesSchema>
export type FilterName = keyof FilterValues
export type EditDocument = z.infer<typeof editDocumentSchema>
export type SettingsFile = z.infer<typeof settingsFileSchema>
