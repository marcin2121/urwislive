'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Plus, Trash2, X, Flame, Image as ImageIcon, ChevronDown, Loader2, RefreshCw } from 'lucide-react'
import { uploadAdminFile } from '@/lib/admin-utils'
import { toast } from 'sonner'

export function PromosTab() {
  const [promos, setPromos] = useState<any[]>([]);
  const [isAddingPromo, setIsAddingPromo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [promoForm, setPromoForm] = useState({ title: '', old_price: '', new_price: '', discount: '', category: 'Zabawki', expires_at: '', image_url: '' });

  const fetchPromos = async () => {
    setIsRefreshing(true);
    const supabase = createClient();
    const { data } = await supabase.from('promocje').select('*').order('created_at', { ascending: false });
    setPromos(data || []);
    setIsRefreshing(false);
  };
  useEffect(() => { fetchPromos(); }, []);

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const payload = { ...promoForm, expires_at: promoForm.expires_at ? new Date(promoForm.expires_at).toISOString() : null, is_active: true };
    const { error } = await supabase.from('promocje').insert([payload]);
    if (!error) { setIsAddingPromo(false); setIsCustomCategory(false); setPromoForm({ title: '', old_price: '', new_price: '', discount: '', category: 'Zabawki', expires_at: '', image_url: '' }); toast.success('Okazja opublikowana!'); fetchPromos(); } else toast.error('Błąd zapisu');
  };

  const handleDeletePromo = async (id: string) => {
    if (confirm('Usunąć ofertę z serwisu?')) {
      const supabase = createClient();
      await supabase.from('promocje').delete().eq('id', id); toast.success('Usunięto ofertę'); fetchPromos();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-zinc-900 flex items-center gap-3"><Tag size={28} /> Katalog Ofert</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={fetchPromos} className="p-4 bg-white border border-zinc-200 rounded-2xl text-zinc-500 hover:text-zinc-900 cursor-pointer shadow-sm flex items-center justify-center">
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setIsAddingPromo(true)} className="flex-1 sm:flex-none px-6 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-[#BF2024] cursor-pointer shadow-lg"><Plus size={18} /> Nowa Promocja</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {promos.map(p => (
          <div key={p.id} className="bg-white p-5 md:p-6 rounded-4xl border border-zinc-100 shadow-sm flex flex-col justify-between group relative overflow-hidden">
            {p.image_url && <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-100 opacity-20 -mr-6 -mt-6 rounded-full blur-2xl" />}
            <div>
              <span className={`px-2.5 py-1 text-[8px] font-black uppercase rounded-lg mb-3 inline-block ${p.category === 'LEGO' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-[#0055ff]'}`}>{p.category}</span>
              <h3 className="text-lg md:text-xl font-black uppercase italic text-zinc-900 line-clamp-2 mb-3 leading-[0.95]">{p.title}</h3>
              <div className="flex items-baseline gap-2 mb-4"><span className="text-2xl md:text-3xl font-black text-zinc-900">{p.new_price} zł</span><span className="text-xs text-zinc-400 line-through font-bold">{p.old_price} zł</span></div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-zinc-50">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{p.is_active ? '✅ Widoczna' : '❌ Ukryta'}</span>
              <button onClick={() => handleDeletePromo(p.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white cursor-pointer"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isAddingPromo && (
          <div className="fixed inset-0 z-[15000] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <motion.form initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} onSubmit={handleAddPromo} className="bg-white rounded-4xl p-6 md:p-12 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button type="button" onClick={() => setIsAddingPromo(false)} className="absolute top-8 right-8 text-zinc-400 hover:text-zinc-900 cursor-pointer"><X size={24} /></button>
              <h3 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter mb-10 flex items-center gap-3 text-[#BF2024]"><Flame size={28} /> Nowa Okazja</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <input required placeholder="Nazwa produktu..." className="md:col-span-2 w-full p-5 rounded-2xl bg-zinc-50 font-bold outline-none focus:ring-2 ring-red-500" value={promoForm.title} onChange={e => setPromoForm(p => ({ ...p, title: e.target.value }))} />
                
                <div className="md:col-span-2">
                    <label className="flex items-center justify-center w-full h-32 bg-zinc-50 border-2 border-zinc-200 border-dashed rounded-2xl cursor-pointer hover:border-red-400">
                        {uploading ? <Loader2 className="animate-spin text-red-500" /> : promoForm.image_url ? (
                            <div className="flex items-center gap-4"><img src={promoForm.image_url} alt="Podgląd" className="w-20 h-20 object-cover rounded-xl shadow-md" /><span className="text-xs font-black uppercase text-green-600">✅ Zdjęcie Wybrane</span></div>
                        ) : (
                            <div className="flex items-center gap-3"><ImageIcon className="text-zinc-300" /><span className="text-[10px] font-black uppercase text-zinc-400">Kliknij by dodać zdjęcie</span></div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                          const file = e.target.files?.[0]; if (!file) return; setUploading(true);
                          const url = await uploadAdminFile(file, 'promos');
                          if (url) setPromoForm(p => ({ ...p, image_url: url }));
                          setUploading(false);
                        }} />
                    </label>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase mb-1 block">Kategoria</label>
                  {!isCustomCategory ? (
                    <select className="w-full p-5 rounded-2xl bg-zinc-50 font-black outline-none cursor-pointer" value={promoForm.category} onChange={e => { if (e.target.value === "INNA") { setIsCustomCategory(true); setPromoForm(p => ({ ...p, category: '' })); } else { setPromoForm(p => ({ ...p, category: e.target.value })); } }}>
                      <option value="Zabawki">Zabawki</option><option value="LEGO">LEGO</option><option value="Szkoła">Szkoła</option><option value="Sala Zabaw">Sala Zabaw</option><option value="INNA" className="text-blue-600">➕ Własna...</option>
                    </select>
                  ) : (
                    <div className="relative">
                      <input autoFocus placeholder="Nowa kategoria..." className="w-full p-5 rounded-2xl border-2 border-blue-500 font-black outline-none" value={promoForm.category} onChange={e => setPromoForm(p => ({ ...p, category: e.target.value }))} />
                      <button type="button" onClick={() => { setIsCustomCategory(false); setPromoForm(p => ({ ...p, category: 'Zabawki' })); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-zinc-100 rounded-xl"><X size={16} /></button>
                    </div>
                  )}
                </div>

                <input placeholder="Rabat (np. -20%)" className="w-full p-5 rounded-2xl bg-zinc-50 font-black outline-none focus:ring-2 ring-red-500" value={promoForm.discount} onChange={e => setPromoForm(p => ({ ...p, discount: e.target.value }))} />
                <div><label className="text-[10px] font-black text-zinc-400 uppercase">Stara Cena (zł)</label><input required placeholder="0.00" className="w-full p-5 rounded-2xl bg-zinc-50 font-black outline-none" value={promoForm.old_price} onChange={e => setPromoForm(p => ({ ...p, old_price: e.target.value }))} /></div>
                <div><label className="text-[10px] font-black text-zinc-400 uppercase">Cena Promocyjna (zł)</label><input required placeholder="0.00" className="w-full p-5 rounded-2xl bg-zinc-50 font-black outline-none focus:ring-2 ring-green-500" value={promoForm.new_price} onChange={e => setPromoForm(p => ({ ...p, new_price: e.target.value }))} /></div>
              </div>
              <button type="submit" disabled={uploading} className="w-full py-6 bg-zinc-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all cursor-pointer">
                  {uploading ? 'Wgrywanie...' : 'Opublikuj Teraz 🔥'}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}