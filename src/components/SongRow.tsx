import { healthClass, RATING_LABEL } from '../lib/health'
import type { SongRow as SongRowData } from '../lib/setlist'
import { primaryLink } from '../lib/songsterr'
import { agoText } from '../lib/time'
import type { Song } from '../types'
import { HealthDot } from './HealthDot'
import styles from './SongRow.module.css'

interface SongRowProps {
  /** Posição na ordem original do setlist (o número mostrado). */
  position: number
  row: SongRowData
  nowMs: number
  editMode: boolean
  onRate: (songId: string, anchor: HTMLElement) => void
  onEdit: (song: Song) => void
  onRemove: (song: Song) => void
}

export function SongRow({ position, row, nowMs, editMode, onRate, onEdit, onRemove }: SongRowProps) {
  const { song, entry, health } = row

  if (editMode) {
    return (
      <li className={styles.item}>
        <div className={styles.song}>
          <span className={styles.num}>{position}</span>
          <span className={styles.title}>{song.title}</span>
          <span className={styles.dur}>{song.duration}</span>
          <button className={styles.iconBtn} title="Editar" onClick={() => onEdit(song)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
          <button
            className={`${styles.iconBtn} ${styles.remove}`}
            title="Remover"
            onClick={() => onRemove(song)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </li>
    )
  }

  const dotTitle = entry
    ? `${RATING_LABEL[entry.rating]} · ${agoText(entry, nowMs)}`
    : 'Ainda não praticada — toque pra registrar'
  const ago = entry ? agoText(entry, nowMs) : 'nova'

  return (
    <li className={styles.item}>
      {/* sem rel: manter target nomeado reutilizando a mesma aba do Songsterr */}
      <a className={styles.song} href={primaryLink(song)} target="songsterr">
        <span className={styles.num}>{position}</span>
        <span className={styles.title}>{song.title}</span>
        {(song.key || song.bpm) && (
          <span className={styles.meta}>
            {song.key && <span className={styles.chip}>{song.key}</span>}
            {song.bpm && <span className={styles.chip}>{song.bpm} BPM</span>}
          </span>
        )}
        <span className={styles.ago}>{ago}</span>
        <span className={styles.dur}>{song.duration}</span>
        <HealthDot variant={healthClass(health)} title={dotTitle} onClick={(a) => onRate(song.id, a)} />
      </a>
    </li>
  )
}
