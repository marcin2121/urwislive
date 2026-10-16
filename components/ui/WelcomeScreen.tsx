'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Gift, Sparkles, UserPlus, Smartphone, ArrowRight } from "lucide-react";
import { createClient } from '@/lib/supabase/client';
import { usePopupControl } from '@/components/PopupProvider';

// Pomocnicza funkcja do VAPID
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
};

// Krótki samouczek (dawny OnboardingTour) - pokazywany tylko w PWA, przed prośbą o powiadomienia
const TIPS = [
  { icon: UserPlus, title: 'Klub Urwisa', desc: 'Zaloguj się, aby odblokować kupony i promocje niedostępne dla gości sklepu!' },
  { icon: Gift, title: 'Twoje zniżki', desc: 'W zakładce Rabaty zakręć kołem fortuny i odbierz swój kupon.' },
  { icon: Smartphone, title: 'Tylko przy kasie!', desc: 'Kupon po aktywacji znika po 5 minutach. Włącz go dopiero przy kasie.' },
];

export default function WelcomeScreen() {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const supabase = createClient();
  const { currentPopup, nextPopup } = usePopupControl();

  useEffect(() => {
    setMounted(true);
    
    if (currentPopup === 'WELCOME') {
      // Sprawdzamy czy to PWA (Standalone)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;

      const hasSeenWelcome = localStorage.getItem('urwis_welcome_seen');

      if (isStandalone && !hasSeenWelcome) {
        setIsVisible(true);
      } else {
        // Pominięcie ekranu jeśli nie jesteśmy aplikacją samodzielną lub już go widzieliśmy
        nextPopup();
      }
    }
  }, [currentPopup, nextPopup]);

  const closeScreen = useCallback((actionType: 'accepted' | 'skipped') => {
    localStorage.setItem('urwis_welcome_seen', 'true');
    setIsVisible(false);
    nextPopup(); // ✅ Zwolnienie logiki dla kolejnego komponentu w kolejce

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ekran_powitalny_zamkniecie', {
        event_category: 'PWA',
        event_label: actionType,
      });
    }
  }, [nextPopup]);

  const handleSubscribeAndEnter = async () => {
    setIsProcessing(true);
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'push_zapis_klikniecie', {
        event_category: 'PWA',
        event_label: 'Urwis Welcome Screen'
      });
    }

    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        throw new Error('Brak wsparcia dla powiadomień na Twoim urządzeniu.');
      }

      let permission = Notification.permission;
      
      if (permission === 'default') {
        permission = await new Promise((resolve) => {
          try {
            const req = Notification.requestPermission((res) => resolve(res));
            if (req && typeof req.then === 'function') {
              req.then(resolve).catch(() => resolve('denied'));
            }
          } catch (_e) {
            resolve('denied');
          }
        });
      }
      
      if (permission === 'granted') {
        // Timeout 5s — jeśli SW nie stanie się active w ciągu 5s, 
        // nie blokujemy użytkownika. Push zarejestruje się przy następnej wizycie.
        const registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Service Worker nie gotowy — timeout')), 5000)
          )
        ]);
        
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        
        if (!vapidPublicKey) throw new Error("Brak klucza VAPID");

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });

        if (supabase) {
          await supabase.rpc('push_subscribe', {
            p_endpoint: subscription.endpoint,
            p_subscription: JSON.parse(JSON.stringify(subscription)),
            p_topics: ['wszystkie']
          });
        }

        window.dispatchEvent(new Event('push-permission-changed'));

        // Welcome Push bez await, żeby nie spowalniać zamknięcia ekranu
        fetch('/api/push/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription })
        }).catch(err => console.error('Błąd Welcome Push:', err));

        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'push_sukces', {
            event_category: 'PWA'
          });
        }
      } else if (permission === 'denied') {
        alert("Powiadomienia są zablokowane 🔕\nAby otrzymywać kody rabatowe, włącz je w ustawieniach przeglądarki lub systemu.");
      }
    } catch (error) {
      console.error('Błąd subskrypcji:', error);
      const errorMsg = error instanceof Error ? error.message : '';
      // Nie pokazujemy alertu dla timeoutu SW — to nie wina usera
      if (errorMsg && !errorMsg.includes('timeout')) {
        alert(errorMsg || "Nie udało się uruchomić powiadomień. Możesz je włączyć później.");
      }
    } finally {
      // 🚀 ZMIANA KRYTYCZNA: always close
      // Bez względu na to czy try się powiódł, czy złapał błąd, czy powiadomienia są 'denied'
      // zdejmujemy blokadę processing i zamykamy okno, puszczając usera do aplikacji!
      setIsProcessing(false);
      closeScreen('accepted'); 
    }
  };

  if (!mounted) return null;

  return (
    <>
      {isVisible && (
        <div
          className="fixed inset-0 z-[100000] bg-urwis-blue flex flex-col items-center justify-center p-6 text-white overflow-hidden animate-fade-in"
        >
          {/* Tło dekoracyjne */}
          <div className="absolute top-10 left-10 text-white/10 rotate-12 pointer-events-none">
            <Gift size={120} />
          </div>
          <div className="absolute bottom-10 right-10 text-white/10 -rotate-12 pointer-events-none">
            <Sparkles size={120} />
          </div>

          {step < TIPS.length ? (() => {
            const Tip = TIPS[step];
            return (
              <div key={step} className="relative z-10 flex flex-col items-center text-center max-w-sm px-6 animate-zoom-in">
                <div className="flex gap-2 justify-center mb-8">
                  {[...TIPS, null].map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-white' : 'w-4 bg-white/30'}`} />
                  ))}
                </div>
                <div className="w-28 h-28 rounded-full bg-white/15 flex items-center justify-center mb-6">
                  <Tip.icon size={52} />
                </div>
                <h2 className="text-3xl font-black mb-3 tracking-tight uppercase italic">{Tip.title}</h2>
                <p className="text-blue-50 mb-10 font-bold leading-relaxed">{Tip.desc}</p>
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="w-full bg-white text-urwis-blue font-black text-xl py-5 rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2 uppercase italic"
                >
                  Dalej <ArrowRight size={22} />
                </button>
                <button
                  onClick={() => setStep(TIPS.length)}
                  className="mt-3 text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] p-2 hover:text-white transition-colors cursor-pointer"
                >
                  Pomiń wskazówki
                </button>
              </div>
            );
          })() : (
          <div
            className="relative z-10 flex flex-col items-center text-center max-w-sm px-6 animate-zoom-in"
            style={{ animationFillMode: 'both' }}
          >
            <div className="w-80 h-80 relative mb-4 drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              <Image 
                src="/urwis-proszący.webp" 
                alt="Maskotka Urwis zapraszająca do powiadomień"
                fill
                className="object-contain"
              />
            </div>
            
            <h2 className="text-3xl font-black mb-3 tracking-tight uppercase italic">
              Przyda Ci się pomocnik?
            </h2>
            
            <p className="text-blue-50 mb-8 font-bold uppercase text-[11px] tracking-widest leading-relaxed">
              Będę pilnować dla Ciebie promocji i <strong>nowych zestawów LEGO</strong>, 
              żeby nikt nie sprzątnął Ci ich sprzed nosa! Obiecuję nie rozrabiać zbyt często.
            </p>

            <div className="w-full space-y-3">
              <button
                onClick={handleSubscribeAndEnter}
                disabled={isProcessing}
                aria-label="Zaakceptuj powiadomienia i wejdź do aplikacji"
                className="w-full bg-white text-urwis-blue font-black text-xl py-5 rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center uppercase italic"
              >
                {isProcessing ? "Szykuję wszystko..." : "Dobra Urwis, pilnuj! 🚀"}
              </button>

              <button
                onClick={() => closeScreen('skipped')}
                disabled={isProcessing}
                aria-label="Pomiń włączanie powiadomień"
                className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] p-2 hover:text-white transition-colors cursor-pointer"
              >
                Może innym razem, koleżko.
              </button>
            </div>
          </div>
          )}
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-zoom-in {
          animation: zoomIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </>
  );
}