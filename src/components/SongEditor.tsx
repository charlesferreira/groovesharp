import { useState } from 'react'
import type { Song, SongLink } from '../types'
import styles from './SongEditor.module.css'

export interface SongFormData {
  title: string
  artist: string
  duration: string
  key?: string
  bpm?: number
  tuning?: string
  notes?: string
  links?: SongLink[]
}

interface SongEditorProps {
  initial?: Song
  defaultArtist?: string
  onSave: (data: SongFormData) => void
  onCancel: () => void
}

const trimOrUndefined = (s: string) => (s.trim() ? s.trim() : undefined)

export function SongEditor({ initial, defaultArtist = '', onSave, onCancel }: SongEditorProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [artist, setArtist] = useState(initial?.artist ?? defaultArtist)
  const [duration, setDuration] = useState(initial?.duration ?? '')
  const [key, setKey] = useState(initial?.key ?? '')
  const [bpm, setBpm] = useState(initial?.bpm ? String(initial.bpm) : '')
  const [tuning, setTuning] = useState(initial?.tuning ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [links, setLinks] = useState<SongLink[]>(initial?.links ?? [])

  const canSave = title.trim().length > 0

  function updateLink(i: number, patch: Partial<SongLink>) {
    setLinks((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    const parsedBpm = parseInt(bpm, 10)
    onSave({
      title: title.trim(),
      artist: artist.trim(),
      duration: /^\d+:\d{2}$/.test(duration.trim()) ? duration.trim() : '0:00',
      key: trimOrUndefined(key),
      bpm: Number.isFinite(parsedBpm) && parsedBpm > 0 ? parsedBpm : undefined,
      tuning: trimOrUndefined(tuning),
      notes: trimOrUndefined(notes),
      links: links.filter((l) => l.url.trim()).map((l) => ({ label: l.label.trim() || 'Link', url: l.url.trim() })),
    })
  }

  return (
    <form onSubmit={submit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="song-title">
          Título
        </label>
        <input
          id="song-title"
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome da música"
          autoFocus
        />
      </div>

      <div className={styles.row2}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="song-artist">
            Artista
          </label>
          <input
            id="song-artist"
            className={styles.input}
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Banda / artista"
          />
        </div>
        <div className={styles.field} style={{ maxWidth: 120 }}>
          <label className={styles.label} htmlFor="song-duration">
            Duração
          </label>
          <input
            id="song-duration"
            className={styles.input}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="m:ss"
            inputMode="numeric"
          />
        </div>
      </div>

      <div className={styles.row2}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="song-key">
            Tom
          </label>
          <input
            id="song-key"
            className={styles.input}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Ex.: Em"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="song-bpm">
            BPM
          </label>
          <input
            id="song-bpm"
            className={styles.input}
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            placeholder="Ex.: 140"
            inputMode="numeric"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="song-tuning">
            Afinação
          </label>
          <input
            id="song-tuning"
            className={styles.input}
            value={tuning}
            onChange={(e) => setTuning(e.target.value)}
            placeholder="Ex.: Meio tom abaixo"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="song-notes">
          Anotações
        </label>
        <textarea
          id="song-notes"
          className={styles.input}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Trechos difíceis, lembretes de execução…"
          rows={2}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Links</label>
        {links.map((link, i) => (
          <div key={i} className={styles.linkRow}>
            <input
              className={styles.input}
              style={{ maxWidth: 120 }}
              value={link.label}
              onChange={(e) => updateLink(i, { label: e.target.value })}
              placeholder="Rótulo"
              aria-label={`Rótulo do link ${i + 1}`}
            />
            <input
              className={styles.input}
              value={link.url}
              onChange={(e) => updateLink(i, { url: e.target.value })}
              placeholder="https://…"
              aria-label={`URL do link ${i + 1}`}
            />
            <button
              type="button"
              className={styles.linkRemove}
              onClick={() => setLinks((ls) => ls.filter((_, idx) => idx !== i))}
              aria-label={`Remover link ${i + 1}`}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className={styles.addLink}
          onClick={() => setLinks((ls) => [...ls, { label: '', url: '' }])}
        >
          ＋ Adicionar link
        </button>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.btn} onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className={`${styles.btn} ${styles.primary}`} disabled={!canSave}>
          Salvar
        </button>
      </div>
    </form>
  )
}
