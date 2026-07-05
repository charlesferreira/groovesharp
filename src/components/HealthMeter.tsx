import { forwardRef } from 'react'
import { AMBER_THRESHOLD, GREEN_THRESHOLD } from '../lib/health'
import styles from './HealthMeter.module.css'

interface HealthMeterProps {
  avg: number
  attention: number
}

/** Cor da barra conforme a saúde média. */
export function meterColor(avg: number): string {
  if (avg >= GREEN_THRESHOLD) return 'var(--h-green)'
  if (avg >= AMBER_THRESHOLD) return 'var(--h-amber)'
  return 'var(--h-red)'
}

export const HealthMeter = forwardRef<HTMLDivElement, HealthMeterProps>(function HealthMeter(
  { avg, attention },
  ref,
) {
  return (
    <div className={styles.meter} ref={ref}>
      <div className={styles.bar}>
        <span className={styles.fill} style={{ width: `${avg}%`, background: meterColor(avg) }} />
      </div>
      <div className={styles.labels}>
        <span>
          Saúde do setlist · <b>{Math.round(avg)}%</b>
        </span>
        <span>
          {attention > 0 ? (
            <>
              <b className={styles.attn}>{attention}</b> precisam de atenção
            </>
          ) : (
            'tudo em dia 🎸'
          )}
        </span>
      </div>
    </div>
  )
})
