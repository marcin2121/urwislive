"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useGpuAcceleration } from "@/lib/useGpu";

// 🟢 KRYTYCZNE — ładowane natychmiast (LCP)
import Hero from "@/components/Hero";
import UrwisIntro from "@/components/Intro";

// ─── DYNAMICZNE IMPORTY ────────────────────────────────────────────────────────

const DemoWheelBanner = dynamic(() => import("@/components/DemoWheelBanner"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse bg-zinc-100 rounded-[3rem] mx-6 my-12" />,
});

const DualBrandSection = dynamic(() => import("@/components/DualBrandSection"), {
  loading: () => <div className="h-96 animate-pulse bg-zinc-50 mx-6 rounded-[3rem]" />,
});

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
  loading: () => <div className="min-h-[400px]" />,
});

// ─── CSS IntersectionObserver wrapper (zastępuje motion.div whileInView) ────────

function FadeInSection({ children, delay = 0, className = "" }: { 
  children: React.ReactNode; 
  delay?: number; 
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { rootMargin: '200px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.98)',
        transition: `opacity 0.7s ease-out ${delay}s, transform 0.7s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ─── GŁÓWNY KOMPONENT ──────────────────────────────────────────────────────────

export default function StoreFrontContent() {
  const hasGpu = useGpuAcceleration();
  const [isMobile, setIsMobile] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (!hasGpu) return;
    const timer = setTimeout(() => {
      setIsMobile(window.innerWidth < 768);
      setShowParticles(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [hasGpu, setShowParticles]);

  return (
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

          <header>
            <Hero />
          </header>

          <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex flex-col gap-6 md:gap-8 mb-24 relative z-20">
            <FadeInSection className="w-full">
              <DemoWheelBanner />
            </FadeInSection>

            <FadeInSection className="w-full" delay={0.1}>
              <DualBrandSection />
            </FadeInSection>

            <FadeInSection className="w-full" delay={0.2}>
              <LoyaltySection />
            </FadeInSection>

            <FadeInSection className="w-full" delay={0.3}>
              <PlayZoneBanner />
            </FadeInSection>
          </div>

          <div className="container mx-auto px-4 py-24 space-y-32">
            <section>
              <AboutSection />
            </section>
          </div>
        </div>
      </div>
    </UrwisIntro>
  );
}
