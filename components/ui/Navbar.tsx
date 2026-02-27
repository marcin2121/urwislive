"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import PushButton from "./PushButton";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "./AuthModal";
import {
  ShoppingBag,
  Coffee,
  Phone,
  GraduationCap,
  Menu,
  X,
  ChevronDown,
  Clock,
  Info,
  Palette,
  Smile,
  User,
  BadgePercent,
  ShieldAlert
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
  { name: "Oferta", href: "/oferta", icon: ShoppingBag },
  { name: "Urwisek", href: "/urwisek", icon: Smile },
  { name: "Kolorowanki", href: "/kolorowanki", icon: Palette }, 
  { name: "Kontakt", href: "/kontakt", icon: Phone },
  { name: "Sala Zabaw", href: "/salazabaw", icon: Coffee },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHoursDropdownOpen, setIsHoursDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const hoursRef = useRef<HTMLDivElement>(null);

  const [shopStatus, setShopStatus] = useState({ 
    isOpen: false, 
    label: "...", 
    subLabel: "" 
  });

  const isAdmin = user?.user_metadata?.role === 'admin';

  const trackEvent = useCallback((name: string, params: object = {}) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', name, { ...params, page_path: pathname });
    }
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (hoursRef.current && !hoursRef.current.contains(event.target as Node)) {
        if (isHoursDropdownOpen) {
            setIsHoursDropdownOpen(false);
            trackEvent('nav_hours_auto_close');
        }
      }
    }
    if (isHoursDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isHoursDropdownOpen, trackEvent]);

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = Math.abs(touchEndY - touchStartY);

      if (deltaX < -40 && deltaY < 40 && touchStartX > window.innerWidth - 50) {
        setMobileMenuOpen(true);
      }
      if (deltaX > 50 && deltaY < 50 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMounted(true);
    
    // Usunąłem stąd nasłuchiwanie na event Push, bo przenieśliśmy to na stałe do Profilu.
    
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
        } else if (currentTime < 8) {
          subLabel = "do 08:00";
        } else {
          subLabel = day === 5 ? "W sobotę" : "do 08:00";
        }
      } else if (day === 6) {
        if (currentTime >= 8 && currentTime < 15) {
          isOpen = true; label = "OTWARTE"; subLabel = "do 15:00";
        } else if (currentTime < 8) {
          subLabel = "do 08:00";
        } else {
          subLabel = "W poniedziałek";
        }
      } else {
        subLabel = "W poniedziałek";
      }
      setShopStatus({ isOpen, label, subLabel });
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (!mounted) return null;

  return (
    <header>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 md:top-6 left-0 right-0 z-50 flex justify-center px-1.5 md:px-4"
      >
        <div className="w-full max-w-[1200px] bg-white/95 shadow-sm border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-full py-1 pl-1.5 pr-1.5 md:pl-2 md:pr-4 flex items-center justify-between">
          
          <div className="relative flex items-center gap-2 md:gap-4 shrink-0" ref={hoursRef}>
            {/* LOGO */}
            <Link 
              href="/" 
              onClick={() => trackEvent('nav_logo_click')} 
              className="flex items-center gap-0.5 md:gap-1 group shrink-0"
            >
              <div className="relative w-9 h-9 md:w-11 md:h-11 shrink-0 transition-transform group-hover:scale-105">
                <Image src="/logo.png" alt="Logo Sklepu Urwis" width={44} height={44} className="object-contain" priority />
              </div>
              <div className="flex flex-col leading-[0.8] pt-0.5 font-black italic">
                <span className="text-[11px] md:text-[14px] text-[#BF2024]">SKLEP</span>
                <span className="text-[11px] md:text-[14px] text-[#0055ff]">URWIS</span>
              </div>
            </Link>

            {/* STATUS SKLEPU */}
            <button 
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
                <span className={`text-[10px] md:text-[12px] font-black uppercase tracking-tighter ${shopStatus.isOpen ? 'text-green-600' : 'text-red-500'}`}>{shopStatus.label}</span>
                <span className="text-[8px] md:text-[11px] font-bold text-zinc-400 tracking-tighter mt-[1px] leading-none">{shopStatus.subLabel}</span>
              </div>
              <ChevronDown size={14} className={`text-zinc-400 shrink-0 transition-transform ${isHoursDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isHoursDropdownOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                    className="absolute top-full left-0 md:left-14 mt-4 w-[260px] md:w-72 bg-white/95 backdrop-blur-3xl rounded-4xl shadow-2xl border border-white/60 p-5 z-[100]"
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

          {/* DESKTOP NAV ITEMS */}
          <nav className="hidden xl:flex items-center gap-1 bg-zinc-100/50 p-1.5 rounded-full border border-white/20">
            {NAV_ITEMS.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                onClick={() => trackEvent('nav_link_click', { name: item.name })}
                className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${
                  item.name === "Kolorowanki" 
                    ? 'bg-linear-to-r from-red-500 to-blue-500 text-white shadow-md hover:scale-105'
                    : pathname === item.href 
                      ? 'bg-white text-zinc-900 shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-white/40'
                }`}
              >
                {item.name === "Kolorowanki" && <Palette size={14} />}
                {item.name === "Urwisek" && <Smile size={14} />}
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-3 shrink-0">
            
            {/* Przycisk Rabaty na desktopie */}
            <div className="hidden md:block">
              <Link 
                href="/rabaty" 
                onClick={() => trackEvent('nav_rabaty_click')}
                className="relative flex items-center justify-center px-4 h-9 rounded-full transition-all group shrink-0 border bg-red-50 hover:bg-red-100 text-red-600 border-red-200 shadow-sm"
              >
                <span className="text-[11px] font-black uppercase mr-1.5">Rabaty</span>
                <BadgePercent size={16} />
              </Link>
            </div>

            {/* STREFA KLIENTA / PROFIL / ADMIN (Desktop) */}
            <div className="hidden md:flex gap-1 md:gap-2">
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="relative flex items-center justify-center px-4 h-9 rounded-full transition-all group shrink-0 border bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-800 shadow-sm"
                >
                  <span className="text-[11px] font-black uppercase mr-1.5">Admin</span>
                  <ShieldAlert size={14} />
                </Link>
              )}

              {user ? (
                <Link 
                  href="/profil" 
                  onClick={() => trackEvent('nav_profile_click')}
                  className="relative flex items-center justify-center px-4 h-9 rounded-full transition-all group shrink-0 border bg-zinc-50 hover:bg-zinc-100 text-[#0055ff] border-zinc-200"
                >
                  <span className="text-[11px] font-black uppercase mr-2 text-zinc-700">Profil</span>
                  <User size={16} />
                </Link>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="relative flex items-center justify-center px-4 h-9 rounded-full transition-all group shrink-0 border bg-zinc-900 text-white hover:bg-zinc-800 border-zinc-800 shadow-lg"
                >
                  <span className="text-[11px] font-black uppercase">Zaloguj</span>
                </button>
              )}
            </div>

            {/* MOBILE MENU TOGGLE */}
            <button 
              onClick={() => {
                setMobileMenuOpen(true);
                trackEvent('mobile_menu_open');
              }} 
              className="xl:hidden p-1.5 md:p-3 rounded-full bg-zinc-50 border border-zinc-200 shadow-sm hover:bg-zinc-100 text-zinc-600 active:scale-90 transition-transform shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Menu className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* MOBILE MENU MODAL */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" 
              onClick={() => {
                setMobileMenuOpen(false);
                trackEvent('mobile_menu_close_backdrop');
              }} 
            />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              className="fixed inset-y-0 right-0 z-[70] w-full max-w-sm bg-white shadow-2xl p-6 flex flex-col"
            >
              
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <Image src="/logo.png" alt="Urwis" width={40} height={40} className="object-contain" priority />
                  <div className="flex flex-col leading-none font-black italic">
                    <span className="text-sm text-[#BF2024]">SKLEP</span>
                    <span className="text-sm text-[#0055ff]">URWIS</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    trackEvent('mobile_menu_close_button');
                  }} 
                  className="p-3 bg-zinc-50 border border-zinc-200 shadow-sm rounded-full text-zinc-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">

                {/* Strefa Rabatów jako główny przycisk na mobile */}
                <Link 
                  href="/rabaty" 
                  onClick={() => { setMobileMenuOpen(false); trackEvent('mobile_rabaty_click'); }} 
                  className="flex items-center justify-between p-6 rounded-4xl border shadow-md transition-all bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"><BadgePercent size={24} /></div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-black uppercase opacity-80 leading-none mb-1">Klub Urwisa</span>
                      <span className="text-xl font-black italic uppercase leading-none">Strefa Rabatów</span>
                    </div>
                  </div>
                  <ChevronDown className="-rotate-90 opacity-50 size-5" />
                </Link>

                {/* ADMIN W MENU MOBILNYM */}
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="flex items-center justify-between p-5 rounded-3xl border shadow-sm transition-all bg-zinc-900 text-white border-zinc-800 hover:bg-zinc-800 mt-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"><ShieldAlert size={16} /></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase opacity-70 leading-none mb-1">Zarządzanie Sklepem</span>
                        <span className="text-lg font-black italic uppercase leading-none">Panel Admina</span>
                      </div>
                    </div>
                  </Link>
                )}

                {/* LOGOWANIE / PROFIL W MENU MOBILNYM */}
                {user ? (
                  <Link 
                    href="/profil" 
                    onClick={() => { setMobileMenuOpen(false); trackEvent('mobile_profile_click'); }} 
                    className="flex items-center justify-between p-5 rounded-3xl border shadow-sm transition-all bg-zinc-50 text-zinc-900 border-zinc-200 hover:bg-zinc-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#0055ff]"><User size={16} /></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase opacity-70 leading-none mb-1">Zarządzaj kontem</span>
                        <span className="text-lg font-black italic uppercase leading-none">Mój Profil</span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <button 
                    onClick={() => { setMobileMenuOpen(false); setIsAuthModalOpen(true); }}
                    className="w-full flex items-center justify-between p-5 rounded-3xl border shadow-sm transition-all bg-zinc-900 text-white border-zinc-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300"><User size={16} /></div>
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-black uppercase opacity-70 leading-none mb-1">Dołącz do nas</span>
                        <span className="text-lg font-black italic uppercase leading-none">Zaloguj się</span>
                      </div>
                    </div>
                  </button>
                )}

                <nav className="flex flex-col gap-1 mt-2">
                  {NAV_ITEMS.filter(item => item.name !== "Kolorowanki").map((item) => (
                    <Link 
                      key={item.name} 
                      href={item.href} 
                      onClick={() => { 
                        setMobileMenuOpen(false); 
                        trackEvent('mobile_nav_click', { name: item.name }); 
                      }} 
                      className="flex items-center gap-4 p-4 rounded-2xl text-lg font-black italic uppercase tracking-tighter hover:bg-zinc-50 text-zinc-800"
                    >
                      <item.icon size={20} className="text-zinc-400" />
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <hr className="border-zinc-100 my-2" />

                <div className="flex flex-col gap-3">
                  <Link 
                    href="/kolorowanki" 
                    onClick={() => { setMobileMenuOpen(false); trackEvent('mobile_cta_kolorowanki'); }} 
                    className="flex flex-col relative overflow-hidden p-6 rounded-4xl bg-zinc-900 text-white border border-zinc-800 shadow-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#BF2024]/40 to-[#0055ff]/40 opacity-80" />
                    <div className="relative flex items-center justify-between z-10 mb-2">
                       <div className="flex items-center gap-3">
                         <Palette size={24} className="text-yellow-400" />
                         <div className="font-black italic uppercase tracking-tighter text-xl">Studio Kreatywne</div>
                       </div>
                    </div>
                    <p className="relative z-10 text-[10px] font-bold uppercase text-zinc-300 opacity-90 leading-tight">
                      Twórzcie, bawcie się i zapisujcie najpiękniejsze wspólne chwile.
                    </p>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}