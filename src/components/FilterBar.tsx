import { motion } from 'motion/react';
import { useRef, useEffect } from 'react';

interface FilterBarProps {
  filters: string[];
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export function FilterBar({ filters, activeFilter, setActiveFilter }: FilterBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeFilterRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeFilterRef.current && scrollRef.current) {
      const { offsetLeft, clientWidth } = activeFilterRef.current;
      const { clientWidth: scrollWidth } = scrollRef.current;
      const scrollPosition = offsetLeft - scrollWidth / 2 + clientWidth / 2;
      scrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [activeFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="w-full max-w-3xl mb-12 relative"
    >
      <div
        ref={scrollRef}
        className="flex sm:flex-wrap justify-start sm:justify-center gap-3 overflow-x-auto sm:overflow-x-visible pb-4 sm:pb-0 px-4 sm:px-0 no-scrollbar relative z-10"
      >
        {filters.map(filter => (
          <button
            key={filter}
            ref={activeFilter === filter ? activeFilterRef : null}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2 rounded-full text-[10px] sm:text-sm font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeFilter === filter
                ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400'
                : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
            }`}
            aria-current={activeFilter === filter ? 'page' : undefined}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-zinc-950 via-zinc-950/50 to-transparent z-20 pointer-events-none sm:hidden" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-zinc-950 via-zinc-950/50 to-transparent z-20 pointer-events-none sm:hidden" />
    </motion.div>
  );
}
