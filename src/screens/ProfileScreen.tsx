import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabaseEnabled } from '../lib/supabase'
import styles from './ProfileScreen.module.css'

export function ProfileScreen() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function run(fn: (e: string, p: string) => Promise<unknown>) {
    setError(null)
    const res = (await fn(email, password)) as { error?: { message: string } } | undefined
    if (res?.error) setError(res.error.message)
  }

  const name = (user?.user_metadata?.full_name as string) ?? user?.email?.split('@')[0] ?? ''
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  return (
    <div className={styles.wrap}>
      <div className={styles.eyebrow}>GrooveSharp</div>
      <h1 className={styles.title}>Perfil</h1>

      {!supabaseEnabled ? (
        <div className={styles.card}>
          <p className={styles.muted}>
            Sincronização indisponível — o app está rodando em <b>modo local</b> (seus dados ficam
            só neste aparelho). Quando o backend estiver configurado, você poderá entrar, sincronizar
            entre dispositivos e criar bandas.
          </p>
        </div>
      ) : loading ? (
        <div className={styles.card}>
          <p className={styles.muted}>Carregando…</p>
        </div>
      ) : user ? (
        <div className={styles.card}>
          <div className={styles.userRow}>
            {avatarUrl ? (
              <img className={styles.avatar} src={avatarUrl} alt="" />
            ) : (
              <div className={styles.avatar}>{name.charAt(0).toUpperCase()}</div>
            )}
            <div>
              <div className={styles.name}>{name}</div>
              <div className={styles.muted}>{user.email}</div>
            </div>
          </div>
          <button className={styles.btnGhost} onClick={() => signOut()}>
            Sair
          </button>
        </div>
      ) : (
        <div className={styles.card}>
          <p className={styles.muted}>Entre pra sincronizar entre dispositivos e criar bandas.</p>
          <button className={styles.btnGoogle} onClick={() => signInWithGoogle()}>
            Entrar com Google
          </button>

          <div className={styles.divider}>ou e-mail</div>

          <input
            className={styles.input}
            type="email"
            placeholder="e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            className={styles.input}
            type="password"
            placeholder="senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <div className={styles.formActions}>
            <button className={styles.btn} onClick={() => run(signInWithEmail)}>
              Entrar
            </button>
            <button className={styles.btnGhost} onClick={() => run(signUpWithEmail)}>
              Criar conta
            </button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      )}
    </div>
  )
}
