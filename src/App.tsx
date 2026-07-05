import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './App.module.css'
import { Header } from './components/Header'
import { HealthMeter } from './components/HealthMeter'
import { RatePopover } from './components/RatePopover'
import { SettingsPanel } from './components/SettingsPanel'
import { SimBadge } from './components/SimBadge'
import { SongList } from './components/SongList'
import { Toolbar } from './components/Toolbar'
import { useAppState } from './hooks/useAppState'
import { buildRows, filterRows, sortRows, summarize, type SortMode } from './lib/setlist'
import type { Rating } from './types'

const DAY = 86_400_000

interface PopoverState {
  songId: string
  anchor: DOMRect
}

export default function App() {
  const { state, rate, clearRating, setSpeed, resetPractice } = useAppState()

  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('setlist')
  const [simDays, setSimDays] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [popover, setPopover] = useState<PopoverState | null>(null)

  const meterRef = useRef<HTMLDivElement>(null)
  const [meterOffscreen, setMeterOffscreen] = useState(false)

  useEffect(() => {
    const el = meterRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setMeterOffscreen(!entry.isIntersecting), {
      rootMargin: '-88px 0px 0px 0px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const activeSetlist =
    state.setlists.find((s) => s.id === state.activeSetlistId) ?? state.setlists[0]

  const nowMs = Date.now() + simDays * DAY

  const { positionById, summary, displayed } = useMemo(() => {
    const rows = buildRows(activeSetlist.songs, state.practice, nowMs, state.speed)
    const positions: Record<string, number> = {}
    activeSetlist.songs.forEach((song, i) => {
      positions[song.id] = i + 1
    })
    return {
      positionById: positions,
      summary: summarize(rows),
      displayed: filterRows(sortRows(rows, sortMode), search),
    }
  }, [activeSetlist, state.practice, state.speed, nowMs, sortMode, search])

  function handleRate(songId: string, anchor: HTMLElement) {
    setPopover({ songId, anchor: anchor.getBoundingClientRect() })
  }

  function pick(rating: Rating) {
    if (popover) rate(popover.songId, rating)
    setPopover(null)
  }

  function clear() {
    if (popover) clearRating(popover.songId)
    setPopover(null)
  }

  return (
    <>
      <SettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        speed={state.speed}
        onSpeedChange={setSpeed}
        simDays={simDays}
        onSimChange={setSimDays}
      />

      <div className={styles.wrap}>
        <Header
          eyebrow="GrooveSharp"
          title={activeSetlist.name}
          sub="Toque numa música pra abrir a partitura no Songsterr. Toque na bolinha pra registrar como foi o treino — a cor mostra a saúde de cada música."
        />

        <Toolbar
          search={search}
          onSearch={setSearch}
          sortMode={sortMode}
          onSort={setSortMode}
          avg={summary.avg}
          miniVisible={meterOffscreen}
        />

        <HealthMeter ref={meterRef} avg={summary.avg} attention={summary.attention} />

        <SongList rows={displayed} positionById={positionById} nowMs={nowMs} onRate={handleRate} />

        <footer className={styles.footer}>
          <button
            className={styles.reset}
            onClick={() => {
              if (confirm('Zerar a saúde de todas as músicas?')) resetPractice()
            }}
          >
            Zerar saúde de todas
          </button>
        </footer>
      </div>

      {popover && (
        <RatePopover
          anchor={popover.anchor}
          onPick={pick}
          onClear={clear}
          onClose={() => setPopover(null)}
        />
      )}

      <SimBadge simDays={simDays} onClear={() => setSimDays(0)} />
    </>
  )
}
