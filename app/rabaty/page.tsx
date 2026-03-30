"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { 
  BadgePercent, LockKeyhole, ArrowRight, Timer, Ticket, History, 
  AlertCircle, CheckCircle2, Repeat, Calendar, Flame, ImageIcon, 
  Share, PlusSquare, Smartphone, ArrowDownCircle, TicketPercent,
  CircleDashed, PartyPopper, Clock, Bell, X, ArrowLeft
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { spinWheel } from "@/app/actions/spin-wheel";
import { toast } from "sonner";
import NextSpinTimer from "@/components/rabaty/NextSpinTimer";
import ActiveCouponOverlay from "@/components/rabaty/ActiveCouponOverlay";

type ActiveCoupon = { id: string; expiresAt: number; created_at?: string; user_id?: string; };
type UsedCoupon = { id: string; usedAt: number; };

const DAYS_OF_WEEK = [
  { id: 1, label: 'Pn' }, { id: 2, label: 'Wt' }, { id: 3, label: 'Śr' },
  { id: 4, label: 'Cz' }, { id: 5, label: 'Pt' }, { id: 6, label: 'Sob' }, { id: 0, label: 'Nd' }
]

const WHEEL_COLORS = ['#0055ff', '#BF2024', '#FACC15', '#22C55E', '#A855F7', '#F97316', '#EC4899', '#06B6D4'];

