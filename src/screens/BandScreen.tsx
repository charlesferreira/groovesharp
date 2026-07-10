import { useAuth } from '../hooks/useAuth'
import { supabaseEnabled } from '../lib/supabase'
import styles from './BandScreen.module.css'

export function BandScreen() {
  const { user } = useAuth()

  return (
    <div className={styles.wrap}>
      <div className={styles.eyebrow}>GrooveSharp</div>
      <h1 className={styles.title}>Banda</h1>
      <div className={styles.card}>
        {!supabaseEnabled || !user ? (
          <p className={styles.muted}>
            Entre na aba <b>Perfil</b> pra criar ou participar de uma banda. Aí o repertório fica
            compartilhado com os membros, e cada um acompanha a própria prática.
          </p>
        ) : (
          <p className={styles.muted}>
            Em breve: repertório compartilhado, membros, convites e o mapa de quem está pronto
            pra cada música. 🎵
          </p>
        )}
      </div>
    </div>
  )
}
