"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, MotionConfig } from "framer-motion";
import {
  ShoppingCart,
  GraduationCap,
  PartyPopper,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

// 🟢 KRYTYCZNE — ładowane natychmiast (LCP)
import Hero from "@/components/Hero";
import UrwisIntro from "@/components/Intro";
import { useGpuAcceleration } from "@/lib/useGpu";

// ─── DYNAMICZNE IMPORTY ────────────────────────────────────────────────────────

const DemoWheelBanner = dynamic(() => import("@/components/DemoWheelBanner"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse bg-zinc-100 rounded-[3rem] mx-6 my-12" />,
});

const UrwisAR = dynamic(() => import("@/components/urwisek/UrwisAR"), {
  ssr: false,
});

const DualBrandSection = dynamic(() => import("@/components/DualBrandSection"), {
  loading: () => <div className="h-96 animate-pulse bg-zinc-50 mx-6 rounded-[3rem]" />,
});

const UrwisGallery = dynamic(() => import("@/components/UrwisGallery"), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-zinc-50 w-full animate-pulse" />,
});

// ✅ Particles bez osobnej dywizji — komponent sam zarządza widocznością
const Particles = dynamic(() => import("@/components/Particles"), { ssr: false });

const LoyaltySection = dynamic(() => import('@/components/LoyaltySection'), {
  ssr: false,
  loading: () => <div className="min-h-[500px]" />,
});

const ColoringBanner = dynamic(() => import('@/components/ColoringBanner'), {
  ssr: false,
  loading: () => <div className="min-h-[300px]" />,
});

const PoznajUrwisa = dynamic(() => import('@/components/PoznajUrwisa'), {
  ssr: false,
  loading: () => <div className="min-h-[800px]" />,
});

const AboutSection = dynamic(() => import('@/components/AboutSection'), {
  ssr: false,
  // ✅ Placeholder rezerwuje miejsce — zero CLS
  loading: () => <div className="min-h-[400px]" />,
});

// ─── DANE STATYCZNE POZA KOMPONENTEM (nie odtwarzane przy każdym renderze) ────

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

const quickCards = [
  { icon: ShoppingCart, title: "LEGO & Zabawki",  link: "/oferta/zabawki",      colorClass: "text-[#BF2024]" },
  { icon: GraduationCap, title: "Szkoła & Biuro", link: "/oferta/szkola-i-biuro", colorClass: "text-[#0055ff]" },
  { icon: PartyPopper,   title: "Party & Balony", link: "/oferta/imprezy",       colorClass: "text-amber-500" },
];

// ─── GŁÓWNY KOMPONENT ──────────────────────────────────────────────────────────

export default function StoreFrontContent() {
  const hasGpu = useGpuAcceleration();
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Opóźnione Particles — nie blokują głównego wątku przy starcie
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // ✅ Particles ładowane 3s po mountowaniu — zero wpływu na TBT/LCP
  useEffect(() => {
    if (!hasGpu) return;
    const timer = setTimeout(() => setShowParticles(true), 3000);
    return () => clearTimeout(timer);
  }, [hasGpu]);

  return (
    <MotionConfig reducedMotion={hasGpu ? "user" : "always"}>
      <UrwisIntro>
        <div className="min-h-screen bg-transparent text-zinc-900">

          {/* 🎨 TŁO: Particles — tylko desktop, tylko po 3s, tylko z GPU */}
          {showParticles && (
            <div className="fixed inset-0 z-0 pointer-events-none hidden md:block">
              <Particles
                particleCount={isMobile ? 20 : 60}
                particleColors={["#BF2024", "#0055ff"]}
                alphaParticles
                particleBaseSize={isMobile ? 60 : 100}
                speed={0.03}
              />
            </div>
          )}

          <div className="relative z-10">
            {!hasGpu && (
              <div className="w-full bg-zinc-900 text-zinc-400 text-[10px] uppercase font-black tracking-widest text-center py-2 border-b border-white/5">
                Uruchomiono w trybie wysokiej wydajności
              </div>
            )}

            <header>
              <Hero />
            </header>

            <DemoWheelBanner />
            <UrwisAR />
            <DualBrandSection />

            {/* ✅ QuickCards z danymi ze stałej tablicy — zero duplikacji JSX */}
            <section className="py-12 px-6" aria-label="Główne działy sklepu">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickCards.map((card) => (
                  <QuickCard key={card.link} {...card} />
                ))}
              </div>
            </section>

            <LoyaltySection />
            <ColoringBanner />

            <section className="py-20" aria-labelledby="gallery-title">
              <div className="container mx-auto px-6 mb-12">
                <h2
                  id="gallery-title"
                  className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter"
                >
                  Twoje Centrum{" "}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">
                    Zabawy
                  </span>
                </h2>
              </div>
              <UrwisGallery items={mainPageItems} />
            </section>

            <PoznajUrwisa />

            <div className="container mx-auto px-4 py-24 space-y-32">
              <section>
                <AboutSection />
              </section>
            </div>
          </div>
        </div>
      </UrwisIntro>
    </MotionConfig>
  );
}

// ─── QUICKCARD ─────────────────────────────────────────────────────────────────

interface QuickCardProps {
  icon: LucideIcon;
  title: string;
  link: string;
  colorClass: string;
}

function QuickCard({ icon: Icon, title, link, colorClass }: QuickCardProps) {
  return (
    <Link href={link} aria-label={`Przejdź do sekcji: ${title}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border-2 border-white shadow-xl flex items-center justify-between group transition-all hover:bg-white/70"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <Icon size={30} className={`${colorClass} transition-colors`} strokeWidth={2.5} aria-hidden="true" />
          </div>
          <h3 className="text-xl font-black uppercase italic tracking-tight text-zinc-900 leading-none">
            {title}
          </h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-zinc-900/5 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all">
          <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </div>
      </motion.div>
    </Link>
  );
}
