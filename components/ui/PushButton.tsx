'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellRing, Bell, Download, Check, Settings2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { PUSH_CATEGORIES } from '@/lib/push-config'; // 🚀 Korzystamy ze wspólnego pliku

type PushButtonState = 'UNSUPPORTED' | 'INSTALL_PWA' | 'NOT_SUBSCRIBED' | 'SUBSCRIBED';

export default function PushButton() {
  const supabase = createClient();
  const [buttonState, setButtonState] = useState<PushButtonState>('UNSUPPORTED');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['wszystkie']);
  const [isUpdating, setIsUpdating] = useState(false);

  // Funkcja czyszcząca powiadomienia (czerwoną kropkę) przy interakcji
  const clearBadge = () => {
    if ('clearAppBadge' in navigator) {
      (navigator as any).clearAppBadge().catch((err: any) => console.error(err));
    }
  };

  const trackPushEvent = (action: string, params: object = {}) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'push_notification_interaction', {
        event_category: 'PWA',
        interaction_type: action,
        ...params
      });
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      if (typeof window === 'undefined') return;

      // Czyścimy kropkę przy każdym wejściu w ustawienia dzwonka
      clearBadge();

      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;
      const isPushSupported = 'serviceWorker' in navigator && 'PushManager' in window;

      if (!isPushSupported) return setButtonState('UNSUPPORTED');
      if (!isStandalone) return setButtonState('INSTALL_PWA');

      if (Notification.permission === 'granted') {
        setButtonState('SUBSCRIBED');
        try {
          const registration = await navigator.serviceWorker.ready;
          const sub = await registration.pushManager.getSubscription();
          if (sub) {
            const { data } = await supabase
              .from('push_subscriptions')
              .select('topics')
              .eq('endpoint', sub.endpoint)
              .single();
            if (data?.topics) setSelectedTopics(data.topics);
          }
        } catch (e) {
          console.error("Błąd pobierania preferencji:", e);
        }
      } else {
        setButtonState('NOT_SUBSCRIBED');
      }
    };

    checkStatus();
  }, [supabase]);

  const toggleTopic = async (id: string) => {
    setIsUpdating(true);
    const newTopics = selectedTopics.includes(id)
      ? selectedTopics.filter(t => t !== id)
      : [...selectedTopics, id];
    
    const finalTopics = newTopics.length === 0 ? ['wszystkie'] : newTopics;
    setSelectedTopics(finalTopics);

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        const { error } = await supabase
          .from('push_subscriptions')
          .update({ topics: finalTopics })
          .eq('endpoint', sub.endpoint);
        
        if (error) throw error;
        trackPushEvent('updated_topics', { topics: finalTopics });
      }
    } catch (e) {
      toast.error("Nie udało się zapisać zmian.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAction = async () => {
    clearBadge(); // Czyścimy badge przy kliknięciu
    switch (buttonState) {
      case 'UNSUPPORTED':
        toast.error('Brak wsparcia Push.');
        break;
      case 'INSTALL_PWA':
        toast.info('Zainstaluj aplikację!', {
          icon: <Download className="w-4 h-4 text-blue-500" />
        });
        break;
      case 'NOT_SUBSCRIBED':
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setButtonState('SUBSCRIBED');
          setShowSettings(true); 
          toast.success('Powiadomienia włączone!');
        }
        break;
      case 'SUBSCRIBED':
        setShowSettings(!showSettings);
        break;
    }
  };

  const isSubscribed = buttonState === 'SUBSCRIBED';
  const needsPwa = buttonState === 'INSTALL_PWA';
  const canSubscribe = buttonState === 'NOT_SUBSCRIBED';

  return (
    <div className="relative">
      <motion.button
        onClick={handleAction}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex items-center justify-center p-2.5 rounded-full transition-colors border shadow-sm ${
          isSubscribed ? 'bg-green-50/80 border-green-200/50 text-green-600' : 
          needsPwa ? 'bg-red-50/80 border-red-200/50 text-red-500' : 
          'bg-blue-50/80 border-blue-200/50 text-blue-600'
        }`}
      >
        {isSubscribed ? <BellRing size={20} strokeWidth={2.5} /> : <Bell size={20} strokeWidth={2.5} />}
        {(needsPwa || canSubscribe) && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BF2024] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#BF2024] border border-white"></span>
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-4 w-64 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/60 p-5 z-[100]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Settings2 size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Twoje wybory</span>
              </div>
              {isUpdating && <Loader2 size={14} className="animate-spin text-blue-500" />}
            </div>
            
            <div className="space-y-2">
              {/* 🚀 TERAZ UŻYWAMY PUSH_CATEGORIES Z PLIKU KONFIGURACYJNEGO */}
              {PUSH_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  disabled={isUpdating}
                  onClick={() => toggleTopic(cat.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    selectedTopics.includes(cat.id) 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100'
                  }`}
                >
                  <span className="text-xs font-bold uppercase italic tracking-tighter">{cat.label}</span>
                  {selectedTopics.includes(cat.id) && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check size={14} strokeWidth={3} />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}