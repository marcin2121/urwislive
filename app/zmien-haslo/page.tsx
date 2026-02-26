// app/zmien-haslo/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Zabezpieczenie: sprawdzamy czy użytkownik faktycznie przyszedł z linku resetującego
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Brak autoryzacji do zmiany hasła. Link mógł wygasnąć.");
      }
    };
    checkSession();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne!");
      return;
    }
    if (password.length < 6) {
      setError("Hasło musi mieć minimum 6 znaków.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Zmiana hasła w Supabase
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
      // Wylogowujemy dla bezpieczeństwa, by wymusić zalogowanie nowym hasłem
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 flex justify-center bg-zinc-50 relative z-30">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-xl p-8 border border-zinc-100 h-fit"
      >
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 mb-2">
          Zmiana hasła
        </h1>
        
        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="font-bold text-zinc-800 mb-2">Hasło zostało zmienione!</p>
            <p className="text-sm text-zinc-500">Za chwilę wrócisz na stronę główną, gdzie możesz się zalogować.</p>
            <Link href="/" className="mt-6 inline-block text-[#0055ff] font-bold text-sm hover:underline">
              Wróć do sklepu ręcznie
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-500 mb-6">Wpisz i potwierdź swoje nowe hasło poniżej.</p>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="password" 
                  placeholder="Nowe hasło" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-zinc-800 focus:outline-none focus:border-[#0055ff] focus:ring-2 focus:ring-[#0055ff]/20 transition-all" 
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="password" 
                  placeholder="Potwierdź nowe hasło" 
                  required 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-zinc-800 focus:outline-none focus:border-[#0055ff] focus:ring-2 focus:ring-[#0055ff]/20 transition-all" 
                />
              </div>

              <button 
                disabled={isLoading} 
                type="submit" 
                className="w-full bg-[#0055ff] text-white rounded-2xl py-4 font-black uppercase text-sm tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Zapisz nowe hasło"}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}