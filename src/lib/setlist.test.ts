import { describe, expect, test } from 'vitest'
import type { PracticeEntry, Song } from '../types'
import { buildRows, filterRows, sortRows, summarize } from './setlist'

const NOW = 1_700_000_000_000
const DAY = 86_400_000

function song(id: string, title = id): Song {
  return { id, title, artist: 'Teste', duration: '3:00' }
}

const songs = [song('a', 'Alpha'), song('b', 'Bravo'), song('c', 'Charlie')]

function practice(days: Partial<Record<string, [PracticeEntry['rating'], number]>>): Record<string, PracticeEntry> {
  const out: Record<string, PracticeEntry> = {}
  for (const [id, v] of Object.entries(days)) {
    if (v) out[id] = { rating: v[0], last: NOW - v[1] * DAY }
  }
  return out
}

describe('buildRows', () => {
  test('calcula saúde e mantém a ordem', () => {
    const rows = buildRows(songs, practice({ a: ['solid', 0] }), NOW, 1)
    expect(rows.map((r) => r.song.id)).toEqual(['a', 'b', 'c'])
    expect(rows[0].health).toBeCloseTo(100)
    expect(rows[1].health).toBeNull()
  })
})

describe('sortRows', () => {
  test('setlist mantém a ordem original', () => {
    const rows = buildRows(songs, practice({ b: ['shaky', 10] }), NOW, 1)
    expect(sortRows(rows, 'setlist').map((r) => r.song.id)).toEqual(['a', 'b', 'c'])
  })

  test('priority coloca nunca-praticadas e críticas no topo', () => {
    // a: solid recente (saudável), b: shaky há 10d (crítica), c: nunca praticada
    const rows = buildRows(songs, practice({ a: ['solid', 0], b: ['shaky', 10] }), NOW, 1)
    const ids = sortRows(rows, 'priority').map((r) => r.song.id)
    expect(ids[0]).toBe('c') // nunca praticada primeiro
    expect(ids[1]).toBe('b') // depois a crítica
    expect(ids[2]).toBe('a') // saudável por último
  })
})

describe('filterRows', () => {
  test('filtra por título ignorando caixa', () => {
    const rows = buildRows(songs, {}, NOW, 1)
    expect(filterRows(rows, 'bra').map((r) => r.song.id)).toEqual(['b'])
    expect(filterRows(rows, '')).toHaveLength(3)
  })
})

describe('summarize', () => {
  test('média e contagem de atenção', () => {
    const rows = buildRows(songs, practice({ a: ['solid', 0] }), NOW, 1)
    const { avg, attention } = summarize(rows)
    // a=100, b=0 (nunca), c=0 (nunca) → média 33.3
    expect(avg).toBeCloseTo(100 / 3)
    expect(attention).toBe(2) // b e c nunca praticadas
  })
})
