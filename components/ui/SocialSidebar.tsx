'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Zap, ChevronLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string;
  username: string;
  kuleczki: number;
  avatar_style: string;
  avatar_seed: string;
  is_online?: boolean;
}

export default function SocialSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfiles() {
      // Pobieramy top 10 Urwisów z bazy danych
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, kuleczki, avatar_style, avatar_seed')
        .order('kuleczki', { ascending: false })
        .limit(10)

      if (!error && data) {
        setProfiles(data as Profile[])
      }
      setLoading(false)
    }

    if (isOpen) fetchProfiles()
  }, [isOpen, supabase])

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[100] flex items-center">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-zinc-900 border border-r-0 border-white/10 p-3 rounded-l-2xl text-zinc-400 hover:text-white transition-colors shadow-2xl pointer-events-auto"
      >
        {isOpen ? <ChevronLeft className="rotate-180" /> : <Users size={24} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="w-80 h-[80vh] bg-zinc-950/90 backdrop-blur-2xl border-l border-white/10 rounded-l-[3rem] p-8 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto"
          >
            <div className="mb-8">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Klub Urwisa</h3>
              <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1">Najlepsi w tym tygodniu</p>
            </div>

            <div className="flex-grow space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-zinc-500" /></div>
              ) : profiles.length > 0 ? (
                profiles.map((profile) => (
                  <div key={profile.id} className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/5 overflow-hidden transition-transform group-hover:scale-110">
                      <img 
                        src={`https://api.dicebear.com/7.x/${profile.avatar_style}/svg?seed=${profile.avatar_seed}`} 
                        alt={profile.username} 
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="text-xs font-black uppercase tracking-tighter group-hover:text-blue-400 transition-colors">
                        {profile.username}
                      </p>
                      <div className="flex items-center gap-1 text-yellow-500 font-black text-[10px] mt-0.5">
                        <Zap size={10} fill="currentColor" /> {profile.kuleczki.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-zinc-600 text-xs text-center italic">Brak Urwisów w Twojej okolicy...</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}