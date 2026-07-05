import { beforeEach, describe, expect, test } from 'vitest'
import { defaultAppState } from '../data/defaultSetlist'
import { applyLegacy, loadState, saveState } from './storage'

beforeEach(() => localStorage.clear())

describe('applyLegacy', () => {
  test('mapeia os dados do protótipo (por nome) para ids por slug', () => {
    const state = applyLegacy(
      defaultAppState(),
      {
        Pipeline: { rating: 'solid', last: 123 },
        'Não Viva Em Vão': { rating: 'shaky', last: 456 },
      },
      null,
    )
    expect(state.practice['pipeline']).toEqual({ rating: 'solid', last: 123 })
    expect(state.practice['nao-viva-em-vao']).toEqual({ rating: 'shaky', last: 456 })
  })

  test('converte data antiga "YYYY-MM-DD" em ms', () => {
    const state = applyLegacy(defaultAppState(), { Pipeline: { rating: 'ok', last: '2026-07-01' } }, null)
    expect(state.practice['pipeline'].last).toBe(new Date(2026, 6, 1).getTime())
  })

  test('preserva o speed legado quando válido', () => {
    expect(applyLegacy(defaultAppState(), null, 12).speed).toBe(12)
    expect(applyLegacy(defaultAppState(), null, 0).speed).toBe(1)
    expect(applyLegacy(defaultAppState(), null, null).speed).toBe(1)
  })
})

describe('loadState / saveState', () => {
  test('sem dados, retorna o estado padrão (setlist CBJR)', () => {
    const state = loadState()
    expect(state.version).toBe(1)
    expect(state.activeSetlistId).toBe('cbjr')
    expect(state.setlists).toHaveLength(1)
    expect(state.setlists[0].songs).toHaveLength(38)
    expect(state.practice).toEqual({})
  })

  test('migra dados do protótipo na primeira carga', () => {
    localStorage.setItem('cbjr-setlist-health', JSON.stringify({ Pipeline: { rating: 'solid', last: 999 } }))
    localStorage.setItem('cbjr-setlist-speed', '5')
    const state = loadState()
    expect(state.practice['pipeline']).toEqual({ rating: 'solid', last: 999 })
    expect(state.speed).toBe(5)
  })

  test('faz round-trip pelo localStorage', () => {
    const state = defaultAppState()
    state.practice['pipeline'] = { rating: 'ok', last: 42 }
    saveState(state)
    expect(loadState().practice['pipeline']).toEqual({ rating: 'ok', last: 42 })
  })
})
