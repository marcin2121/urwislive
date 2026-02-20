'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Share2, MessageCircle, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react'
import Link from 'next/link'

function ShareContent() {
  const searchParams = useSearchParams()
  const [sharedData, setSharedData] = useState({ title: '', text: '', url: '' })

  useEffect(() => {
    // Wyciągamy dane przesłane przez systemowy Share
    const title = searchParams.get('title') || ''
    const text = searchParams.get('text') || ''
    const url = searchParams.get('url') || ''

    setSharedData({ title, text, url })
  }, [searchParams])

  const messageToUrwis = encodeURIComponent(
    `Cześć Urwis! Czy macie u siebie to: ${sharedData.title} ${sharedData.text} ${sharedData.url}?`
  )

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center bg-transparent">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/40 backdrop-blur-3xl border-2 border-white p-10 rounded-[3.5rem] shadow-2xl text-center"
      >
        <div className="w-20 h-20 bg-[#0055ff] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl text-white">
          <Share2 size={32} />
        </div>

        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900 mb-4">
          Udostępniłeś <br />
          <span className="text-[#BF2024]">coś fajnego!</span>
        </h1>

        <div className="bg-white/50 p-6 rounded-2xl mb-8 border border-white text-left space-y-2">
          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest italic">Dane z Twojego telefonu:</p>
          <p className="font-bold text-zinc-800 text-sm line-clamp-3">
            {sharedData.title || sharedData.text || sharedData.url}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <a 
            href={`https://wa.me/48604208183?text=${messageToUrwis}`}
            target="_blank"
            className="w-full py-5 bg-[#25D366] text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-lg hover:scale-105 transition-all"
          >
            <MessageCircle size={18} /> Zapytaj nas na WhatsApp
          </a>

          <Link 
            href="/"
            className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-lg hover:scale-105 transition-all"
          >
            <ShoppingBag size={18} /> Wróć do sklepu
          </Link>
        </div>

        <p className="mt-8 text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
           Możemy sprawdzić dla Ciebie dostępność tej zabawki!
        </p>
      </motion.div>
    </main>
  )
}

export default function ShareTargetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <ShareContent />
    </Suspense>
  )
}