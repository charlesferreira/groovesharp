import type { AppState, PracticeEntry, Rating } from '../types'
import { defaultAppState, STATE_VERSION } from '../data/defaultSetlist'
import { slug } from './id'

const KEY = 'groovesharp-state'
const LEGACY_HEALTH_KEY = 'cbjr-setlist-health'
const LEGACY_SPEED_KEY = 'cbjr-setlist-speed'

/** Entrada do protótipo: last podia ser ms (number) ou "YYYY-MM-DD" (string). */
type LegacyEntry = { rating: Rating; last: number | string }

function dateStrToMs(value: number | string): number {
  if (typeof value === 'number') return value
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1).getTime()
}

/**
 * Aplica os dados do protótipo (chaveados por nome da música) sobre um estado base.
 * Os ids das músicas padrão são o slug do título, então o mapeamento é direto.
 * Função pura para ser testável sem localStorage.
 */
export function applyLegacy(
  base: AppState,
  legacyHealth: Record<string, LegacyEntry> | null,
  legacySpeed: number | null,
): AppState {
  const practice: Record<string, PracticeEntry> = { ...base.practice }
  if (legacyHealth) {
    for (const [name, entry] of Object.entries(legacyHealth)) {
      if (!entry || !entry.rating) continue
      practice[slug(name)] = { rating: entry.rating, last: dateStrToMs(entry.last) }
    }
  }
  return {
    ...base,
    practice,
    speed: legacySpeed && legacySpeed > 0 ? legacySpeed : base.speed,
  }
}

function readLegacy(): { health: Record<string, LegacyEntry> | null; speed: number | null } {
  let health: Record<string, LegacyEntry> | null = null
  let speed: number | null = null
  try {
    const h = localStorage.getItem(LEGACY_HEALTH_KEY)
    if (h) health = JSON.parse(h)
    const s = localStorage.getItem(LEGACY_SPEED_KEY)
    if (s) speed = parseFloat(s)
  } catch {
    /* ignora dados legados corrompidos */
  }
  return { health, speed }
}

/** Carrega o estado do localStorage, migrando do protótipo na primeira vez. */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      if (parsed && parsed.version === STATE_VERSION) return parsed
    }
  } catch {
    /* estado corrompido — recomeça do padrão */
  }
  const legacy = readLegacy()
  return applyLegacy(defaultAppState(), legacy.health, legacy.speed)
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* localStorage cheio/indisponível — ignora */
  }
}
