'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { createUrwisPet } from '@/app/actions/tamagotchi'
import JellyButton from '@/components/ui/JellyButton'
import { User, AlertCircle, PawPrint, Heart, Zap } from "lucide-react"
import { cn } from '@/lib/utils'

export default function UrwisekLobby() {
  const [playerName, setPlayerName] = useState('')
  const [petName, setPetName] = useState('')
  const [gender, setGender] = useState<'boy' | 'girl' | null>(null)
  
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const handleAdopt = () => {
    setError('')
    
    if (!gender) {
      setError('Wybierz postać, aby kontynuować!')
      return
    }

    // Zabezpieczenie przed takimi samymi imionami (wielkość liter nie ma znaczenia)
    if (playerName.trim().toLowerCase() === petName.trim().toLowerCase()) {
      setError('Twój Urwis wolałby mieć własne, wyjątkowe imię! 😉')
      return
    }

    startTransition(async () => {
      const res = await createUrwisPet(playerName, petName, gender)
      if (res?.error) setError(res.error)
    })
  }

  const isFormValid = playerName.length >= 3 && petName.length >= 3 && gender !== null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md mx-auto"
    >
      {/* Glassmorphism: bg-white/70 + backdrop-blur-2xl + delikatny border 
        Tło musi być lekko przezroczyste, by efekt szkła zadziałał z kolorowymi plamami poniżej
      */}
      <div className="relative bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,85,255,0.15)] border border-white/60 p-6 sm:p-8 overflow-hidden">
        
        {/* Dekoracyjne kolorowe plamy widoczne "pod" szkłem formularza */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-[#0055ff]/15 rounded-full blur-3xl opacity-70 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-[#bf2024]/15 rounded-full blur-3xl opacity-70 pointer-events-none" />

        <div className="text-center relative z-10 mb-8">
          {/* Usunięto białe tło kontenera, cienie i animacje - sam czysty obrazek, zwiększony do w=100 h=100 */}
          <div className="mx-auto w-24 h-24 flex items-center justify-center mb-2">
            <Image 
              src="/urwisek/login.webp" 
              alt="Urwis Logo" 
              width={96} 
              height={96} 
              className="object-contain"
            />
          </div>
          
          <h2 className="text-xs font-black text-[#bf2024] tracking-[0.2em] uppercase mb-2">
            Zaopiekuj się mną
          </h2>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0055ff] to-[#bf2024]">Urwisek</span>
          </h1>
          <p className="text-sm font-medium text-gray-500 px-2 leading-relaxed">
            Dołącz do rankingu Białobrzegów i wymieniaj punkty na nagrody w Sklepie Urwis!
          </p>
        </div>
        
        {/* Formularz */}
        <div className="space-y-6 relative z-10">
          
          {/* Krok 1: Płeć */}
          <div className="space-y-3">
            <label className="text-sm font-black text-gray-800 ml-1">1. Twoja płeć</label>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setGender('girl')}
                className={cn(
                  "flex flex-col items-center justify-center py-5 rounded-[1.5rem] border-2 transition-all duration-300 group",
                  gender === 'girl' 
                    ? "bg-[#bf2024]/5 border-[#bf2024]/30 shadow-[inset_0_0_20px_rgba(191,32,36,0.05)] text-[#bf2024] ring-2 ring-[#bf2024]/20" 
                    : "bg-white/50 border-transparent text-gray-400 hover:bg-white/80 hover:text-[#bf2024]/60"
                )}
              >
                <Heart className={cn("w-8 h-8 mb-2 transition-all", gender === 'girl' && "fill-[#bf2024]/20 scale-110")} />
                <span className="font-black text-xs uppercase tracking-wider">Dziewczyna</span>
              </motion.button>
              
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setGender('boy')}
                className={cn(
                  "flex flex-col items-center justify-center py-5 rounded-[1.5rem] border-2 transition-all duration-300 group",
                  gender === 'boy' 
                    ? "bg-[#0055ff]/5 border-[#0055ff]/30 shadow-[inset_0_0_20px_rgba(0,85,255,0.05)] text-[#0055ff] ring-2 ring-[#0055ff]/20" 
                    : "bg-white/50 border-transparent text-gray-400 hover:bg-white/80 hover:text-[#0055ff]/60"
                )}
              >
                <Zap className={cn("w-8 h-8 mb-2 transition-all", gender === 'boy' && "fill-[#0055ff]/20 scale-110")} />
                <span className="font-black text-xs uppercase tracking-wider">Chłopak</span>
              </motion.button>
            </div>
          </div>

          {/* Krok 2: Imię Gracza */}
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-800 ml-1">2. Twoja nazwa użytkownika (Opiekun)</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#0055ff] transition-colors" />
              </div>
              <input 
                type="text"
                placeholder="np. Zosia, Kapcer..." 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full pl-12 pr-4 h-14 bg-white/60 border-2 border-white rounded-2xl text-lg font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0055ff]/30 focus:ring-4 focus:ring-[#0055ff]/10 focus:bg-white transition-all shadow-inner"
                maxLength={15}
              />
            </div>
          </div>

          {/* Krok 3: Imię Urwisa */}
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-800 ml-1">3. Imię dla Twojego Urwiska</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <PawPrint className="h-5 w-5 text-gray-400 group-focus-within:text-[#bf2024] group-focus-within:scale-110 transition-all duration-300" />
              </div>
              <input 
                type="text"
                placeholder="np. Reksio, T-Rex..." 
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="w-full pl-12 pr-4 h-14 bg-white/60 border-2 border-white rounded-2xl text-lg font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#bf2024]/30 focus:ring-4 focus:ring-[#bf2024]/10 focus:bg-white transition-all shadow-inner"
                maxLength={15}
              />
            </div>
          </div>

          {/* Animowany Error */}
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
          
          {/* Przycisk */}
          <div className="pt-4">
            <JellyButton 
              variant="primary"
              onClick={handleAdopt} 
              disabled={isPending || !isFormValid}
              className="w-full py-4 text-base shadow-lg disabled:opacity-50 disabled:grayscale"
            >
              {isPending ? 'Rejestrowanie...' : 'Rozpocznij Przygodę! ✨'}
            </JellyButton>
          </div>
        </div>
      </div>
    </motion.div>
  )
}