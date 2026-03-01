'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, Coffee, ChevronRight, Sparkles, PartyPopper } from 'lucide-react'
import Link from 'next/link'

export default function DualBrandSection() {
  return (
<section className="py-24 px-6 relative z-20 min-h-[400px]">
<div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
        
        {/* KARTA: SKLEP URWIS */}
        <motion.div 
          whileHover={{ y: -10 }}
          className="group relative bg-white/40 backdrop-blur-2xl rounded-4xl p-12 border-2 border-white shadow-xl overflow-hidden"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#BF2024]/10 rounded-full blur-3xl group-hover:bg-[#BF2024]/20 transition-colors" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-[#BF2024] rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:rotate-6 transition-transform">
              <ShoppingBag size={32} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-[#BF2024] mb-4 block flex items-center gap-2">
              <Sparkles size={14} /> ul. Reymonta 38A
            </span>
            <h2 className="text-5xl font-black text-zinc-900 mb-6 leading-none uppercase italic">
              Sklep <br /> <span className="text-[#BF2024]">Urwis</span>
            </h2>
            <p className="text-lg text-zinc-600 font-bold mb-10 leading-tight uppercase italic">
              Odkryj największy wybór <span className="text-zinc-900">klocków LEGO</span> w regionie, skompletuj idealną <span className="text-zinc-900">wyprawkę szkolną</span> i zamów balony z helem na każdą okazję!
            </p>
            <Link href="/oferta" className="inline-flex items-center gap-3 bg-zinc-900 text-white px-10 py-5 rounded-full font-black uppercase tracking-widest hover:bg-[#BF2024] transition-all text-sm shadow-xl">
              Sprawdź ofertę <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>

        {/* KARTA: LECĘ W KULKI */}
        <motion.div 
          whileHover={{ y: -10 }}
          className="group relative bg-white/40 backdrop-blur-2xl rounded-4xl p-12 border-2 border-white shadow-xl overflow-hidden"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#0055ff]/10 rounded-full blur-3xl group-hover:bg-[#0055ff]/20 transition-colors" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-[#0055ff] rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:-rotate-6 transition-transform">
              <Coffee size={32} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-[#0055ff] mb-4 block flex items-center gap-2">
              <PartyPopper size={14} /> ul. Targowicka 4
            </span>
            <h2 className="text-5xl font-black text-zinc-900 mb-6 leading-none uppercase italic">
              Lecę <br /> <span className="text-[#0055ff]">w Kulki</span>
            </h2>
            <p className="text-lg text-zinc-600 font-bold mb-10 leading-tight uppercase italic">
              Nowoczesna <span className="text-zinc-900">sala zabaw i kawiarnia</span> w Białobrzegach. Miejsce na Twoją kawę i <span className="text-zinc-900">wymarzone urodziny</span> Twojego dziecka!
            </p>
            <Link href="/salazabaw" className="inline-flex items-center gap-3 bg-[#0055ff] text-white px-10 py-5 rounded-full font-black uppercase tracking-widest hover:bg-zinc-900 transition-all text-sm shadow-xl">
              Odkryj radość <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  )
}