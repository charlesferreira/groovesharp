import { useEffect, useState } from 'react'
import { primaryLink } from '../lib/songsterr'
import type { Song } from '../types'
import styles from './StageMode.module.css'

interface StageModeProps {
  setlistName: string
  songs: Song[]
  onClose: () => void
}

export function StageMode({ setlistName, songs, onClose }: StageModeProps) {
  const [index, setIndex] = useState(0)

  const atStart = index <= 0
  const atEnd = index >= songs.length - 1
  const prev = () => setIndex((i) => Math.max(0, i - 1))
  const next = () => setIndex((i) => Math.min(songs.length - 1, i + 1))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' || e.key === ' ') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // mantém a tela acordada durante o show, se o navegador suportar
  useEffect(() => {
    let lock: { release: () => void } | undefined
    const wakeLock = (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => void }> } }).wakeLock
    wakeLock
      ?.request('screen')
      .then((l) => {
        lock = l
      })
      .catch(() => {})
    return () => {
      try {
        lock?.release()
      } catch {
        /* ignora */
      }
    }
  }, [])

  const song = songs[index]
  const nextSong = songs[index + 1]

  return (
    <div className={styles.stage}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <span>{setlistName}</span>
          <button className={styles.close} onClick={onClose} aria-label="Sair do modo palco">
            ✕
          </button>
        </div>

        {song ? (
          <>
            <div className={styles.center}>
              <div className={styles.pos}>
                {index + 1} / {songs.length}
              </div>
              <div className={styles.songTitle}>{song.title}</div>

              {(song.key || song.bpm || song.tuning) && (
                <div className={styles.meta}>
                  {song.key && <span className={styles.metaChip}>Tom {song.key}</span>}
                  {song.bpm && <span className={styles.metaChip}>{song.bpm} BPM</span>}
                  {song.tuning && <span className={styles.metaChip}>{song.tuning}</span>}
                </div>
              )}

              {song.notes && <div className={styles.notes}>{song.notes}</div>}

              <a className={styles.chartLink} href={primaryLink(song)} target="songsterr">
                Abrir partitura ↗
              </a>

              {nextSong && (
                <div className={styles.next}>
                  A seguir: <span className={styles.nextName}>{nextSong.title}</span>
                </div>
              )}
            </div>

            <div className={styles.bottom}>
              <button className={styles.navBtn} onClick={prev} disabled={atStart}>
                ← Anterior
              </button>
              <button
                className={`${styles.navBtn} ${styles.navPrimary}`}
                onClick={next}
                disabled={atEnd}
              >
                {atEnd ? 'Fim 🤘' : 'Próxima →'}
              </button>
            </div>
          </>
        ) : (
          <div className={styles.empty}>Este setlist não tem músicas.</div>
        )}
      </div>
    </div>
  )
}
