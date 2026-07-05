import type { ReactNode } from 'react'
import styles from './Header.module.css'

interface HeaderProps {
  eyebrow: string
  sub: string
  /** Slot do título (ex.: o seletor de setlist). */
  children: ReactNode
}

export function Header({ eyebrow, sub, children }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.eyebrow}>{eyebrow}</div>
      <h1 className={styles.title}>{children}</h1>
      <p className={styles.sub}>{sub}</p>
    </header>
  )
}
