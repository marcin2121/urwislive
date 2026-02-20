'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Trash2, Edit2, X, Lock, 
  Tag, Package, Percent, LogOut, Loader2,
  Bell, Send, Users, MousePointerClick, BellOff,
  Filter, Calendar, ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { PUSH_CATEGORIES } from '@/lib/push-config' // 🚀 Importujemy wspólne źródło prawdy

interface Promo {
  id: string;
  title: string;
  old_price: string;
  new_price: string;
  discount: string;
  category: string;
}

interface DailyStat {
  date: string;
  clicks: number;
  closes: number;
  total: number;
  ctr: number;
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
  
  // 🚀 Inicjalizacja domyślnie na "wszystkie"
  const [selectedTopic, setSelectedTopic] = useState('wszystkie')

  const [pushStats, setPushStats] = useState({ clicks: 0, closes: 0 })
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([])
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
      fetchPushStats();
    }
  }, [isAuthenticated, selectedTopic]);

  async function fetchSubscriberCount() {
    let query = supabase.from('push_subscriptions').select('*', { count: 'exact', head: true });
    
    // Filtrowanie po temacie (chyba że wybrano 'wszystkie')
    if (selectedTopic !== 'wszystkie') {
      query = query.contains('topics', [selectedTopic]);
    }

    const { count, error } = await query;
    if (!error) setSubscriberCount(count || 0);
  }

  async function fetchPushStats() {
    const { data, error } = await supabase
      .from('push_analytics')
      .select('action, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const clicks = data.filter(d => d.action === 'click').length;
      const closes = data.filter(d => d.action === 'close').length;
      setPushStats({ clicks, closes });

      const groups = data.reduce((acc: any, curr) => {
        const date = new Date(curr.created_at).toLocaleDateString('pl-PL');
        if (!acc[date]) acc[date] = { clicks: 0, closes: 0 };
        if (curr.action === 'click') acc[date].clicks++;
        if (curr.action === 'close') acc[date].closes++;
        return acc;
      }, {});

      const formattedDaily: DailyStat[] = Object.entries(groups).map(([date, counts]: any) => {
        const total = counts.clicks + counts.closes;
        return {
          date,
          clicks: counts.clicks,
          closes: counts.closes,
          total,
          ctr: total > 0 ? Math.round((counts.clicks / total) * 100) : 0
        };
      });

      setDailyStats(formattedDaily);
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'URWIS2026') setIsAuthenticated(true)
    else toast.error('Niepoprawne hasło!')
  }

  async function fetchPromos() {
    setLoading(true)
    const { data, error } = await supabase.from('promocje').select('*').order('created_at', { ascending: false })
    if (!error) setPromos(data || [])
    setLoading(false)
  }

  async function handleAddPromo(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('promocje').insert([formData]);
    if (!error) {
      setIsAdding(false);
      setFormData({ title: '', old_price: '', new_price: '', discount: '', category: 'Zabawki', image_url: '' });
      fetchPromos();
      toast.success('Dodano promocję!');
    }
  }

  async function handleSendPush(e: React.FormEvent) {
    e.preventDefault();
    if (subscriberCount === 0) return toast.error('Brak odbiorców w tej grupie!');
    
    setIsSendingPush(true);
    try {
      const res = await fetch('/api/push/send-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pushData, topic: selectedTopic })
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`Wysłano do ${result.count} osób!`);
        setPushData({ title: '', message: '' });
        fetchPushStats();
      }
    } catch (err) {
      toast.error('Błąd wysyłki.');
    } finally {
      setIsSendingPush(false);
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Na pewno usunąć?')) {
      const { error } = await supabase.from('promocje').delete().eq('id', id)
      if (!error) { fetchPromos(); toast.success('Usunięto'); }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent px-6 pt-20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/30 backdrop-blur-3xl p-12 rounded-[3.5rem] border-2 border-white/60 shadow-2xl max-w-md w-full text-center text-zinc-900">
          <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl"><Lock className="text-white" size={32} /></div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8">Urwis Admin</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Hasło bazy" className="w-full p-5 rounded-2xl bg-white/50 border-2 border-white focus:border-[#BF2024] outline-none font-bold text-center transition-all" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl">Autoryzuj</button>
          </form>
        </motion.div>
      </div>
    )
  }

  const globalTotal = pushStats.clicks + pushStats.closes;
  const globalCtr = globalTotal > 0 ? Math.round((pushStats.clicks / globalTotal) * 100) : 0;

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:grid lg:grid-cols-2 justify-between items-center gap-8 mb-16 bg-white/20 backdrop-blur-xl p-10 rounded-[3rem] border-2 border-white/60 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none rotate-12"><Users size={200} /></div>
        <div className="relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#BF2024] mb-2 block text-center lg:text-left">System Zarządzania</span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none text-zinc-900 text-center lg:text-left">
            ADMIN <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">URWIS</span>
          </h1>
          <div className="mt-4 flex items-center justify-center lg:justify-start gap-2 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
             Dostępni odbiorcy: <span className="text-[#0055ff]">{subscriberCount}</span>
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
        
        {/* LEWA KOLUMNA: PROMOCJE */}
        <div className="xl:col-span-2 space-y-8 text-zinc-900">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <Tag size={24} className="text-[#BF2024]" /> Katalog Ofert
          </h2>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#BF2024]" size={48} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promos.map((promo) => (
                <motion.div key={promo.id} layout className="bg-white/40 backdrop-blur-xl border-2 border-white/60 p-6 rounded-[2.5rem] shadow-lg group hover:border-[#BF2024] transition-all relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-zinc-900 text-white text-[8px] font-black uppercase rounded-lg tracking-widest">{promo.category}</span>
                    <button onClick={() => handleDelete(promo.id)} className="p-2 bg-red-50 text-[#BF2024] rounded-lg hover:bg-[#BF2024] hover:text-white transition-all"><Trash2 size={16} /></button>
                  </div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2 line-clamp-1">{promo.title}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-black text-[#BF2024]">{promo.new_price} zł</span>
                    <span className="text-xs text-zinc-400 line-through font-bold">{promo.old_price} zł</span>
                  </div>
                  <div className="px-4 py-2 bg-[#BF2024]/10 text-[#BF2024] rounded-xl font-black text-[10px] w-fit italic">{promo.discount || 'OKAZJA'}</div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* PRAWA KOLUMNA: KOMUNIKACJA PUSH */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-zinc-900">
            <Bell size={24} className="text-[#0055ff]" /> Wyślij Push
          </h2>
          
          {/* Panel Wysyłki */}
          <div className="bg-white/50 backdrop-blur-2xl p-8 rounded-[3rem] border-2 border-white shadow-2xl space-y-6">
            <form onSubmit={handleSendPush} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-4 text-zinc-400 italic flex items-center gap-2">
                  <Filter size={12} /> Targetowanie (Grupa)
                </label>
                <select 
                  className="w-full p-4 rounded-xl bg-white border border-zinc-100 font-bold outline-none appearance-none cursor-pointer text-zinc-900" 
                  value={selectedTopic} 
                  onChange={(e) => setSelectedTopic(e.target.value)}
                >
                  <option value="wszystkie">Wszyscy subskrybenci</option>
                  {PUSH_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <input required placeholder="Tytuł (np. 🚀 Nowości LEGO)" className="w-full p-4 rounded-xl bg-white border border-zinc-100 font-bold outline-none focus:border-[#0055ff] text-zinc-900" value={pushData.title} onChange={e => setPushData({...pushData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <textarea required placeholder="Treść wiadomości..." rows={2} className="w-full p-4 rounded-xl bg-white border border-zinc-100 font-bold outline-none focus:border-[#0055ff] text-zinc-900" value={pushData.message} onChange={e => setPushData({...pushData, message: e.target.value})} />
              </div>
              <button disabled={isSendingPush || subscriberCount === 0} className="w-full py-5 bg-[#0055ff] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] transition-all disabled:opacity-30">
                {isSendingPush ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Wyślij do {subscriberCount} urządzeń</>}
              </button>
            </form>
          </div>

          {/* ANALITYKA ZBIORCZA */}
          <div className="bg-white/30 backdrop-blur-xl p-8 rounded-[3rem] border border-white shadow-lg space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Globalny Performance</h3>
              <span className={`text-xl font-black italic ${globalCtr > 12 ? 'text-green-500' : 'text-zinc-400'}`}>{globalCtr}% <span className="text-[10px] uppercase tracking-tighter">CTR</span></span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 p-4 rounded-2xl flex flex-col items-center border border-zinc-100">
                <MousePointerClick className="text-green-500 mb-1" size={20} />
                <span className="text-xl font-black text-zinc-900 leading-none">{pushStats.clicks}</span>
                <span className="text-[8px] font-black uppercase text-zinc-400 mt-1 tracking-widest">Kliknięcia</span>
              </div>
              <div className="bg-white/80 p-4 rounded-2xl flex flex-col items-center border border-zinc-100">
                <BellOff className="text-red-400 mb-1" size={20} />
                <span className="text-xl font-black text-zinc-900 leading-none">{pushStats.closes}</span>
                <span className="text-[8px] font-black uppercase text-zinc-400 mt-1 tracking-widest">Odrzucenia</span>
              </div>
            </div>
          </div>

          {/* HISTORIA DZIENNA */}
          <div className="bg-zinc-900 text-white p-8 rounded-[3rem] shadow-2xl space-y-6 overflow-hidden relative border border-white/10">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Calendar size={120} /></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic flex items-center gap-2 relative z-10">
              <Calendar size={12} /> Dziennik Aktywności
            </h3>
            
            <div className="space-y-5 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
              {dailyStats.map((day) => (
                <div key={day.date} className="relative">
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[11px] font-black italic text-white/90 tracking-tighter">{day.date}</span>
                    <span className={`text-[10px] font-bold ${day.ctr > 15 ? 'text-green-400' : 'text-blue-400'}`}>{day.ctr}% <span className="text-[8px] uppercase opacity-50">CTR</span></span>
                  </div>
                  
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(day.clicks / day.total) * 100}%` }} className="bg-blue-500 h-full" />
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(day.closes / day.total) * 100}%` }} className="bg-white/10 h-full" />
                  </div>
                  
                  <div className="flex gap-3 mt-1.5 opacity-30 text-[8px] font-black uppercase tracking-[0.1em]">
                    <span>{day.clicks} wejść</span>
                    <span>{day.closes} zamknięć</span>
                  </div>
                </div>
              ))}
              {dailyStats.length === 0 && <p className="text-zinc-600 text-xs text-center py-6 italic">Oczekiwanie na pierwsze dane...</p>}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL NOWEJ PROMOCJI */}
      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-zinc-950/60 backdrop-blur-xl flex items-center justify-center p-6 text-zinc-900">
            <motion.form onSubmit={handleAddPromo} initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} className="bg-white rounded-[3.5rem] p-10 md:p-14 max-w-2xl w-full shadow-2xl border-2 border-white relative overflow-hidden">
               <div className="absolute -top-10 -right-10 p-10 opacity-5 pointer-events-none rotate-12"><Tag size={250} /></div>
              <button type="button" onClick={() => setIsAdding(false)} className="absolute top-10 right-10 text-zinc-300 hover:text-zinc-900 transition-colors"><X size={32} /></button>
              <h3 className="text-3xl font-black uppercase italic mb-10 relative">Nowa Promocja</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 relative">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] font-black uppercase ml-4 text-zinc-400">Nazwa Produktu</label>
                  <input required placeholder="np. LEGO Technic Bolid" className="w-full p-5 rounded-2xl bg-zinc-100 font-bold outline-none focus:ring-2 ring-[#BF2024]" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase ml-4 text-zinc-400">Kategoria</label>
                  <select className="w-full p-5 rounded-2xl bg-zinc-100 font-bold outline-none cursor-pointer" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option>Zabawki</option><option>Szkoła i biuro</option><option>Imprezy</option><option>Gry</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase ml-4 text-zinc-400">Rabat (tekst)</label>
                   <input placeholder="np. -20% / HIT!" className="w-full p-5 rounded-2xl bg-zinc-100 font-bold outline-none focus:ring-2 ring-[#BF2024]" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase ml-4 text-zinc-400">Stara Cena</label>
                  <input required placeholder="99.00" className="w-full p-5 rounded-2xl bg-zinc-100 font-bold outline-none" value={formData.old_price} onChange={e => setFormData({...formData, old_price: e.target.value})} />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase ml-4 text-zinc-400">Nowa Cena</label>
                  <input required placeholder="79.00" className="w-full p-5 rounded-2xl bg-zinc-100 font-bold outline-none" value={formData.new_price} onChange={e => setFormData({...formData, new_price: e.target.value})} />
                </div>
              </div>
              
              <button className="w-full py-6 bg-zinc-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-[#0055ff] transition-all shadow-2xl relative">Zatwierdź i publikuj</button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}