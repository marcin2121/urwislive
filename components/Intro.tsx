'use client'
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const LoadingScreen = dynamic(() => import('@/components/LoadingScreen'), { ssr: false });

export default function UrwisIntro({ children }: { children: React.ReactNode }) {
  const [_mounted, setMounted] = useState(false);
  const [shouldShowIntro, setShouldShowIntro] = useState(false);
  const [step, setStep] = useState<'loading' | 'video' | 'done'>('done');
  const [videoExiting, setVideoExiting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);

    const isMobile = window.innerWidth < 768;
    const isBot = /Lighthouse|Google|PageSpeed|ChatGPT|ClaudeBot|Bytespider|HeadlessChrome/i.test(navigator.userAgent) || !!navigator.webdriver;
    const introShown = sessionStorage.getItem('urwis_intro_shown');

    if (isMobile || isBot || introShown) {
      window.dispatchEvent(new Event('urwis_intro_finished'));
      setStep('done');
      return;
    }

    // Tylko jeśli faktycznie pokazujemy intro
    setStep('loading');
    setShouldShowIntro(true);
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.height = 'unset';
    };
  }, []);

  // 🔴 TYMCZASOWO WYŁĄCZONE INTRO (Usuń tę linijkę, aby przywrócić)
  return <>{children}</>;

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
    setVideoExiting(true);
    setTimeout(finishIntro, 500);
  };

  const handleVideoEnd = () => {
    setVideoExiting(true);
    setTimeout(finishIntro, 500);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />

      {shouldShowIntro && step !== 'done' && (
        <div className="fixed inset-0 z-[9999] bg-white">
          {step === 'loading' && (
            <LoadingScreen onComplete={() => setStep('video')} />
          )}

          {step === 'video' && (
            <div
              className="absolute inset-0 bg-black w-screen h-screen overflow-hidden"
              style={{
                opacity: videoExiting ? 0 : 1,
                transform: videoExiting ? 'scale(1.05)' : 'scale(1)',
                filter: videoExiting ? 'blur(12px)' : 'none',
                transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out, filter 0.5s ease-in-out',
              }}
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
              </video>

              <button
                onClick={skipIntro}
                aria-label="Pomiń animację wstępną"
                data-testid="skip-intro"
                className="absolute bottom-10 left-1/2 -translate-x-1/2 px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-black uppercase tracking-widest text-[12px] hover:bg-white/20 transition-all z-[10000] cursor-pointer"
                style={{
                  opacity: 0,
                  animation: 'fadeIn 0.5s ease-out 1s forwards',
                }}
              >
                Pomiń animację
              </button>
            </div>
          )}
        </div>
      )}

      {children}
    </>
  );
}
