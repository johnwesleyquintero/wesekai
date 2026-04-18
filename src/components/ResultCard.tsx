import { useState, memo, FC, useMemo } from 'react';
import { motion, Variants, AnimatePresence } from 'motion/react';
import {
  Crown,
  Ban,
  FastForward,
  Bookmark,
  Globe,
  Info,
  Star,
  ExternalLink,
  PlayCircle,
  Check,
  Copy,
  Play,
  Loader2,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { Recommendation } from '../types';
import { getYouTubeSearchUrl, fetchYouTubeTrailerId } from '../lib/youtube';
import { getWesleyAnalysis } from '../lib/ai';
import { TrailerModal } from './TrailerModal';

export const cardVariants: Variants = {
  initial: ({ confidence }: { confidence: number }) => {
    if (confidence > 0.8) return { opacity: 0, scale: 0.92, y: 0, filter: 'blur(0px)' };
    if (confidence > 0.5) return { opacity: 0, scale: 0.95, y: 20, filter: 'blur(4px)' };
    return { opacity: 0, scale: 0.98, y: 40, filter: 'blur(8px)' };
  },
  animate: ({ confidence }: { confidence: number }) => {
    if (confidence > 0.8)
      return {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      };
    if (confidence > 0.5)
      return {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.5, ease: 'easeOut', delay: 0.15 },
      };
    return {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.7, ease: 'easeInOut', delay: 0.2 },
    };
  },
  exit: ({ exitAction }: { exitAction: string }) => {
    if (exitAction === 'watch')
      return {
        scale: 1.05,
        opacity: 0,
        filter: 'brightness(1.5)',
        transition: { duration: 0.3 },
      };
    if (exitAction === 'skip')
      return {
        x: -100,
        opacity: 0,
        transition: { duration: 0.3, ease: 'easeIn' },
      };
    if (exitAction === 'drop')
      return {
        y: 100,
        scale: 0.9,
        opacity: 0,
        filter: 'sepia(1) hue-rotate(-50deg) saturate(5)',
        transition: { duration: 0.4 },
      };
    return { opacity: 0, scale: 0.9 };
  },
};

