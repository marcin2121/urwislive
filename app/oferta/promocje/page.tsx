'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Tag, Timer, Sparkles, ChevronRight, Percent, Loader2, Flame, Clock } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Particles from "@/components/Particles"

// Typ danych zgodny z Twoją tabelą w Supabase
interface SaleItem {
  id: string;
  title: string;
  old_price: string;
  new_price: string;
  discount: string;
  category: string;
  created_at: string;
  image_url?: string;
  expires_at?: string | null;
  is_active?: boolean;
}

// --- KOMPONENT: TYKAJĄCY ZEGAR ---
const CountdownTimer = ({ expiresAt }: { expiresAt: string }) => {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [isExpired, setIsExpired] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = new Date(expiresAt).getTime() - now

      if (distance < 0) {
        clearInterval(interval)
        setIsExpired(true)
      } else {
        setTimeLeft({
          d: Math.floor(distance / (1000 * 60 * 60 * 24)),
          h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  if (!mounted) return <div className="h-10 bg-zinc-100 rounded-xl animate-pulse mb-6" />

  if (isExpired) {
    return (
      <div className="mb-6 p-3 bg-zinc-100 rounded-xl flex items-center justify-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-widest">
        <Clock size={14} /> Oferta zakończona
      </div>
    )
  }

  return (
    <div className="mb-6 p-4 bg-orange-50/50 border border-orange-100 rounded-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-100/20 to-transparent pointer-events-none" />
      <div className="flex items-center gap-2 mb-2 text-orange-500 relative z-10">
        <Flame size={16} className="animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest">Gorący Strzał - Koniec za:</span>
      </div>
      <div className="flex gap-2 relative z-10">
        {timeLeft.d > 0 && <TimeBox value={timeLeft.d} label="Dni" />}
        <TimeBox value={timeLeft.h} label="Godz" />
        <TimeBox value={timeLeft.m} label="Min" />
        <TimeBox value={timeLeft.s} label="Sek" isSeconds />
      </div>
    </div>
  )
}

const TimeBox = ({ value, label, isSeconds = false }: { value: number, label: string, isSeconds?: boolean }) => (
  <div className={`flex flex-col items-center justify-center bg-white border border-orange-100 rounded-xl w-12 h-12 shadow-sm ${isSeconds ? 'text-orange-500' : 'text-zinc-800'}`}>
    <span className="text-lg font-black leading-none">{value.toString().padStart(2, '0')}</span>
    <span className="text-[8px] font-bold uppercase text-zinc-400 mt-0.5">{label}</span>
  </div>
)


export default function PromocjePage() {
  const supabase = createClient()
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPromocje() {
      setLoading(true)
      const { data, error } = await supabase
        .from('promocje')
        .select('*')
        // Pobieramy TYLKO aktywne promocje z bazy
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Błąd pobierania promocji:', error)
      } else {
        setSaleItems(data || [])
      }
      setLoading(false)
    }

    fetchPromocje()
  }, [supabase])

  // Funkcja pomocnicza do kolorów Urwisa na podstawie kategorii
  const getAccentColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'szkoła': return '#0055ff';
      case 'zabawki': return '#BF2024';
      default: return '#BF2024';
    }
  }

  return (
    <main className="min-h-screen bg-transparent pt-32 pb-24 relative overflow-hidden">
      
      {/* 🟢 TŁO: Cząsteczki brandowe */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Particles
          particleCount={40}
          particleColors={["#BF2024", "#0055ff"]}
          alphaParticles
          particleBaseSize={180}
          speed={0.06}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20">
          <div className="space-y-4 text-center lg:text-left">
            <Link 
              href="/oferta" 
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#BF2024] font-black text-[12px] uppercase tracking-[0.2em] transition-all mb-4"
            >
              <ArrowLeft size={14} strokeWidth={3} /> Powrót do oferty
            </Link>
            
            <h1 className="text-7xl md:text-9xl font-black text-zinc-900 italic leading-[0.85] tracking-normal uppercase">
              GORĄCE <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">
                OKAZJE!
              </span>
            </h1>
          </div>

          <motion.div 
            initial={{ rotate: 2, scale: 0.9, opacity: 0 }}
            animate={{ rotate: -2, scale: 1, opacity: 1 }}
            className="bg-zinc-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group max-w-md mx-auto lg:mx-0 border border-white/10"
          >
            <div className="absolute inset-0 bg-linear-to-r from-[#BF2024]/40 to-[#0055ff]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <p className="font-black text-2xl uppercase tracking-tighter leading-none relative z-10">
              ŁAP JE TERAZ! <br />
              <span className="text-sm font-bold opacity-60 tracking-widest">Ważne do wyczerpania zapasów 🔥</span>
            </p>
          </motion.div>
        </div>

        {/* --- GRID PROMOCJI / LOADER --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-[#BF2024]" size={64} strokeWidth={3} />
            <p className="font-black uppercase tracking-widest text-zinc-400">Szukamy okazji...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {saleItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group relative bg-white/40 backdrop-blur-xl rounded-[3.5rem] overflow-hidden border-2 border-white shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col"
                >
                  {/* Badge Rabatowy - Dynamiczny kolor */}
                  {item.discount && (
                    <div 
                      className="absolute top-8 left-8 z-20 text-white font-black px-5 py-2 rounded-2xl rotate-[-10deg] shadow-xl text-2xl border-2 border-white/20"
                      style={{ backgroundColor: getAccentColor(item.category) }}
                    >
                      {item.discount}
                    </div>
                  )}

                  {/* Kontener zdjęcia */}
                  <div className="aspect-square relative overflow-hidden bg-white/50 m-4 rounded-[2.5rem] border border-white/60 shadow-sm shrink-0">
                    <div className="absolute inset-0 bg-linear-to-t from-zinc-900/10 to-transparent z-10" />
                    
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform duration-700">
                        <Tag size={80} strokeWidth={1} className="opacity-10" />
                        <Sparkles size={40} className="absolute opacity-20 text-amber-400 animate-pulse" />
                      </div>
                    )}
                  </div>

                  <div className="p-10 pt-4 flex flex-col flex-1">
                    {/* Jeśli promocja NIE MA wygasania, pokaż standardowy tag. Jeśli ma - zastąpi to odliczanie (poniżej) */}
                    {!item.expires_at && (
                      <div className="flex items-center gap-2 text-zinc-500 text-[12px] font-black uppercase tracking-widest mb-4">
                        <Timer size={14} style={{ color: getAccentColor(item.category) }} /> Oferta ograniczona
                      </div>
                    )}
                    
                    <h3 className="text-3xl font-black text-zinc-900 mb-6 font-heading leading-[0.9] uppercase h-16 overflow-hidden">
                      {item.title}
                    </h3>
                    
                    <div className="flex items-end gap-3 mb-6">
                      <span className="text-4xl font-black text-[#BF2024] tracking-tighter">
                        {item.new_price} zł
                      </span>
                      {item.old_price && (
                        <span className="text-xl text-zinc-400 line-through font-bold mb-1 opacity-40">
                          {item.old_price} zł
                        </span>
                      )}
                    </div>

                    {/* Zegar wygasania - wrzucony nad przycisk */}
                    {item.expires_at && (
                      <div className="mt-auto">
                        <CountdownTimer expiresAt={item.expires_at} />
                      </div>
                    )}

                    <Link 
                      href="/kontakt" 
                      className={`group/btn w-full py-5 text-white rounded-4xl font-black uppercase tracking-widest text-center block relative overflow-hidden shadow-xl transition-all hover:scale-[1.02] ${!item.expires_at && 'mt-auto'}`}
                      style={{ backgroundColor: getAccentColor(item.category) }}
                    >
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Rezerwuj / Zapytaj <ChevronRight size={18} strokeWidth={3} />
                      </span>
                    </Link>
                  </div>
                </motion.div>
              ))}

              {/* Kafel informacyjny (Zawsze na końcu) */}
              <motion.div 
                key="info-card"
                whileHover={{ scale: 0.98 }}
                className="flex flex-col items-center justify-center p-12 rounded-[3.5rem] border-4 border-dashed border-white/50 bg-white/5 backdrop-blur-md text-center group h-full"
              >
                <div className="w-24 h-24 bg-white/40 rounded-full flex items-center justify-center mb-8 shadow-xl group-hover:rotate-12 transition-transform">
                  <Percent size={48} className="text-[#0055ff]" strokeWidth={3} />
                </div>
                <h3 className="text-3xl font-black font-heading mb-4 text-zinc-900 uppercase leading-none">
                  TO NIE <br /> WSZYSTKO!
                </h3>
                <p className="text-zinc-600 font-bold text-sm uppercase leading-relaxed tracking-tight">
                  W sklepie stacjonarnym mamy <br />
                  <span className="text-zinc-900">setki okazji</span>, których <br />
                  nie znajdziesz w internecie!
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  )
}