'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  History, 
  Heart, 
  Users, 
  Rocket, 
  CheckCircle2, 
  ArrowUpRight,
  Star,
  Sparkles,
  Navigation,
  Phone
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Particles from "@/components/Particles"
import { RibbonsBg } from "@/components/Ribbons"
import Footer from '@/components/ui/Footer'

export default function AboutPage() {
  const yearsOfExperience = new Date().getFullYear() - 2007;

  return (
    <main className="relative min-h-screen w-full bg-transparent">
      
      {/* --- TŁO --- */}
      <div className="fixed inset-0 bg-white -z-30" />
      <div className="fixed inset-0 pointer-events-none -z-20">
        <RibbonsBg colors={["#bf2024", "#0055ff"]} />
      </div>
      <div className="fixed inset-0 pointer-events-none -z-10">
        <Particles
          particleCount={60}
          particleColors={["#bf2024", "#0055ff"]}
          alphaParticles
          particleBaseSize={180}
          speed={0.08}
        />
      </div>

      {/* --- CONTENT --- */}
      <div className="relative z-0">
        
        {/* HERO SUBPAGE */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-[#BF2024] rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-red-100"
            >
              <Sparkles size={14} /> Nasza Historia
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black font-heading text-gray-900 tracking-tighter mb-8 leading-none"
            >
              WIĘCEJ NIŻ <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">PASJA</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-body font-medium leading-relaxed"
            >
              W Białobrzegach jesteśmy z Wami od {yearsOfExperience} lat. Budujemy miejsce, w którym dorosłość zostaje za drzwiami, a liczy się tylko dobra zabawa.
            </motion.p>
          </div>
        </section>

        {/* STATYSTYKI */}
        <section className="py-12 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value={`${yearsOfExperience}+`} label="Lat Razem" delay={0.3} />
            <StatCard value="10k+" label="Zadowolonych Urwisów" delay={0.4} />
            <StatCard value="5000+" label="Zabawek od ręki" delay={0.5} />
            <StatCard value="100%" label="Lokalna Firma" delay={0.6} />
          </div>
        </section>

        {/* NASZA DROGA (TIMELINE) */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto space-y-20">
            <TimelineItem 
              year="2007" 
              title="Początek Przygody" 
              desc="Otwieramy pierwszy, mały sklep z marzeniami w Białobrzegach. Sklep Urwis staje się faktem."
              icon={<History className="text-[#BF2024]" />}
            />
      <TimelineItem 
      year="2015" 
      title="Ewolucja i Rozwój" 
      desc="To czas intensywnego wzrostu i budowania zaufania. Stale rozszerzamy nasz asortyment o najnowsze światowe trendy, stając się centrum radości i inspiracji dla kolejnych pokoleń Agentów."
      icon={<Rocket className="text-[#0055ff]" />}
      reversed
    />
            <TimelineItem 
              year="2024" 
              title="Misja: Kulki!" 
              desc="Postanowiliśmy wyjść poza ramy sklepu. Tak powstało Lecę w Kulki – sala zabaw, gdzie zasady grawitacji (i dorosłości) na chwilę przestają obowiązywać."
              icon={<Star style={{ color: '#52abff' }} />}
              ctaLabel="Odwiedź Lecę w Kulki"
              ctaHref="https://lecewkulki.eu"
              accentColor="#52abff" // ✅ Błękit zgodny z Twoją prośbą
            />
          </div>
        </section>
{/* --- SEKCJA: CZY WIESZ ŻE (FUN FACT) --- */}
<section className="py-12 px-6 relative">
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="max-w-4xl mx-auto relative group"
  >
    {/* Poświata pod kartą */}
    <div className="absolute inset-0 bg-linear-to-r from-[#BF2024]/10 to-[#0055ff]/10 rounded-[3.5rem] blur-3xl -z-10 opacity-50 group-hover:opacity-100 transition-opacity" />
    
    <div className="bg-white/60 backdrop-blur-xl border-2 border-white/50 p-10 md:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-gray-900">
      <div className="flex flex-col md:flex-row items-center gap-10 text-center md:text-left relative z-10">
        <div className="w-24 h-24 shrink-0 bg-yellow-400 rounded-[2rem] flex items-center justify-center shadow-lg -rotate-3 group-hover:rotate-6 transition-transform duration-500">
          <Sparkles className="text-white" size={48} strokeWidth={2.5} />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-2xl md:text-4xl font-black font-heading uppercase italic tracking-tighter">
            Czy wiesz, że...
          </h3>
          <p className="text-xl md:text-2xl text-gray-600 font-medium font-body leading-relaxed">
            W trakcie działalności naszego sklepu musieliśmy <span className="font-bold text-gray-900">kilkakrotnie powiększać jego powierzchnię</span>? 
            Wszystko po to, aby pomieścić rosnącą liczbę Waszych ulubionych zabawek i zapewnić każdemu Agentowi przestrzeń do wielkich odkryć!
          </p>
        </div>
      </div>
    </div>
  </motion.div>
</section>
        {/* NASZE WARTOŚCI */}
        <section className="py-24 px-6 bg-white/40 backdrop-blur-md border-y border-white/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black font-heading text-center mb-16 text-gray-900 uppercase italic">
              Zasady Naszej Drużyny
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ValueCard 
                icon={<Heart />} 
                title="Relacje" 
                desc="Znamy naszych klientów po imieniu. Jesteśmy częścią lokalnej społeczności."
                color="#BF2024"
              />
              <ValueCard 
                icon={<CheckCircle2 />} 
                title="Jakość" 
                desc="Wybieramy tylko bezpieczne i certyfikowane produkty od sprawdzonych marek."
                color="#0055ff"
              />
              <ValueCard 
                icon={<Users />} 
                title="Ekspercka Wiedza" 
                desc="Doradzamy, bo sami kochamy gry i zabawki. Wiemy, co jest na topie."
                color="#22c55e"
              />
            </div>
          </div>
        </section>

        {/* FINALNE CTA */}
        <section className="py-32 px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="max-w-5xl mx-auto p-12 bg-zinc-900 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden text-center"
          >
            <div className="absolute inset-0 bg-linear-to-br from-[#BF2024]/10 to-[#0055ff]/10" />
            <h3 className="text-4xl md:text-6xl font-black font-heading mb-6 relative z-10 uppercase italic">Wystarczy czytania...</h3>
            <p className="text-xl text-zinc-400 mb-10 relative z-10 font-medium">Czas na wspólną zabawę! Odwiedź nas w Białobrzegach.</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center relative z-10">
              <a href="https://maps.app.goo.gl/xLsL43gW4PQ6dkUAA" className="px-10 py-5 bg-white text-zinc-900 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2">
                <Navigation size={20} /> Jak dojechać?
              </a>
              <a href="tel:+48604208193" className="px-10 py-5 border-2 border-white/20 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-white">
                <Phone size={20} /> Zadzwoń do nas
              </a>
            </div>
          </motion.div>
        </section>

        <Footer />
      </div>
    </main>
  )
}

// --- POMOCNICZE KOMPONENTY (Z NAPRAWIONYM TYPOWANIEM) ---

function StatCard({ value, label, delay }: { value: string, label: string, delay: number }) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        whileHover={{ 
          scale: 1.05, 
          rotate: [0, -1, 1, 0],
          transition: { duration: 0.3 } 
        }}
        className="relative p-8 bg-white/60 backdrop-blur-md border border-white/50 rounded-[2.5rem] text-center shadow-xl group overflow-hidden"
      >
        <div className="absolute inset-0 bg-linear-to-br from-[#BF2024]/5 to-[#0055ff]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: "spring" }}
            className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff] font-heading mb-2"
          >
            {value}
          </motion.div>
          <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-gray-900 transition-colors">
            {label}
          </div>
        </div>
  
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#0055ff] opacity-20 group-hover:opacity-100 group-hover:scale-150 transition-all" />
      </motion.div>
    )
}

