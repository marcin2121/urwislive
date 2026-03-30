'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, PlusSquare, X, Download, Sparkles } from "lucide-react";
import Image from 'next/image';
import { usePopupControl } from '@/components/PopupProvider';

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { currentPopup, nextPopup } = usePopupControl();

  // 🚀 LOGIKA ZAMYKANIA: Zapamiętujemy w sesji, że użytkownik zamknął okno
  const handleDismiss = useCallback(() => {
    sessionStorage.setItem('urwis_install_prompt_dismissed', 'true');
    setShow(false);
    nextPopup();
  }, [nextPopup]);

  useEffect(() => {
    // Sprawdzamy, czy użytkownik już odrzucił prompt w tej sesji
    const isDismissed = sessionStorage.getItem('urwis_install_prompt_dismissed');
    if (isDismissed === 'true') return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    const isFromQR = searchParams.get('utm_source') === 'qr_store';

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isIOS) setPlatform('ios');
    else setPlatform('android');

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Pokaż tylko jeśli jest w kolejce
      if (currentPopup === 'INSTALL_PROMPT' && !isStandalone && isFromQR && !isDismissed) {
        setShow(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Automatyczne pokazanie dla iOS lub QR po ustawieniu state z PROVIDERa (zamiast timerów)
    if (currentPopup === 'INSTALL_PROMPT') {
      if (!isStandalone && !isDismissed && (isFromQR || (isIOS && !isStandalone))) {
        setShow(true);
      } else {
        // Pominięcie
        nextPopup();
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, [searchParams, currentPopup, nextPopup]);

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
        sessionStorage.setItem('urwis_install_prompt_dismissed', 'true');
        nextPopup();
      }
      setDeferredPrompt(null);
    }
  };

  const isFromQR = searchParams.get('utm_source') === 'qr_store';
  const isPromotionsPage = pathname.includes('/promocje');
  const showSpecialPromoText = isPromotionsPage && isFromQR;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-4 right-4 z-[100] md:left-auto md:right-8 md:w-[380px]"
          role="dialog"
          aria-labelledby="install-prompt-title"
        >
          <div className="relative pt-12"> 
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[52%] w-44 h-44 z-20 pointer-events-none"
            >
              <Image 
                src="/urwis-peeking.webp" 
                alt="Maskotka Urwis zaprasza do instalacji"
                fill
                className="object-contain"
              />
            </motion.div>

            <div className="bg-white p-6 rounded-4xl shadow-[0_30px_60px_rgba(0,0,0,0.3)] border-2 border-zinc-100 relative z-10">              
              <button 
                onClick={handleDismiss} 
                aria-label="Zamknij powiadomienie"
                className="absolute top-4 right-4 text-zinc-300 hover:text-zinc-600 p-2 transition-colors"
              >
                <X size={20} strokeWidth={3} aria-hidden="true" />
              </button>

              <div className="text-center mb-6 pt-2">
                {showSpecialPromoText && (
                  <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-100 rounded-2xl flex items-center justify-center gap-2">
                    <Sparkles className="text-[#0055ff] shrink-0" size={16} aria-hidden="true" />
                    <p className="text-[12px] font-black text-[#0055ff] uppercase italic leading-tight">
                      Sprawdź nasze promocje i zainstaluj aplikację!
                    </p>
                  </div>
                )}

                <h3 id="install-prompt-title" className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900 leading-none mb-2">
                  {isPromotionsPage ? "Łap okazje" : "Miej Urwisa"} <span className="text-[#0055ff]">{isPromotionsPage ? "z naszą apką!" : "zawsze pod ręką!"}</span>
                </h3>
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest leading-tight">
                  Zainstaluj aplikację i nie przegap nadchodzących okazji
                </p>
              </div>

              {platform === 'android' ? (
                <button
                  onClick={handleAndroidInstall}
                  className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-transform"
                >
                  <Download size={18} aria-hidden="true" /> Zainstaluj w 2 sekundy
                </button>
              ) : (
                <div className="space-y-4 bg-zinc-50 p-5 rounded-3xl border border-zinc-100">
                  <div className="flex items-center justify-around gap-2 text-[9px] font-black uppercase text-zinc-500">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#0055ff] border border-zinc-100"><Share size={20} aria-hidden="true" /></div>
                      <span>Kliknij "Udostępnij"</span>
                    </div>
                    <div className="h-px w-6 bg-zinc-200" aria-hidden="true" />
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-zinc-900 border border-zinc-100"><PlusSquare size={20} aria-hidden="true" /></div>
                      <span>"Do ekranu początkowego"</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}