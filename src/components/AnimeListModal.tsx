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
  Copy,
  Check,
  Search,
  ChevronDown,
} from 'lucide-react';
import { Recommendation } from '../types';
import { getYouTubeSearchUrl } from '../lib/youtube';
import { getWatchUrl } from '../lib/utils';
import { ConfirmationModal } from './ConfirmationModal';

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
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<
    'default' | 'wb_score_desc' | 'wb_score_asc' | 'mal_score_desc' | 'mal_score_asc'
  >('default');

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

  const filteredList = useMemo(() => {
    return watchlist.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [watchlist, searchTerm]);

  const sortedList = useMemo(() => {
    const list = [...filteredList]; // Create a shallow copy to avoid mutating the original filteredList

    switch (sortOption) {
      case 'wb_score_desc':
        list.sort((a, b) => b.wbScore - a.wbScore);
        break;
      case 'wb_score_asc':
        list.sort((a, b) => a.wbScore - b.wbScore);
        break;
      case 'mal_score_desc':
        list.sort((a, b) => b.contentData.score - a.contentData.score);
        break;
      case 'mal_score_asc':
        list.sort((a, b) => a.contentData.score - b.contentData.score);
        break;
      case 'default': // Implies date added (order in watchlist)
      default:
        // No sorting needed, filteredList already maintains original order
        break;
    }
    return list;
  }, [filteredList, sortOption]);

  const allUrls = useMemo(() => sortedList.map(r => r.contentData.url), [sortedList]);
  const isAllSelected = sortedList.length > 0 && selectedUrls.size === allUrls.length;

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

  const handleCopyMarkdown = () => {
    const header = '| Title | Type | Score | WB Score | Link |';
    const separator = '| :--- | :--- | :--- | :--- | :--- |';
    const rows = sortedList.map(
      item =>
        `| ${item.title.replace(/\|/g, '\\|')} | ${item.contentData.type} | ${item.contentData.score} | ${item.wbScore.toFixed(1)} | [View](${item.contentData.url}) |`
    );
    const markdown = [header, separator, ...rows].join('\n');

    navigator.clipboard.writeText(markdown);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
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
        <ConfirmationModal
          isOpen={showConfirmClear}
          onClose={() => setShowConfirmClear(false)}
          onConfirm={() => {
            onClearAll();
            setShowConfirmClear(false);
          }}
          title="Clear entire list?"
          message={`This will permanently remove all items from your ${isArsenal ? 'Arsenal' : 'Dropped list'}. This action cannot be undone.`}
          confirmText="Yes, Clear All"
        />

        <ConfirmationModal
          isOpen={showConfirmBulk}
          onClose={() => setShowConfirmBulk(false)}
          onConfirm={() => {
            handleBulkDelete();
            setShowConfirmBulk(false);
          }}
          title={`Delete ${selectedUrls.size} items?`}
          message={`This will remove the selected items from your ${isArsenal ? 'Arsenal' : 'Dropped list'}. This action cannot be undone.`}
          confirmText="Yes, Delete"
        />

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
                    onClick={handleCopyMarkdown}
                    className={`p-2 transition-colors ${copiedMarkdown ? 'text-emerald-400' : 'text-zinc-500 hover:text-indigo-400'}`}
                    aria-label="Copy as Markdown Table"
                  >
                    {copiedMarkdown ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
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
            <div className="px-6 sm:px-8 pb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors shrink-0"
                >
                  {isAllSelected ? (
                    <CheckSquare className={`w-4 h-4 ${themeColor}`} />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  {isAllSelected ? 'Deselect' : 'Select All'}
                </button>

                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder={`Search ${isArsenal ? 'arsenal' : 'dropped'}...`}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-xl py-1.5 pl-9 pr-4 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30 focus:ring-1 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Sort By Dropdown */}
              <div className="relative flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-tight text-zinc-500">
                  Sort By:
                </span>
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={e => setSortOption(e.target.value as typeof sortOption)}
                    className="appearance-none bg-zinc-950/50 border border-zinc-800/50 rounded-xl py-1.5 pl-4 pr-8 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/30 focus:ring-1 focus:ring-indigo-500/10 transition-all cursor-pointer"
                  >
                    <option value="default">Date Added (Newest)</option>
                    <option value="wb_score_desc">WB Score (High to Low)</option>
                    <option value="wb_score_asc">WB Score (Low to High)</option>
                    <option value="mal_score_desc">MAL Score (High to Low)</option>
                    <option value="mal_score_asc">MAL Score (Low to High)</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                </div>
              </div>

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
          ) : filteredList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12 sm:py-16">
              {' '}
              {/* This should be filteredList.length === 0 */}
              <Search className="w-12 h-12 mb-4 opacity-10" />
              <p className="text-lg font-display">No matches found</p>
              <p className="text-sm font-light mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {' '}
              {/* Use sortedList here */}
              {sortedList.map(rec => (
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
