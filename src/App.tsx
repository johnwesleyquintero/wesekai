import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Star, ExternalLink, Loader2, Swords, Globe, Cpu, Terminal, PlayCircle, Copy, Check, Bookmark, BookmarkCheck, Library, X, Trash2, Ban } from 'lucide-react';
import { fetchTopAnimeList, AnimeData } from './lib/mal';
import { calculateWorldBuildingScore } from './lib/scoring';

interface Recommendation {
  title: string;
  tags: string[];
  malData: AnimeData;
  wbScore: number;
}

const FILTERS = ['All', 'Isekai', 'Fantasy', 'Military', 'Strategy', 'Reincarnation'];

export default function App() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // v2 Features
  const [activeFilter, setActiveFilter] = useState('All');
  const [modalView, setModalView] = useState<'none' | 'arsenal' | 'dropped'>('none');
  const [watchlist, setWatchlist] = useState<Recommendation[]>(() => {
    const saved = localStorage.getItem('wesekai-arsenal');
    return saved ? JSON.parse(saved) : [];
  });
  const [droppedList, setDroppedList] = useState<Recommendation[]>(() => {
    const saved = localStorage.getItem('wesekai-dropped');
    return saved ? JSON.parse(saved) : [];
  });

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
      const animeList = await fetchTopAnimeList(activeFilter);

      if (!animeList || animeList.length === 0) {
        throw new Error("Could not fetch data from MyAnimeList. Please try again.");
      }

      const recs = animeList.map(animeData => ({
        title: animeData.title,
        tags: animeData.tags,
        malData: animeData,
        wbScore: calculateWorldBuildingScore(animeData.tags)
      }));

      // Deduplicate by URL to prevent React key collisions
      const uniqueRecs = Array.from(new Map(recs.map(item => [item.malData.url, item])).values());

      setRecommendations(uniqueRecs);
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

  const toggleArsenal = useCallback((rec: Recommendation) => {
    setWatchlist(prev => {
      const exists = prev.find(item => item.malData.url === rec.malData.url);
      if (exists) {
        return prev.filter(item => item.malData.url !== rec.malData.url);
      }
      return [...prev, rec];
    });
    // Remove from dropped if it's there
    setDroppedList(prev => prev.filter(item => item.malData.url !== rec.malData.url));
  }, []);

  const toggleDropped = useCallback((rec: Recommendation) => {
    setDroppedList(prev => {
      const exists = prev.find(item => item.malData.url === rec.malData.url);
      if (exists) {
        return prev.filter(item => item.malData.url !== rec.malData.url);
      }
      return [...prev, rec];
    });
    // Remove from arsenal if it's there
    setWatchlist(prev => prev.filter(item => item.malData.url !== rec.malData.url));
  }, []);

  // Filter out items already in the Arsenal or Dropped list and limit to 20
  const displayedRecommendations = useMemo(() => {
    return recommendations
      .filter(rec => 
        !watchlist.some(w => w.malData.url === rec.malData.url) && 
        !droppedList.some(d => d.malData.url === rec.malData.url)
      )
      .slice(0, 20);
  }, [recommendations, watchlist, droppedList]);

  return (
    <div className="min-h-screen text-zinc-50 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Top Navigation */}
      <div className="absolute top-6 right-6 z-50 flex gap-3">
        <button 
          onClick={() => setModalView('dropped')}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-full text-zinc-300 hover:text-white hover:border-red-500/50 transition-all backdrop-blur-md shadow-lg"
        >
          <Ban className="w-4 h-4 text-red-400" />
          <span className="font-medium text-sm hidden sm:inline">Dropped ({droppedList.length})</span>
        </button>
        <button 
          onClick={() => setModalView('arsenal')}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-full text-zinc-300 hover:text-white hover:border-indigo-500/50 transition-all backdrop-blur-md shadow-lg"
        >
          <Library className="w-4 h-4 text-indigo-400" />
          <span className="font-medium text-sm hidden sm:inline">Arsenal ({watchlist.length})</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center relative z-10">
        
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
          className="text-center mb-10"
        >
          <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent drop-shadow-sm">
            WESEKAI
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-lg mx-auto font-light">
            Dynamic isekai recommendations powered by the <span className="text-indigo-300 font-medium">Wesley Intelligence Layer</span>.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2 mb-8 max-w-2xl"
        >
          {FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeFilter === filter 
                  ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400' 
                  : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </motion.div>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchRecommendations}
          disabled={loading}
          className="relative group overflow-hidden rounded-2xl bg-zinc-900 border border-indigo-500/30 px-8 py-4 font-display font-semibold text-white shadow-[0_0_40px_-10px_rgba(79,70,229,0.3)] transition-all hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.6)] hover:border-indigo-400/50 disabled:opacity-70 disabled:cursor-not-allowed mb-16"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-indigo-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          <span className="relative flex items-center gap-3 text-lg">
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                Scanning Layer...
              </>
            ) : (
              <>
                <Cpu className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                Scan for More
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
          {loading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
              <SkeletonCard key="skel1" />
              <SkeletonCard key="skel2" />
              <SkeletonCard key="skel3" />
              <SkeletonCard key="skel4" />
            </div>
          ) : displayedRecommendations.length > 0 ? (
            <motion.div layout className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
              <AnimatePresence>
                {displayedRecommendations.map(rec => (
                  <ResultCard 
                    key={rec.malData.url} 
                    recommendation={rec} 
                    isInArsenal={false}
                    isDropped={false}
                    onToggleArsenal={() => toggleArsenal(rec)}
                    onToggleDropped={() => toggleDropped(rec)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <EmptyState key="empty" />
          )}
        </div>

      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalView !== 'none' && (
          <AnimeListModal 
            type={modalView}
            watchlist={modalView === 'arsenal' ? watchlist : droppedList} 
            onClose={() => setModalView('none')} 
            onRemove={modalView === 'arsenal' ? toggleArsenal : toggleDropped}
          />
        )}
      </AnimatePresence>
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
      <p className="font-display text-lg text-center">No new recommendations found for this filter.<br/>Try refreshing or changing the filter.</p>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full h-full bg-zinc-900/40 border border-zinc-800/50 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col md:flex-row"
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

const ResultCard: React.FC<{ recommendation: Recommendation, isInArsenal: boolean, isDropped: boolean, onToggleArsenal: () => void, onToggleDropped: () => void }> = React.memo(({ recommendation, isInArsenal, isDropped, onToggleArsenal, onToggleDropped }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recommendation.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full relative group h-full"
    >
      {/* Animated Glow Behind Card */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/30 to-purple-600/30 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
      
      <div className="relative w-full h-full bg-zinc-900/80 border border-zinc-700/50 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row">
        
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
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Content Section */}
        <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col relative z-20">
          
          {/* Tags & Action Buttons */}
          <div className="flex justify-between items-start mb-5">
            <div className="flex flex-wrap gap-2">
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
            
            <div className="flex gap-2 shrink-0 ml-2">
              <button 
                onClick={onToggleDropped}
                className={`p-2 rounded-full border transition-all ${isDropped ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'}`}
                title={isDropped ? "Remove from Dropped" : "Drop Anime"}
              >
                <Ban className="w-5 h-5" />
              </button>
              <button 
                onClick={onToggleArsenal}
                className={`p-2 rounded-full border transition-all ${isInArsenal ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'}`}
                title={isInArsenal ? "Remove from Arsenal" : "Save to Arsenal"}
              >
                {isInArsenal ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
            </div>
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
});

function AnimeListModal({ type, watchlist, onClose, onRemove }: { type: 'arsenal' | 'dropped', watchlist: Recommendation[], onClose: () => void, onRemove: (rec: Recommendation) => void }) {
  const isArsenal = type === 'arsenal';
  const Icon = isArsenal ? Library : Ban;
  const title = isArsenal ? "Your Arsenal" : "Dropped Anime";
  const emptyMsg = isArsenal ? "Your Arsenal is empty." : "No dropped anime yet.";
  const emptySub = isArsenal ? "Save recommendations to build your watchlist." : "Anime you drop will appear here.";
  const themeColor = isArsenal ? "text-indigo-400" : "text-red-400";
  const themeBg = isArsenal ? "bg-indigo-500/20" : "bg-red-500/20";
  const hoverBorder = isArsenal ? "hover:border-indigo-500/30" : "hover:border-red-500/30";
  const linkHover = isArsenal ? "hover:text-indigo-300" : "hover:text-red-300";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-4xl max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${themeBg} rounded-lg`}>
              <Icon className={`w-6 h-6 ${themeColor}`} />
            </div>
            <h2 className="text-2xl font-display font-bold text-white">{title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {watchlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12">
              <Icon className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-display">{emptyMsg}</p>
              <p className="text-sm font-light mt-2">{emptySub}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {watchlist.map((rec) => (
                <div key={rec.malData.url} className={`flex gap-4 p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl group ${hoverBorder} transition-colors`}>
                  <img 
                    src={rec.malData.imageUrl} 
                    alt={rec.title} 
                    className="w-20 h-28 object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-zinc-200 line-clamp-2 mb-1">{rec.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-auto">
                      <span className="flex items-center gap-1"><Globe className={`w-3 h-3 ${themeColor}`}/> {rec.wbScore.toFixed(1)}</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500"/> {rec.malData.score}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <a 
                        href={`https://aniwatchtv.to/search?keyword=${encodeURIComponent(rec.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xs font-medium ${themeColor} ${linkHover} flex items-center gap-1`}
                      >
                        <PlayCircle className="w-3 h-3" /> Watch
                      </a>
                      <button 
                        onClick={() => onRemove(rec)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                        title={`Remove from ${isArsenal ? 'Arsenal' : 'Dropped'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
