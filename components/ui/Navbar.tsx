"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import PushButton from "./PushButton";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import {
  ShoppingBag,
  Coffee,
  Phone,
  GraduationCap,
  Menu,
  X,
  ChevronDown,
  Clock,
  BadgePercent,
  Info,
  Coins,
  Wallet
} from "lucide-react";

const OPENING_HOURS_TEXT = {
  week: "08:00 - 18:00",
  sat: "08:00 - 15:00",
  sun: "Zamknięte"
};

const FULL_HOURS_LIST = [
  { day: "Poniedziałek", hours: OPENING_HOURS_TEXT.week },
  { day: "Wtorek", hours: OPENING_HOURS_TEXT.week },
  { day: "Środa", hours: OPENING_HOURS_TEXT.week },
  { day: "Czwartek", hours: OPENING_HOURS_TEXT.week },
  { day: "Piątek", hours: OPENING_HOURS_TEXT.week },
  { day: "Sobota", hours: OPENING_HOURS_TEXT.sat },
  { day: "Niedziela", hours: OPENING_HOURS_TEXT.sun, isRed: true },
];

const NAV_ITEMS = [
  { name: "O nas", href: "/o-nas", icon: Info },
  { name: "Oferta Sklepu", href: "/oferta", icon: ShoppingBag },
  { name: "Promocje", href: "/oferta/promocje", icon: BadgePercent },
  { name: "Kontakt", href: "/kontakt", icon: Phone },
  { name: "Sala Zabaw", href: "/salazabaw", icon: Coffee },
];

