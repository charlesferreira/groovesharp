import type { SortMode } from '../lib/setlist'
import { meterColor } from './HealthMeter'
import { SearchBar } from './SearchBar'
import { SortToggle } from './SortToggle'
import styles from './Toolbar.module.css'

interface ToolbarProps {
  search: string
  onSearch: (value: string) => void
  sortMode: SortMode
  onSort: (mode: SortMode) => void
  /** Saúde média, para a linha fininha que aparece ao rolar. */
  avg: number
  miniVisible: boolean
}

export function Toolbar({ search, onSearch, sortMode, onSort, avg, miniVisible }: ToolbarProps) {
  return (
    <div className={styles.controls}>
      <SearchBar value={search} onChange={onSearch} />
      <SortToggle value={sortMode} onChange={onSort} />
      <div className={`${styles.mini} ${miniVisible ? styles.show : ''}`}>
        <span className={styles.miniFill} style={{ width: `${avg}%`, background: meterColor(avg) }} />
      </div>
    </div>
  )
}
