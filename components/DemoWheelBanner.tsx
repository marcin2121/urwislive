'use client'

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleDashed, PartyPopper, UserPlus, Gift, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation'; // Dodano useRouter
import Link from 'next/link';

// IMPORT MODALA AUTORYZACJI
import AuthModal from '@/components/ui/AuthModal'; 

const WHEEL_COLORS = ['#0055ff', '#BF2024', '#FACC15', '#22C55E', '#A855F7', '#F97316', '#EC4899', '#06B6D4'];

export default function DemoWheelBanner() {
  const supabase = createClient();
  const router = useRouter();
  const [wheelPrizes, setWheelPrizes] = useState<any[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<any>(null);
  
  // Stany logowania / weryfikacji
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Stany modali
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const wheelCurrentAngle = useRef(0);
  const [wheelRotation, setWheelRotation] = useState(0);

  // 1. Sprawdzanie sesji użytkownika
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch (error) {
        console.error("Błąd podczas sprawdzania sesji:", error);
      } finally {
        setIsLoadingSession(false);
      }
    };
    checkSession();
  }, [supabase.auth]);

  // 2. Pobieranie nagród z bazy (demo musi być wiarygodne)
  useEffect(() => {
    const fetchPrizes = async () => {
      const { data } = await supabase.from('wheel_prizes').select('*').eq('is_active', true);
      if (data && data.length > 0) {
        setWheelPrizes(data);
      }
    };
    fetchPrizes();
  }, [supabase]);

  // Blokada scrollowania gdy jest modal
  useEffect(() => {
    if (showPrizeModal || isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPrizeModal, isAuthModalOpen]);

  // Obsługa kliknięcia "Zakręć"
  const handleAction = () => {
    // 🚀 ZMIANA: Jeżeli użytkownik JEST ZALOGOWANY, przekieruj go do /rabaty
    if (isLoggedIn) {
      router.push('/rabaty');
      return;
    }

    // W przeciwnym razie odpal demo
    if (isSpinning || wheelPrizes.length === 0) return;
    setIsSpinning(true);

    // Symulacja losowania
    const totalWeight = wheelPrizes.reduce((sum, p) => sum + Number(p.chance), 0);
    let randomNum = Math.random() * totalWeight;
    let winningPrize = wheelPrizes[0];

    for (const prize of wheelPrizes) {
      if (randomNum < Number(prize.chance)) {
        winningPrize = prize;
        break;
      }
      randomNum -= Number(prize.chance);
    }

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
    }, 5500);
  };

  // Nie renderuj, dopóki ładujemy sesję lub nie ma nagród
  if (isLoadingSession || wheelPrizes.length === 0) return null;

  return (
    <section className="py-12 px-6 relative z-[100]">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-[3rem] bg-white/60 backdrop-blur-3xl border-2 border-white shadow-xl">
          
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-urwis-blue/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-10">
            
            {/* LEWA STRONA: Tekst (zależny od tego czy jest zalogowany) */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-600 px-4 py-1.5 rounded-full mb-6 shadow-sm">
                <Gift size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {isLoggedIn ? 'Klub Urwisa' : 'Wersja Demonstracyjna'}
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-4 text-zinc-900">
                Zakręć {isLoggedIn ? 'swoim' : 'darmowym'} <br /> 
                <span className="text-amber-500">Kołem Fortuny!</span>
              </h2>
              
              <p className="text-lg text-zinc-600 font-bold max-w-md mx-auto md:mx-0 leading-tight mb-8">
                {isLoggedIn 
                  ? 'Jesteś zalogowany! Przejdź do panelu rabatowego, aby wykorzystać swoją codzienną szansę i zdobyć super zniżki na zabawki.' 
                  : 'Przetestuj naszą zabawę. Zakręć kołem, sprawdź co możesz wygrać, a następnie odbierz prawdziwą szansę po założeniu konta!'}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <button 
                  onClick={handleAction}
                  disabled={isSpinning}
                  className={`w-full sm:w-auto px-8 py-4 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer flex items-center justify-center gap-2
                    ${isLoggedIn ? 'bg-[#0055ff] hover:bg-blue-600' : 'bg-amber-500 hover:bg-amber-600'}`}
                >
                  {isSpinning ? 'Losowanie...' : isLoggedIn ? 'Przejdź do losowania' : 'Zakręć na próbę!'}
                  {isLoggedIn && <ArrowRight size={18} />}
                </button>
              </div>
            </div>

            {/* PRAWA STRONA: KOŁO */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 shrink-0">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 text-[#BF2024] drop-shadow-lg">
                 <svg width="46" height="46" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                   <path d="M12 21L22 9H2L12 21Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                 </svg>
              </div>

              <motion.div
                className="w-full h-full rounded-full border-[6px] border-zinc-900 overflow-hidden shadow-2xl relative"
                animate={{ rotate: wheelRotation }}
                transition={{ duration: 5, ease: [0.15, 0.9, 0.2, 1] }}
                style={{ 
                   background: `conic-gradient(${wheelPrizes.map((p, i) => {
                     const start = i * (360 / wheelPrizes.length);
                     const end = (i + 1) * (360 / wheelPrizes.length);
                     return `${WHEEL_COLORS[i % WHEEL_COLORS.length]} ${start}deg ${end}deg`;
                   }).join(', ')})`
                }}
              >
                {wheelPrizes.map((p, i) => {
                   const sliceAngle = 360 / wheelPrizes.length;
                   const rotation = (i * sliceAngle) + (sliceAngle / 2);
                   return (
                     <div
                       key={p.id}
                       className="absolute w-[50%] h-12 top-1/2 left-1/2 origin-left flex items-center pl-10 md:pl-12 pr-2"
                       style={{ transform: `translate(0, -50%) rotate(${rotation - 90}deg)` }}
                     >
                       <span className="text-white font-black text-[8px] md:text-[10px] text-left leading-tight drop-shadow-md z-10 w-full uppercase line-clamp-2">
                         {p.title}
                       </span>
                     </div>
                   )
                })}
              </motion.div>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-zinc-900 z-20 shadow-lg flex items-center justify-center">
                <CircleDashed size={20} className="text-zinc-400 animate-spin-slow" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPrizeModal && spinResult && !isLoggedIn && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
              className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-400 to-orange-500" />
              
              <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative">
                <PartyPopper size={40} />
                <div className="absolute -bottom-2 -right-2 bg-zinc-900 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md rotate-12">
                  DEMO
                </div>
              </div>
              
              <h3 className="text-sm font-black uppercase text-zinc-400 tracking-widest mb-1">Przykładowa wygrana:</h3>
              <h2 className="text-3xl font-black italic uppercase text-zinc-900 mb-2 leading-tight">{spinResult.title}</h2>
              
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 mb-8 mt-4">
                <p className="text-zinc-600 text-sm font-bold leading-relaxed">
                  To było tylko losowanie próbne! Załóż konto w aplikacji, aby móc zakręcić kołem naprawdę i odbierać takie rabaty przy kasie!
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setShowPrizeModal(false);
                    setTimeout(() => setIsAuthModalOpen(true), 200); 
                  }} 
                  className="w-full bg-[#0055ff] text-white py-4 rounded-2xl font-black uppercase text-sm shadow-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 outline-none cursor-pointer"
                >
                  <UserPlus size={18} /> Załóż darmowe konto
                </button>
                
                <button onClick={() => setShowPrizeModal(false)} className="w-full bg-white text-zinc-400 hover:text-zinc-600 py-3 rounded-2xl font-black uppercase text-xs transition-colors cursor-pointer outline-none">
                  Zamknij
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView="register" 
      />
    </section>
  );
}