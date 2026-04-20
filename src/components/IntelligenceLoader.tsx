import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Terminal, Shield, Zap } from 'lucide-react';

const messages = [
  'Analyzing Taste Vectors',
  'Calculating World-Building Depth',
  'Filtering Temporal Anomaly',
  "Syncing with Sovereign's Codex",
  'Optimizing Recommendation Matrix',
];

export const IntelligenceLoader = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setMessageIndex(i => (i + 1) % messages.length), 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-xl mx-auto space-y-8">
      <div className="relative">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="w-32 h-32 rounded-full border-t-2 border-l-2 border-indigo-500/50"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 15, repeat: Infinity, ease: 'linear' },
            scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute inset-2 rounded-full border-b-2 border-r-2 border-emerald-500/30"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Cpu className="w-10 h-10 text-indigo-400 animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4 w-full">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-indigo-500" />
          <AnimatePresence mode="wait">
            <motion.span
              key={messageIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs font-black uppercase tracking-[0.3em] text-indigo-300/80"
            >
              {messages[messageIndex]}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="h-1 w-48 bg-zinc-800 rounded-full overflow-hidden relative">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent w-1/2"
          />
        </div>

        <div className="flex gap-8 mt-4">
          <div className="flex flex-col items-center gap-1">
            <Shield className="w-3 h-3 text-zinc-600" />
            <span className="text-[10px] uppercase font-bold text-zinc-600">Taste Sync</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Zap className="w-3 h-3 text-zinc-600" />
            <span className="text-[10px] uppercase font-bold text-zinc-600">Drift Calc</span>
          </div>
        </div>
      </div>
    </div>
  );
};
