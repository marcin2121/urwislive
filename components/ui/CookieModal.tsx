'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Info, Cookie } from 'lucide-react' // 🚀 Ikona Cookie musi być tutaj!
import Link from 'next/link'
import Image from 'next/image'

export default function CookieModal() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const checkConsent = () => {
      const consent = localStorage.getItem('urwis_cookie_accepted')
      const introShown = sessionStorage.getItem('urwis_intro_shown')

      if (consent === null && introShown === 'true') {
        const timer = setTimeout(() => setIsVisible(true), 800)
        return () => clearTimeout(timer)
      }
    }

    checkConsent()
    window.addEventListener('urwis_intro_finished', checkConsent)
    return () => window.removeEventListener('urwis_intro_finished', checkConsent)
  }, [])

  const saveConsent = (status: 'true' | 'false') => {
    localStorage.setItem('urwis_cookie_accepted', status)
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-[2px]"
          />

          {/* Kontener Modala */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative w-full max-w-2xl bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Gradienty w tle */}
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-[radial-gradient(circle,rgba(0,85,255,0.15)_0%,transparent_70%)] rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[radial-gradient(circle,rgba(191,32,36,0.15)_0%,transparent_70%)] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.div 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-56 h-56 md:w-64 md:h-64 mb-4 drop-shadow-2xl"
              >
                <Image 
                  src="/urwis-cookies.webp" 
                  alt="Urwis je ciastka" 
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 224px, 256px"
                />
              </motion.div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center gap-2 text-[#BF2024] font-black uppercase tracking-widest text-[10px]">
                  <Cookie size={14} />
                  <span>Polityka plików cookies</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-zinc-900 uppercase italic tracking-tighter leading-[0.9]">
                  Złapaliśmy Cię na <span className="text-blue-600">CIASTKACH!</span>
                </h2>

                <p className="text-zinc-600 font-bold uppercase italic text-sm md:text-base leading-tight max-w-md mx-auto">
                  Urwis uwielbia ciacha! 🍪 Używamy technologii takich jak <span className="text-zinc-900 underline decoration-blue-500/30">pliki cookies</span>, aby nasza strona działała idealnie, była bezpieczna i abyśmy mogli Cię lepiej poznawać. Kliknij „Daj ciacho”, aby przejść dalej!
                </p>
              </div>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={() => saveConsent('true')}
                  className="w-full py-5 bg-zinc-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group pointer-events-auto"
                >
                  <Check size={20} strokeWidth={4} className="group-hover:rotate-12 transition-transform" /> 
                  Daj ciacho! (Akceptuję cookies)
                </button>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => saveConsent('false')}
                    className="flex-1 py-4 bg-zinc-100 text-zinc-400 rounded-[1.2rem] font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 hover:text-red-500 transition-all flex items-center justify-center gap-2 pointer-events-auto"
                  >
                    <X size={14} strokeWidth={3} /> Odrzuć zbędne
                  </button>

                  <Link 
                    href="/polityka-prywatnosci"
                    className="flex-1 py-4 bg-zinc-100 text-zinc-400 rounded-[1.2rem] font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 hover:text-blue-600 transition-all flex items-center justify-center gap-2 pointer-events-auto"
                  >
                    <Info size={14} strokeWidth={3} /> Co to za ciastka?
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}