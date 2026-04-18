import { Recommendation } from '../types';

export type Action =
  | { type: 'SET_RECOMMENDATIONS'; payload: Recommendation[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'SET_MEDIA_TYPE'; payload: 'all' | 'anime' | 'manhwa' }
  | { type: 'SET_WATCHLIST'; payload: Recommendation[] }
  | { type: 'SET_DROPPED_LIST'; payload: Recommendation[] }
  | { type: 'SET_CURRENT_REC'; payload: Recommendation | null }
  | {
      type: 'UPDATE_SESSION_MEMORY';
      payload: { shown?: Record<string, number>; skipped?: Record<string, boolean> };
    }
  | { type: 'SET_TAG_PREFERENCES'; payload: Record<string, number> }
  | { type: 'SET_THINKING'; payload: boolean }
  | { type: 'SET_CANDIDATE_POOL'; payload: Recommendation[] };

export interface State {
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
  activeFilter: string;
  mediaType: 'all' | 'anime' | 'manhwa';
  watchlist: Recommendation[];
  droppedList: Recommendation[];
  candidatePool: Recommendation[];
  currentRec: Recommendation | null;
  sessionMemory: {
    shown: Record<string, number>;
    skipped: Record<string, boolean>;
  };
  tagPreferences: Record<string, number>;
  isThinking: boolean;
}

export const initialState: State = {
  recommendations: [],
  loading: false,
  error: null,
  activeFilter: 'All',
  mediaType: 'all',
  watchlist: [],
  droppedList: [],
  candidatePool: [],
  currentRec: null,
  sessionMemory: { shown: {}, skipped: {} },
  tagPreferences: {},
  isThinking: false,
};

export function recommendationReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_FILTER':
      return { ...state, activeFilter: action.payload };
    case 'SET_MEDIA_TYPE':
      return { ...state, mediaType: action.payload };
    case 'SET_WATCHLIST':
      return { ...state, watchlist: action.payload };
    case 'SET_DROPPED_LIST':
      return { ...state, droppedList: action.payload };
    case 'SET_CURRENT_REC':
      return { ...state, currentRec: action.payload };
    case 'UPDATE_SESSION_MEMORY':
      return {
        ...state,
        sessionMemory: {
          shown: { ...state.sessionMemory.shown, ...action.payload.shown },
          skipped: { ...state.sessionMemory.skipped, ...action.payload.skipped },
        },
      };
    case 'SET_TAG_PREFERENCES':
      return { ...state, tagPreferences: action.payload };
    case 'SET_THINKING':
      return { ...state, isThinking: action.payload };
    case 'SET_CANDIDATE_POOL':
      return { ...state, candidatePool: action.payload };
    default:
      return state;
  }
}
