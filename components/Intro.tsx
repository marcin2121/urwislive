'use client'
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '@/components/LoadingScreen';

export default function UrwisIntro({ children }: { children: React.ReactNode }) {
  const [shouldShowIntro, setShouldShowIntro] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [step, setStep] = useState<'loading' | 'video' | 'done'>('loading');
  const videoRef = useRef<HTMLVideoElement>(null);

  // 1. SILNIEJSZA OBSŁUGA AUTOPLAY NA MOBILE
  useEffect(() => {
    if (step === 'video' && videoRef.current) {
      const playVideo = async () => {
        try {
          // Force'ujemy wyciszenie (warunek konieczny dla autoplay na mobile)
          videoRef.current!.muted = true;
          // Próbujemy odpalić wideo
          await videoRef.current!.play();
        } catch (error) {
          console.error("Autoplay failed, user interaction might be needed or power save mode is on:", error);
          // Opcjonalnie: jeśli wideo nie ruszy w ciągu 2 sekund, skipujemy intro
          // żeby użytkownik nie patrzył na czarny ekran
          // setTimeout(finishIntro, 2000); 
        }
      };
      playVideo();
    }
  }, [step]);

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

  useEffect(() => {
    const introShown = sessionStorage.getItem('urwis_intro_shown');
    if (!introShown) {
      setShouldShowIntro(true);
    } else {
      setStep('done');
      setLoadingComplete(true);
    }
  }, []);

  const finishIntro = () => {
    setStep('done');
    sessionStorage.setItem('urwis_intro_shown', 'true');
  };

  const handleVideoEnd = () => {
    finishIntro();
  };

  const skipIntro = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) videoRef.current.pause();
    finishIntro();
  };

  if (!shouldShowIntro) return <>{children}</>;

  return (
    <>
      <AnimatePresence mode="wait">
        {step === 'loading' && (
          <LoadingScreen key="loading" onComplete={() => {
            setLoadingComplete(true);
            setStep('video');
          }} />
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
            className="fixed inset-0 z-9999 bg-black w-screen h-screen overflow-hidden"
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              // Dodajemy dodatkowe atrybuty dla iOS
              webkit-playsinline="true"
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
              transition={{ delay: 1, duration: 1 }}
              onClick={skipIntro}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-black uppercase tracking-widest text-[12px] hover:bg-white/20 transition-all z-[10000] cursor-pointer"
            >
              Pomiń animację
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.main
        animate={{ 
          opacity: step === 'done' ? 1 : 0,
          scale: step === 'done' ? 1 : 0.95,
        }}
        transition={{ duration: 1, ease: "circOut" }}
        style={{
            pointerEvents: step === 'done' ? 'auto' : 'none' 
        }}
      >
        {children}
      </motion.main>
    </>
  );
}