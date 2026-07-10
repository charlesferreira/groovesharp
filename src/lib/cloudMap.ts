import type { PracticeEntry, Setlist, Song, SongLink } from '../types'
import type { Database } from './database.types'

type SongRow = Database['public']['Tables']['songs']['Row']
type SetlistRow = Database['public']['Tables']['setlists']['Row']
type SetlistSongRow = Database['public']['Tables']['setlist_songs']['Row']
type PracticeRow = Database['public']['Tables']['practice_entries']['Row']

/** Linha de música (nuvem) → Song (UI). */
export function mapSong(row: SongRow): Song {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    duration: row.duration,
    key: row.key ?? undefined,
    bpm: row.bpm ?? undefined,
    tuning: row.tuning ?? undefined,
    notes: row.notes ?? undefined,
    links: Array.isArray(row.links) ? (row.links as unknown as SongLink[]) : undefined,
  }
}

/** Monta os setlists da UI (com músicas embutidas) a partir das linhas da nuvem. */
export function mapSetlists(
  setlistRows: SetlistRow[],
  songRows: SongRow[],
  linkRows: SetlistSongRow[],
): Setlist[] {
  const songById = new Map(songRows.map((s) => [s.id, mapSong(s)]))
  const linksBySetlist = new Map<string, SetlistSongRow[]>()
  for (const link of linkRows) {
    const arr = linksBySetlist.get(link.setlist_id) ?? []
    arr.push(link)
    linksBySetlist.set(link.setlist_id, arr)
  }
  return [...setlistRows]
    .sort((a, b) => a.position - b.position)
    .map((sl) => {
      const links = (linksBySetlist.get(sl.id) ?? []).slice().sort((a, b) => a.position - b.position)
      const songs = links.map((l) => songById.get(l.song_id)).filter((s): s is Song => !!s)
      return { id: sl.id, name: sl.name, showDate: sl.show_date ?? undefined, songs }
    })
}

/** Linhas de prática → mapa por música, só a do usuário informado. */
export function mapPractice(rows: PracticeRow[], userId: string): Record<string, PracticeEntry> {
  const out: Record<string, PracticeEntry> = {}
  for (const r of rows) {
    if (r.user_id !== userId) continue
    out[r.song_id] = { rating: r.rating, last: Date.parse(r.last_practiced_at) }
  }
  return out
}
