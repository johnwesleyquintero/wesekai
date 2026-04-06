import { useReducer, useEffect, useCallback } from 'react';
import { fetchTopAnimeList } from '../lib/mal';
import { fetchTopManhwa } from '../lib/anilist';
import { calculateWorldBuildingScore } from '../lib/scoring';
import { ELITE_ANIME, ELITE_MANHWA } from '../lib/elite';
import { WESEKAI_CONSTANTS } from '../wesekai.constants';
import { Recommendation, UnifiedContent } from '../types';
import { recommendationReducer, initialState } from './useRecommendationReducer';
import { migrateData } from './useLocalStorage';

const STORAGE_KEYS = {
  WATCHLIST: 'wesekai-arsenal',
  DROPPED: 'wesekai-dropped',
};

export function useRecommendationEngine() {
  const [state, dispatch] = useReducer(recommendationReducer, {
    ...initialState,
    watchlist: (() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
        return saved ? migrateData(JSON.parse(saved)) : [];
      } catch {
        return [];
      }
    })(),
    droppedList: (() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.DROPPED);
        return saved ? migrateData(JSON.parse(saved)) : [];
      } catch {
        return [];
      }
    })(),
  });

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
    fetchRecommendations();
  }, [fetchRecommendations, activeFilter, mediaType]);

  const computeNext = useCallback(() => {
    if (candidatePool.length === 0) return;

    let bestRec: Recommendation | null = null;
    let bestScore = -Infinity;

    const watchlistUrls = new Set(watchlist.map(w => w.contentData.url));
    const droppedUrls = new Set(droppedList.map(d => d.contentData.url));
    const currentYear = new Date().getFullYear();

    (candidatePool as Recommendation[]).forEach((rec: Recommendation) => {
      if (!rec?.contentData?.url) return;
      if (watchlistUrls.has(rec.contentData.url)) return;
      if (droppedUrls.has(rec.contentData.url)) return;

      let rawTagScore = 0;
      let frozenBranchHits = 0;
      let positiveHits = 0;

      rec.tags.forEach(tag => {
        const weight = tagPreferences[tag] || 0;
        rawTagScore += weight;
        if (weight <= -1.0) frozenBranchHits++;
        if (weight >= 1.0) positiveHits++;
      });

      let driftMultiplier = 1.0;
      if (frozenBranchHits >= 2) driftMultiplier = 0.1;
      else if (frozenBranchHits === 1) driftMultiplier = 0.4;
      if (positiveHits >= 2) driftMultiplier *= 1.3;

      const tagMatchScore = Math.max(0, Math.min(10, 5 + rawTagScore));
      const age = Math.max(0, currentYear - (rec.contentData.year || 2015));
      const recencyBonus = Math.max(0, 2.5 - age * 0.25);

      let finalScore =
        rec.wbScore * 0.4 +
        rec.contentData.score * 0.2 +
        tagMatchScore * 0.2 +
        recencyBonus +
        (rec.isElite ? 2.0 : 0);

      finalScore *= driftMultiplier;

      const shownCount = sessionMemory.shown[rec.contentData.url] || 0;
      if (shownCount >= 3) finalScore *= 0.4;
      else if (shownCount >= 2) finalScore *= 0.7;
      if (sessionMemory.skipped.has(rec.contentData.url)) finalScore *= 0.6;

      if (finalScore > bestScore) {
        bestScore = finalScore;
        const normalizedScore = Math.min(1, finalScore / 12.5);
        const confidenceScore = Math.max(0, Math.min(1, normalizedScore * driftMultiplier));
        bestRec = { ...rec, confidenceScore, driftMultiplier };
      }
    });

    if (bestRec) {
      const rec = bestRec as Recommendation;
      dispatch({ type: 'SET_CURRENT_REC', payload: rec });
      dispatch({
        type: 'UPDATE_SESSION_MEMORY',
        payload: {
          shown: { [rec.contentData.url]: (sessionMemory.shown[rec.contentData.url] || 0) + 1 },
        },
      });
    } else {
      dispatch({ type: 'SET_CURRENT_REC', payload: null });
      fetchRecommendations();
    }
  }, [candidatePool, watchlist, droppedList, sessionMemory, tagPreferences, fetchRecommendations]);

  const triggerNext = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_REC', payload: null });
    dispatch({ type: 'SET_THINKING', payload: true });
    setTimeout(() => dispatch({ type: 'SET_THINKING', payload: false }), 400);
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
      triggerNext();
    },
    [watchlist, tagPreferences, triggerNext]
  );

  const handleSkip = useCallback(
    (rec: Recommendation) => {
      const newSkipped = new Set(sessionMemory.skipped);
      newSkipped.add(rec.contentData.url);
      dispatch({ type: 'UPDATE_SESSION_MEMORY', payload: { skipped: newSkipped } });
      const nextPrefs = { ...tagPreferences };
      rec.tags.forEach(t => {
        const current = nextPrefs[t] || 0;
        nextPrefs[t] = current - 0.5 / (1 + Math.abs(current));
      });
      dispatch({ type: 'SET_TAG_PREFERENCES', payload: nextPrefs });
      triggerNext();
    },
    [sessionMemory.skipped, tagPreferences, triggerNext]
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
      triggerNext();
    },
    [droppedList, tagPreferences, triggerNext]
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
    candidatePoolLength: candidatePool.length,
  };
}
