import { motion } from 'motion/react';
import { Library, Ban, X, Globe, Star, PlayCircle, Trash2, Play } from 'lucide-react';
import { Recommendation } from '../types';
import { getYouTubeSearchUrl } from '../lib/youtube';

export function AnimeListModal({
  type,
  watchlist,
  onClose,
  onRemove,
}: {
  type: 'arsenal' | 'dropped';
  watchlist: Recommendation[];
  onClose: () => void;
  onRemove: (rec: Recommendation) => void;
}) {
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
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-zinc-800">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`p-2.5 sm:p-3 ${themeBg} rounded-xl`}>
              <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${themeColor}`} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
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
                  className={`flex gap-4 sm:gap-5 p-4 sm:p-5 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl group ${hoverBorder} transition-colors`}
                >
                  <img
                    src={rec.contentData.imageUrl}
                    alt={rec.title}
                    className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-xl shadow-md shrink-0"
                    loading="lazy"
                    decoding="async"
                  />
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
                          href={
                            rec.contentData.type === 'manhwa'
                              ? `https://mangadex.org/titles?q=${encodeURIComponent(rec.contentData.title)}`
                              : `https://aniwatchtv.to/search?keyword=${encodeURIComponent(rec.contentData.title)}`
                          }
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
