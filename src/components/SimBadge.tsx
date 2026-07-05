import styles from './SimBadge.module.css'

interface SimBadgeProps {
  simDays: number
  onClear: () => void
}

export function SimBadge({ simDays, onClear }: SimBadgeProps) {
  if (simDays <= 0) return null
  return (
    <button className={styles.badge} onClick={onClear}>
      ⏱ prevendo +{simDays} {simDays === 1 ? 'dia' : 'dias'} — voltar pra hoje
    </button>
  )
}
