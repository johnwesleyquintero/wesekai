import { motion } from 'motion/react';

export function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full h-full relative group transition-all duration-500 saturate-50 opacity-90"
    >
      <div className="absolute -inset-0.5 rounded-[2rem] blur-xl opacity-50 bg-gradient-to-br from-indigo-500/30 to-purple-600/30" />
      <div className="relative w-full h-full bg-zinc-900/80 border border-zinc-700/50 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row">
        <div className="w-full md:w-2/5 relative aspect-[3/4] md:aspect-auto overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent md:bg-gradient-to-r md:from-transparent md:via-zinc-900/50 md:to-zinc-900 z-10" />
          <div className="absolute inset-0 w-full h-full object-cover bg-zinc-800/50 animate-pulse" />
        </div>
        <div className="w-full md:w-3/5 p-6 sm:p-8 md:p-10 flex flex-col relative z-20">
          <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-6 sm:gap-4 mb-6">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <div className="h-7 w-20 bg-zinc-800/50 rounded-md animate-pulse" />
              <div className="h-7 w-24 bg-zinc-800/50 rounded-md animate-pulse" />
              <div className="h-7 w-16 bg-zinc-800/50 rounded-md animate-pulse" />
            </div>
            <div className="flex gap-2 sm:gap-3 shrink-0 self-end sm:self-auto sm:ml-4">
              <div className="p-2.5 sm:p-3 rounded-full border bg-zinc-800/50 border-zinc-700 w-10 h-10 animate-pulse" />
              <div className="p-2.5 sm:p-3 rounded-full border bg-zinc-800/50 border-zinc-700 w-10 h-10 animate-pulse" />
              <div className="p-2.5 sm:p-3 rounded-full border bg-indigo-500/20 border-indigo-500/50 w-10 h-10 animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-6 sm:mb-8">
            <div className="h-12 w-3/4 bg-zinc-800/50 rounded-xl animate-pulse mb-4" />
            <div className="h-8 w-1/4 bg-zinc-800/50 rounded-xl animate-pulse" />
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-5 mb-8 sm:mb-10">
            <div className="h-16 w-48 bg-zinc-800/50 rounded-xl animate-pulse" />
            <div className="h-16 w-40 bg-zinc-800/50 rounded-xl animate-pulse" />
          </div>
          <div className="space-y-3 mb-8 sm:mb-10">
            <div className="h-4 w-full bg-zinc-800/50 rounded animate-pulse" />
            <div className="h-4 w-full bg-zinc-800/50 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-zinc-800/50 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-zinc-800/50 rounded animate-pulse" />
          </div>
          <div className="mt-8 pt-8 border-t border-zinc-800/50">
            <div className="h-10 w-60 bg-zinc-800/50 rounded-2xl animate-pulse" />
          </div>
          <div className="mt-auto pt-6 sm:pt-8 border-t border-zinc-800/60 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 md:gap-6">
              <div className="h-5 w-24 bg-zinc-800/50 rounded animate-pulse" />
              <div className="h-5 w-24 bg-zinc-800/50 rounded animate-pulse" />
              <div className="h-5 w-24 bg-zinc-800/50 rounded animate-pulse" />
              <div className="h-5 w-24 bg-zinc-800/50 rounded animate-pulse" />
            </div>
            <div className="h-5 w-28 bg-zinc-800/50 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