function TimelineItem({ 
    year, 
    title, 
    desc, 
    icon, 
    reversed = false, 
    ctaLabel, 
    ctaHref, 
    accentColor 
}: { 
    year: string, 
    title: string, 
    desc: string, 
    icon: React.ReactNode, 
    reversed?: boolean, 
    ctaLabel?: string, 
    ctaHref?: string, 
    accentColor?: string 
}) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: reversed ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className={`flex flex-col md:flex-row items-center gap-10 ${reversed ? 'md:flex-row-reverse text-right' : 'text-left'}`}
      >
        <div className="w-24 h-24 shrink-0 bg-white/80 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border border-white z-10 group-hover:rotate-12 transition-transform">
          {/* ✅ NAPRAWA TS: Rzutowanie na any zapobiega błędom właściwości 'size' */}
          {React.cloneElement(icon as React.ReactElement<any>, { size: 40, strokeWidth: 2.5 })}
        </div>
        <div className="flex-1 space-y-4">
          <span className="text-3xl font-black text-gray-7S00 font-heading italic opacity-50">{year}</span>
          <h3 className="text-4xl font-black text-gray-900 font-heading leading-none">{title}</h3>
          <p className="text-gray-600 font-medium font-body text-xl leading-relaxed">{desc}</p>
          
          {ctaLabel && ctaHref && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className={`flex ${reversed ? 'justify-end' : 'justify-start'} pt-2`}
            >
              <Link 
                href={ctaHref} 
                target="_blank"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-lg hover:scale-105 transition-all duration-300"
                style={{ backgroundColor: accentColor || '#BF2024' }}
              >
                <span>{ctaLabel}</span>
                <ArrowUpRight size={16} strokeWidth={3} />
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    )
}

function ValueCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <div className="p-10 bg-white/80 rounded-[3rem] border border-white shadow-xl hover:shadow-2xl transition-all group backdrop-blur-sm">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white group-hover:rotate-6 transition-transform shadow-lg" style={{ backgroundColor: color }}>
        {/* ✅ NAPRAWA TS: Rzutowanie na any dla właściwości ikony */}
        {React.cloneElement(icon as React.ReactElement<any>, { size: 32, strokeWidth: 2.5 })}
      </div>
      <h4 className="text-2xl font-black text-gray-900 mb-4 font-heading">{title}</h4>
      <p className="text-gray-600 font-medium leading-relaxed font-body">{desc}</p>
    </div>
  )
}