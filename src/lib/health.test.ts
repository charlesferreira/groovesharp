import { describe, expect, test } from 'vitest'
import type { PracticeEntry } from '../types'
import {
  greenDays,
  health,
  healthClass,
  MAX_SPEED,
  needsAttention,
  sliderFromSpeed,
  speedFromSlider,
} from './health'

const DAY = 86_400_000
const NOW = 1_700_000_000_000

function entry(rating: PracticeEntry['rating'], daysAgo: number): PracticeEntry {
  return { rating, last: NOW - daysAgo * DAY }
}

describe('health', () => {
  test('retorna null quando nunca praticada', () => {
    expect(health(undefined, NOW)).toBeNull()
  })

  test('está em 100 logo após o treino', () => {
    expect(health(entry('solid', 0), NOW)).toBeCloseTo(100)
  })

  test('cai pela metade após uma meia-vida', () => {
    expect(health(entry('solid', 60), NOW)).toBeCloseTo(50)
    expect(health(entry('ok', 14), NOW)).toBeCloseTo(50)
    expect(health(entry('shaky', 4), NOW)).toBeCloseTo(50)
  })

  test('nunca passa de 100 mesmo com data no futuro', () => {
    const future: PracticeEntry = { rating: 'shaky', last: NOW + 100 * DAY }
    expect(health(future, NOW)).toBeLessThanOrEqual(100)
    expect(health(future, NOW)).toBeGreaterThanOrEqual(0)
  })

  test('speed acelera o decaimento proporcionalmente', () => {
    // com speed 2, a meia-vida da solid cai de 60 para 30 dias
    expect(health(entry('solid', 30), NOW, 2)).toBeCloseTo(50)
  })
})

describe('healthClass', () => {
  test('mapeia faixas de cor', () => {
    expect(healthClass(null)).toBe('none')
    expect(healthClass(100)).toBe('green')
    expect(healthClass(60)).toBe('green')
    expect(healthClass(59)).toBe('amber')
    expect(healthClass(30)).toBe('amber')
    expect(healthClass(29)).toBe('red')
    expect(healthClass(0)).toBe('red')
  })
})

describe('needsAttention', () => {
  test('nunca praticada ou crítica precisa de atenção', () => {
    expect(needsAttention(null)).toBe(true)
    expect(needsAttention(20)).toBe(true)
    expect(needsAttention(40)).toBe(false)
    expect(needsAttention(90)).toBe(false)
  })
})

describe('greenDays', () => {
  test('uma solid fica ~44 dias no verde no ritmo padrão', () => {
    expect(greenDays('solid')).toBeCloseTo(44.2, 1)
  })

  test('speed maior encurta o tempo no verde', () => {
    expect(greenDays('solid', 10)).toBeCloseTo(greenDays('solid') / 10, 5)
  })
})

describe('conversão slider <-> speed', () => {
  test('extremos', () => {
    expect(speedFromSlider(0)).toBeCloseTo(1)
    expect(speedFromSlider(100)).toBeCloseTo(MAX_SPEED)
    expect(sliderFromSpeed(1)).toBe(0)
    expect(sliderFromSpeed(MAX_SPEED)).toBe(100)
  })

  test('ida e volta', () => {
    for (const pos of [10, 40, 55, 80]) {
      expect(sliderFromSpeed(speedFromSlider(pos))).toBe(pos)
    }
  })
})
