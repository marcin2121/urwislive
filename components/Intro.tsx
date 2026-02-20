'use client'
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '@/components/LoadingScreen';

export default function UrwisIntro({ children }: { children: React.ReactNode }) {
  const [shouldShowIntro, setShouldShowIntro] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  // Zredukowane stany: tylko loading -> video -> done
  const [step, setStep] = useState<'loading' | 'video' | 'done'>('loading');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Obsługa blokowania scrolla podczas intro
  useEffect(() => {
    if (shouldShowIntro && step !== 'done') {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.height = 'unset';
    }
    // Cleanup przy odmontowaniu
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.height = 'unset';
    };
  }, [shouldShowIntro, step]);

  // Sprawdzenie sesji (czy intro już było grane)
  useEffect(() => {
    const introShown = sessionStorage.getItem('urwis_intro_shown');
    if (!introShown) {
      setShouldShowIntro(true);
    } else {
      setStep('done');
      setLoadingComplete(true);
    }
  }, []);

 
  // Funkcja kończąca intro i zapisująca stan
  const finishIntro = () => {
    setStep('done');
    sessionStorage.setItem('urwis_intro_shown', 'true');

    // 🚀 DODANO: Sygnał dla Modala Ciasteczkowego
    window.dispatchEvent(new Event('urwis_intro_finished'));
  };

  const handleVideoEnd = () => {
    finishIntro();
  };

  const skipIntro = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) videoRef.current.pause();
    finishIntro();
  };

  // Jeśli intro nie ma być grane, zwracamy od razu dzieci (stronę)
  if (!shouldShowIntro) return <>{children}</>;

  return (
    <>
      <AnimatePresence mode="wait">
        {/* KROK 1: Ładowanie zasobów */}
        {step === 'loading' && (
          <LoadingScreen key="loading" onComplete={() => {
            setLoadingComplete(true);
            setStep('video');
          }} />
        )}

        {/* KROK 2: Wideo na pełen ekran */}
        {step === 'video' && (
          <motion.div
            key="video-step"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            // EFEKT WYJŚCIA: Wideo powiększa się i rozmywa, odsłaniając stronę
            exit={{ 
              opacity: 0, 
              scale: 1.1, 
              filter: 'blur(20px)',
              transition: { duration: 0.8, ease: "easeInOut" }
            }}
            className="fixed inset-0 z-9999 bg-black w-screen h-screen overflow-hidden"
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

            {/* Przycisk Pomiń */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              onClick={skipIntro}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-black uppercase tracking-widest text-[12px] hover:bg-white/20 transition-all z-10000 cursor-pointer"
            >
              Pomiń animację
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KROK 3: Główna zawartość (Hero.tsx i reszta) */}
      <motion.main
        animate={{ 
          // Strona jest widoczna, ale gdy wideo gra, jest schowana pod spodem
          opacity: step === 'done' ? 1 : 0,
          // Efekt delikatnego wjazdu strony (zoom out)
          scale: step === 'done' ? 1 : 0.95,
        }}
        transition={{ duration: 1, ease: "circOut" }}
        style={{
            // Zapobiega interakcji ze stroną, gdy wideo gra
            pointerEvents: step === 'done' ? 'auto' : 'none' 
        }}
      >
        {children}
      </motion.main>
    </>
  );
}