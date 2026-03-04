"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import {
  LogOut, User, Phone, CheckCircle, ShieldCheck, Settings, Bell,
  Gift, Sparkles, Tag, Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import PushButton from "@/components/ui/PushButton";
import AuthModal from "@/components/ui/AuthModal";

type TabType = "dane" | "ustawienia";

// ---- WIDOK GOŚCIA (niezalogowany) ----
function GuestView() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const benefits = [
    { icon: Tag, label: "Kody rabatowe i kupony", color: "text-amber-500", bg: "bg-amber-50" },
    { icon: Bell, label: "Powiadomienia o nowościach LEGO", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Gift, label: "Koło Fortuny z nagrodami", color: "text-amber-500", bg: "bg-amber-50" },
    { icon: Heart, label: "Urwisek — wirtualny pupil", color: "text-pink-500", bg: "bg-pink-50" },
  ];

  return (
    <>
      <div className="min-h-screen pt-28 pb-12 px-4 flex justify-center bg-zinc-50 relative z-30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Hero */}
          <div className="bg-white border border-zinc-200 shadow-sm rounded-4xl p-8 text-center relative overflow-hidden">
            {/* Dekoracja */}
            <div className="absolute top-4 right-4 text-blue-100 rotate-12 pointer-events-none">
              <Sparkles size={60} />
            </div>

            <div className="relative w-40 h-40 mx-auto mb-4 drop-shadow-lg">
              <Image
                src="/urwis-proszący.webp"
                alt="Maskotka Urwis zaprasza do rejestracji"
                fill
                className="object-contain"
                priority
              />
            </div>

            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 mb-2">
              Hej, tu Urwis! 👋
            </h1>
            <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-6">
              Zaloguj się, żeby odblokować rabaty, gry i&nbsp;powiadomienia o&nbsp;nowych zestawach LEGO. Nic na siłę&nbsp;—&nbsp;ale warto!
            </p>

            <button
              onClick={() => setIsAuthOpen(true)}
              className="w-full bg-urwis-blue text-white font-black text-base py-4 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase italic tracking-tight"
            >
              Zaloguj się lub załóż konto
            </button>
          </div>

          {/* Korzyści */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2">Co Ci to daje?</p>
            <div className="grid grid-cols-2 gap-2">
              {benefits.map((b) => (
                <div
                  key={b.label}
                  className={`${b.bg} border border-white/60 rounded-2xl p-4 flex flex-col items-center text-center gap-2`}
                >
                  <b.icon size={24} className={b.color} />
                  <span className="text-[11px] font-bold text-zinc-700 leading-tight">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cicha informacja */}
          <p className="text-[10px] text-zinc-400 text-center font-medium px-4 leading-relaxed">
            Konto jest darmowe i opcjonalne. Strona działa tak samo bez logowania
            — po prostu nie zobaczysz ukrytych rabatów i gier.
          </p>
        </motion.div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

// ---- WIDOK ZALOGOWANEGO UŻYTKOWNIKA ----
export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<TabType>("dane");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [updatingConsent, setUpdatingConsent] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.marketing_consent !== undefined) {
      setMarketingConsent(user.user_metadata.marketing_consent);
    }
  }, [user]);

  const toggleMarketingConsent = async () => {
    setUpdatingConsent(true);
    const newConsent = !marketingConsent;
    const { error } = await supabase.auth.updateUser({
      data: { marketing_consent: newConsent }
    });
    if (!error) {
      setMarketingConsent(newConsent);
    }
    setUpdatingConsent(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center pt-24 z-50 relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-urwis-blue"></div>
      </div>
    );
  }

  // Gość — przyjazny widok z zaproszeniem
  if (!user) {
    return <GuestView />;
  }

  // ---- ZALOGOWANY ----
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Użytkownik";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("pl-PL", { month: "long", year: "numeric" })
    : null;

  const tabs = [
    { id: "dane", label: "Moje Dane", icon: User },
    { id: "ustawienia", label: "Ustawienia", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 flex justify-center bg-zinc-50 relative z-30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-6"
      >
        {/* Nagłówek profilu z avatarem */}
        <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-urwis-blue to-[#BF2024] flex items-center justify-center text-white font-black text-xl italic shadow-lg shadow-blue-500/20 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-zinc-900 truncate">
              {displayName}
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {memberSince && (
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Urwis od {memberSince}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 font-bold text-xs uppercase bg-white border border-zinc-200 shadow-sm px-4 py-2.5 rounded-xl transition-colors shrink-0"
          >
            <LogOut size={14} /> Wyloguj
          </button>
        </div>

        {/* Nawigacja zakładek */}
        <div className="flex space-x-1 bg-white p-1 rounded-2xl border border-zinc-200 shadow-sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wide transition-all ${
                  isActive ? "bg-urwis-blue text-white shadow-md" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                }`}
              >
                <tab.icon size={16} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Treść zakładek z animacją */}
        <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-6 sm:p-8 min-h-[350px]">
          <AnimatePresence mode="wait">

            {/* ZAKŁADKA 1: DANE */}
            {activeTab === "dane" && (
              <motion.div
                key="dane"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <User size={16} /> Podstawowe informacje
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Imię i Nazwisko</p>
                    <p className="font-black text-zinc-800">{user.user_metadata?.full_name || "Brak danych"}</p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Adres E-mail</p>
                    <p className="font-black text-zinc-800">{user.email}</p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 md:col-span-2">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Numer Telefonu</p>
                    <p className="font-black text-zinc-800 flex items-center gap-2">
                      <Phone size={14} className="text-urwis-blue" />
                      {user.user_metadata?.phone || "Brak danych"}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 text-center">
                   <Link href="/zmien-haslo" className="text-xs font-bold text-zinc-500 hover:text-urwis-blue transition-colors underline underline-offset-2">
                     Chcesz zmienić hasło? Kliknij tutaj.
                   </Link>
                </div>
              </motion.div>
            )}

            {/* ZAKŁADKA 2: USTAWIENIA (ZGODY + PUSH) */}
            {activeTab === "ustawienia" && (
              <motion.div
                key="ustawienia"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* 1. Powiadomienia Push przeglądarki */}
                <div>
                  <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Bell size={16} /> Powiadomienia Push
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-medium mb-4 pl-6">
                    Banery na ekranie telefonu / komputera — wysyłane przez przeglądarkę, gdy pojawią się nowe promocje.
                  </p>
                  <div className="bg-zinc-50 p-5 rounded-3xl border border-zinc-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <p className="font-black text-sm uppercase text-zinc-800 mb-1">Zezwolenie przeglądarki</p>
                      <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                        Włącz, żeby dostawać baner na ekranie gdy pojawią się nowe zestawy LEGO lub błyskawiczne wyprzedaże — nawet bez otwierania strony.
                      </p>
                    </div>
                    <div className="shrink-0">
                      <PushButton />
                    </div>
                  </div>
                </div>

                <hr className="border-zinc-100" />

                {/* 2. Zgoda marketingowa (kupony i rabaty) */}
                <div>
                  <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <ShieldCheck size={16} /> Promocje i Kupony
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-medium mb-4 pl-6">
                    Zgoda na wysyłkę informacji o nowościach i rabatach — wymagana, żeby Koło Fortuny mogło Ci przyznawać kupony.
                  </p>
                  <div className={`flex flex-col sm:flex-row items-start gap-4 p-5 rounded-3xl border transition-colors ${marketingConsent ? 'border-green-200 bg-green-50' : 'border-zinc-200 bg-zinc-50'}`}>
                    <div className="mt-1 hidden sm:block">
                      {marketingConsent ? <CheckCircle size={28} className="text-green-500" /> : <ShieldCheck size={28} className="text-zinc-400" />}
                    </div>
                    <div className="flex-1 w-full">
                      <p className={`font-black text-sm uppercase mb-1 ${marketingConsent ? 'text-green-800' : 'text-zinc-700'}`}>
                        {marketingConsent ? "Zgoda aktywna ✓" : "Zgoda nieaktywna"}
                      </p>
                      <p className="text-xs font-medium text-zinc-600 leading-relaxed mb-4">
                        {marketingConsent 
                          ? "Masz włączoną zgodę — Koło Fortuny może Ci przyznawać kupony, a my możemy informować Cię o nowych promocjach." 
                          : "Bez tej zgody nie możemy wysyłać Ci kuponów z Koła Fortuny ani informacji o nowych promocjach."}
                      </p>
                      <button 
                        onClick={toggleMarketingConsent}
                        disabled={updatingConsent}
                        className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs uppercase transition-all flex justify-center items-center gap-2 ${marketingConsent ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200' : 'bg-green-500 text-white hover:bg-green-600 shadow-md shadow-green-500/30'}`}
                      >
                        {updatingConsent ? "Zapisywanie..." : (marketingConsent ? "Wycofaj zgodę" : "Wyrażam zgodę")}
                      </button>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}