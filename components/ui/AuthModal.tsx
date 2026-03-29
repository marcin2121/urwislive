"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, Lock, User, Phone, ArrowRight, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { IconBrandGoogle, IconBrandFacebook } from "@tabler/icons-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 🚀 DODANE: Pozwala określić, która zakładka otworzy się jako pierwsza
  initialView?: 'login' | 'register' | 'forgot'; 
}

export default function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const supabase = createClient();
  const [view, setView] = useState<'login' | 'register' | 'forgot'>(initialView);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  // Zgody
  const [termsConsent, setTermsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // 🚀 DODANE: Kiedy modal się otwiera, zresetuj go do odpowiedniego widoku
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!supabase) throw new Error("Błąd konfiguracji usługi uwierzytelniania.");
      if (view === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw new Error("Nieprawidłowy email lub hasło.");
        onClose();
        window.location.reload();
      } 
      else if (view === 'register') {
        if (!termsConsent) throw new Error("Musisz zaakceptować regulamin, aby założyć konto.");
        if (phone && phone.length < 9) throw new Error("Jeśli podajesz numer telefonu, upewnij się, że jest poprawny.");
        
        const { error: signUpError } = await supabase.auth.signUp({
          email, password,
          options: { 
            data: { 
              full_name: name,
              phone: phone,
              marketing_consent: marketingConsent 
            } 
          },
        });
        if (signUpError) throw new Error(signUpError.message);
        setSuccessMessage("Konto utworzone! Możesz się teraz zalogować.");
        setView('login');
      } 
      else if (view === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/zmien-haslo`,
        });
        if (resetError) throw new Error(resetError.message);
        setSuccessMessage("Link do zresetowania hasła został wysłany na Twój e-mail!");
        setView('login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd logowania.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    setError(null);
    try {
      if (!supabase) throw new Error("Usługa niedostępna.");
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(`Błąd logowania przez ${provider === 'google' ? 'Google' : 'Facebook'}.`);
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[200000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto animate-zoom-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-zinc-50 p-6 flex justify-between items-center border-b border-zinc-100">
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-zinc-800">
              {view === 'login' ? "Witaj ponownie!" : view === 'register' ? "Dołącz do nas!" : "Reset hasła"}
            </h2>
            <button onClick={onClose} aria-label="Zamknij okno logowania" className="p-2 bg-white rounded-full shadow-sm text-zinc-400 hover:text-zinc-800 transition-colors">
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
              
              {/* POLA REJESTRACJI (OPCJONALNE) */}
              {view === 'register' && (
                <div className="flex flex-col gap-4 mb-2">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input type="text" placeholder="Imię (opcjonalnie)" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-zinc-800 focus:outline-none focus:border-[#0055ff] transition-all" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input type="tel" placeholder="Nr telefonu (opcjonalnie)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-zinc-800 focus:outline-none focus:border-[#0055ff] transition-all" />
                  </div>
                </div>
              )}

              {/* POLA WYMAGANE (EMAIL I HASŁO) */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input type="email" placeholder="Adres E-mail *" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-zinc-800 focus:outline-none focus:border-[#0055ff] transition-all" />
              </div>

              {view !== 'forgot' && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input type="password" placeholder="Hasło *" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-zinc-800 focus:outline-none focus:border-[#0055ff] transition-all" />
                </div>
              )}

              {view === 'login' && (
                <div className="text-right">
                  <button type="button" onClick={() => { setView('forgot'); setError(null); setSuccessMessage(null); }} className="text-xs text-zinc-500 hover:text-[#0055ff] font-bold">
                    Zapomniałeś hasła?
                  </button>
                </div>
              )}

              {/* ZGODY DLA REJESTRACJI */}
              {view === 'register' && (
                <div className="space-y-3 mt-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  {/* Zgoda obowiązkowa */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors ${termsConsent ? 'bg-[#0055ff] border-[#0055ff]' : 'border-zinc-300 group-hover:border-[#0055ff]'}`}>
                      {termsConsent && <Check size={14} className="text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={termsConsent} onChange={() => setTermsConsent(!termsConsent)} />
                    <span className="text-[10px] text-zinc-600 leading-tight">
                      Akceptuję <a href="/regulamin" target="_blank" className="text-[#0055ff] hover:underline">Regulamin sklepu</a> oraz Politykę Prywatności. <span className="text-red-500 font-bold">*</span>
                    </span>
                  </label>

                  {/* Zgoda opcjonalna */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors ${marketingConsent ? 'bg-green-500 border-green-500' : 'border-zinc-300 group-hover:border-green-500'}`}>
                      {marketingConsent && <Check size={14} className="text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={marketingConsent} onChange={() => setMarketingConsent(!marketingConsent)} />
                    <span className="text-[10px] text-zinc-600 leading-tight">
                      Chcę otrzymywać powiadomienia push o nowych promocjach, kuponach i nowościach w Sklepie Urwis.
                    </span>
                  </label>
                </div>
              )}

              <button disabled={isLoading} type="submit" className="w-full bg-[#0055ff] text-white rounded-2xl py-4 font-black uppercase text-sm tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer">
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
                  className="ml-1 text-[#0055ff] hover:underline uppercase tracking-wider cursor-pointer border-none bg-transparent"
                >
                  {view === 'login' ? "Załóż darmowe konto" : "Zaloguj się"}
                </button>
              </p>
            </div>

            {/* Informacja RODO / Cel aplikacji dla weryfikacji */}
            {view !== 'forgot' && (
              <div className="mt-5 pt-4 border-t border-zinc-100 text-center">
                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                  Logowanie pozwala na zapis stanu gry, zbieranie punktów oraz korzystanie z kuponów rabatowych.
                </p>
                <div className="flex justify-center gap-3 mt-2 text-[10px] font-bold text-zinc-400">
                  <Link href="/regulamin" className="hover:text-zinc-600 underline">Regulamin</Link>
                  <span>•</span>
                  <Link href="/polityka-prywatnosci" className="hover:text-zinc-600 underline">Polityka prywatności</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-zoom-in {
          animation: zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </>
  );
}