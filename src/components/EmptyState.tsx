import React from 'react';
import { motion } from 'motion/react';
import { Swords } from 'lucide-react';

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-2xl border-2 border-dashed border-zinc-800/50 rounded-3xl p-16 flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/20 backdrop-blur-sm"
    >
      <Swords className="w-16 h-16 mb-6 opacity-20" />
      <p className="font-display text-xl text-center leading-relaxed">No new recommendations found for this filter.<br/>Try refreshing or changing the filter.</p>
    </motion.div>
  );
}
