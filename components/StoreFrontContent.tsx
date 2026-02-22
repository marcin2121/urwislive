"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  GraduationCap, 
  PartyPopper, 
  ChevronRight,
  type LucideIcon 
} from "lucide-react";
import Link from "next/link";

// IMPORT TWOICH KOMPONENTÓW
import Hero from "@/components/Hero";
import DualBrandSection from "@/components/DualBrandSection";
import { AcademyPromo } from "@/components/AcademyPromo";
import AboutSection from "@/components/AboutSection";
import PoznajUrwisa from "@/components/PoznajUrwisa";
import UrwisIntro from "@/components/Intro";
import LoyaltySection from "@/components/LoyaltySection";
import ColoringBanner from "@/components/ColoringBanner";
// DYNAMICZNE IMPORTY (SSR: FALSE dla stabilności animacji i cząsteczek)
const UrwisGallery = dynamic(() => import("@/components/UrwisGallery"), { ssr: false });
const Particles = dynamic(() => import("@/components/Particles"), { ssr: false });

// 📸 GALERIA: Pełne 16 elementów z hybrydą (Twój bajkowy klimat + Twarde SEO dla Google)
const mainPageItems = [
    { id: 1, src: '/gallery/IMG_6032.webp', title: "Plecaki Szkolne", category: "Czas do szkoły", seoAlt: "Plecaki szkolne i tornistry dla dzieci - Sklep Urwis Białobrzegi" },
    { id: 2, src: '/gallery/IMG_6021.webp', title: "Klocki LEGO", category: "Kraina Klocków", isNew: true, seoAlt: "Największy wybór klocków LEGO w Białobrzegach - Sklep Urwis Reymonta 38A" },
    { id: 3, src: '/gallery/IMG_6019.webp', title: "Maskotki i Pluszaki", category: "Mięciutkie Przytulasy", seoAlt: "Miękkie pluszaki i maskotki dla dzieci w Sklepie Urwis" },
    { id: 4, src: '/gallery/IMG_6013.webp', title: "Puzzle i Układanki", category: "Gimnastyka Umysłu", seoAlt: "Puzzle i gry edukacyjne dla dzieci - Sklep stacjonarny Białobrzegi" },
    { id: 5, src: '/gallery/IMG_6009.webp', title: "Zabawki Letnie", category: "Wodne Szaleństwo", seoAlt: "Zabawki ogrodowe i akcesoria do pływania - Urwis Białobrzegi" },
    { id: 6, src: '/gallery/IMG_6014.webp', title: "Prezenty i Upominki", category: "Małe Skarby", seoAlt: "Pomysły na prezent dla dziecka w Białobrzegach - Sklep Urwis" },
    { id: 7, src: '/gallery/sklep-front.webp', title: "Sklep Białobrzegi", category: "Nasz Sklep stacjonarny", seoAlt: "Wejście do Sklepu Urwis w Białobrzegach przy ul. Reymonta 38A" },
    { id: 8, src: '/gallery/IMG_6035.webp', title: "Artykuły Szkolne", category: "Szkolna Wyprawka", isPromo: true, seoAlt: "Wyprawka szkolna Białobrzegi - zeszyty, piórniki i przybory" },
    { id: 9, src: '/gallery/IMG_6005.webp', title: "Pojazdy Zabawkowe", category: "Moja Bryka", seoAlt: "Samochody zabawkowe i pojazdy dla dzieci - oferta Sklepu Urwis" },
    { id: 10, src: '/gallery/IMG_6004.webp', title: "Jeździki", category: "Odpalaj i jedź", seoAlt: "Jeździki i zabawki do odpychania dla maluchów - Białobrzegi" },
    { id: 11, src: '/gallery/IMG_6003.webp', title: "Akcesoria imprezowe", category: "Świeczki Urodzinowe", seoAlt: "Balony z helem i dekoracje urodzinowe Białobrzegi - Sklep Urwis" },
    { id: 12, src: '/gallery/IMG_6001.webp', title: "Książki dla Dzieci", category: "Magiczne Opowieści", seoAlt: "Książki dla dzieci i bajki - Sklep stacjonarny w Białobrzegach" },
    { id: 13, src: '/gallery/IMG_5997.webp', title: "Traktory i Maszyny", category: "Mali Farmerzy", seoAlt: "Traktory zabawkowe i maszyny rolnicze dla dzieci - Urwis" },
    { id: 14, src: '/gallery/IMG_5996.webp', title: "Zabawki Edukacyjne", category: "Szef Kuchni", seoAlt: "Zabawki kreatywne i edukacyjne dla przedszkolaków" },
    { id: 15, src: '/gallery/IMG_5995.webp', title: "Gry Planszowe", category: "Rodzinne Granie", seoAlt: "Gry planszowe i towarzyskie - Sklep Urwis Białobrzegi" },
    { id: 16, src: '/gallery/IMG_5994.webp', title: "Artykuły Artystyczne", category: "Mały Artysta", seoAlt: "Przybory plastyczne i artystyczne dla dzieci - oferta Urwis" }
  ];

