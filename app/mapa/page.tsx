'use client'

import { createClient } from '@/lib/supabase/client'
import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Lock, Info, ShoppingBag, Brain, 
  Trophy, Swords, ChevronUp, ChevronDown, 
  Loader2, Package, X, CheckCircle2 
} from 'lucide-react'
import Link from 'next/link'

const LOCATIONS = [
  { id: 'sklep', name: 'Sklep Urwis', x: '10%', y: '83%', color: '#eab308', icon: ShoppingBag, active: true },
  { id: 'quiz', name: 'Szkoła quizów', x: '22%', y: '42%', color: '#639fff', icon: Brain, active: true },
  { id: 'ranking', name: 'Latarnia Sławy', x: '55%', y: '25%', color: '#facc15', icon: Trophy, active: true },
  { id: 'arena', name: 'Wulkaniczna Arena', x: '73%', y: '52%', color: '#ef4444', icon: Swords, active: false },
];

export default function MapaPrzygód() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mapWidth, setMapWidth] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedLoc, setSelectedLoc] = useState<any>(null); 
    const [stats, setStats] = useState({
      username: '',
      kuleczki: 0,
      rank: 0,
      activeQuests: 0
    });
    
    const supabase = createClient();

    useEffect(() => {
        const calculateWidth = () => setMapWidth(window.innerHeight * 2.333);
        calculateWidth();
        window.addEventListener('resize', calculateWidth);
        return () => window.removeEventListener('resize', calculateWidth);
    }, []);

    useEffect(() => {
      async function fetchFullPlayerData() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Pobieramy Profil, Pozycję w rankingu i Aktywne Misje równolegle
        const [profileRes, questsRes, rankRes] = await Promise.all([
          supabase.from('profiles').select('username, kuleczki').eq('id', user.id).single(),
          supabase.from('user_quests').select('id', { count: 'exact' }).eq('user_id', user.id).eq('status', 'active'),
          supabase.rpc('get_user_rank', { user_id_in: user.id }) // Zakładam, że masz tę funkcję SQL (opiszę ją niżej)
        ]);

        setStats({
          username: profileRes.data?.username || 'Urwis',
          kuleczki: profileRes.data?.kuleczki || 0,
          activeQuests: questsRes.count || 0,
          rank: rankRes.data || 0
        });
        setLoading(false);
      }
      fetchFullPlayerData();
    }, [supabase]);

    const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 70, damping: 30, mass: 0.5 });

    const x = useTransform(smoothProgress, [0, 0.8], [0, -(mapWidth - (typeof window !== 'undefined' ? window.innerWidth : 0))]);
    const mapOpacity = useTransform(smoothProgress, [0.8, 0.95], [1, 0]);
    const mapScale = useTransform(smoothProgress, [0.85, 1], [1, 0.95]);

    const scrollToMagazyn = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <div ref={containerRef} className="relative bg-[#09090b]" style={{ height: '350vh' }}>
          
          {/* HUD GÓRNY */}
          <div className="fixed top-8 inset-x-0 z-50 flex justify-between px-12 pointer-events-none text-white">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-zinc-900/80 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl pointer-events-auto shadow-2xl">
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 leading-none font-sans italic">Status Operacyjny</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xl font-black italic uppercase tracking-tighter font-fredoka">
                   {loading ? <Loader2 className="animate-spin" size={16} /> : stats.username}
                </p>
              </div>
            </motion.div>

            <div className="flex gap-4 pointer-events-auto items-center">
              <button onClick={scrollToMagazyn} className="flex items-center gap-3 px-6 py-4 bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl hover:bg-white hover:text-black transition-all shadow-2xl group">
                <Package size={20} className="group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:block font-fredoka">Otwórz Magazyn</span>
              </button>
              <Link href="/" className="p-4 bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-full hover:bg-white hover:text-black transition-all shadow-2xl">
                <Info size={24} />
              </Link>
            </div>
          </div>

          {/* PRZYCISK SCROLLA NA DOLE MAPY */}
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <motion.button style={{ opacity: mapOpacity }} onClick={scrollToMagazyn} className="pointer-events-auto group flex flex-col items-center gap-2">
              <div className="px-6 py-3 bg-zinc-900/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center gap-3 group-hover:bg-white/10 transition-all shadow-2xl shadow-black">
                <Package size={18} className="text-white" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] font-fredoka text-white">Magazyn</span>
              </div>
              <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-white/40 group-hover:text-white transition-colors">
                <ChevronDown size={24} />
              </motion.div>
            </motion.button>
          </div>

          {/* WARSTWA MAPY */}
          <div className="fixed top-0 left-0 h-screen w-full overflow-hidden flex items-center z-10">
            <motion.div style={{ width: mapWidth, x, opacity: mapOpacity, scale: mapScale }} className="relative h-screen flex-none will-change-transform">
              <img src="/mapa-glowna.webp" alt="Mapa" className="h-full w-full object-cover pointer-events-none select-none max-w-none" style={{ maxWidth: 'none' }} />
              {LOCATIONS.map((loc) => (
                <AdventurePin key={loc.id} loc={loc} onOpen={() => setSelectedLoc(loc)} />
              ))}
            </motion.div>
          </div>

          {/* MODAL MISJI */}
          <AnimatePresence>
            {selectedLoc && (
              <QuestModal loc={selectedLoc} onClose={() => setSelectedLoc(null)} />
            )}
          </AnimatePresence>

          {/* PRZESTRZEŃ SCROLLA */}
          <div className="relative h-[250vh] pointer-events-none" />
          
          {/* --- WIELKI MAGAZYN --- */}
          <section className="relative z-30 min-h-screen bg-zinc-950 text-white p-12 md:p-24 flex flex-col items-center shadow-[0_-50px_100px_rgba(0,0,0,1)] rounded-t-[5rem] border-t border-white/10">
             
             <div className="text-center max-w-2xl mb-16">
                <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} className="inline-block p-2 px-4 bg-yellow-500/10 border border-yellow-500/20 rounded-full mb-6 font-fredoka italic">
                  <p className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.3em]">Centrum Dowodzenia</p>
                </motion.div>
                <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-4 font-fredoka italic">Wielki Magazyn</h2>
                <p className="text-zinc-500 font-bold uppercase tracking-widest font-sans leading-relaxed">Systemowy przegląd Twoich osiągnięć</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                <StatsCard icon={Sparkles} color="#eab308" label="Skarbiec" value={stats.kuleczki.toLocaleString()} sub="Kuleczki" loading={loading} />
                <StatsCard icon={Brain} color="#3b82f6" label="Aktywne Wyzwania" value={stats.activeQuests} sub="Misje" loading={loading} />
                <StatsCard icon={Trophy} color="#ef4444" label="Liga Klubowa" value={stats.rank > 0 ? `#${stats.rank}` : 'Nieklasyfikowany'} sub="Ranking" loading={loading} />
             </div>

             <button onClick={scrollToTop} className="mt-20 group flex flex-col items-center gap-4 text-zinc-600 hover:text-white transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:-translate-y-2 transition-all shadow-xl"><ChevronUp size={24} /></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] font-fredoka">Wróć na Mapę</span>
             </button>
          </section>
        </div>
      )
}

