import { useReducer, useEffect, useCallback, useState, useRef } from 'react';
import { fetchTopAnimeList } from '../lib/mal';
import { fetchTopManhwa } from '../lib/anilist';
import { calculateWorldBuildingScore, findBestRecommendation } from '../lib/scoring';
import { ELITE_ANIME, ELITE_MANHWA } from '../lib/elite';
import { WESEKAI_CONSTANTS } from '../wesekai.constants';
import { Recommendation, UnifiedContent } from '../types';
import { recommendationReducer, initialState, State } from './useRecommendationReducer';
import { migrateData } from './useLocalStorage';

const STORAGE_KEYS = {
  WATCHLIST: 'wesekai-arsenal',
  DROPPED: 'wesekai-dropped',
};

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

const loadPersistedData = (key: string): Recommendation[] => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? migrateData(JSON.parse(saved)) : [];
  } catch {
    return [];
  }
};

const initRecommendationState = (initial: State): State => ({
  ...initial,
  watchlist: loadPersistedData(STORAGE_KEYS.WATCHLIST),
  droppedList: loadPersistedData(STORAGE_KEYS.DROPPED),
});

export function useRecommendationEngine() {
  const [state, dispatch] = useReducer(
    recommendationReducer,
    initialState,
    initRecommendationState
  );

  const [toasts, setToasts] = useState<Toast[]>([]);
  const thinkingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    const toastTimeouts = toastTimeoutsRef.current;

    return () => {
      if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);
      toastTimeouts.forEach(clearTimeout);
    };
  }, []);

  const {
    recommendations,
    loading,
    error,
    activeFilter,
    mediaType,
    watchlist,
    droppedList,
    candidatePool,
    currentRec,
    sessionMemory,
    tagPreferences,
    isThinking,
  } = state;

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    const timeout = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      toastTimeoutsRef.current.delete(timeout);
    }, 3000);
    toastTimeoutsRef.current.add(timeout);
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DROPPED, JSON.stringify(droppedList));
  }, [droppedList]);

  const fetchRecommendations = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const filteredEliteAnime =
        mediaType === 'all' || mediaType === 'anime'
          ? ELITE_ANIME.filter(anime => {
              const hasBannedGenre = anime.tags.some(tag =>
                WESEKAI_CONSTANTS.BANNED_GENRES.some(b => tag.toLowerCase() === b.toLowerCase())
              );
              if (hasBannedGenre) return false;
              if (activeFilter === 'All') return true;
              return anime.tags.some(tag => tag.toLowerCase() === activeFilter.toLowerCase());
            })
          : [];

      const filteredEliteManhwa =
        mediaType === 'all' || mediaType === 'manhwa'
          ? ELITE_MANHWA.filter(manhwa => {
              const hasBannedGenre = manhwa.tags.some(tag =>
                WESEKAI_CONSTANTS.BANNED_GENRES.some(b => tag.toLowerCase() === b.toLowerCase())
              );
              if (hasBannedGenre) return false;
              if (activeFilter === 'All') return true;
              return manhwa.tags.some(tag => tag.toLowerCase() === activeFilter.toLowerCase());
            })
          : [];

      const eliteRecs = [...filteredEliteAnime, ...filteredEliteManhwa].map(contentData => {
        const scoring = calculateWorldBuildingScore(contentData.tags);
        return {
          title: contentData.title,
          tags: contentData.tags,
          contentData: contentData,
          wbScore: scoring.score,
          wbReasons: scoring.reasons,
          isElite: true,
        };
      });

      const [animeList, manhwaList] = await Promise.all([
        mediaType === 'all' || mediaType === 'anime'
          ? fetchTopAnimeList(activeFilter).catch(() => [] as UnifiedContent[])
          : Promise.resolve([] as UnifiedContent[]),
        mediaType === 'all' || mediaType === 'manhwa'
          ? fetchTopManhwa(activeFilter).catch(() => [] as UnifiedContent[])
          : Promise.resolve([] as UnifiedContent[]),
      ]);

      if (eliteRecs.length === 0 && animeList.length === 0 && manhwaList.length === 0) {
        throw new Error('Could not fetch data from sources. Please try again later.');
      }

      const apiRecs = [...animeList, ...manhwaList].map(contentData => {
        const scoring = calculateWorldBuildingScore(contentData.tags);
        return {
          title: contentData.title,
          tags: contentData.tags,
          contentData: contentData,
          wbScore: scoring.score,
          wbReasons: scoring.reasons,
          isElite: false,
        };
      });

      const combined = [...eliteRecs, ...apiRecs];
      const uniqueRecs = Array.from(
        new Map(combined.map(item => [item.contentData.url, item])).values()
      );

      uniqueRecs.sort((a, b) => {
        if (a.isElite && !b.isElite) return -1;
        if (!a.isElite && b.isElite) return 1;
        const yearA = a.contentData.year || 0;
        const yearB = b.contentData.year || 0;
        if (yearA !== yearB) return yearB - yearA;
        return b.wbScore - a.wbScore;
      });

      dispatch({ type: 'SET_RECOMMENDATIONS', payload: uniqueRecs });
      dispatch({ type: 'SET_CANDIDATE_POOL', payload: uniqueRecs });
      dispatch({ type: 'SET_CURRENT_REC', payload: null });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'An unknown error occurred.',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [activeFilter, mediaType, dispatch]);

  useEffect(() => {
    let isMounted = true;
    const handler = setTimeout(() => {
      if (isMounted) {
        fetchRecommendations();
      }
    }, 400); // Debounce filter/media changes

    return () => {
      isMounted = false;
      clearTimeout(handler);
    };
  }, [fetchRecommendations, activeFilter, mediaType]);

  const computeNext = useCallback(() => {
    if (candidatePool.length === 0) return;

    const watchlistUrls = new Set(watchlist.map(w => w.contentData.url));
    const droppedUrls = new Set(droppedList.map(d => d.contentData.url));

    const bestRec = findBestRecommendation(
      candidatePool,
      watchlistUrls,
      droppedUrls,
      tagPreferences,
      sessionMemory
    );

    if (bestRec) {
      dispatch({ type: 'SET_CURRENT_REC', payload: bestRec });
      dispatch({
        type: 'UPDATE_SESSION_MEMORY',
        payload: {
          shown: {
            [bestRec.contentData.url]: (sessionMemory.shown[bestRec.contentData.url] || 0) + 1,
          },
        },
      });
    } else {
      dispatch({ type: 'SET_CURRENT_REC', payload: null });
      fetchRecommendations();
    }
  }, [candidatePool, watchlist, droppedList, sessionMemory, tagPreferences, fetchRecommendations]);

  const triggerNext = useCallback(() => {
    if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);

    dispatch({ type: 'SET_CURRENT_REC', payload: null });
    dispatch({ type: 'SET_THINKING', payload: true });

    // Debounced "Thinking" period to ensure animation fluidity
    thinkingTimeoutRef.current = setTimeout(
      () => dispatch({ type: 'SET_THINKING', payload: false }),
      600
    );
  }, []);

  useEffect(() => {
    if (candidatePool.length > 0 && !currentRec && !loading && !isThinking) {
      computeNext();
    }
  }, [candidatePool, currentRec, loading, isThinking, computeNext]);

  const handleWatch = useCallback(
    (rec: Recommendation) => {
      dispatch({ type: 'SET_WATCHLIST', payload: [...watchlist, rec] });
      const nextPrefs = { ...tagPreferences };
      rec.tags.forEach(t => {
        const current = nextPrefs[t] || 0;
        nextPrefs[t] = current + 1.0 / (1 + Math.abs(current));
      });
      dispatch({ type: 'SET_TAG_PREFERENCES', payload: nextPrefs });
      addToast(`Added ${rec.title} to Arsenal`, 'success');
      triggerNext();
    },
    [watchlist, tagPreferences, triggerNext, addToast]
  );

  const handleSkip = useCallback(
    (rec: Recommendation) => {
      dispatch({
        type: 'UPDATE_SESSION_MEMORY',
        payload: { skipped: { [rec.contentData.url]: true } },
      });
      const nextPrefs = { ...tagPreferences };
      rec.tags.forEach(t => {
        const current = nextPrefs[t] || 0;
        nextPrefs[t] = current - 0.5 / (1 + Math.abs(current));
      });
      dispatch({ type: 'SET_TAG_PREFERENCES', payload: nextPrefs });
      addToast(`Skipped ${rec.title}`, 'info');
      triggerNext();
    },
    [tagPreferences, triggerNext, addToast]
  );

  const handleDrop = useCallback(
    (rec: Recommendation) => {
      dispatch({ type: 'SET_DROPPED_LIST', payload: [...droppedList, rec] });
      const nextPrefs = { ...tagPreferences };
      rec.tags.forEach(t => {
        const current = nextPrefs[t] || 0;
        nextPrefs[t] = current - 2.0 / (1 + Math.abs(current));
      });
      dispatch({ type: 'SET_TAG_PREFERENCES', payload: nextPrefs });
      addToast(`${rec.title} dropped. Vector purged.`, 'error');
      triggerNext();
    },
    [droppedList, tagPreferences, triggerNext, addToast]
  );

  const setMediaType = useCallback((payload: 'all' | 'anime' | 'manhwa') => {
    dispatch({ type: 'SET_MEDIA_TYPE', payload });
  }, []);

  const setActiveFilter = useCallback((payload: string) => {
    dispatch({ type: 'SET_FILTER', payload });
  }, []);

  const setWatchlist = useCallback((payload: Recommendation[]) => {
    dispatch({ type: 'SET_WATCHLIST', payload });
  }, []);

  const setDroppedList = useCallback((payload: Recommendation[]) => {
    dispatch({ type: 'SET_DROPPED_LIST', payload });
  }, []);

  return {
    recommendations,
    loading,
    error,
    activeFilter,
    setActiveFilter,
    mediaType,
    setMediaType,
    watchlist,
    setWatchlist,
    droppedList,
    setDroppedList,
    currentRec,
    sessionMemory,
    tagPreferences,
    isThinking,
    handleWatch,
    handleSkip,
    handleDrop,
    toasts,
    candidatePoolLength: candidatePool.length,
  };
}
