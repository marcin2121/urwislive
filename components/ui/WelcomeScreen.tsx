'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellRing, Gift, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Pomocnicza funkcja do VAPID
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
};

export default function WelcomeScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    
    // 1. Sprawdzamy czy to PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;

    // 2. 🚀 TUTAJ DODAŁEM BLOKADĘ: Jeśli to nie jest PWA, kończymy i nie pokazujemy ekranu
    if (!isStandalone) return;

    const hasSeenWelcome = localStorage.getItem('urwis_welcome_seen');
    
    // 3. Jeśli to PWA i użytkownik jeszcze go nie widział, pokazujemy
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!mounted) return null;

  const closeScreen = (actionType: 'accepted' | 'skipped') => {
    localStorage.setItem('urwis_welcome_seen', 'true');
    setIsVisible(false);

    // 📊 GTAG: Śledzimy zamknięcie/pominiecie
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'welcome_screen_close', {
        event_category: 'PWA',
        event_label: actionType,
      });
    }
  };

  const handleSubscribeAndEnter = async () => {
    setIsProcessing(true);
    
    // 📊 GTAG: Kliknięcie przycisku akceptacji
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'push_subscribe_click', {
        event_category: 'PWA',
        event_label: 'Urwis Welcome Screen'
      });
    }

    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        throw new Error('Brak wsparcia');
      }

      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        
        if (!vapidPublicKey) throw new Error("Brak klucza VAPID");

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });

        // 1. Zapis do Supabase
        await supabase
          .from('push_subscriptions')
          .upsert({ 
            endpoint: subscription.endpoint,
            subscription_data: JSON.parse(JSON.stringify(subscription)),
            topics: ['wszystkie']
          }, { onConflict: 'endpoint' });

        // 2. 🚀 WYŚLIJ SYGNAŁ DO NAVBARA (by dzwonek od razu ożył)
        window.dispatchEvent(new Event('push-permission-changed'));

        // 3. 🚀 WYŚLIJ WELCOME PUSH (przez Twoje API)
        fetch('/api/push/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription })
        }).catch(err => console.error('Błąd Welcome Push:', err));

        // 📊 GTAG: Sukces subskrypcji
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'push_subscription_success', {
            event_category: 'PWA'
          });
        }
      }
    } catch (error) {
      console.error('Błąd:', error);
    } finally {
      closeScreen('accepted');
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          className="fixed inset-0 z-[99999] bg-blue-600 flex flex-col items-center justify-center p-6 text-white overflow-hidden"
        >
          {/* Tło dekoracyjne */}
          <div className="absolute top-10 left-10 text-white/10 rotate-12"><Gift size={120} /></div>
          <div className="absolute bottom-10 right-10 text-white/10 -rotate-12"><Sparkles size={120} /></div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="relative z-10 flex flex-col items-center text-center max-w-sm px-6"
          >
            {/* Tutaj Twój obrazek Urwisa wygenerowany z promptu */}
            <div className="w-80 h-80 relative mb-4 drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              <img 
                src="/urwis-proszący.webp" 
                alt="Urwis"
                className="w-full h-full object-contain"
                // Dodaj klasę animate-float w globals.css jeśli chcesz efekt pływania
              />
            </div>
            
            <h1 className="text-3xl font-black mb-3 tracking-tight">
              Pst! Przyda Ci się pomocnik?
            </h1>
            
            <p className="text-blue-50 mb-8 font-medium leading-relaxed">
    Będę pilnować dla Ciebie najlepszych promocji i <strong>nowych zestawów LEGO</strong>, żeby nikt nie sprzątnął Ci ich sprzed nosa! Dam Ci znać, kiedy pojawi się coś ekstra – 
  obiecuję nie rozrabiać zbyt często!</p>

            <div className="w-full space-y-3">
              <button
                onClick={handleSubscribeAndEnter}
                disabled={isProcessing}
                className="w-full bg-white text-blue-600 font-black text-xl py-5 rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center"
              >
                {isProcessing ? "Szykuję wszystko..." : "Dobra Urwis, pilnuj! 🚀"}
              </button>

              <button
                onClick={() => closeScreen('skipped')}
                disabled={isProcessing}
                className="text-blue-200 text-sm font-bold p-2 hover:text-white transition-colors"
              >
                Może innym razem, koleżko.
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}