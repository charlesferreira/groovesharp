import { describe, expect, test } from 'vitest'
import { defaultAppState } from '../data/defaultSetlist'
import type { AppState, Song } from '../types'
import { reducer } from './appReducer'

function song(id: string): Song {
  return { id, title: id, artist: 'Teste', duration: '3:00' }
}

function base(): AppState {
  return defaultAppState()
}

describe('prática', () => {
  test('rate grava avaliação e data', () => {
    const s = reducer(base(), { type: 'rate', songId: 'pipeline', rating: 'solid', now: 123 })
    expect(s.practice['pipeline']).toEqual({ rating: 'solid', last: 123 })
  })

  test('clearRating remove o registro', () => {
    let s = reducer(base(), { type: 'rate', songId: 'pipeline', rating: 'ok', now: 1 })
    s = reducer(s, { type: 'clearRating', songId: 'pipeline' })
    expect(s.practice['pipeline']).toBeUndefined()
  })

  test('resetPractice zera tudo', () => {
    let s = reducer(base(), { type: 'rate', songId: 'pipeline', rating: 'ok', now: 1 })
    s = reducer(s, { type: 'resetPractice' })
    expect(s.practice).toEqual({})
  })
})

describe('setlists', () => {
  test('addSetlist cria e ativa', () => {
    const s = reducer(base(), { type: 'addSetlist', id: 'x', name: 'Novo' })
    expect(s.setlists).toHaveLength(2)
    expect(s.activeSetlistId).toBe('x')
    expect(s.setlists[1]).toEqual({ id: 'x', name: 'Novo', songs: [] })
  })

  test('renameSetlist muda o nome', () => {
    const s = reducer(base(), { type: 'renameSetlist', id: 'cbjr', name: 'CBJR 2026' })
    expect(s.setlists[0].name).toBe('CBJR 2026')
  })

  test('deleteSetlist remove, troca o ativo e limpa a prática das músicas', () => {
    let s = reducer(base(), { type: 'rate', songId: 'pipeline', rating: 'solid', now: 1 })
    s = reducer(s, { type: 'addSetlist', id: 'x', name: 'Outro' }) // ativo vira x
    s = reducer(s, { type: 'deleteSetlist', id: 'cbjr' })
    expect(s.setlists.map((sl) => sl.id)).toEqual(['x'])
    expect(s.activeSetlistId).toBe('x')
    expect(s.practice['pipeline']).toBeUndefined() // prática das músicas do setlist some
  })

  test('deleteSetlist não deixa o app sem setlists', () => {
    const s = reducer(base(), { type: 'deleteSetlist', id: 'cbjr' })
    expect(s.setlists).toHaveLength(1)
  })
})

describe('músicas', () => {
  test('addSong adiciona ao setlist', () => {
    const s = reducer(base(), { type: 'addSong', setlistId: 'cbjr', song: song('nova') })
    expect(s.setlists[0].songs.at(-1)?.id).toBe('nova')
  })

  test('updateSong aplica o patch', () => {
    const s = reducer(base(), {
      type: 'updateSong',
      setlistId: 'cbjr',
      songId: 'pipeline',
      patch: { bpm: 140, key: 'E' },
    })
    const updated = s.setlists[0].songs.find((x) => x.id === 'pipeline')
    expect(updated?.bpm).toBe(140)
    expect(updated?.key).toBe('E')
  })

  test('removeSong tira do setlist e limpa a prática', () => {
    let s = reducer(base(), { type: 'rate', songId: 'pipeline', rating: 'ok', now: 1 })
    s = reducer(s, { type: 'removeSong', setlistId: 'cbjr', songId: 'pipeline' })
    expect(s.setlists[0].songs.some((x) => x.id === 'pipeline')).toBe(false)
    expect(s.practice['pipeline']).toBeUndefined()
  })
})
