import { createClient } from '@supabase/supabase-js'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeAll, expect, test } from 'vitest'
import { supabase } from '../lib/supabase'
import { useCloudState } from './useCloudState'

// Requer o Supabase local rodando (npx supabase start) e Node 22+.
const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

let userId: string

beforeAll(async () => {
  const admin = createClient('http://127.0.0.1:54321', SERVICE_KEY, {
    auth: { persistSession: false },
  })
  const email = `hook${Date.now()}@test.com`
  await admin.auth.admin.createUser({ email, password: 'password123', email_confirm: true })
  const { data } = await supabase!.auth.signInWithPassword({ email, password: 'password123' })
  userId = data.user!.id
})

test('cria banda default, adiciona música e registra prática (fim a fim)', async () => {
  const { result } = renderHook(() => useCloudState(userId))

  // usuário novo → cria banda "Meu repertório" com um setlist
  await waitFor(() => expect(result.current.state.setlists.length).toBeGreaterThan(0), {
    timeout: 15000,
  })
  const setlistId = result.current.state.setlists[0].id

  // adiciona uma música
  act(() => result.current.addSong(setlistId, { title: 'Teste', artist: 'X', duration: '3:00' }))
  await waitFor(
    () => expect(result.current.state.setlists[0].songs.some((s) => s.title === 'Teste')).toBe(true),
    { timeout: 15000 },
  )
  const songId = result.current.state.setlists[0].songs.find((s) => s.title === 'Teste')!.id

  // avalia e confirma que a prática foi registrada
  act(() => result.current.rate(songId, 'solid'))
  await waitFor(() => expect(result.current.state.practice[songId]?.rating).toBe('solid'), {
    timeout: 15000,
  })
})
