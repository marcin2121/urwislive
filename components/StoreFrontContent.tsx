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
import { AcademyPromo } from "@/components/AcademyPromo";
import AboutSection from "@/components/AboutSection";
import PoznajUrwisa from "@/components/PoznajUrwisa";
import UrwisIntro from "@/components/Intro";
import LoyaltySection from "@/components/LoyaltySection";

// DYNAMICZNE IMPORTY (SSR: FALSE dla stabilności animacji i cząsteczek)
const UrwisGallery = dynamic(() => import("@/components/UrwisGallery"), { ssr: false });
const Particles = dynamic(() => import("@/components/Particles"), { ssr: false });

// 📸 GALERIA: Zoptymalizowana pod najczęstsze wyszukiwania (LEGO, Wyprawka, Balony)
const mainPageItems = [
  { id: 1, src: '/gallery/IMG_6032.webp', title: "Plecaki i Akcesoria", category: "Wyprawka Szkolna" },
  { id: 2, src: '/gallery/IMG_6021.webp', title: "Klocki LEGO", category: "Nowości 2026" },
  { id: 3, src: '/gallery/IMG_6019.webp', title: "Zabawki Kreatywne", category: "Rozwój przez zabawę" },
  { id: 4, src: '/gallery/IMG_6013.webp', title: "Gry Planszowe", category: "Rodzinne Wieczory" },
  { id: 5, src: '/gallery/IMG_6009.webp', title: "Artykuły Biurowe", category: "Dla Firm i Domu" },
  { id: 6, src: '/gallery/IMG_6014.webp', title: "Balony z Helem", category: "Urodziny & Party" },
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
          {/* SEKACJA HERO */}
          <Hero />

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