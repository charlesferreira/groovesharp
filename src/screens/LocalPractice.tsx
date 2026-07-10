import { useAppState } from '../hooks/useAppState'
import { PracticeScreen } from './PracticeScreen'

/** Modo local: estado no localStorage (sem conta). */
export function LocalPractice() {
  const store = useAppState()
  return <PracticeScreen store={store} />
}
