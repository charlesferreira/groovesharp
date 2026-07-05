import { useCallback, useEffect, useState } from 'react'
import type { AppState, Rating } from '../types'
import { loadState, saveState } from '../lib/storage'

/** Estado do app + ações, com persistência automática no localStorage. */
export function useAppState() {
  const [state, setState] = useState<AppState>(loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  /** Registra um treino. Grava sempre o "agora" real (nunca o simulado). */
  const rate = useCallback((songId: string, rating: Rating) => {
    setState((s) => ({
      ...s,
      practice: { ...s.practice, [songId]: { rating, last: Date.now() } },
    }))
  }, [])

  const clearRating = useCallback((songId: string) => {
    setState((s) => {
      const practice = { ...s.practice }
      delete practice[songId]
      return { ...s, practice }
    })
  }, [])

  const setSpeed = useCallback((speed: number) => {
    setState((s) => ({ ...s, speed }))
  }, [])

  const resetPractice = useCallback(() => {
    setState((s) => ({ ...s, practice: {} }))
  }, [])

  return { state, rate, clearRating, setSpeed, resetPractice }
}
