"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, User, Phone, CheckCircle, ShieldCheck, Settings, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import PushButton from "@/components/ui/PushButton";

type TabType = "dane" | "ustawienia";

export default function ProfilePage() {
  const { user } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("dane");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [updatingConsent, setUpdatingConsent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    if (user.user_metadata?.marketing_consent !== undefined) {
      setMarketingConsent(user.user_metadata.marketing_consent);
    }
    
    setLoading(false);
  }, [user, router]);

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

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center pt-24 z-50 relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-urwis-blue"></div>
      </div>
    );
  }

  const tabs = [
    { id: "dane", label: "Moje Dane", icon: User },
    { id: "ustawienia", label: "Ustawienia i Zgody", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 flex justify-center bg-zinc-50 relative z-30">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900">Mój Profil</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold text-sm uppercase bg-white border border-red-100 shadow-sm px-4 py-2 rounded-xl transition-colors">
            <LogOut size={16} /> Wyloguj
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
                {/* Powiadomienia */}
                <div>
                  <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Bell size={16} /> Powiadomienia w aplikacji
                  </h3>
                  <div className="bg-zinc-50 p-5 rounded-3xl border border-zinc-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <p className="font-black text-sm uppercase text-zinc-800 mb-1">Powiadomienia Push</p>
                      <p className="text-xs text-zinc-500 font-medium">Otrzymuj alerty o błyskawicznych wyprzedażach klocków LEGO i nowościach w ofercie.</p>
                    </div>
                    <div className="shrink-0">
                      <PushButton />
                    </div>
                  </div>
                </div>

                <hr className="border-zinc-100" />

                {/* Zgody marketingowe */}
                <div>
                  <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldCheck size={16} /> Prywatność i Rabaty
                  </h3>
                  <div className={`flex flex-col sm:flex-row items-start gap-4 p-5 rounded-3xl border transition-colors ${marketingConsent ? 'border-green-200 bg-green-50' : 'border-zinc-200 bg-zinc-50'}`}>
                    <div className="mt-1 hidden sm:block">
                      {marketingConsent ? <CheckCircle size={28} className="text-green-500" /> : <ShieldCheck size={28} className="text-zinc-400" />}
                    </div>
                    <div className="flex-1 w-full">
                      <p className={`font-black text-sm uppercase mb-1 ${marketingConsent ? 'text-green-800' : 'text-zinc-700'}`}>
                        {marketingConsent ? "Zgoda Marketingowa Aktywna" : "Zgoda Marketingowa Nieaktywna"}
                      </p>
                      <p className="text-xs font-medium text-zinc-600 opacity-80 leading-relaxed mb-4">
                        {marketingConsent 
                          ? "Masz dostęp do ukrytych rabatów i ofert specjalnych dla członków Sklep Urwis Club!" 
                          : "Obecnie nie masz dostępu do ukrytych rabatów. Włącz zgodę, aby odblokować kody zniżkowe widoczne w zakładce Rabaty."}
                      </p>
                      <button 
                        onClick={toggleMarketingConsent}
                        disabled={updatingConsent}
                        className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs uppercase transition-all flex justify-center items-center gap-2 ${marketingConsent ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-500 text-white hover:bg-green-600 shadow-md shadow-green-500/30'}`}
                      >
                        {updatingConsent ? "Zapisywanie..." : (marketingConsent ? "Zrezygnuj z rabatów" : "Odblokuj Rabaty i Promocje")}
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