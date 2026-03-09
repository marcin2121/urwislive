'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { CircleDashed, Plus, Pencil, Trash2, X, RefreshCw, History, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import { getAdminUsersDetails } from '@/app/actions/get-admin-users'

export function WheelTab() {
  const [prizes, setPrizes] = useState<any[]>([]);
  const [spinHistory, setSpinHistory] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [form, setForm] = useState<any>({ title: '', code_prefix: '', description: '', gradient: 'from-amber-400 to-orange-500', chance: '10' });

  const fetchData = async () => {
    setIsRefreshing(true);
    const supabase = createClient();
    
    try {
      // Pobieramy nagrody, kupony z przypisanym użytkownikiem (czyli wylosowane) oraz dane użytkowników
      const [prizesRes, couponsRes, loyaltyRes, authUsersRes] = await Promise.all([
        supabase.from('wheel_prizes').select('*').order('chance', { ascending: false }),
        supabase.from('kupony').select('id, title, code, created_at, user_id').not('user_id', 'is', null).order('created_at', { ascending: false }).limit(100),
        supabase.from('loyalty_cards').select('id, full_name, auth_user_id'),
        getAdminUsersDetails()
      ]);

      setPrizes(prizesRes.data || []);

      // --- ŁĄCZENIE DANYCH UŻYTKOWNIKÓW (Imię + Email) ---
      const authUsers = (authUsersRes as any)?.success ? (authUsersRes as any).extraData : {};
      const userMap = new Map();
      
      // Zapisujemy e-maile z bazy kont
      Object.values(authUsers).forEach((extra: any) => {
          if (extra.auth_user_id) {
              userMap.set(extra.auth_user_id, { name: extra.full_name, email: extra.email });
          }
      });

      // Nadpisujemy/Dodajemy imiona z kart lojalnościowych
      (loyaltyRes.data || []).forEach(u => {
          const existing = userMap.get(u.auth_user_id) || {};
          const merged = { ...existing, name: u.full_name || existing.name };
          if (u.auth_user_id) userMap.set(u.auth_user_id, merged);
          userMap.set(u.id, merged); // Zapasowo przypisujemy pod ID karty
      });

      // Tworzymy historię losowań do tabeli
      const history = (couponsRes.data || []).map(k => {
          const user = userMap.get(k.user_id) || { name: 'Nieznany', email: 'Brak e-maila' };
          return {
              id: k.id,
              created_at: k.created_at,
              prize: k.title,
              code: k.code,
              user_name: user.name || 'Brak imienia',
              user_email: user.email || 'Brak e-maila'
          };
      });

      setSpinHistory(history);
    } catch (error) {
      toast.error('Błąd pobierania danych koła');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const payload = { ...form, chance: parseFloat(form.chance), is_active: true };
    const { error } = form.id ? await supabase.from('wheel_prizes').update(payload).eq('id', form.id) : await supabase.from('wheel_prizes').insert([payload]);
    if (!error) { setIsAdding(false); fetchData(); toast.success('Zapisano!'); } else toast.error('Błąd');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 md:space-y-12">
       
       {/* 1. SEKCJA: KONFIGURACJA NAGRÓD */}
       <section className="space-y-6 md:space-y-8">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <div>
              <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-amber-500 flex items-center gap-3"><CircleDashed size={28} /> Koło Fortuny</h2>
              <p className="text-xs font-bold text-zinc-400 uppercase mt-1">Suma Szans: {prizes.reduce((s, p) => s + Number(p.chance), 0)}%</p>
           </div>
           <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={fetchData} className="p-4 bg-white border border-zinc-200 rounded-2xl text-amber-500 hover:bg-amber-50 cursor-pointer shadow-sm flex items-center justify-center">
                <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
              </button>
              <button onClick={() => { setForm({ title: '', code_prefix: '', description: '', gradient: 'from-amber-400 to-orange-500', chance: '10' }); setIsAdding(true); }} className="flex-1 sm:flex-none px-6 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-amber-600 shadow-lg cursor-pointer"><Plus size={18} /> Dodaj Nagrodę</button>
           </div>
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
           {prizes.map(p => (
             <div key={p.id} className={`bg-gradient-to-br ${p.gradient} p-6 rounded-3xl text-white shadow-xl flex flex-col justify-between relative min-h-[200px]`}>
               <div className="absolute top-4 right-4 flex gap-2 z-10">
                 <button onClick={() => { setForm({...p}); setIsAdding(true); }} className="p-2 bg-white/20 hover:bg-white/40 rounded-full cursor-pointer"><Pencil size={16} /></button>
                 <button onClick={async () => { await createClient().from('wheel_prizes').delete().eq('id', p.id); fetchData(); }} className="p-2 bg-white/20 hover:bg-red-500 rounded-full cursor-pointer"><Trash2 size={16} /></button>
               </div>
               <div className="mb-4 pr-16">
                 <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-black/30 rounded-xl font-black text-sm mb-3">{p.chance}% Szans</span>
                 <h3 className="text-2xl font-black italic uppercase leading-none mb-1">{p.title}</h3>
               </div>
               <div className="bg-white text-zinc-900 py-2.5 px-4 rounded-xl inline-block w-fit shadow-lg"><span className="block text-[8px] uppercase font-black text-zinc-400">PREFIX KODU</span><span className="text-xl font-black tracking-widest">{p.code_prefix}-***</span></div>
             </div>
           ))}
           {prizes.length === 0 && <div className="col-span-full py-10 text-center font-bold text-zinc-400 bg-white border-2 border-dashed rounded-3xl">Brak nagród w kole.</div>}
         </div>
       </section>

       {/* 2. SEKCJA: HISTORIA LOSOWAŃ (Nowość) */}
       <section>
          <div className="bg-white rounded-3xl md:rounded-4xl border border-zinc-100 shadow-xl overflow-hidden">
            <div className="p-4 md:p-8 border-b border-zinc-50 bg-zinc-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-xl md:text-2xl font-black italic uppercase text-zinc-900 flex items-center gap-2">
                  <History size={24} className="text-amber-500" /> Historia Losowań
                </h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Ostatnie 100 wylosowanych nagród</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-50/30 text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b border-zinc-50">
                  <tr>
                    <th className="p-4 md:p-6 whitespace-nowrap">Data</th>
                    <th className="p-4 md:p-6 whitespace-nowrap">Użytkownik</th>
                    <th className="p-4 md:p-6 whitespace-nowrap">Wylosowano</th>
                    <th className="p-4 md:p-6 whitespace-nowrap text-right">Zapisany Kod</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {spinHistory.map((spin) => (
                    <tr key={spin.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="p-4 md:p-6 text-xs md:text-sm font-black text-zinc-500">
                        {formatDate(spin.created_at)}
                      </td>
                      <td className="p-4 md:p-6">
                        <div className="flex flex-col">
                          <span className="font-black text-zinc-900 uppercase italic text-sm md:text-base block">
                            {spin.user_name}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-400">
                            {spin.user_email}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 md:p-6">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
                          <Ticket size={12}/> {spin.prize}
                        </span>
                      </td>
                      <td className="p-4 md:p-6 text-right">
                        <span className="text-xs md:text-sm font-black tracking-widest text-zinc-700 bg-zinc-100 px-2 py-1 rounded-md">
                          {spin.code}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {spinHistory.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-zinc-400 font-bold">
                        Nikt jeszcze nie kręcił kołem fortuny.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
       </section>

       {/* MODAL DODAWANIA/EDYCJI NAGRODY */}
       <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[15000] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <motion.form initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} onSubmit={handleSave} className="bg-white rounded-4xl p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button type="button" onClick={() => setIsAdding(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 cursor-pointer"><X size={24} /></button>
              <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3 text-amber-500"><CircleDashed size={28} /> {form.id ? 'Edytuj Nagrodę' : 'Nowa Nagroda'}</h3>
              
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-black text-zinc-400 uppercase block mb-1">Tytuł</label><input required placeholder="np. Zniżka 10%" className="w-full p-4 rounded-2xl bg-zinc-50 font-black outline-none focus:ring-2 ring-amber-500" value={form.title} onChange={e => setForm((p:any) => ({ ...p, title: e.target.value }))} /></div>
                  <div><label className="text-[10px] font-black text-zinc-400 uppercase block mb-1">Szansa (%)</label><input required type="number" step="0.1" className="w-full p-4 rounded-2xl bg-zinc-50 font-black outline-none focus:ring-2 ring-amber-500" value={form.chance} onChange={e => setForm((p:any) => ({ ...p, chance: e.target.value }))} /></div>
                </div>
                <div><label className="text-[10px] font-black text-zinc-400 uppercase block mb-1">Prefix Kodu</label><input required placeholder="BONUS10" className="w-full p-4 rounded-2xl bg-zinc-50 font-black outline-none focus:ring-2 ring-amber-500 uppercase" value={form.code_prefix} onChange={e => setForm((p:any) => ({ ...p, code_prefix: e.target.value.toUpperCase() }))} /></div>
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase block mb-1">Kolor kafelka</label>
                  <div className="flex flex-wrap gap-2 md:gap-3 mt-2">
                    {[ 'from-[#0055ff] to-blue-500', 'from-[#BF2024] to-red-500', 'from-amber-400 to-orange-500', 'from-pink-500 to-rose-500', 'from-emerald-500 to-green-500', 'from-zinc-800 to-black' ].map(c => (
                      <button key={c} type="button" onClick={() => setForm((prev:any) => ({...prev, gradient: c}))} className={`w-10 h-10 rounded-full bg-gradient-to-br ${c} border-4 transition-all cursor-pointer ${form.gradient === c ? 'border-zinc-900 scale-110 shadow-lg' : 'border-transparent'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-amber-600 transition-all cursor-pointer">Zapisz Nagrodę 🎡</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}