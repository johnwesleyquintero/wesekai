import { motion, AnimatePresence } from 'motion/react';
import { Terminal, AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  error: string | null;
  level?: 'warning' | 'critical';
}

export function ErrorState({ error, level = 'critical' }: ErrorStateProps) {
  const isWarning = level === 'warning';

  return (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="w-full max-w-2xl overflow-hidden mb-8"
        >
          <div
            className={`p-4 border rounded-xl text-center flex items-center justify-center gap-2 ${
              isWarning
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {isWarning ? <AlertTriangle className="w-5 h-5" /> : <Terminal className="w-5 h-5" />}
            {error}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
