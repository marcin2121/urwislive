'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { 
  X, Loader2, Mail, Lock, User, Zap, Star 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, defaultView = 'login' }: AuthModalProps) {
  // ✅ FIX: Pobieramy tylko 'supabase' (i opcjonalnie session/loading), bez signIn/signUp
  const { supabase } = useSupabaseAuth();
  
  const [view, setView] = useState<'login' | 'register'>(defaultView);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setView(defaultView);
      setError(null);
      setEmail('');
      setUsername('');
      setPassword('');
    }
  }, [isOpen, defaultView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (view === 'register') {
        // --- LOGIKA REJESTRACJI (zgodna z /register/page.tsx) ---
        if (password.length < 6) throw new Error('Hasło musi mieć minimum 6 znaków.');
        
        // 1. Rejestracja w Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: username } }
        });
        
        if (authError) throw authError;

        if (authData.user) {
          // 2. Tworzenie profilu z bonusem 50 pkt
          // Używamy insert, bo to nowy użytkownik. 
          // W razie czego (gdyby trigger bazy już zadziałał) upsert by nie zaszkodził, ale trzymamy się logiki z page.tsx
          const { error: profileError } = await supabase.from('profiles').insert([{ 
             id: authData.user.id,
             username: username,
             email: email,
             points: 50, // BONUS NA START!
             role: 'user'
          }]);

          if (profileError) {
             console.error("Błąd tworzenia profilu:", profileError);
             // Kontynuujemy, bo konto Auth powstało
          }

          onClose();
        }

      } else {
        // --- LOGIKA LOGOWANIA (zgodna z /login/page.tsx) ---
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Wystąpił błąd. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-[420px] rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative"
        >
            {/* Tło dekoracyjne */}
            {view === 'login' ? (
                <>
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-100/40 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-red-100/40 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                </>
            ) : (
                <>
                    <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-yellow-100/40 rounded-full blur-[80px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-100/40 rounded-full blur-[80px] translate-y-1/2 translate-x-1/2 pointer-events-none" />
                </>
            )}

          {/* Przycisk Zamknij */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors z-20"
          >
            <X size={20} />
          </button>

          <div className="p-8 relative z-10">
            {/* Obrazek Urwisa */}
            <motion.div 
                key={view} 
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-24 h-24 mx-auto mb-4 relative"
            >
                <Image 
                    src={view === 'login' ? "/Urwis-Login.webp" : "/Urwis-Register.webp"}
                    alt="Urwis" 
                    fill 
                    className="object-contain drop-shadow-lg"
                    priority
                />
            </motion.div>

            {/* Nagłówek */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {view === 'login' ? 'Cześć Urwisie!' : 'Zostań Urwisem!'}
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                {view === 'login'
                  ? 'Podaj tajne hasło, aby wejść.'
                  : <span>Zarejestruj się i zgarnij <span className="text-yellow-500 font-black">50 pkt</span> na start.</span>}
              </p>
            </div>

            {/* Formularz */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl font-bold text-center border border-red-100 animate-pulse">
                  {error}
                </div>
              )}

              {/* INPUT: Nazwa użytkownika (Tylko rejestracja) */}
              {view === 'register' && (
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Twój Nick</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Np. SuperJanek"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full bg-gray-50 border border-transparent rounded-xl py-3 pl-10 pr-4 outline-none focus:bg-white focus:ring-2 focus:ring-yellow-500 transition-all text-sm font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-400"
                        />
                    </div>
                </div>
              )}

              {/* INPUT: Email */}
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email</label>
                 <div className="relative group">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors ${view === 'register' ? 'group-focus-within:text-yellow-500' : 'group-focus-within:text-blue-500'}`} size={18} />
                    <input
                        type="email"
                        placeholder="twoj@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={`w-full bg-gray-50 border border-transparent rounded-xl py-3 pl-10 pr-4 outline-none focus:bg-white focus:ring-2 transition-all text-sm font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-400 ${view === 'register' ? 'focus:ring-yellow-500' : 'focus:ring-blue-500'}`}
                    />
                </div>
              </div>

              {/* INPUT: Hasło */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Hasło</label>
                <div className="relative group">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors ${view === 'register' ? 'group-focus-within:text-yellow-500' : 'group-focus-within:text-blue-500'}`} size={18} />
                    <input
                        type="password"
                        placeholder={view === 'register' ? "Min. 6 znaków" : "••••••••"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={view === 'register' ? 6 : undefined}
                        className={`w-full bg-gray-50 border border-transparent rounded-xl py-3 pl-10 pr-4 outline-none focus:bg-white focus:ring-2 transition-all text-sm font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-400 ${view === 'register' ? 'focus:ring-yellow-500' : 'focus:ring-blue-500'}`}
                    />
                </div>
              </div>

              {/* Przycisk Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-lg transition-all mt-2 
                    ${view === 'register' 
                        ? 'bg-gray-900 text-white hover:bg-yellow-400 hover:text-black' 
                        : 'bg-gray-900 text-white hover:bg-blue-600'
                    } disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    {view === 'login' ? 'Wejdź do gry' : 'Odbierz 50 Punktów'}
                    {view === 'login' ? <Zap size={16} className="text-yellow-400 fill-yellow-400"/> : <Star size={16} />}
                  </>
                )}
              </motion.button>
            </form>

            {/* Przełącznik widoku */}
            <div className="mt-6 text-center pt-4 border-t border-gray-50">
                <p className="text-gray-500 text-xs font-medium">
                    {view === 'login' ? 'Nie masz jeszcze konta?' : 'Masz już konto?'}
                    <button 
                        onClick={() => setView(view === 'login' ? 'register' : 'login')}
                        className="ml-1 text-gray-900 font-black hover:underline focus:outline-none"
                    >
                        {view === 'login' ? 'Zarejestruj się' : 'Zaloguj się'}
                    </button>
                </p>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}