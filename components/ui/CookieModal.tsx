'use client'

import React, { useState, useEffect } from 'react'
import { Check, X, Info, Cookie } from 'lucide-react' 
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { usePopupControl } from '@/components/PopupProvider'

export default function CookieModal() {
  const [isVisible, setIsVisible] = useState(false)
  const [showImage, setShowImage] = useState(false)
  const { currentPopup, nextPopup } = usePopupControl()
  const pathname = usePathname()

  const trackCookieEvent = (action: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cookie_modal_interakcja', {
        'event_category': 'Cookie_Consent',
        'event_label': action
      });
    }
  };

  useEffect(() => {
    if (currentPopup === 'COOKIES') {
      const consent = localStorage.getItem('urwis_cookie_accepted')

      if (consent === null) {
        const showModal = () => {
          setIsVisible(true);
          // Czyścimy nasłuchiwacze od razu po pokazaniu
          ['scroll', 'touchmove', 'touchstart', 'keydown', 'click', 'mousemove'].forEach(e => 
            window.removeEventListener(e, showModal)
          );
        };

        // Jeśli prawdziwy użytkownik wchodzi w interakcję, pokaż od razu (brak opóźnienia)
        ['scroll', 'touchmove', 'touchstart', 'keydown', 'click', 'mousemove'].forEach(e => 
          window.addEventListener(e, showModal, { once: true, passive: true })
        );

        // Fallback: Pokaż automatycznie po 3.5 sekundach (idealne dla Lighthouse)
        // Pozwala to na pełne wyrenderowanie LCP głównej strony
        const timer = setTimeout(showModal, 3500);
        
        return () => {
          clearTimeout(timer);
          ['scroll', 'touchmove', 'touchstart', 'keydown', 'click', 'mousemove'].forEach(e => 
            window.removeEventListener(e, showModal)
          );
        };
      } else {
        nextPopup() // Pop-up był już rozwiązany, idziemy dalej
      }
    }
  }, [currentPopup, nextPopup])

  useEffect(() => {
    if (isVisible) {
      // Skoro modal może pojawić się po 3.5s, obrazek ładujemy szybciej (400ms zamiast 1.5s)
      const timer = setTimeout(() => setShowImage(true), 400);
      return () => clearTimeout(timer);
    }
  }, [isVisible])

  const saveConsent = (status: 'true' | 'false') => {
    localStorage.setItem('urwis_cookie_accepted', status)
    setIsVisible(false)
    nextPopup() // ✅ Komunikacja do Globalnego Managera, że zwinęliśmy Cookies
  }

  return (
    <>
      {isVisible && (
        <>
          {pathname === '/polityka-prywatnosci' ? (
            // Wersja dyskretna (Mini Banner) na stronie polityki prywatności
            <div
              role="region"
              aria-label="Informacja o plikach cookies"
              className="fixed bottom-0 left-0 right-0 z-[10000] bg-white p-4 md:p-6 shadow-[0_-20px_60px_rgba(0,0,0,0.15)] border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 rounded-t-[2rem] animate-slide-up"
            >
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 rounded-full flex items-center justify-center shrink-0 border-2 border-blue-100">
                  <Cookie size={28} className="text-blue-500" />
                </div>
                <div>
                  <h3 id="cookie-mini-title" className="font-black text-zinc-900 uppercase text-sm md:text-lg mb-1">Złapaliśmy Cię na ciastkach!</h3>
                  <p className="text-zinc-500 text-xs md:text-sm font-medium">Spokojnie przeczytaj zasady, a następnie zatwierdź swój wybór.</p>
                </div>
              </div>
              <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                <button
                  onClick={() => { trackCookieEvent('odrzucenie'); saveConsent('false'); }}
                  aria-label="Odrzuć wszystkie pliki cookies"
                  className="flex-1 md:flex-none px-3 md:px-6 py-3 md:py-4 bg-zinc-100 text-zinc-400 rounded-xl md:rounded-[1.2rem] font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-zinc-200 hover:text-red-500 transition-all flex items-center justify-center gap-1.5"
                >
                  <X size={12} strokeWidth={3} className="shrink-0 md:size-3.5" /> Odrzuć
                </button>
                <button
                  onClick={() => { trackCookieEvent('akceptacja'); saveConsent('true'); }}
                  aria-label="Akceptuj wszystkie pliki cookies"
                  className="flex-1 md:flex-none px-3 md:px-8 py-3 md:py-4 bg-zinc-900 text-white rounded-xl md:rounded-[1.2rem] font-black uppercase tracking-widest text-[9px] md:text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-1.5 md:gap-2"
                >
                  <Check size={14} strokeWidth={4} className="shrink-0 md:size-4" /> Akceptuję
                </button>
              </div>
            </div>
          ) : (
            // Wersja Modala - Popup na mobile (floating card), Full Modal na desktop
            <div className="fixed z-[10000] bottom-4 left-4 right-4 sm:inset-0 sm:bottom-0 sm:left-0 sm:right-0 sm:p-4 flex flex-col sm:items-center justify-end sm:justify-center pointer-events-none">
              {/* Overlay (tylko na desktopie, by mobile nie miało zaciemnionego tła) */}
              <div
                className="hidden sm:block fixed inset-0 bg-zinc-950/60 backdrop-blur-sm animate-fade-in pointer-events-auto"
              />

              {/* Kontener Popupa/Modala */}
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="cookie-modal-title"
                className="relative w-full max-w-2xl bg-white rounded-[2rem] sm:rounded-[3rem] p-5 sm:p-8 md:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.15)] sm:shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden pointer-events-auto modal-animation-responsive border border-zinc-100 sm:border-none mb-[calc(env(safe-area-inset-bottom)+76px)] sm:mb-0"
              >
                {/* Gradienty w tle */}
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-[radial-gradient(circle,rgba(0,85,255,0.15)_0%,transparent_70%)] rounded-full pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[radial-gradient(circle,rgba(191,32,36,0.15)_0%,transparent_70%)] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex flex-row sm:flex-col items-center text-left sm:text-center w-full gap-4 sm:gap-0">
                    <div 
                      className="relative w-24 h-24 sm:w-48 sm:h-48 md:w-64 md:h-64 sm:mb-4 drop-shadow-2xl animate-float-slow shrink-0"
                    >
                      {showImage && (
                        <Image 
                          src="/urwis-cookies.webp" 
                          alt="Ilustracja Urwisa jedzącego ciastka" 
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 96px, (max-width: 768px) 192px, 256px"
                          loading="lazy"
                          // @ts-ignore
                          fetchPriority="low"
                        />
                      )}
                    </div>

                    <div className="flex flex-col space-y-1 sm:space-y-4">
                      <div className="flex items-center sm:justify-center gap-1.5 sm:gap-2 text-[#BF2024] font-black uppercase tracking-widest text-[9px] sm:text-[10px]">
                        <Cookie size={12} className="sm:hidden" aria-hidden="true" />
                        <Cookie size={14} className="hidden sm:block" aria-hidden="true" />
                        <span>Polityka plików cookies</span>
                      </div>

                      <h2 id="cookie-modal-title" className="text-2xl sm:text-4xl md:text-5xl font-black text-zinc-900 uppercase leading-[0.9]">
                        Złapaliśmy <br className="hidden sm:block"/> cię na <span className="text-blue-600 block sm:inline">CIASTKACH!</span>
                      </h2>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 sm:mb-8 text-left sm:text-center w-full border-t border-zinc-100 sm:border-none pt-3 sm:pt-0">
                    <p className="text-zinc-600 font-bold uppercase text-[10px] sm:text-sm md:text-base leading-[1.3] sm:leading-tight sm:max-w-md sm:mx-auto px-1 sm:px-2">
                      Urwis uwielbia ciacha! 🍪 Używamy technologii takich jak <span className="text-zinc-900 underline decoration-blue-500/30">pliki cookies</span>, aby nasza strona działała idealnie i bezpiecznie. Kliknij „Daj ciacho”, aby przejść dalej!
                    </p>
                  </div>

                  <div className="flex flex-col w-full gap-2 sm:gap-3 mt-4 sm:mt-0">
                    <button
                      onClick={() => { trackCookieEvent('akceptacja'); saveConsent('true'); }}
                      aria-label="Akceptuj wszystkie pliki cookies i zamknij okno"
                      className="w-full py-3.5 sm:py-4 md:py-5 px-4 bg-zinc-900 text-white rounded-[1.2rem] sm:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] sm:text-[11px] md:text-sm shadow-xl hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 md:gap-3 group pointer-events-auto"
                    >
                      <Check size={16} strokeWidth={4} className="shrink-0 group-hover:rotate-12 transition-transform sm:w-4 sm:h-4 md:w-5 md:h-5" aria-hidden="true" /> 
                      <span className="text-center">Daj ciacho! (Akceptuję)</span>
                    </button>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                      <button
                        onClick={() => { trackCookieEvent('odrzucenie'); saveConsent('false'); }}
                        aria-label="Odrzuć opcjonalne pliki cookies"
                        className="flex-1 py-3 sm:py-4 px-2 bg-zinc-100/80 text-zinc-400 rounded-[1rem] sm:rounded-[1.2rem] font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-zinc-200 hover:text-red-500 transition-all flex items-center justify-center gap-1.5 md:gap-2 pointer-events-auto"
                      >
                        <X size={14} strokeWidth={3} className="shrink-0" aria-hidden="true" /> Odrzuć zbędne
                      </button>

                      <Link 
                        href="/polityka-prywatnosci"
                        onClick={() => trackCookieEvent('polityka_prywatnosci_klikniecie')}
                        aria-label="Dowiedz się więcej o naszej polityce prywatności i plikach cookies"
                        className="flex-1 py-3 sm:py-4 px-2 bg-zinc-100/80 text-zinc-400 rounded-[1rem] sm:rounded-[1.2rem] font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-zinc-200 hover:text-blue-600 transition-all flex items-center justify-center gap-1.5 md:gap-2 pointer-events-auto"
                      >
                        <Info size={14} strokeWidth={3} className="shrink-0" aria-hidden="true" /> Co to za ciastka?
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.9) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-zoom-in {
          animation: zoomIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .modal-animation-responsive {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @media (min-width: 640px) {
          .modal-animation-responsive {
            animation: zoomIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float-slow {
          animation: floatSlow 4s ease-in-out infinite;
        }
      `}} />
    </>
  )
}