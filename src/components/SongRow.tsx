import { healthClass, RATING_LABEL } from '../lib/health'
import type { SongRow as SongRowData } from '../lib/setlist'
import { primaryLink } from '../lib/songsterr'
import { agoText } from '../lib/time'
import { HealthDot } from './HealthDot'
import styles from './SongRow.module.css'

interface SongRowProps {
  /** Posição na ordem original do setlist (o número mostrado). */
  position: number
  row: SongRowData
  nowMs: number
  onRate: (songId: string, anchor: HTMLElement) => void
}

export function SongRow({ position, row, nowMs, onRate }: SongRowProps) {
  const { song, entry, health } = row
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
        <span className={styles.ago}>{ago}</span>
        <span className={styles.dur}>{song.duration}</span>
        <HealthDot variant={healthClass(health)} title={dotTitle} onClick={(a) => onRate(song.id, a)} />
      </a>
    </li>
  )
}
