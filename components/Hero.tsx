'use client';

import dynamic from 'next/dynamic';
import HeroContent from './HeroContent';

const HeroAnimations = dynamic(() => import('./HeroAnimations'), { ssr: false });

export default function HeroSection() {
  return (
    <section className="relative min-h-[85dvh] md:min-h-[90vh] flex items-center justify-center overflow-hidden bg-transparent text-zinc-900 pt-24 md:pt-[10vh] pb-16 md:pb-20">
      {/* Animowane tło — lazy-loaded, nie blokuje LCP */}
      <HeroAnimations />

      {/* Statyczna treść — renderowana natychmiast */}
      <HeroContent />

      {/* Indykator scrolla */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2 opacity-30 hidden md:flex animate-bounce">
        <div className="w-[3px] h-12 bg-gradient-to-b from-zinc-400 to-transparent rounded-full" />
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        .animate-float {
          animation: float linear infinite;
          will-change: transform;
        }

        @keyframes textShineBg {
          0% { background-position: 250% center; }
          20% { background-position: -100% center; }
          100% { background-position: -100% center; }
        }
        .animate-shine-text {
          animation: textShineBg 4s ease-in-out infinite;
        }
        
        .balance {
          text-wrap: balance;
        }

        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-hero-fade-up {
          animation: hero-fade-up 0.8s ease-out both;
        }
      `}</style>
    </section>
  );
}