'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { TicketPercent, Plus, Pencil, Trash2, X, RefreshCw } from "lucide-react"
import { toast } from 'sonner'

export function KuponyTab() {
  const [kupony, setKupony] = useState<any[]>([]);
  const [isAddingKupon, setIsAddingKupon] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [kuponForm, setKuponForm] = useState<any>({ title: '', code: '', description: '', gradient: 'from-[#0055ff] to-blue-500', is_reusable: false, allowed_days: [], expires_at: '', usage_limit: '' });

  const fetchKupony = async () => {
    setIsRefreshing(true);
    const supabase = createClient();
    if (!supabase) {
      setIsRefreshing(false);
      return;
    }
    const { data } = await supabase.from('kupony').select('*').is('user_id', null).order('created_at', { ascending: false });
    setKupony(data || []);
    setIsRefreshing(false);
  };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchKupony(); }, []);

  const handleSaveKupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) {
      toast.error('Błąd konfiguracji bazy danych');
      return;
    }
    const payload = { ...kuponForm, usage_limit: kuponForm.usage_limit ? parseInt(kuponForm.usage_limit) : null, expires_at: kuponForm.expires_at ? new Date(kuponForm.expires_at).toISOString() : null, is_active: true };
    const { error } = kuponForm.id ? await supabase.from('kupony').update(payload).eq('id', kuponForm.id) : await supabase.from('kupony').insert([payload]);
    if (!error) { setIsAddingKupon(false); fetchKupony(); toast.success('Zapisano kupon!'); } else toast.error('Błąd');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-[#0055ff] flex items-center gap-3"><TicketPercent size={28} /> Globalne Kupony</h2>
         <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={fetchKupony} className="p-4 bg-white border border-zinc-200 rounded-2xl text-[#0055ff] hover:bg-blue-50 cursor-pointer shadow-sm flex items-center justify-center">
              <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
            </button>
            <button onClick={() => { setKuponForm({ title: '', code: '', description: '', gradient: 'from-[#0055ff] to-blue-500', is_reusable: false, allowed_days: [], expires_at: '', usage_limit: '' }); setIsAddingKupon(true); }} className="flex-1 sm:flex-none px-6 py-4 bg-[#0055ff] text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-blue-600 shadow-lg cursor-pointer"><Plus size={18} /> Nowy Kupon</button>
         </div>
       </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
         {kupony.map(k => (
           <div key={k.id} className={`bg-gradient-to-br ${k.gradient} p-6 rounded-3xl text-white shadow-xl flex flex-col justify-between relative min-h-[200px]`}>
             <div className="absolute top-4 right-4 flex gap-2 z-10">
               <button onClick={() => { setKuponForm({...k}); setIsAddingKupon(true); }} className="p-2 bg-white/20 hover:bg-white/40 rounded-full cursor-pointer"><Pencil size={16} /></button>
               <button onClick={async () => { 
                  const supabase = createClient();
                  if (supabase) {
                    await supabase.from('kupony').delete().eq('id', k.id); 
                    fetchKupony(); 
                  }
                }} className="p-2 bg-white/20 hover:bg-red-500 rounded-full cursor-pointer"><Trash2 size={16} /></button>
             </div>
             <div className="mb-4 pr-16">
               <h3 className="text-2xl font-black italic uppercase leading-none mb-1">{k.title}</h3>
               <p className="text-[10px] font-bold opacity-80 mt-2">Pula: {k.usage_limit ? `${k.current_usage} / ${k.usage_limit}` : 'Bez limitu'}</p>
             </div>
             <div className="bg-white text-zinc-900 py-2.5 px-4 rounded-xl inline-block w-fit shadow-lg"><span className="block text-[8px] uppercase font-black text-zinc-400">KOD PRZY KASIE</span><span className="text-xl font-black tracking-widest">{k.code}</span></div>
           </div>
         ))}
       </div>

       <AnimatePresence>
        {isAddingKupon && (
          <div className="fixed inset-0 z-[15000] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <motion.form initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} onSubmit={handleSaveKupon} className="bg-white rounded-4xl p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button type="button" onClick={() => setIsAddingKupon(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 cursor-pointer"><X size={24} /></button>
              <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3 text-[#0055ff]"><TicketPercent size={28} /> {kuponForm.id ? 'Edytuj Kupon' : 'Nowy Kupon'}</h3>
              
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-black text-zinc-400 uppercase block mb-1">Tytuł Kuponu</label><input required placeholder="np. -10% na LEGO" className="w-full p-4 rounded-2xl bg-zinc-50 font-black outline-none focus:ring-2 ring-blue-500" value={kuponForm.title} onChange={e => setKuponForm((p: any) => ({ ...p, title: e.target.value }))} /></div>
                  <div><label className="text-[10px] font-black text-zinc-400 uppercase block mb-1">Kod</label><input required placeholder="np. LEGO10" className="w-full p-4 rounded-2xl bg-zinc-50 font-black outline-none focus:ring-2 ring-blue-500 uppercase" value={kuponForm.code} onChange={e => setKuponForm((p: any) => ({ ...p, code: e.target.value.toUpperCase() }))} /></div>
                </div>
                <div><label className="text-[10px] font-black text-zinc-400 uppercase block mb-1">Opis (Opcjonalnie)</label><input className="w-full p-4 rounded-2xl bg-zinc-50 font-bold outline-none focus:ring-2 ring-blue-500" value={kuponForm.description} onChange={e => setKuponForm((p: any) => ({ ...p, description: e.target.value }))} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-black text-zinc-400 uppercase block mb-1">Limit użyć</label><input type="number" className="w-full p-4 rounded-2xl bg-zinc-50 font-black outline-none" value={kuponForm.usage_limit} onChange={e => setKuponForm((p: any) => ({ ...p, usage_limit: e.target.value }))} /></div>
                  <div><label className="text-[10px] font-black text-zinc-400 uppercase block mb-1">Kolor</label>
                    <div className="flex gap-2 mt-2">
                      {[ 'from-[#0055ff] to-blue-500', 'from-[#BF2024] to-red-500', 'from-amber-400 to-orange-500', 'from-emerald-500 to-green-500' ].map(c => (
                        <button key={c} type="button" onClick={() => setKuponForm((p: any) => ({...p, gradient: c}))} className={`w-8 h-8 rounded-full bg-gradient-to-br ${c} border-4 transition-all cursor-pointer ${kuponForm.gradient === c ? 'border-zinc-900 scale-110 shadow-lg' : 'border-transparent'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-[#0055ff] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all cursor-pointer">Zapisz Kupon 🎟️</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
