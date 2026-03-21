import dynamic from 'next/dynamic';
import HeroContent from './HeroContent';

const HeroAnimations = dynamic(() => import('./HeroAnimations'), { ssr: false });

export default function HeroSection() {
  return (
    <section className="relative min-h-[85dvh] md:min-h-[90vh] flex items-center justify-center bg-transparent text-zinc-900 pt-24 md:pt-[10vh] pb-16 md:pb-20">
      {/* Animowane tło — lazy-loaded, nie blokuje LCP */}
      <HeroAnimations />

      {/* Statyczna treść — renderowana natychmiast */}
      <HeroContent />

      {/* Indykator scrolla */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2 opacity-30 hidden md:flex animate-bounce">
        <div className="w-[3px] h-12 bg-gradient-to-b from-zinc-400 to-transparent rounded-full" />
      </div>
    </section>
  );
}
