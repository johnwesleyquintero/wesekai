import { motion } from 'motion/react';

interface FilterBarProps {
  filters: string[];
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export function FilterBar({ filters, activeFilter, setActiveFilter }: FilterBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="flex flex-wrap justify-center gap-3 mb-12 max-w-3xl"
    >
      {filters.map(filter => (
        <button
          key={filter}
          onClick={() => setActiveFilter(filter)}
          className={`px-5 py-2 rounded-full text-sm font-semibold uppercase tracking-wider transition-all ${
            activeFilter === filter
              ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400'
              : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
          }`}
        >
          {filter}
        </button>
      ))}
    </motion.div>
  );
}
