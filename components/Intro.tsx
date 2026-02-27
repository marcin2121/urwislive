'use client'
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '@/components/LoadingScreen';

export default function UrwisIntro({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [shouldShowIntro, setShouldShowIntro] = useState(false);
  const [step, setStep] = useState<'loading' | 'video' | 'done'>('loading');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);

    const isMobile = window.innerWidth < 768;
    const isBot = /Lighthouse|Googlebot|PageSpeed/i.test(navigator.userAgent);
    const introShown = sessionStorage.getItem('urwis_intro_shown');

    if (isMobile || isBot || introShown) {
      setStep('done');
      window.dispatchEvent(new Event('urwis_intro_finished'));
      return;
    }

    setShouldShowIntro(true);
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';

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

  const skipIntro = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) videoRef.current.pause();
    finishIntro();
  };

  // Przed hydratacją — children niewidoczne ale w DOM (SEO + LCP)
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  // Drugi i kolejne wizyty — zero animacji, zero narzutu
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
              scale: 1.05,          // ✅ było 1.1 — mniejszy scale = mniej pracy GPU
              filter: 'blur(12px)', // ✅ było blur(20px) — blur jest drogi
              transition: { duration: 0.5, ease: 'easeInOut' } // ✅ było 0.8s
            }}
            className="fixed inset-0 z-[9999] bg-black w-screen h-screen overflow-hidden"
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              preload="auto"
              onEnded={finishIntro}
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

      {/* ✅ Zamiast motion.div animującego scale+opacity na całej stronie
           — prosty fade-in tylko raz po zakończeniu intro */}
      <div
        style={{
          opacity: step === 'done' ? 1 : 0,
          // ✅ transition zamiast Framer Motion — przeglądarka obsługuje to na GPU compositor thread
          // bez angażowania JS thread
          transition: step === 'done' ? 'opacity 0.4s ease-out' : 'none',
          pointerEvents: step === 'done' ? 'auto' : 'none',
        }}
      >
        {children}
      </div>
    </>
  );
}
