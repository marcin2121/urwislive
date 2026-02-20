'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, PlusSquare, X, Download, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isFromQR = searchParams.get('utm_source') === 'qr_store';

    if (isIOS) setPlatform('ios');
    else setPlatform('android');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone && isFromQR) setShow(true);
    });

    if (!isStandalone && (isFromQR || (isIOS && !isStandalone))) {
      const timer = setTimeout(() => setShow(true), isFromQR ? 500 : 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShow(false);
      setDeferredPrompt(null);
    }
  };

  // LOGIKA DLA SPECJALNEGO TEKSTU
  const isFromQR = searchParams.get('utm_source') === 'qr_store';
  const isPromotionsPage = pathname.includes('/promocje');
  const showSpecialPromoText = isPromotionsPage && isFromQR;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          className="fixed bottom-8 left-4 right-4 z-[100] md:left-auto md:right-8 md:w-[380px]"
        >
          <div className="relative pt-12"> 
            
         {/* ZERKAJĄCY URWIS - rączki powinny być na dole grafiki */}
         <motion.div 
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[52%] w-44 h-44 z-20 pointer-events-none"
            >
              <Image 
                src="/urwis-peeking.webp" 
                alt="Urwis zagląda"
                fill
                className="object-contain"
                priority
              />
            </motion.div>

            <div className="bg-white/95 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.2)] border-2 border-white relative z-10">              
              <button onClick={() => setShow(false)} className="absolute top-4 right-4 text-zinc-300 hover:text-zinc-600">
                <X size={20} strokeWidth={3} />
              </button>

              <div className="text-center mb-6 pt-2">
                {/* --- SEKCJA SPECJALNEGO TEKSTU --- */}
                {showSpecialPromoText && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-4 p-3 bg-blue-50 border-2 border-blue-100 rounded-2xl flex items-center justify-center gap-2"
                  >
                    <Sparkles className="text-blue-600 shrink-0" size={16} />
                    <p className="text-[12px] font-black text-blue-700 uppercase italic leading-tight">
                      Sprawdź nasze promocje i zainstaluj aplikację!
                    </p>
                  </motion.div>
                )}
                {/* -------------------------------- */}

                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900 leading-none mb-2">
                  {isPromotionsPage ? "Łap okazje" : "Miej Urwisa"} <span className="text-blue-600">{isPromotionsPage ? "z naszą apką!" : "zawsze pod ręką!"}</span>
                </h3>
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest leading-tight">
                  Zainstaluj aplikację i nie przegap nadchodzących okazji
                </p>
              </div>

              {platform === 'android' ? (
                <button
                  onClick={handleAndroidInstall}
                  className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                >
                  <Download size={18} /> Zainstaluj w 2 sekundy
                </button>
              ) : (
                <div className="space-y-4 bg-zinc-50/80 p-5 rounded-3xl border border-zinc-100">
                  <div className="flex items-center justify-around gap-2 text-[9px] font-black uppercase text-zinc-500">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-500 border border-zinc-100"><Share size={20} /></div>
                      <span>Kliknij "Udostępnij"</span>
                    </div>
                    <div className="h-px w-6 bg-zinc-200" />
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-zinc-900 border border-zinc-100"><PlusSquare size={20} /></div>
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