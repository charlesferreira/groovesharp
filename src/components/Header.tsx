import styles from './Header.module.css'

interface HeaderProps {
  eyebrow: string
  title: string
  sub: string
}

export function Header({ eyebrow, title, sub }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.eyebrow}>{eyebrow}</div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.sub}>{sub}</p>
    </header>
  )
}
