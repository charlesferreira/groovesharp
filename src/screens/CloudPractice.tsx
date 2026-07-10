import { useCloudState } from '../hooks/useCloudState'
import { PracticeScreen } from './PracticeScreen'

/** Modo nuvem: repertório da banda + prática pessoal no Supabase. */
export function CloudPractice({ userId }: { userId: string }) {
  const store = useCloudState(userId)
  return <PracticeScreen store={store} />
}
