'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { 
  Gift, 
  Ticket, 
  ShoppingBag, 
  Zap, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  Star
} from 'lucide-react'
import MagicBento from '@/components/ui/MagicBento'
import Particles from "@/components/Particles"
import { RibbonsBg } from "@/components/Ribbons"
import Footer from '@/components/ui/Footer'

// --- PRZYKŁADOWE NAGRODY (Możesz je przenieść do tabeli 'rewards' w Supabase) ---
const REWARDS = [
  {
    id: 1,
    title: "Rabat -10% na zakupy",
    desc: "Jednorazowy kod rabatowy na dowolną zabawkę w Sklepie Urwis.",
    cost: 500,
    icon: <ShoppingBag className="text-blue-400" />,
    type: "Rabat"
  },
  {
    id: 2,
    title: "Darmowe 30 min w Kulkach",
    desc: "Dodatkowy czas zabawy w sali 'Lecę w Kulki'.",
    cost: 1300,
    icon: <Zap className="text-yellow-400" />,
    type: "Voucher"
  },
  {
    id: 3,
    title: "Zestaw Naklejek Agenta",
    desc: "Limitowany arkusz naklejek z Agentem U do odbioru w sklepie.",
    cost: 300,
    icon: <Star className="text-purple-400" />,
    type: "Gadżet"
  },
  {
    id: 4,
    title: "Darmowy Bilet (1h)",
    desc: "Pełna godzina szaleństwa w basenie z kulkami.",
    cost: 2500,
    icon: <Ticket className="text-red-400" />,
    type: "Bilet"
  }
];

export default function RewardsPage() {
  const supabase = createClient();
  const [userKuleczki, setUserKuleczki] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getBalance() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Pobieramy stan Kuleczek z Twojej tabeli 'profiles'
        const { data } = await supabase
          .from('profiles')
          .select('kuleczki')
          .eq('id', user.id)
          .single();
        
        if (data) setUserKuleczki(data.kuleczki);
      }
      setLoading(false);
    }
    getBalance();
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-zinc-950 overflow-x-hidden">
      
      {/* TŁO */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <RibbonsBg colors={["#BF2024", "#0055ff"]} />
        <Particles particleCount={40} particleColors={["#BF2024", "#0055ff"]} alphaParticles speed={0.05} />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* HEADER I BALANS */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 text-center md:text-left">
            <div>
              <h1 className="text-6xl md:text-8xl font-black font-heading text-white italic uppercase tracking-tighter mb-4">
                Katalog <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">Nagród</span>
              </h1>
              <p className="text-zinc-400 text-xl font-medium">Wymieniaj zebrane Kuleczki na realne korzyści!</p>
            </div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-2xl border-2 border-white/20 rounded-[2.5rem] p-6 flex items-center gap-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Zap size={32} className="fill-white" />
              </div>
              <div>
                <div className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Twój Balans</div>
                <div className="text-4xl font-black text-white font-heading">
                  {loading ? '---' : userKuleczki?.toLocaleString() || 0}
                  <span className="text-sm ml-2 text-blue-400">KULECZEK</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* GRID NAGRÓD */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {REWARDS.map((reward) => {
              const canAfford = userKuleczki !== null && userKuleczki >= reward.cost;

              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="group relative"
                >
                  <MagicBento 
                    glowColor={canAfford ? "59, 130, 246" : "239, 68, 68"}
                    className={`h-full rounded-[3rem] bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 flex flex-col justify-between transition-all ${!canAfford && 'grayscale-[0.5]'}`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                          {reward.icon}
                        </div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                          {reward.type}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-black text-white font-heading mb-3 leading-tight uppercase italic">
                        {reward.title}
                      </h3>
                      <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8">
                        {reward.desc}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Koszt:</span>
                        <span className={`text-xl font-black ${canAfford ? 'text-white' : 'text-red-500'}`}>
                          {reward.cost} <span className="text-[10px]">PKT</span>
                        </span>
                      </div>

                      <button 
                        disabled={!canAfford}
                        className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-2
                          ${canAfford 
                            ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20' 
                            : 'bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5'}
                        `}
                      >
                        {canAfford ? (
                          <>Odbierz <ArrowRight size={16} /></>
                        ) : (
                          <>Zablokowane <Lock size={14} /></>
                        )}
                      </button>
                    </div>
                  </MagicBento>
                </motion.div>
              )
            })}
          </div>

        </div>
      </div>
      <Footer variant="dark" />
    </main>
  )
}