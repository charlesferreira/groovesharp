import type { SongRow as SongRowData } from '../lib/setlist'
import { SongRow } from './SongRow'
import styles from './SongList.module.css'

interface SongListProps {
  rows: SongRowData[]
  positionById: Record<string, number>
  nowMs: number
  onRate: (songId: string, anchor: HTMLElement) => void
}

export function SongList({ rows, positionById, nowMs, onRate }: SongListProps) {
  if (rows.length === 0) {
    return <p className={styles.empty}>Nenhuma música encontrada.</p>
  }
  return (
    <ol className={styles.list}>
      {rows.map((row) => (
        <SongRow
          key={row.song.id}
          position={positionById[row.song.id]}
          row={row}
          nowMs={nowMs}
          onRate={onRate}
        />
      ))}
    </ol>
  )
}
