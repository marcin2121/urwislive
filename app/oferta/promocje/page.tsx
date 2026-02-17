'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Tag, Timer, ShoppingCart, Percent } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// To docelowo będzie pobierane z Supabase: 
const saleItems = [
  {
    id: 1,
    title: "Klocki LEGO Technic - Wyścigówka",
    oldPrice: "199.99",
    newPrice: "149.99",
    discount: "-25%",
    endsIn: "2 dni",
    category: "Zabawki",
    image: "/images/promo/lego.jpg"
  },
  {
    id: 2,
    title: "Plecak Ergo-Star Blue",
    oldPrice: "249.00",
    newPrice: "189.00",
    discount: "-60 PLN",
    endsIn: "5 dni",
    category: "Szkoła",
    image: "/images/promo/backpack.jpg"
  },
]

export default function PromocjePage() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Link href="/oferta" className="flex items-center gap-2 text-zinc-500 hover:text-[#BF2024] font-bold text-xs uppercase tracking-widest mb-4">
              <ArrowLeft size={14} /> Powrót do oferty
            </Link>
            <h1 className="text-5xl md:text-7xl font-black font-heading text-zinc-900 leading-none">
              GORĄCE <br />
              <span className="text-[#BF2024] italic">OKAZJE!</span>
            </h1>
          </div>
          <div className="bg-zinc-900 text-white p-6 rounded-3xl rotate-2 hidden md:block">
            <p className="font-black text-2xl uppercase tracking-tighter italic">Promocje ważne do wyczerpania zapasów! 🔥</p>
          </div>
        </div>

        {/* Promocje Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {saleItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-gray-50 rounded-[2.5rem] overflow-hidden border-2 border-transparent hover:border-[#BF2024]/20 transition-all shadow-sm hover:shadow-2xl"
            >
              {/* Badge procentowy */}
              <div className="absolute top-6 left-6 z-20 bg-[#BF2024] text-white font-black px-4 py-2 rounded-2xl rotate-[-10deg] shadow-lg text-xl">
                {item.discount}
              </div>

              {/* Zdjęcie */}
              <div className="aspect-square relative overflow-hidden bg-zinc-200">
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent z-10" />
                {/* <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" /> */}
                <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                  <Tag size={64} className="opacity-20" />
                </div>
              </div>

              {/* Treść */}
              <div className="p-8">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase mb-2">
                  <Timer size={14} /> Koniec za: {item.endsIn}
                </div>
                <h3 className="text-2xl font-black text-zinc-900 mb-4 font-heading leading-tight h-14 overflow-hidden">
                  {item.title}
                </h3>
                
                <div className="flex items-end gap-3 mb-6">
                  <span className="text-3xl font-black text-[#BF2024]">{item.newPrice} zł</span>
                  <span className="text-xl text-zinc-400 line-through mb-1">{item.oldPrice} zł</span>
                </div>

                <Link href="/kontakt" className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-center block hover:bg-[#BF2024] transition-colors shadow-lg">
                  Rezerwuj / Zapytaj
                </Link>
              </div>
            </motion.div>
          ))}

          {/* Kafel "Zadzwoń o więcej" */}
          <div className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-4 border-dashed border-zinc-100 text-center">
             <div className="w-20 h-20 bg-blue-50 text-[#0055ff] rounded-full flex items-center justify-center mb-6">
                <Percent size={40} />
             </div>
             <h3 className="text-2xl font-black font-heading mb-2 text-zinc-900">I WIELE WIĘCEJ...</h3>
             <p className="text-zinc-500 font-body text-sm">
                W sklepie stacjonarnym mamy setki produktów z końcówek serii!
             </p>
          </div>
        </div>
      </div>
    </main>
  )
}