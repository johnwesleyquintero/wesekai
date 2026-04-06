import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { fetchTopAnimeList } from './lib/mal';
import { fetchTopManhwa } from './lib/anilist';
import { calculateWorldBuildingScore } from './lib/scoring';
import { ELITE_ANIME, ELITE_MANHWA } from './lib/elite';
import { WESEKAI_CONSTANTS } from './wesekai.constants';
import { Recommendation, UnifiedContent } from './types';
import { TelemetryModal } from './components/TelemetryModal';
import { AnimeListModal } from './components/AnimeListModal';
import { TopNavigation } from './components/TopNavigation';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ErrorState } from './components/ErrorState';
import { RecommendationArea } from './components/RecommendationArea';

const FILTERS = ['All', 'Isekai', 'Fantasy', 'Military', 'Strategy', 'Reincarnation'];

// Helper to migrate old localStorage data
const migrateData = (data: unknown[]): Recommendation[] => {
  if (!Array.isArray(data)) return [];
  return (data as any[]).filter(Boolean).map(item => {
    if (!item.contentData) {
      if (item.malData) {
        return {
          ...item,
          contentData: {
            ...item.malData,
            type: 'anime',
            tags: item.malData.tags || item.tags || [],
          },
        };
      } else {
        return {
          ...item,
          contentData: {
            url: item.url || Math.random().toString(),
            title: item.title || 'Unknown',
            type: 'anime',
            imageUrl: '',
            score: 0,
            synopsis: '',
            tags: item.tags || [],
          },
        };
      }
    }
    return item;
  });
};

