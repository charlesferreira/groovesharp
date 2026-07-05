import { useEffect, useMemo, useReducer } from 'react'
import { reducer } from '../lib/appReducer'
import { uid } from '../lib/id'
import { loadState, saveState } from '../lib/storage'
import type { AppState, Rating, Song } from '../types'

/** Estado do app + ações, com persistência automática no localStorage. */
export function useAppState() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const actions = useMemo(
    () => ({
      /** Registra um treino. Grava sempre o "agora" real (nunca o simulado). */
      rate: (songId: string, rating: Rating) =>
        dispatch({ type: 'rate', songId, rating, now: Date.now() }),
      clearRating: (songId: string) => dispatch({ type: 'clearRating', songId }),
      setSpeed: (speed: number) => dispatch({ type: 'setSpeed', speed }),
      resetPractice: () => dispatch({ type: 'resetPractice' }),
      replaceState: (next: AppState) => dispatch({ type: 'replaceState', state: next }),

      addSetlist: (name: string) => dispatch({ type: 'addSetlist', id: uid('sl_'), name }),
      renameSetlist: (id: string, name: string) => dispatch({ type: 'renameSetlist', id, name }),
      setShowDate: (id: string, date: string | undefined) =>
        dispatch({ type: 'setShowDate', id, date }),
      deleteSetlist: (id: string) => dispatch({ type: 'deleteSetlist', id }),
      setActiveSetlist: (id: string) => dispatch({ type: 'setActiveSetlist', id }),

      addSong: (setlistId: string, data: Omit<Song, 'id'>) =>
        dispatch({ type: 'addSong', setlistId, song: { ...data, id: uid('sg_') } }),
      updateSong: (setlistId: string, songId: string, patch: Partial<Song>) =>
        dispatch({ type: 'updateSong', setlistId, songId, patch }),
      removeSong: (setlistId: string, songId: string) =>
        dispatch({ type: 'removeSong', setlistId, songId }),
    }),
    [],
  )

  return { state, ...actions }
}
