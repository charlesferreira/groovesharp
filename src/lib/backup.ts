import type { AppState } from '../types'

/** Validação leve do formato do backup antes de aplicar. */
export function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    Array.isArray(v.setlists) &&
    typeof v.activeSetlistId === 'string' &&
    typeof v.practice === 'object' &&
    v.practice !== null &&
    typeof v.speed === 'number' &&
    typeof v.version === 'number'
  )
}

export function serializeBackup(state: AppState): string {
  return JSON.stringify(state, null, 2)
}

export function parseBackup(text: string): AppState | null {
  try {
    const parsed: unknown = JSON.parse(text)
    return isAppState(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** Dispara o download do backup como arquivo .json. */
export function downloadBackup(state: AppState, filename = 'groovesharp-backup.json'): void {
  const blob = new Blob([serializeBackup(state)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
