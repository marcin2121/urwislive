"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, User, Phone, CheckCircle, ShieldCheck, Coins } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, session } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    const fetchLoyaltyData = async () => {
      if (user.user_metadata?.phone) {
        const { data } = await supabase
          .from("loyalty_cards")
          .select("points")
          .eq("phone_number", user.user_metadata.phone)
          .maybeSingle();
        
        if (data) setPoints(data.points);
        else setPoints(0);
      }
      setLoading(false);
    };

    fetchLoyaltyData();
  }, [user, router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center pt-24 z-50 relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0055ff]"></div>
      </div>
    );
  }

  return (
    // 🚀 FIX: Dodałem solidne tło (bg-zinc-50) oraz relative i z-50, 
    // aby całkowicie odciąć się od przezroczystości layout.tsx
    <div className="min-h-screen pt-28 pb-12 px-4 flex justify-center bg-zinc-50 relative z-30">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900">Mój Profil</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold text-sm uppercase bg-white border border-red-100 shadow-sm px-4 py-2 rounded-xl transition-colors">
            <LogOut size={16} /> Wyloguj
          </button>
        </div>

        {/* Karta Lojalnościowa */}
        <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <p className="text-amber-100 font-bold uppercase tracking-widest text-xs mb-1">Sklep Urwis Club</p>
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase">Twoje Złote Urwisy</h2>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 flex items-center gap-4 shrink-0">
              <Coins size={32} className="text-yellow-100" />
              <div className="flex flex-col">
                <span className="text-4xl font-black leading-none">{points !== null ? points : "..."}</span>
                <span className="text-[10px] uppercase font-bold text-amber-100 mt-1">Zebranych Punktów</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dane Klienta i Zgody */}
        <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-6 sm:p-8 space-y-8">
          
          <div>
            <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User size={16} /> Dane Klienta
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
                  <Phone size={14} className="text-[#0055ff]" />
                  {user.user_metadata?.phone || "Brak danych"}
                </p>
              </div>
            </div>
          </div>

          <hr className="border-zinc-100" />

          <div>
            <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck size={16} /> Zgody i Prywatność
            </h3>
            
            <div className="flex items-start gap-4 p-4 rounded-2xl border border-green-200 bg-green-50 text-green-800">
              <CheckCircle size={24} className="text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-sm uppercase mb-1">Zgoda Marketingowa Aktywna</p>
                <p className="text-xs font-medium opacity-80 leading-relaxed">
                  Dzięki tej zgodzie możesz zbierać punkty lojalnościowe w Sklepie Urwis. Zgadzasz się na to, abyśmy informowali Cię o najnowszych promocjach na podany numer telefonu lub e-mail.
                </p>
              </div>
            </div>
            
            <p className="text-[10px] text-zinc-400 font-medium mt-4 text-center">
              Aby zmienić zgody marketingowe lub zaktualizować numer telefonu, skontaktuj się z obsługą sklepu przy kasie.
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}