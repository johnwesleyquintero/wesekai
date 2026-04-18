import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { ToastContainer } from './components/Toast';
import { TelemetryModal } from './components/TelemetryModal';
import { AnimeListModal } from './components/AnimeListModal';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ErrorState } from './components/ErrorState';
import { RecommendationArea } from './components/RecommendationArea';
import { useRecommendationEngine } from './hooks/useRecommendationEngine';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MobileNav } from './components/MobileNav';
import { refreshEliteImages } from './lib/elite';

const FILTERS = [
  'All',
  'Isekai',
  'Fantasy',
  'Action',
  'Adventure',
  'Military',
  'Strategy',
  'Reincarnation',
  'Kingdom',
  'Comedy',
  'Romance',
  'Sci-Fi',
  'Drama',
];

export default function App() {
  const {
    loading,
    error,
    activeFilter,
    setActiveFilter,
    mediaType,
    setMediaType,
    watchlist,
    droppedList,
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
    candidatePoolLength,
    toasts,
  } = useRecommendationEngine();

  const [modalView, setModalView] = useState<'none' | 'arsenal' | 'dropped' | 'telemetry'>('none');

  // Update document title dynamically
  useEffect(() => {
    document.title = 'WESEKAI';
    refreshEliteImages();
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen text-zinc-50 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
        {/* Ambient Background Glow */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-32 sm:pb-12 flex flex-col items-center relative z-10">
          <Header
            mediaType={mediaType}
            setMediaType={setMediaType}
            setModalView={setModalView}
            droppedCount={droppedList.length}
            watchlistCount={watchlist.length}
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

        <MobileNav
          setModalView={setModalView}
          droppedCount={droppedList.length}
          watchlistCount={watchlist.length}
        />

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
                const urls = [rec.contentData.url];
                if (modalView === 'arsenal') {
                  handleBulkRemoveFromWatchlist(urls);
                } else {
                  handleBulkRemoveFromDropped(urls);
                }
              }}
              onBulkRemove={urls => {
                if (modalView === 'arsenal') {
                  handleBulkRemoveFromWatchlist(urls);
                } else {
                  handleBulkRemoveFromDropped(urls);
                }
              }}
              onClearAll={() => {
                if (modalView === 'arsenal') {
                  handleClearWatchlist();
                } else {
                  handleClearDropped();
                }
              }}
            />
          )}
        </AnimatePresence>
        <ToastContainer toasts={toasts} />
      </div>
    </ErrorBoundary>
  );
}
