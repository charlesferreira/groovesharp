import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<unknown>
  signInWithEmail: (email: string, password: string) => Promise<unknown>
  signOut: () => Promise<unknown>
}

/** Sessão do usuário via Supabase Auth. Sem backend configurado, fica sempre deslogado. */
export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => sub.subscription.unsubscribe()
  }, [])

  return {
    session,
    user: session?.user ?? null,
    loading,
    signInWithGoogle: () =>
      supabase?.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.href },
      }) ?? Promise.resolve(),
    signInWithEmail: (email, password) =>
      supabase?.auth.signInWithPassword({ email, password }) ?? Promise.resolve(),
    signOut: () => supabase?.auth.signOut() ?? Promise.resolve(),
  }
}
