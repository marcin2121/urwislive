"use client";

import React from "react";
import Hero from "@/components/Hero";
import { AcademyPromo } from "@/components/AcademyPromo";
import AboutSection from "@/components/AboutSection";
import Particles from "@/components/Particles"; // Importujemy komponent
import PoznajUrwisa from "@/components/PoznajUrwisa";
import UrwisIntro from "@/components/Intro";
import LoyaltySection from "@/components/LoyaltySection";

export default function StoreFrontPage() {
  return (
   <UrwisIntro>
    <div className="min-h-screen bg-transparent text-zinc-900">
      {/* 🟢 TŁO: Particles (Globalne dla strony głównej) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Particles
          particleCount={200}
          particleColors={["#BF2024", "#0055ff"]}
          alphaParticles
          particleBaseSize={150}
          speed={0.05}
          sizeRandomness={0.7}
        />
  
      </div>
      {/* Sekcja powitalna */}
      <Hero />
      <LoyaltySection/>
    <PoznajUrwisa />
      <div className="container mx-auto px-4 py-12">
        {/* Banner kierujący do nowej domeny akademiaurwisa.pl */}
        <AcademyPromo />

        {/* Sekcja informacyjna o sali zabaw i sklepie */}
        <section id="oferta" className="my-20">
          <h2 className="text-4xl font-black text-center mb-4 tracking-tighter italic">
            ŚWIAT PEŁEN PRZYGÓD
          </h2>
          <p className="text-center text-zinc-500 mb-12 max-w-2xl mx-auto">
            Zapraszamy do naszej sali zabaw w Białobrzegach. Sprawdź co przygotowaliśmy dla Twojego Urwisa!
          </p>
        </section>
        <AboutSection />
      </div>
    </div>
    </UrwisIntro>
  );
}