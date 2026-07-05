import { useState } from 'react'
import type { Song } from '../types'
import styles from './SongEditor.module.css'

export interface SongFormData {
  title: string
  artist: string
  duration: string
}

interface SongEditorProps {
  initial?: Song
  defaultArtist?: string
  onSave: (data: SongFormData) => void
  onCancel: () => void
}

export function SongEditor({ initial, defaultArtist = '', onSave, onCancel }: SongEditorProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [artist, setArtist] = useState(initial?.artist ?? defaultArtist)
  const [duration, setDuration] = useState(initial?.duration ?? '')

  const canSave = title.trim().length > 0

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    onSave({
      title: title.trim(),
      artist: artist.trim(),
      duration: /^\d+:\d{2}$/.test(duration.trim()) ? duration.trim() : '0:00',
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
