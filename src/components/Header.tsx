import React from 'react';
import { motion } from 'motion/react';

export function Header() {
  return (
    <>
      {/* System Status Indicator */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium tracking-widest uppercase mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(79,70,229,0.15)]"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </span>
        Intelligence Layer Online
      </motion.div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-10"
      >
        <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent drop-shadow-sm">
          WESEKAI
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl max-w-lg mx-auto font-light">
          Dynamic isekai recommendations powered by the <span className="text-indigo-300 font-medium">Wesley Intelligence Layer</span>.
        </p>
      </motion.div>
    </>
  );
}
