import { motion } from 'motion/react';
import { Activity, Ban, Library } from 'lucide-react';
import { getLevelInfo } from '../lib/level-utils';

interface MobileNavProps {
  setModalView: (view: 'none' | 'arsenal' | 'dropped' | 'telemetry') => void;
  droppedCount: number;
  watchlistCount: number;
}

export function MobileNav({ setModalView, droppedCount, watchlistCount }: MobileNavProps) {
  const levelInfo = getLevelInfo(watchlistCount);

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden px-4 pb-6 pt-2 bg-gradient-to-t from-black via-black/95 to-transparent"
    >
      <div className="flex items-center justify-around bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-2 backdrop-blur-xl shadow-2xl">
        <button
          onClick={() => setModalView('telemetry')}
          aria-label="View telemetry data"
          className="flex flex-col items-center gap-1 p-3 text-zinc-400 hover:text-emerald-400 transition-colors"
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Telemetry</span>
        </button>

        <button
          onClick={() => setModalView('dropped')}
          aria-label="View dropped anime"
          className="relative flex flex-col items-center gap-1 p-3 text-zinc-400 hover:text-red-400 transition-colors"
        >
          <Ban className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Dropped</span>
          {droppedCount > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-black px-1 rounded-full min-w-[1rem] h-4 flex items-center justify-center shadow-lg">
              {droppedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setModalView('arsenal')}
          aria-label="View arsenal"
          className={`relative flex flex-col items-center gap-1 p-3 ${levelInfo.color} hover:text-white transition-colors`}
        >
          <Library className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Arsenal</span>
          {watchlistCount > 0 && (
            <span
              className={`absolute top-2 right-2 ${levelInfo.color.replace('text', 'bg')} text-white text-[8px] font-black px-1 rounded-full min-w-[1rem] h-4 flex items-center justify-center shadow-lg`}
            >
              {watchlistCount}
            </span>
          )}
        </button>
      </div>
    </motion.div>
  );
}
