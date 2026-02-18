'use client'

import { useRef } from 'react';
import { useInView } from 'framer-motion';
import UrwisIntro from '@/components/Intro';
import Particles from "@/components/Particles";
import { RibbonsBg } from "@/components/Ribbons";
import HeroSection from '@/components/Hero';
import PoznajUrwisa from '@/components/PoznajUrwisa';
import AboutSection from '@/components/AboutSection';
import PromoSection from '@/components/PromoSection';
import OfertaGrid from '@/components/OfertaGrid';
import KlubUrwisaSection from '@/components/KlubUrwisaSection';
import LeceWKulkiSection from '@/components/LeceWKulkiSection';
import CurrencyGuide from '@/components/CurrencyGuide';
import PortalButton from '@/components/ui/PortalButton';

export default function Home() {
  const kulkiSectionRef = useRef(null);
  const isKulkiInView = useInView(kulkiSectionRef, { margin: "-20% 0px -20% 0px" });

  const urwisColors = ["#bf2024", "#0055ff"];
  const leceWKulkiColors = ["#5eb1ff", "#ff8ca8"];
  const currentColors = isKulkiInView ? leceWKulkiColors : urwisColors;

  return (
    <UrwisIntro>
      <main className="relative min-h-screen w-full bg-transparent">
        
        {/* WARSTWA -30: Biała baza */}
        <div className="fixed inset-0 bg-white -z-30" />

        {/* WARSTWA -20: Ribbons (Tło wstążek) */}
        <div className="fixed inset-0 pointer-events-none -z-20">
          <RibbonsBg 
            key={isKulkiInView ? 'ribbons-kulki' : 'ribbons-urwis'}
            colors={currentColors}
            // ✅ Dodaj te klasy, jeśli komponent je przyjmuje:
          />
        </div>

        {/* WARSTWA -10: Particles (Latające kulki) */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <Particles
            key={isKulkiInView ? 'particles-kulki' : 'particles-urwis'}
            particleCount={80}
            particleColors={currentColors}
            alphaParticles
            particleBaseSize={150}
            speed={0.1}
          />
        </div>

        {/* WARSTWA 0: Treść */}
        <div className="relative z-0 w-full">

          <HeroSection />
          <PoznajUrwisa />
          <PromoSection />
          <OfertaGrid />
          <KlubUrwisaSection />
          <AboutSection />
</div>

      </main>
    </UrwisIntro>
  );
}