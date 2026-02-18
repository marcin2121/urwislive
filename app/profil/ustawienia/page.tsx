'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Save, LogOut, Shield, Loader2, 
  ChevronLeft, Palette, Fingerprint, Eye, 
  Smile, Lock, Crown, Sparkles, Dices
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

import Particles from "@/components/Particles"
import MagicBento from '@/components/ui/MagicBento'

// --- KONFIGURACJA STYLÓW DICEBEAR ---
const AVATAR_STYLES = [
  { id: 'bottts-neutral', name: 'Robot', premium: false },
  { id: 'avataaars', name: 'Agent', premium: false },
  { id: 'big-smile', name: 'Urwis', premium: false },
  { id: 'pixel-art', name: 'Retro', premium: true },
  { id: 'lorelei', name: 'Anime', premium: true },
  { id: 'notionists', name: 'Prestiż', premium: true },
  { id: 'adventurer', name: 'Łowca', premium: true },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Profile State
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [themeColor, setThemeColor] = useState('#0055ff')
  const [statusTag, setStatusTag] = useState('Aktywny Agent')
  const [avatarStyle, setAvatarStyle] = useState('bottts-neutral')
  const [avatarSeed, setAvatarSeed] = useState('') 
  const [isPremium, setIsPremium] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return; }
        setUser(user)

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username, bio, theme_color, status_tag, avatar_style, avatar_seed, is_premium')
          .eq('id', user.id)
          .maybeSingle()

        if (profile) {
          setUsername(profile.username || '')
          setBio(profile.bio || '')
          setThemeColor(profile.theme_color || '#0055ff')
          setStatusTag(profile.status_tag || 'Aktywny Agent')
          setAvatarStyle(profile.avatar_style || 'bottts-neutral')
          setAvatarSeed(profile.avatar_seed || profile.username || 'Urwis')
          setIsPremium(profile.is_premium || false)
        }
      } catch (error) {
        console.error(error)
        toast.error('Błąd ładowania ustawień.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [router, supabase])

  // --- FUNKCJE OBSŁUGI ---

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const randomizeAvatar = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(newSeed);
    toast.success("Wylosowano nowe cechy wyglądu!");
  }

  const handleStyleSelect = (style: any) => {
    if (style.premium && !isPremium) {
      toast.error('Styl Elitarny!', { 
        description: 'Ten wygląd jest zarezerwowany dla Agentów Premium.',
        action: { label: 'Sklep', onClick: () => router.push('/sklep') }
      });
      return;
    }
    setAvatarStyle(style.id);
  }

  const handleSaveProfile = async () => {
    if (!user) return;
    if (username.length < 3) {
      toast.error('Kryptonim musi mieć min. 3 znaki!');
      return;
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username, bio, theme_color: themeColor, 
          status_tag: statusTag, avatar_style: avatarStyle,
          avatar_seed: avatarSeed 
        })
        .eq('id', user.id)

      if (error) throw error
      toast.success('Profil zaktualizowany pomyślnie!')
      router.refresh()
    } catch (error) {
      toast.error('Błąd zapisu w bazie danych.')
    } finally {
      setSaving(false)
    }
  }

  const currentAvatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed}&backgroundColor=transparent`;

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-white">
       <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
       <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Ładowanie Systemu...</p>
    </div>
  )

  return (
    <main className="relative min-h-screen w-full bg-zinc-950 overflow-x-hidden text-white font-sans pt-28 pb-20 px-4 md:px-6">
      
      {/* TŁO */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <Particles particleCount={60} particleColors={[themeColor, "#ffffff"]} alphaParticles speed={0.03} />
        <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ background: `radial-gradient(circle at 50% 0%, ${themeColor}, transparent)` }} />
      </div>

      <div className="max-w-6xl mx-auto">
        
        {/* NAGŁÓWEK */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <Link href="/profil" className="w-14 h-14 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95">
              <ChevronLeft size={28} />
            </Link>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
              Ustawienia <span style={{ color: themeColor }}>Agenta</span>
            </h1>
          </div>
          <Link href={`/p/${username}`} target="_blank" className="group relative flex items-center gap-3 px-8 py-4 bg-zinc-900 border border-white/10 rounded-2xl hover:border-white/20 transition-all">
             <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Podgląd Profilu</span>
             <Eye size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KOLUMNA LEWA: PODGLĄD AVATARA */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-[4rem] p-10 lg:sticky lg:top-32 text-center shadow-3xl">
              <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-8">Wizualizacja Live</h3>
              
              <div className="relative inline-block group">
                <div className="absolute inset-0 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full" style={{ backgroundColor: themeColor }} />
                
                <motion.div 
                  key={currentAvatarUrl}
                  initial={{ rotate: -5, scale: 0.8, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  className="w-56 h-56 bg-zinc-800 rounded-[3.5rem] p-4 relative z-10 border-4 shadow-2xl transition-colors duration-500"
                  style={{ borderColor: themeColor }}
                >
                  <img src={currentAvatarUrl} alt="Preview" className="w-full h-full" />
                </motion.div>

                {isPremium && (
                  <div className="absolute -top-4 -right-4 bg-yellow-500 text-zinc-950 p-3 rounded-2xl rotate-12 shadow-xl border-4 border-zinc-950 z-20">
                    <Crown size={24} />
                  </div>
                )}
              </div>

              <div className="mt-10 space-y-4">
                <p className="text-2xl font-black italic uppercase tracking-tight truncate">{username || 'Nieznany'}</p>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  {statusTag}
                </div>
              </div>

              <button 
                onClick={randomizeAvatar}
                className="mt-10 w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                <Dices size={18} className="text-blue-500" /> Losuj cechy Agenta
              </button>
            </div>
          </motion.div>

          {/* KOLUMNA PRAWA: FORMULARZ */}
          <div className="lg:col-span-2 space-y-8">
            <MagicBento glowColor={themeColor.replace('#', '')} className="bg-zinc-900/40 border-white/5 rounded-[3.5rem] p-8 md:p-12">
              
              <div className="space-y-12">
                {/* Wybór Bazy Stylu */}
                <div className="grid gap-6">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2">Zmień Model Agenta</label>
                  <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                    {AVATAR_STYLES.map((style) => (
                      <motion.button 
                        key={style.id}
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStyleSelect(style)}
                        className={`flex flex-col items-center gap-3 p-2 rounded-4xl shrink-0 border-2 transition-all relative
                          ${avatarStyle === style.id ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10' : 'border-transparent bg-white/5'}
                          ${style.premium && !isPremium ? 'opacity-40 grayscale' : ''}
                        `}
                      >
                        <div className="w-24 h-24 rounded-3xl bg-zinc-800 p-2 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=${avatarSeed}`} className="w-full h-full" alt={style.name} />
                        </div>
                        <span className={`text-[10px] font-black uppercase ${style.premium ? 'text-yellow-500' : 'text-zinc-500'}`}>
                          {style.name}
                        </span>
                        {style.premium && (
                          <div className="absolute top-1 right-1 p-1.5 bg-zinc-950 rounded-full border border-yellow-500/50">
                            {isPremium ? <Sparkles size={10} className="text-yellow-500" /> : <Lock size={10} className="text-zinc-500" />}
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2">Nick (Widoczny dla innych)</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-zinc-950 border-2 border-white/5 rounded-2xl px-6 py-4 font-black text-lg focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2">Kolor Energii</label>
                    <div className="flex gap-2">
                      {['#0055ff', '#dc2626', '#a855f7', '#22c55e', '#fbbf24'].map(c => (
                        <button key={c} onClick={() => setThemeColor(c)} className={`w-10 h-10 rounded-full border-4 transition-all ${themeColor === c ? 'border-white' : 'border-transparent opacity-40'}`} style={{ backgroundColor: c }} />
                      ))}
                      <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="w-10 h-10 rounded-full bg-zinc-950 border-2 border-white/10 cursor-pointer overflow-hidden p-0" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2">Status Agenta</label>
                  <input type="text" value={statusTag} onChange={(e) => setStatusTag(e.target.value)} className="w-full bg-zinc-950 border-2 border-white/5 rounded-2xl px-6 py-4 font-bold text-sm focus:border-purple-500 outline-none" />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2">Notatka Operacyjna (Bio)</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full bg-zinc-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-zinc-300 font-medium resize-none focus:border-green-500 outline-none transition-all" />
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={handleSaveProfile} 
                    disabled={saving} 
                    className="px-12 py-5 bg-white text-zinc-950 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl disabled:opacity-50 flex items-center gap-3 active:scale-95"
                  >
                    {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    Zapisz w Centrali
                  </button>
                </div>
              </div>
            </MagicBento>

            {/* SEKCJA DANGER ZONE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-500/5 border-2 border-red-500/10 rounded-4xl p-8 flex items-center justify-between">
                <div>
                  <h4 className="text-red-500 font-black uppercase italic">Wylogowanie</h4>
                  <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-tight">Zakończ sesję Agenta</p>
                </div>
                <button onClick={handleLogout} className="p-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all active:scale-90"><LogOut size={20} /></button>
              </div>
              <div className="bg-zinc-900/40 border border-white/5 rounded-4xl p-8 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-black uppercase italic">Dostęp</h4>
                  <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-tight">Zarządzaj hasłem</p>
                </div>
                <button className="p-4 bg-zinc-800 text-white rounded-2xl hover:bg-zinc-700 transition-all active:scale-90"><Shield size={20} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}