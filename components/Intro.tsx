'use client'
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '@/components/LoadingScreen';

export default function UrwisIntro({ children }: { children: React.ReactNode }) {
  // 🚀 POCZĄTKOWY STAN MUSI BYĆ FALSE (dla szybkiego LCP i SSR)
  const [shouldShowIntro, setShouldShowIntro] = useState(false);
  const [step, setStep] = useState<'loading' | 'video' | 'done'>('loading');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // 1. Sprawdzamy czy to mobile
    const isMobile = window.innerWidth < 768;
    const introShown = sessionStorage.getItem('urwis_intro_shown');

    // 2. LOGIKA DLA MOBILE: Całkowity bypass
    if (isMobile) {
      setStep('done');
      // Wysyłamy sygnał dla ciasteczek od razu
      window.dispatchEvent(new Event('urwis_intro_finished'));
      return; // Kończymy, shouldShowIntro zostaje false
    }

    // 3. LOGIKA DLA DESKTOP
    if (!introShown) {
      setShouldShowIntro(true);
    } else {
      setStep('done');
      window.dispatchEvent(new Event('urwis_intro_finished'));
    }
  }, []);

  // Obsługa blokowania scrolla (tylko jeśli intro faktycznie się pokazuje)
  useEffect(() => {
    if (shouldShowIntro && step !== 'done') {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.height = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.height = 'unset';
    };
  }, [shouldShowIntro, step]);

  const finishIntro = () => {
    setStep('done');
    sessionStorage.setItem('urwis_intro_shown', 'true');
    window.dispatchEvent(new Event('urwis_intro_finished'));
  };

  const handleVideoEnd = () => finishIntro();

  const skipIntro = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) videoRef.current.pause();
    finishIntro();
  };

  // 🚀 JEŚLI TO MOBILE (lub intro już było): Renderujemy czysty content bez Motion.main i bez wraperów
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

      {/* Kontent strony - na desktopie animuje się po zakończeniu wideo */}
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