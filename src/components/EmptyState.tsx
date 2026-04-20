import { motion } from 'motion/react';
import { Swords, RotateCcw, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  activeFilter: string;
  onResetFilters: () => void;
  onRefresh: () => void;
}

export function EmptyState({ activeFilter, onResetFilters, onRefresh }: EmptyStateProps) {
  const isFiltered = activeFilter !== 'All';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-2xl border-2 border-dashed border-zinc-800/50 rounded-3xl p-16 flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/20 backdrop-blur-sm"
    >
      <Swords className="w-16 h-16 mb-6 opacity-20" />
      <p className="font-display text-xl text-center leading-relaxed">
        No new recommendations found for this filter.
        <br />
        Try refreshing or changing the filter.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mt-10">
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-800/50 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-zinc-300 text-sm font-bold transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Clear Filter
          </button>
        )}
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)]"
        >
          <RefreshCw className="w-4 h-4" /> Re-scan Database
        </button>
      </div>
    </motion.div>
  );
}
