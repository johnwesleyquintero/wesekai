import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, X, AlertTriangle, RefreshCw } from 'lucide-react';

export function TelemetryModal({
  tagPreferences,
  sessionMemory,
  onClose,
}: {
  tagPreferences: Record<string, number>;
  sessionMemory: { shown: Record<string, number>; skipped: Record<string, boolean> };
  onClose: () => void;
}) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const sortedTags = Object.entries(tagPreferences).sort((a, b) => b[1] - a[1]);
  const coreOrbit = sortedTags.filter(t => t[1] > 0);
  const frozenBranches = sortedTags.filter(t => t[1] < 0).reverse();

  const maxWeight = coreOrbit.length > 0 ? coreOrbit[0][1] : 0;
  const explorationPressure = Math.max(0.1, 1 - maxWeight / 3); // Decays as max weight approaches 3

  const handleReset = () => {
    localStorage.removeItem('wesekai_arsenal');
    localStorage.removeItem('wesekai_dropped');
    localStorage.removeItem('wesekai_memory');
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500" />

        <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Network className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">
                System Telemetry
              </h2>
              <p className="text-sm text-zinc-400 uppercase tracking-widest mt-1">
                Live Taste Vector Analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-10">
          {/* Top Level Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-display font-bold text-emerald-400 mb-1">
                {(explorationPressure * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
                Exploration
              </span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-display font-bold text-indigo-400 mb-1">
                {coreOrbit.length}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
                Vectors
              </span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-display font-bold text-amber-400 mb-1">
                {Object.keys(sessionMemory.shown).length}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
                Shown
              </span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-display font-bold text-red-400 mb-1">
                {Object.keys(sessionMemory.skipped).length}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
                Skipped
              </span>
            </div>
          </div>

          {/* Core Orbit (Positive Vectors) */}
          <div>
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" /> Core Orbit (Pull)
            </h3>
            {coreOrbit.length === 0 ? (
              <p className="text-zinc-600 text-sm italic">No positive vectors established yet.</p>
            ) : (
              <div className="space-y-3">
                {coreOrbit.slice(0, 8).map(([tag, weight]) => (
                  <div key={tag} className="flex items-center gap-4">
                    <div className="w-32 text-xs font-medium text-zinc-400 truncate">{tag}</div>
                    <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(100, (weight / 3) * 100)}%`,
                        }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                    <div className="w-12 text-right text-xs font-mono text-emerald-400">
                      +{weight.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Frozen Branches (Negative Vectors) */}
          <div>
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" /> Frozen Branches (Push)
            </h3>
            {frozenBranches.length === 0 ? (
              <p className="text-zinc-600 text-sm italic">No branches frozen yet.</p>
            ) : (
              <div className="space-y-3">
                {frozenBranches.slice(0, 8).map(([tag, weight]) => (
                  <div key={tag} className="flex items-center gap-4">
                    <div className="w-32 text-xs font-medium text-zinc-400 truncate">{tag}</div>
                    <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden flex justify-end">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(100, (Math.abs(weight) / 3) * 100)}%`,
                        }}
                        className="h-full bg-red-500 rounded-full"
                      />
                    </div>
                    <div className="w-12 text-right text-xs font-mono text-red-400">
                      {weight.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Reboot */}
          <div className="pt-8 border-t border-zinc-800/60 mt-8">
            <AnimatePresence mode="wait">
              {!showConfirmReset ? (
                <motion.button
                  key="reset-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowConfirmReset(true)}
                  className="w-full py-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 font-medium hover:bg-red-500/10 hover:border-red-500/40 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reboot Intelligence Layer (Wipe Memory)
                </motion.button>
              ) : (
                <motion.div
                  key="confirm-reset"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full p-4 rounded-2xl border border-red-500 bg-red-500/10 flex flex-col items-center text-center gap-4"
                >
                  <div className="flex items-center gap-2 text-red-400 font-bold">
                    <AlertTriangle className="w-5 h-5" />
                    CRITICAL WARNING
                  </div>
                  <p className="text-sm text-red-200/80">
                    This will permanently delete your Arsenal, Dropped list, and completely wipe the
                    taste vector memory. The system will restart from zero.
                  </p>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => setShowConfirmReset(false)}
                      className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                    >
                      Confirm Wipe
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
