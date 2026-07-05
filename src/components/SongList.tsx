import type { SongRow as SongRowData } from '../lib/setlist'
import type { Song } from '../types'
import { SongRow } from './SongRow'
import styles from './SongList.module.css'

interface SongListProps {
  rows: SongRowData[]
  positionById: Record<string, number>
  nowMs: number
  editMode: boolean
  onRate: (songId: string, anchor: HTMLElement) => void
  onEdit: (song: Song) => void
  onRemove: (song: Song) => void
}

export function SongList({
  rows,
  positionById,
  nowMs,
  editMode,
  onRate,
  onEdit,
  onRemove,
}: SongListProps) {
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
          editMode={editMode}
          onRate={onRate}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      ))}
    </ol>
  )
}
