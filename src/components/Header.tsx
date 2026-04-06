import { motion } from 'motion/react';
import { Activity, Ban, Library, Shield } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  mediaType: 'all' | 'anime' | 'manhwa';
  setMediaType: (type: 'all' | 'anime' | 'manhwa') => void;
  setModalView: (view: 'none' | 'arsenal' | 'dropped' | 'telemetry') => void;
  droppedCount: number;
  watchlistCount: number;
}

const getLevelInfo = (count: number) => {
  const level = Math.floor(count / 5) + 1;
  const titles = [
    'Apprentice',
    'Scouter',
    'Strategist',
    'World Walker',
    'Isekai Sage',
    'Sovereign',
  ];
  return {
    level,
    title: titles[Math.min(level - 1, titles.length - 1)],
    color: level >= 5 ? 'text-yellow-400' : level >= 3 ? 'text-indigo-400' : 'text-zinc-400',
  };
};

export function Header({
  mediaType,
  setMediaType,
  setModalView,
  droppedCount,
  watchlistCount,
}: HeaderProps) {
  const levelInfo = getLevelInfo(watchlistCount);

  return (
    <header className="w-full mb-8 sm:mb-12">
      {/* Top Bar: Logo and Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <Logo size={42} className="shadow-lg" />
          <div className="flex flex-col">
            <span className="font-display font-black text-2xl tracking-tighter text-white leading-none">
              WESEKAI
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500/80 mt-1">
              The Sovereign&apos;s Codex
            </span>
          </div>
        </div>

        {/* Action Buttons & Status - Hidden on mobile, moved to MobileNav */}
        <div className="hidden sm:flex flex-wrap justify-center items-center gap-3">
          {/* Arsenal Level Badge */}
          <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl backdrop-blur-md">
            <Shield className={`w-4 h-4 ${levelInfo.color} animate-pulse`} />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 leading-none">
                Arsenal Status
              </span>
              <span
                className={`text-[11px] font-black uppercase tracking-widest ${levelInfo.color}`}
              >
                LVL {levelInfo.level} - {levelInfo.title}
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-zinc-800/50 mx-1" />

          <button
            onClick={() => setModalView('telemetry')}
            className="group flex items-center gap-2 px-4 py-2 bg-zinc-900/40 border border-zinc-800/50 rounded-xl text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all backdrop-blur-sm"
          >
            <Activity className="w-4 h-4 text-emerald-500/70 group-hover:text-emerald-400 transition-colors" />
            <span className="font-bold text-xs uppercase tracking-tight">Telemetry</span>
          </button>

          <button
            onClick={() => setModalView('dropped')}
            className="group flex items-center gap-2 px-4 py-2 bg-zinc-900/40 border border-zinc-800/50 rounded-xl text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-all backdrop-blur-sm"
          >
            <Ban className="w-4 h-4 text-red-500/70 group-hover:text-red-400 transition-colors" />
            <span className="font-bold text-xs uppercase tracking-tight">Dropped</span>
            <span className="bg-zinc-800 group-hover:bg-red-500/20 px-1.5 py-0.5 rounded text-[10px] font-black min-w-[1.5rem] transition-colors">
              {droppedCount}
            </span>
          </button>

          <button
            onClick={() => setModalView('arsenal')}
            className="group flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-300 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all backdrop-blur-sm"
          >
            <Library className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            <span className="font-bold text-xs uppercase tracking-tight">Arsenal</span>
            <span className="bg-indigo-500/20 group-hover:bg-indigo-500/30 px-1.5 py-0.5 rounded text-[10px] font-black min-w-[1.5rem] transition-colors">
              {watchlistCount}
            </span>
          </button>
        </div>
      </div>

      {/* Media Type Toggle - Centered below logo and actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <div className="bg-zinc-900/60 p-1 rounded-2xl border border-zinc-800/50 flex items-center shadow-2xl backdrop-blur-xl">
          {(['all', 'anime', 'manhwa'] as const).map(type => (
            <button
              key={type}
              onClick={() => setMediaType(type)}
              className={`relative px-5 sm:px-8 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                mediaType === type ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {mediaType === type && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-indigo-500 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{type}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </header>
  );
}
