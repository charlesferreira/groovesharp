import type { PracticeEntry, Song } from '../types'
import { health, needsAttention } from './health'

export type SortMode = 'setlist' | 'priority'

export interface SongRow {
  song: Song
  entry: PracticeEntry | undefined
  health: number | null
}

/** Monta as linhas com a saúde calculada para o "agora" e a escala de tempo. */
export function buildRows(
  songs: Song[],
  practice: Record<string, PracticeEntry>,
  nowMs: number,
  speed: number,
): SongRow[] {
  return songs.map((song) => {
    const entry = practice[song.id]
    return { song, entry, health: health(entry, nowMs, speed) }
  })
}

/**
 * Ordena as linhas. "setlist" mantém a ordem original; "priority" coloca as mais
 * críticas (e as nunca praticadas) no topo. Estável para empates.
 */
export function sortRows(rows: SongRow[], mode: SortMode): SongRow[] {
  if (mode === 'setlist') return rows
  const value = (h: number | null) => (h == null ? -1 : h)
  return [...rows].sort((a, b) => value(a.health) - value(b.health))
}

/** Filtra por texto no título (sem acento/caixa). */
export function filterRows(rows: SongRow[], query: string): SongRow[] {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((r) => r.song.title.toLowerCase().includes(q))
}

export interface Summary {
  /** Saúde média do setlist (0..100); nunca praticada conta como 0. */
  avg: number
  /** Quantas músicas precisam de atenção (críticas ou nunca praticadas). */
  attention: number
}

export function summarize(rows: SongRow[]): Summary {
  if (rows.length === 0) return { avg: 0, attention: 0 }
  let sum = 0
  let attention = 0
  for (const r of rows) {
    sum += r.health ?? 0
    if (needsAttention(r.health)) attention++
  }
  return { avg: sum / rows.length, attention }
}
