import { Activity, Ban, Library, Shield } from 'lucide-react';

interface TopNavigationProps {
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

export function TopNavigation({ setModalView, droppedCount, watchlistCount }: TopNavigationProps) {
  const levelInfo = getLevelInfo(watchlistCount);

  return (
    <div className="absolute top-8 right-8 md:top-10 md:right-10 z-50 flex gap-4">
      {/* Arsenal Level Badge */}
      <div className="hidden lg:flex items-center gap-3 px-6 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-full backdrop-blur-md shadow-2xl">
        <Shield className={`w-4 h-4 ${levelInfo.color} animate-pulse`} />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-500 leading-none">
            Arsenal Status
          </span>
          <span className={`text-xs font-black uppercase tracking-widest ${levelInfo.color}`}>
            LVL {levelInfo.level} - {levelInfo.title}
          </span>
        </div>
      </div>

      <button
        onClick={() => setModalView('telemetry')}
        className="flex items-center gap-2.5 px-5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-full text-zinc-300 hover:text-white hover:border-emerald-500/50 transition-all backdrop-blur-md shadow-lg"
      >
        <Activity className="w-4 h-4 text-emerald-400" />
        <span className="font-medium text-sm hidden sm:inline">Telemetry</span>
      </button>
      <button
        onClick={() => setModalView('dropped')}
        className="flex items-center gap-2.5 px-5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-full text-zinc-300 hover:text-white hover:border-red-500/50 transition-all backdrop-blur-md shadow-lg"
      >
        <Ban className="w-4 h-4 text-red-400" />
        <span className="font-medium text-sm hidden sm:inline">Dropped ({droppedCount})</span>
      </button>
      <button
        onClick={() => setModalView('arsenal')}
        className="flex items-center gap-2.5 px-5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-full text-zinc-300 hover:text-white hover:border-indigo-500/50 transition-all backdrop-blur-md shadow-lg"
      >
        <Library className="w-4 h-4 text-indigo-400" />
        <span className="font-medium text-sm hidden sm:inline">Arsenal ({watchlistCount})</span>
      </button>
    </div>
  );
}
