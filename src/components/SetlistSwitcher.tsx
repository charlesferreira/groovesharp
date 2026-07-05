import { useEffect, useRef, useState } from 'react'
import type { Setlist } from '../types'
import styles from './SetlistSwitcher.module.css'

interface SetlistSwitcherProps {
  setlists: Setlist[]
  activeId: string
  editMode: boolean
  onSelect: (id: string) => void
  onNew: () => void
  onRename: () => void
  onDelete: () => void
  onToggleEdit: () => void
  onStage: () => void
}

export function SetlistSwitcher({
  setlists,
  activeId,
  editMode,
  onSelect,
  onNew,
  onRename,
  onDelete,
  onToggleEdit,
  onStage,
}: SetlistSwitcherProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const active = setlists.find((s) => s.id === activeId) ?? setlists[0]

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [open])

  const run = (fn: () => void) => () => {
    setOpen(false)
    fn()
  }

  return (
    <div className={`${styles.wrap} ${open ? styles.open : ''}`} ref={wrapRef}>
      <button
        className={styles.trigger}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
      >
        <span className={styles.name}>{active.name}</span>
        <svg className={styles.chev} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className={styles.menu}>
          {setlists.map((s) => (
            <button key={s.id} className={styles.item} onClick={run(() => onSelect(s.id))}>
              <span className={styles.name}>{s.name}</span>
              {s.id === active.id && (
                <svg className={styles.check} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}

          <div className={styles.divider} />

          <button className={styles.item} onClick={run(onNew)}>
            ＋ Novo setlist
          </button>
          <button className={styles.item} onClick={run(onRename)}>
            ✏️ Renomear “{active.name}”
          </button>
          <button
            className={`${styles.item} ${styles.danger} ${setlists.length <= 1 ? styles.disabled : ''}`}
            onClick={run(onDelete)}
          >
            🗑️ Excluir “{active.name}”
          </button>

          <div className={styles.divider} />

          <button className={styles.item} onClick={run(onStage)}>
            🎭 Modo palco
          </button>
          <button className={styles.item} onClick={run(onToggleEdit)}>
            🎵 {editMode ? 'Concluir edição' : 'Editar músicas'}
          </button>
        </div>
      )}
    </div>
  )
}
