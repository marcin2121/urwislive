"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Phone, ArrowRight, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const supabase = createClient();
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (view === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw new Error("Nieprawidłowy email lub hasło.");
        onClose();
        window.location.reload();
      } 
      else if (view === 'register') {
        if (!consent) throw new Error("Musisz zaakceptować regulamin i zgody.");
        if (phone.length < 9) throw new Error("Podaj poprawny numer telefonu (potrzebny do punktów).");
        
        const { error: signUpError } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name, phone: phone, marketing_consent: consent } },
        });
        if (signUpError) throw new Error(signUpError.message);
        setSuccessMessage("Konto utworzone! Możesz się teraz zalogować.");
        setView('login');
      } 
      else if (view === 'forgot') {
        // --- LOGIKA WYSYŁANIA LINKU DO RESETU ---
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          // 🚀 KLUCZOWE: Wymuszamy przekierowanie na naszą nową stronę
          redirectTo: `${window.location.origin}/zmien-haslo`,
        });
        if (resetError) throw new Error(resetError.message);
        setSuccessMessage("Link do zresetowania hasła został wysłany na Twój e-mail!");
        setView('login');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 20, scale: 0.95 }}
          className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-zinc-50 p-6 flex justify-between items-center border-b border-zinc-100">
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-zinc-800">
              {view === 'login' ? "Witaj ponownie!" : view === 'register' ? "Dołącz do nas!" : "Reset hasła"}
            </h2>
            <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm text-zinc-400 hover:text-zinc-800 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 md:p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 text-green-600 text-xs font-bold rounded-xl border border-green-100 text-center">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {view === 'register' && (
                <>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input type="text" placeholder="Imię i nazwisko" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-zinc-800 focus:outline-none focus:border-[#0055ff] transition-all" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input type="tel" placeholder="Numer telefonu (do punktów)" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-zinc-800 focus:outline-none focus:border-[#0055ff] transition-all" />
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input type="email" placeholder="Adres E-mail" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-zinc-800 focus:outline-none focus:border-[#0055ff] transition-all" />
              </div>

              {view !== 'forgot' && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input type="password" placeholder="Hasło" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-zinc-800 focus:outline-none focus:border-[#0055ff] transition-all" />
                </div>
              )}

              {view === 'login' && (
                <div className="text-right">
                  <button type="button" onClick={() => { setView('forgot'); setError(null); setSuccessMessage(null); }} className="text-xs text-zinc-500 hover:text-[#0055ff] font-bold">
                    Zapomniałeś hasła?
                  </button>
                </div>
              )}

              {view === 'register' && (
                <label className="flex items-start gap-3 mt-4 cursor-pointer group">
                  <div className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors ${consent ? 'bg-[#0055ff] border-[#0055ff]' : 'border-zinc-300 group-hover:border-[#0055ff]'}`}>
                    {consent && <Check size={14} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={consent} onChange={() => setConsent(!consent)} />
                  <span className="text-[10px] text-zinc-500 leading-tight">
                    Akceptuję regulamin sklepu oraz wyrażam zgodę na przetwarzanie danych w celu obsługi programu lojalnościowego Sklep Urwis.
                  </span>
                </label>
              )}

              <button disabled={isLoading} type="submit" className="w-full bg-[#0055ff] text-white rounded-2xl py-4 font-black uppercase text-sm tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2">
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : view === 'login' ? "Zaloguj się" : view === 'register' ? "Zarejestruj się" : "Wyślij link"}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-zinc-500 font-bold">
                {view === 'login' ? "Nie masz konta?" : "Wróć do logowania"}
                <button 
                  type="button"
                  onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(null); setSuccessMessage(null); }} 
                  className="ml-1 text-[#0055ff] hover:underline uppercase tracking-wider"
                >
                  {view === 'login' ? "Zarejestruj się" : "Zaloguj się"}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}