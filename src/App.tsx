import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { TelemetryModal } from './components/TelemetryModal';
import { AnimeListModal } from './components/AnimeListModal';
import { TopNavigation } from './components/TopNavigation';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ErrorState } from './components/ErrorState';
import { RecommendationArea } from './components/RecommendationArea';
import { useRecommendationEngine } from './hooks/useRecommendationEngine';

const FILTERS = ['All', 'Isekai', 'Fantasy', 'Military', 'Strategy', 'Reincarnation'];

export default function App() {
  const {
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
    candidatePoolLength,
  } = useRecommendationEngine();

  const [modalView, setModalView] = useState<'none' | 'arsenal' | 'dropped' | 'telemetry'>('none');

  // Update document title dynamically
  useEffect(() => {
    document.title = 'WESEKAI';
  }, []);

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
          candidatePoolLength={candidatePoolLength}
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
