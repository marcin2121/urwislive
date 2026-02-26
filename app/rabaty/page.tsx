"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { motion } from "framer-motion";
import Link from "next/link";
import { BadgePercent, LockKeyhole, ArrowRight } from "lucide-react";

export default function RabatyPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const hasConsent = user?.user_metadata?.marketing_consent === true;

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 flex justify-center bg-zinc-50 relative z-30">
      <div className="w-full max-w-3xl space-y-6">
        
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-900 text-center mb-8">
          Strefa Rabatów
        </h1>

        {!user ? (
          // STAN 1: Niezalogowany
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2rem] shadow-xl border border-zinc-100 text-center">
            <LockKeyhole size={48} className="mx-auto text-zinc-300 mb-4" />
            <h2 className="text-2xl font-black text-zinc-800 mb-2">Zaloguj się, by zobaczyć rabaty</h2>
            <p className="text-zinc-500 mb-6 max-w-md mx-auto">Dostęp do unikalnych kodów rabatowych i promocji mają tylko zarejestrowani członkowie Sklep Urwis Club.</p>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Skorzystaj z menu, aby się zalogować</p>
          </motion.div>
        ) : !hasConsent ? (
          // STAN 2: Zalogowany, ale bez zgody marketingowej
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2rem] shadow-xl border border-red-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-orange-500" />
            <BadgePercent size={56} className="mx-auto text-red-400 mb-4" />
            <h2 className="text-2xl font-black text-zinc-800 mb-2">Strefa Zablokowana</h2>
            <p className="text-zinc-500 mb-6 max-w-md mx-auto">
              Aby uzyskać dostęp do kodów rabatowych, musisz wyrazić zgodę na otrzymywanie ofert w swoim profilu. Zrób to teraz i oszczędzaj na zakupach!
            </p>
            <Link href="/profil" className="inline-flex items-center gap-2 px-8 py-4 bg-[#0055ff] text-white font-black uppercase text-sm rounded-full shadow-lg hover:scale-105 transition-transform">
              Przejdź do profilu <ArrowRight size={18} />
            </Link>
          </motion.div>
        ) : (
          // STAN 3: Zalogowany ze zgodą (Właściwa zawartość)
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* PRZYKŁADOWY KOD RABATOWY */}
            <div className="bg-gradient-to-br from-[#0055ff] to-blue-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-blue-100 font-bold uppercase tracking-widest text-xs mb-1">Tylko w aplikacji</p>
                <h3 className="text-3xl font-black italic uppercase">-10% na całe LEGO!</h3>
                <p className="text-blue-50 text-sm mt-2">Pokaż ten kod sprzedawcy przy kasie.</p>
              </div>
              <div className="bg-white text-zinc-900 px-6 py-4 rounded-3xl border-4 border-blue-400/50 flex flex-col items-center shrink-0">
                <span className="text-[10px] uppercase font-black text-zinc-400 mb-1">KOD RABATOWY</span>
                <span className="text-2xl font-black tracking-widest uppercase">URWIS10</span>
              </div>
            </div>
            
            {/* Tutaj możesz mapować kody ze swojej bazy danych */}
            
          </motion.div>
        )}
      </div>
    </div>
  );
}