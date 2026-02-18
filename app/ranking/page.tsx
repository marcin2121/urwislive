'use client'

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { 
  Trophy, 
  Medal, 
  User as UserIcon, 
  ArrowLeft, 
  Crown, 
  Zap,
  Star,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import Particles from "@/components/Particles";
import Footer from '@/components/ui/Footer';

export default function RankingPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // --- TA SAMA FORMUŁA CO W QUIZIE (Max 100k) ---
  const calculateBigScore = (correct: number, timeMs: number) => {
    const basePoints = correct * 10000;
    const timeInSeconds = timeMs / 1000;
    const timeFactor = Math.max(0.1, 1 - (timeInSeconds / 300));
    return Math.floor(basePoints * timeFactor);
  };

  useEffect(() => {
    async function fetchRanking() {
      try {
        // Pobieramy wyniki (najlepsze wyniki per użytkownik byłoby idealne, 
        // ale na start pobierzemy top 50 rekordów ogólnie)
        const { data, error } = await supabase
          .from('quiz_results')
          .select(`
            correct_answers,
            total_time_ms,
            profiles (
              username,
              avatar_url,
              level
            )
          `)
          .order('correct_answers', { ascending: false })
          .order('total_time_ms', { ascending: true })
          .limit(50);

        if (error) throw error;

        if (data) {
          // Przeliczamy na "Wielkie Punkty"
          const formatted = data.map((res: any) => ({
            username: res.profiles?.username || 'Anonimowy Agent',
            avatar_url: res.profiles?.avatar_url,
            level: res.profiles?.level || 1,
            score: calculateBigScore(res.correct_answers, res.total_time_ms),
            correct: res.correct_answers,
            time: (res.total_time_ms / 1000).toFixed(2)
          }))
          // Sortujemy ponownie po przeliczonym wyniku
          .sort((a, b) => b.score - a.score);

          setLeaders(formatted);
        }
      } catch (err) {
        console.error('Błąd rankingu:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRanking();
  }, [supabase]);

  // Rozdzielamy na podium i resztę
  const podium = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <main className="relative min-h-screen w-full bg-zinc-950 text-white overflow-x-hidden">
      
      {/* --- TŁO --- */}
      <div className="fixed inset-0 -z-10">
        <Particles particleCount={50} particleColors={["#0055ff", "#BF2024", "#fbbf24"]} alphaParticles speed={0.02} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,85,255,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Przycisk powrotu */}
          <Link href="/quiz" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-12 transition-colors group bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-black uppercase tracking-widest text-[10px]">Wróć do misji</span>
          </Link>

          <div className="text-center mb-16 space-y-4">
            <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
              Ranking <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-400 via-amber-500 to-yellow-600">Agentów</span>
            </h1>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-xs md:text-sm">Najlepsze wyniki punktowe w tym tygodniu</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-zinc-600 font-black uppercase tracking-widest text-xs">Skanowanie tablicy wyników...</p>
            </div>
          ) : (
            <div className="space-y-12">
              
              {/* --- PODIUM (Top 3) --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {podium.map((agent, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative flex flex-col items-center p-8 rounded-[3rem] border-2 transition-all ${
                      index === 0 
                        ? 'bg-yellow-400/10 border-yellow-400/30 order-1 md:order-2 md:scale-110 z-20 shadow-[0_0_50px_-10px_rgba(250,204,21,0.2)]' 
                        : index === 1 
                        ? 'bg-zinc-400/10 border-zinc-400/20 order-2 md:order-1 z-10' 
                        : 'bg-orange-400/10 border-orange-400/20 order-3 z-10'
                    }`}
                  >
                    {/* Ikona Miejsca */}
                    <div className="absolute -top-6 bg-zinc-950 px-6 py-2 rounded-full border-2 border-inherit">
                      {index === 0 ? <Crown size={24} className="text-yellow-400" /> : <span className="font-black italic text-xl">#{index + 1}</span>}
                    </div>

                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full border-4 border-white/10 overflow-hidden mb-6 shadow-2xl">
                       {agent.avatar_url ? (
                         <img src={agent.avatar_url} alt={agent.username} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600">
                            <UserIcon size={40} />
                         </div>
                       )}
                    </div>

                    <div className="text-center space-y-2">
                      <div className="font-black uppercase tracking-tight text-xl">{agent.username}</div>
                      <div className="text-4xl font-black italic tracking-tighter text-white">
                        {agent.score.toLocaleString()}
                        <span className="text-xs not-italic text-zinc-500 ml-1">pkt</span>
                      </div>
                      <div className="flex items-center justify-center gap-4 pt-2">
                        <div className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-1">
                          <Star size={10} className="text-yellow-500" /> {agent.correct}/10
                        </div>
                        <div className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-1">
                          <Zap size={10} className="text-blue-500" /> {agent.time}s
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* --- LISTA (Reszta Agentów) --- */}
              <div className="bg-zinc-900/30 backdrop-blur-xl rounded-[3rem] border border-white/5 overflow-hidden">
                <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                  <h3 className="font-black uppercase tracking-widest text-xs text-zinc-500">Pozostali Agenci w operacji</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {rest.length > 0 ? rest.map((agent, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-6">
                        <span className="w-8 text-zinc-700 font-black italic text-xl">#{index + 4}</span>
                        <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex items-center justify-center">
                          {agent.avatar_url ? <img src={agent.avatar_url} className="w-full h-full object-cover" /> : <UserIcon size={20} className="text-zinc-600" />}
                        </div>
                        <div>
                          <div className="font-black uppercase tracking-tight text-sm">{agent.username}</div>
                          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">LVL {agent.level}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-black italic text-white">{agent.score.toLocaleString()}</div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Punktów</div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="p-10 text-center text-zinc-600 font-bold italic">Czekamy na kolejnych Agentów...</div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}