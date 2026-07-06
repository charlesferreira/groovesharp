import { useState } from 'react'
import { TabBar, type Tab } from './components/TabBar'
import { BandScreen } from './screens/BandScreen'
import { PracticeScreen } from './screens/PracticeScreen'
import { ProfileScreen } from './screens/ProfileScreen'

export default function App() {
  const [tab, setTab] = useState<Tab>('practice')

  return (
    <>
      {/* Praticar fica sempre montado pra não perder estado (busca, scroll) ao trocar de aba */}
      <div style={{ display: tab === 'practice' ? 'block' : 'none' }}>
        <PracticeScreen />
      </div>
      {tab === 'band' && <BandScreen />}
      {tab === 'profile' && <ProfileScreen />}

      <TabBar active={tab} onChange={setTab} />
    </>
  )
}
