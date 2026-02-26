"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { BadgePercent, LockKeyhole, ArrowRight, Timer, Ticket, History, AlertCircle, CheckCircle2 } from "lucide-react";

// Przykładowa baza kuponów (później przeniesiemy to do Supabase)
const MOCK_COUPONS = [
  { id: '1', title: '-5% na klocki LEGO', code: 'LEGO5', gradient: 'from-[#0055ff] to-blue-500', desc: 'Zniżka na wszystkie nieprzecenione zestawy LEGO.' },
  { id: '2', title: '-10% na planszówki', code: 'GRY10', gradient: 'from-amber-400 to-orange-500', desc: 'Idealne na rodzinne wieczory. Ważne na gry i puzzle.' },
  { id: '3', title: 'Darmowy Balon', code: 'BALON', gradient: 'from-pink-500 to-rose-500', desc: 'Darmowy balon na patyku przy zakupach powyżej 50 zł.' }
];

type ActiveCoupon = {
  id: string;
  expiresAt: number; // Timestamp zakończenia (Date.now() + 5 min)
};

type UsedCoupon = {
  id: string;
  usedAt: number; // Timestamp kiedy wygasł
};

export default function RabatyPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Stan UI
  const [activeTab, setActiveTab] = useState<'dostepne' | 'wykorzystane'>('dostepne');
  const [confirmModal, setConfirmModal] = useState<string | null>(null); // Przechowuje ID kuponu do potwierdzenia

  // Stan Danych
  const [activeCoupon, setActiveCoupon] = useState<ActiveCoupon | null>(null);
  const [usedCoupons, setUsedCoupons] = useState<UsedCoupon[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // 1. Ładowanie stanu z LocalStorage po zamontowaniu
  useEffect(() => {
    setMounted(true);
    const savedActive = localStorage.getItem('urwis_active_coupon');
    const savedUsed = localStorage.getItem('urwis_used_coupons');

    if (savedActive) {
      const parsed = JSON.parse(savedActive);
      if (Date.now() < parsed.expiresAt) {
        setActiveCoupon(parsed);
      } else {
        // Jeśli wygasł gdy apka była wyłączona, przenieś do wykorzystanych
        handleExpire(parsed.id, parsed.expiresAt);
      }
    }
    if (savedUsed) {
      setUsedCoupons(JSON.parse(savedUsed));
    }
  }, []);

  // 2. Logika Odliczania (Timer)
  useEffect(() => {
    if (!activeCoupon) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((activeCoupon.expiresAt - now) / 1000));
      
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        handleExpire(activeCoupon.id, activeCoupon.expiresAt);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCoupon]);

  // Funkcja wygaszająca kupon
  const handleExpire = (id: string, timestamp: number) => {
    setActiveCoupon(null);
    localStorage.removeItem('urwis_active_coupon');

    setUsedCoupons(prev => {
      const isAlreadyUsed = prev.some(c => c.id === id);
      if (isAlreadyUsed) return prev;
      const updated = [{ id, usedAt: timestamp }, ...prev];
      localStorage.setItem('urwis_used_coupons', JSON.stringify(updated));
      return updated;
    });
  };

  // Aktywacja kuponu (Start 5 minut)
  const activateCoupon = (id: string) => {
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minut w milisekundach
    const newActive = { id, expiresAt };
    
    setActiveCoupon(newActive);
    localStorage.setItem('urwis_active_coupon', JSON.stringify(newActive));
    setConfirmModal(null);
    
    // Scroll do góry, żeby klient od razu widział kod
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Formatowanie czasu (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!mounted) return null;

  const hasConsent = user?.user_metadata?.marketing_consent === true;
  const availableCouponsList = MOCK_COUPONS.filter(c => !usedCoupons.some(uc => uc.id === c.id) && activeCoupon?.id !== c.id);
  const usedCouponsList = MOCK_COUPONS.filter(c => usedCoupons.some(uc => uc.id === c.id));
  const currentActiveData = MOCK_COUPONS.find(c => c.id === activeCoupon?.id);

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 flex justify-center bg-zinc-50 relative z-30">
      <div className="w-full max-w-2xl space-y-6">
        
        <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-zinc-900 text-center mb-6">
          Kupony Rabatowe
        </h1>

        {!user ? (
          // STAN 1: Niezalogowany
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2rem] shadow-xl border border-zinc-100 text-center">
            <LockKeyhole size={48} className="mx-auto text-zinc-300 mb-4" />
            <h2 className="text-2xl font-black text-zinc-800 mb-2">Zaloguj się, by zobaczyć rabaty</h2>
            <p className="text-zinc-500 mb-6 max-w-md mx-auto">Dostęp do unikalnych kodów rabatowych i promocji mają tylko zarejestrowani członkowie Klubu Urwisa.</p>
          </motion.div>
        ) : !hasConsent ? (
          // STAN 2: Brak Zgody
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2rem] shadow-xl border border-red-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-orange-500" />
            <BadgePercent size={56} className="mx-auto text-red-400 mb-4" />
            <h2 className="text-2xl font-black text-zinc-800 mb-2">Odbierz swoje zniżki!</h2>
            <p className="text-zinc-500 mb-6 max-w-md mx-auto">
              Aby uzyskać dostęp do kuponów rabatowych, musisz wyrazić zgodę na w swoim profilu. Zrób to teraz i oszczędzaj na zakupach!
            </p>
            <Link href="/profil" className="inline-flex items-center gap-2 px-8 py-4 bg-[#0055ff] text-white font-black uppercase text-sm rounded-full shadow-lg hover:scale-105 transition-transform">
              Włącz Rabaty w Profilu <ArrowRight size={18} />
            </Link>
          </motion.div>
        ) : (
          // STAN 3: Główny widok rabatów
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* TABS */}
            <div className="flex bg-white p-1 rounded-2xl border border-zinc-200 shadow-sm">
              <button 
                onClick={() => setActiveTab('dostepne')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${activeTab === 'dostepne' ? 'bg-[#0055ff] text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'}`}
              >
                <Ticket size={16} /> Dostępne
              </button>
              <button 
                onClick={() => setActiveTab('wykorzystane')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${activeTab === 'wykorzystane' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'}`}
              >
                <History size={16} /> Historia
              </button>
            </div>

            {/* ZAKŁADKA: DOSTĘPNE */}
            {activeTab === 'dostepne' && (
              <div className="space-y-4">
                
                {/* AKTYWNY KUPON (ODLICZANIE) */}
                <AnimatePresence>
                  {currentActiveData && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, height: 0 }}
                      animate={{ opacity: 1, scale: 1, height: 'auto' }}
                      exit={{ opacity: 0, scale: 0.95, height: 0 }}
                      className="bg-white border-4 border-[#0055ff] rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 bg-[#0055ff] text-white text-[10px] font-black uppercase tracking-widest text-center py-1">
                        Pokaż ten ekran kasjerce
                      </div>
                      
                      <div className="text-center mt-6 mb-4">
                        <Timer size={40} className={`mx-auto mb-2 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-[#0055ff]'}`} />
                        <div className={`text-5xl font-black font-mono tracking-tighter ${timeLeft < 60 ? 'text-red-500' : 'text-zinc-900'}`}>
                          {formatTime(timeLeft)}
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

                {/* LISTA DOSTĘPNYCH */}
                {availableCouponsList.length === 0 && !activeCoupon && (
                  <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-zinc-200">
                    <Ticket size={40} className="mx-auto text-zinc-300 mb-2" />
                    <p className="text-zinc-500 font-bold">Brak nowych kuponów.</p>
                  </div>
                )}

                {availableCouponsList.map(coupon => (
                  <div key={coupon.id} className={`bg-gradient-to-br ${coupon.gradient} p-6 md:p-8 rounded-[2rem] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${activeCoupon ? 'opacity-50 grayscale pointer-events-none' : 'hover:scale-[1.02]'}`}>
                    <div>
                      <p className="bg-white/20 text-white inline-block px-3 py-1 rounded-full font-bold uppercase tracking-widest text-[10px] mb-2 backdrop-blur-sm border border-white/30">Ważny do odwołania</p>
                      <h3 className="text-2xl md:text-3xl font-black italic uppercase leading-none mb-2">{coupon.title}</h3>
                      <p className="text-white/90 text-sm font-medium">{coupon.desc}</p>
                    </div>
                    <button 
                      onClick={() => setConfirmModal(coupon.id)}
                      disabled={!!activeCoupon}
                      className="w-full md:w-auto bg-white text-zinc-900 px-6 py-4 rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-zinc-50 transition-colors shrink-0"
                    >
                      Zrealizuj Kupon
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ZAKŁADKA: WYKORZYSTANE */}
            {activeTab === 'wykorzystane' && (
              <div className="space-y-4">
                {usedCouponsList.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-zinc-200">
                    <History size={40} className="mx-auto text-zinc-300 mb-2" />
                    <p className="text-zinc-500 font-bold">Nie wykorzystałeś jeszcze żadnego kuponu.</p>
                  </div>
                ) : (
                  usedCouponsList.map(coupon => {
                    const useData = usedCoupons.find(u => u.id === coupon.id);
                    const date = new Date(useData?.usedAt || 0).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div key={coupon.id} className="bg-zinc-100 p-6 rounded-[2rem] text-zinc-500 border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden grayscale">
                        {/* Znak wodny */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-4 border-zinc-300 text-zinc-300 text-4xl font-black uppercase tracking-widest p-2 opacity-50 pointer-events-none">
                          Wygasł
                        </div>
                        
                        <div className="relative z-10 w-full">
                          <h3 className="text-xl font-black italic uppercase line-through decoration-2 mb-1">{coupon.title}</h3>
                          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                            <CheckCircle2 size={14} /> Wykorzystano / Wygasł: {date}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

          </motion.div>
        )}
      </div>

      {/* MODAL POTWIERDZENIA AKTYWACJI */}
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
                Po kliknięciu "Aktywuj" rozpocznie się odliczanie <strong className="text-zinc-800">5 minut</strong>. Pokaż kod sprzedawcy. Po tym czasie kupon przepadnie!
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => activateCoupon(confirmModal)}
                  className="w-full bg-[#0055ff] text-white py-4 rounded-xl font-black uppercase text-sm shadow-lg hover:bg-blue-600 transition-colors"
                >
                  Aktywuj Kupon
                </button>
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="w-full bg-zinc-100 text-zinc-600 py-4 rounded-xl font-black uppercase text-sm hover:bg-zinc-200 transition-colors"
                >
                  Anuluj
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}