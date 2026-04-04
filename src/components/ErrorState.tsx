import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal } from 'lucide-react';

interface ErrorStateProps {
  error: string | null;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="w-full max-w-2xl overflow-hidden mb-8"
        >
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center flex items-center justify-center gap-2">
            <Terminal className="w-5 h-5" />
            {error}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
