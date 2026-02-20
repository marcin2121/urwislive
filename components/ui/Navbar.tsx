"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import PushButton from "./PushButton";
import {
  ShoppingBag,
  Sparkles,
  Zap,
  Coffee,
  Phone,
  GraduationCap,
  Menu,
  X,
  ChevronDown,
  Clock,
  BadgePercent,
  Info
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
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHoursDropdownOpen, setIsHoursDropdownOpen] = useState(false);
  
  // 🚀 Klucz do odświeżania dzwonka po akcji u Urwisa
  const [pushKey, setPushKey] = useState(0);

  const [shopStatus, setShopStatus] = useState({ 
    isOpen: false, 
    label: "...", 
    subLabel: "" 
  });

  // 📊 FUNKCJA ANALITYCZNA GTAG
  const trackEvent = (name: string, params: object = {}) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', name, {
        ...params,
        page_path: pathname
      });
    }
  };

  useEffect(() => {
    setMounted(true);

    // 🚀 Nasłuchiwanie na sygnał odświeżenia z WelcomeScreen
    const handlePushRefresh = () => {
      setPushKey(prev => prev + 1);
      trackEvent('push_status_updated_auto');
    };

    window.addEventListener('push-permission-changed', handlePushRefresh);

    const checkStatus = () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      const min = now.getMinutes();
      const currentTime = hour + min / 60;

      let isOpen = false;
      let label = "ZAMKNIĘTE";
      let subLabel = "";

      if (day >= 1 && day <= 5) {
        if (currentTime >= 8 && currentTime < 18) {
          isOpen = true; label = "OTWARTE"; subLabel = "do 18:00";
        } else { subLabel = "Otwieramy o 08:00"; }
      } else if (day === 6) {
        if (currentTime >= 8 && currentTime < 15) {
          isOpen = true; label = "OTWARTE"; subLabel = "do 15:00";
        } else { subLabel = "W poniedziałek"; }
      } else {
        subLabel = "W poniedziałek";
      }

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
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 md:top-6 left-0 right-0 z-50 flex justify-center px-2 md:px-4"
      >
        <div className="w-full max-w-[1200px] bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-full p-1 pr-2 md:pr-4 flex items-center justify-between transition-all">
          
          {/* --- LOGO & STATUS --- */}
          <div className="relative flex items-center gap-2 md:gap-4 shrink-0">
            <Link 
              href="/" 
              onClick={() => trackEvent('nav_logo_click')}
              className="flex items-center gap-2 group shrink-0"
            >
              <span className="sr-only">Sklep Urwis</span>
              <div className="relative w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-full shadow-sm border border-white/50 bg-white shrink-0 group-active:scale-95 transition-transform">
                <Image src="/logo.png" alt="Logo Sklepu Urwis" fill className="object-contain p-1.5" priority />
              </div>
              <div className="flex flex-col leading-[0.85] pt-0.5" aria-hidden="true">
                <span className="text-[11px] md:text-[13px] font-black italic tracking-tighter text-[#BF2024]">SKLEP</span>
                <span className="text-[11px] md:text-[13px] font-black italic tracking-tighter text-[#0055ff]">URWIS</span>
              </div>
            </Link>

            {/* STATUS (Działa jako przełącznik godzin) */}
            <button 
              onClick={() => {
                const newState = !isHoursDropdownOpen;
                setIsHoursDropdownOpen(newState);
                trackEvent('nav_hours_toggle', { state: newState ? 'open' : 'close' });
              }}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/50 border border-white/60 shadow-sm shrink-0 hover:bg-white transition-colors"
            >
              <div className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${shopStatus.isOpen ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 ${shopStatus.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </div>
              <div className="flex flex-col items-start leading-none text-left">
                <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-tighter md:tracking-wider ${shopStatus.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                  {shopStatus.label}
                </span>
                <span className="text-[7px] md:text-[9px] font-bold text-zinc-400 tracking-tighter mt-[1px]">
                  {shopStatus.subLabel}
                </span>
              </div>
              <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-300 ${isHoursDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isHoursDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 md:left-14 mt-4 w-[260px] md:w-72 bg-white/95 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/60 p-5 z-[100]"
                >
                  <div className="flex items-center gap-2 mb-4 text-zinc-400">
                    <Clock size={14} strokeWidth={2.5} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Godziny Otwarcia</span>
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

          {/* --- NAWIGACJA DESKTOP --- */}
          <nav className="hidden xl:flex items-center gap-1 bg-zinc-100/50 p-1.5 rounded-full border border-white/20">
            {NAV_ITEMS.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                onClick={() => trackEvent('nav_link_click', { name: item.name })}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${pathname === item.href ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-white/40'}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* --- AKCJE PRAWA STRONA --- */}
          <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
            
            {/* 🚀 Dzwonek - wymuszamy odświeżenie kluczem po sygnale od Urwisa */}
            <div className="shrink-0">
              <PushButton key={`nav-push-${pushKey}`} />
            </div>

            <Link 
              href="/salazabaw" 
              onClick={() => trackEvent('nav_cta_kulki')}
              className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/50 rounded-full transition-all group shrink-0"
            >
              <Coffee size={14} className="group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Lecę w Kulki</span>
            </Link>

            <Link 
              href="https://akademiaurwisa.pl" 
              target="_blank" 
              onClick={() => trackEvent('nav_cta_akademia')}
              className="hidden lg:flex relative overflow-hidden items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-full shadow-lg shadow-blue-900/20 hover:scale-105 transition-all shrink-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#BF2024] to-[#0055ff]" />
              <div className="relative flex items-center gap-2">
                <GraduationCap size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Akademia</span>
              </div>
            </Link>

            <button 
              onClick={() => {
                setMobileMenuOpen(true);
                trackEvent('mobile_menu_open');
              }} 
              className="xl:hidden p-2 md:p-3 rounded-full bg-zinc-100/50 hover:bg-zinc-200 text-zinc-600 shrink-0 active:scale-90 transition-transform"
            >
              <Menu className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* --- MENU MOBILNE --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60" onClick={() => setMobileMenuOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed inset-y-0 right-0 z-70 w-full max-w-sm bg-white shadow-2xl p-6 flex flex-col" >
              
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <Image src="/logo.png" alt="Urwis" width={40} height={40} className="object-contain" />
                  <div className="flex flex-col leading-none">
                    <span className="text-sm font-black italic text-[#BF2024]">SKLEP</span>
                    <span className="text-sm font-black italic text-[#0055ff]">URWIS</span>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-3 bg-zinc-100 rounded-full text-zinc-600"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                <nav className="flex flex-col gap-1">
                  {NAV_ITEMS.map((item) => (
                    <Link 
                      key={item.name} 
                      href={item.href} 
                      onClick={() => { setMobileMenuOpen(false); trackEvent('mobile_nav_click', { name: item.name }); }} 
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-50 text-lg font-black italic uppercase tracking-tighter text-zinc-800" 
                    >
                      <item.icon size={20} className="text-zinc-400" />
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <hr className="border-zinc-100" />

                <Link href="/salazabaw" onClick={() => trackEvent('mobile_cta_kulki')} className="flex items-center gap-4 p-6 rounded-[2rem] bg-blue-50 text-blue-700">
                   <Coffee size={24} />
                   <div className="font-black italic uppercase tracking-tighter">Lecę w Kulki</div>
                </Link>

                <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4 block">Godziny Otwarcia</span>
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