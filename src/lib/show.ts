import type { PracticeEntry, Song } from '../types'
import { GREEN_THRESHOLD } from './health'
import { buildRows, summarize, type SongRow } from './setlist'

const MS_PER_DAY = 86_400_000

/** ms no início (meia-noite) do dia informado em "YYYY-MM-DD". */
export function showMs(showDate: string): number {
  const [y, m, d] = showDate.split('-').map(Number)
  const dt = new Date(y, (m || 1) - 1, d || 1)
  dt.setHours(0, 0, 0, 0)
  return dt.getTime()
}

/** Dias até o show a partir de um "agora" (arredondado por dia de calendário). */
export function daysUntil(showDate: string, nowMs: number): number {
  const now = new Date(nowMs)
  now.setHours(0, 0, 0, 0)
  return Math.round((showMs(showDate) - now.getTime()) / MS_PER_DAY)
}

export interface Readiness {
  /** Saúde média projetada para o dia do show (0..100), sem novos treinos. */
  avg: number
  /** Músicas que estarão fora do verde no show (as que precisam de reforço), piores primeiro. */
  atRisk: SongRow[]
}

/**
 * Projeta a saúde de cada música para o dia do show (sem novos treinos) e diz
 * quão pronto o setlist estará e o que reforçar. A projeção usa o tempo real
 * (speed = 1), independente da escala de visualização.
 */
export function showReadiness(
  songs: Song[],
  practice: Record<string, PracticeEntry>,
  showDate: string,
): Readiness {
  const rows = buildRows(songs, practice, showMs(showDate), 1)
  const atRisk = rows
    .filter((r) => r.health == null || r.health < GREEN_THRESHOLD)
    .sort((a, b) => (a.health ?? -1) - (b.health ?? -1))
  return { avg: summarize(rows).avg, atRisk }
}
