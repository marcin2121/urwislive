'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Trash2, Edit2, X, Lock, 
  Tag, Package, Percent, LogOut, Loader2,
  Bell, Send, Users, MousePointerClick, BellOff
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Promo {
  id: string;
  title: string;
  old_price: string;
  new_price: string;
  discount: string;
  category: string;
}

export default function AdminPage() {
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isSendingPush, setIsSendingPush] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState(0)

  // 🚀 DODANE: Stan statystyk Push
  const [pushStats, setPushStats] = useState({ clicks: 0, closes: 0 })

  const [pushData, setPushData] = useState({ title: '', message: '' })

  const [formData, setFormData] = useState({
    title: '',
    old_price: '',
    new_price: '',
    discount: '',
    category: 'Zabawki',
    image_url: '',
  })

  useEffect(() => {
    if (isAuthenticated) {
      fetchPromos();
      fetchSubscriberCount();
      fetchPushStats(); // 🚀 DODANE: Pobieranie statystyk
    }
  }, [isAuthenticated]);

  async function fetchSubscriberCount() {
    const { count, error } = await supabase
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true });
    if (!error) setSubscriberCount(count || 0);
  }

  // 🚀 DODANE: Funkcja pobierająca kliknięcia i zamknięcia
  async function fetchPushStats() {
    const { data, error } = await supabase.from('push_analytics').select('action');
    if (!error && data) {
      const clicks = data.filter(d => d.action === 'click').length;
      const closes = data.filter(d => d.action === 'close').length;
      setPushStats({ clicks, closes });
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'URWIS2026') {
      setIsAuthenticated(true)
    } else {
      toast.error('Niepoprawne hasło!')
    }
  }

  async function fetchPromos() {
    setLoading(true)
    const { data, error } = await supabase
      .from('promocje')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error('Błąd pobierania:', error)
    else setPromos(data || [])
    setLoading(false)
  }

  async function handleAddPromo(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('promocje').insert([formData]);
    if (error) {
      toast.error('Błąd zapisu!');
    } else {
      setIsAdding(false);
      setFormData({ title: '', old_price: '', new_price: '', discount: '', category: 'Zabawki', image_url: '' });
      fetchPromos();
      toast.success('Dodano promocję!');
    }
  }

  async function handleSendPush(e: React.FormEvent) {
    e.preventDefault();
    setIsSendingPush(true);
    try {
      const res = await fetch('/api/push/send-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pushData)
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`Wysłano do ${result.count} osób!`);
        setPushData({ title: '', message: '' });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      toast.error('Błąd wysyłki powiadomień.');
    } finally {
      setIsSendingPush(false);
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Na pewno usunąć tę promocję?')) {
      const { error } = await supabase.from('promocje').delete().eq('id', id)
      if (error) toast.error('Błąd usuwania!')
      else {
        fetchPromos();
        toast.success('Usunięto pomyślnie');
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent px-6 pt-20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/30 backdrop-blur-3xl p-12 rounded-[3.5rem] border-2 border-white/60 shadow-2xl max-w-md w-full">
          <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl"><Lock className="text-white" size={32} /></div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-center mb-8">Urwis Admin</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Podaj hasło" className="w-full p-5 rounded-2xl bg-white/50 border-2 border-white focus:border-[#BF2024] outline-none font-bold text-center transition-all" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl">Zaloguj do bazy</button>
          </form>
        </motion.div>
      </div>
    )
  }

  // Wyliczenie skuteczności (CTR)
  const totalInteractions = pushStats.clicks + pushStats.closes;
  const ctr = totalInteractions > 0 ? Math.round((pushStats.clicks / totalInteractions) * 100) : 0;

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      
      <header className="flex flex-col lg:grid lg:grid-cols-2 justify-between items-center gap-8 mb-16 bg-white/20 backdrop-blur-xl p-10 rounded-[3rem] border-2 border-white/60 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none rotate-12"><Users size={200} /></div>
        <div className="relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#BF2024] mb-2 block">Centrum Dowodzenia</span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none text-zinc-900">
            ADMIN <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">URWIS</span>
          </h1>
          <div className="mt-4 flex items-center gap-2 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
            <Users size={14} /> Subskrybentów PWA: <span className="text-[#0055ff]">{subscriberCount}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center lg:justify-end gap-4 relative z-10">
          <button onClick={() => setIsAdding(true)} className="px-8 py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-[#BF2024] transition-all shadow-xl hover:scale-105">
            <Plus size={18} strokeWidth={3} /> Nowa Promocja
          </button>
          <button onClick={() => setIsAuthenticated(false)} className="p-5 bg-white/50 rounded-2xl hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-all border border-white">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* LEWA KOLUMNA: Lista promocji */}
        <div className="xl:col-span-2 space-y-8">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <Tag size={24} className="text-[#BF2024]" /> Aktualne Promocje
          </h2>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#BF2024]" size={48} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promos.map((promo) => (
                <motion.div key={promo.id} layout className="bg-white/40 backdrop-blur-xl border-2 border-white/60 p-6 rounded-[2.5rem] shadow-lg group hover:border-[#BF2024] transition-all relative">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-zinc-900 text-white text-[8px] font-black uppercase rounded-lg tracking-widest">{promo.category}</span>
                    <button onClick={() => handleDelete(promo.id)} className="p-2 bg-red-50 text-[#BF2024] rounded-lg hover:bg-[#BF2024] hover:text-white transition-all"><Trash2 size={16} /></button>
                  </div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2 line-clamp-1">{promo.title}</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-black text-[#BF2024]">{promo.new_price} zł</span>
                    <span className="text-xs text-zinc-400 line-through font-bold">{promo.old_price} zł</span>
                  </div>
                  <div className="px-4 py-2 bg-[#BF2024]/10 text-[#BF2024] rounded-xl font-black text-[10px] w-fit italic">{promo.discount || 'PROMO'}</div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* PRAWA KOLUMNA: Panel Push & Statystyki */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <Bell size={24} className="text-[#0055ff]" /> Wyślij Push
          </h2>
          
          <div className="bg-white/50 backdrop-blur-2xl p-8 rounded-[3rem] border-2 border-white shadow-2xl space-y-6">
            <p className="text-zinc-500 font-bold uppercase text-[10px] leading-relaxed italic">
              Wiadomość trafi prosto na ekrany telefonów Twoich klientów. Używaj rozważnie!
            </p>
            <form onSubmit={handleSendPush} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-4 text-zinc-400 italic">Tytuł powiadomienia</label>
                <input required placeholder="np. Wielka Dostawa LEGO! 🧱" className="w-full p-4 rounded-xl bg-white border border-zinc-100 font-bold outline-none focus:border-[#0055ff]" value={pushData.title} onChange={e => setPushData({...pushData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-4 text-zinc-400 italic">Treść wiadomości</label>
                <textarea required placeholder="Wpadnij sprawdzić nowości w Sklepie Urwis..." rows={3} className="w-full p-4 rounded-xl bg-white border border-zinc-100 font-bold outline-none focus:border-[#0055ff]" value={pushData.message} onChange={e => setPushData({...pushData, message: e.target.value})} />
              </div>
              <button disabled={isSendingPush || subscriberCount === 0} className="w-full py-5 bg-[#0055ff] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50">
                {isSendingPush ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Wyślij do {subscriberCount} osób</>}
              </button>
            </form>
          </div>

          {/* 🚀 DODANE: Statystyki na żywo */}
          <div className="bg-white/30 backdrop-blur-xl p-8 rounded-[3rem] border border-white shadow-lg space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
              📊 Skuteczność Powiadomień
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50/50 border border-green-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <MousePointerClick className="text-green-500 mb-2" size={24} />
                <span className="text-2xl font-black text-green-600 leading-none">{pushStats.clicks}</span>
                <span className="text-[9px] font-bold uppercase text-green-600/60 tracking-widest mt-1">Kliknięto</span>
              </div>
              <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <BellOff className="text-red-400 mb-2" size={24} />
                <span className="text-2xl font-black text-red-500 leading-none">{pushStats.closes}</span>
                <span className="text-[9px] font-bold uppercase text-red-500/60 tracking-widest mt-1">Odrzucono</span>
              </div>
            </div>

            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Współczynnik otwarć (CTR):</span>
              <span className={`text-lg font-black italic ${ctr > 10 ? 'text-green-500' : 'text-zinc-700'}`}>{ctr}%</span>
            </div>
            
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-zinc-900/40 backdrop-blur-xl flex items-center justify-center p-6">
            <motion.form onSubmit={handleAddPromo} initial={{ y: 50, scale: 0.9 }} animate={{ y: 0, scale: 1 }} className="bg-white rounded-[3.5rem] p-12 max-w-2xl w-full shadow-2xl border-2 border-white relative">
              <button type="button" onClick={() => setIsAdding(false)} className="absolute top-8 right-8 text-zinc-400 hover:text-zinc-900"><X size={32} /></button>
              <h3 className="text-3xl font-black uppercase italic mb-10">Nowa Okazja</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <input required placeholder="Nazwa produktu" className="p-5 rounded-2xl bg-zinc-100 font-bold outline-none focus:ring-2 ring-[#BF2024]" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                <select className="p-5 rounded-2xl bg-zinc-100 font-bold outline-none focus:ring-2 ring-[#0055ff]" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option>Zabawki</option><option>Szkoła i biuro</option><option>Imprezy</option><option>Gry</option>
                </select>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase ml-4 text-zinc-400">Link do zdjęcia (URL)</label>
                  <input placeholder="https://..." className="w-full p-5 rounded-2xl bg-zinc-100 font-bold outline-none" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                </div>
                <input required placeholder="Stara cena" className="p-5 rounded-2xl bg-zinc-100 font-bold outline-none" value={formData.old_price} onChange={e => setFormData({...formData, old_price: e.target.value})} />
                <input required placeholder="Nowa cena" className="p-5 rounded-2xl bg-zinc-100 font-bold outline-none" value={formData.new_price} onChange={e => setFormData({...formData, new_price: e.target.value})} />
                <input placeholder="Rabat" className="p-5 rounded-2xl bg-zinc-100 font-bold outline-none md:col-span-2" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} />
              </div>
              <button className="w-full py-6 bg-zinc-900 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-[#0055ff] transition-all shadow-2xl">Zapisz w bazie</button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}