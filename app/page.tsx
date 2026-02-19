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
      <div className="container mx-auto px-4 py-12">
        {/* Banner kierujący do nowej domeny akademiaurwisa.pl */}
        <AcademyPromo />
  <PoznajUrwisa />
        <AboutSection />
        
      </div>
    </div>
    </UrwisIntro>
  );
}