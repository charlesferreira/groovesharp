import { useMemo, useState } from 'react'
import { Modal } from '../components/Modal'
import { useCloudState } from '../hooks/useCloudState'
import { importLocalData } from '../lib/repo'
import { loadState } from '../lib/storage'
import styles from './CloudPractice.module.css'
import { PracticeScreen } from './PracticeScreen'

const MIGRATED_KEY = 'groovesharp-migrated'

/** Modo nuvem: repertório da banda + prática pessoal no Supabase. */
export function CloudPractice({ userId }: { userId: string }) {
  const store = useCloudState(userId)
  const localState = useMemo(() => loadState(), [])
  const [offer, setOffer] = useState(() => !localStorage.getItem(MIGRATED_KEY))
  const [importing, setImporting] = useState(false)

  const hasLocalSongs = localState.setlists.some((s) => s.songs.length > 0)
  const showOffer = offer && hasLocalSongs && !!store.bandId

  function skip() {
    localStorage.setItem(MIGRATED_KEY, '1')
    setOffer(false)
  }

  async function doImport() {
    if (!store.bandId) return
    setImporting(true)
    try {
      await importLocalData(store.bandId, localState, userId)
      localStorage.setItem(MIGRATED_KEY, '1')
      store.reload()
      setOffer(false)
    } catch {
      alert('Não foi possível importar agora. Tente de novo mais tarde.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <PracticeScreen store={store} />
      {showOffer && (
        <Modal title="Trazer suas músicas?" onClose={skip}>
          <p className={styles.text}>
            Você tem músicas no modo local. Quer copiá-las pra esta banda na sua conta? Suas
            avaliações de prática vêm junto.
          </p>
          <div className={styles.actions}>
            <button className={styles.btn} onClick={skip} disabled={importing}>
              Agora não
            </button>
            <button
              className={`${styles.btn} ${styles.primary}`}
              onClick={doImport}
              disabled={importing}
            >
              {importing ? 'Importando…' : 'Importar'}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
