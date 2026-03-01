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

const DualBrandSection = dynamic(() => import("@/components/DualBrandSection"), {
  loading: () => <div className="h-96 animate-pulse bg-zinc-50 mx-6 rounded-[3rem]" />,
});

// ✅ Particles bez osobnej dywizji — komponent sam zarządza widocznością
const Particles = dynamic(() => import("@/components/Particles"), { ssr: false });

const LoyaltySection = dynamic(() => import('@/components/LoyaltySection'), {
  ssr: false,
  loading: () => <div className="min-h-[500px]" />,
});

const PlayZoneBanner = dynamic(() => import('@/components/PlayZoneBanner'), {
  ssr: false,
  loading: () => <div className="min-h-[400px]" />,
});

const AboutSection = dynamic(() => import('@/components/AboutSection'), {
  ssr: false,
  // ✅ Placeholder rezerwuje miejsce — zero CLS
  loading: () => <div className="min-h-[400px]" />,
});



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

            <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex flex-col gap-6 md:gap-8 mb-24 relative z-20">
              <motion.div initial={{ opacity: 0, scale: 0.98, y: 30 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true, margin: "200px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="w-full">
                <DemoWheelBanner />
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.98, y: 30 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true, margin: "200px" }} transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }} className="w-full">
                <DualBrandSection />
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.98, y: 30 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true, margin: "200px" }} transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }} className="w-full">
                <LoyaltySection />
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.98, y: 30 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true, margin: "200px" }} transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }} className="w-full">
                <PlayZoneBanner />
              </motion.div>
            </div>

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
