import { useState } from 'react'
import { TabBar, type Tab } from './components/TabBar'
import { useAuth } from './hooks/useAuth'
import { supabaseEnabled } from './lib/supabase'
import { BandScreen } from './screens/BandScreen'
import { CloudPractice } from './screens/CloudPractice'
import { LocalPractice } from './screens/LocalPractice'
import { ProfileScreen } from './screens/ProfileScreen'

export default function App() {
  const [tab, setTab] = useState<Tab>('practice')
  const { user, loading } = useAuth()

  // logado → nuvem; deslogado → local (login é opcional)
  const practice =
    supabaseEnabled && loading ? null : user ? <CloudPractice userId={user.id} /> : <LocalPractice />

  return (
    <>
      {/* Praticar fica sempre montado pra não perder estado (busca, scroll) ao trocar de aba */}
      <div style={{ display: tab === 'practice' ? 'block' : 'none' }}>{practice}</div>
      {tab === 'band' && <BandScreen />}
      {tab === 'profile' && <ProfileScreen />}

      <TabBar active={tab} onChange={setTab} />
    </>
  )
}
