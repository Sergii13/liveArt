import { useEditorStore } from '../stores/editor'
import { settingsFileSchema } from '../schemas/editDocument'
import { documentFromSettingsFile } from '../utils/editDocument'

export type ImportResult = { ok: true } | { ok: false; error: string }

export function useImport() {
  const editorStore = useEditorStore()

  function importSettings(file: File): Promise<ImportResult> {
    return new Promise((resolve) => {
      const reader = new FileReader()

      reader.onerror = () => resolve({ ok: false, error: 'Could not read file' })

      reader.onload = () => {
        let raw: unknown
        try {
          raw = JSON.parse(reader.result as string)
        } catch {
          resolve({ ok: false, error: 'File is not valid JSON' })
          return
        }

        const parsed = settingsFileSchema.safeParse(raw)
        if (!parsed.success) {
          const detail = parsed.error.issues
            .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
            .join('; ')
          resolve({ ok: false, error: `Invalid settings file — ${detail}` })
          return
        }

        editorStore.loadDocument(documentFromSettingsFile(parsed.data))
        resolve({ ok: true })
      }

      reader.readAsText(file)
    })
  }

  return { importSettings }
}
