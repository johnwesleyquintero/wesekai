import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Library,
  Ban,
  X,
  Globe,
  Star,
  PlayCircle,
  Trash2,
  Play,
  CheckSquare,
  Square,
  Trash,
  Download,
} from 'lucide-react';
import { Recommendation } from '../types';
import { getYouTubeSearchUrl } from '../lib/youtube';
import { getWatchUrl } from '../lib/utils';

export function AnimeListModal({
  type,
  watchlist,
  onClose,
  onRemove,
  onBulkRemove,
  onClearAll,
}: {
  type: 'arsenal' | 'dropped';
  watchlist: Recommendation[];
  onClose: () => void;
  onRemove: (rec: Recommendation) => void;
  onBulkRemove: (urls: string[]) => void;
  onClearAll: () => void;
}) {
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmBulk, setShowConfirmBulk] = useState(false);

  const isArsenal = type === 'arsenal';
  const Icon = isArsenal ? Library : Ban;
  const title = isArsenal ? 'Your Arsenal' : 'Dropped Anime';
  const emptyMsg = isArsenal ? 'Your Arsenal is empty.' : 'No dropped anime yet.';
  const emptySub = isArsenal
    ? 'Save recommendations to build your watchlist.'
    : 'Anime you drop will appear here.';
  const themeColor = isArsenal ? 'text-indigo-400' : 'text-red-400';
  const themeBg = isArsenal ? 'bg-indigo-500/20' : 'bg-red-500/20';
  const hoverBorder = isArsenal ? 'hover:border-indigo-500/30' : 'hover:border-red-500/30';
  const linkHover = isArsenal ? 'hover:text-indigo-300' : 'hover:text-red-300';

  const allUrls = useMemo(() => watchlist.map(r => r.contentData.url), [watchlist]);
  const isAllSelected = watchlist.length > 0 && selectedUrls.size === watchlist.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUrls(new Set());
    } else {
      setSelectedUrls(new Set(allUrls));
    }
  };

  const toggleSelect = (url: string) => {
    const next = new Set(selectedUrls);
    if (next.has(url)) next.delete(url);
    else next.add(url);
    setSelectedUrls(next);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(watchlist, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `wesekai-${type}-${new Date().toISOString().split('T')[0]}.json`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Type', 'Score', 'World-Building Score', 'URL', 'Tags'];
    const rows = watchlist.map(item => [
      `"${item.title.replace(/"/g, '""')}"`,
      item.contentData.type,
      item.contentData.score,
      item.wbScore.toFixed(1),
      item.contentData.url,
      `"${item.tags.join(', ')}"`,
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `wesekai-${type}-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkDelete = () => {
    onBulkRemove(Array.from(selectedUrls));
    setSelectedUrls(new Set());
  };

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
        className="w-full max-w-4xl max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
      >
        {/* Confirmation Overlay for Clear All */}
        <AnimatePresence>
          {showConfirmClear && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[110] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl text-center"
              >
                <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">
                  Clear entire list?
                </h3>
                <p className="text-zinc-400 text-sm mb-8">
                  This will permanently remove all items from your{' '}
                  {isArsenal ? 'Arsenal' : 'Dropped list'}. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors font-bold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onClearAll();
                      setShowConfirmClear(false);
                    }}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all font-bold text-sm shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  >
                    Yes, Clear All
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Overlay for Bulk Delete Selected */}
        <AnimatePresence>
          {showConfirmBulk && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[110] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl text-center"
              >
                <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">
                  Delete {selectedUrls.size} items?
                </h3>
                <p className="text-zinc-400 text-sm mb-8">
                  This will remove the selected items from your{' '}
                  {isArsenal ? 'Arsenal' : 'Dropped list'}. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmBulk(false)}
                    className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors font-bold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleBulkDelete();
                      setShowConfirmBulk(false);
                    }}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all font-bold text-sm shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  >
                    Yes, Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex flex-col border-b border-zinc-800">
          <div className="flex items-center justify-between p-6 sm:p-8 pb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`p-2.5 sm:p-3 ${themeBg} rounded-xl`}>
                <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${themeColor}`} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                {title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {watchlist.length > 0 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleExportJSON}
                    className="p-2 text-zinc-500 hover:text-indigo-400 transition-colors"
                    title="Export as JSON"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="p-2 text-zinc-500 hover:text-emerald-400 transition-colors"
                    title="Export as CSV"
                  >
                    <div className="relative">
                      <Download className="w-5 h-5" />
                      <span className="absolute -bottom-1 -right-1 text-[7px] font-black bg-zinc-950 px-0.5 rounded border border-zinc-800 leading-none">
                        CSV
                      </span>
                    </div>
                  </button>
                </div>
              )}
              {watchlist.length > 0 && (
                <button
                  onClick={() => setShowConfirmClear(true)}
                  className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Clear everything"
                >
                  <Trash className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 sm:p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {watchlist.length > 0 && (
            <div className="px-6 sm:px-8 pb-4 flex items-center justify-between">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                {isAllSelected ? (
                  <CheckSquare className={`w-4 h-4 ${themeColor}`} />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </button>

              <AnimatePresence>
                {selectedUrls.size > 0 && (
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={() => setShowConfirmBulk(true)}
                    className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete {selectedUrls.size} Selected
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {watchlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12 sm:py-16">
              <Icon className="w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 opacity-20" />
              <p className="text-lg sm:text-xl font-display">{emptyMsg}</p>
              <p className="text-sm sm:text-base font-light mt-2">{emptySub}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {watchlist.map(rec => (
                <div
                  key={rec.contentData.url}
                  className={`flex gap-4 sm:gap-5 p-4 sm:p-5 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl group ${hoverBorder} transition-colors relative`}
                >
                  <div className="relative shrink-0">
                    <button
                      onClick={() => toggleSelect(rec.contentData.url)}
                      className={`absolute -top-2 -left-2 z-20 p-1.5 rounded-lg border backdrop-blur-md transition-all ${
                        selectedUrls.has(rec.contentData.url)
                          ? `${themeBg} border-indigo-500/50 ${themeColor}`
                          : 'bg-zinc-900/80 border-zinc-700 text-zinc-500 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {selectedUrls.has(rec.contentData.url) ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <img
                      src={rec.contentData.imageUrl}
                      alt={rec.title}
                      className={`w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-xl shadow-md transition-all ${
                        selectedUrls.has(rec.contentData.url) ? 'opacity-40 grayscale-[0.5]' : ''
                      }`}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-zinc-200 line-clamp-2 mb-1">{rec.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-auto">
                      <span className="flex items-center gap-1">
                        <Globe className={`w-3 h-3 ${themeColor}`} /> {rec.wbScore.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" /> {rec.contentData.score}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        <a
                          href={getYouTubeSearchUrl(rec.contentData.title, rec.contentData.type)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-xs font-medium ${themeColor} ${linkHover} flex items-center gap-1`}
                        >
                          <Play className="w-4 h-4" /> Recap
                        </a>
                        <a
                          href={getWatchUrl(rec.contentData.type, rec.contentData.title)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-xs font-medium ${themeColor} ${linkHover} flex items-center gap-1`}
                        >
                          <PlayCircle className="w-3 h-3" />{' '}
                          {rec.contentData.type === 'manhwa' ? 'Read' : 'Watch'}
                        </a>
                      </div>
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
