import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as repo from '../lib/repo'
import { supabase } from '../lib/supabase'
import type { AppState, Rating, Setlist, Song } from '../types'
import type { AppStore } from './store'

const SPEED_KEY = 'groovesharp-cloud-speed'
const LAST_BAND_KEY = 'groovesharp-last-band'

function loadSpeed(): number {
  const v = parseFloat(localStorage.getItem(SPEED_KEY) || '')
  return v > 0 ? v : 1
}

type Practice = AppState['practice']

/** Estado da tela de prática ligado ao Supabase (repertório da banda + prática pessoal). */
export function useCloudState(userId: string): AppStore {
  const [bandId, setBandId] = useState<string | null>(null)
  const [setlists, setSetlists] = useState<Setlist[]>([])
  const [practice, setPractice] = useState<Practice>({})
  const [activeSetlistId, setActiveId] = useState('')
  const [speed, setSpeedState] = useState<number>(loadSpeed)

  const bandIdRef = useRef<string | null>(null)
  bandIdRef.current = bandId

  const applyData = useCallback((data: { setlists: Setlist[]; practice: Practice }) => {
    setSetlists(data.setlists)
    setPractice(data.practice)
    setActiveId((prev) =>
      prev && data.setlists.some((s) => s.id === prev) ? prev : (data.setlists[0]?.id ?? ''),
    )
  }, [])

  const refetch = useCallback(
    async (bId: string) => {
      applyData(await repo.getBandData(bId, userId))
    },
    [userId, applyData],
  )

  // carga inicial: garante ao menos uma banda e um setlist
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      let bands = await repo.listMyBands()
      if (bands.length === 0) {
        const b = await repo.createBand('Meu repertório')
        await repo.addSetlist(b.id, 'Repertório')
        bands = [b]
      }
      const last = localStorage.getItem(LAST_BAND_KEY)
      const active = bands.find((b) => b.id === last) ?? bands[0]
      if (cancelled) return
      setBandId(active.id)
      localStorage.setItem(LAST_BAND_KEY, active.id)
      let data = await repo.getBandData(active.id, userId)
      if (data.setlists.length === 0) {
        await repo.addSetlist(active.id, 'Repertório')
        data = await repo.getBandData(active.id, userId)
      }
      if (!cancelled) applyData(data)
    })().catch((e) => console.error('useCloudState: carga inicial', e))
    return () => {
      cancelled = true
    }
  }, [userId, applyData])

  // realtime: refaz a carga quando algo muda na banda (inclui mudanças de colegas)
  useEffect(() => {
    if (!bandId || !supabase) return
    const channel = supabase.channel(`band-${bandId}`)
    for (const table of ['songs', 'setlists', 'setlist_songs', 'practice_entries']) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          const id = bandIdRef.current
          if (id) refetch(id).catch(() => {})
        },
      )
    }
    channel.subscribe()
    return () => {
      supabase?.removeChannel(channel)
    }
  }, [bandId, refetch])

  // mutação otimista: aplica na hora e reconcilia com o servidor depois
  const mutate = useCallback(
    (optimistic: () => void, run: () => Promise<unknown>) => {
      optimistic()
      run()
        .then(() => {
          const id = bandIdRef.current
          if (id) return refetch(id)
        })
        .catch((e) => {
          console.error(e)
          const id = bandIdRef.current
          if (id) refetch(id).catch(() => {})
        })
    },
    [refetch],
  )

  // reconcilia sem otimismo (ações que dependem de id do servidor)
  const run = useCallback(
    (fn: (bandId: string) => Promise<unknown>) => {
      const id = bandIdRef.current
      if (!id) return
      Promise.resolve(fn(id))
        .then(() => refetch(id))
        .catch((e) => console.error(e))
    },
    [refetch],
  )

  const updateSongLocal = (songId: string, patch: Partial<Song>) =>
    setSetlists((sls) =>
      sls.map((sl) => ({
        ...sl,
        songs: sl.songs.map((s) => (s.id === songId ? { ...s, ...patch } : s)),
      })),
    )

  const actions = useMemo<Omit<AppStore, 'state'>>(
    () => ({
      rate: (songId, rating: Rating) =>
        mutate(
          () => setPractice((p) => ({ ...p, [songId]: { rating, last: Date.now() } })),
          () => repo.ratePractice(songId, rating, userId),
        ),
      clearRating: (songId) =>
        mutate(
          () =>
            setPractice((p) => {
              const next = { ...p }
              delete next[songId]
              return next
            }),
          () => repo.clearPractice(songId, userId),
        ),
      setSpeed: (s) => {
        setSpeedState(s)
        localStorage.setItem(SPEED_KEY, String(s))
      },
      resetPractice: () => {
        const ids = setlists.flatMap((sl) => sl.songs.map((s) => s.id))
        mutate(
          () => setPractice({}),
          () => repo.resetPractice([...new Set(ids)], userId),
        )
      },
      addSetlist: (name) =>
        run(async (bId) => {
          const id = await repo.addSetlist(bId, name)
          setActiveId(id)
        }),
      renameSetlist: (id, name) =>
        mutate(
          () => setSetlists((sls) => sls.map((sl) => (sl.id === id ? { ...sl, name } : sl))),
          () => repo.renameSetlist(id, name),
        ),
      deleteSetlist: (id) =>
        mutate(
          () => setSetlists((sls) => sls.filter((sl) => sl.id !== id)),
          () => repo.deleteSetlist(id),
        ),
      setActiveSetlist: (id) => setActiveId(id),
      addSong: (setlistId, data) => run((bId) => repo.addSong(bId, setlistId, data, userId)),
      updateSong: (_setlistId, songId, patch) =>
        mutate(
          () => updateSongLocal(songId, patch),
          () => repo.updateSong(songId, patch),
        ),
      removeSong: (_setlistId, songId) =>
        mutate(() => {
          setSetlists((sls) => sls.map((sl) => ({ ...sl, songs: sl.songs.filter((s) => s.id !== songId) })))
          setPractice((p) => {
            const next = { ...p }
            delete next[songId]
            return next
          })
        }, () => repo.removeSong(songId)),
      setShowDate: (id, date) =>
        mutate(
          () => setSetlists((sls) => sls.map((sl) => (sl.id === id ? { ...sl, showDate: date } : sl))),
          () => repo.setShowDate(id, date),
        ),
      replaceState: () => alert('Importar backup está disponível só no modo local.'),
    }),
    [mutate, run, setlists, userId],
  )

  const state = useMemo<AppState>(
    () => ({ version: 1, setlists, activeSetlistId, practice, speed }),
    [setlists, activeSetlistId, practice, speed],
  )

  return { state, ...actions }
}
