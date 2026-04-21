import { motion } from 'motion/react';
import { X, ShieldCheck, Zap, Heart, Database, Code, Terminal } from 'lucide-react';

interface InfoModalProps {
  onClose: () => void;
}

export function InfoModal({ onClose }: InfoModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Scanline/Noise Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-50 opacity-[0.03]" // Adjust opacity for subtlety
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 2px)',
            backgroundSize: '100% 2px',
          }}
        />
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white uppercase">System Hub</h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Taste Vectoring & Intelligence Protocols</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[70vh] space-y-10 custom-scrollbar">
          {/* Mission */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Heart className="w-4 h-4" />
              <h3 className="text-sm font-black uppercase tracking-widest">The Mission</h3>
            </div>
            <p className="text-zinc-400 leading-relaxed text-sm">
              WESEKAI is a response to the era of corporate algorithms and data-harvesting monoliths. 
              I engineered this system to reclaim discovery from the black box—stripping away the bloat to find pure signal in the noise. 
              This is a lone-wolf protocol: local-first, privacy-absolute, and built for those who demand a higher caliber of recommendation.
            </p>
          </section>

          {/* The Intel */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <Zap className="w-4 h-4" />
              <h3 className="text-sm font-black uppercase tracking-widest">The Intel</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl">
                <h4 className="text-xs font-bold text-zinc-200 mb-2 uppercase">Engine Logic</h4>
                <p className="text-[13px] text-zinc-500 leading-snug">
                  Our recommendation engine analyzes your &quot;Arsenal&quot; and &quot;Dropped&quot; lists to build a real-time preference map.
                </p>
              </div>
              <div className="p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl">
                <h4 className="text-xs font-bold text-zinc-200 mb-2 uppercase">Elite Fallback</h4>
                <p className="text-[13px] text-zinc-500 leading-snug">
                  When API limits are reached, the system engages a curated database of high-quality titles to ensure zero downtime.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Database className="w-4 h-4" />
              <h3 className="text-sm font-black uppercase tracking-widest">Data Privacy</h3>
            </div>
            <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
              <p className="text-zinc-400 text-sm leading-relaxed">
                <strong className="text-zinc-200">Local-First Protocol:</strong> WESEKAI does not store your lists on any server. 
                Your &quot;Arsenal&quot; and &quot;Dropped&quot; history are stored strictly in your browser&apos;s local storage. 
                We use no tracking cookies or third-party analytics that identify you.
              </p>
            </div>
          </section>

          {/* System Specs */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Code className="w-4 h-4" />
              <h3 className="text-sm font-black uppercase tracking-widest">System Specs</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {['React 19', 'Vite 6', 'Tailwind 4', 'Motion', 'TypeScript', 'Jikan V4', 'AniList GraphQL'].map((spec) => (
                <span 
                  key={spec}
                  className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-500 uppercase tracking-tighter"
                >
                  {spec}
                </span>
              ))}
            </div>
          </section>

          {/* Developer Signal */}
          <section className="pt-6 border-t border-zinc-800/50">
            <div className="flex items-center justify-between group/sig cursor-default">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-500/20">
                  W
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-widest">Signal Received</p>
                  <p className="text-[10px] text-zinc-500 font-mono">ENCRYPTED_ID: LONE_WOLF_01</p>
                </div>
              </div>
              <Terminal className="w-4 h-4 text-zinc-700 group-hover/sig:text-indigo-500 transition-colors" />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 text-center">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
            WESEKAI v1.0 // System Operational
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}