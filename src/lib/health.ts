import type { PracticeEntry, Rating } from '../types'

/**
 * Meia-vida da saúde (em dias) por avaliação: quanto mais você domina a música,
 * mais devagar ela perde saúde. Uma "mandei bem" fica verde por semanas; uma
 * "travei" fica vermelha em dias.
 */
export const HALF_LIFE: Record<Rating, number> = { solid: 60, ok: 14, shaky: 4 }

export const RATING_LABEL: Record<Rating, string> = {
  solid: 'Mandei bem',
  ok: 'Foi ok',
  shaky: 'Travei',
}

export const RATING_EMOJI: Record<Rating, string> = {
  solid: '😎',
  ok: '🙂',
  shaky: '😬',
}

/** Multiplicador máximo da escala de tempo (extremo "véspera de show"). */
export const MAX_SPEED = 240

export type HealthClass = 'green' | 'amber' | 'red' | 'none'

/** Limiares de cor da saúde (%). */
export const GREEN_THRESHOLD = 60
export const AMBER_THRESHOLD = 30

const MS_PER_DAY = 86_400_000

/** Dias decorridos desde o treino (nunca negativo), já com o "agora" informado. */
export function elapsedDays(entry: PracticeEntry, nowMs: number): number {
  return Math.max(0, (nowMs - entry.last) / MS_PER_DAY)
}

/**
 * Saúde da música de 0 a 100, ou `null` se nunca foi praticada.
 * `speed` acelera o decaimento proporcionalmente (escala de tempo).
 */
export function health(
  entry: PracticeEntry | undefined,
  nowMs: number,
  speed = 1,
): number | null {
  if (!entry) return null
  const halfLife = (HALF_LIFE[entry.rating] ?? 14) / speed
  const value = 100 * Math.pow(0.5, elapsedDays(entry, nowMs) / halfLife)
  return Math.max(0, Math.min(100, value))
}

/** Classe de cor a partir da saúde. */
export function healthClass(h: number | null): HealthClass {
  if (h == null) return 'none'
  if (h >= GREEN_THRESHOLD) return 'green'
  if (h >= AMBER_THRESHOLD) return 'amber'
  return 'red'
}

/** Precisa de atenção = crítica (vermelha) ou nunca praticada. */
export function needsAttention(h: number | null): boolean {
  return h == null || h < AMBER_THRESHOLD
}

/** Tempo (em dias) até a música sair do verde (cair abaixo de 60%). */
export function greenDays(rating: Rating, speed = 1): number {
  const halfLife = (HALF_LIFE[rating] ?? 14) / speed
  return (halfLife * Math.log(100 / GREEN_THRESHOLD)) / Math.log(2)
}

/** Converte a posição do slider (0..100) em multiplicador de velocidade. */
export function speedFromSlider(pos: number): number {
  return Math.pow(MAX_SPEED, pos / 100)
}

/** Converte o multiplicador de velocidade na posição do slider (0..100). */
export function sliderFromSpeed(speed: number): number {
  if (speed <= 1) return 0
  return Math.round((100 * Math.log(speed)) / Math.log(MAX_SPEED))
}
