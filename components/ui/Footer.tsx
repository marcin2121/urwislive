'use client'

import { motion } from 'framer-motion'
import { 
  MapPin, Phone, Mail, Facebook, 
  Instagram, ArrowRight, Store, Gamepad2, Globe 
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 pb-10 px-4 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="bg-white/20 backdrop-blur-2xl border border-white/40 rounded-[3rem] p-10 md:p-16 shadow-2xl overflow-hidden">
          
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#0055ff]/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Image 
                  src="/logo.png" 
                  alt="Logo Sklep Urwis" 
                  width={40} 
                  height={40} 
                  className="object-contain"
                />
                <div className="text-3xl font-black tracking-tighter italic leading-none">
                  <span className="text-[#BF2024]">SKLEP</span>
                  <span className="text-[#0055ff]"> URWIS</span>
                </div>
              </div>
              <p className="text-zinc-700 font-bold text-sm leading-relaxed uppercase italic">
                Twoje lokalne centrum zabawy i kreatywności. Od najlepszych zabawek po pełną wyprawkę szkolną i biurową. Działamy z pasją od 2007 roku.
              </p>
              <div className="flex gap-4">
                <SocialIcon href="https://facebook.com/sklepurwis.bialobrzegi" icon={<Facebook size={20} />} ariaLabel="Profil Facebook" />
                <SocialIcon href="https://instagram.com/sklepurwis.bialobrzegi" icon={<Instagram size={20} />} ariaLabel="Profil Instagram" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[#BF2024] font-black uppercase tracking-widest text-xs italic">
                <Store size={16} /> SKLEP URWIS
              </div>
              <ul className="flex flex-col gap-5">
                <FooterLink href="https://maps.app.goo.gl/TwójLinkDoMapy" icon={<MapPin size={18} />} label="ul. Reymonta 38A" sublabel="Białobrzegi 26-800" />
                <FooterLink href="tel:+48604208183" icon={<Phone size={18} />} label="+48 604 208 183" />
                <FooterLink href="mailto:kontakt@sklep-urwis.pl" icon={<Mail size={18} />} label="kontakt@sklep-urwis.pl" />
              </ul>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[#0055ff] font-black uppercase tracking-widest text-xs italic">
                <Gamepad2 size={16} /> Lecę w Kulki
              </div>
              <ul className="flex flex-col gap-5">
                <FooterLink 
                  href="https://maps.app.goo.gl/xyeqFtwUAvd2VN898" 
                  icon={<MapPin size={18} className="text-[#0055ff]" />} 
                  label="ul. Targowicka 4" 
                  sublabel="Białobrzegi 26-800" 
                />
                <FooterLink 
                  href="tel:+48666504555" 
                  icon={<Phone size={18} className="text-[#0055ff]" />} 
                  label="+48 666 504 555" 
                />
                <FooterLink 
                  href="https://lecewkulki.eu/" 
                  icon={<Globe size={18} className="text-[#0055ff]" />} 
                  label="lecewkulki.eu" 
                  sublabel="Strona Sali Zabaw" 
                />
              </ul>
            </div>

            <div className="space-y-6">
              <div className="text-zinc-900 font-black uppercase tracking-widest text-xs italic">
                Szybkie Linki
              </div>
              <ul className="flex flex-col gap-3">
                <li><QuickLink href="/oferta">Nasza Oferta</QuickLink></li>
                <li><QuickLink href="/o-nas">O nas</QuickLink></li>
                <li><QuickLink href="/kontakt">Kontakt</QuickLink></li>
                <li><QuickLink href="/regulamin">Regulamin</QuickLink></li>
              </ul>
            </div>

          </div>

          <div className="mt-16 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic text-center md:text-left">
            <div className="space-y-2">
              <div>© {currentYear} SKLEP URWIS. ALL RIGHTS RESERVED.</div>
              {/* POPRAWKA KONTRASTU: Usunięto opacity-60, zastosowano stały, dostępny kolor tekstu */}
              <div className="text-zinc-500 font-semibold">NIP: 7981093937 | REGON: 671959384</div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <span> MADE WITH ❤️ IN BIAŁOBRZEGI </span>             
              {/* POPRAWKA A11Y: Usunięto błędne aria-label, które powodowało "mismatch" */}
              <a href="#" className="hover:text-zinc-900 transition-colors">
                  DESIGN & CODE BY MARCIN MOLENDA
              </a>
            </div>
          </div>
          
        </div>
      </div>
    </footer>
  )
}

function SocialIcon({ href, icon, ariaLabel }: { href: string, icon: React.ReactNode, ariaLabel: string }) {
  return (
    <Link 
      href={href} 
      target="_blank"
      aria-label={ariaLabel}
      className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center text-zinc-900 hover:bg-[#0055ff] hover:text-white transition-all shadow-sm border border-white/50"
    >
      {icon}
    </Link>
  )
}

function FooterLink({ href, icon, label, sublabel }: { href: string, icon: any, label: string, sublabel?: string }) {
  const isBlue = icon.props.className?.includes('text-[#0055ff]');
  
  return (
    <li>
      <a 
        href={href}
        target={href.startsWith('http') ? "_blank" : "_self"}
        rel={href.startsWith('http') ? "noopener noreferrer" : ""}
        className="flex gap-4 group cursor-pointer transition-all hover:translate-x-1"
      >
        <div className={`${isBlue ? 'text-[#0055ff]' : 'text-[#bf2024]'} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="flex flex-col leading-none text-left">
          <span className={`text-zinc-900 font-bold text-sm tracking-tight ${isBlue ? 'group-hover:text-[#0055ff]' : 'group-hover:text-[#bf2024]'}`}>
            {label}
          </span>
          {sublabel && <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">{sublabel}</span>}
        </div>
      </a>
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