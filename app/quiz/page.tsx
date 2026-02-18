'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Users, 
  Swords, 
  MonitorPlay, 
  Trophy, 
  ChevronRight,
  Star,
  Zap,
  Loader2,
  User as UserIcon
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Particles from "@/components/Particles"

// --- DEFINICJA TYPÓW DLA RANKINGU ---
interface LeaderData {
  username: string;
  avatar_url: string | null;
  displayScore: number;
}

const QUIZ_MODES = [
  {
    id: 'single',
    title: "Solo Misja",
    desc: "Spokojna gra jednoosobowa. Trenuj wiedzę i zbieraj Kuleczki bez pośpiechu.",
    icon: <User size={40} />,
    color: "#22c55e", 
    href: "/quiz/single",
    badge: "Solo"
  },
  {
    id: 'live',
    title: "Live Party",
    desc: "Graj na żywo z przyjaciółmi (2-8 osób). Kto pierwszy, ten lepszy!",
    icon: <Users size={40} />,
    color: "#0055ff", 
    href: "/quiz/live/create",
    badge: "LIVE"
  },
  {
    id: 'challenge',
    title: "Pojedynek 1v1",
    desc: "10 sekund na pytanie. Wyślij wyzwanie znajomemu i sprawdź, kto jest szybszy.",
    icon: <Swords size={40} />,
    color: "#f59e0b", 
    href: "/quiz/challenge",
    badge: "1v1 Async"
  },
  {
    id: 'master',
    title: "Party Master",
    desc: "Tryb Kahoot dla szkół i sal zabaw. Wyświetl na projektorze, graj telefonem!",
    icon: <MonitorPlay size={40} />,
    color: "#a855f7", 
    href: "/quiz/party-master",
    badge: "Projector"
  }
];

export default function QuizHub() {
  const [topAgents, setTopAgents] = useState<LeaderData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // --- FORMUŁA WIELKIEGO WYNIKU ---
  const calculateBigScore = (correct: number, timeMs: number) => {
    const basePoints = correct * 10000;
    const timeInSeconds = timeMs / 1000;
    const timeFactor = Math.max(0.1, 1 - (timeInSeconds / 300));
    return Math.floor(basePoints * timeFactor);
  };

  useEffect(() => {
    async function fetchTopResults() {
      try {
        const { data, error } = await supabase
          .from('quiz_results')
          .select(`
            correct_answers,
            total_time_ms,
            profiles (
              username,
              avatar_url
            )
          `)
          .order('correct_answers', { ascending: false })
          .order('total_time_ms', { ascending: true })
          .limit(10);

        if (error) throw error;

        if (data) {
          // Mapowanie danych z uwzględnieniem typów Supabase (Join)
          const formatted: LeaderData[] = data.map((res: any) => ({
            username: res.profiles?.username || 'Anonimowy Agent',
            avatar_url: res.profiles?.avatar_url || null,
            displayScore: calculateBigScore(res.correct_answers, res.total_time_ms)
          }))
          .sort((a, b) => b.displayScore - a.displayScore)
          .slice(0, 3);

          setTopAgents(formatted);
        }
      } catch (err) {
        console.error('Błąd bazy:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTopResults();
  }, [supabase]);

  return (
    <main className="relative min-h-screen w-full bg-zinc-950 overflow-x-hidden selection:bg-blue-500/30">
      
      {/* --- BACKGROUND --- */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <Particles particleCount={70} particleColors={["#0055ff", "#BF2024", "#fbbf24"]} alphaParticles speed={0.04} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,85,255,0.15),transparent_70%)]" />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* HEADER */}
          <div className="text-center mb-20 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]"
            >
              <Zap size={12} className="text-yellow-400 fill-yellow-400" /> System Operacyjny Urwisa v2.0
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl md:text-8xl font-black font-heading text-white tracking-tighter italic uppercase leading-none"
            >
              Wybierz <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 via-purple-500 to-red-500">Tryb Misji</span>
            </motion.h1>
          </div>

          {/* GRID TRYBÓW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-24">
            {QUIZ_MODES.map((mode, i) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Link href={mode.href} className="block relative h-full">
                  <div className="relative h-full bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 overflow-hidden transition-all duration-500 group-hover:bg-zinc-900/60 group-hover:border-white/20">
                    <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[120px] opacity-0 group-hover:opacity-20 transition-opacity duration-700" style={{ backgroundColor: mode.color }} />
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left relative z-10">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-white shadow-2xl shrink-0" style={{ backgroundColor: mode.color }}>
                        {mode.icon}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3">
                          <h2 className="text-3xl font-black text-white font-heading uppercase italic tracking-tight">{mode.title}</h2>
                          <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-white border border-white/10 uppercase tracking-widest">{mode.badge}</span>
                        </div>
                        <p className="text-zinc-500 font-bold text-sm md:text-base leading-relaxed">{mode.desc}</p>
                        <div className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em]" style={{ color: mode.color }}>
                          Rozpocznij misję <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* --- LEADERBOARD PREVIEW --- */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-900/30 backdrop-blur-2xl rounded-[3rem] md:rounded-[5rem] p-8 md:p-16 border border-white/5 shadow-3xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-50" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center border border-yellow-400/20 shadow-inner">
                  <Trophy size={32} className="text-yellow-400" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-3xl md:text-4xl font-black text-white font-heading italic uppercase tracking-tighter">Najlepsi Agenci</h3>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Ranking punktowy (Big Score)</p>
                </div>
              </div>
              <Link href="/ranking" className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all">
                Ranking
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-3 flex flex-col items-center justify-center py-10 gap-4">
                   <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : topAgents.length > 0 ? (
                topAgents.map((agent, index) => (
                  <div key={index} className="relative group">
                    {index === 0 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-zinc-950 px-4 py-1 rounded-full text-[9px] font-black uppercase z-20 shadow-2xl border-2 border-zinc-950 flex items-center gap-2">
                        <Star size={10} className="fill-zinc-950" /> Lider
                      </div>
                    )}
                    
                    <div className={`h-full flex flex-col items-center gap-4 p-8 rounded-[2.5rem] transition-all duration-500 border ${
                      index === 0 ? 'bg-yellow-400/5 border-yellow-400/20' : 'bg-white/2 border-white/5'
                    }`}>
                      <div className={`w-20 h-20 rounded-full p-1 border-2 ${index === 0 ? 'border-yellow-400' : 'border-white/10'}`}>
                        <div className="w-full h-full rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center">
                           {agent.avatar_url ? (
                             <img src={agent.avatar_url} alt={agent.username} className="w-full h-full object-cover" />
                           ) : (
                             <UserIcon size={32} className="text-zinc-700" />
                           )}
                        </div>
                      </div>
                      
                      <div className="text-center space-y-1">
                        <div className="text-white font-black uppercase tracking-tight text-base truncate max-w-[150px]">
                          {agent.username}
                        </div>
                        <div className={`text-4xl font-black italic tracking-tighter ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                          {agent.displayScore.toLocaleString()}
                          <span className="text-[10px] not-italic text-zinc-500 ml-1 uppercase">pkt</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-10 text-zinc-600 font-bold italic">Brak wyników.</div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  );
}