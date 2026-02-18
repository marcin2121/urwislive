'use client'

import { motion } from 'framer-motion'
import { 
  MapPin, Phone, Mail, Facebook, 
  Instagram, ArrowRight, Store, Gamepad2, Globe 
} from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 pb-10 px-4 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="bg-white/20 backdrop-blur-2xl border border-white/40 rounded-[3rem] p-10 md:p-16 shadow-2xl overflow-hidden">
          
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#0055ff]/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            
            {/* 1. BRAND & MOTTO */}
            <div className="space-y-6">
              <div className="text-3xl font-black tracking-tighter italic">
                <span className="text-[#BF2024]">SKLEP</span>
                <span className="text-[#0055ff]"> URWIS</span>
              </div>
              <p className="text-zinc-700 font-bold text-sm leading-relaxed uppercase italic">
                Twoje lokalne centrum zabawy i kreatywności. Od najlepszych zabawek po pełną wyprawkę szkolną i biurową. Działamy z pasją od 2007 roku.
              </p>
              <div className="flex gap-4">
                <SocialIcon href="https://facebook.com/sklepurwis.bialobrzegi" icon={<Facebook size={20} />} />
                <SocialIcon href="https://instagram.com/sklepurwis.bialobrzegi" icon={<Instagram size={20} />} />
              </div>
            </div>

            {/* 2. SKLEP URWIS (Reymonta) */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[#BF2024] font-black uppercase tracking-widest text-xs italic">
                <Store size={16} /> SKLEP URWIS
              </div>
              <ul className="flex flex-col gap-5">
                <FooterLink icon={<MapPin size={18} />} label="ul. Reymonta 38A" sublabel="26-800 Białobrzegi" />
                <FooterLink icon={<Phone size={18} />} label="+48 604 208 193" />
                <FooterLink icon={<Mail size={18} />} label="kontakt@sklep-urwis.pl" />
              </ul>
            </div>

            {/* 3. SALA ZABAW (Targowicka) */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[#0055ff] font-black uppercase tracking-widest text-xs italic">
                <Gamepad2 size={16} /> Lecę w Kulki
              </div>
              {/* ✅ ZMIANA: flex-col i gap-5 dla lepszych odstępów */}
              <ul className="flex flex-col gap-5">
                {/* LINK DO MAPY */}
                <a href="https://maps.app.goo.gl/xyeqFtwUAvd2VN898" target="_blank" rel="noopener noreferrer" className="block">
                  <FooterLink 
                    icon={<MapPin size={18} className="text-[#0055ff]" />} 
                    label="ul. Targowicka 4" 
                    sublabel="Białobrzegi" 
                    isLink 
                  />
                </a>

                <FooterLink icon={<Phone size={18} className="text-[#0055ff]" />} label="+48 666 504 555" />
                
                {/* LINK DO STRONY WWW */}
                <a href="https://lecewkulki.eu/" target="_blank" rel="noopener noreferrer" className="block">
                  <FooterLink 
                    icon={<Globe size={18} className="text-[#0055ff]" />} 
                    label="lecewkulki.eu" 
                    sublabel="Strona Sali Zabaw" 
                    isLink
                  />
                </a>
              </ul>
            </div>

            {/* 4. NAWIGACJA */}
            <div className="space-y-6">
              <div className="text-zinc-900 font-black uppercase tracking-widest text-xs italic">
                Szybkie Linki
              </div>
              <ul className="flex flex-col gap-3">
                <QuickLink href="/oferta">Nasza Oferta</QuickLink>
                <QuickLink href="/o-nas">O nas</QuickLink>
                <QuickLink href="/kontakt">Kontakt</QuickLink>
                <QuickLink href="/regulamin">Regulamin</QuickLink>
              </ul>
            </div>

          </div>

          {/* DOLNY PASEK */}
          <div className="mt-16 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">
            <div>© {currentYear} SKLEP URWIS. ALL RIGHTS RESERVED.</div>
            <div className="flex items-center gap-2">
              <span> MADE WITH ❤️ IN BIAŁOBRZEGI </span>             
            </div>
          </div>
          
       <a href="#"><span className='text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic'> MARCIN MOLENDA</span></a>
        </div>
      </div>
    </footer>
  )
}

// --- POMOCNICZE KOMPONENTY ---

function SocialIcon({ href, icon }: { href: string, icon: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      target="_blank"
      className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center text-zinc-900 hover:bg-[#0055ff] hover:text-white transition-all shadow-sm border border-white/50"
    >
      {icon}
    </Link>
  )
}

function FooterLink({ icon, label, sublabel, isLink }: { icon: React.ReactNode, label: string, sublabel?: string, isLink?: boolean }) {
  return (
    <li className={`flex gap-4 group cursor-pointer transition-all ${isLink ? 'hover:translate-x-1' : ''}`}>
      <div className={`${isLink ? 'text-[#0055ff]' : 'text-[#BF2024]'} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="flex flex-col leading-none">
        <span className={`text-zinc-900 font-bold text-sm tracking-tight ${isLink ? 'group-hover:text-[#0055ff]' : ''}`}>{label}</span>
        {sublabel && <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">{sublabel}</span>}
      </div>
    </li>
  )
}

function QuickLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="text-zinc-600 hover:text-zinc-900 font-bold text-sm transition-colors flex items-center gap-2 group italic uppercase"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 group-hover:bg-[#BF2024] transition-colors" />
      {children}
    </Link>
  )
}