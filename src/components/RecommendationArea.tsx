import { AnimatePresence } from 'motion/react';
import { SkeletonCard } from './SkeletonCard';
import { ResultCard } from './ResultCard';
import { EmptyState } from './EmptyState';
import { IntelligenceLoader } from './IntelligenceLoader';
import { Recommendation } from '../types';

interface RecommendationAreaProps {
  loading: boolean;
  activeFilter: string;
  currentRec: Recommendation | null;
  candidatePoolLength: number;
  isThinking: boolean;
  handleWatch: (rec: Recommendation) => void;
  handleSkip: (rec: Recommendation) => void;
  handleDrop: (rec: Recommendation) => void;
  tagPreferences: Record<string, number>;
  onResetFilters?: () => void;
  onRefresh?: () => void;
}

export function RecommendationArea({
  loading,
  activeFilter,
  currentRec,
  candidatePoolLength,
  isThinking,
  handleWatch,
  handleSkip,
  handleDrop,
  tagPreferences,
  onResetFilters,
  onRefresh,
}: RecommendationAreaProps) {
  return (
    <div className="w-full relative min-h-[500px] flex justify-center items-start mt-12">
      {loading && !currentRec ? (
        <div className="w-full max-w-4xl">
          <SkeletonCard />
        </div>
      ) : currentRec ? (
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            <ResultCard
              key={currentRec.contentData.url}
              recommendation={currentRec}
              onWatch={() => handleWatch(currentRec)}
              onSkip={() => handleSkip(currentRec)}
              onDrop={() => handleDrop(currentRec)}
              tagPreferences={tagPreferences}
            />
          </AnimatePresence>
        </div>
      ) : (!loading && candidatePoolLength > 0) || isThinking ? (
        <IntelligenceLoader />
      ) : (
        <EmptyState
          key="empty"
          activeFilter={activeFilter}
          onResetFilters={onResetFilters || (() => {})}
          onRefresh={onRefresh || (() => {})}
        />
      )}
    </div>
  );
}
