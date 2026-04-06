import React from 'react';
import { motion } from 'motion/react';

interface HeaderProps {
  mediaType: 'all' | 'anime' | 'manhwa';
  setMediaType: (type: 'all' | 'anime' | 'manhwa') => void;
  recommendationCount?: number;
}

export function Header({ mediaType, setMediaType, recommendationCount = 0 }: HeaderProps) {
  return (
    <>
      {/* System Status Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium tracking-widest uppercase mb-10 backdrop-blur-sm shadow-[0_0_15px_rgba(79,70,229,0.15)]"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </span>
        Intelligence Layer Online{' '}
        {recommendationCount > 0 && `| ${recommendationCount} Vectors Loaded`}
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-12 sm:mb-16"
      >
        <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter mb-4 sm:mb-6 bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent drop-shadow-sm">
          WESEKAI
        </h1>
        <p className="text-zinc-400 text-lg sm:text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto font-light px-2 mb-8">
          Dynamic isekai recommendations powered by the{' '}
          <span className="text-indigo-300 font-medium">Wesley Intelligence Layer</span>.
        </p>

        {/* Media Type Toggle */}
        <div className="flex justify-center">
          <div className="bg-zinc-900/80 p-1.5 rounded-full border border-zinc-800 flex items-center shadow-lg backdrop-blur-md">
            {(['all', 'anime', 'manhwa'] as const).map(type => (
              <button
                key={type}
                onClick={() => setMediaType(type)}
                className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${
                  mediaType === type
                    ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}
