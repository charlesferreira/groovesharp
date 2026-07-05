import type { HealthClass } from '../lib/health'
import styles from './HealthDot.module.css'

interface HealthDotProps {
  variant: HealthClass
  title: string
  onClick: (anchor: HTMLElement) => void
}

const VARIANT_CLASS: Record<HealthClass, string> = {
  green: styles.green,
  amber: styles.amber,
  red: styles.red,
  none: styles.none,
}

export function HealthDot({ variant, title, onClick }: HealthDotProps) {
  return (
    <button
      type="button"
      className={styles.dot}
      title={title}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick(e.currentTarget)
      }}
    >
      <span className={`${styles.pip} ${VARIANT_CLASS[variant]}`} />
    </button>
  )
}
