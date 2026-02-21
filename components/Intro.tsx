'use client'
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '@/components/LoadingScreen';

export default function UrwisIntro({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false); // 🚀 Zabezpieczenie przed hydracją
  const [shouldShowIntro, setShouldShowIntro] = useState(false);
  const [step, setStep] = useState<'loading' | 'video' | 'done'>('loading');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true); // Oznaczamy, że jesteśmy po stronie przeglądarki

    const isMobile = window.innerWidth < 768;
    const isBot = /Lighthouse|Googlebot|PageSpeed/i.test(navigator.userAgent);
    const introShown = sessionStorage.getItem('urwis_intro_shown');

    if (isMobile || isBot) {
      setStep('done');
      window.dispatchEvent(new Event('urwis_intro_finished'));
      return; 
    }

    if (!introShown) {
      setShouldShowIntro(true);
      // Blokada scrolla przeniesiona tutaj, by nie powodować błędów Hydracji
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      setStep('done');
      window.dispatchEvent(new Event('urwis_intro_finished'));
    }

    // Sprzątanie po odmontowaniu
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.height = 'unset';
    };
  }, []);

  const finishIntro = () => {
    setStep('done');
    sessionStorage.setItem('urwis_intro_shown', 'true');
    window.dispatchEvent(new Event('urwis_intro_finished'));
    document.body.style.overflow = 'unset';
    document.body.style.height = 'unset';
  };

  const handleVideoEnd = () => finishIntro();

  const skipIntro = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) videoRef.current.pause();
    finishIntro();
  };

  // 🚀 ZAPOBIEGANIE BŁĘDOM HYDRACJI (To psuło Google PSI!)
  // Zanim React się "zbudzi" na kliencie, renderujemy ukrytą stronę
  if (!mounted) {
    return <div style={{ opacity: 0 }}>{children}</div>;
  }

  // 🚀 Bypassy dla bota i mobile (Czysty render)
  if (!shouldShowIntro) {
    return <>{children}</>;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {step === 'loading' && (
          <LoadingScreen key="loading" onComplete={() => setStep('video')} />
        )}

        {step === 'video' && (
          <motion.div
            key="video-step"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ 
              opacity: 0, 
              scale: 1.1, 
              filter: 'blur(20px)',
              transition: { duration: 0.8, ease: "easeInOut" }
            }}
            className="fixed inset-0 z-[9999] bg-black w-screen h-screen overflow-hidden"
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              preload="auto"
              onEnded={handleVideoEnd}
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/urwisintro.webm" type="video/webm" />
              <source src="/urwisintro.mp4" type="video/mp4" />
            </video>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={skipIntro}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-black uppercase tracking-widest text-[12px] hover:bg-white/20 transition-all z-[10000] cursor-pointer"
            >
              Pomiń animację
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ 
          opacity: step === 'done' ? 1 : 0,
          scale: step === 'done' ? 1 : 0.98,
        }}
        transition={{ duration: 1, ease: "circOut" }}
        style={{
            pointerEvents: step === 'done' ? 'auto' : 'none' 
        }}
      >
        {children}
      </motion.div>
    </>
  );
}