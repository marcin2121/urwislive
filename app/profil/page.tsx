'use client'

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Timer, 
  User as UserIcon,
  Settings,
  LogOut,
  Crown
} from 'lucide-react';
import MagicBento from '@/components/ui/MagicBento';
import Particles from "@/components/Particles";

// Definicje typów dla bezpieczeństwa
interface UserProfile {
  username: string;
  level: number;
  kuleczki: number;
  urwiski: number;
  exp: number;
  avatar_url: string | null;
}

interface QuizStats {
  correct_answers: number;
  total_time_ms: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bestResult, setBestResult] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function getProfileData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login'); // Przekieruj jeśli brak sesji
          return;
        }

        // 1. Pobierz profil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, level, kuleczki, urwiski, exp, avatar_url')
          .eq('id', user.id)
          .single();

        if (profileError) console.error('Błąd profilu:', profileError);

        // 2. Pobierz najlepszy wynik quizu
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
      } catch (error) {
        console.error('Wystąpił błąd:', error);
      } finally {
        setLoading(false);
      }
    }

    getProfileData();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Obliczenia do paska postępu (zakładamy, że level up co 1000 exp)
  const progressPercent = profile ? (profile.exp % 1000) / 10 : 0;
  const nextLevelExp = 1000;

  // --- SKELETON LOADING (Wyświetla się podczas ładowania) ---
  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
       <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-blue-500 animate-spin"/>
       <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">Łączenie z bazą Agenta...</p>
    </div>
  );

  return (
    <main className="relative min-h-screen w-full bg-zinc-950 overflow-x-hidden text-white font-sans selection:bg-blue-500/30">
      
      {/* TŁO */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <Particles particleCount={80} particleColors={["#0055ff", "#BF2024"]} alphaParticles speed={0.05} />
        <div className="absolute top-0 left-0 w-full h-[500px] bg-linear-to-b from-blue-900/10 to-transparent" />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* HEADER PROFILU */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center gap-8 mb-16"
          >
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-linear-to-br from-[#BF2024] to-[#0055ff] p-1 shadow-2xl shadow-blue-900/20 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1">
                <div className="w-full h-full rounded-[2.3rem] bg-zinc-900 overflow-hidden flex items-center justify-center border-4 border-zinc-950 relative">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="bg-zinc-800 w-full h-full flex items-center justify-center text-zinc-600">
                        <UserIcon size={64} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              </div>
              {/* Level Badge */}
              <div className="absolute -bottom-3 -right-3 bg-white text-zinc-950 px-5 py-1.5 rounded-full font-black text-sm shadow-lg shadow-white/10 flex items-center gap-2 border-2 border-zinc-200">
                <span className="text-[#bf2024]">LVL</span> {profile?.level || 1}
              </div>
            </div>

            {/* Dane Użytkownika */}
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-white to-zinc-400">
                {profile?.username || 'Nieznany Agent'}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Crown size={14} /> Status: Aktywny Urwis
                </div>
                <div className="px-4 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                    Dołączył: 2024
                </div>
              </div>
            </div>
          </motion.div>

          {/* BENTO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* KULECZKI */}
            <MagicBento glowColor="59, 130, 246" className="md:col-span-1 bg-zinc-900/40 backdrop-blur-md border-white/5 rounded-[2.5rem] p-8 group hover:bg-zinc-900/60 transition-colors">
              <div className="flex flex-col h-full justify-between">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Zap size={28} className="fill-blue-400" />
                </div>
                <div>
                  <div className="text-5xl font-black text-white italic mb-1 tracking-tighter">{profile?.kuleczki || 0}</div>
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Twoje Kuleczki</div>
                </div>
              </div>
            </MagicBento>

            {/* URWISKI */}
            <MagicBento glowColor="239, 68, 68" className="md:col-span-1 bg-zinc-900/40 backdrop-blur-md border-white/5 rounded-[2.5rem] p-8 group hover:bg-zinc-900/60 transition-colors">
              <div className="flex flex-col h-full justify-between">
                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 mb-6 border border-red-500/20 group-hover:scale-110 transition-transform">
                  <Star size={28} className="fill-red-400" />
                </div>
                <div>
                  <div className="text-5xl font-black text-white italic mb-1 tracking-tighter">{profile?.urwiski || 0}</div>
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Urwiski Premium</div>
                </div>
              </div>
            </MagicBento>

            {/* EXP / PROGRES */}
            <MagicBento glowColor="168, 85, 247" className="md:col-span-1 bg-zinc-900/40 backdrop-blur-md border-white/5 rounded-[2.5rem] p-8 group hover:bg-zinc-900/60 transition-colors">
              <div className="flex flex-col h-full justify-between">
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                  <Trophy size={28} />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <div className="text-3xl font-black text-white italic">{profile?.exp || 0} <span className="text-sm text-zinc-500 not-italic">EXP</span></div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{nextLevelExp} CEL</div>
                  </div>
                  {/* Pasek Postępu */}
                  <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden border border-white/5 relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-linear-to-r from-purple-600 to-blue-500 relative"
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </MagicBento>

            {/* REKORD QUIZU */}
            <MagicBento glowColor="250, 204, 21" className="md:col-span-2 bg-zinc-900/40 backdrop-blur-md border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className="p-6 bg-yellow-500/10 rounded-[2rem] border border-yellow-500/20 group-hover:scale-105 transition-transform duration-500">
                  <Target size={48} className="text-yellow-400" />
                </div>
                <div className="flex-1 w-full space-y-6">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Twoja skuteczność</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Celność */}
                    <div className="bg-zinc-950/50 p-5 rounded-3xl border border-white/5 flex flex-col justify-center">
                      <div className="text-[10px] font-black text-zinc-500 uppercase mb-2 flex items-center gap-2 tracking-widest">
                        <Star size={12} className="text-yellow-500" /> Poprawne
                      </div>
                      <div className="text-3xl font-black text-white">
                        {bestResult ? bestResult.correct_answers : 0} <span className="text-zinc-600 text-lg">/ 10</span>
                      </div>
                    </div>
                    {/* Czas */}
                    <div className="bg-zinc-950/50 p-5 rounded-3xl border border-white/5 flex flex-col justify-center">
                      <div className="text-[10px] font-black text-zinc-500 uppercase mb-2 flex items-center gap-2 tracking-widest">
                        <Timer size={12} className="text-blue-500" /> Czas reakcji
                      </div>
                      <div className="text-3xl font-black text-white">
                        {bestResult?.total_time_ms 
                          ? (bestResult.total_time_ms / 1000).toFixed(2) 
                          : '---'} <span className="text-zinc-600 text-sm">sek</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </MagicBento>

            {/* SZYBKIE AKCJE (MENU) */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <button 
                onClick={() => router.push('/profil/ustawienia')} 
                className="flex-1 min-h-[80px] bg-zinc-900/40 hover:bg-zinc-800 border border-white/10 rounded-[2.5rem] flex items-center justify-center gap-3 text-zinc-300 hover:text-white font-black uppercase tracking-widest transition-all text-sm group"
              >
                <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" /> Ustawienia
              </button>
              
              <button 
                onClick={handleLogout}
                className="flex-1 min-h-[80px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-[2.5rem] flex items-center justify-center gap-3 text-red-500 font-black uppercase tracking-widest transition-all text-sm group"
              >
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> Wyloguj
              </button>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}