import type { SortMode } from '../lib/setlist'
import styles from './SortToggle.module.css'

interface SortToggleProps {
  value: SortMode
  onChange: (mode: SortMode) => void
}

const OPTIONS: Array<{ mode: SortMode; label: string }> = [
  { mode: 'setlist', label: 'Setlist' },
  { mode: 'priority', label: 'Prioridade' },
]

export function SortToggle({ value, onChange }: SortToggleProps) {
  return (
    <div className={styles.sorter}>
      {OPTIONS.map(({ mode, label }) => (
        <button
          key={mode}
          className={`${styles.chip} ${value === mode ? styles.active : ''}`}
          onClick={() => onChange(mode)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
