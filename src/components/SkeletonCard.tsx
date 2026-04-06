import { motion } from 'motion/react';

export function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full h-full bg-zinc-900/40 border border-zinc-800/50 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col md:flex-row"
    >
      <div className="w-full md:w-2/5 aspect-[3/4] md:aspect-auto bg-zinc-800/50 animate-pulse" />
      <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col gap-5">
        <div className="flex gap-3 mb-2">
          <div className="h-7 w-20 bg-zinc-800/50 rounded-md animate-pulse" />
          <div className="h-7 w-24 bg-zinc-800/50 rounded-md animate-pulse" />
          <div className="h-7 w-16 bg-zinc-800/50 rounded-md animate-pulse" />
        </div>
        <div className="h-12 w-3/4 bg-zinc-800/50 rounded-xl animate-pulse mb-4" />
        <div className="flex gap-5 mb-8">
          <div className="h-14 w-36 bg-zinc-800/50 rounded-xl animate-pulse" />
          <div className="h-14 w-36 bg-zinc-800/50 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-3 mb-10">
          <div className="h-4 w-full bg-zinc-800/50 rounded animate-pulse" />
          <div className="h-4 w-full bg-zinc-800/50 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-zinc-800/50 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-zinc-800/50 rounded animate-pulse" />
        </div>
        <div className="mt-auto pt-8 border-t border-zinc-800/50">
          <div className="h-5 w-40 bg-zinc-800/50 rounded animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}
