'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Trash2, Edit2, X, Lock, 
  Tag, Package, Percent, LogOut, Loader2 
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// TYPY DANYCH
interface Promo {
  id: string;
  title: string;
  old_price: string;
  new_price: string;
  discount: string;
  category: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

  // Stan formularza
  const [formData, setFormData] = useState({
    title: '',
    old_price: '',
    new_price: '',
    discount: '',
    category: 'Zabawki',
    image_url: '', // Dodane pole
  })

  // --- LOGIKA AUTORYZACJI ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'URWIS2026') {
      setIsAuthenticated(true)
      fetchPromos()
    } else {
      alert('Niepoprawne hasło!')
    }
  }

  // --- LOGIKA BAZY DANYCH ---
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

  // Poprawiona funkcja resetowania
async function handleAddPromo(e: React.FormEvent) {
  e.preventDefault();
  const { error } = await supabase.from('promocje').insert([formData]);
  
  if (error) {
    alert('Błąd zapisu!');
  } else {
    setIsAdding(false);
    // TUTAJ BYŁ BŁĄD - dodajemy image_url: ''
    setFormData({ 
      title: '', 
      old_price: '', 
      new_price: '', 
      discount: '', 
      category: 'Zabawki',
      image_url: '' // Teraz TS jest szczęśliwy
    });
    fetchPromos();
  }
}

  async function handleDelete(id: string) {
    if (confirm('Na pewno usunąć tę promocję?')) {
      const { error } = await supabase.from('promocje').delete().eq('id', id)
      if (error) alert('Błąd usuwania!')
      else fetchPromos()
    }
  }

  // --- WIDOK LOGOWANIA ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/30 backdrop-blur-3xl p-12 rounded-[3.5rem] border-2 border-white/60 shadow-2xl max-w-md w-full"
        >
          <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Lock className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-center mb-8">Urwis Admin</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Podaj hasło" 
              className="w-full p-5 rounded-2xl bg-white/50 border-2 border-white focus:border-[#BF2024] outline-none font-bold text-center transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
              Zaloguj do bazy
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  // --- WIDOK GŁÓWNY PANELU ---
  return (
    <main className="min-h-screen pt-40 pb-24 px-6 max-w-7xl mx-auto">
      
      {/* HEADER PANELU */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16 bg-white/20 backdrop-blur-xl p-10 rounded-[3rem] border-2 border-white/60 shadow-lg">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#BF2024] mb-2 block">System Zarządzania</span>
          <h1 className="text-5xl md:text-7xl font-black  tracking-tighter uppercase leading-none text-zinc-900">
            KONTROLA <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">PROMOCJI</span>
          </h1>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setIsAdding(true)}
            className="px-10 py-6 bg-zinc-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:bg-[#BF2024] transition-all shadow-2xl hover:scale-105"
          >
            <Plus size={20} strokeWidth={3} /> Dodaj Promocję
          </button>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="p-6 bg-white/50 rounded-2xl hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-all border border-white"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* MODAL DODAWANIA */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-zinc-900/40 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.form 
              onSubmit={handleAddPromo}
              initial={{ y: 50, scale: 0.9 }} animate={{ y: 0, scale: 1 }}
              className="bg-white rounded-[3.5rem] p-12 max-w-2xl w-full shadow-2xl border-2 border-white relative"
            >
              <button type="button" onClick={() => setIsAdding(false)} className="absolute top-8 right-8 text-zinc-400 hover:text-zinc-900"><X size={32} /></button>
              
              <h3 className="text-3xl font-black uppercase italic mb-10">Nowa Okazja</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <input required placeholder="Nazwa produktu" className="p-5 rounded-2xl bg-zinc-100 font-bold outline-none focus:ring-2 ring-[#BF2024]" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                <select className="p-5 rounded-2xl bg-zinc-100 font-bold outline-none focus:ring-2 ring-[#0055ff]" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option>Zabawki</option><option>Szkoła i biuro</option><option>Imprezy</option><option>Gry</option>
                </select>
                <div className="space-y-2 md:col-span-2">
  <label className="text-[10px] font-black uppercase ml-4 text-zinc-400">Link do zdjęcia (URL)</label>
  <input 
    placeholder="https://images.unsplash.com/photo..." 
    className="w-full p-5 rounded-2xl bg-zinc-100 font-bold outline-none focus:ring-2 ring-[#BF2024]" 
    value={formData.image_url} 
    onChange={e => setFormData({...formData, image_url: e.target.value})} 
  />
</div>
                <input required placeholder="Stara cena (zł)" className="p-5 rounded-2xl bg-zinc-100 font-bold outline-none" value={formData.old_price} onChange={e => setFormData({...formData, old_price: e.target.value})} />
                <input required placeholder="Nowa cena (zł)" className="p-5 rounded-2xl bg-zinc-100 font-bold outline-none" value={formData.new_price} onChange={e => setFormData({...formData, new_price: e.target.value})} />
                <input placeholder="Rabat (np. -20%)" className="p-5 rounded-2xl bg-zinc-100 font-bold outline-none md:col-span-2" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} />
              </div>

              <button className="w-full py-6 bg-zinc-900 text-white rounded-4xl font-black uppercase tracking-widest hover:bg-[#0055ff] transition-all">
                Zapisz w bazie danych
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LISTA PROMOCJI */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#BF2024]" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promos.map((promo) => (
            <motion.div 
              key={promo.id} layout
              className="bg-white/40 backdrop-blur-xl border-2 border-white/60 p-8 rounded-[3rem] shadow-xl group hover:border-[#BF2024] transition-all relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="px-4 py-2 bg-zinc-900 text-white text-[10px] font-black uppercase rounded-xl tracking-widest">{promo.category}</span>
                <button 
                  onClick={() => handleDelete(promo.id)}
                  className="p-3 bg-red-100 text-[#BF2024] rounded-xl hover:bg-[#BF2024] hover:text-white transition-all shadow-sm"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">{promo.title}</h3>
              
              <div className="flex items-baseline gap-3 mb-8">
                <span className="text-4xl font-black text-[#BF2024]">{promo.new_price} zł</span>
                <span className="text-sm text-zinc-400 line-through font-bold">{promo.old_price} zł</span>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-4 bg-white/60 border-2 border-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all">
                  Edytuj
                </button>
                <div className="px-4 py-4 bg-[#BF2024]/10 text-[#BF2024] rounded-2xl font-black text-xs flex items-center">
                  {promo.discount || 'PROMO'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  )
}