export default function Navbar() {
  const pathname = usePathname();
  const supabase = createClient();
  const { user, session } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHoursDropdownOpen, setIsHoursDropdownOpen] = useState(false);
  const [pushKey, setPushKey] = useState(0);
  const [userPoints, setUserPoints] = useState<number | null>(null);

  const [shopStatus, setShopStatus] = useState({ 
    isOpen: false, 
    label: "...", 
    subLabel: "" 
  });

  const trackEvent = (name: string, params: object = {}) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', name, { ...params, page_path: pathname });
    }
  };

  useEffect(() => {
    if (user && session) {
      const fetchPoints = async () => {
        const { data } = await supabase
          .from('loyalty_cards')
          .select('points')
          .eq('phone_number', user.user_metadata.phone)
          .maybeSingle();
        if (data) setUserPoints(data.points);
      };
      fetchPoints();
    } else {
      setUserPoints(null);
    }
  }, [user, session, supabase]);

  useEffect(() => {
    setMounted(true);
    
    const handlePushRefresh = () => {
      setPushKey(prev => prev + 1);
      trackEvent('push_status_updated_auto');
    };
    window.addEventListener('push-permission-changed', handlePushRefresh);

    const checkStatus = () => {
      const now = new Date();
      const day = now.getDay();
      const currentTime = now.getHours() + now.getMinutes() / 60;

      let isOpen = false;
      let label = "ZAMKNIĘTE";
      let subLabel = "";

      if (day >= 1 && day <= 5) {
        if (currentTime >= 8 && currentTime < 18) {
          isOpen = true; label = "OTWARTE"; subLabel = "do 18:00";
        } else subLabel = "Otwieramy o 08:00";
      } else if (day === 6) {
        if (currentTime >= 8 && currentTime < 15) {
          isOpen = true; label = "OTWARTE"; subLabel = "do 15:00";
        } else subLabel = "W poniedziałek";
      } else subLabel = "W poniedziałek";

      setShopStatus({ isOpen, label, subLabel });
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('push-permission-changed', handlePushRefresh);
    };
  }, [pathname]);

  if (!mounted) return null;

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 md:top-6 left-0 right-0 z-50 flex justify-center px-1.5 md:px-4"
      >
        <div className="w-full max-w-[1200px] bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-full py-1 pl-1.5 pr-1.5 md:pl-2 md:pr-4 flex items-center justify-between">
          
          <div className="relative flex items-center gap-1.5 md:gap-4 shrink-0">
            {/* 🚀 LOGO: Brak ramki, bliżej lewej strony i ciaśniej ułożony tekst */}
            <Link href="/" onClick={() => trackEvent('nav_logo_click')} aria-label="Strona główna" className="flex items-center gap-0.5 md:gap-1 group shrink-0">
              <div className="relative w-8 h-8 md:w-11 md:h-11 shrink-0 transition-transform group-hover:scale-105">
                <Image src="/logo.png" alt="Logo Sklepu Urwis" fill className="object-contain" priority />
              </div>
              <div className="flex flex-col leading-[0.8] font-black italic">
                <span className="text-[10px] md:text-[14px] text-[#BF2024]">SKLEP</span>
                <span className="text-[10px] md:text-[14px] text-[#0055ff]">URWIS</span>
              </div>
            </Link>

            <button 
              aria-label="Pokaż godziny otwarcia"
              onClick={() => {
                const newState = !isHoursDropdownOpen;
                setIsHoursDropdownOpen(newState);
                trackEvent('nav_hours_toggle', { state: newState ? 'open' : 'close' });
              }}
              className="flex items-center gap-1.5 px-2 py-1.5 md:px-4 md:py-2 rounded-full bg-white/50 border border-white/60 shadow-sm shrink-0 hover:bg-white transition-colors"
            >
              <div className="relative flex h-2 w-2 md:h-2.5 md:w-2.5 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${shopStatus.isOpen ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 ${shopStatus.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </div>
              <div className="flex flex-col items-start leading-none text-left">
                <span className={`text-[9px] md:text-[12px] font-black uppercase tracking-tighter ${shopStatus.isOpen ? 'text-green-600' : 'text-red-500'}`}>{shopStatus.label}</span>
                <span className="hidden sm:block text-[11px] font-bold text-zinc-400 tracking-tighter mt-[1px]">{shopStatus.subLabel}</span>
              </div>
              <ChevronDown size={14} className={`text-zinc-400 shrink-0 transition-transform ${isHoursDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isHoursDropdownOpen && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-full left-0 md:left-14 mt-4 w-[260px] md:w-72 bg-white/95 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/60 p-5 z-[100]">
                  <div className="flex items-center gap-2 mb-4 text-zinc-400">
                    <Clock size={14} strokeWidth={2.5} /><span className="text-[10px] font-bold uppercase tracking-widest">Godziny Otwarcia</span>
                  </div>
                  <div className="space-y-3">
                    {FULL_HOURS_LIST.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs pb-1 border-b border-zinc-100/50 last:border-0 last:pb-0">
                        <span className="font-bold text-zinc-500">{item.day}</span>
                        <span className={`font-black ${item.isRed ? 'text-red-500' : 'text-zinc-900'}`}>{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <nav className="hidden xl:flex items-center gap-1 bg-zinc-100/50 p-1.5 rounded-full border border-white/20">
            {NAV_ITEMS.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                onClick={() => trackEvent('nav_link_click', { name: item.name })}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${pathname === item.href ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-white/40'}`}>
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 md:gap-3 shrink-0">
            
            {/* 🪙 PORTFEL: Okrągły, wielkości powiadomień. Punkty wyświetlane jako "badge" */}
            <Link 
              href="/karta" 
              onClick={() => trackEvent('nav_wallet_click')}
              aria-label="Przejdź do portfela lojalnościowego"
              className={`relative flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full transition-all group shrink-0 border ${user ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white border-amber-300 shadow-md shadow-amber-500/20' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border-zinc-200'}`}
            >
              {user ? (
                <>
                  <Coins size={15} className="md:size-[18px] group-hover:rotate-12 transition-transform shrink-0" />
                  {userPoints !== null && (
                    <span className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 bg-red-500 text-white text-[8px] md:text-[9px] font-black min-w-[16px] h-[16px] flex items-center justify-center rounded-full border border-white leading-none shadow-sm">
                      {userPoints}
                    </span>
                  )}
                </>
              ) : (
                <Wallet size={15} className="md:size-[18px] text-zinc-400 group-hover:scale-110 transition-transform shrink-0" />
              )}
            </Link>

            {/* 🔔 POWIADOMIENIA: Minimalnie zmniejszone przez skalowanie */}
            <div className="shrink-0 flex items-center justify-center transform scale-[0.85] md:scale-90 origin-center">
              <PushButton key={`nav-push-${pushKey}`} />
            </div>

            <Link 
              href="https://akademiaurwisa.pl" 
              target="_blank" 
              onClick={() => trackEvent('nav_cta_akademia')}
              className="hidden lg:flex relative overflow-hidden items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-full shadow-lg shadow-blue-900/20 hover:scale-105 transition-all shrink-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#BF2024] to-[#0055ff]" />
              <div className="relative flex items-center gap-2">
                <GraduationCap size={18} />
                <span className="text-[12px] font-black uppercase tracking-widest">Akademia</span>
              </div>
            </Link>

            <button 
              aria-label="Otwórz menu nawigacji"
              onClick={() => {
                setMobileMenuOpen(true);
                trackEvent('mobile_menu_open');
              }} 
              className="xl:hidden p-1.5 md:p-3 rounded-full bg-zinc-100/50 hover:bg-zinc-200 text-zinc-600 active:scale-90 transition-transform shrink-0 ml-0.5"
            >
              <Menu className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setMobileMenuOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed inset-y-0 right-0 z-[70] w-full max-w-sm bg-white shadow-2xl p-6 flex flex-col">
              
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <Image src="/logo.png" alt="Urwis" width={40} height={40} className="object-contain" />
                  <div className="flex flex-col leading-none font-black italic">
                    <span className="text-sm text-[#BF2024]">SKLEP</span>
                    <span className="text-sm text-[#0055ff]">URWIS</span>
                  </div>
                </div>
                <button aria-label="Zamknij menu" onClick={() => setMobileMenuOpen(false)} className="p-3 bg-zinc-100 rounded-full text-zinc-600"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                
                {/* Zwiększony wizualnie kafelek mobilny Portfela */}
                <Link 
                  href="/karta" 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    trackEvent('mobile_wallet_click');
                  }} 
                  className={`flex items-center justify-between p-4 rounded-3xl border transition-all ${user ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-white border-amber-300 shadow-lg' : 'bg-zinc-50 text-zinc-900 border-zinc-100'}`}
                >
                  <div className="flex items-center gap-3">
                    {user ? <Coins size={24} /> : <Wallet size={24} className="text-zinc-400" />}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase opacity-70 leading-none mb-0.5">{user ? 'Twoje Złote Urwisy' : 'Strefa Klienta'}</span>
                      <span className="text-lg font-black italic uppercase leading-none">
                        {user ? (userPoints !== null ? `${userPoints} Urwisów` : 'Twój Portfel') : 'Zaloguj się'}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="-rotate-90 opacity-50 size-5" />
                </Link>

                <nav className="flex flex-col gap-1">
                  {NAV_ITEMS.map((item) => (
                    <Link 
                      key={item.name} 
                      href={item.href} 
                      onClick={() => { 
                        setMobileMenuOpen(false); 
                        trackEvent('mobile_nav_click', { name: item.name }); 
                      }} 
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-50 text-lg font-black italic uppercase tracking-tighter text-zinc-800"
                    >
                      <item.icon size={20} className="text-zinc-400" />{item.name}
                    </Link>
                  ))}
                </nav>

                <hr className="border-zinc-100 my-2" />

                <div className="flex flex-col gap-3">
                  <Link 
                    href="/salazabaw" 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      trackEvent('mobile_cta_kulki');
                    }} 
                    className="flex items-center gap-4 p-6 rounded-[2rem] bg-blue-50 text-blue-700 border border-blue-100"
                  >
                     <Coffee size={24} /><div className="font-black italic uppercase tracking-tighter text-[18px]">Lecę w Kulki</div>
                  </Link>

                  <Link 
                    href="https://akademiaurwisa.pl" 
                    target="_blank" 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      trackEvent('mobile_cta_akademia');
                    }} 
                    className="flex items-center gap-4 p-6 rounded-[2rem] bg-zinc-900 text-white border border-zinc-800 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#BF2024] to-[#0055ff] opacity-80" />
                    <div className="relative flex items-center gap-4">
                      <GraduationCap size={24} />
                      <div className="font-black italic uppercase tracking-tighter text-lg">Akademia</div>
                    </div>
                  </Link>
                </div>

                <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 mt-4">
                    <span className="text-[12px] font-black uppercase text-zinc-400 tracking-widest mb-4 block">Godziny Otwarcia</span>
                    {FULL_HOURS_LIST.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs py-2 border-b border-zinc-200/50 last:border-0">
                        <span className="font-bold text-zinc-400">{item.day}</span>
                        <span className={`font-black ${item.isRed ? 'text-red-500' : 'text-zinc-900'}`}>{item.hours}</span>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}