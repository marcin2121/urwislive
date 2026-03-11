'use client';

import { motion } from 'framer-motion';

const PARTICLES = Array.from({length: 40}).map((_, i) => ({
  id: i,
  x: (i * 13) % 100,
  y: (i * 19) % 100,
  size: 10 + (i % 12),
  type: ['star', 'circle', 'cross'][i % 3],
  color: ['#BF2024', '#0055ff', '#fbbf24'][i % 3],
  duration: 20 + (i % 15),
  delay: -(i % 30),
  xOffset: (i % 10) - 5
}));

/**
 * Animowane tło Hero — ładowane dynamicznie (ssr: false).
 * Nie blokuje FCP/LCP — pojawia się po załadowaniu framer-motion.
 */
export default function HeroAnimations() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-transparent">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute opacity-40"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            color: p.color,
          }}
          animate={{
            y: ["0vh", "-100vh"],
            x: ["0vw", `${p.xOffset}vw`],
            rotate: [0, 360],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay },
            x: { duration: p.duration * 0.8, repeat: Infinity, ease: "easeInOut", repeatType: "mirror", delay: p.delay },
            rotate: { duration: p.duration * 0.6, repeat: Infinity, ease: "linear" }
          }}
        >
          {p.type === 'star' && (
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          )}
          {p.type === 'circle' && (
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
              <circle cx="12" cy="12" r="9" />
            </svg>
          )}
          {p.type === 'cross' && (
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 11H13V5C13 4.45 12.55 4 12 4C11.45 4 11 4.45 11 5V11H5C4.45 11 4 11.45 4 12C4 12.55 4.45 13 5 13H11V19C11 19.55 11.45 20 12 20C12.55 20 13 19.55 13 19V13H19C19.55 13 20 12.55 20 12C20 11.45 19.55 11 19 11Z" />
            </svg>
          )}
        </motion.div>
      ))}

      {/* Delikatne maski zanikające */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white/50" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/70 to-transparent" />
    </div>
  );
}
