'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellRing, Bell, Download, Check, Settings2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { PUSH_CATEGORIES } from '@/lib/push-config';

type PushButtonState = 'UNSUPPORTED' | 'INSTALL_PWA' | 'NOT_SUBSCRIBED' | 'SUBSCRIBED';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
};

export default function PushButton() {
  const supabase = createClient();
  const containerRef = useRef<HTMLDivElement>(null); // 🚀 REF DO WYKRYWANIA KLIKNIĘĆ POZA
  const [buttonState, setButtonState] = useState<PushButtonState>('UNSUPPORTED');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['wszystkie']);
  const [isUpdating, setIsUpdating] = useState(false);

  const clearBadge = () => {
    if ('clearAppBadge' in navigator) {
      (navigator as any).clearAppBadge().catch((err: any) => console.error(err));
    }
  };

  const trackPushEvent = (action: string, params: object = {}) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'push_interakcja', {
        event_category: 'PWA_Push',
        interaction_type: action,
        ...params
      });
    }
  };

  const checkStatus = useCallback(async () => {
    if (typeof window === 'undefined') return;
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
        if (sub && supabase) {
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
  }, [supabase]);

  // 🚀 LOGIKA ZAMYKANIA PO KLIKNIĘCIU POZA KONTENEREM
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  useEffect(() => {
    checkStatus();

    const params = new URLSearchParams(window.location.search);
    if (params.get('settings') === 'open') {
      setTimeout(() => {
        setShowSettings(true);
        trackPushEvent('auto_open_from_url');
        window.history.replaceState({}, '', window.location.pathname);
      }, 1000);
    }

    window.addEventListener('push-permission-changed', checkStatus);
    return () => window.removeEventListener('push-permission-changed', checkStatus);
  }, [checkStatus]);

  const toggleTopic = async (id: string) => {
    setIsUpdating(true);
    trackPushEvent('toggle_category_click', { category_id: id });

    const specificTopicIds = PUSH_CATEGORIES
      .filter(c => c.id !== 'wszystkie')
      .map(c => c.id);

    let finalTopics: string[] = [];

    if (id === 'wszystkie') {
      finalTopics = ['wszystkie'];
    } else {
      const currentSpecific = selectedTopics.filter(t => t !== 'wszystkie');
      let nextSpecific = currentSpecific.includes(id)
        ? currentSpecific.filter(t => t !== id)
        : [...currentSpecific, id];

      if (nextSpecific.length === specificTopicIds.length || nextSpecific.length === 0) {
        finalTopics = ['wszystkie'];
      } else {
        finalTopics = nextSpecific;
      }
    }
    
    setSelectedTopics(finalTopics);

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub && supabase) {
        const { error } = await supabase
          .from('push_subscriptions')
          .update({ topics: finalTopics })
          .eq('endpoint', sub.endpoint);
        
        if (error) throw error;
        trackPushEvent('updated_topics_success', { final_topics: finalTopics });
      }
    } catch (e) {
      toast.error("Nie udało się zapisać zmian.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAction = async () => {
    clearBadge();
    trackPushEvent('button_main_click', { current_state: buttonState });

    switch (buttonState) {
      case 'UNSUPPORTED':
        toast.error('Dodaj do ekranu początkowego, aby włączyć powiadomienia.');
        break;
      case 'INSTALL_PWA':
        toast.info('Dodaj do ekranu początkowego, aby włączyć powiadomienia.', {
          icon: <Download className="w-4 h-4 text-blue-500" aria-hidden="true" />
        });
        break;
      case 'NOT_SUBSCRIBED':
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const registration = await navigator.serviceWorker.ready;
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey) throw new Error("Brak klucza VAPID");

            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
            });

            if (supabase) {
              await supabase
                .from('push_subscriptions')
                .upsert({ 
                  endpoint: subscription.endpoint,
                  subscription_data: JSON.parse(JSON.stringify(subscription)),
                  topics: ['wszystkie']
                }, { onConflict: 'endpoint' });
            }

            setButtonState('SUBSCRIBED');
            setShowSettings(true); 
            window.dispatchEvent(new Event('push-permission-changed'));
            toast.success('Urwis melduje się na posterunku!');
          }
        } catch (error) {
          toast.error("Błąd subskrypcji.");
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

  const getAriaLabel = () => {
    if (isSubscribed) return "Otwórz ustawienia powiadomień";
    if (needsPwa) return "Powiadomienia wymagają instalacji PWA";
    return "Włącz powiadomienia o promocjach";
  };

  return (
    <div className="relative" ref={containerRef}>
      <motion.button
        onClick={handleAction}
        aria-label={getAriaLabel()}
        aria-haspopup={isSubscribed ? "menu" : undefined}
        aria-expanded={isSubscribed ? showSettings : undefined}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex items-center justify-center p-2.5 rounded-full transition-all border shadow-sm ${
          isSubscribed ? 'bg-green-50 border-green-200 text-green-600' : 
          needsPwa ? 'bg-zinc-50 border-zinc-200 text-zinc-400' : 
          'bg-blue-50 border-blue-200 text-blue-600'
        }`}
      >
        {isSubscribed ? <BellRing size={20} strokeWidth={2.5} /> : <Bell size={20} strokeWidth={2.5} />}
        {(needsPwa || canSubscribe) && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BF2024] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#BF2024] border-2 border-white"></span>
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="absolute top-full right-0 mt-4 w-64 bg-white/98 backdrop-blur-xl rounded-4xl shadow-2xl border border-zinc-100 p-5 z-[110]"
            role="menu"
            aria-orientation="vertical"
            aria-label="Ustawienia kategorii powiadomień"
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2 text-zinc-400">
                <Settings2 size={14} aria-hidden="true" />
                <span className="text-[10px] font-black uppercase tracking-widest">Twoje powiadomienia</span>
              </div>
              {isUpdating && <Loader2 size={14} className="animate-spin text-blue-500" aria-label="Zapisywanie zmian..." />}
            </div>
            
            <div className="space-y-2">
              {PUSH_CATEGORIES.map((cat) => {
                const isSelected = selectedTopics.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    disabled={isUpdating}
                    onClick={() => toggleTopic(cat.id)}
                    role="menuitemcheckbox"
                    aria-checked={isSelected}
                    aria-label={`Powiadomienia dla kategorii: ${cat.label}`}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                      isSelected 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'
                    }`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-tight">{cat.label}</span>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check size={14} strokeWidth={4} aria-hidden="true" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-[9px] text-zinc-400 font-bold uppercase tracking-tighter text-center italic">
              Zapisujemy automatycznie
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}