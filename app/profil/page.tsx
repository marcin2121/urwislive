'use client'

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client'; // Używamy Twojego klienta
import { 
  Trophy, 
  Star, 
  Zap, 
  Coins, 
  Target, 
  Timer, 
  User as UserIcon,
  Settings,
  LogOut
} from 'lucide-react';
import MagicBento from '@/components/ui/MagicBento';
import Particles from "@/components/Particles";
import Footer from '@/components/ui/Footer';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [bestResult, setBestResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  useEffect(() => {
    async function getProfileData() {
      // 1. Pobierz sesję użytkownika
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 2. Pobierz dane z tabeli profiles na podstawie ID
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, level, kuleczki, urwiski, exp, avatar_url')
          .eq('id', user.id)
          .single();

        // 3. Pobierz rekord życiowy w quizie (najwięcej poprawnych, potem najkrótszy czas)
        const { data: quizData } = await supabase
          .from('quiz_results')
          .select('correct_answers, total_time_ms')
          .eq('user_id', user.id)
          .order('correct_answers', { ascending: false })
          .order('total_time_ms', { ascending: true })
          .limit(1)
          .single();

        setProfile(profileData);
        setBestResult(quizData);
      }
      setLoading(false);
    }

    getProfileData();
  }, []);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white font-black italic uppercase tracking-widest animate-pulse">Wczytywanie bazy Agenta...</div>;

  return (
    <main className="relative min-h-screen w-full bg-zinc-950 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <Particles particleCount={60} particleColors={["#0055ff", "#BF2024"]} alphaParticles speed={0.05} />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* HEADER PROFILU */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] bg-linear-to-br from-[#BF2024] to-[#0055ff] p-1 shadow-2xl transition-transform group-hover:scale-105">
                <div className="w-full h-full rounded-[2.8rem] bg-zinc-900 overflow-hidden flex items-center justify-center border-4 border-zinc-950">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={64} className="text-zinc-700" />
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-zinc-900 px-4 py-1 rounded-2xl font-black text-sm shadow-xl">
                LVL {profile?.level || 1}
              </div>
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-5xl md:text-7xl font-black font-heading text-white italic uppercase tracking-tighter mb-2">
                {profile?.username || 'Nowy Agent'}
              </h1>
              <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-xs">Status: Aktywny Urwis</p>
            </div>
          </div>

          {/* BENTO GRID STATYSTYK */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* KULECZKI */}
            <MagicBento glowColor="59, 130, 246" className="md:col-span-1 bg-zinc-900/50 backdrop-blur-xl border-white/10 rounded-[3rem] p-8">
              <div className="flex flex-col h-full justify-between">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
                  <Zap size={24} className="fill-blue-400" />
                </div>
                <div>
                  <div className="text-5xl font-black text-white font-heading italic mb-1">{profile?.kuleczki || 0}</div>
                  <div className="text-xs font-black text-zinc-500 uppercase tracking-widest">Twoje Kuleczki</div>
                </div>
              </div>
            </MagicBento>

            {/* URWISKI */}
            <MagicBento glowColor="239, 68, 68" className="md:col-span-1 bg-zinc-900/50 backdrop-blur-xl border-white/10 rounded-[3rem] p-8">
              <div className="flex flex-col h-full justify-between">
                <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-400 mb-6">
                  <Star size={24} className="fill-red-400" />
                </div>
                <div>
                  <div className="text-5xl font-black text-white font-heading italic mb-1">{profile?.urwiski || 0}</div>
                  <div className="text-xs font-black text-zinc-500 uppercase tracking-widest">Urwiski Premium</div>
                </div>
              </div>
            </MagicBento>

            {/* EXP / PROGRES */}
            <MagicBento glowColor="168, 85, 247" className="md:col-span-1 bg-zinc-900/50 backdrop-blur-xl border-white/10 rounded-[3rem] p-8">
              <div className="flex flex-col h-full justify-between">
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 mb-6">
                  <Trophy size={24} />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-3xl font-black text-white font-heading italic">{profile?.exp || 0} EXP</div>
                    <div className="text-[10px] font-bold text-zinc-500">CEL: 1000</div>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(profile?.exp / 1000) * 100}%` }}
                      className="h-full bg-linear-to-r from-purple-500 to-blue-500"
                    />
                  </div>
                </div>
              </div>
            </MagicBento>

            {/* REKORD QUIZU */}
            <MagicBento glowColor="250, 204, 21" className="md:col-span-2 bg-zinc-900/50 backdrop-blur-xl border-white/10 rounded-[3rem] p-8">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="p-6 bg-yellow-400/10 rounded-3xl border border-yellow-400/20">
                  <Target size={48} className="text-yellow-400" />
                </div>
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-black text-white font-heading uppercase italic">Rekord w Quizie</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="text-xs font-bold text-zinc-500 uppercase mb-1 flex items-center gap-2">
                        <Star size={12} /> Celność
                      </div>
                      <div className="text-2xl font-black text-white">{bestResult?.correct_answers || 0} / 10</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="text-xs font-bold text-zinc-500 uppercase mb-1 flex items-center gap-2">
                        <Timer size={12} /> Najlepszy Czas
                      </div>
                      <div className="text-2xl font-black text-white">{(bestResult?.total_time_ms / 1000).toFixed(2) || '0.00'}s</div>
                    </div>
                  </div>
                </div>
              </div>
            </MagicBento>

            {/* SZYBKIE AKCJE */}
            <div className="md:col-span-1 grid grid-cols-1 gap-4">
              <button className="h-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2.5rem] flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest transition-all">
                <Settings size={20} /> Ustawienia
              </button>
              <button className="h-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-[2.5rem] flex items-center justify-center gap-3 text-red-500 font-black uppercase tracking-widest transition-all">
                <LogOut size={20} /> Wyloguj
              </button>
            </div>

          </div>
        </div>
      </div>
      <Footer variant="dark" />
    </main>
  );
}