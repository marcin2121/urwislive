"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import { AcademyPromo } from "@/components/AcademyPromo";
import AboutSection from "@/components/AboutSection";
import PoznajUrwisa from "@/components/PoznajUrwisa";
import UrwisIntro from "@/components/Intro";
import LoyaltySection from "@/components/LoyaltySection";
import UrwisGallery from "@/components/UrwisGallery";

// DODANE: Dynamiczny import cząsteczek (nie blokuje renderowania strony)
const Particles = dynamic(() => import("@/components/Particles"), { ssr: false });

const mainPageItems = [
  { id: 1, src: '/gallery/IMG_6032.webp', title: "Czas do szkoły", category: "Plecaki" },
  { id: 2, src: '/gallery/IMG_6021.webp', title: "Kraina Klocków", category: "Zabawki konstrukcyjne" },
  { id: 3, src: '/gallery/IMG_6019.webp', title: "Mięciutkie Przytulasy", category: "Maskotki" },
  { id: 4, src: '/gallery/IMG_6013.webp', title: "Gimnastyka Umysłu", category: "Puzzle" },
  { id: 5, src: '/gallery/IMG_6009.webp', title: "Wodne Szaleństwo", category: "Letnie zabawy" },
  { id: 6, src: '/gallery/IMG_6014.webp', title: "Małe Skarby", category: "Bibeloty" },
  { id: 7, src: '/gallery/sklep-front.jpg', title: "Nasz Sklep", category: "Białobrzegi" },
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
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false); // Zabezpieczenie dla Next.js

  useEffect(() => {
    setMounted(true);
    
    // TUTAJ ZNAJDUJE SIĘ TA FUNKCJA:
    const checkMobile = () => setIsMobile(window.innerWidth < 768); 
    
    checkMobile(); // Sprawdzamy od razu po wejściu na stronę
    window.addEventListener('resize', checkMobile); // Nasłuchujemy zmiany rozmiaru okna
    
    return () => window.removeEventListener('resize', checkMobile); // Sprzątamy po sobie
  }, []);

  // 1. WYCIĄGAMY CAŁĄ ZAWARTOŚĆ DO ZMIENNEJ (Zasada DRY - Don't Repeat Yourself)
  const pageContent = (
    <div className="min-h-screen bg-transparent text-zinc-900">
      
      {/* 🟢 TŁO: Particles - RENDEROWANE TYLKO NA DESKTOPIE */}
      {!isMobile && mounted && (
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
      )}

      <div className="relative z-10">
        {/* 1. Sekcja powitalna */}
        <Hero />

        {/* 2. Program lojalnościowy */}
        <LoyaltySection />

        {/* 3. GALERIA (Z EFEKTEM LAYOUT ID) */}
        <UrwisGallery items={mainPageItems} />
        
        {/* 5. Sekcja o maskotce */}
        <PoznajUrwisa />

        <div className="container mx-auto px-4 py-12">
          {/* 6. Banner do Akademii */}
          <AcademyPromo />
          
          <AboutSection />
        </div>
      </div>
    </div>
  );

  // 2. UNIKAMY BŁĘDU HYDRATACJI W NEXT.JS
  // Zwracamy czysty content serwerowo, by SEO widziało stronę, 
  // a klienckie efekty włączamy dopiero po załadowaniu w przeglądarce.
  if (!mounted) {
    return pageContent;
  }

  // 3. WARUNKOWE RENDEROWANIE INTRO
  // Jeśli to mobile -> renderuj czystą zawartość
  // Jeśli to desktop -> owiń zawartość w komponent UrwisIntro
  return isMobile ? pageContent : <UrwisIntro>{pageContent}</UrwisIntro>;
}