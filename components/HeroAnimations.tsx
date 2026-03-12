'use client';

import { useEffect, useState } from 'react';

const PARTICLES = Array.from({length: 40}).map((_, i) => ({
  id: i,
  x: (i * 13) % 100,
  y: (i * 19) % 100,
  size: 10 + (i % 12),
  type: ['star', 'circle', 'cross'][i % 3],
  color: ['#BF2024', '#0055ff', '#fbbf24'][i % 3],
  durationY: 20 + (i % 15),
  durationX: (20 + (i % 15)) * 0.8,
  durationR: (20 + (i % 15)) * 0.6,
  delay: -(i % 30),
  xOffset: (i % 10) - 5
}));

/**
 * Animowane tło Hero — Czysty CSS (zamiast Framer Motion).
 * Optymalizacja Total Blocking Time (TBT).
 */
export default function HeroAnimations() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-transparent">
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute opacity-40 will-change-transform"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            color: p.color,
            animation: `
              floatY-${p.id} ${p.durationY}s linear ${p.delay}s infinite,
              floatX-${p.id} ${p.durationX}s ease-in-out ${p.delay}s infinite alternate,
              spinRotate ${p.durationR}s linear ${p.delay}s infinite
            `,
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
        </div>
      ))}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spinRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        ${PARTICLES.map(p => `
          @keyframes floatY-${p.id} {
            from { top: ${p.y}%; }
            to { top: -10%; }
          }
          @keyframes floatX-${p.id} {
            from { margin-left: 0vw; }
            to { margin-left: ${p.xOffset}vw; }
          }
        `).join('')}
      `}} />

      {/* Delikatne maski zanikające */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white/50" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/70 to-transparent" />
    </div>
  );
}
