import { describe, expect, test } from 'vitest'
import type { PracticeEntry, Song } from '../types'
import { daysUntil, showMs, showReadiness } from './show'

const DAY = 86_400_000

function song(id: string): Song {
  return { id, title: id, artist: 'Teste', duration: '3:00' }
}

describe('daysUntil', () => {
  test('conta dias de calendário até o show', () => {
    const now = showMs('2026-07-05') + 10 * 3_600_000 // meio do dia 05
    expect(daysUntil('2026-07-12', now)).toBe(7)
    expect(daysUntil('2026-07-05', now)).toBe(0)
    expect(daysUntil('2026-07-04', now)).toBe(-1)
  })
})

describe('showReadiness', () => {
  const songs = [song('a'), song('b'), song('c')]

  test('projeta a saúde para o dia do show e lista o que reforçar', () => {
    const show = '2026-07-31'
    const base = showMs(show)
    // a: solid treinada no dia do show → 100 (segura); b: shaky treinada 20d antes → crítica;
    // c: nunca praticada → em risco
    const practice: Record<string, PracticeEntry> = {
      a: { rating: 'solid', last: base },
      b: { rating: 'shaky', last: base - 20 * DAY },
    }
    const { avg, atRisk } = showReadiness(songs, practice, show)
    expect(avg).toBeGreaterThan(0)
    // b e c ficam fora do verde; a está segura
    expect(atRisk.map((r) => r.song.id)).toEqual(['c', 'b']) // nunca praticada (c) antes da crítica (b)
    expect(atRisk.some((r) => r.song.id === 'a')).toBe(false)
  })

  test('setlist todo saudável no show não tem risco', () => {
    const show = '2026-07-31'
    const base = showMs(show)
    const practice: Record<string, PracticeEntry> = {
      a: { rating: 'solid', last: base },
      b: { rating: 'solid', last: base },
      c: { rating: 'solid', last: base },
    }
    const { atRisk } = showReadiness(songs, practice, show)
    expect(atRisk).toHaveLength(0)
  })
})
