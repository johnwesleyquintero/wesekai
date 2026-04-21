import { motion, AnimatePresence } from 'motion/react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full backdrop-blur-md"
        >
          <WifiOff className="w-4 h-4 text-red-500" />
          <span className="text-[10px] font-bold text-red-200 uppercase tracking-[0.2em]">
            Offline Mode - System Resilient
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
