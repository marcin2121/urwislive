'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import JellyButton from '@/components/ui/JellyButton'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { IconBrandGoogle, IconBrandFacebook } from '@tabler/icons-react'

export default function UrwisekAuth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true) // Stan: logowanie czy rejestracja
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || password.length < 6) {
      setError('Podaj poprawny email i hasło (min. 6 znaków).')
      return
    }

    setLoading(true)

    try {
      if (!supabase) throw new Error("Błąd konfiguracji usługi logowania.")
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      }
      
      // Sukces! Odświeżamy stronę, co sprawi, że Next.js zorientuje się, 
      // że mamy sesję i płynnie przerzuci nas do UrwisekLobby
      router.refresh()
    } catch (err) {
      const error = err as any
      if (error.message.includes('Invalid login')) setError('Nieprawidłowy email lub hasło.')
      else if (error.message.includes('already registered')) setError('Ten email jest już zarejestrowany!')
      else setError('Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    setError('')
    setLoading(true)
    try {
      if (!supabase) throw new Error("Usługa niedostępna.")
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      if (error) throw error
    } catch (err) {
      setError(`Błąd logowania przez ${provider === 'google' ? 'Google' : 'Facebook'}.`)
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md mx-auto"
    >
      <div className="relative bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(191,32,36,0.15)] border border-white/60 p-6 sm:p-8 overflow-hidden">
        
        {/* Dekoracyjne plamy pod szkłem */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-[#bf2024]/15 rounded-full blur-3xl opacity-70 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-[#0055ff]/15 rounded-full blur-3xl opacity-70 pointer-events-none" />

        <div className="text-center relative z-10 mb-8">
          <div className="mx-auto w-24 h-24 flex items-center justify-center mb-2">
            <Image 
              src="/urwisek/login.webp" // Używamy Twojej grafiki startowej
              alt="Logowanie" 
              width={96} 
              height={96} 
              className="object-contain"
            />
          </div>
          <h2 className="text-xs font-black text-[#0055ff] tracking-[0.2em] uppercase mb-2">
            Karta Lojalnościowa
          </h2>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-3">
            {isLogin ? 'Witaj z powrotem!' : 'Zacznijmy zabawę!'}
          </h1>
          <p className="text-sm font-medium text-gray-500 px-2 leading-relaxed">
            {isLogin ? 'Zaloguj się, aby zająć się swoim Urwisem.' : 'Stwórz bezpłatne konto sklepu, aby zagrać.'}
          </p>
        </div>
        
        <form onSubmit={handleAuth} className="space-y-4 relative z-10">
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#bf2024] transition-colors" />
            </div>
            <input 
              type="email"
              placeholder="Twój adres e-mail" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 h-14 bg-white/60 border-2 border-white rounded-2xl text-base font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#bf2024]/30 focus:ring-4 focus:ring-[#bf2024]/10 transition-all shadow-inner"
              required
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#bf2024] transition-colors" />
            </div>
            <input 
              type="password"
              placeholder="Hasło (min. 6 znaków)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 h-14 bg-white/60 border-2 border-white rounded-2xl text-base font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#bf2024]/30 focus:ring-4 focus:ring-[#bf2024]/10 transition-all shadow-inner"
              required
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50/90 text-[#bf2024] p-3 rounded-xl border border-red-100 flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-bold">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="pt-2">
            <JellyButton 
              variant="primary"
              type="submit"
              disabled={loading}
              className="w-full py-4 text-base shadow-lg bg-[#bf2024] text-white hover:bg-[#a0181e] disabled:opacity-50"
            >
              {loading ? 'Przetwarzanie...' : (isLogin ? 'Zaloguj się' : 'Stwórz konto')}
            </JellyButton>
          </div>
        </form>


        {/* Przełącznik Logowanie / Rejestracja */}
        <div className="mt-6 text-center relative z-10">
          <button 
            type="button" 
            onClick={() => { setError(''); setIsLogin(!isLogin); }}
            className="text-sm font-bold text-gray-500 hover:text-[#0055ff] transition-colors"
          >
            {isLogin ? 'Nie masz konta? Zarejestruj się.' : 'Masz już konto? Zaloguj się.'}
          </button>
        </div>

        {/* Informacja RODO / Cel aplikacji (dla weryfikacji Meta/Google) */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center relative z-10">
          <p className="text-[10px] text-gray-400 font-medium leading-relaxed px-4">
            Logowanie pozwala na zapis stanu gry, zbieranie punktów oraz korzystanie z kuponów rabatowych.
          </p>
          <div className="flex justify-center gap-3 mt-2 text-[10px] font-bold text-gray-400">
            <Link href="/regulamin" className="hover:text-gray-600 underline">Regulamin</Link>
            <span>•</span>
            <Link href="/polityka-prywatnosci" className="hover:text-gray-600 underline">Polityka prywatności</Link>
          </div>
        </div>

      </div>
    </motion.div>
  )
}