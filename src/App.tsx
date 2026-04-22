import { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'motion/react';
import { ToastContainer } from './components/Toast';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ErrorState } from './components/ErrorState';
import { RecommendationArea } from './components/RecommendationArea';
import { useRecommendationEngine } from './hooks/useRecommendationEngine';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineIndicator } from './components/OfflineIndicator';
import { EmptyState } from './components/EmptyState';
import { MobileNav } from './components/MobileNav';
import { useApiManager } from './lib/api-manager';
import { refreshEliteImages } from './lib/elite';
import { WESEKAI_CONSTANTS } from './wesekai.constants';

// Lazy load modal components for better initial performance
const TelemetryModal = lazy(() =>
  import('./components/TelemetryModal').then(module => ({ default: module.TelemetryModal }))
);
const InfoModal = lazy(() =>
  import('./components/InfoModal').then(module => ({ default: module.InfoModal }))
);
const AnimeListModal = lazy(() =>
  import('./components/AnimeListModal').then(module => ({ default: module.AnimeListModal }))
);

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
    fetchRecommendations,
  } = useRecommendationEngine();

  const { isRateLimited } = useApiManager();
  const [modalView, setModalView] = useState<'none' | 'arsenal' | 'dropped' | 'telemetry' | 'info'>(
    'none'
  );

  // Update document title dynamically
  useEffect(() => {
    document.title = 'WESEKAI';
    refreshEliteImages();
  }, []);

  return (
    <ErrorBoundary
      onJikanRateLimitRetry={() =>
        (fetchRecommendations as (opts?: { useEliteFallback: boolean }) => void)({
          useEliteFallback: true,
        })
      }
    >
      <OfflineIndicator />
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
            filters={WESEKAI_CONSTANTS.FILTERS}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
          
          {isRateLimited && (
            <div className="mb-6 px-4 py-2 bg-orange-500/20 border border-orange-500/20 rounded-full text-orange-300 text-xs font-bold animate-pulse">
              SYSTEM: Temporal Throttling Active — API Rate Limit Detected
            </div>
          )}

          <ErrorState error={error} />

          {!loading && !currentRec && candidatePoolLength === 0 ? (
            <EmptyState 
              activeFilter={activeFilter}
              onResetFilters={() => setActiveFilter('All')}
              onRefresh={fetchRecommendations}
            />
          ) : (
            <RecommendationArea
              loading={loading}
              activeFilter={activeFilter}
              currentRec={currentRec}
              candidatePoolLength={candidatePoolLength}
              isThinking={isThinking}
              handleWatch={handleWatch}
              handleSkip={handleSkip}
              handleDrop={handleDrop}
              tagPreferences={tagPreferences}
              onResetFilters={() => setActiveFilter('All')}
              onRefresh={fetchRecommendations}
            />
          )}
        </div>

        <MobileNav
          setModalView={setModalView}
          droppedCount={droppedList.length}
          watchlistCount={watchlist.length}
        />

        {/* Modals */}
        <AnimatePresence>
          <Suspense fallback={null}>
            {modalView === 'telemetry' && (
              <TelemetryModal
                tagPreferences={tagPreferences}
                sessionMemory={sessionMemory}
                onClose={() => setModalView('none')}
              />
            )}
            {modalView === 'info' && <InfoModal onClose={() => setModalView('none')} />}
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
          </Suspense>
        </AnimatePresence>
        <ToastContainer toasts={toasts} />
      </div>
    </ErrorBoundary>
  );
}
