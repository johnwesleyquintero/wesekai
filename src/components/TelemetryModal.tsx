import React from 'react';
import { motion } from 'motion/react';
import { Network, X } from 'lucide-react';

export function TelemetryModal({ tagPreferences, sessionMemory, onClose }: { tagPreferences: Record<string, number>, sessionMemory: { shown: Record<string, number>, skipped: Set<string> }, onClose: () => void }) {
  const sortedTags = Object.entries(tagPreferences).sort((a, b) => b[1] - a[1]);
  const coreOrbit = sortedTags.filter(t => t[1] > 0);
  const frozenBranches = sortedTags.filter(t => t[1] < 0).reverse();

  const maxWeight = coreOrbit.length > 0 ? coreOrbit[0][1] : 0;
  const explorationPressure = Math.max(0.1, 1 - (maxWeight / 3)); // Decays as max weight approaches 3

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
        
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Network className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white tracking-wide">System Telemetry</h2>
              <p className="text-xs text-zinc-400 uppercase tracking-widest mt-0.5">Live Taste Vector Analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          
          {/* Top Level Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-display font-bold text-emerald-400 mb-1">{(explorationPressure * 100).toFixed(0)}%</span>
              <span className="text-xs text-zinc-500 uppercase tracking-widest">Exploration Pressure</span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-display font-bold text-indigo-400 mb-1">{coreOrbit.length}</span>
              <span className="text-xs text-zinc-500 uppercase tracking-widest">Active Vectors</span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-display font-bold text-red-400 mb-1">{frozenBranches.length}</span>
              <span className="text-xs text-zinc-500 uppercase tracking-widest">Frozen Branches</span>
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
                        animate={{ width: `${Math.min(100, (weight / 3) * 100)}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                    <div className="w-12 text-right text-xs font-mono text-emerald-400">+{weight.toFixed(2)}</div>
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
                        animate={{ width: `${Math.min(100, (Math.abs(weight) / 3) * 100)}%` }}
                        className="h-full bg-red-500 rounded-full"
                      />
                    </div>
                    <div className="w-12 text-right text-xs font-mono text-red-400">{weight.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}
