import type { Song } from '../types'

const SONGSTERR_SEARCH = 'https://www.songsterr.com/?pattern='

/** URL de busca da partitura no Songsterr a partir de artista + título. */
export function songsterrUrl(artist: string, title: string): string {
  return SONGSTERR_SEARCH + encodeURIComponent(`${artist} ${title}`.trim())
}

/** Link principal ao tocar na música: primeiro link customizado, ou a busca no Songsterr. */
export function primaryLink(song: Song): string {
  return song.links?.[0]?.url ?? songsterrUrl(song.artist, song.title)
}
