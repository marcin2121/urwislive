'use client'

import { motion } from 'framer-motion'
import { 
  User, 
  Users, 
  Swords, 
  MonitorPlay, 
  Trophy, 
  ChevronRight,
  Zap,
  Timer
} from 'lucide-react'
import Link from 'next/link'
import Particles from "@/components/Particles"
import { RibbonsBg } from "@/components/Ribbons"
import Footer from '@/components/ui/Footer'

const QUIZ_MODES = [
  {
    id: 'single',
    title: "Solo Misja",
    desc: "Spokojna gra jednoosobowa. Trenuj wiedzę i zbieraj Kuleczki bez pośpiechu.",
    icon: <User size={40} />,
    color: "#22c55e", // Zielony
    href: "/quiz/single",
    badge: "Solo"
  },
  {
    id: 'live',
    title: "Live Party",
    desc: "Graj na żywo z przyjaciółmi (2-8 osób). Kto pierwszy, ten lepszy!",
    icon: <Users size={40} />,
    color: "#0055ff", // Niebieski
    href: "/quiz/live/create",
    badge: "LIVE"
  },
  {
    id: 'challenge',
    title: "Pojedynek 1v1",
    desc: "10 sekund na pytanie. Wyślij wyzwanie znajomemu i sprawdź, kto jest szybszy.",
    icon: <Swords size={40} />,
    color: "#f59e0b", // Pomarańczowy
    href: "/quiz/challenge",
    badge: "1v1 Async"
  },
  {
    id: 'master',
    title: "Party Master",
    desc: "Tryb Kahoot dla szkół i sal zabaw. Wyświetl na projektorze, graj telefonem!",
    icon: <MonitorPlay size={40} />,
    color: "#a855f7", // Fioletowy
    href: "/quiz/party-master",
    badge: "Projector"
  }
];

export default function QuizHub() {
  return (
    <main className="relative min-h-screen w-full bg-zinc-950 overflow-x-hidden">
      
      {/* --- TŁO GAMER --- */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <Particles particleCount={80} particleColors={["#0055ff", "#BF2024", "#a855f7"]} alphaParticles speed={0.05} />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-20">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-6xl md:text-8xl font-black font-heading text-white tracking-tighter italic uppercase mb-6"
            >
              Wybierz <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-purple-500">Tryb Gry</span>
            </motion.h1>
            <p className="text-zinc-400 text-xl font-medium max-w-2xl mx-auto">
              Gotowy na wyzwanie, Agencie? Wybierz sposób, w jaki chcesz zdobywać Kuleczki.
            </p>
          </div>

          {/* Grid Trybów */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {QUIZ_MODES.map((mode, i) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[80px] opacity-10 transition-opacity group-hover:opacity-30" style={{ backgroundColor: mode.color }} />
                
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left relative z-10">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl shrink-0" style={{ backgroundColor: mode.color }}>
                    {mode.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                      <h2 className="text-3xl font-black text-white font-heading uppercase italic">{mode.title}</h2>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black text-white border border-white/10 uppercase tracking-widest">{mode.badge}</span>
                    </div>
                    <p className="text-zinc-500 font-medium mb-6">{mode.desc}</p>
                    <Link href={mode.href} className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] transition-all group-hover:gap-4" style={{ color: mode.color }}>
                      Wybierz tryb <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* --- LEADERBOARD PREVIEW --- */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/80 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/10 shadow-3xl"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <Trophy size={40} className="text-yellow-400" />
                <h3 className="text-3xl font-black text-white font-heading italic uppercase">Top Agenci Tygodnia</h3>
              </div>
              <Link href="/leaderboard" className="text-xs font-black uppercase text-zinc-500 hover:text-white transition-colors">Pełna Lista</Link>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map((pos) => (
                <div key={pos} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <span className={`text-xl font-black ${pos === 1 ? 'text-yellow-400' : 'text-zinc-500'}`}>#{pos}</span>
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500" />
                    <span className="text-white font-bold tracking-tight">Agent_00{pos}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-black">2,450</div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Kuleczek</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
      <Footer variant="dark" />
    </main>
  );
}