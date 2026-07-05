/** Como foi o treino da música — define a velocidade com que a saúde cai. */
export type Rating = 'solid' | 'ok' | 'shaky'

/** Registro de um treino: como foi e quando (epoch ms). */
export interface PracticeEntry {
  rating: Rating
  last: number
}

/** Link extra de uma música (YouTube, cifra, etc.). */
export interface SongLink {
  label: string
  url: string
}

/** Uma música do setlist. */
export interface Song {
  id: string
  title: string
  artist: string
  /** Duração no formato "m:ss". */
  duration: string
  /** Links extras além da busca automática no Songsterr (F2). */
  links?: SongLink[]
  /** Dados de estudo (F2). */
  key?: string
  bpm?: number
  tuning?: string
  notes?: string
}

/** Um conjunto de músicas — por banda, por show, por fase de estudo. */
export interface Setlist {
  id: string
  name: string
  songs: Song[]
  /** Data do próximo show, ISO "YYYY-MM-DD" (F3). */
  showDate?: string
}

/** Estado completo do app, persistido no localStorage. */
export interface AppState {
  version: number
  setlists: Setlist[]
  activeSetlistId: string
  /** Estado de prática por música, chaveado pelo id da música. */
  practice: Record<string, PracticeEntry>
  /** Multiplicador da velocidade de decaimento da saúde (1 = padrão). */
  speed: number
}
