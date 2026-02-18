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
  LogOut,
  User,
  ChevronDown,
  ShoppingBag,
  Percent,
  Sparkles,
  Grid,
  Coffee,
  Info,
  BadgePercent,
  Menu,
  X
} from "lucide-react";

// --- TYPY ---
interface NavSubItem {
  name: string;
  href: string;
  icon: any;
  highlight?: boolean;
}

interface NavItem {
  name: string;
  href?: string;
  icon: any;
  type: "link" | "dropdown";
  items?: NavSubItem[];
}

const DARK_ROUTES = ["/profil", "/system", "/ustawienia", "/salazabaw", "/profil/zrealizuj"];

const NAV_STRUCTURE: NavItem[] = [
  { name: "Home", href: "/", icon: Home, type: "link" },
  {
    name: "Sklep",
    icon: ShoppingBag,
    type: "dropdown",
    items: [
      { name: "Pełna Oferta", href: "/oferta", icon: Grid },
      { name: "Promocje", href: "/oferta/promocje", icon: Percent, highlight: true },
      { name: "O nas", href: "/o-nas", icon: Info },
    ]
  },
  { name: "Lecę w Kulki", href: "/salazabaw", icon: Coffee, type: "link" },
  {
    name: "Klub Urwisa",
    icon: Gamepad2,
    type: "dropdown",
    items: [
      { name: "Misje", href: "/misje", icon: Target },
      { name: "Nagrody", href: "/nagrody", icon: Trophy },
      { name: "Gry", href: "/gry", icon: Sparkles },
      { name: "Quiz", href: "/quiz", icon: Brain },
      { name: "Zrealizuj Kod", href: "/profil/zrealizuj", icon: BadgePercent },
    ]
  },
  { name: "Kontakt", href: "/kontakt", icon: Phone, type: "link" }
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, session, signOut } = useSupabaseAuth();
  
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const isDarkPage = DARK_ROUTES.some(route => pathname === route || pathname.startsWith(route));

  useEffect(() => {
    setMounted(true);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const navBg = isDarkPage ? "bg-zinc-900/80 border-white/10" : "bg-white/80 border-black/5";
  const textColor = isDarkPage ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-black";
  const activeStyle = isDarkPage ? "bg-white text-black shadow-lg shadow-white/10" : "bg-black text-white shadow-lg shadow-black/10";

  if (!mounted) return null;

  return (
    <>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 md:top-6 left-0 md:left-1/2 md:-translate-x-1/2 w-full md:w-auto md:min-w-[850px] z-50 px-0 md:px-0"
      >
        <div className={`flex items-center justify-between gap-4 ${navBg} backdrop-blur-xl md:rounded-full px-4 md:px-6 py-3 md:py-3 shadow-2xl border-b md:border transition-all duration-500`}>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2.5 rounded-xl transition-colors ${isDarkPage ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-black'}`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/" className="shrink-0 hover:scale-105 transition-transform active:scale-95">
              <Image src="/logo.png" alt="Urwis Logo" width={38} height={38} className={isDarkPage ? "brightness-125" : ""} />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_STRUCTURE.map((item) => (
              <div 
                key={item.name}
                className="relative"
                onMouseEnter={() => item.type === "dropdown" && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.type === "dropdown" ? (
                  <>
                    <button className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${activeDropdown === item.name || item.items?.some(s => pathname === s.href) ? activeStyle : textColor}`}>
                      <item.icon size={15} /> {item.name} <ChevronDown size={12} className={`transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-full left-0 pt-3 w-52">
                          <div className={`${isDarkPage ? 'bg-zinc-900 border-white/10' : 'bg-white border-black/5'} backdrop-blur-2xl rounded-2xl shadow-2xl border p-2`}>
                            {item.items?.map((sub) => (
                              <Link key={sub.href} href={sub.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${pathname === sub.href ? (isDarkPage ? 'bg-white/10 text-white' : 'bg-black/5 text-black') : textColor}`}>
                                <sub.icon size={14} className={sub.highlight ? "text-red-500" : ""} /> {sub.name}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link href={item.href || "/"} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${pathname === item.href ? activeStyle : textColor}`}>
                    <item.icon size={15} /> {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            {session ? (
              <>
                <Link href="/profil" className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-[11px] md:text-xs uppercase tracking-widest transition-all ${isDarkPage ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-black"}`}>
                  <User size={14} /> <span className="hidden sm:inline">{profile?.username || "Agent"}</span>
                </Link>
                <button onClick={handleSignOut} className={`p-2 rounded-full transition-colors ${isDarkPage ? "text-zinc-500 hover:text-red-400" : "text-zinc-400 hover:text-red-500"}`}>
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1">
                <button onClick={() => { setAuthView("login"); setShowAuthModal(true); }} className={`px-3 md:px-5 py-2 text-[11px] md:text-xs font-black uppercase tracking-widest ${textColor}`}>Zaloguj</button>
                <button onClick={() => { setAuthView("register"); setShowAuthModal(true); }} className={`px-4 md:px-6 py-2 text-[11px] md:text-xs font-black uppercase tracking-widest rounded-full transition-all active:scale-95 ${isDarkPage ? "bg-white text-black" : "bg-black text-white"}`}>Dołącz</button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* MENU MOBILNE */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-48 md:hidden ${isDarkPage ? 'bg-zinc-950/98' : 'bg-white/98'} backdrop-blur-3xl pt-24 px-8`}
          >
            <nav className="flex flex-col gap-1 overflow-y-auto max-h-[80vh] pb-10">
              {NAV_STRUCTURE.map((item, idx) => (
                <motion.div 
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  {item.type === "dropdown" ? (
                    <div className="py-4 border-b border-zinc-500/10">
                      <div className={`flex items-center gap-3 mb-4 text-[13px] font-black uppercase tracking-[0.2em] opacity-70 ${isDarkPage ? 'text-white' : 'text-black'}`}>
                        <item.icon size={16} /> {item.name}
                      </div>
                      <div className="grid grid-cols-1 gap-2 ml-4">
                        {item.items?.map((sub) => (
                          <Link key={sub.href} href={sub.href} className={`py-2 text-xl font-black italic uppercase tracking-tighter ${pathname === sub.href ? 'text-blue-500' : (isDarkPage ? 'text-white' : 'text-zinc-900')}`}>
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link href={item.href || "/"} className={`flex items-center gap-4 py-6 border-b border-zinc-500/10 text-3xl font-black italic uppercase tracking-tighter ${pathname === item.href ? 'text-blue-500' : (isDarkPage ? 'text-white' : 'text-zinc-900')}`}>
                      <item.icon size={24} /> {item.name}
                    </Link>
                  )}
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultView={authView} />
    </>
  );
}