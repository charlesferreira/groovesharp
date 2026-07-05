import styles from './RangeControl.module.css'

interface RangeControlProps {
  label: string
  info: string
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  leftEnd: string
  rightEnd: string
}

export function RangeControl({
  label,
  info,
  min,
  max,
  value,
  onChange,
  leftEnd,
  rightEnd,
}: RangeControlProps) {
  return (
    <div className={styles.scale}>
      <div className={styles.head}>
        <span>{label}</span>
        <span className={styles.info}>{info}</span>
      </div>
      <input
        className={styles.range}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className={styles.ends}>
        <span>{leftEnd}</span>
        <span>{rightEnd}</span>
      </div>
    </div>
  )
}
