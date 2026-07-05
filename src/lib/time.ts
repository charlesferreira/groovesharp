import type { PracticeEntry } from '../types'
import { elapsedDays } from './health'

/** Texto relativo do último treino: "agora", "há 3h", "ontem", "há 5 dias". */
export function agoText(entry: PracticeEntry, nowMs: number): string {
  const days = elapsedDays(entry, nowMs)
  if (days < 1 / 24) return 'agora'
  if (days < 1) return `há ${Math.round(days * 24)}h`
  const d = Math.round(days)
  return d === 1 ? 'ontem' : `há ${d} dias`
}

/** Converte "m:ss" em segundos. */
export function durationToSeconds(duration: string): number {
  const [m, s] = duration.split(':').map(Number)
  return (m || 0) * 60 + (s || 0)
}

/** Formata segundos como "1h 23min" ou "45min". */
export function formatTotal(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return (h ? `${h}h ` : '') + `${m}min`
}

/** Formata uma duração em dias de forma amigável: "36min", "9h", "5 dias", "2 meses". */
export function humanDays(days: number): string {
  if (days < 1) {
    const hours = days * 24
    return hours < 1 ? `${Math.round(hours * 60)}min` : `${Math.round(hours)}h`
  }
  if (days < 45) return `${Math.round(days)} dias`
  return `${Math.round(days / 30)} meses`
}
