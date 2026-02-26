"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { BadgePercent, LockKeyhole, ArrowRight, Timer, Ticket, History, AlertCircle, CheckCircle2, Repeat, Calendar, Flame, ImageIcon, Share, PlusSquare, Smartphone, ArrowDownCircle, TicketPercent } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ActiveCoupon = { id: string; expiresAt: number; };
type UsedCoupon = { id: string; usedAt: number; };

const DAYS_OF_WEEK = [
  { id: 1, label: 'Pn' }, { id: 2, label: 'Wt' }, { id: 3, label: 'Śr' },
  { id: 4, label: 'Cz' }, { id: 5, label: 'Pt' }, { id: 6, label: 'Sob' }, { id: 0, label: 'Nd' }
]

export default function RabatyPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);

  // 🚀 PWA Installation States
  const [isPWA, setIsPWA] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'dostepne' | 'wykorzystane'>('dostepne');
  const [confirmModal, setConfirmModal] = useState<string | null>(null);

  const [dbCoupons, setDbCoupons] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [activeCoupon, setActiveCoupon] = useState<ActiveCoupon | null>(null);
  const [usedCoupons, setUsedCoupons] = useState<UsedCoupon[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // 1. PWA & Device Detection
  useEffect(() => {
    setMounted(true);

    const checkDevice = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const ios = /iphone|ipad|ipod/.test(userAgent);
      // Sprawdza czy aplikacja została uruchomiona w trybie standalone (zainstalowana)
      const standalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && (window.navigator as any).standalone === true);

      setIsMobile(mobile);
      setIsIOS(ios);
      setIsPWA(standalone || !mobile); // Desktopowi przepuszcza (traktuje jak PWA)
    };

    checkDevice();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // 2. Fetch Data
  useEffect(() => {
    // 💡 Pobieramy mimo wszystko, bo oferty i tak chcemy wyświetlić!
    const fetchData = async () => {
      const [kuponyRes, promosRes] = await Promise.all([
        supabase.from('kupony').select('*').eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('promocje').select('*').eq('is_active', true).order('created_at', { ascending: false })
      ]);
      if (kuponyRes.data) setDbCoupons(kuponyRes.data);
      if (promosRes.data) setPromos(promosRes.data);
    };
    if (user) fetchData();

    const savedActive = localStorage.getItem('urwis_active_coupon');
    const savedUsed = localStorage.getItem('urwis_used_coupons');
    if (savedActive) {
      const parsed = JSON.parse(savedActive);
      if (Date.now() < parsed.expiresAt) setActiveCoupon(parsed);
      else handleExpire(parsed.id, parsed.expiresAt);
    }
    if (savedUsed) setUsedCoupons(JSON.parse(savedUsed));
  }, [user, supabase]);

  // 3. Timer Odliczania
  useEffect(() => {
    if (!activeCoupon) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((activeCoupon.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        handleExpire(activeCoupon.id, activeCoupon.expiresAt);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCoupon]);

  const handleExpire = (id: string, timestamp: number) => {
    setActiveCoupon(null);
    localStorage.removeItem('urwis_active_coupon');
    setUsedCoupons(prev => {
      const filtered = prev.filter(c => c.id !== id); 
      const updated = [{ id, usedAt: timestamp }, ...filtered];
      localStorage.setItem('urwis_used_coupons', JSON.stringify(updated));
      return updated;
    });
  };

  const activateCoupon = async (id: string) => {
    const expiresAt = Date.now() + 5 * 60 * 1000;
    const newActive = { id, expiresAt };
    setActiveCoupon(newActive);
    localStorage.setItem('urwis_active_coupon', JSON.stringify(newActive));
    setConfirmModal(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const coupon = dbCoupons.find(c => c.id === id);
    if (coupon) {
      await supabase.from('kupony').update({ current_usage: (coupon.current_usage || 0) + 1 }).eq('id', id);
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const todayIndex = new Date().getDay();
  const isUsedToday = (usedAt: number) => {
    const usedDate = new Date(usedAt);
    const now = new Date();
    return usedDate.getDate() === now.getDate() && usedDate.getMonth() === now.getMonth() && usedDate.getFullYear() === now.getFullYear();
  };

  const getDayNames = (days: number[]) => {
    if (!days || days.length === 0) return 'Codziennie';
    const sorted = [...days].sort();
    return sorted.map(d => DAYS_OF_WEEK.find(dw => dw.id === d)?.label).join(', ');
  }

  const availableCouponsList = dbCoupons.filter(c => {
    if (c.expires_at && new Date(c.expires_at) < new Date()) return false;
    if (c.usage_limit && c.current_usage >= c.usage_limit) return false;
    if (activeCoupon?.id === c.id) return false;

    const useData = usedCoupons.find(uc => uc.id === c.id);
    if (useData) {
      if (!c.is_reusable) return false;
      if (isUsedToday(useData.usedAt)) return false; 
    }
    return true;
  });

  const usedCouponsList = dbCoupons.filter(c => usedCoupons.some(uc => uc.id === c.id));
  const currentActiveData = dbCoupons.find(c => c.id === activeCoupon?.id);
  const hasConsent = user?.user_metadata?.marketing_consent === true;

  if (!mounted) return null;

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 flex justify-center bg-zinc-50 relative z-30">
      <div className="w-full max-w-2xl space-y-12">
        
        {/* --- SEKCJA 1: KUPONY INTERAKTYWNE --- */}
        <section>
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-zinc-900 mb-2 flex items-center justify-center gap-3">
              <TicketPercent className="text-[#0055ff]" size={36} /> Twoje Kupony
            </h1>
            <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest">Aktywuj przy kasie, by obniżyć cenę</p>
          </div>

          {/* 🚀 WDROŻENIE SOFT GATE: Blokujemy tylko Kupony, ale pokazujemy instrukcję */}
          {isMobile && !isPWA ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 md:p-8 rounded-4xl shadow-xl border border-blue-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0055ff] to-blue-400" />
              <div className="w-16 h-16 bg-blue-50 text-[#0055ff] rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Smartphone size={32} />
              </div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 mb-2">
                Odbierz zniżki w Aplikacji
              </h2>
              <p className="text-zinc-500 mb-6 text-sm">
                Specjalne kupony i kody kasowe są dostępne <strong>wyłącznie</strong> po dodaniu Sklepu Urwis do ekranu głównego. Zainstaluj, by oszczędzać!
              </p>

              {isIOS ? (
                <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 text-left space-y-3">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest text-center mb-1">Instrukcja dla iPhone</p>
                  <div className="flex items-center gap-3 text-xs font-bold text-zinc-700">
                    <div className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center shrink-0 text-[#0055ff]"><Share size={14} /></div>
                    <p>1. Dotknij ikony <strong>Udostępnij</strong> w Safari.</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-zinc-700">
                    <div className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center shrink-0 text-zinc-900"><PlusSquare size={14} /></div>
                    <p>2. Wybierz <strong>"Do ekranu początkowego"</strong> z listy.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <button 
                    onClick={handleInstallClick}
                    disabled={!deferredPrompt}
                    className="w-full bg-[#0055ff] text-white py-4 rounded-xl font-black uppercase text-sm shadow-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    <ArrowDownCircle size={18} /> Zainstaluj PWA
                  </button>
                  {!deferredPrompt && (
                    <p className="text-[10px] text-zinc-400 font-bold">
                      Rozwiń 3 kropki w przeglądarce i wybierz "Zainstaluj aplikację".
                    </p>
                  )}
                </div>
              )}
            </motion.div>

          ) : !user ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2rem] shadow-xl border border-zinc-100 text-center">
              <LockKeyhole size={48} className="mx-auto text-zinc-300 mb-4" />
              <h2 className="text-2xl font-black text-zinc-800 mb-2">Zaloguj się, by zobaczyć rabaty</h2>
              <p className="text-zinc-500 mb-6 max-w-md mx-auto">Dostęp do unikalnych kodów rabatowych i promocji mają tylko zarejestrowani członkowie Klubu Urwisa.</p>
            </motion.div>
          ) : !hasConsent ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2rem] shadow-xl border border-red-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-orange-500" />
              <BadgePercent size={56} className="mx-auto text-red-400 mb-4" />
              <h2 className="text-2xl font-black text-zinc-800 mb-2">Odbierz swoje zniżki!</h2>
              <p className="text-zinc-500 mb-6 max-w-md mx-auto">
                Aby uzyskać dostęp do kuponów rabatowych, musisz wyrazić zgodę na oferty w swoim profilu. Zrób to teraz i oszczędzaj na zakupach!
              </p>
              <Link href="/profil" className="inline-flex items-center gap-2 px-8 py-4 bg-[#0055ff] text-white font-black uppercase text-sm rounded-full shadow-lg hover:scale-105 transition-transform">
                Włącz Rabaty w Profilu <ArrowRight size={18} />
              </Link>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              <div className="flex bg-white p-1 rounded-2xl border border-zinc-200 shadow-sm">
                <button onClick={() => setActiveTab('dostepne')} className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${activeTab === 'dostepne' ? 'bg-[#0055ff] text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'}`}>
                  <Ticket size={16} /> Dostępne
                </button>
                <button onClick={() => setActiveTab('wykorzystane')} className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${activeTab === 'wykorzystane' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'}`}>
                  <History size={16} /> Historia
                </button>
              </div>

              {activeTab === 'dostepne' && (
                <div className="space-y-4">
                  <AnimatePresence>
                    {currentActiveData && (
                      <motion.div initial={{ opacity: 0, scale: 0.95, height: 0 }} animate={{ opacity: 1, scale: 1, height: 'auto' }} exit={{ opacity: 0, scale: 0.95, height: 0 }} className="bg-white border-4 border-[#0055ff] rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 bg-[#0055ff] text-white text-[10px] font-black uppercase tracking-widest text-center py-1">
                          Pokaż ten ekran kasjerce
                        </div>
                        <div className="text-center mt-6 mb-4">
                          <Timer size={40} className={`mx-auto mb-2 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-[#0055ff]'}`} />
                          <div className={`text-5xl font-black font-mono tracking-tighter ${timeLeft < 60 ? 'text-red-500' : 'text-zinc-900'}`}>
                            {`${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`}
                          </div>
                          <p className="text-xs font-bold text-zinc-400 uppercase mt-1">Czas do wygaśnięcia</p>
                        </div>
                        <div className={`bg-gradient-to-br ${currentActiveData.gradient} p-6 rounded-3xl text-white text-center shadow-inner`}>
                           <h3 className="text-2xl font-black italic uppercase mb-4">{currentActiveData.title}</h3>
                           <div className="bg-white text-zinc-900 py-3 px-6 rounded-2xl inline-block border-2 border-white/20 shadow-lg">
                             <span className="block text-[10px] uppercase font-black text-zinc-400 mb-1">Twój Kod:</span>
                             <span className="text-3xl font-black tracking-widest">{currentActiveData.code}</span>
                           </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {availableCouponsList.length === 0 && !activeCoupon && (
                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-zinc-200">
                      <Ticket size={40} className="mx-auto text-zinc-300 mb-2" />
                      <p className="text-zinc-500 font-bold">Brak dostępnych kuponów na dziś.</p>
                    </div>
                  )}

                  {availableCouponsList.map(coupon => {
                    let allowedDays: number[] = [];
                    try { allowedDays = Array.isArray(coupon.allowed_days) ? coupon.allowed_days : JSON.parse(coupon.allowed_days || '[]'); } catch (e) {}
                    const isCorrectDay = allowedDays.length === 0 || allowedDays.includes(todayIndex);

                    return (
                      <div key={coupon.id} className={`bg-gradient-to-br ${coupon.gradient} p-6 md:p-8 rounded-[2rem] text-white shadow-xl flex flex-col md:flex-row items-start justify-between gap-6 transition-all ${activeCoupon ? 'opacity-50 grayscale pointer-events-none' : 'hover:scale-[1.02]'}`}>
                        <div className="w-full">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {coupon.is_reusable && <span className="bg-white/20 text-white flex items-center gap-1 px-3 py-1 rounded-full font-black uppercase tracking-widest text-[8px] backdrop-blur-sm border border-white/30"><Repeat size={10}/> Odnawialny</span>}
                            {allowedDays.length > 0 && <span className="bg-white/20 text-white flex items-center gap-1 px-3 py-1 rounded-full font-black uppercase tracking-widest text-[8px] backdrop-blur-sm border border-white/30"><Calendar size={10}/> {getDayNames(allowedDays)}</span>}
                            {coupon.usage_limit && <span className="bg-white/20 text-white flex items-center gap-1 px-3 py-1 rounded-full font-black uppercase tracking-widest text-[8px] backdrop-blur-sm border border-white/30">Zostało: {coupon.usage_limit - (coupon.current_usage || 0)} szt.</span>}
                          </div>
                          <h3 className="text-2xl md:text-3xl font-black italic uppercase leading-none mb-2">{coupon.title}</h3>
                          <p className="text-white/90 text-sm font-medium">{coupon.description}</p>
                        </div>
                        
                        <button 
                          onClick={() => setConfirmModal(coupon.id)}
                          disabled={!!activeCoupon || !isCorrectDay}
                          className={`w-full md:w-auto px-6 py-4 rounded-2xl font-black uppercase text-xs shadow-lg transition-colors shrink-0 whitespace-nowrap mt-2 md:mt-0 ${
                            isCorrectDay 
                            ? 'bg-white text-zinc-900 hover:bg-zinc-50' 
                            : 'bg-black/20 text-white/50 cursor-not-allowed border border-white/10'
                          }`}
                        >
                          {isCorrectDay ? 'Zrealizuj Kupon' : `Dostępny w: ${getDayNames(allowedDays)}`}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {activeTab === 'wykorzystane' && (
                <div className="space-y-4">
                  {usedCouponsList.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-zinc-200">
                      <History size={40} className="mx-auto text-zinc-300 mb-2" />
                      <p className="text-zinc-500 font-bold">Nie masz jeszcze wykorzystanych kuponów.</p>
                    </div>
                  ) : (
                    usedCouponsList.map(coupon => {
                      const useData = usedCoupons.find(u => u.id === coupon.id);
                      const date = new Date(useData?.usedAt || 0).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                      
                      return (
                        <div key={coupon.id} className="bg-zinc-100 p-6 rounded-[2rem] text-zinc-500 border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden grayscale">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-4 border-zinc-300 text-zinc-300 text-3xl font-black uppercase tracking-widest p-2 opacity-50 pointer-events-none">
                            Wygasł
                          </div>
                          <div className="relative z-10 w-full">
                            <h3 className="text-xl font-black italic uppercase line-through decoration-2 mb-1">{coupon.title}</h3>
                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                              <CheckCircle2 size={14} /> Wykorzystano: {date}
                            </div>
                            {coupon.is_reusable && (
                              <p className="text-[10px] uppercase font-black tracking-widest mt-2 text-blue-500">Wróci następnego dozwolonego dnia!</p>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </motion.div>
          )}
        </section>

        {/* --- SEKCJA 2: PROMOCJE (TABLICA OFERT) --- */}
        {promos.length > 0 && (
          <section className="pt-8 border-t-2 border-dashed border-zinc-200">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-zinc-900 mb-2 flex items-center justify-center gap-2">
                <Flame className="text-[#BF2024]" size={28} /> Tablica Okazji
              </h2>
              <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest">Zobacz, co u nas słychać!</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {promos.map(promo => (
                <div key={promo.id} className="bg-white rounded-3xl border border-zinc-100 shadow-lg overflow-hidden flex flex-col group relative">
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start">
                    <span className="bg-white/90 backdrop-blur-md text-zinc-800 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl shadow-sm">
                      {promo.category}
                    </span>
                  </div>
                  {promo.discount && (
                    <div className="absolute top-4 right-4 z-10 bg-red-500 text-white font-black italic text-lg px-3 py-1 rounded-xl shadow-lg transform rotate-3 shadow-red-500/30">
                      {promo.discount}
                    </div>
                  )}

                  {promo.image_url ? (
                    <div className="relative w-full h-48 md:h-56 bg-zinc-50 overflow-hidden">
                      <Image src={promo.image_url} alt={promo.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-zinc-100 flex items-center justify-center text-zinc-300">
                      <ImageIcon size={40} />
                    </div>
                  )}

                  <div className="p-5 md:p-6 flex flex-col flex-1 justify-between bg-white relative z-10">
                    <h3 className="text-lg md:text-xl font-black uppercase italic text-zinc-900 leading-[1.1] mb-4">
                      {promo.title}
                    </h3>
                    <div className="flex items-baseline justify-between pt-4 border-t border-zinc-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Cena po rabacie</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-[#BF2024]">{promo.new_price} zł</span>
                          {promo.old_price && (
                            <span className="text-sm font-bold text-zinc-400 line-through">{promo.old_price} zł</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* MODAL POTWIERDZENIA KUPONU */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black uppercase italic mb-2">Czy stoisz przy kasie?</h3>
              <p className="text-zinc-500 text-sm mb-6">
                Po kliknięciu "Aktywuj" kod będzie widoczny tylko przez <strong className="text-zinc-800">5 minut</strong>. Pokaż go kasjerce. Po tym czasie kupon wygasa!
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={() => activateCoupon(confirmModal)} className="w-full bg-[#0055ff] text-white py-4 rounded-xl font-black uppercase text-sm shadow-lg hover:bg-blue-600 transition-colors">
                  Aktywuj Kupon Teraz
                </button>
                <button onClick={() => setConfirmModal(null)} className="w-full bg-zinc-100 text-zinc-600 py-4 rounded-xl font-black uppercase text-sm hover:bg-zinc-200 transition-colors">
                  Anuluj (Użyję później)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}