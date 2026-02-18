'use client'

import { useEffect, useState, use as useReact } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { 
  Target, Trophy, Zap, Star, Shield, UserPlus, Swords, 
  Loader2, Award, History, Heart, CheckCircle2, 
  TrendingUp, Activity, User as UserIcon
} from 'lucide-react'
import { toast } from 'sonner'
import Particles from "@/components/Particles"

export default function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = useReact(params);
  const username = resolvedParams.username;
  const supabase = createClient();

  const [profile, setProfile] = useState<any>(null);
  const [recentMissions, setRecentMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [hasSaluted, setHasSaluted] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // 1. Pobierz dane o Tobie (by sprawdzić czy możesz salutować)
      const { data: { user } } = await supabase.auth.getUser();
      setMe(user);

      // 2. Pobierz profil Agenta
      const { data: profData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (profData) {
        setProfile(profData);
        
        // 3. Pobierz 5 ostatnich misji
        const { data: missions } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', profData.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        setRecentMissions(missions || []);

        // 4. Sprawdź czy już salutowałeś
        if (user) {
          const { data: salute } = await supabase
            .from('salutes')
            .select('*')
            .eq('sender_id', user.id)
            .eq('receiver_id', profData.id)
            .maybeSingle();
          if (salute) setHasSaluted(true);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [username, supabase]);

  const handleSalute = async () => {
    if (!me || !profile || hasSaluted) return;
    const { error } = await supabase.rpc('salute_agent', { 
      target_id: profile.id, 
      sender_id: me.id 
    });

    if (error) {
      toast.error("Nie można oddać salutu...");
    } else {
      setHasSaluted(true);
      setProfile({ ...profile, reputation: profile.reputation + 1 });
      toast.success("Oddano salut Agentowi!");
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white italic">Dekryptowanie akt Agenta...</div>;
  if (!profile) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Agent zaginął w akcji.</div>;

  const themeColor = profile.theme_color || '#0055ff';
  // DiceBear URL
  const avatarUrl = profile.avatar_url || `https://api.dicebear.com/7.x/${profile.avatar_style || 'bottts-neutral'}/svg?seed=${profile.username}`;

  return (
    <main className="relative min-h-screen w-full bg-zinc-950 text-white pb-20 pt-24 px-4 md:px-8">
      <div className="fixed inset-0 -z-10 opacity-30">
        <Particles particleCount={40} particleColors={[themeColor]} />
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP SECTION: IDENTYFIKATOR */}
        <div className="flex flex-col md:flex-row gap-10 items-center md:items-end bg-zinc-900/40 p-10 rounded-[4rem] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Shield size={200} />
          </div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-48 h-48 rounded-[3rem] border-4 p-2 shrink-0 relative group"
            style={{ borderColor: themeColor }}
          >
            <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-[2.5rem] bg-zinc-800 object-cover" />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-zinc-950 border border-white/10 px-4 py-1 rounded-full text-[10px] font-black uppercase whitespace-nowrap">
              Poziom {profile.level}
            </div>
          </motion.div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <h1 className="text-6xl font-black italic uppercase tracking-tighter">{profile.username}</h1>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">{profile.status_tag}</p>
            </div>
            <p className="text-zinc-400 max-w-xl italic">"{profile.bio}"</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              <button 
                onClick={handleSalute}
                disabled={hasSaluted || me?.id === profile.id}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black uppercase text-xs transition-all ${
                  hasSaluted ? 'bg-zinc-800 text-zinc-500' : 'bg-white text-black hover:scale-105 active:scale-95'
                }`}
              >
                <Heart className={hasSaluted ? "fill-red-500 text-red-500" : ""} size={16} /> 
                {hasSaluted ? "Zasalutowano" : "Oddaj Salut"}
              </button>
              <button className="p-4 bg-zinc-900 border border-white/10 rounded-2xl hover:text-blue-500 transition-colors">
                <Swords size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* GRID STATYSTYK BENTO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Pojedynki (Opcja 3) */}
          <div className="bg-zinc-900/60 border border-white/5 rounded-[3rem] p-8 flex flex-col items-center justify-center">
             <Swords className="text-red-500 mb-4" size={32} />
             <div className="text-4xl font-black">{profile.wins} / {profile.losses}</div>
             <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Wygrane / Porażki</p>
          </div>

          {/* Honor (Reputacja - Opcja 4) */}
          <div className="bg-zinc-900/60 border border-white/5 rounded-[3rem] p-8 flex flex-col items-center justify-center">
             <Shield className="text-yellow-500 mb-4" size={32} />
             <div className="text-4xl font-black">{profile.reputation}</div>
             <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Punkty Honoru</p>
          </div>

          {/* Ostatnie Misje (Opcja 5) */}
          <div className="md:col-span-2 bg-zinc-900/60 border border-white/5 rounded-[3rem] p-8">
             <div className="flex items-center gap-3 mb-6">
               <History className="text-blue-500" size={20} />
               <h3 className="text-sm font-black uppercase italic">Ostatnie Akcje</h3>
             </div>
             <div className="space-y-3">
               {recentMissions.map((m, i) => (
                 <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5 text-xs">
                   <span className="font-bold uppercase opacity-60">Misja Quiz</span>
                   <span className="font-black text-blue-400">{m.correct_answers}/10</span>
                   <span className="font-black">{(m.total_time_ms/1000).toFixed(1)}s</span>
                 </div>
               ))}
               {recentMissions.length === 0 && <p className="text-zinc-600 text-xs italic">Brak zarejestrowanych misji.</p>}
             </div>
          </div>

          {/* Gablota Odznak (Opcja 6) */}
          <div className="md:col-span-4 bg-zinc-900/20 border-2 border-dashed border-white/5 rounded-[4rem] p-10">
            <h3 className="text-center text-zinc-700 font-black uppercase tracking-[0.4em] text-xs mb-8">Gablota Osiągnięć Agenta</h3>
            <div className="flex flex-wrap justify-center gap-6">
              {/* Tutaj będziemy mapować odznaki z bazy w przyszłości */}
              <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center grayscale opacity-20" title="Błyskawica (Zablokowane)">
                <Zap size={32} />
              </div>
              <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center grayscale opacity-20">
                <Trophy size={32} />
              </div>
              <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center grayscale opacity-20">
                <Target size={32} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}