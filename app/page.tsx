"use client";

import React from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import { AcademyPromo } from "@/components/AcademyPromo";
import AboutSection from "@/components/AboutSection";
import PoznajUrwisa from "@/components/PoznajUrwisa";
import UrwisIntro from "@/components/Intro";
import LoyaltySection from "@/components/LoyaltySection";

// Dynamiczny import - zostawiamy ssr: false dla galerii i cząsteczek
const UrwisGallery = dynamic(() => import("@/components/UrwisGallery"), { ssr: false });
const Particles = dynamic(() => import("@/components/Particles"), { ssr: false });

const mainPageItems = [
  { id: 1, src: '/gallery/IMG_6032.webp', title: "Czas do szkoły", category: "Plecaki" },
  { id: 2, src: '/gallery/IMG_6021.webp', title: "Kraina Klocków", category: "Zabawki konstrukcyjne" },
  { id: 3, src: '/gallery/IMG_6019.webp', title: "Mięciutkie Przytulasy", category: "Maskotki" },
  { id: 4, src: '/gallery/IMG_6013.webp', title: "Gimnastyka Umysłu", category: "Puzzle" },
  { id: 5, src: '/gallery/IMG_6009.webp', title: "Wodne Szaleństwo", category: "Letnie zabawy" },
  { id: 6, src: '/gallery/IMG_6014.webp', title: "Małe Skarby", category: "Bibeloty" },
  { id: 7, src: '/gallery/sklep-front.webp', title: "Nasz Sklep", category: "Białobrzegi" },
  { id: 8, src: '/gallery/IMG_6035.webp', title: "Szkolna Wyprawka", category: "Artykuły szkolne" },
  { id: 9, src: '/gallery/IMG_6005.webp', title: "Czas na Start", category: "Pojazdy" },
  { id: 10, src: '/gallery/IMG_6004.webp', title: "Moja Bryka", category: "Jeździki" },
  { id: 11, src: '/gallery/IMG_6003.webp', title: "Balonowe Szaleństwo", category: "Party & Urodziny" },
  { id: 12, src: '/gallery/IMG_6001.webp', title: "Magiczne Opowieści", category: "Książki" },
  { id: 13, src: '/gallery/IMG_5997.webp', title: "Mali Farmerzy", category: "Traktory" },
  { id: 14, src: '/gallery/IMG_5996.webp', title: "Szef Kuchni", category: "Odgrywanie ról" },
  { id: 15, src: '/gallery/IMG_5995.webp', title: "Rodzinne Granie", category: "Gry planszowe" },
  { id: 16, src: '/gallery/IMG_5994.webp', title: "Mały Artysta", category: "Artykuły artystyczne" }
];

export default function StoreFrontPage() {
  return (
    /* Zasada: Page.tsx tylko definiuje STRUKTURĘ. 
       To UrwisIntro samo sprawdzi w środku: "Czy jestem na mobile? Jeśli tak, po prostu pokaż dzieci (children)".
    */
    <UrwisIntro>
      <div className="min-h-screen bg-transparent text-zinc-900">
        
        {/* Particles ukrywamy klasą CSS - to najszybsza metoda, nie blokuje renderowania */}
        <div className="fixed inset-0 z-0 pointer-events-none hidden md:block">
          <Particles
            particleCount={150}
            particleColors={["#BF2024", "#0055ff"]}
            alphaParticles
            particleBaseSize={100}
            speed={0.05}
          />
        </div>

        <div className="relative z-10">
          <Hero />
          <LoyaltySection />
          <UrwisGallery items={mainPageItems} />
          <PoznajUrwisa />

          <div className="container mx-auto px-4 py-12">
            <AcademyPromo />
            <AboutSection />
          </div>
        </div>
      </div>
    </UrwisIntro>
  );
}