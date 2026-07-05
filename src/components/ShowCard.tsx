import { useState } from 'react'
import { daysUntil } from '../lib/show'
import { Modal } from './Modal'
import { meterColor } from './HealthMeter'
import styles from './ShowCard.module.css'

interface ShowCardProps {
  showDate: string | undefined
  nowMs: number
  readinessAvg: number
  atRiskNames: string[]
  onSetDate: (date: string) => void
  onClear: () => void
}

function countdownLabel(days: number): string {
  if (days > 1) return `em ${days} dias`
  if (days === 1) return 'amanhã'
  if (days === 0) return 'é hoje! 🤘'
  if (days === -1) return 'foi ontem'
  return `foi há ${-days} dias`
}

export function ShowCard({
  showDate,
  nowMs,
  readinessAvg,
  atRiskNames,
  onSetDate,
  onClear,
}: ShowCardProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(showDate ?? '')

  function openEditor() {
    setDraft(showDate ?? '')
    setEditing(true)
  }

  function save() {
    if (draft) onSetDate(draft)
    setEditing(false)
  }

  const dateModal = editing && (
    <Modal title="Data do show" onClose={() => setEditing(false)}>
      <input
        type="date"
        className={styles.dateField}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-label="Data do show"
      />
      <div className={styles.modalActions}>
        <button type="button" className={styles.btn} onClick={() => setEditing(false)}>
          Cancelar
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.primary}`}
          onClick={save}
          disabled={!draft}
        >
          Salvar
        </button>
      </div>
    </Modal>
  )

  if (!showDate) {
    return (
      <>
        <button className={styles.setBtn} onClick={openEditor}>
          🎤 Definir data do show
        </button>
        {dateModal}
      </>
    )
  }

  const days = daysUntil(showDate, nowMs)
  const shownFew = atRiskNames.slice(0, 5)
  const extra = atRiskNames.length - shownFew.length

  return (
    <>
      <div className={styles.card}>
        <div className={styles.head}>
          <span className={styles.title}>🎤 Próximo show</span>
          <span className={styles.count}>{countdownLabel(days)}</span>
        </div>

        <div className={styles.bar}>
          <span
            className={styles.fill}
            style={{ width: `${readinessAvg}%`, background: meterColor(readinessAvg) }}
          />
        </div>
        <div className={styles.readiness}>
          Prontidão projetada pro show: <b>{Math.round(readinessAvg)}%</b>
        </div>

        <div className={styles.risk}>
          {atRiskNames.length === 0 ? (
            'Tudo pronto pro show! 🎸'
          ) : (
            <>
              Reforce antes:{' '}
              {shownFew.map((name, i) => (
                <span key={name}>
                  <span className={styles.riskName}>{name}</span>
                  {i < shownFew.length - 1 ? ', ' : ''}
                </span>
              ))}
              {extra > 0 && ` +${extra}`}
            </>
          )}
        </div>

        <div className={styles.actions}>
          <button className={styles.link} onClick={openEditor}>
            alterar data
          </button>
          <button className={styles.link} onClick={onClear}>
            remover show
          </button>
        </div>
      </div>
      {dateModal}
    </>
  )
}
