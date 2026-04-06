import { Activity, Ban, Library } from 'lucide-react';

interface TopNavigationProps {
  setModalView: (view: 'none' | 'arsenal' | 'dropped' | 'telemetry') => void;
  droppedCount: number;
  watchlistCount: number;
}

export function TopNavigation({ setModalView, droppedCount, watchlistCount }: TopNavigationProps) {
  return (
    <div className="absolute top-8 right-8 md:top-10 md:right-10 z-50 flex gap-4">
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
