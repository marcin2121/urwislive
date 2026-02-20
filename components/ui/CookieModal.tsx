'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Info } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function CookieModal() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const checkConsent = () => {
      const consent = localStorage.getItem('urwis_cookie_accepted')
      const introShown = sessionStorage.getItem('urwis_intro_shown')

      if (consent === null && introShown === 'true') {
        setTimeout(() => setIsVisible(true), 1200)
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
        <>
          {/* 🚀 OPTYMALIZACJA: Usunięto backdrop-blur. Zamiast tego ciemniejsze tło bg-black/80 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/80"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-2xl bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden">
              
              {/* 🚀 OPTYMALIZACJA: Zamiast blur-[120px] -> radial gradient */}
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-[radial-gradient(circle,rgba(0,85,255,0.15)_0%,transparent_70%)] rounded-full" />
              <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[radial-gradient(circle,rgba(191,32,36,0.15)_0%,transparent_70%)] rounded-full" />

              <div className="relative z-10 flex flex-col items-center text-center">
                
                <div className="relative w-56 h-56 md:w-72 md:h-72 mb-4 drop-shadow-xl">
                  <Image 
                    src="/urwis-cookies.webp" 
                    alt="Urwis je ciastka" 
                    fill
                    className="object-contain"
                    // 🚀 USUNIĘTO priority. Modal nie jest widoczny od razu.
                  />
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-zinc-900 uppercase italic tracking-tighter mb-4 leading-none">
                  Ups! Złapaliśmy Cię na <span className="text-blue-600">CIASTKACH!</span>
                </h2>

                <p className="text-zinc-600 font-bold uppercase italic text-sm md:text-lg leading-tight mb-8 max-w-lg">
                  Urwis uwielbia ciacha! 🍪 Używamy ich, aby nasza strona działała idealnie. Kliknij „Daj ciacho”, aby przejść dalej!
                </p>

                <div className="flex flex-col w-full gap-3">
                  <button
                    onClick={() => saveConsent('true')}
                    className="w-full py-5 bg-zinc-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                  >
                    <Check size={20} strokeWidth={4} /> 
                    Daj ciacho! (Akceptuję)
                  </button>

                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                      onClick={() => saveConsent('false')}
                      className="flex-1 py-4 bg-zinc-100 text-zinc-400 rounded-[1.2rem] font-black uppercase tracking-widest text-[10px] hover:text-red-500 transition-all flex items-center justify-center gap-2"
                    >
                      <X size={14} strokeWidth={3} /> Odrzuć zbędne
                    </button>

                    <Link 
                      href="/regulamin"
                      className="flex-1 py-4 bg-zinc-100 text-zinc-400 rounded-[1.2rem] font-black uppercase tracking-widest text-[10px] hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Info size={14} strokeWidth={3} /> Co to za ciastka?
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}