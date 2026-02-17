"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import AuthModal from "@/components/AuthModal";
import {
  Home,
  Phone,
  Target,
  Trophy,
  Gamepad2,
  Brain,
  Bell,
  BellRing,
  LogOut,
  User,
  Shield,
  ChevronDown,
  ShoppingBag,
  Percent,
  Sparkles,
  Grid,
  Coffee,
  Info,
  BadgePercent,
  Rocket,
  Crown
} from "lucide-react";

const NAV_STRUCTURE = [
  { name: "Home", href: "/", icon: Home, type: "link" },
  {
    name: "Urwis",
    icon: ShoppingBag,
    type: "dropdown",
    items: [
      { name: "Pełna Oferta", href: "/oferta", icon: Grid },
      { name: "Promocje", href: "/oferta/promocje", icon: Percent, highlight: true },
      { name: "O nas", href: "/o-nas", icon: Info },
    ]
  },
  { 
    name: "Lecę w Kulki", 
    href: "/salazabaw", 
    icon: Coffee, // Pasuje do Kawiarni i Sali Zabaw
    type: "link" 
  },
  {
    name: "Klub Urwisa",
    icon: Gamepad2,
    type: "dropdown",
    items: [
      { name: "Misje", href: "/misje", icon: Target },
      { name: "Nagrody", href: "/nagrody", icon: Trophy },
      { name: "Gry", href: "/gry", icon: Sparkles },
      { name: "Quiz", href: "/quiz", icon: Brain },
      { 
        name: "System Profitów", 
        href: "/system", 
        icon: BadgePercent, 
        highlight: true,
        description: "1 Złoty Urwis = 1 zł" 
      },
    ]
  },
  { name: "Kontakt", href: "/kontakt", icon: Phone, type: "link" }
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, session, signOut } = useSupabaseAuth();
  
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadRewards, setHasUnreadRewards] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleGlobalAuthRequest = (event: any) => {
      if (!session) {
        setAuthView("register");
        setShowAuthModal(true);
      }
    };
    window.addEventListener('open-auth-modal', handleGlobalAuthRequest);
    return () => window.removeEventListener('open-auth-modal', handleGlobalAuthRequest);
  }, [session]);

  const isAuthenticated = !!session;

  const handleMouseEnter = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 300);
  };

  const handleOpenAuth = (view: "login" | "register") => {
    setAuthView(view);
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
    router.push('/');
  };

  const NavItem = ({ item }: { item: any }) => {
    const isDropdown = item.type === "dropdown";
    const isActive = isDropdown 
      ? item.items.some((sub: any) => pathname === sub.href)
      : pathname === item.href;
    const isOpen = activeDropdown === item.name;

    if (isDropdown) {
      return (
        <div 
          className="relative group h-full flex items-center"
          onMouseEnter={() => handleMouseEnter(item.name)}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
              isActive || isOpen ? "bg-black text-white shadow-md" : "text-zinc-500 hover:text-black hover:bg-black/5"
            }`}
          >
            <item.icon size={16} strokeWidth={2.5} />
            {item.name}
            <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="absolute top-full left-1/2 -translate-x-1/2 pt-6 -mt-2 w-64 z-50"
              >
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-black/5 overflow-hidden p-2">
                  {item.items.map((subItem: any) => (
                    <Link
                      key={subItem.href} href={subItem.href} onClick={() => setActiveDropdown(null)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        pathname === subItem.href ? "bg-black/5 text-black font-bold" : "text-zinc-500 hover:text-black hover:bg-zinc-50"
                      } ${subItem.highlight ? "text-[#BF2024]" : ""}`}
                    >
                      <div className={`p-1.5 rounded-lg ${subItem.highlight ? "bg-red-50 text-red-600" : "bg-zinc-100 text-zinc-500"}`}>
                        <subItem.icon size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm leading-none">{subItem.name}</span>
                        {subItem.description && (
                          <span className="text-[10px] opacity-70 font-medium mt-1 uppercase tracking-tight">{subItem.description}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        href={item.href}
        className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
          isActive ? "bg-black text-white shadow-md transform scale-105" : "text-zinc-500 hover:text-black hover:bg-black/5"
        }`}
      >
        <item.icon size={16} strokeWidth={2.5} />
        {item.name}
      </Link>
    );
  };

  return (
    <>
      <motion.div
        initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 md:top-6 left-0 md:left-1/2 md:-translate-x-1/2 w-full md:w-auto md:min-w-[950px] z-50 px-4 md:px-0 font-body"
      >
        <div className="flex items-center justify-between gap-6 bg-white/80 backdrop-blur-xl md:rounded-full px-6 py-3 shadow-lg border border-white/20">
          <Link href="/" className="flex items-center shrink-0 hover:scale-105 transition-transform">
            <Image src="/logo.png" alt="Urwis Logo" width={42} height={42} className="object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-1 font-heading">
            {NAV_STRUCTURE.map((item, index) => <NavItem key={index} item={item} />)}
          </nav>

          <div className="flex items-center gap-3 md:ml-auto">
            {!mounted ? (
              <div className="w-24 h-10 bg-gray-100 animate-pulse rounded-full" />
            ) : isAuthenticated ? (
              <>
                {/* Wyświetlanie stanu konta Złotych Urwisów, jeśli profil posiada te dane */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full">
                  <Crown size={14} className="text-amber-500" />
                  <span className="text-xs font-black text-amber-700">{profile?.points || 0} zł</span>
                </div>
                
                <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 rounded-full hover:bg-black/5">
                  {hasUnreadRewards ? <BellRing size={20} className="text-orange-500 animate-bounce" /> : <Bell size={20} className="text-zinc-600" />}
                </button>
                <Link
                  href="/profil"
                  className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 text-white hover:bg-black transition-all text-sm font-bold shadow-md"
                >
                  {profile?.role === 'admin' ? <Shield size={16} className="text-blue-400" /> : <User size={16} />}
                  {profile?.username || "Profil"}
                </Link>
                <button onClick={handleSignOut} className="p-2.5 rounded-full text-zinc-400 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => handleOpenAuth("login")} className="px-5 py-2.5 text-sm font-bold text-zinc-600 hover:text-black">Zaloguj</button>
                <button onClick={() => handleOpenAuth("register")} className="px-6 py-2.5 text-sm font-bold bg-black text-white rounded-full hover:scale-105 transition-all shadow-md">Dołącz</button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultView={authView} />
    </>
  );
}