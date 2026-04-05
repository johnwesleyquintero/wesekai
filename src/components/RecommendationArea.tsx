import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu } from 'lucide-react';
import { SkeletonCard } from './SkeletonCard';
import { ResultCard } from './ResultCard';
import { EmptyState } from './EmptyState';
import { Recommendation } from '../types';

interface RecommendationAreaProps {
  loading: boolean;
  currentRec: Recommendation | null;
  candidatePoolLength: number;
  isThinking: boolean;
  handleWatch: (rec: Recommendation) => void;
  handleSkip: (rec: Recommendation) => void;
  handleDrop: (rec: Recommendation) => void;
}

export function RecommendationArea({
  loading,
  currentRec,
  candidatePoolLength,
  isThinking,
  handleWatch,
  handleSkip,
  handleDrop
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
            />
          </AnimatePresence>
        </div>
      ) : (!loading && candidatePoolLength > 0) || isThinking ? (
        <div className="text-zinc-400 text-center flex flex-col items-center justify-center min-h-[400px]">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Cpu className="w-12 h-12 text-indigo-500 mb-6" />
          </motion.div>
          <p className="font-display tracking-widest uppercase text-base text-indigo-300/70">Synthesizing Taste Profile...</p>
        </div>
      ) : (
        <EmptyState key="empty" />
      )}
    </div>
  );
}
