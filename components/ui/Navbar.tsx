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

  const [shopStatus, setShopStatus] = useState({ 
    isOpen: false, 
    label: "...", 
    subLabel: "" 
  });

  useEffect(() => {
    setMounted(true);
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
    return () => clearInterval(interval);
  }, []);

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
          
          {/* --- LEWA STRONA: LOGO & STATUS --- */}
          <div className="relative flex items-center gap-2 md:gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <span className="sr-only">Sklep Urwis</span>
              <div className="relative w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-full shadow-sm border border-white/50 bg-white shrink-0">
                <Image src="/logo.png" alt="Logo Sklepu Urwis" fill className="object-contain p-1.5" priority />
              </div>
              {/* 🚀 ZMIANA: Usunięto "hidden lg:flex". Teraz tekst jest widoczny zawsze, odpowiednio zeskalowany dla mobile */}
              <div className="flex flex-col leading-[0.85] pt-0.5" aria-hidden="true">
                <span className="text-[11px] md:text-[13px] font-black italic tracking-tighter text-[#BF2024]">SKLEP</span>
                <span className="text-[11px] md:text-[13px] font-black italic tracking-tighter text-[#0055ff]">URWIS</span>
              </div>
            </Link>

            {/* STATUS MOBILNY Z CHEVRONEM */}
            <button 
              onClick={() => setIsHoursDropdownOpen(!isHoursDropdownOpen)}
              aria-expanded={isHoursDropdownOpen}
              className={`md:hidden flex items-center gap-1 px-2 py-1.5 rounded-[14px] border shadow-xs transition-all active:scale-95 shrink-0 ${
                shopStatus.isOpen 
                  ? 'bg-green-50/80 border-green-200/50 hover:bg-green-100/80' 
                  : 'bg-red-50/80 border-red-200/50 hover:bg-red-100/80'
              }`}
            >
              <div className="flex flex-col items-start justify-center">
                <div className="flex items-center gap-1.5 leading-none">
                  <div className={`w-1.5 h-1.5 rounded-full ${shopStatus.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${shopStatus.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                    {shopStatus.label}
                  </span>
                </div>
                <span className="text-[7px] font-bold text-zinc-500 tracking-tighter mt-[3px] leading-none pl-3">
                  {shopStatus.subLabel}
                </span>
              </div>
              <ChevronDown 
                size={14} 
                strokeWidth={3} 
                className={`transition-transform duration-300 ${shopStatus.isOpen ? 'text-green-600/50' : 'text-red-500/50'} ${isHoursDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            <div className="hidden md:block w-px h-8 bg-zinc-200/60 mx-1"></div>

            {/* STATUS DESKTOP */}
            <button
              onClick={() => setIsHoursDropdownOpen(!isHoursDropdownOpen)}
              aria-expanded={isHoursDropdownOpen}
              className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-white/50 hover:bg-white border border-white/60 shadow-sm transition-all group"
            >
              <div className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${shopStatus.isOpen ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${shopStatus.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </div>
              <div className="flex flex-col items-start leading-none gap-0.5 text-left">
                <span className={`text-[10px] font-black uppercase tracking-wider ${shopStatus.isOpen ? 'text-green-600' : 'text-red-500'}`}>{shopStatus.label}</span>
                <span className="text-[9px] font-semibold text-zinc-400">{shopStatus.subLabel}</span>
              </div>
              <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-300 ${isHoursDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* DROPDOWN (Godziny Otwarcia) DLA MOBILE I DESKTOP */}
            <AnimatePresence>
              {isHoursDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute top-full left-0 md:left-14 mt-4 w-[280px] md:w-72 bg-white/95 backdrop-blur-3xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/60 p-5 origin-top-left z-[100]"
                >
                  <div className="flex items-center gap-2 mb-4 text-zinc-400">
                    <Clock size={14} strokeWidth={2.5} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Godziny Otwarcia</span>
                  </div>
                  <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-100/50"><span className="font-semibold text-zinc-600 text-xs">Pon - Pt</span><span className="font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-md text-xs">{OPENING_HOURS_TEXT.week}</span></div>
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-100/50"><span className="font-semibold text-zinc-600 text-xs">Sobota</span><span className="font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-md text-xs">{OPENING_HOURS_TEXT.sat}</span></div>
                      <div className="flex justify-between items-center"><span className="font-semibold text-zinc-600 text-xs">Niedziela</span><span className="font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md text-xs">{OPENING_HOURS_TEXT.sun}</span></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* --- ŚRODEK: NAWIGACJA DESKTOP --- */}
          <nav className="hidden xl:flex items-center gap-1 bg-zinc-100/50 p-1.5 rounded-full border border-white/20">
            {NAV_ITEMS.map((item) => (
              <Link key={item.name} href={item.href} className={`relative px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-300 ${pathname === item.href ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-white/40'}`}>{item.name}</Link>
            ))}
          </nav>

          {/* --- PRAWA STRONA: AKCJE --- */}
          <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
            
            {/* POWIADOMIENIA UKRYTE NA DESKTOPIE (lg:hidden) */}
            <div className="lg:hidden shrink-0">
              <PushButton />
            </div>

            {/* LECĘ W KULKI NA DESKTOPIE */}
            <Link href="/salazabaw" className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/50 rounded-full transition-all group shrink-0">
              <div className="p-1 bg-white rounded-full group-hover:bg-blue-200 transition-colors">
                <Coffee size={14} className="text-blue-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Lecę w Kulki</span>
            </Link>

            {/* AKADEMIA URWISA (Ukryta na mobile, widoczna od lg) */}
            <Link href="https://akademiaurwisa.pl" target="_blank" className="hidden lg:flex relative overflow-hidden items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-full shadow-lg shadow-blue-900/20 group hover:scale-105 transition-transform shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-[#BF2024] to-[#0055ff] opacity-100 group-hover:opacity-90 transition-opacity" />
              <div className="relative flex items-center gap-2">
                <GraduationCap size={18} className="text-white/90" />
                <span className="text-[10px] font-black uppercase tracking-widest">Akademia</span>
              </div>
            </Link>

            {/* HAMBURGER MENU */}
            <button 
              onClick={() => setMobileMenuOpen(true)} 
              aria-label="Otwórz menu nawigacji"
              className="xl:hidden p-2 md:p-3 rounded-full bg-zinc-100/50 hover:bg-zinc-200/50 text-zinc-600 transition-colors shrink-0"
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
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-60" 
              onClick={() => setMobileMenuOpen(false)} 
            />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 30, stiffness: 300 }} 
              className="fixed inset-y-0 right-0 z-70 w-full max-w-sm bg-white/95 backdrop-blur-3xl shadow-2xl border-l border-white/50 p-6 flex flex-col" 
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 relative rounded-full overflow-hidden shadow-md bg-white">
                    <Image src="/logo.png" alt="Urwis" fill className="object-contain p-1.5" />
                  </div>
                  <div className="flex flex-col leading-[0.85] pt-0.5">
                    <span className="text-[16px] font-black italic tracking-tighter text-[#BF2024]">SKLEP</span>
                    <span className="text-[16px] font-black italic tracking-tighter text-[#0055ff]">URWIS</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  aria-label="Zamknij menu"
                  className="p-3 bg-zinc-100 rounded-full hover:bg-zinc-200 text-zinc-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-8 pr-2 pb-8 custom-scrollbar">
                
                {/* 1. LINKI NAWIGACYJNE */}
                <div className="flex flex-col gap-1">
                  {NAV_ITEMS.map((item) => (
                    <Link 
                      key={item.name} 
                      href={item.href} 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-all text-lg font-black italic tracking-tighter uppercase text-zinc-800 group" 
                    >
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-zinc-200 transition-colors">
                        <item.icon size={20} />
                      </div>
                      {item.name}
                    </Link>
                  ))}
                </div>

                <hr className="border-zinc-100" />

                {/* 2. KAFELKI PROMOWANE: LECĘ W KULKI & AKADEMIA */}
                <div className="grid grid-cols-1 gap-3">
                  <Link 
                    href="/salazabaw" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="flex flex-col justify-center p-6 rounded-[2rem] bg-blue-50/50 border border-blue-100 text-blue-700 min-h-[120px] relative overflow-hidden group"
                  >
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Coffee size={24} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase opacity-70 tracking-widest">Wskocz do zabawy</div>
                        <div className="text-xl font-black italic tracking-tighter uppercase">Lecę w Kulki</div>
                      </div>
                    </div>
                    <Sparkles className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-200/30 rotate-12" />
                  </Link>

                  <Link 
                    href="https://akademiaurwisa.pl" 
                    target="_blank" 
                    className="flex flex-col justify-center p-6 rounded-[2rem] text-white min-h-[120px] relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#BF2024] to-[#0055ff]" />
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                        <GraduationCap size={24} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase opacity-80 tracking-widest text-white/90">Gry & Edukacja</div>
                        <div className="text-xl font-black italic tracking-tighter uppercase">Akademia Urwisa</div>
                      </div>
                    </div>
                    <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 -rotate-12" />
                  </Link>
                </div>

                <hr className="border-zinc-100" />

                {/* 3. GODZINY OTWARCIA NA SAMYM DOLE */}
                <div className="bg-zinc-50/50 p-6 rounded-[2rem] border border-zinc-100 shadow-xs">
                   <div className="flex items-center gap-3 mb-6">
                     <div className={`w-3 h-3 rounded-full ${shopStatus.isOpen ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                     <div className="flex flex-col">
                        <span className={`text-sm font-black uppercase tracking-widest ${shopStatus.isOpen ? 'text-green-600' : 'text-red-500'}`}>{shopStatus.label}</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{shopStatus.subLabel}</span>
                     </div>
                   </div>
                   
                   <div className="space-y-3">
                      {FULL_HOURS_LIST.map((item, idx) => (
                        <div key={idx} className={`flex justify-between items-center text-xs ${idx !== FULL_HOURS_LIST.length - 1 ? 'pb-2 border-b border-zinc-100/30' : ''}`}>
                          <span className="font-bold text-zinc-400 italic tracking-tight">{item.day}</span>
                          <span className={`font-black tracking-tighter ${item.isRed ? 'text-red-500 bg-red-50 px-2 py-0.5 rounded-md' : 'text-zinc-900'}`}>
                            {item.hours}
                          </span>
                        </div>
                      ))}
                   </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}