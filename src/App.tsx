import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Star, ExternalLink, Loader2, Swords, Globe, Cpu, Terminal, PlayCircle, Copy, Check } from 'lucide-react';
import { fetchDynamicRecommendation, AnimeData } from './lib/mal';
import { calculateWorldBuildingScore } from './lib/scoring';

interface Recommendation {
  title: string;
  tags: string[];
  malData: AnimeData;
  wbScore: number;
}

export default function App() {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update document title dynamically
  useEffect(() => {
    if (recommendation) {
      document.title = `${recommendation.title} | WESEKAI`;
    } else {
      document.title = 'WESEKAI | Intelligence Layer';
    }
  }, [recommendation]);

  const handleRecommend = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const animeData = await fetchDynamicRecommendation();

      if (!animeData) {
        throw new Error("Could not fetch data from MyAnimeList. Please try again.");
      }

      const wbScore = calculateWorldBuildingScore(animeData.tags);

      setRecommendation({
        title: animeData.title,
        tags: animeData.tags,
        malData: animeData,
        wbScore
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-zinc-50 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center relative z-10">
        
        {/* System Status Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium tracking-widest uppercase mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(79,70,229,0.15)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Intelligence Layer Online
        </motion.div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent drop-shadow-sm">
            WESEKAI
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-lg mx-auto font-light">
            Dynamic isekai recommendations powered by the <span className="text-indigo-300 font-medium">Wesley Intelligence Layer</span>.
          </p>
        </motion.div>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRecommend}
          disabled={loading}
          className="relative group overflow-hidden rounded-2xl bg-zinc-900 border border-indigo-500/30 px-8 py-4 font-display font-semibold text-white shadow-[0_0_40px_-10px_rgba(79,70,229,0.3)] transition-all hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.6)] hover:border-indigo-400/50 disabled:opacity-70 disabled:cursor-not-allowed mb-16"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-indigo-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          <span className="relative flex items-center gap-3 text-lg">
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                Processing Query...
              </>
            ) : (
              <>
                <Cpu className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                Initialize Sequence
              </>
            )}
          </span>
        </motion.button>

        {/* Error State */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-2xl overflow-hidden mb-8"
            >
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center flex items-center justify-center gap-2">
                <Terminal className="w-5 h-5" />
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="w-full relative min-h-[400px] flex justify-center">
          <AnimatePresence mode="wait">
            {loading ? (
              <SkeletonCard key="skeleton" />
            ) : recommendation && recommendation.malData ? (
              <ResultCard key="result" recommendation={recommendation} />
            ) : (
              <EmptyState key="empty" />
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

// --- Subcomponents ---

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-2xl border-2 border-dashed border-zinc-800/50 rounded-3xl p-12 flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/20 backdrop-blur-sm"
    >
      <Swords className="w-12 h-12 mb-4 opacity-20" />
      <p className="font-display text-lg">Awaiting command input...</p>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full bg-zinc-900/40 border border-zinc-800/50 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col md:flex-row"
    >
      <div className="w-full md:w-2/5 aspect-[3/4] md:aspect-auto bg-zinc-800/50 animate-pulse" />
      <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col gap-4">
        <div className="flex gap-2 mb-2">
          <div className="h-6 w-16 bg-zinc-800/50 rounded-full animate-pulse" />
          <div className="h-6 w-20 bg-zinc-800/50 rounded-full animate-pulse" />
          <div className="h-6 w-14 bg-zinc-800/50 rounded-full animate-pulse" />
        </div>
        <div className="h-10 w-3/4 bg-zinc-800/50 rounded-lg animate-pulse mb-4" />
        <div className="flex gap-4 mb-6">
          <div className="h-12 w-32 bg-zinc-800/50 rounded-xl animate-pulse" />
          <div className="h-12 w-32 bg-zinc-800/50 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-2 mb-8">
          <div className="h-4 w-full bg-zinc-800/50 rounded animate-pulse" />
          <div className="h-4 w-full bg-zinc-800/50 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-zinc-800/50 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-zinc-800/50 rounded animate-pulse" />
        </div>
        <div className="mt-auto pt-6 border-t border-zinc-800/50">
          <div className="h-5 w-32 bg-zinc-800/50 rounded animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}

function ResultCard({ recommendation }: { recommendation: Recommendation, key?: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recommendation.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
      className="w-full relative group"
    >
      {/* Animated Glow Behind Card */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/30 to-purple-600/30 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
      
      <div className="relative w-full bg-zinc-900/80 border border-zinc-700/50 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row">
        
        {/* Image Section */}
        <div className="w-full md:w-2/5 relative aspect-[3/4] md:aspect-auto overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent md:bg-gradient-to-r md:from-transparent md:via-zinc-900/50 md:to-zinc-900 z-10" />
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
            src={recommendation.malData.imageUrl} 
            alt={recommendation.malData.title}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Content Section */}
        <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col relative z-20">
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {recommendation.tags.map((tag, i) => (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (i * 0.05) }}
                key={tag}
                className="px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-md shadow-[0_0_10px_rgba(99,102,241,0.1)]"
              >
                {tag}
              </motion.span>
            ))}
          </div>

          {/* Title */}
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 leading-tight text-white drop-shadow-md">
            {recommendation.malData.title}
          </h2>

          {/* RPG Stats / Scores */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-3 bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 shadow-inner">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Globe className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-0.5">World-Building</div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-xl text-indigo-100">{recommendation.wbScore.toFixed(1)}</span>
                  <span className="text-zinc-600 text-sm">/10</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 shadow-inner">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-0.5">MAL Rating</div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-xl text-yellow-100">{recommendation.malData.score}</span>
                  <span className="text-zinc-600 text-sm">/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="prose prose-invert prose-zinc max-w-none mb-8">
            <p className="text-zinc-400 leading-relaxed text-sm md:text-base line-clamp-6 md:line-clamp-none font-light">
              {recommendation.malData.synopsis}
            </p>
          </div>

          {/* Footer Link */}
          <div className="mt-auto pt-6 border-t border-zinc-800/60 flex flex-wrap items-center gap-6">
            <a 
              href={recommendation.malData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-indigo-300 transition-colors"
            >
              Access Database Entry
              <ExternalLink className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
            </a>
            <a 
              href={`https://aniwatchtv.to/search?keyword=${encodeURIComponent(recommendation.malData.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-purple-400 transition-colors"
            >
              <PlayCircle className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
              Check Anime
            </a>
            <button 
              onClick={copyToClipboard}
              className="group/link inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-emerald-400 transition-colors ml-auto"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 group-hover/link:scale-110 transition-transform" />}
              {copied ? <span className="text-emerald-400">Copied!</span> : 'Copy Title'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

