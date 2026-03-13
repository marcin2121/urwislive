'use client';

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";

const OrphansFixer = dynamic(() => import("@/components/utils/OrphansFixer"), { ssr: false });
const CookieModal = dynamic(() => import("@/components/ui/CookieModal"), { ssr: false });
const InstallPrompt = dynamic(() => import("@/components/ui/InstallPrompt"), { ssr: false });
const WelcomeScreen = dynamic(() => import("@/components/ui/WelcomeScreen"), { ssr: false });
const OnboardingTour = dynamic(() => import("@/components/ui/OnboardingTour"), { ssr: false });
const UrwisChatWidget = dynamic(() => import("@/components/UrwisChatWidget").then(mod => mod.UrwisChatWidget), { ssr: false });
const RibbonsBg = dynamic(() => import("@/components/Ribbons").then(mod => mod.RibbonsBg), { ssr: false });

export function ClientLayoutComponents() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 1: Skrypty niewidoczne i bardzo lekkie (po 300ms)
    const t1 = setTimeout(() => setStage(1), 300);
    // Stage 2: UI globalne (po 1000ms)
    const t2 = setTimeout(() => setStage(2), 1000);
    // Stage 3: Ciężkie animacje tła i Chat (po 2000ms)
    const t3 = setTimeout(() => setStage(3), 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <>
      {stage >= 2 && (
        <>
          <Suspense fallback={null}>
            <WelcomeScreen />
          </Suspense>
          <Suspense fallback={null}>
            <InstallPrompt />
          </Suspense>
          <Suspense fallback={null}>
            <CookieModal />
          </Suspense>
          <OnboardingTour />
        </>
      )}

      {stage >= 3 && (
        <>
          <Suspense fallback={null}>
            <OrphansFixer />
          </Suspense>
          <RibbonsBg />
          <UrwisChatWidget />
        </>
      )}
    </>
  );
}
