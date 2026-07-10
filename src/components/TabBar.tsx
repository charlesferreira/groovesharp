import styles from './TabBar.module.css'

export type Tab = 'practice' | 'band' | 'profile'

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'practice', label: 'Praticar', icon: '🎸' },
  { id: 'band', label: 'Banda', icon: '🎵' },
  { id: 'profile', label: 'Perfil', icon: '👤' },
]

interface TabBarProps {
  active: Tab
  onChange: (tab: Tab) => void
}

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className={styles.bar}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${active === tab.id ? styles.active : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span className={styles.icon}>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
