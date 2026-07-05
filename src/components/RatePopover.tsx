import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { RATING_EMOJI, RATING_LABEL } from '../lib/health'
import type { Rating } from '../types'
import styles from './RatePopover.module.css'

const ORDER: Rating[] = ['solid', 'ok', 'shaky']

interface RatePopoverProps {
  /** Retângulo do botão de saúde que abriu o popover. */
  anchor: DOMRect
  onPick: (rating: Rating) => void
  onClear: () => void
  onClose: () => void
}

export function RatePopover({ anchor, onPick, onClear, onClose }: RatePopoverProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const pw = el.offsetWidth
    const ph = el.offsetHeight
    let left = anchor.right - pw
    let top = anchor.bottom + 8
    if (top + ph > window.innerHeight - 8) top = anchor.top - ph - 8
    left = Math.max(8, Math.min(left, window.innerWidth - pw - 8))
    setPos({ left, top })
  }, [anchor])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('click', onDocClick)
    window.addEventListener('scroll', onClose, true)
    return () => {
      document.removeEventListener('click', onDocClick)
      window.removeEventListener('scroll', onClose, true)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      className={styles.pop}
      style={{ left: pos?.left ?? -9999, top: pos?.top ?? -9999, opacity: pos ? 1 : 0 }}
    >
      {ORDER.map((rating) => (
        <button key={rating} onClick={() => onPick(rating)}>
          <span className={styles.emoji}>{RATING_EMOJI[rating]}</span> {RATING_LABEL[rating]}
        </button>
      ))}
      <button className={styles.clear} onClick={onClear}>
        Ainda não pratiquei
      </button>
    </div>
  )
}