export default function StoreFrontContent() {
  return (
    <UrwisIntro>
      <div className="min-h-screen bg-transparent text-zinc-900">
        
        {/* 🟢 TŁO: Particles (Tylko na desktopie dla max wydajności) */}
        <div className="fixed inset-0 z-0 pointer-events-none hidden md:block">
          <Particles
            particleCount={80}
            particleColors={["#BF2024", "#0055ff"]}
            alphaParticles
            particleBaseSize={100}
            speed={0.03}
          />
        </div>

        <div className="relative z-10">
          {/* SEKCJA HERO */}
          <Hero />

          {/* TWOJA SEKCJA DUAL BRAND (Dodana pod Hero) */}
          <DualBrandSection />

          {/* 🎯 TRZY FILARY: Szybka nawigacja po najważniejszych działach Sklepu na Reymonta */}
          <section className="py-12 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              <QuickCard 
                icon={ShoppingCart} 
                title="LEGO & Zabawki" 
                link="/oferta/zabawki"
                colorClass="text-[#BF2024]"
              />
              <QuickCard 
                icon={GraduationCap} 
                title="Szkoła & Biuro" 
                link="/oferta/szkola-i-biuro"
                colorClass="text-[#0055ff]"
              />
              <QuickCard 
                icon={PartyPopper} 
                title="Party & Balony" 
                link="/oferta/imprezy"
                colorClass="text-amber-500"
              />
            </div>
          </section>

          {/* 🟡 LOYALTY: Łącznik ze światem Lecę w Kulki (Targowicka 4) */}
          <LoyaltySection />
           {/* Baner kolorowanek */}
          <ColoringBanner />
          {/* GALERIA ASORTYMENTU */}
          <section className="py-20">
            <div className="container mx-auto px-6 mb-12">
              <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
                Twoje Centrum <span className="text-[#BF2024]">Zabawy</span>
              </h2>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm mt-2">
                Odkryj najlepsze marki w Białobrzegach
              </p>
            </div>
            <UrwisGallery items={mainPageItems} />
          </section>
          
          <PoznajUrwisa />

          {/* SEKACJE DODATKOWE */}
          <div className="container mx-auto px-4 py-24 space-y-32">
            <AcademyPromo />
            <AboutSection />
          </div>
        </div>
      </div>
    </UrwisIntro>
  );
}

/**
 * KOMPONENT POMOCNICZY: QuickCard
 * Naprawione typowanie IconComponent zapobiega błędom TypeScript (TS2769)
 */
interface QuickCardProps {
  icon: LucideIcon;
  title: string;
  link: string;
  colorClass: string;
}

function QuickCard({ icon: Icon, title, link, colorClass }: QuickCardProps) {
  return (
    <Link href={link}>
      <motion.div 
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border-2 border-white shadow-xl flex items-center justify-between group transition-all hover:bg-white/70"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <Icon size={30} className={`${colorClass} transition-colors`} strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-black uppercase italic tracking-tight text-zinc-900 leading-none">
            {title}
          </h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-zinc-900/5 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all">
          <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </motion.div>
    </Link>
  );
}