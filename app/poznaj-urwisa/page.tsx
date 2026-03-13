"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, History } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Particles from "@/components/Particles";

// Moduły wyciągnięte ze strony głównej oraz starego O Nas
import ONasSection from "@/components/O-nasSection";
const PoznajUrwisa = dynamic(() => import('@/components/PoznajUrwisa'), { ssr: false });
const UrwisGallery = dynamic(() => import("@/components/UrwisGallery"), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-zinc-50 w-full animate-pulse" />,
});

const mainPageItems = [
  { id: 1,  src: "/gallery/IMG_6032.webp", title: "Plecaki Szkolne",       category: "Czas do szkoły",          seoAlt: "Plecaki szkolne i tornistry dla dzieci - Sklep Urwis Białobrzegi" },
  { id: 2,  src: "/gallery/IMG_6021.webp", title: "Klocki LEGO",           category: "Kraina Klocków",           isNew: true, seoAlt: "Największy wybór klocków LEGO w Białobrzegach - Sklep Urwis Reymonta 38A" },
  { id: 3,  src: "/gallery/IMG_6019.webp", title: "Maskotki i Pluszaki",   category: "Mięciutkie Przytulasy",    seoAlt: "Miękkie pluszaki i maskotki dla dzieci w Sklepie Urwis" },
  { id: 4,  src: "/gallery/IMG_6013.webp", title: "Puzzle i Układanki",    category: "Gimnastyka Umysłu",        seoAlt: "Puzzle i gry edukacyjne dla dzieci - Sklep stacjonarny Białobrzegi" },
  { id: 5,  src: "/gallery/IMG_6009.webp", title: "Zabawki Letnie",        category: "Wodne Szaleństwo",         seoAlt: "Zabawki ogrodowe i akcesoria do pływania - Urwis Białobrzegi" },
  { id: 6,  src: "/gallery/IMG_6014.webp", title: "Prezenty i Upominki",   category: "Małe Skarby",              seoAlt: "Pomysły na prezent dla dziecka w Białobrzegach - Sklep Urwis" },
  { id: 7,  src: "/gallery/sklep-front.webp", title: "Sklep Białobrzegi",  category: "Nasz Sklep stacjonarny",   seoAlt: "Wejście do Sklepu Urwis w Białobrzegach przy ul. Reymonta 38A" },
  { id: 8,  src: "/gallery/IMG_6035.webp", title: "Artykuły Szkolne",      category: "Szkolna Wyprawka",         isPromo: true, seoAlt: "Wyprawka szkolna Białobrzegi - zeszyty, piórniki i przybory" },
  { id: 9,  src: "/gallery/IMG_6005.webp", title: "Pojazdy Zabawkowe",     category: "Moja Bryka",               seoAlt: "Samochody zabawkowe i pojazdy dla dzieci - oferta Sklepu Urwis" },
  { id: 10, src: "/gallery/IMG_6004.webp", title: "Jeździki",              category: "Odpalaj i jedź",           seoAlt: "Jeździki i zabawki do odpychania dla maluchów - Białobrzegi" },
  { id: 11, src: "/gallery/IMG_6003.webp", title: "Akcesoria imprezowe",   category: "Świeczki Urodzinowe",      seoAlt: "Balony z helem i dekoracje urodzinowe Białobrzegi - Sklep Urwis" },
  { id: 12, src: "/gallery/IMG_6001.webp", title: "Książki dla Dzieci",    category: "Magiczne Opowieści",       seoAlt: "Książki dla dzieci i bajki - Sklep stacjonarny w Białobrzegach" },
  { id: 13, src: "/gallery/IMG_5997.webp", title: "Traktory i Maszyny",    category: "Mali Farmerzy",            seoAlt: "Traktory zabawkowe i maszyny rolnicze dla dzieci - Urwis" },
  { id: 14, src: "/gallery/IMG_5996.webp", title: "Zabawki Edukacyjne",    category: "Szef Kuchni",              seoAlt: "Zabawki kreatywne i edukacyjne dla przedszkolaków" },
  { id: 15, src: "/gallery/IMG_5995.webp", title: "Gry Planszowe",         category: "Rodzinne Granie",          seoAlt: "Gry planszowe i towarzyskie - Sklep Urwis Białobrzegi" },
  { id: 16, src: "/gallery/IMG_5994.webp", title: "Artykuły Artystyczne",  category: "Mały Artysta",             seoAlt: "Przybory plastyczne i artystyczne dla dzieci - oferta Urwis" },
];

export default function PoznajUrwisaPage() {
  return (
    <div className="min-h-screen bg-transparent pt-12 pb-32 relative z-10 text-zinc-900">
      <div className="fixed inset-0 pointer-events-none z-0">
        <Particles
          particleCount={40}
          particleColors={["#BF2024", "#0055ff", "#f59e0b"]}
          alphaParticles
          particleBaseSize={180}
          speed={0.06}
        />
      </div>
      <div className="container mx-auto px-6 relative z-20">
        <Link href="/oferta" className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 hover:bg-white text-zinc-600 hover:text-[#BF2024] shadow-sm backdrop-blur-md rounded-full transition-all font-black uppercase tracking-widest text-xs border border-white/50 mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Powrót do oferty
        </Link>
      </div>

      <div className="space-y-12">
        <PoznajUrwisa />
        
        <section>
          <ONasSection />
        </section>
      </div>
      
      <section className="py-20" aria-labelledby="gallery-title">
        <div className="container mx-auto px-6 mb-12 text-center md:text-left">
          <h2
            id="gallery-title"
            className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter pr-4"
          >
            NASZ SKLEP W{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF2024] via-orange-500 to-[#0055ff] pr-4 drop-shadow-sm">
              OBIEKTYWIE
            </span>
          </h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest mt-4">Wpadnij na Reymonta 38A w Białobrzegach i przekonaj się sam!</p>
        </div>
        <UrwisGallery items={mainPageItems} />
      </section>
    </div>
  );
}
