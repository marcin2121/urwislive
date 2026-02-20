'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BellRing, Bell, Download } from 'lucide-react'; // Używamy Bell zamiast Download
import { toast } from 'sonner';

type PushButtonState = 'UNSUPPORTED' | 'INSTALL_PWA' | 'NOT_SUBSCRIBED' | 'SUBSCRIBED';

export default function PushButton() {
  const [buttonState, setButtonState] = useState<PushButtonState>('UNSUPPORTED');

  useEffect(() => {
    const checkStatus = async () => {
      if (typeof window === 'undefined') return;

      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;

      const isPushSupported = 'serviceWorker' in navigator && 'PushManager' in window;

      if (!isPushSupported) {
        setButtonState('UNSUPPORTED');
        return;
      }

      if (!isStandalone) {
        setButtonState('INSTALL_PWA');
        return;
      }

      if (Notification.permission === 'granted') {
        setButtonState('SUBSCRIBED');
      } else {
        setButtonState('NOT_SUBSCRIBED');
      }
    };

    checkStatus();
  }, []);

  const handleAction = async () => {
    switch (buttonState) {
      case 'UNSUPPORTED':
        toast.error('Brak wsparcia', {
          description: 'Twoja przeglądarka nie obsługuje powiadomień Push.',
        });
        break;

      case 'INSTALL_PWA':
        toast.info('Zainstaluj aplikację!', {
          description: 'Aby włączyć powiadomienia, dodaj Sklep Urwis do ekranu głównego (Udostępnij -> Dodaj do ekranu głównego).',
          duration: 6000,
          icon: <Download className="w-4 h-4 text-blue-500" /> // Zostawiamy małą ikonkę pobierania tylko wewnątrz dymka
        });
        break;

      case 'NOT_SUBSCRIBED':
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            setButtonState('SUBSCRIBED');
            toast.success('Powiadomienia włączone!', {
              description: 'Super! Będziemy informować Cię o nowościach.',
            });
          } else {
            toast.error('Brak zgody', {
              description: 'Odrzuciłeś prośbę o powiadomienia. Zmień to w ustawieniach telefonu.',
            });
          }
        } catch (error) {
          console.error("Błąd zapytania o powiadomienia", error);
        }
        break;

      case 'SUBSCRIBED':
        toast.success('Wszystko gra!', {
          description: 'Masz już włączone powiadomienia o promocjach.',
        });
        break;
    }
  };

  const isSubscribed = buttonState === 'SUBSCRIBED';
  const needsPwa = buttonState === 'INSTALL_PWA';
  const canSubscribe = buttonState === 'NOT_SUBSCRIBED';

  let buttonClasses = 'bg-zinc-100/60 hover:bg-zinc-200/80 text-zinc-600 border-white/50';
  let ariaLabel = 'Włącz powiadomienia';

  if (isSubscribed) {
    buttonClasses = 'bg-green-50/80 border-green-200/50 text-green-600 hover:bg-green-100/80';
    ariaLabel = 'Powiadomienia włączone';
  } else if (needsPwa) {
    // Ktoś jest na Safari, chce włączyć powiadomienia, więc przycisk krzyczy: KLIKNIJ MNIE!
    buttonClasses = 'bg-red-50/80 border-red-200/50 text-red-500 hover:bg-red-100/80';
    ariaLabel = 'Zainstaluj aplikację, aby włączyć powiadomienia';
  } else if (canSubscribe) {
    buttonClasses = 'bg-blue-50/80 border-blue-200/50 text-blue-600 hover:bg-blue-100/80';
  }

  return (
    <motion.button
      onClick={handleAction}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative flex items-center justify-center p-2.5 rounded-full transition-colors border shadow-sm ${buttonClasses}`}
      aria-label={ariaLabel}
    >
      {/* Używamy BellRing dla aktywnych, a zwykłego Bell dla nieaktywnych (PWA i bez PWA) */}
      {isSubscribed ? (
        <BellRing className="w-[18px] h-[18px] md:w-5 md:h-5" strokeWidth={2.5} />
      ) : (
        <Bell className="w-[18px] h-[18px] md:w-5 md:h-5" strokeWidth={2.5} />
      )}
      
      {/* Pulsująca kropka TYLKO, gdy można włączyć powiadomienia LUB zainstalować PWA */}
      {(needsPwa || canSubscribe) && (
        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BF2024] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#BF2024] border border-white"></span>
        </span>
      )}
    </motion.button>
  );
}