import { describe, expect, test } from 'vitest'
import { defaultAppState } from '../data/defaultSetlist'
import { isAppState, parseBackup, serializeBackup } from './backup'

describe('backup', () => {
  test('valida um estado bem formado', () => {
    expect(isAppState(defaultAppState())).toBe(true)
  })

  test('rejeita formatos inválidos', () => {
    expect(isAppState(null)).toBe(false)
    expect(isAppState({})).toBe(false)
    expect(isAppState({ setlists: [], activeSetlistId: 'x' })).toBe(false)
  })

  test('serialização e parse fazem round-trip', () => {
    const state = defaultAppState()
    const parsed = parseBackup(serializeBackup(state))
    expect(parsed).toEqual(state)
  })

  test('parseBackup retorna null para JSON inválido ou fora do formato', () => {
    expect(parseBackup('não é json')).toBeNull()
    expect(parseBackup('{"foo":1}')).toBeNull()
  })
})
