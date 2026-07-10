import { useEffect, useMemo, useRef, useState } from 'react'
import { Header } from '../components/Header'
import { HealthMeter } from '../components/HealthMeter'
import { Modal } from '../components/Modal'
import { RatePopover } from '../components/RatePopover'
import { SetlistSwitcher } from '../components/SetlistSwitcher'
import { SettingsPanel } from '../components/SettingsPanel'
import { ShowCard } from '../components/ShowCard'
import { SimBadge } from '../components/SimBadge'
import { SongEditor, type SongFormData } from '../components/SongEditor'
import { SongList } from '../components/SongList'
import { StageMode } from '../components/StageMode'
import { Toolbar } from '../components/Toolbar'
import type { AppStore } from '../hooks/store'
import { downloadBackup, parseBackup } from '../lib/backup'
import { buildRows, filterRows, sortRows, summarize, type SortMode } from '../lib/setlist'
import { showReadiness } from '../lib/show'
import type { Rating, Song } from '../types'
import styles from './PracticeScreen.module.css'

const DAY = 86_400_000

interface PopoverState {
  songId: string
  anchor: DOMRect
}

type EditorState = { mode: 'add' } | { mode: 'edit'; song: Song } | null

export function PracticeScreen({ store }: { store: AppStore }) {
  const { state, ...actions } = store

  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('setlist')
  const [simDays, setSimDays] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [stageOpen, setStageOpen] = useState(false)
  const [popover, setPopover] = useState<PopoverState | null>(null)
  const [editor, setEditor] = useState<EditorState>(null)

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
    if (popover) actions.rate(popover.songId, rating)
    setPopover(null)
  }

  function clear() {
    if (popover) actions.clearRating(popover.songId)
    setPopover(null)
  }

  function newSetlist() {
    const name = prompt('Nome do novo setlist:')?.trim()
    if (name) actions.addSetlist(name)
  }

  function renameSetlist() {
    const name = prompt('Renomear setlist:', activeSetlist.name)?.trim()
    if (name) actions.renameSetlist(activeSetlist.id, name)
  }

  function deleteSetlist() {
    if (confirm(`Excluir "${activeSetlist.name}"? As avaliações das músicas dele serão perdidas.`)) {
      actions.deleteSetlist(activeSetlist.id)
    }
  }

  function removeSong(song: Song) {
    if (confirm(`Remover "${song.title}" do setlist?`)) actions.removeSong(activeSetlist.id, song.id)
  }

  function saveSong(data: SongFormData) {
    if (editor?.mode === 'edit') {
      actions.updateSong(activeSetlist.id, editor.song.id, data)
    } else {
      actions.addSong(activeSetlist.id, data)
    }
    setEditor(null)
  }

  function handleImport(file: File) {
    file
      .text()
      .then((text) => {
        const parsed = parseBackup(text)
        if (!parsed) {
          alert('Arquivo de backup inválido.')
          return
        }
        if (confirm('Importar vai substituir todos os dados atuais. Continuar?')) {
          actions.replaceState(parsed)
        }
      })
      .catch(() => alert('Não foi possível ler o arquivo.'))
  }

  const defaultArtist = activeSetlist.songs[0]?.artist ?? ''

  const readiness = activeSetlist.showDate
    ? showReadiness(activeSetlist.songs, state.practice, activeSetlist.showDate)
    : null

  return (
    <>
      <SettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        speed={state.speed}
        onSpeedChange={actions.setSpeed}
        simDays={simDays}
        onSimChange={setSimDays}
        onExport={() => downloadBackup(state)}
        onImport={handleImport}
      />

      <div className={styles.wrap}>
        <Header
          eyebrow="GrooveSharp"
          sub="Toque numa música pra abrir a partitura no Songsterr. Toque na bolinha pra registrar como foi o treino — a cor mostra a saúde de cada música."
        >
          <SetlistSwitcher
            setlists={state.setlists}
            activeId={activeSetlist.id}
            editMode={editMode}
            onSelect={actions.setActiveSetlist}
            onNew={newSetlist}
            onRename={renameSetlist}
            onDelete={deleteSetlist}
            onToggleEdit={() => setEditMode((v) => !v)}
            onStage={() => setStageOpen(true)}
          />
        </Header>

        <Toolbar
          search={search}
          onSearch={setSearch}
          sortMode={sortMode}
          onSort={setSortMode}
          avg={summary.avg}
          miniVisible={meterOffscreen}
        />

        <HealthMeter ref={meterRef} avg={summary.avg} attention={summary.attention} />

        <ShowCard
          showDate={activeSetlist.showDate}
          nowMs={nowMs}
          readinessAvg={readiness?.avg ?? 0}
          atRiskNames={readiness?.atRisk.map((r) => r.song.title) ?? []}
          onSetDate={(date) => actions.setShowDate(activeSetlist.id, date)}
          onClear={() => actions.setShowDate(activeSetlist.id, undefined)}
        />

        <SongList
          rows={displayed}
          positionById={positionById}
          nowMs={nowMs}
          editMode={editMode}
          onRate={handleRate}
          onEdit={(song) => setEditor({ mode: 'edit', song })}
          onRemove={removeSong}
        />

        {editMode && (
          <button className={styles.addSong} onClick={() => setEditor({ mode: 'add' })}>
            ＋ Adicionar música
          </button>
        )}

        <footer className={styles.footer}>
          <button
            className={styles.reset}
            onClick={() => {
              if (confirm('Zerar a saúde de todas as músicas?')) actions.resetPractice()
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

      {editor && (
        <Modal
          title={editor.mode === 'edit' ? 'Editar música' : 'Nova música'}
          onClose={() => setEditor(null)}
        >
          <SongEditor
            initial={editor.mode === 'edit' ? editor.song : undefined}
            defaultArtist={defaultArtist}
            onSave={saveSong}
            onCancel={() => setEditor(null)}
          />
        </Modal>
      )}

      <SimBadge simDays={simDays} onClear={() => setSimDays(0)} />

      {stageOpen && (
        <StageMode
          setlistName={activeSetlist.name}
          songs={activeSetlist.songs}
          onClose={() => setStageOpen(false)}
        />
      )}
    </>
  )
}
