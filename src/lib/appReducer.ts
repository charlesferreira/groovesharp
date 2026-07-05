import type { AppState, Rating, Song } from '../types'

export type Action =
  | { type: 'replaceState'; state: AppState }
  | { type: 'rate'; songId: string; rating: Rating; now: number }
  | { type: 'clearRating'; songId: string }
  | { type: 'setSpeed'; speed: number }
  | { type: 'resetPractice' }
  | { type: 'addSetlist'; id: string; name: string }
  | { type: 'renameSetlist'; id: string; name: string }
  | { type: 'setShowDate'; id: string; date: string | undefined }
  | { type: 'deleteSetlist'; id: string }
  | { type: 'setActiveSetlist'; id: string }
  | { type: 'addSong'; setlistId: string; song: Song }
  | { type: 'updateSong'; setlistId: string; songId: string; patch: Partial<Song> }
  | { type: 'removeSong'; setlistId: string; songId: string }

function mapSongs(state: AppState, setlistId: string, fn: (songs: Song[]) => Song[]): AppState {
  return {
    ...state,
    setlists: state.setlists.map((s) => (s.id === setlistId ? { ...s, songs: fn(s.songs) } : s)),
  }
}

function withoutKeys(practice: AppState['practice'], ids: string[]): AppState['practice'] {
  const next = { ...practice }
  for (const id of ids) delete next[id]
  return next
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'replaceState':
      return action.state

    case 'rate':
      return {
        ...state,
        practice: { ...state.practice, [action.songId]: { rating: action.rating, last: action.now } },
      }

    case 'clearRating':
      return { ...state, practice: withoutKeys(state.practice, [action.songId]) }

    case 'setSpeed':
      return { ...state, speed: action.speed }

    case 'resetPractice':
      return { ...state, practice: {} }

    case 'addSetlist': {
      const setlist = { id: action.id, name: action.name, songs: [] }
      return { ...state, setlists: [...state.setlists, setlist], activeSetlistId: action.id }
    }

    case 'renameSetlist':
      return {
        ...state,
        setlists: state.setlists.map((s) =>
          s.id === action.id ? { ...s, name: action.name } : s,
        ),
      }

    case 'setShowDate':
      return {
        ...state,
        setlists: state.setlists.map((s) =>
          s.id === action.id ? { ...s, showDate: action.date } : s,
        ),
      }

    case 'deleteSetlist': {
      // nunca deixa o app sem nenhum setlist
      if (state.setlists.length <= 1) return state
      const target = state.setlists.find((s) => s.id === action.id)
      if (!target) return state
      const setlists = state.setlists.filter((s) => s.id !== action.id)
      const activeSetlistId =
        state.activeSetlistId === action.id ? setlists[0].id : state.activeSetlistId
      return {
        ...state,
        setlists,
        activeSetlistId,
        practice: withoutKeys(
          state.practice,
          target.songs.map((song) => song.id),
        ),
      }
    }

    case 'setActiveSetlist':
      return state.setlists.some((s) => s.id === action.id)
        ? { ...state, activeSetlistId: action.id }
        : state

    case 'addSong':
      return mapSongs(state, action.setlistId, (songs) => [...songs, action.song])

    case 'updateSong':
      return mapSongs(state, action.setlistId, (songs) =>
        songs.map((song) => (song.id === action.songId ? { ...song, ...action.patch } : song)),
      )

    case 'removeSong':
      return {
        ...mapSongs(state, action.setlistId, (songs) =>
          songs.filter((song) => song.id !== action.songId),
        ),
        practice: withoutKeys(state.practice, [action.songId]),
      }

    default:
      return state
  }
}
