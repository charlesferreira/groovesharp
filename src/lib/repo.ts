import type { AppState, Rating, Setlist, Song } from '../types'
import { mapPractice, mapSetlists } from './cloudMap'
import type { Json } from './database.types'
import { supabase } from './supabase'

function client() {
  if (!supabase) throw new Error('Supabase não configurado')
  return supabase
}

export interface BandSummary {
  id: string
  name: string
  role: 'admin' | 'member'
}

/** Bandas das quais o usuário é membro. */
export async function listMyBands(): Promise<BandSummary[]> {
  const { data, error } = await client()
    .from('band_members')
    .select('role, bands(id, name)')
    .order('joined_at', { ascending: true })
  if (error) throw error
  return (data ?? [])
    .filter((r) => r.bands)
    .map((r) => ({ id: r.bands!.id, name: r.bands!.name, role: r.role }))
}

/** Cria uma banda (via RPC) e retorna o resumo. */
export async function createBand(name: string): Promise<BandSummary> {
  const { data, error } = await client().rpc('create_band', { _name: name })
  if (error) throw error
  const band = data as { id: string; name: string }
  return { id: band.id, name: band.name, role: 'admin' }
}

export interface BandData {
  setlists: Setlist[]
  practice: Record<string, { rating: Rating; last: number }>
}

/** Carrega tudo de uma banda no formato que a tela de prática consome. */
export async function getBandData(bandId: string, userId: string): Promise<BandData> {
  const sb = client()
  const [setlistsRes, songsRes] = await Promise.all([
    sb.from('setlists').select('*').eq('band_id', bandId),
    sb.from('songs').select('*').eq('band_id', bandId),
  ])
  if (setlistsRes.error) throw setlistsRes.error
  if (songsRes.error) throw songsRes.error

  const setlistIds = (setlistsRes.data ?? []).map((s) => s.id)
  const linksRes = setlistIds.length
    ? await sb.from('setlist_songs').select('*').in('setlist_id', setlistIds)
    : { data: [], error: null }
  if (linksRes.error) throw linksRes.error

  const practiceRes = await sb.from('practice_entries').select('*').eq('user_id', userId)
  if (practiceRes.error) throw practiceRes.error

  return {
    setlists: mapSetlists(setlistsRes.data ?? [], songsRes.data ?? [], linksRes.data ?? []),
    practice: mapPractice(practiceRes.data ?? [], userId),
  }
}

// ---------- setlists ----------
export async function addSetlist(bandId: string, name: string): Promise<string> {
  const sb = client()
  const { count } = await sb
    .from('setlists')
    .select('*', { count: 'exact', head: true })
    .eq('band_id', bandId)
  const { data, error } = await sb
    .from('setlists')
    .insert({ band_id: bandId, name, position: count ?? 0 })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function renameSetlist(id: string, name: string): Promise<void> {
  const { error } = await client().from('setlists').update({ name }).eq('id', id)
  if (error) throw error
}

export async function deleteSetlist(id: string): Promise<void> {
  const { error } = await client().from('setlists').delete().eq('id', id)
  if (error) throw error
}

export async function setShowDate(id: string, date: string | undefined): Promise<void> {
  const { error } = await client()
    .from('setlists')
    .update({ show_date: date ?? null })
    .eq('id', id)
  if (error) throw error
}

// ---------- songs ----------
type SongInput = Omit<Song, 'id'>

function songColumns(data: Partial<SongInput>) {
  return {
    title: data.title,
    artist: data.artist,
    duration: data.duration,
    key: data.key ?? null,
    bpm: data.bpm ?? null,
    tuning: data.tuning ?? null,
    notes: data.notes ?? null,
    links: (data.links ?? []) as unknown as Json,
  }
}

/** Cria a música no repertório da banda e a vincula ao setlist. */
export async function addSong(
  bandId: string,
  setlistId: string,
  data: SongInput,
  addedBy: string,
): Promise<string> {
  const sb = client()
  const { data: song, error } = await sb
    .from('songs')
    .insert({
      band_id: bandId,
      added_by: addedBy,
      title: data.title,
      artist: data.artist,
      duration: data.duration,
      key: data.key ?? null,
      bpm: data.bpm ?? null,
      tuning: data.tuning ?? null,
      notes: data.notes ?? null,
      links: (data.links ?? []) as unknown as Json,
    })
    .select('id')
    .single()
  if (error) throw error

  const { count } = await sb
    .from('setlist_songs')
    .select('*', { count: 'exact', head: true })
    .eq('setlist_id', setlistId)
  const { error: linkErr } = await sb
    .from('setlist_songs')
    .insert({ setlist_id: setlistId, song_id: song.id, position: count ?? 0 })
  if (linkErr) throw linkErr
  return song.id
}

export async function updateSong(songId: string, patch: Partial<SongInput>): Promise<void> {
  const { error } = await client().from('songs').update(songColumns(patch)).eq('id', songId)
  if (error) throw error
}

export async function removeSong(songId: string): Promise<void> {
  // apaga a música do repertório (cascata remove vínculos e prática)
  const { error } = await client().from('songs').delete().eq('id', songId)
  if (error) throw error
}

// ---------- prática ----------
export async function ratePractice(
  songId: string,
  rating: Rating,
  userId: string,
  at?: number,
): Promise<void> {
  const { error } = await client()
    .from('practice_entries')
    .upsert({
      user_id: userId,
      song_id: songId,
      rating,
      last_practiced_at: new Date(at ?? Date.now()).toISOString(),
    })
  if (error) throw error
}

export async function clearPractice(songId: string, userId: string): Promise<void> {
  const { error } = await client()
    .from('practice_entries')
    .delete()
    .eq('user_id', userId)
    .eq('song_id', songId)
  if (error) throw error
}

/** Importa setlists, músicas e prática do modo local para uma banda na nuvem. */
export async function importLocalData(
  bandId: string,
  local: AppState,
  userId: string,
): Promise<void> {
  for (const setlist of local.setlists) {
    const setlistId = await addSetlist(bandId, setlist.name)
    if (setlist.showDate) await setShowDate(setlistId, setlist.showDate)
    for (const song of setlist.songs) {
      const newId = await addSong(
        bandId,
        setlistId,
        {
          title: song.title,
          artist: song.artist,
          duration: song.duration,
          key: song.key,
          bpm: song.bpm,
          tuning: song.tuning,
          notes: song.notes,
          links: song.links,
        },
        userId,
      )
      const entry = local.practice[song.id]
      if (entry) await ratePractice(newId, entry.rating, userId, entry.last)
    }
  }
}

/** Zera a prática do usuário para um conjunto de músicas (ex.: as da banda ativa). */
export async function resetPractice(songIds: string[], userId: string): Promise<void> {
  if (songIds.length === 0) return
  const { error } = await client()
    .from('practice_entries')
    .delete()
    .eq('user_id', userId)
    .in('song_id', songIds)
  if (error) throw error
}
