'use client'

import { motion } from 'framer-motion'
import { Facebook, Instagram, Mail, Phone, MapPin, ArrowUpRight, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// Dodajemy prop 'variant'
export default function Footer({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const currentYear = new Date().getFullYear();
  
  // Dynamiczne klasy kolorystyczne
  const isDark = variant === 'dark';
  const textColor = isDark ? 'text-zinc-400' : 'text-gray-600';
  const headingColor = isDark ? 'text-white' : 'text-gray-900';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200/50';

  return (
    <footer className={`relative pt-32 pb-10 px-6 backdrop-blur-xl border-t transition-colors duration-500 z-10 
      ${isDark ? 'bg-zinc-950/50 border-white/10' : 'bg-white/30 border-white/50'}`}>
      
      {/* Poświaty tła */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className={`absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-[100px] ${isDark ? 'bg-blue-500/20' : 'bg-[#BF2024]'}`} />
        <div className={`absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-[100px] ${isDark ? 'bg-purple-500/20' : 'bg-[#0055ff]'}`} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <Image src="/logo.png" alt="Urwis Logo" width={80} height={80} className="drop-shadow-lg" />
            </Link>
            <p className={`${textColor} font-medium font-body leading-relaxed`}>
              Twoje lokalne centrum zabawy w Białobrzegach. Tworzymy uśmiechy od 2007 roku.
            </p>
            <div className="flex gap-4">
              <SocialIcon href="#" icon={<Facebook size={20} />} color="#1877F2" isDark={isDark} />
              <SocialIcon href="#" icon={<Instagram size={20} />} color="#E4405F" isDark={isDark} />
            </div>
          </div>

          <div>
            <h4 className={`${headingColor} font-black uppercase tracking-widest text-sm mb-8 font-heading`}>Mapa Strony</h4>
            <ul className="space-y-4">
              <FooterLink href="/oferta" label="Nasza Oferta" isDark={isDark} />
              <FooterLink href="/gry" label="Centrum Gier" isDark={isDark} />
              <FooterLink href="/o-nas" label="Poznaj Urwisy" />
              <FooterLink href="/kontakt" label="Kontakt" />
            </ul>
          </div>

          <div>
            <h4 className={`${headingColor} font-black uppercase tracking-widest text-sm mb-8 font-heading`}>Sklep Urwis</h4>
            <ul className={`space-y-4 ${textColor} font-medium`}>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#BF2024] shrink-0 mt-1" />
                <span>ul. Reymonta 38A, Białobrzegi</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#BF2024] shrink-0" />
                <a href="tel:+48604208193" className="hover:text-[#BF2024] transition-colors">+48 604 208 193</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={`${headingColor} font-black uppercase tracking-widest text-sm mb-8 font-heading`}>Lecę w Kulki</h4>
            <ul className={`space-y-4 ${textColor} font-medium`}>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#0055ff] shrink-0 mt-1" />
                <span>ul. Targowicka 4, Białobrzegi</span>
              </li>
              <li className="flex items-center gap-3">
                <ArrowUpRight size={18} className="text-[#0055ff] shrink-0" />
                <a href="https://lecewkulki.eu" target="_blank" className="hover:text-[#0055ff] transition-colors">lecewkulki.eu</a>
              </li>
            </ul>
          </div>
        </div>

        <div className={`pt-8 border-t ${borderColor} flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-widest`}>
          <p className={textColor}>© {currentYear} SKLEP URWIS.</p>
          <div className={`flex items-center gap-2 ${textColor}`}>
            <span>STWORZONE Z</span>
            <Heart size={14} className="text-[#BF2024] fill-[#BF2024]" />
            <span>DLA MAŁYCH I DUŻYCH</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialIcon({ href, icon, color, isDark }: any) {
  return (
    <motion.a
      href={href}
      target="_blank"
      whileHover={{ y: -5, backgroundColor: color, color: '#fff' }}
      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300
        ${isDark ? 'bg-white/5 border-white/10 text-zinc-400' : 'bg-white/50 border-white/50 text-gray-600'}`}
    >
      {icon}
    </motion.a>
  )
}

function FooterLink({ href, label, isDark }: any) {
  return (
    <li>
      <Link href={href} className={`font-bold hover:text-[#BF2024] transition-all flex items-center gap-2 group ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
        <div className="w-1.5 h-1.5 rounded-full bg-[#0055ff] opacity-0 group-hover:opacity-100 transition-all" />
        {label}
      </Link>
    </li>
  )
}