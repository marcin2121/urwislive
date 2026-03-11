'use client';

import dynamic from "next/dynamic";
import { Suspense } from "react";

const OrphansFixer = dynamic(() => import("@/components/utils/OrphansFixer"), { ssr: false });
const CookieModal = dynamic(() => import("@/components/ui/CookieModal"), { ssr: false });
const InstallPrompt = dynamic(() => import("@/components/ui/InstallPrompt"), { ssr: false });
const WelcomeScreen = dynamic(() => import("@/components/ui/WelcomeScreen"), { ssr: false });
const OnboardingTour = dynamic(() => import("@/components/ui/OnboardingTour"), { ssr: false });
const UrwisChatWidget = dynamic(() => import("@/components/UrwisChatWidget").then(mod => mod.UrwisChatWidget), { ssr: false });
const RibbonsBg = dynamic(() => import("@/components/Ribbons").then(mod => mod.RibbonsBg), { ssr: false });

export function ClientLayoutComponents() {
  return (
    <>
      <Suspense fallback={null}>
        <WelcomeScreen />
      </Suspense>

      <Suspense fallback={null}>
        <OrphansFixer />
      </Suspense>

      <Suspense fallback={null}>
        <InstallPrompt />
      </Suspense>

      <RibbonsBg />

      <UrwisChatWidget />

      <Suspense fallback={null}>
        <CookieModal />
      </Suspense>

      <OnboardingTour />
    </>
  );
}
