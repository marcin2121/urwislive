'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider' // Zaciągamy nasz globalny stan!
import { Loader2, ArrowLeft, Coins, Sparkles, Store, Coffee, Lock, User, Phone, LogOut } from "lucide-react"
import Particles from "@/components/Particles"
import { toast } from 'sonner'
import Link from 'next/link'


interface LoyaltyCard {
  id: string;
  phone_number: string;
  full_name: string;
  points: number;
  stamps_count?: number;
}

export default function LoyaltyCardPage() {
  const supabase = createClient()
  const { session, user, isLoading: isAuthLoading } = useAuth() // Magia!
  
  // --- STATE ---
  const [card, setCard] = useState<LoyaltyCard | null>(null)
  const [loadingCard, setLoadingCard] = useState(true)
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [formLoading, setFormLoading] = useState(false)

  // --- FORM STATE ---
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const fetchCard = useCallback(async (userPhone: string, userName: string) => {
    setLoadingCard(true)
    if (!supabase) return
    try {
      const { data } = await supabase.from('loyalty_cards').select('*').eq('phone_number', userPhone).maybeSingle()
      
      if (data) {
        setCard(data)
      } else {
        const { data: newCard, error } = await supabase.from('loyalty_cards')
          .insert([{ phone_number: userPhone, full_name: userName || 'Nowy Urwis', points: 0 }])
          .select().single()
        if (!error) setCard(newCard)
      }
    } catch (error) {
      console.error("fetchCard error:", error)
      toast.error("Błąd połączenia z bazą danych.")
    } finally {
      setLoadingCard(false)
    }
  }, [supabase])

  // Jeśli sesja się zmieni (zalogowano/wylogowano), pobieramy lub czyścimy kartę
  useEffect(() => {
    if (session && user) {
      fetchCard(user.user_metadata.phone, user.user_metadata.full_name)
    } else {
      setCard(null)
      setLoadingCard(false)
    }
  }, [session, user, fetchCard])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || !password) return toast.error("Wypełnij wszystkie pola!")
    if (!isLoginMode && !fullName) return toast.error("Podaj swoje imię!")

    setFormLoading(true)
    const cleanPhone = phone.replace(/[\s-]/g, '')
    const fakeEmail = `${cleanPhone}@sklep-urwis.pl` // <--- TWOJA DOMENA

    try {
        if (!supabase) throw new Error("Błąd konfiguracji bazy.")
        if (isLoginMode) {
          const { error } = await supabase.auth.signInWithPassword({ email: fakeEmail, password })
          if (error) throw new Error("Błąd logowania. Sprawdź numer i hasło.")
          toast.success("Witaj z powrotem! 🪙")
        } else {
          const { error } = await supabase.auth.signUp({
            email: fakeEmail,
            password,
            options: { 
              data: { 
                phone: cleanPhone, 
                full_name: fullName 
              } 
            }
          })
          if (error) throw error
          toast.success("Konto utworzone! 🎉")
        }
      } catch (error) {
        const err = error as any
        console.error("Szczegóły błędu:", err)
        // Jeśli błąd to 500, to prawdopodobnie problem po stronie bazy (Trigger)
        toast.error(err.message || "Błąd serwera. Spróbuj ponownie.")
      } finally {
        setFormLoading(false)
      }
    }

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut()
    toast.success("Wylogowano pomyślnie.")
  }

  // Czekamy na załadowanie stanu autoryzacji
  if (isAuthLoading) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>
  }

  const balance = card ? (card.points !== undefined ? card.points : card.stamps_count) : 0;

  return (
    <main className="min-h-screen bg-zinc-50 pt-32 pb-24 px-6 relative overflow-hidden">
      <Particles particleCount={30} particleColors={["#F59E0B", "#FBBF24"]} />
      
      <div className="max-w-md w-full mx-auto relative z-10">
        
        {/* NAGŁÓWEK STRONY */}
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-amber-500 font-black text-[11px] uppercase tracking-widest transition-all mb-6">
            <ArrowLeft size={14} strokeWidth={3} /> Wróć do sklepu
          </Link>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-zinc-900 leading-none">
            Portfel <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">Urwisa</span>
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {!session ? (
            // --- EKRAN LOGOWANIA / REJESTRACJI ---
            <motion.div key="auth" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white p-10 rounded-[3rem] shadow-2xl border-2 border-white relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-50 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-yellow-50 rounded-full blur-3xl" />

              <div className="relative z-10">
                  <div className="flex justify-center gap-4 mb-8">
                    <button type="button" onClick={() => setIsLoginMode(true)} className={`font-black uppercase tracking-widest text-xs pb-2 border-b-2 transition-all outline-none cursor-pointer ${isLoginMode ? 'border-amber-500 text-amber-500' : 'border-transparent text-gray-400'}`}>Logowanie</button>
                    <button type="button" onClick={() => setIsLoginMode(false)} className={`font-black uppercase tracking-widest text-xs pb-2 border-b-2 transition-all outline-none cursor-pointer ${!isLoginMode ? 'border-amber-500 text-amber-500' : 'border-transparent text-gray-400'}`}>Rejestracja</button>
                  </div>
                  
                  <form onSubmit={handleAuth} className="space-y-4">
                    {!isLoginMode && (
                      <div className="relative">
                        <User className="absolute left-4 top-5 text-gray-400" size={20} />
                        <input type="text" placeholder="Twoje imię..." required={!isLoginMode} className="w-full p-5 pl-12 rounded-2xl bg-zinc-50 border-none font-bold text-black outline-none focus:ring-2 ring-amber-500 transition-all" value={fullName} onChange={e => setFullName(e.target.value)} />
                      </div>
                    )}
                    <div className="relative">
                      <Phone className="absolute left-4 top-5 text-gray-400" size={20} />
                      <input type="tel" placeholder="Numer telefonu..." required className="w-full p-5 pl-12 rounded-2xl bg-zinc-50 border-none font-bold text-black outline-none focus:ring-2 ring-amber-500 transition-all" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-5 text-gray-400" size={20} />
                      <input type="password" placeholder="Hasło (min. 6 znaków)" required className="w-full p-5 pl-12 rounded-2xl bg-zinc-50 border-none font-bold text-black outline-none focus:ring-2 ring-amber-500 transition-all" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>

                    <button disabled={formLoading} className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-amber-500 transition-all disabled:opacity-70 cursor-pointer flex justify-center items-center gap-2 shadow-lg border-none outline-none mt-2">
                        {formLoading ? <Loader2 className="animate-spin" size={20} /> : isLoginMode ? 'Zaloguj się' : 'Utwórz konto'}
                    </button>
                  </form>
              </div>
            </motion.div>
          ) : loadingCard ? (
             <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-10">
                <Loader2 className="animate-spin text-amber-500" size={40} />
             </motion.div>
          ) : (
            // --- WIDOK ZALOGOWANEGO PORTFELA ---
            <motion.div key="wallet" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
              
              <div className="bg-white rounded-[3rem] p-8 shadow-2xl border-2 border-amber-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-50 rounded-full blur-3xl opacity-60 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

                {/* Informacje o kliencie */}
                <div className="text-center relative z-10 mb-8 pb-8 border-b border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Właściciel Portfela</p>
                    <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">{card?.full_name}</h3>
                    <p className="text-xs font-bold text-amber-500 tracking-widest mt-1">{card?.phone_number}</p>
                </div>

                {/* Główne Saldo */}
                <div className="text-center relative z-10 mb-10">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Twoje Saldo</p>
                  <div className="flex items-center justify-center gap-3">
                    <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring" }} className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40 relative">
                      <Coins size={32} className="text-white drop-shadow-md" />
                      <Sparkles size={16} className="absolute -top-1 -right-1 text-yellow-100 animate-pulse" />
                    </motion.div>
                    <span className="text-6xl font-black tracking-tighter text-zinc-900">{balance}</span>
                  </div>
                  <p className="text-lg font-black italic text-amber-500 mt-2 uppercase">Złotych Urwisów</p>
                </div>

                {/* Wartość w PLN */}
                <div className="bg-zinc-900 rounded-3xl p-6 text-white text-center relative z-10 shadow-xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Wartość Twoich punktów</p>
                  <p className="text-3xl font-black text-green-400 mb-4">{balance} zł zniżki</p>
                  
                  <div className="flex items-center justify-center gap-2 text-xs font-bold bg-white/10 py-3 px-4 rounded-xl">
                     <Coffee size={16} className="text-amber-400" /> Do wykorzystania w Lecę w Kulki
                  </div>
                </div>
              </div>

              {/* Instrukcja */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                  <Store size={20} className="mx-auto text-red-500 mb-2" />
                  <p className="text-[9px] font-black uppercase text-gray-400">Kupujesz w sklepie</p>
                  <p className="text-xs font-bold text-gray-800 leading-tight mt-1">10 zł = +1 Urwis</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                  <Coffee size={20} className="mx-auto text-blue-500 mb-2" />
                  <p className="text-[9px] font-black uppercase text-gray-400">Wydajesz w Sali</p>
                  <p className="text-xs font-bold text-gray-800 leading-tight mt-1">1 Urwis = -1 zł zniżki</p>
                </div>
              </div>

              <button onClick={handleLogout} className="w-full py-4 text-zinc-400 font-black flex items-center justify-center gap-2 uppercase text-xs tracking-widest bg-transparent border-none cursor-pointer hover:text-red-500 transition-colors outline-none">
                <LogOut size={16} /> Wyloguj się
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}