export const ResultCard: FC<{
  recommendation: Recommendation;
  onWatch: () => void;
  onSkip: () => void;
  onDrop: () => void;
  tagPreferences: Record<string, number>;
}> = memo(({ recommendation, onWatch, onSkip, onDrop, tagPreferences }) => {
  const [copied, setCopied] = useState(false);
  const [localExit, setLocalExit] = useState('none');
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isFetchingTrailer, setIsFetchingTrailer] = useState(false);
  const [dynamicTrailerId, setDynamicTrailerId] = useState<string | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const confidence = recommendation.confidenceScore || 0.5;
  const isSuppressed = (recommendation.driftMultiplier || 1) < 1;

  const handleAnalysis = async () => {
    if (analysis) return;
    setIsAnalyzing(true);
    const result = await getWesleyAnalysis(recommendation, tagPreferences);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recommendation.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWatch = () => {
    setLocalExit('watch');
    onWatch();
  };
  const handleSkip = () => {
    setLocalExit('skip');
    onSkip();
  };
  const handleDrop = () => {
    setLocalExit('drop');
    onDrop();
  };

  const currentTrailerId = recommendation.contentData.trailerYoutubeId || dynamicTrailerId;
  const hasTrailer = !!currentTrailerId;
  const canFetchTrailer =
    !hasTrailer && !!import.meta.env.VITE_YOUTUBE_API_KEY && !isFetchingTrailer;

  const handleTrailerClick = async () => {
    if (currentTrailerId) {
      setIsTrailerOpen(true);
      return;
    }

    if (canFetchTrailer) {
      setIsFetchingTrailer(true);
      try {
        const id = await fetchYouTubeTrailerId(
          recommendation.contentData.title,
          recommendation.contentData.type
        );
        if (id) {
          setDynamicTrailerId(id);
          setIsTrailerOpen(true);
        } else {
          // Fallback to search URL if no video found
          window.open(
            getYouTubeSearchUrl(recommendation.contentData.title, recommendation.contentData.type),
            '_blank'
          );
        }
      } catch (error) {
        console.error('Trailer fetch failed:', error);
      } finally {
        setIsFetchingTrailer(false);
      }
    }
  };

  const externalLinks = useMemo(
    () => ({
      database: recommendation.contentData.url,
      watch:
        recommendation.contentData.type === 'manhwa'
          ? `https://mangadex.org/titles?q=${encodeURIComponent(recommendation.contentData.title)}`
          : `https://aniwatchtv.to/search?keyword=${encodeURIComponent(recommendation.contentData.title)}`,
    }),
    [
      recommendation.contentData.url,
      recommendation.contentData.title,
      recommendation.contentData.type,
    ]
  );

  return (
    <motion.div
      custom={{ confidence, exitAction: localExit }}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`w-full relative group h-full transition-all duration-500 ${isSuppressed ? 'saturate-50 opacity-90' : ''}`}
    >
      {/* Animated Glow Behind Card */}
      <div
        className={`absolute -inset-0.5 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 ${recommendation.isElite ? 'bg-gradient-to-br from-yellow-500/40 to-amber-600/40' : 'bg-gradient-to-br from-indigo-500/30 to-purple-600/30'}`}
      ></div>

      <div
        className={`relative w-full h-full bg-zinc-900/80 border rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row ${recommendation.isElite ? 'border-yellow-500/40' : 'border-zinc-700/50'}`}
      >
        {/* Elite Badge */}
        {recommendation.isElite && (
          <div className="absolute top-4 -right-12 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-[10px] font-bold px-12 py-1.5 shadow-lg flex items-center gap-1.5 z-50 rotate-45 uppercase tracking-widest">
            <Crown className="w-3 h-3" /> Wesley Approved
          </div>
        )}

        {/* Image Section */}
        <div className="w-full md:w-2/5 relative aspect-[3/4] md:aspect-auto overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent md:bg-gradient-to-r md:from-transparent md:via-zinc-900/50 md:to-zinc-900 z-10" />
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
            src={recommendation.contentData.imageUrl}
            alt={recommendation.contentData.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Content Section */}
        <div className="w-full md:w-3/5 p-6 sm:p-8 md:p-10 flex flex-col relative z-20">
          {/* Tags & Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-6 sm:gap-4 mb-6">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {recommendation.tags.map((tag, i) => (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  key={tag}
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-widest border rounded-md ${
                    recommendation.isElite
                      ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.1)]'
                      : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                  }`}
                >
                  {tag}
                </motion.span>
              ))}
            </div>

            <div className="flex gap-2 sm:gap-3 shrink-0 self-end sm:self-auto sm:ml-4">
              <button
                onClick={handleDrop}
                className="p-2.5 sm:p-3 rounded-full border bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-all"
                aria-label="Drop content and never show again"
                title="Drop Anime (Never show again)"
              >
                <Ban className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleSkip}
                className="p-2.5 sm:p-3 rounded-full border bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white hover:border-zinc-500 transition-all"
                aria-label={`Skip ${recommendation.contentData.title} for now`}
                title="Skip for now"
              >
                <FastForward className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleWatch}
                className="p-2.5 sm:p-3 rounded-full border bg-indigo-500/20 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/40 hover:text-white transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                aria-label={`Save ${recommendation.contentData.title} to Arsenal and show next`}
                title="Save to Arsenal & Next"
              >
                <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Title & Year */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-6 sm:mb-8">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white drop-shadow-md">
              {recommendation.contentData.title}
            </h2>
            {recommendation.contentData.year && (
              <span className="text-xl sm:text-2xl font-display font-medium text-zinc-500 shrink-0">
                ({recommendation.contentData.year})
              </span>
            )}
          </div>

          {/* RPG Stats / Scores */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-5 mb-8 sm:mb-10">
            <div className="flex items-center gap-4 bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 shadow-inner relative group/score cursor-help">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Globe className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-0.5">
                  World-Building
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-xl text-indigo-100">
                    {recommendation.wbScore.toFixed(1)}
                  </span>
                  <span className="text-zinc-600 text-sm">/10</span>
                </div>
              </div>

              {/* Explainable AI Tooltip */}
              <div className="absolute bottom-full left-0 mb-3 w-56 p-4 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl opacity-0 group-hover/score:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="text-xs font-bold text-zinc-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5 text-indigo-400" /> Why this score?
                </div>
                <ul className="space-y-1.5">
                  {recommendation.wbReasons.map((reason, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-indigo-200 font-medium flex items-start gap-2"
                    >
                      <span className="text-indigo-500 mt-0.5">•</span> {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 shadow-inner">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-0.5">
                  MAL Rating
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-xl text-yellow-100">
                    {recommendation.contentData.score}
                  </span>
                  <span className="text-zinc-600 text-sm">/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="prose prose-invert prose-zinc max-w-none mb-8 sm:mb-10">
            <p className="text-zinc-400 leading-relaxed text-sm sm:text-base md:text-lg line-clamp-6 md:line-clamp-none font-light">
              {recommendation.contentData.synopsis}
            </p>
          </div>

          {/* Wesley Intelligence Analysis */}
          <div className="mt-8 pt-8 border-t border-zinc-800/50">
            <AnimatePresence mode="wait">
              {!analysis ? (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleAnalysis}
                  disabled={isAnalyzing}
                  className="flex items-center gap-3 px-6 py-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all group/ai disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Cpu className="w-5 h-5 group-hover/ai:rotate-12 transition-transform" />
                  )}
                  <span className="text-sm font-bold uppercase tracking-widest">
                    {isAnalyzing ? 'Accessing Intelligence Layer...' : 'Request Wesley Analysis'}
                  </span>
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-5 p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl relative overflow-hidden group/analysis"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50" />
                  <Sparkles className="w-6 h-6 text-indigo-400 shrink-0 mt-1 animate-pulse" />
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/70">
                      Intelligence Layer Response
                    </span>
                    <p className="text-zinc-300 text-sm italic leading-relaxed font-medium">
                      &quot;{analysis}&quot;
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Link */}
          <div className="mt-auto pt-6 sm:pt-8 border-t border-zinc-800/60 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 md:gap-6">
              <a
                href={externalLinks.database}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-indigo-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
                Database
              </a>
              {(hasTrailer || canFetchTrailer) && (
                <button
                  onClick={handleTrailerClick}
                  disabled={isFetchingTrailer}
                  className="group/link inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFetchingTrailer ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
                  )}
                  Trailer
                </button>
              )}
              <a
                href={getYouTubeSearchUrl(
                  recommendation.contentData.title,
                  recommendation.contentData.type
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-red-400 transition-colors"
              >
                <Play className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
                Recap
              </a>
              <a
                href={externalLinks.watch}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-purple-400 transition-colors"
              >
                <PlayCircle className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
                {recommendation.contentData.type === 'manhwa' ? 'Manhwa' : 'Anime'}
              </a>
            </div>
            <button
              onClick={copyToClipboard}
              className="group/link inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
              )}
              {copied ? <span className="text-emerald-400">Copied!</span> : 'Copy Title'}
            </button>
          </div>
        </div>
      </div>

      {currentTrailerId && (
        <TrailerModal
          youtubeId={currentTrailerId}
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
        />
      )}
    </motion.div>
  );
});

ResultCard.displayName = 'ResultCard';
