import type { AppState, Setlist, Song } from '../types'
import { slug } from '../lib/id'

const ARTIST = 'Charlie Brown Jr'

/** Lista original do protótipo: [título, duração]. */
const CBJR: Array<[string, string]> = [
  ['Pipeline', '1:57'],
  ['Não Viva Em Vão', '3:55'],
  ['Lutar Pelo Que É Meu', '3:57'],
  ['Tudo Mudar', '2:14'],
  ['Te Levar Daqui', '3:05'],
  ['Pontes Indestrutíveis', '3:31'],
  ['Tamo Aí Na Atividade', '3:40'],
  ['Lugar Ao Sol', '3:33'],
  ['Senhor Do Tempo', '3:23'],
  ['Como Tudo Deve Ser', '4:33'],
  ['Não É Sério', '4:52'],
  ['Zoio De Lula', '4:12'],
  ['Meu Novo Mundo', '3:27'],
  ['Ela Vai Voltar', '3:08'],
  ['Dias De Luta, Dias De Glória', '2:21'],
  ['Longe De Você', '3:35'],
  ['Céu Azul', '3:19'],
  ['Só Os Loucos Sabem', '3:16'],
  ['Quebra-Mar', '1:54'],
  ['Tudo Pro Alto', '3:04'],
  ['Samba Makossa', '4:06'],
  ['Vícios E Virtudes', '3:10'],
  ['Quinta-Feira', '5:17'],
  ['Não Uso Sapato', '2:53'],
  ['O Preço', '3:31'],
  ['Só Por Uma Noite', '3:23'],
  ['Me Encontra', '3:31'],
  ['Dona Do Meu Pensamento', '4:00'],
  ['Sino Dourado', '2:41'],
  ['Hoje Eu Acordei Feliz', '2:18'],
  ['O Coro Vai Comê', '2:21'],
  ['Tudo Que Ela Gosta De Escutar', '2:56'],
  ['Rubão, O Dono Do Mundo', '2:15'],
  ['Proibida Pra Mim', '2:48'],
  ['Confisco', '2:59'],
  ['Papo Reto', '3:31'],
  ['Não Deixe O Mar Te Engolir', '5:09'],
  ['Gimme O Anel', '2:50'],
]

export function defaultSongs(): Song[] {
  return CBJR.map(([title, duration]) => ({
    id: slug(title),
    title,
    artist: ARTIST,
    duration,
  }))
}

export function defaultSetlist(): Setlist {
  return {
    id: 'cbjr',
    name: 'Charlie Brown Jr.',
    songs: defaultSongs(),
  }
}

export const STATE_VERSION = 1

export function defaultAppState(): AppState {
  const setlist = defaultSetlist()
  return {
    version: STATE_VERSION,
    setlists: [setlist],
    activeSetlistId: setlist.id,
    practice: {},
    speed: 1,
  }
}