export default function App() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // v2 Features
  const [activeFilter, setActiveFilter] = useState('All');
  const [mediaType, setMediaType] = useState<'all' | 'anime' | 'manhwa'>('all');
  const [modalView, setModalView] = useState<'none' | 'arsenal' | 'dropped' | 'telemetry'>('none');
  const [watchlist, setWatchlist] = useState<Recommendation[]>(() => {
    const saved = localStorage.getItem('wesekai-arsenal');
    return saved ? migrateData(JSON.parse(saved)) : [];
  });
  const [droppedList, setDroppedList] = useState<Recommendation[]>(() => {
    const saved = localStorage.getItem('wesekai-dropped');
    return saved ? migrateData(JSON.parse(saved)) : [];
  });

  // Omakase Engine State
  const [candidatePool, setCandidatePool] = useState<Recommendation[]>([]);
  const [currentRec, setCurrentRec] = useState<Recommendation | null>(null);
  const [sessionMemory, setSessionMemory] = useState<{
    shown: Record<string, number>;
    skipped: Set<string>;
  }>({ shown: {}, skipped: new Set() });
  const [tagPreferences, setTagPreferences] = useState<Record<string, number>>({});
  const [isThinking, setIsThinking] = useState(false);

  // Sync Watchlist to LocalStorage
  useEffect(() => {
    localStorage.setItem('wesekai-arsenal', JSON.stringify(watchlist));
  }, [watchlist]);

  // Sync Dropped to LocalStorage
  useEffect(() => {
    localStorage.setItem('wesekai-dropped', JSON.stringify(droppedList));
  }, [droppedList]);

  // Update document title dynamically
  useEffect(() => {
    document.title = 'WESEKAI';
  }, []);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Get Elite Anime & Manhwa that match the filter
      const filteredEliteAnime =
        mediaType === 'all' || mediaType === 'anime'
          ? ELITE_ANIME.filter(anime => {
              const hasBannedGenre = anime.tags.some(tag =>
                WESEKAI_CONSTANTS.BANNED_GENRES.some(
                  banned => tag.toLowerCase() === banned.toLowerCase()
                )
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
                WESEKAI_CONSTANTS.BANNED_GENRES.some(
                  banned => tag.toLowerCase() === banned.toLowerCase()
                )
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

      // 2. Fetch from APIs (Anime + Manhwa) with graceful fallback
      const fetchAnime =
        mediaType === 'all' || mediaType === 'anime'
          ? fetchTopAnimeList(activeFilter).catch(err => {
              console.warn('Anime API failed, falling back:', err);
              return [] as UnifiedContent[];
            })
          : Promise.resolve([] as UnifiedContent[]);

      const fetchManhwa =
        mediaType === 'all' || mediaType === 'manhwa'
          ? fetchTopManhwa(activeFilter).catch(err => {
              console.warn('Manhwa API failed, falling back:', err);
              return [] as UnifiedContent[];
            })
          : Promise.resolve([] as UnifiedContent[]);

      const [animeList, manhwaList] = await Promise.all([fetchAnime, fetchManhwa]);

      if (eliteRecs.length === 0 && animeList.length === 0 && manhwaList.length === 0) {
        throw new Error(
          'Could not fetch data from sources, and no Elite Anime matched your filter. Please try again later.'
        );
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

      // 3. Combine and Deduplicate
      const combined = [...eliteRecs, ...apiRecs];
      const uniqueRecs = Array.from(
        new Map(combined.map(item => [item.contentData.url, item])).values()
      );

      // 4. Sort: Elite first, then by Year, then by WB Score
      uniqueRecs.sort((a, b) => {
        if (a.isElite && !b.isElite) return -1;
        if (!a.isElite && b.isElite) return 1;

        const yearA = a.contentData.year || 0;
        const yearB = b.contentData.year || 0;
        if (yearA !== yearB) return yearB - yearA; // Newer first

        return b.wbScore - a.wbScore;
      });

      setRecommendations(uniqueRecs);
      setCandidatePool(uniqueRecs);
      setCurrentRec(null); // Force compute next
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, mediaType]);

  // Fetch on mount and when filter or mediaType changes
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Omakase Engine: Compute Next Best Anime
  const computeNext = useCallback(() => {
    if (candidatePool.length === 0) return;

    let bestRec: Recommendation | null = null;
    let bestScore = -Infinity;

    candidatePool.forEach(rec => {
      // Hard filters
      if (!rec?.contentData?.url) return;
      if (watchlist.some(w => w?.contentData?.url === rec.contentData.url)) return;
      if (droppedList.some(d => d?.contentData?.url === rec.contentData.url)) return;

      // --- DRIFT ENGINE v1 ---
      let rawTagScore = 0;
      let frozenBranchHits = 0;
      let positiveHits = 0;

      rec.tags.forEach(tag => {
        const weight = tagPreferences[tag] || 0;
        rawTagScore += weight;

        // Detect frozen branches (repeatedly skipped/dropped)
        if (weight <= -1.0) frozenBranchHits++;
        // Detect core taste orbit
        if (weight >= 1.0) positiveHits++;
      });

      // Drift Signal: Suppress anime that wander into frozen branches
      let driftMultiplier = 1.0;
      if (frozenBranchHits >= 2) {
        driftMultiplier = 0.1; // Total branch collapse
      } else if (frozenBranchHits === 1) {
        driftMultiplier = 0.4; // Heavy suppression
      }

      // Synergy Boost: Reward anime that hit multiple positive branches
      if (positiveHits >= 2) {
        driftMultiplier *= 1.3;
      }

      const tagMatchScore = Math.max(0, Math.min(10, 5 + rawTagScore));

      // Recency Bonus: Prioritize newer anime
      const currentYear = new Date().getFullYear();
      const recYear = rec.contentData.year || 2015; // Default to somewhat old if unknown
      const age = Math.max(0, currentYear - recYear);
      // Up to +2.5 for brand new, drops to 0 for 10+ years old
      const recencyBonus = Math.max(0, 2.5 - age * 0.25);

      let finalScore =
        rec.wbScore * 0.4 +
        rec.contentData.score * 0.2 +
        tagMatchScore * 0.2 +
        recencyBonus +
        (rec.isElite ? 2.0 : 0);

      finalScore *= driftMultiplier; // Apply Drift Engine Modifiers
      // -----------------------

      // Apply memory modifiers
      const shownCount = sessionMemory.shown[rec.contentData.url] || 0;
      if (shownCount >= 3) finalScore *= 0.4;
      else if (shownCount >= 2) finalScore *= 0.7;

      if (sessionMemory.skipped.has(rec.contentData.url)) finalScore *= 0.6;

      if (finalScore > bestScore) {
        bestScore = finalScore;

        // Calculate Confidence Score (0 to 1)
        // Max theoretical base score is ~12.5
        const normalizedScore = Math.min(1, finalScore / 12.5);
        const confidenceScore = Math.max(0, Math.min(1, normalizedScore * driftMultiplier));

        bestRec = { ...rec, confidenceScore, driftMultiplier };
      }
    });

    if (bestRec) {
      setCurrentRec(bestRec);
      setSessionMemory(prev => ({
        ...prev,
        shown: {
          ...prev.shown,
          [bestRec!.contentData.url]: (prev.shown[bestRec!.contentData.url] || 0) + 1,
        },
      }));
    } else {
      // Pool exhausted, fetch more
      setCurrentRec(null);
      fetchRecommendations();
    }
  }, [candidatePool, watchlist, droppedList, sessionMemory, tagPreferences, fetchRecommendations]);

  const triggerNext = useCallback(() => {
    // Allow React to commit the exitAction state in ResultCard before unmounting
    requestAnimationFrame(() => {
      setCurrentRec(null);
      setIsThinking(true);
      setTimeout(() => {
        setIsThinking(false);
      }, 400); // 400ms thinking pause
    });
  }, []);

  // Trigger computeNext when needed
  useEffect(() => {
    if (candidatePool.length > 0 && !currentRec && !loading && !isThinking) {
      computeNext();
    }
  }, [candidatePool, currentRec, loading, isThinking, computeNext]);

  // Action Handlers
  const handleWatch = useCallback(
    (rec: Recommendation) => {
      setWatchlist(prev => [...prev, rec]);
      setTagPreferences(prev => {
        const next = { ...prev };
        // Damped Learning: effect = baseWeight * (1 / (1 + currentAbsoluteWeight))
        rec.tags.forEach(t => {
          const current = next[t] || 0;
          next[t] = current + 1.0 / (1 + Math.abs(current));
        });
        return next;
      });
      triggerNext();
    },
    [triggerNext]
  );

  const handleSkip = useCallback(
    (rec: Recommendation) => {
      setSessionMemory(prev => {
        const newSkipped = new Set(prev.skipped);
        newSkipped.add(rec.contentData.url);
        return { ...prev, skipped: newSkipped };
      });
      setTagPreferences(prev => {
        const next = { ...prev };
        rec.tags.forEach(t => {
          const current = next[t] || 0;
          next[t] = current - 0.5 / (1 + Math.abs(current));
        });
        return next;
      });
      triggerNext();
    },
    [triggerNext]
  );

  const handleDrop = useCallback(
    (rec: Recommendation) => {
      setDroppedList(prev => [...prev, rec]);
      setTagPreferences(prev => {
        const next = { ...prev };
        rec.tags.forEach(t => {
          const current = next[t] || 0;
          next[t] = current - 2.0 / (1 + Math.abs(current)); // Stronger but still damped
        });
        return next;
      });
      triggerNext();
    },
    [triggerNext]
  );

  return (
    <div className="min-h-screen text-zinc-50 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      <TopNavigation
        setModalView={setModalView}
        droppedCount={droppedList.length}
        watchlistCount={watchlist.length}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-24 lg:py-32 flex flex-col items-center relative z-10">
        <Header
          mediaType={mediaType}
          setMediaType={setMediaType}
          recommendationCount={recommendations.length}
        />
        <FilterBar
          filters={FILTERS}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
        <ErrorState error={error} />
        <RecommendationArea
          loading={loading}
          currentRec={currentRec}
          candidatePoolLength={candidatePool.length}
          isThinking={isThinking}
          handleWatch={handleWatch}
          handleSkip={handleSkip}
          handleDrop={handleDrop}
          tagPreferences={tagPreferences}
        />
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalView === 'telemetry' && (
          <TelemetryModal
            tagPreferences={tagPreferences}
            sessionMemory={sessionMemory}
            onClose={() => setModalView('none')}
          />
        )}
        {(modalView === 'arsenal' || modalView === 'dropped') && (
          <AnimeListModal
            type={modalView}
            watchlist={modalView === 'arsenal' ? watchlist : droppedList}
            onClose={() => setModalView('none')}
            onRemove={rec => {
              if (modalView === 'arsenal') {
                setWatchlist(prev =>
                  prev.filter(item => item.contentData.url !== rec.contentData.url)
                );
              } else {
                setDroppedList(prev =>
                  prev.filter(item => item.contentData.url !== rec.contentData.url)
                );
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
