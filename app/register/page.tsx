'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowLeft, Star } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Rejestracja
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: username } }
      })
      if (authError) throw authError

      if (authData.user) {
        // 2. Tworzenie profilu z bonusem
        await supabase.from('profiles').insert([{ 
            id: authData.user.id,
            username: username,
            email: email,
            points: 50, // BONUS NA START!
            role: 'user'
        }])
        
        router.push('/profil')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd rejestracji.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Tło */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-yellow-100/50 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-4xl shadow-xl border border-gray-100 overflow-hidden relative z-10"
      >
        <div className="p-8">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-gray-900 mb-6 transition-colors">
              <ArrowLeft size={16} className="mr-1" /> Wróć do bazy
            </Link>

            {/* URWIS WSKAKUJE 🚀 */}
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-28 h-28 mx-auto mb-2 relative"
            >
              <Image 
                src="/Urwis-Register.webp" 
                alt="Urwis wita" 
                fill 
                className="object-contain drop-shadow-xl"
                priority
              />
            </motion.div>

            <h1 className="text-3xl font-black text-gray-900">Zostań Urwisem!</h1>
            <p className="text-gray-500 mt-1">Zarejestruj się i zgarnij <span className="text-yellow-500 font-black">50 punktów</span> na start.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-bold text-center border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nazwa Urwisa</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all font-bold text-gray-900 placeholder:font-normal"
                  placeholder="Np. SuperJanek"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all font-bold text-gray-900 placeholder:font-normal"
                  placeholder="twoj@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Hasło</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all font-bold text-gray-900 placeholder:font-normal"
                  placeholder="Minimum 6 znaków"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black hover:shadow-lg hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
            >
              {loading ? "Tworzenie konta..." : "Odbierz 50 Punktów"} {!loading && <Star size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm font-medium">
              Masz już konto?{' '}
              <Link href="/login" className="text-gray-900 font-black hover:underline">
                Zaloguj się
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}