import { describe, expect, test } from 'vitest'
import { mapPractice, mapSetlists, mapSong } from './cloudMap'
import type { Database } from './database.types'

type SongRow = Database['public']['Tables']['songs']['Row']
type SetlistRow = Database['public']['Tables']['setlists']['Row']
type SetlistSongRow = Database['public']['Tables']['setlist_songs']['Row']
type PracticeRow = Database['public']['Tables']['practice_entries']['Row']

function songRow(id: string, over: Partial<SongRow> = {}): SongRow {
  return {
    id,
    band_id: 'b1',
    title: id,
    artist: 'CBJR',
    duration: '3:00',
    key: null,
    bpm: null,
    tuning: null,
    notes: null,
    links: [],
    added_by: null,
    created_at: '2026-01-01T00:00:00Z',
    ...over,
  }
}

describe('mapSong', () => {
  test('converte colunas nulas para undefined e lê links', () => {
    const s = mapSong(songRow('a', { key: 'Em', bpm: 140, links: [{ label: 'YT', url: 'http://y' }] }))
    expect(s).toMatchObject({ id: 'a', key: 'Em', bpm: 140 })
    expect(s.tuning).toBeUndefined()
    expect(s.links).toEqual([{ label: 'YT', url: 'http://y' }])
  })
})

describe('mapSetlists', () => {
  test('embute as músicas na ordem do setlist_songs', () => {
    const setlists: SetlistRow[] = [
      { id: 'sl1', band_id: 'b1', name: 'Show', show_date: '2026-12-31', position: 0, created_by: null, created_at: '' },
    ]
    const songs = [songRow('s1', { title: 'Um' }), songRow('s2', { title: 'Dois' })]
    const links: SetlistSongRow[] = [
      { setlist_id: 'sl1', song_id: 's2', position: 0 },
      { setlist_id: 'sl1', song_id: 's1', position: 1 },
    ]
    const result = mapSetlists(setlists, songs, links)
    expect(result[0].name).toBe('Show')
    expect(result[0].showDate).toBe('2026-12-31')
    expect(result[0].songs.map((s) => s.title)).toEqual(['Dois', 'Um'])
  })
})

describe('mapPractice', () => {
  test('mantém só a prática do usuário e converte a data em ms', () => {
    const rows: PracticeRow[] = [
      { user_id: 'me', song_id: 's1', rating: 'solid', last_practiced_at: '2026-07-01T00:00:00Z' },
      { user_id: 'other', song_id: 's1', rating: 'shaky', last_practiced_at: '2026-07-01T00:00:00Z' },
    ]
    const p = mapPractice(rows, 'me')
    expect(Object.keys(p)).toEqual(['s1'])
    expect(p['s1'].rating).toBe('solid')
    expect(p['s1'].last).toBe(Date.parse('2026-07-01T00:00:00Z'))
  })
})
