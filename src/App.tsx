import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { fetchTopAnimeList } from './lib/mal';
import { calculateWorldBuildingScore } from './lib/scoring';
import { ELITE_ANIME } from './lib/elite';
import { WESEKAI_CONSTANTS } from './wesekai.constants';
import { Recommendation } from './types';
import { TelemetryModal } from './components/TelemetryModal';
import { AnimeListModal } from './components/AnimeListModal';
import { TopNavigation } from './components/TopNavigation';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ErrorState } from './components/ErrorState';
import { RecommendationArea } from './components/RecommendationArea';

const FILTERS = ['All', 'Isekai', 'Fantasy', 'Military', 'Strategy', 'Reincarnation'];

export default function App() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // v2 Features
  const [activeFilter, setActiveFilter] = useState('All');
  const [modalView, setModalView] = useState<'none' | 'arsenal' | 'dropped' | 'telemetry'>('none');
  const [watchlist, setWatchlist] = useState<Recommendation[]>(() => {
    const saved = localStorage.getItem('wesekai-arsenal');
    return saved ? JSON.parse(saved) : [];
  });
  const [droppedList, setDroppedList] = useState<Recommendation[]>(() => {
    const saved = localStorage.getItem('wesekai-dropped');
    return saved ? JSON.parse(saved) : [];
  });

  // Omakase Engine State
  const [candidatePool, setCandidatePool] = useState<Recommendation[]>([]);
  const [currentRec, setCurrentRec] = useState<Recommendation | null>(null);
  const [sessionMemory, setSessionMemory] = useState<{ shown: Record<string, number>, skipped: Set<string> }>({ shown: {}, skipped: new Set() });
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
    document.title = 'WESEKAI | Intelligence Layer';
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Get Elite Anime that match the filter
      const filteredElite = ELITE_ANIME.filter(anime => {
        const hasBannedGenre = anime.tags.some(tag => 
          WESEKAI_CONSTANTS.BANNED_GENRES.some(banned => tag.toLowerCase() === banned.toLowerCase())
        );
        if (hasBannedGenre) return false;

        if (activeFilter === 'All') return true;
        return anime.tags.some(tag => tag.toLowerCase() === activeFilter.toLowerCase());
      });

      const eliteRecs = filteredElite.map(animeData => {
        const scoring = calculateWorldBuildingScore(animeData.tags);
        return {
          title: animeData.title,
          tags: animeData.tags,
          malData: animeData,
          wbScore: scoring.score,
          wbReasons: scoring.reasons,
          isElite: true
        };
      });

      // 2. Fetch from API
      const animeList = await fetchTopAnimeList(activeFilter);

      if (!animeList || animeList.length === 0) {
        throw new Error("Could not fetch data from MyAnimeList. Please try again.");
      }

      const apiRecs = animeList.map(animeData => {
        const scoring = calculateWorldBuildingScore(animeData.tags);
        return {
          title: animeData.title,
          tags: animeData.tags,
          malData: animeData,
          wbScore: scoring.score,
          wbReasons: scoring.reasons,
          isElite: false
        };
      });

      // 3. Combine and Deduplicate
      const combined = [...eliteRecs, ...apiRecs];
      const uniqueRecs = Array.from(new Map(combined.map(item => [item.malData.url, item])).values());

      // 4. Sort: Elite first, then by WB Score
      uniqueRecs.sort((a, b) => {
        if (a.isElite && !b.isElite) return -1;
        if (!a.isElite && b.isElite) return 1;
        return b.wbScore - a.wbScore;
      });

      setCandidatePool(uniqueRecs);
      setCurrentRec(null); // Force compute next
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when filter changes
  useEffect(() => {
    fetchRecommendations();
  }, [activeFilter]);

  // Omakase Engine: Compute Next Best Anime
  const computeNext = useCallback(() => {
    if (candidatePool.length === 0) return;

    let bestRec: Recommendation | null = null;
    let bestScore = -Infinity;

    candidatePool.forEach(rec => {
      // Hard filters
      if (watchlist.some(w => w.malData.url === rec.malData.url)) return;
      if (droppedList.some(d => d.malData.url === rec.malData.url)) return;

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

      let finalScore = (rec.wbScore * 0.45) + (rec.malData.score * 0.25) + (tagMatchScore * 0.20) + (rec.isElite ? 2.0 : 0);

      finalScore *= driftMultiplier; // Apply Drift Engine Modifiers
      // -----------------------

      // Apply memory modifiers
      const shownCount = sessionMemory.shown[rec.malData.url] || 0;
      if (shownCount >= 3) finalScore *= 0.4;
      else if (shownCount >= 2) finalScore *= 0.7;

      if (sessionMemory.skipped.has(rec.malData.url)) finalScore *= 0.6;

      if (finalScore > bestScore) {
        bestScore = finalScore;
        
        // Calculate Confidence Score (0 to 1)
        // Max theoretical base score is ~11.5
        const normalizedScore = Math.min(1, finalScore / 11.5);
        const confidenceScore = Math.max(0, Math.min(1, normalizedScore * driftMultiplier));
        
        bestRec = { ...rec, confidenceScore, driftMultiplier };
      }
    });

    if (bestRec) {
      setCurrentRec(bestRec);
      setSessionMemory(prev => ({
        ...prev,
        shown: { ...prev.shown, [bestRec!.malData.url]: (prev.shown[bestRec!.malData.url] || 0) + 1 }
      }));
    } else {
      // Pool exhausted, fetch more
      setCurrentRec(null);
      fetchRecommendations();
    }
  }, [candidatePool, watchlist, droppedList, sessionMemory, tagPreferences]);

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
  const handleWatch = useCallback((rec: Recommendation) => {
    setWatchlist(prev => [...prev, rec]);
    setTagPreferences(prev => {
      const next = { ...prev };
      // Damped Learning: effect = baseWeight * (1 / (1 + currentAbsoluteWeight))
      rec.tags.forEach(t => {
        const current = next[t] || 0;
        next[t] = current + (1.0 / (1 + Math.abs(current)));
      });
      return next;
    });
    triggerNext();
  }, [triggerNext]);

  const handleSkip = useCallback((rec: Recommendation) => {
    setSessionMemory(prev => {
      const newSkipped = new Set(prev.skipped);
      newSkipped.add(rec.malData.url);
      return { ...prev, skipped: newSkipped };
    });
    setTagPreferences(prev => {
      const next = { ...prev };
      rec.tags.forEach(t => {
        const current = next[t] || 0;
        next[t] = current - (0.5 / (1 + Math.abs(current)));
      });
      return next;
    });
    triggerNext();
  }, [triggerNext]);

  const handleDrop = useCallback((rec: Recommendation) => {
    setDroppedList(prev => [...prev, rec]);
    setTagPreferences(prev => {
      const next = { ...prev };
      rec.tags.forEach(t => {
        const current = next[t] || 0;
        next[t] = current - (2.0 / (1 + Math.abs(current))); // Stronger but still damped
      });
      return next;
    });
    triggerNext();
  }, [triggerNext]);

  return (
    <div className="min-h-screen text-zinc-50 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <TopNavigation 
        setModalView={setModalView} 
        droppedCount={droppedList.length} 
        watchlistCount={watchlist.length} 
      />

      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 lg:py-32 flex flex-col items-center relative z-10">
        <Header />
        <FilterBar filters={FILTERS} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        <ErrorState error={error} />
        <RecommendationArea 
          loading={loading}
          currentRec={currentRec}
          candidatePoolLength={candidatePool.length}
          isThinking={isThinking}
          handleWatch={handleWatch}
          handleSkip={handleSkip}
          handleDrop={handleDrop}
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
            onRemove={(rec) => {
              if (modalView === 'arsenal') {
                setWatchlist(prev => prev.filter(item => item.malData.url !== rec.malData.url));
              } else {
                setDroppedList(prev => prev.filter(item => item.malData.url !== rec.malData.url));
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
