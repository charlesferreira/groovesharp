import { useEffect, useRef } from 'react'
import { greenDays, RATING_EMOJI, sliderFromSpeed, speedFromSlider } from '../lib/health'
import { humanDays } from '../lib/time'
import { RangeControl } from './RangeControl'
import styles from './SettingsPanel.module.css'

interface SettingsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  speed: number
  onSpeedChange: (speed: number) => void
  simDays: number
  onSimChange: (days: number) => void
  onExport: () => void
  onImport: (file: File) => void
}

export function SettingsPanel({
  open,
  onOpenChange,
  speed,
  onSpeedChange,
  simDays,
  onSimChange,
  onExport,
  onImport,
}: SettingsPanelProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onOpenChange(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [open, onOpenChange])

  const scaleInfo =
    `verde por ~ ${RATING_EMOJI.solid} ${humanDays(greenDays('solid', speed))}` +
    ` · ${RATING_EMOJI.ok} ${humanDays(greenDays('ok', speed))}` +
    ` · ${RATING_EMOJI.shaky} ${humanDays(greenDays('shaky', speed))}`
  const simInfo = simDays === 0 ? 'vendo hoje' : `daqui a ${simDays} ${simDays === 1 ? 'dia' : 'dias'}`

  return (
    <div ref={rootRef}>
      <button
        className={styles.btn}
        title="Opções"
        aria-label="Opções"
        onClick={(e) => {
          e.stopPropagation()
          onOpenChange(!open)
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
      {open && (
        <div className={styles.panel}>
          <div className={styles.section}>
            <h3 className={styles.h3}>Escala de tempo</h3>
            <RangeControl
              label="Ritmo de queda"
              info={scaleInfo}
              min={0}
              max={100}
              value={sliderFromSpeed(speed)}
              onChange={(pos) => onSpeedChange(speedFromSlider(pos))}
              leftEnd="treino constante"
              rightEnd="véspera de show"
            />
          </div>
          <div className={styles.section}>
            <h3 className={styles.h3}>Simulação</h3>
            <RangeControl
              label="Prever o futuro"
              info={simInfo}
              min={0}
              max={30}
              value={simDays}
              onChange={onSimChange}
              leftEnd="hoje"
              rightEnd="+30 dias"
            />
          </div>

          <div className={styles.section}>
            <h3 className={styles.h3}>Backup</h3>
            <div className={styles.backupRow}>
              <button className={styles.backupBtn} onClick={onExport}>
                Exportar
              </button>
              <label className={styles.backupBtn}>
                Importar
                <input
                  type="file"
                  accept="application/json"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onImport(file)
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