export default function RabatyPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- PWA States ---
  const [isPWA, setIsPWA] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // --- UI States ---
  const [activeTab, setActiveTab] = useState<'dostepne' | 'wykorzystane'>('dostepne');
  const [confirmModal, setConfirmModal] = useState<string | null>(null);

  // --- Data States ---
  const [dbCoupons, setDbCoupons] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [wheelPrizes, setWheelPrizes] = useState<any[]>([]);
  const [activeCoupon, setActiveCoupon] = useState<ActiveCoupon | null>(null);
  const [usedCoupons, setUsedCoupons] = useState<UsedCoupon[]>([]);

  // --- Wheel Of Fortune States ---
  const [canSpin, setCanSpin] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const wheelCurrentAngle = useRef(0); 
  const [wheelRotation, setWheelRotation] = useState(0);
  
  const [spinResult, setSpinResult] = useState<any>(null);
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [showCouponFullModal, setShowCouponFullModal] = useState(false);
  const MAX_COUPON_INVENTORY = 6;
  const [showActiveOverlay, setShowActiveOverlay] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkDevice = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const ios = /iphone|ipad|ipod/.test(userAgent);
      const standalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && (window.navigator as any).standalone === true);
      setIsMobile(mobile);
      setIsIOS(ios);
      setIsPWA(standalone || !mobile);
    };
    checkDevice();
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const fetchData = useCallback(async () => {
    if (!supabase || !user) {
      setIsLoading(false);
      return;
    }
    
    try {
      const [kuponyRes, promosRes, wheelRes] = await Promise.all([
        supabase.from('kupony').select('*').eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('promocje').select('*').eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('wheel_prizes').select('*').eq('is_active', true)
      ]);
      
      if (kuponyRes.data) setDbCoupons(kuponyRes.data);
      if (promosRes.data) setPromos(promosRes.data);
      if (wheelRes.data) setWheelPrizes(wheelRes.data);
      
      if (kuponyRes.data) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const hasSpunToday = kuponyRes.data.some((k: any) => 
          k.user_id === user.id && new Date(k.created_at) >= todayStart
        );
        setCanSpin(!hasSpunToday);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchData();
    const savedActive = localStorage.getItem('urwis_active_coupon');
    const savedUsed = localStorage.getItem('urwis_used_coupons');
    if (savedActive) {
      const parsed = JSON.parse(savedActive);
      if (Date.now() < parsed.expiresAt) setActiveCoupon(parsed);
      else handleExpire(parsed.id, parsed.expiresAt);
    }
    if (savedUsed) setUsedCoupons(JSON.parse(savedUsed));
  }, [fetchData]);

  // Timer logic moved to ActiveCouponOverlay and NextSpinTimer components

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
    setShowActiveOverlay(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const coupon = dbCoupons.find(c => c.id === id);
    if (coupon && supabase) {
      await supabase.from('kupony').update({ current_usage: (coupon.current_usage || 0) + 1 }).eq('id', id);
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
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

  // ✅ LOGIKA: Liczymy wyłącznie kupony przypisane do danego użytkownika (Wylosowane z koła)
  const wheelCouponsCount = availableCouponsList.filter(c => c.user_id !== null).length;

  const handleSpinWheel = async () => {
    if (isMobile && !isPWA) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.info('Zainstaluj bezpłatną aplikację na pulpicie, aby zakręcić kołem!');
      return;
    }

    if (!canSpin || isSpinning) return;
    
    // Blokada w oparciu o TYLKO kupony z koła
    if (wheelCouponsCount >= MAX_COUPON_INVENTORY) {
      setShowCouponFullModal(true);
      return;
    }

    setCanSpin(false); 
    setIsSpinning(true);

    const result = await spinWheel();
    
    if (result.error || !result.prize) {
      toast.error(result.error || 'Wystąpił błąd losowania. Spróbuj za chwilę.');
      setIsSpinning(false);
      fetchData(); 
      return;
    }

    const winningPrize = result.prize;
    const prizeIndex = wheelPrizes.findIndex(p => p.id === winningPrize.id);
    
    const sliceAngle = 360 / wheelPrizes.length;
    const targetAngle = 360 - (prizeIndex * sliceAngle) - (sliceAngle / 2);
    const spins = 5 * 360; 
    
    const newAbsoluteRotation = wheelCurrentAngle.current + spins + targetAngle - (wheelCurrentAngle.current % 360);
    
    wheelCurrentAngle.current = newAbsoluteRotation;
    setWheelRotation(newAbsoluteRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSpinResult(winningPrize);
      setShowPrizeModal(true);
      fetchData(); 
    }, 5500);
  };

  const usedCouponsList = dbCoupons.filter(c => usedCoupons.some(uc => uc.id === c.id));
  const currentActiveData = dbCoupons.find(c => c.id === activeCoupon?.id);
  const hasConsent = user?.user_metadata?.marketing_consent === true;
  const [showNotifBanner, setShowNotifBanner] = useState(true);

  const filteredWheelPrizes = wheelPrizes.filter(prize => 
    !availableCouponsList.some(coupon => coupon.title === prize.title)
  );
  
  const displayPrizes = filteredWheelPrizes.length > 0 ? filteredWheelPrizes : [{ id: 'empty', title: '"Ojej! Zdobyłeś już wszystkie dostępne zniżki! 🦖 Zużyj coś przy kasie, żeby zrobić mi trochę miejsca!"' }];

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen pt-28 pb-12 px-4 flex justify-center bg-zinc-50 relative z-30">
        <div className="w-full max-w-2xl animate-pulse space-y-12">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-zinc-100 flex flex-col items-center justify-center min-h-[500px] md:min-h-[550px]">
            <div className="h-8 bg-zinc-200/80 rounded-full w-2/3 md:w-1/2 mb-2" />
            <div className="h-4 bg-zinc-200/50 rounded-full w-1/3 mb-10" />
            <div className="w-64 h-64 md:w-80 md:h-80 bg-zinc-200/60 rounded-full mb-8" />
            <div className="h-14 w-full md:w-64 bg-zinc-200/80 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <div className="h-10 bg-zinc-200/80 rounded-full w-2/3 md:w-1/2 mx-auto" />
              <div className="h-4 bg-zinc-200/50 rounded-full w-1/3 mx-auto" />
            </div>
            <div className="h-12 bg-white rounded-2xl w-full border border-zinc-200 shadow-sm" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-start justify-between gap-6 shadow-xl border border-zinc-100">
                  <div className="w-full space-y-3">
                    <div className="flex gap-2 mb-3">
                       <div className="h-5 w-20 bg-zinc-200/60 rounded-full" />
                       <div className="h-5 w-24 bg-zinc-200/60 rounded-full" />
                    </div>
                    <div className="h-8 bg-zinc-200/80 rounded-lg w-3/4" />
                    <div className="h-4 bg-zinc-200/50 rounded-lg w-1/2" />
                  </div>
                  <div className="h-12 w-full md:w-36 bg-zinc-200/80 rounded-2xl shrink-0 mt-2 md:mt-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 flex justify-center bg-zinc-50 relative z-30">
      <div className="w-full max-w-2xl space-y-12">
        <div className="flex justify-start mb-4 -mt-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-50 text-zinc-600 hover:text-[#BF2024] shadow-sm rounded-full transition-all font-black uppercase tracking-widest text-xs border border-zinc-200 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Wróć do bazy
          </Link>
        </div>

        {isMobile && !isPWA && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 md:p-8 rounded-4xl shadow-xl border border-blue-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0055ff] to-blue-400" />
            <div className="w-16 h-16 bg-blue-50 text-[#0055ff] rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Smartphone size={32} />
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 mb-2">
              Odbierz zniżki w Aplikacji
            </h2>
            <p className="text-zinc-500 mb-6 text-sm">
              Codzienne losowanie Koła Fortuny i kupony rabatowe są dostępne <strong>wyłącznie</strong> po dodaniu Sklepu Urwis do ekranu głównego telefonu!
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
        )}

        {user && wheelPrizes.length > 0 && (!isMobile || isPWA) && (
          <section className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-zinc-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
            
            <div className="text-center mb-6 mt-2">
              <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-amber-500 flex items-center justify-center gap-2">
                <CircleDashed size={28} /> Koło Fortuny
              </h2>
              <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest mt-1">
                {canSpin ? 'Codziennie jeden darmowy obrót!' : 'Wróć jutro po kolejną szansę!'}
              </p>
            </div>

            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto my-8">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 text-[#BF2024] drop-shadow-lg">
                 <svg width="46" height="46" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                   <path d="M12 21L22 9H2L12 21Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                 </svg>
              </div>

              <AnimatePresence>
                {!canSpin && !isSpinning && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 bg-white/70 backdrop-blur-md rounded-full flex flex-col items-center justify-center border-4 border-white shadow-inner"
                  >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-zinc-400 mb-2">
                      <LockKeyhole size={24} />
                    </div>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Nowe losowanie za</span>
                    <NextSpinTimer onReady={() => { setCanSpin(true); fetchData(); }} />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className={`w-full h-full rounded-full border-[6px] border-zinc-900 overflow-hidden shadow-inner relative ${filteredWheelPrizes.length === 0 ? 'grayscale opacity-70' : ''}`}
                animate={{ rotate: wheelRotation }}
                transition={{ duration: 5, ease: [0.15, 0.9, 0.2, 1] }}
                style={{ 
                   background: `conic-gradient(${displayPrizes.map((p, i) => {
                     const start = i * (360 / displayPrizes.length);
                     const end = (i + 1) * (360 / displayPrizes.length);
                     return `${filteredWheelPrizes.length === 0 ? '#d4d4d8' : WHEEL_COLORS[i % WHEEL_COLORS.length]} ${start}deg ${end}deg`;
                   }).join(', ')})`
                }}
              >
                {displayPrizes.map((p, i) => {
                   const sliceAngle = 360 / displayPrizes.length;
                   const rotation = (i * sliceAngle) + (sliceAngle / 2);
                   return (
                     <div
                       key={p.id}
                       className="absolute w-[50%] h-12 top-1/2 left-1/2 origin-left flex items-center pl-12 md:pl-16 pr-2"
                       style={{ transform: `translate(0, -50%) rotate(${rotation - 90}deg)` }}
                     >
                       <span className="text-white font-black text-[9px] md:text-xs text-left leading-tight drop-shadow-md z-10 w-full uppercase line-clamp-2">
                         {p.title}
                       </span>
                     </div>
                   )
                })}
              </motion.div>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full border-4 border-zinc-900 z-20 shadow-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-amber-500 rounded-full animate-pulse" />
              </div>
            </div>

              <div className="text-center">
              
                {/* Zmiana logiki: Blokujemy tylko, gdy ma >= 6 kuponów WYLOSOWANYCH */}
                {wheelCouponsCount >= MAX_COUPON_INVENTORY && canSpin && (
                  <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-3 text-left">
                    <span className="text-2xl shrink-0">🦖</span>
                    <p className="text-xs font-bold text-amber-800">
                      Masz już {wheelCouponsCount} kuponów z koła! Wykorzystaj je w sklepie,<br/>żeby zrobić miejsce na nowe nagrody!
                    </p>
                  </div>
                )}

                <button 
                  onClick={handleSpinWheel}
                  disabled={!canSpin || isSpinning || filteredWheelPrizes.length === 0}
                  className={`px-8 py-4 rounded-2xl font-black uppercase text-sm shadow-xl transition-all w-full md:w-auto ${
                    canSpin && !isSpinning && filteredWheelPrizes.length > 0
                    ? wheelCouponsCount >= MAX_COUPON_INVENTORY
                      ? 'bg-amber-100 text-amber-700 border-2 border-amber-300 cursor-not-allowed'
                      : 'bg-amber-500 text-white hover:bg-amber-600 hover:scale-105 active:scale-95 cursor-pointer outline-none' 
                    : 'bg-zinc-100 text-zinc-400 cursor-not-allowed border-2 border-zinc-200 shadow-none'
                  }`}
                >
                  {filteredWheelPrizes.length === 0 ? 'Zrób miejsce na tarczy!' : isSpinning ? 'Losowanie w toku...' : !canSpin ? 'Zablokowane do Jutra 🔒' : wheelCouponsCount >= MAX_COUPON_INVENTORY ? 'Ekwipunek pełny! 🦖' : 'ZAKRĘĆ KOŁEM!'}
                </button>
              </div>
          </section>
        )}

        <section>
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-zinc-900 mb-2 flex items-center justify-center gap-3">
              <TicketPercent className="text-[#0055ff]" size={36} /> Twoje Kupony
            </h1>
            <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest">Twoje rabaty i wygrane</p>
          </div>

          {!user ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2rem] shadow-xl border border-zinc-100 text-center">
              <LockKeyhole size={48} className="mx-auto text-zinc-300 mb-4" />
              <h2 className="text-2xl font-black text-zinc-800 mb-2">Zaloguj się, by zobaczyć rabaty</h2>
              <p className="text-zinc-500 mb-6 max-w-md mx-auto">Dostęp do unikalnych kodów rabatowych i promocji mają tylko zarejestrowani członkowie Klubu Urwisa.</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              <div className="flex bg-white p-1 rounded-2xl border border-zinc-200 shadow-sm">
                <button onClick={() => setActiveTab('dostepne')} className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${activeTab === 'dostepne' ? 'bg-[#0055ff] text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50 cursor-pointer outline-none'}`}>
                  <Ticket size={16} /> Dostępne
                </button>
                <button onClick={() => setActiveTab('wykorzystane')} className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${activeTab === 'wykorzystane' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50 cursor-pointer outline-none'}`}>
                  <History size={16} /> Historia
                </button>
              </div>

              {activeTab === 'dostepne' && (
                <div className="space-y-4">

                  {availableCouponsList.length === 0 && !activeCoupon && (
                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-zinc-200">
                      <Ticket size={40} className="mx-auto text-zinc-300 mb-2" />
                      <p className="text-zinc-500 font-bold">Obecnie nie masz dostępnych kuponów.</p>
                      <p className="text-xs text-zinc-400 mt-1">Zajrzyj później lub zakręć kołem!</p>
                    </div>
                  )}

                  {availableCouponsList.map(coupon => {
                    let allowedDays: number[] = [];
                    try { allowedDays = Array.isArray(coupon.allowed_days) ? coupon.allowed_days : JSON.parse(coupon.allowed_days || '[]'); } catch (_e) {}
                    const isCorrectDay = allowedDays.length === 0 || allowedDays.includes(todayIndex);

                    return (
                      <div key={coupon.id} className={`bg-gradient-to-br ${coupon.gradient || 'from-[#0055ff] to-blue-500'} p-6 md:p-8 rounded-[2rem] text-white shadow-xl flex flex-col md:flex-row items-start justify-between gap-6 transition-all ${activeCoupon ? 'opacity-50 grayscale pointer-events-none' : 'hover:scale-[1.02]'}`}>
                        <div className="w-full">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {coupon.is_reusable && <span className="bg-white/20 text-white flex items-center gap-1 px-3 py-1 rounded-full font-black uppercase tracking-widest text-[8px] backdrop-blur-sm border border-white/30"><Repeat size={10}/> Odnawialny</span>}
                            {allowedDays.length > 0 && <span className="bg-white/20 text-white flex items-center gap-1 px-3 py-1 rounded-full font-black uppercase tracking-widest text-[8px] backdrop-blur-sm border border-white/30"><Calendar size={10}/> {getDayNames(allowedDays)}</span>}
                            {coupon.user_id && <span className="bg-amber-400/80 text-white flex items-center gap-1 px-3 py-1 rounded-full font-black uppercase tracking-widest text-[8px] backdrop-blur-sm border border-white/30"><CircleDashed size={10}/> Z Koła</span>}
                            {coupon.usage_limit && !coupon.user_id && <span className="bg-white/20 text-white flex items-center gap-1 px-3 py-1 rounded-full font-black uppercase tracking-widest text-[8px] backdrop-blur-sm border border-white/30">Pula: {coupon.usage_limit - (coupon.current_usage || 0)} szt.</span>}
                          </div>
                          <h3 className="text-2xl md:text-3xl font-black italic uppercase leading-none mb-2">{coupon.title}</h3>
                          <p className="text-white/90 text-sm font-medium">{coupon.description}</p>
                        </div>
                        
                        <button 
                          onClick={() => setConfirmModal(coupon.id)}
                          disabled={!!activeCoupon || !isCorrectDay}
                          className={`w-full md:w-auto px-6 py-4 rounded-2xl font-black uppercase text-xs shadow-lg transition-colors shrink-0 whitespace-nowrap mt-2 md:mt-0 ${
                            isCorrectDay 
                            ? 'bg-white text-zinc-900 hover:bg-zinc-50 cursor-pointer outline-none' 
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

        {user && !hasConsent && showNotifBanner && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[2rem] shadow-lg border border-blue-100 relative overflow-hidden"
          >
            <button 
              onClick={() => setShowNotifBanner(false)} 
              className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 text-[#0055ff] rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                <Bell size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black uppercase text-zinc-800 tracking-tight mb-1">Nie przegap nowych kuponów!</h3>
                <p className="text-xs text-zinc-500 mb-3">Włącz powiadomienia, a wyślemy Ci info kiedy pojawią się nowe promocje i kupony.</p>
                <button 
                  onClick={async () => {
                    const supabaseClient = createClient();
                    if (supabaseClient) {
                      await supabaseClient.auth.updateUser({ data: { marketing_consent: true } });
                    }
                    setShowNotifBanner(false);
                  }}
                  className="px-4 py-2 bg-[#0055ff] text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  🔔 Włącz powiadomienia
                </button>
              </div>
            </div>
          </motion.div>
        )}

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

      <AnimatePresence>
        {showPrizeModal && spinResult && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
              className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-400 to-orange-500" />
              <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <PartyPopper size={40} />
              </div>
              <h3 className="text-sm font-black uppercase text-zinc-400 tracking-widest mb-1">Wygrywasz!</h3>
              <h2 className="text-3xl font-black italic uppercase text-zinc-900 mb-4 leading-tight">{spinResult.title}</h2>
              <p className="text-zinc-500 text-sm mb-8 font-medium">
                Twój indywidualny kupon został dodany do zakładki "Dostępne". Wykorzystaj go przy najbliższych zakupach!
              </p>
              <button onClick={() => setShowPrizeModal(false)} className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black uppercase text-sm shadow-xl hover:bg-amber-600 transition-colors cursor-pointer outline-none">
                Dzięki Urwis!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: Pełny Ekwipunek Kuponów */}
      <AnimatePresence>
        {showCouponFullModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 40 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-400 to-orange-500" />
              <div className="text-6xl mb-4 mt-2">🦖</div>
              <h3 className="text-sm font-black uppercase text-amber-600 tracking-widest mb-1">Ekwipunek pełny!</h3>
              <h2 className="text-2xl font-black italic uppercase text-zinc-900 mb-4 leading-tight">
                Hej Urwisie!<br />Masz już {wheelCouponsCount} kuponów z koła!
              </h2>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left">
                <p className="text-sm font-bold text-amber-900 leading-relaxed">
                  Zanim zakręcisz kołem i zdobędziesz nowe zniżki, wykorzystaj swoje obecne kupony z losowania przy zakupach w sklepie. Zrobimy wtedy miejsce na nowe nagrody! 😄
                </p>
              </div>
              <button
                onClick={() => setShowCouponFullModal(false)}
                className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black uppercase text-sm shadow-xl hover:bg-amber-600 transition-colors cursor-pointer outline-none"
              >
                Dobra, zrozumiałem!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black uppercase italic mb-2">Czy stoisz przy kasie?</h3>
              <p className="text-zinc-500 text-sm mb-6">
                Po kliknięciu "Aktywuj" kod będzie widoczny tylko przez <strong className="text-zinc-800">5 minut</strong>. Pokaż go kasjerce. Po tym czasie kupon wygasa!
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={() => activateCoupon(confirmModal)} className="w-full bg-[#0055ff] text-white py-4 rounded-xl font-black uppercase text-sm shadow-lg hover:bg-blue-600 transition-colors cursor-pointer outline-none">
                  Aktywuj Kupon Teraz
                </button>
                <button onClick={() => setConfirmModal(null)} className="w-full bg-zinc-100 text-zinc-600 py-4 rounded-xl font-black uppercase text-sm hover:bg-zinc-200 transition-colors cursor-pointer outline-none">
                  Anuluj (Użyję później)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeCoupon && (
        <ActiveCouponOverlay
          activeCoupon={activeCoupon}
          currentActiveData={currentActiveData}
          showActiveOverlay={showActiveOverlay}
          setShowActiveOverlay={setShowActiveOverlay}
          onExpire={handleExpire}
        />
      )}
    </div>
  );
}