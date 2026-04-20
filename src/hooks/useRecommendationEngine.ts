import { useReducer, useEffect, useCallback, useRef } from 'react';
import { fetchTopAnimeList } from '../lib/mal';
import { fetchTopManhwa } from '../lib/anilist';
import {
  calculateWorldBuildingScore,
  findBestRecommendation,
  calculateDampedLearningFactor,
} from '../lib/scoring'; // Add calculateDampedLearningFactor
import { ELITE_ANIME, ELITE_MANHWA } from '../lib/elite';
import { WESEKAI_CONSTANTS } from '../wesekai.constants';
import { Recommendation, UnifiedContent } from '../types';
import { recommendationReducer, initialState, State } from './useRecommendationReducer';
import { migrateData } from './useLocalStorage';
import { useToast } from './useToast';

const STORAGE_KEYS = {
  WATCHLIST: 'wesekai-arsenal',
  DROPPED: 'wesekai-dropped',
};

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

  const { toasts, addToast } = useToast();
  const thinkingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);
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

  // Persistence
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
        localStorage.setItem(STORAGE_KEYS.DROPPED, JSON.stringify(droppedList));
      } catch (error) {
        console.error('Failed to sync state to localStorage:', error);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [watchlist, droppedList]);

  const fetchRecommendations = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const isBanned = (tags: string[]) =>
        tags.some(tag =>
          WESEKAI_CONSTANTS.BANNED_GENRES.some(b => tag.toLowerCase() === b.toLowerCase())
        );

      const filterContent = (items: UnifiedContent[]) =>
        items.filter(item => {
          if (isBanned(item.tags)) return false;
          if (activeFilter === 'All') return true;
          return item.tags.some(tag => tag.toLowerCase() === activeFilter.toLowerCase());
        });

      const filteredEliteAnime =
        mediaType === 'all' || mediaType === 'anime' ? filterContent(ELITE_ANIME) : [];

      const filteredEliteManhwa =
        mediaType === 'all' || mediaType === 'manhwa' ? filterContent(ELITE_MANHWA) : [];

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
        nextPrefs[t] = current + calculateDampedLearningFactor(current);
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
        nextPrefs[t] = current - 0.5 * calculateDampedLearningFactor(current);
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

  const handleBulkRemoveFromWatchlist = useCallback(
    (urls: string[]) => {
      const updated = watchlist.filter(item => !urls.includes(item.contentData.url));
      dispatch({ type: 'SET_WATCHLIST', payload: updated });
      addToast(`Removed ${urls.length} items from Arsenal`, 'info');
    },
    [watchlist, addToast]
  );

  const handleBulkRemoveFromDropped = useCallback(
    (urls: string[]) => {
      const updated = droppedList.filter(item => !urls.includes(item.contentData.url));
      dispatch({ type: 'SET_DROPPED_LIST', payload: updated });
      addToast(`Restored ${urls.length} items from Dropped`, 'info');
    },
    [droppedList, addToast]
  );

  const handleClearWatchlist = useCallback(() => {
    dispatch({ type: 'SET_WATCHLIST', payload: [] });
    addToast('Arsenal cleared.', 'info');
  }, [addToast]);

  const handleClearDropped = useCallback(() => {
    dispatch({ type: 'SET_DROPPED_LIST', payload: [] });
    addToast('Dropped list purged.', 'info');
  }, [addToast]);

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
    handleBulkRemoveFromWatchlist,
    handleBulkRemoveFromDropped,
    handleClearWatchlist,
    handleClearDropped,
    toasts,
    candidatePoolLength: candidatePool.length,
    fetchRecommendations,
  };
}
