import type { AppState, Rating, Song } from '../types'

/**
 * Interface comum de estado + ações que a tela de prática consome.
 * Implementada tanto pelo modo local (useAppState) quanto pelo nuvem (useCloudState).
 */
export interface AppStore {
  state: AppState
  rate: (songId: string, rating: Rating) => void
  clearRating: (songId: string) => void
  setSpeed: (speed: number) => void
  resetPractice: () => void
  addSetlist: (name: string) => void
  renameSetlist: (id: string, name: string) => void
  deleteSetlist: (id: string) => void
  setActiveSetlist: (id: string) => void
  addSong: (setlistId: string, data: Omit<Song, 'id'>) => void
  updateSong: (setlistId: string, songId: string, patch: Partial<Song>) => void
  removeSong: (setlistId: string, songId: string) => void
  setShowDate: (id: string, date: string | undefined) => void
  replaceState: (next: AppState) => void
}
