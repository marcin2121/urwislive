"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

const DARK_ROUTES = ["/profil", "/system", "/ustawienia", "/salazabaw"];

export default function Footer() {
  const pathname = usePathname();
  const isDarkPage = DARK_ROUTES.some(route => pathname.startsWith(route));

  // Dynamiczne klasy kolorystyczne
  const bgColor = isDarkPage ? "bg-zinc-950" : "bg-white";
  const textColor = isDarkPage ? "text-zinc-400" : "text-zinc-600";
  const headingColor = isDarkPage ? "text-white" : "text-zinc-900";
  const borderColor = isDarkPage ? "border-white/5" : "border-zinc-100";
  const iconBg = isDarkPage ? "bg-white/5 text-white hover:bg-white/10" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200";

  return (
    <footer className={`${bgColor} border-t ${borderColor} pt-20 pb-10 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* LOGO I OPIS */}
          <div className="md:col-span-1 space-y-6">
            <Link href="/" className="inline-block">
              <Image 
                src="/logo.png" 
                alt="Urwis Logo" 
                width={50} 
                height={50} 
                className={isDarkPage ? "brightness-110" : ""}
              />
            </Link>
            <p className={`text-sm font-medium leading-relaxed ${textColor}`}>
              Najlepsze zabawki i niezapomniana przygoda w Białobrzegach. 
              Dołącz do Klubu Urwisa i zbieraj nagrody!
            </p>
            <div className="flex gap-3">
              <SocialIcon icon={<Facebook size={18}/>} href="#" className={iconBg} />
              <SocialIcon icon={<Instagram size={18}/>} href="#" className={iconBg} />
            </div>
          </div>

          {/* SZYBKIE LINKI */}
          <div className="space-y-6">
            <h4 className={`text-sm font-black uppercase tracking-widest ${headingColor}`}>Sklep</h4>
            <ul className="space-y-4">
              <FooterLink href="/oferta" label="Pełna Oferta" isDark={isDarkPage} />
              <FooterLink href="/oferta/promocje" label="Promocje" isDark={isDarkPage} />
              <FooterLink href="/o-nas" label="O nas" isDark={isDarkPage} />
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className={`text-sm font-black uppercase tracking-widest ${headingColor}`}>Klub Urwisa</h4>
            <ul className="space-y-4">
              <FooterLink href="/misje" label="Misje i Wyzwania" isDark={isDarkPage} />
              <FooterLink href="/nagrody" label="Katalog Nagród" isDark={isDarkPage} />
              <FooterLink href="/system" label="System Profitów" isDark={isDarkPage} />
            </ul>
          </div>

          {/* KONTAKT */}
          <div className="space-y-6">
            <h4 className={`text-sm font-black uppercase tracking-widest ${headingColor}`}>Kontakt</h4>
            <ul className="space-y-4">
              <ContactItem icon={<MapPin size={16}/>} text="ul. Targowicka 4, Białobrzegi" isDark={isDarkPage} />
              <ContactItem icon={<Phone size={16}/>} text="+48 123 456 789" isDark={isDarkPage} />
              <ContactItem icon={<Mail size={16}/>} text="kontakt@urwis.pl" isDark={isDarkPage} />
            </ul>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className={`pt-10 border-t ${borderColor} flex flex-col md:flex-row justify-between items-center gap-4`}>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${textColor}`}>
  © {new Date().getFullYear()} URWIS. WSZYSTKIE PRAWA ZASTRZEŻONE.
</p>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
            <Link href="/regulamin" className={`${textColor} hover:text-blue-500 transition-colors`}>Regulamin</Link>
            <Link href="/polityka" className={`${textColor} hover:text-blue-500 transition-colors`}>Prywatność</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// POMOCNICZE KOMPONENTY
function FooterLink({ href, label, isDark }: { href: string, label: string, isDark: boolean }) {
  return (
    <li>
      <Link 
        href={href} 
        className={`text-sm font-bold transition-colors ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-500 hover:text-black'}`}
      >
        {label}
      </Link>
    </li>
  );
}

function ContactItem({ icon, text, isDark }: { icon: any, text: string, isDark: boolean }) {
  return (
    <li className={`flex items-center gap-3 text-sm font-bold ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
      <span className={isDark ? "text-blue-400" : "text-blue-600"}>{icon}</span>
      {text}
    </li>
  );
}

function SocialIcon({ icon, href, className }: { icon: any, href: string, className: string }) {
  return (
    <a 
      href={href} 
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${className}`}
    >
      {icon}
    </a>
  );
}