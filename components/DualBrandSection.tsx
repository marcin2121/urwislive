'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, Coffee, ChevronRight, Star, Heart } from 'lucide-react'
import Link from 'next/link'

export default function DualBrandSection() {
  return (
    <section className="py-24 px-6 relative z-20">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
        
        {/* KARTA: SKLEP URWIS */}
        <motion.div 
          whileHover={{ y: -10 }}
          className="group relative bg-white/40 backdrop-blur-2xl rounded-[4rem] p-12 border-2 border-white shadow-xl overflow-hidden"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#BF2024]/10 rounded-full blur-3xl group-hover:bg-[#BF2024]/20 transition-colors" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-[#BF2024] rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg">
              <ShoppingBag size={32} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-[#BF2024] mb-4 block">ul. Reymonta 38A</span>
            <h2 className="text-5xl font-black text-zinc-900 mb-6 leading-none uppercase italic">Sklep <br /> <span className="text-[#BF2024]">Urwis</span></h2>
            <p className="text-lg text-zinc-600 font-bold mb-10 leading-snug uppercase">
              Królestwo LEGO, najlepsza wyprawka szkolna i balony z helem. Wszystko, czego potrzebuje uczeń!
            </p>
            <Link href="/oferta" className="inline-flex items-center gap-3 bg-zinc-900 text-white px-10 py-5 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all text-sm">
              Sprawdź ofertę <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>

        {/* KARTA: LECĘ W KULKI */}
        <motion.div 
          whileHover={{ y: -10 }}
          className="group relative bg-white/40 backdrop-blur-2xl rounded-[4rem] p-12 border-2 border-white shadow-xl overflow-hidden"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#0055ff]/10 rounded-full blur-3xl group-hover:bg-[#0055ff]/20 transition-colors" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-[#0055ff] rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg">
              <Coffee size={32} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-[#0055ff] mb-4 block">ul. Targowicka 4</span>
            <h2 className="text-5xl font-black text-zinc-900 mb-6 leading-none uppercase italic">Lecę <br /> <span className="text-[#0055ff]">w Kulki</span></h2>
            <p className="text-lg text-zinc-600 font-bold mb-10 leading-snug uppercase">
              Najlepsza kawiarnia i sala zabaw w Białobrzegach. Urodziny, których Twoje dziecko nie zapomni!
            </p>
            <Link href="/salazabaw" className="inline-flex items-center gap-3 bg-[#0055ff] text-white px-10 py-5 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all text-sm">
              Odkryj salę zabaw <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  )
}