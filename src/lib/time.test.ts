import { describe, expect, test } from 'vitest'
import { agoText, durationToSeconds, formatTotal, humanDays } from './time'

const DAY = 86_400_000
const HOUR = 3_600_000
const NOW = 1_700_000_000_000

describe('agoText', () => {
  test('descreve o tempo desde o treino', () => {
    expect(agoText({ rating: 'ok', last: NOW }, NOW)).toBe('agora')
    expect(agoText({ rating: 'ok', last: NOW - 3 * HOUR }, NOW)).toBe('há 3h')
    expect(agoText({ rating: 'ok', last: NOW - 1 * DAY }, NOW)).toBe('ontem')
    expect(agoText({ rating: 'ok', last: NOW - 5 * DAY }, NOW)).toBe('há 5 dias')
  })
})

describe('durationToSeconds', () => {
  test('converte m:ss em segundos', () => {
    expect(durationToSeconds('1:57')).toBe(117)
    expect(durationToSeconds('5:17')).toBe(317)
    expect(durationToSeconds('0:45')).toBe(45)
  })
})

describe('formatTotal', () => {
  test('formata segundos em h/min', () => {
    expect(formatTotal(117)).toBe('2min')
    expect(formatTotal(7595)).toBe('2h 7min') // total do setlist CBJR (2h6m35s → arredonda)
  })
})

describe('humanDays', () => {
  test('escolhe a unidade amigável', () => {
    expect(humanDays(3 / 24)).toBe('3h')
    expect(humanDays(0.5 / 24)).toBe('30min')
    expect(humanDays(5)).toBe('5 dias')
    expect(humanDays(60)).toBe('2 meses')
  })
})
