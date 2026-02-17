'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowLeft, Zap } from 'lucide-react'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { supabase, session, loading: authLoading } = useSupabaseAuth()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // EFEKT: Jeśli sesja się pojawi (np. po SIGNED_IN), natychmiast przekieruj
  useEffect(() => {
    if (session && !authLoading) {
      console.log("🚀 Sesja wykryta, przekierowuję do profilu...")
      router.push('/profil')
    }
  }, [session, authLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      // Nie musimy robić router.push tutaj, useEffect powyżej to obsłuży
    } catch (err: any) {
      console.error("Błąd logowania:", err)
      setError('Nieprawidłowy email lub hasło.')
      setLoading(false) // Przy błędzie wyłączamy loading, żeby poprawić dane
    }
  }

  // Jeśli już jesteśmy zalogowani, nie pokazuj formularza (zapobiega miganiu)
  if (session && !authLoading) return <div className="p-10 text-center font-bold">Wchodzenie do bazy...</div>

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dekoracyjne tło */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-100/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-4xl shadow-xl border border-gray-100 overflow-hidden relative z-10"
      >
        <div className="p-8">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-gray-900 mb-6 transition-colors">
              <ArrowLeft size={16} className="mr-1" /> Wróć do bazy
            </Link>
            
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ delay: 0.2, scale: { type: "spring" }, rotate: { duration: 0.8 } }}
              className="w-28 h-28 mx-auto mb-2 relative"
            >
              <Image 
                src="/Urwis-Login.webp" 
                alt="Urwis macha" 
                fill 
                className="object-contain drop-shadow-xl"
                priority
              />
            </motion.div>

            <h1 className="text-3xl font-black text-gray-900">Cześć Urwisie!</h1>
            <p className="text-gray-500 mt-1">Podaj tajne hasło, aby wejść do bazy.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-bold text-center border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email Agenta</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  placeholder="twoj@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Tajne Hasło</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Weryfikacja..." : "Wejdź do gry"} {!loading && <Zap size={18} className="text-yellow-400 fill-yellow-400" />}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}