// --- KOMPONENT: MODAL MISJI (DYNAMICZNY) ---
function QuestModal({ loc, onClose }: { loc: any, onClose: () => void }) {
  const [quest, setQuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchQuest() {
      const { data } = await supabase.from('quests').select('*').eq('location_id', loc.id).single();
      if (data) setQuest(data);
      setLoading(false);
    }
    fetchQuest();
  }, [loc.id, supabase]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-black/40">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="h-32 w-full relative" style={{ backgroundColor: loc.color }}>
          <div className="absolute inset-0 bg-linear-to-b from-black/20 to-zinc-900" />
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/20 rounded-full text-white transition-colors"><X size={20} /></button>
          <div className="absolute -bottom-8 left-10 w-20 h-20 bg-zinc-900 rounded-3xl border-4 border-zinc-900 flex items-center justify-center text-white shadow-xl">
            <loc.icon size={40} style={{ color: loc.color }} />
          </div>
        </div>
        <div className="p-10 pt-12">
          {loading ? <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-zinc-700" /></div> : (
            <>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2 font-sans italic">Raport Wywiadu</p>
              <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white font-fredoka mb-4">{quest?.title || loc.name}</h3>
              <p className="text-zinc-400 font-medium leading-relaxed mb-8">{quest?.description || 'Brak aktywnego opisu dla tej lokacji.'}</p>
              <div className="bg-white/5 border border-white/5 p-6 rounded-3xl mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center"><Sparkles className="text-yellow-500" size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1 italic">Nagroda</p>
                    <p className="text-xl font-black text-white italic font-fredoka">+{quest?.reward_amount || 0} Kuleczek</p>
                  </div>
                </div>
                <CheckCircle2 className={quest ? "text-green-500/20" : "text-zinc-700"} size={32} />
              </div>
              <button disabled={!quest} className="w-full py-5 bg-white disabled:bg-zinc-800 disabled:text-zinc-500 text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] transition-transform">
                {quest ? 'Podejmij wyzwanie' : 'Misja niedostępna'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function StatsCard({ icon: Icon, color, label, value, sub, loading }: any) {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-10 rounded-[3rem] group hover:border-white/20 transition-all">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 rotate-3 transition-transform group-hover:rotate-6 shadow-2xl" style={{ backgroundColor: color }}><Icon className="text-black" size={28} /></div>
      <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 font-sans italic">{label}</h3>
      <p className="text-3xl font-black uppercase font-fredoka mb-4 italic text-white leading-none">{sub}</p>
      <p className="text-6xl font-black italic font-fredoka leading-none">{loading ? <Loader2 className="animate-spin text-zinc-800" size={40} /> : value}</p>
    </div>
  )
}

// AdventurePin pozostaje bez zmian (wywołuje onOpen)
function AdventurePin({ loc, onOpen }: { loc: any, onOpen: () => void }) {
    const Icon = loc.icon;
    return (
      <motion.div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20" style={{ left: loc.x, top: loc.y }}>
        <div onClick={loc.active ? onOpen : undefined} className={`relative group ${loc.active ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/40 blur-md rounded-full transition-transform group-hover:scale-150" />
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className={`relative w-20 h-20 rounded-[2rem] flex items-center justify-center backdrop-blur-md border-2 transition-all duration-500 shadow-black ${loc.active ? 'bg-zinc-950/40 border-white/20 group-hover:border-white/80 shadow-2xl' : 'bg-zinc-900/80 border-white/5 grayscale'}`}
            style={{ boxShadow: loc.active ? `0 0 40px ${loc.color}33` : 'none' }}
          >
            {loc.active ? (
                <div className="relative">
                    <Icon size={32} style={{ color: loc.color }} className="drop-shadow-lg" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: loc.color }} />
                </div>
            ) : <Lock size={24} className="text-zinc-600" />}
          </motion.div>
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 transition-all duration-500 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 pointer-events-none">
            <div className="bg-white px-4 py-2 rounded-xl shadow-2xl relative text-zinc-950 shadow-black">
              <p className="text-[14px] font-black uppercase tracking-tighter font-fredoka">{loc.name}</p>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
            </div>
          </div>
        </div>
      </motion.div>
    )
}