import { motion } from 'motion/react';

interface LogoProps {
  size?: number;
  showBackground?: boolean;
  className?: string;
}

export function Logo({ size = 40, showBackground = true, className = '' }: LogoProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Background Gradient */}
          <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>

          {/* Accent Gradient */}
          <linearGradient id="logo-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          {/* Glow */}
          <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        {showBackground && (
          <rect width="100" height="100" rx="28" fill="url(#logo-bg)" className="drop-shadow-2xl" />
        )}

        {/* Stars */}
        <circle cx="18" cy="20" r="0.6" fill="#fff" opacity="0.3" />
        <circle cx="82" cy="18" r="0.6" fill="#fff" opacity="0.2" />
        <circle cx="20" cy="80" r="0.6" fill="#fff" opacity="0.2" />
        <circle cx="78" cy="78" r="0.6" fill="#fff" opacity="0.4" />

        <g filter="url(#logo-glow)">
          {/* Portal Ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="26"
            stroke="url(#logo-accent)"
            strokeWidth="3"
            fill="none"
            opacity="0.8"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ originX: '50px', originY: '50px' }}
          />

          {/* Inner Pulse Ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="18"
            stroke="#a78bfa"
            strokeWidth="1.5"
            fill="none"
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.98, 1.02, 0.98] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '50px', originY: '50px' }}
          />

          {/* Sword (Core Identity) */}
          <path d="M50 28 L54 40 L50 44 L46 40 Z" fill="#ffffff" />
          <rect x="48.5" y="44" width="3" height="20" rx="1" fill="#ffffff" />
          <rect x="44" y="62" width="12" height="3" rx="1.5" fill="#ffffff" />

          {/* Focus Core */}
          <motion.circle
            cx="50"
            cy="50"
            r="3.5"
            fill="#ffffff"
            animate={{ r: [3.5, 4.5, 3.5], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </g>
      </svg>
    </motion.div>
  );
}
