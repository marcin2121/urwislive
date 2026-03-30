'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Bell, RefreshCw, Loader2 } from "lucide-react"
import { toast } from 'sonner'
import { PUSH_CATEGORIES, PushTopic } from '@/lib/push-config'
import { uploadAdminFile } from '@/lib/admin-utils'

export function PushTab() {
  const [selectedTopic, setSelectedTopic] = useState<PushTopic>('wszystkie');
  const [pushData, setPushData] = useState({ title: '', message: '', image_url: '', scheduled_for: '' });
  const [isSending, setIsSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [subs, setSubs] = useState(0);

  const fetchSubs = async () => {
    setIsRefreshing(true);
    const supabase = createClient();
    if (!supabase) {
      setIsRefreshing(false);
      return;
    }
    let query = supabase.from('push_subscriptions').select('*', { count: 'exact', head: true });
    if (selectedTopic !== 'wszystkie') query = query.or(`topics.cs.{"${selectedTopic}"},topics.cs.{"wszystkie"}`);
    const { count } = await query;
    setSubs(count || 0);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchSubs();
    // 🟢 Realtime dla subskrypcji
    const supabase = createClient();
    if (supabase) {
      const channel = supabase.channel('push-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'push_subscriptions' }, fetchSubs)
        .subscribe();
      return () => { supabase.removeChannel(channel); }
    }
  }, [selectedTopic]);

  async function handleSendPush(e: React.FormEvent) {
    e.preventDefault();
    if (subs === 0) return toast.error('Brak odbiorców!');
    setIsSending(true);
    const supabase = createClient();
    if (!supabase) {
      toast.error('Błąd konfiguracji');
      setIsSending(false);
      return;
    }
    try {
      if (pushData.scheduled_for) {
        await supabase.from('push_history').insert([{ ...pushData, topic: selectedTopic, status: 'scheduled', sent_to_count: subs }]);
        toast.success('Zaplanowano wysyłkę!');
      } else {
        await fetch('/api/push/send-all', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...pushData, topic: selectedTopic }) });
        toast.success('Wysłano natychmiast!');
      }
      setPushData({ title: '', message: '', image_url: '', scheduled_for: '' });
    } catch (_error) { toast.error('Błąd wysyłki'); } finally { setIsSending(false); }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
       <div className="flex justify-between items-center">
         <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter flex items-center gap-2"><Bell size={28}/> Wysyłka Push</h2>
         <button onClick={fetchSubs} className="p-3 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 cursor-pointer shadow-sm flex items-center gap-2 text-sm font-bold text-zinc-500">
           <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} /> Odśwież Baze
         </button>
       </div>
       <section className="bg-white p-6 md:p-10 rounded-4xl shadow-xl border border-zinc-100 space-y-6">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
           {PUSH_CATEGORIES.map(cat => (
             <button key={cat.id} type="button" onClick={() => setSelectedTopic(cat.id)} className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 cursor-pointer text-center ${selectedTopic === cat.id ? 'bg-[#0055ff] border-[#0055ff] text-white shadow-md' : 'bg-white border-zinc-100 text-zinc-400'}`}>{cat.label}</button>
           ))}
         </div>
         <form onSubmit={handleSendPush} className="space-y-4">
           <input required placeholder="Tytuł powiadomienia..." className="w-full p-5 rounded-2xl bg-zinc-50 border-none font-bold outline-none focus:ring-2 ring-[#0055ff]" value={pushData.title} onChange={e => setPushData(prev => ({ ...prev, title: e.target.value }))} />
           <textarea required placeholder="Treść wiadomości..." rows={4} className="w-full p-5 rounded-2xl bg-zinc-50 border-none font-bold outline-none focus:ring-2 ring-[#0055ff] resize-none" value={pushData.message} onChange={e => setPushData(prev => ({ ...prev, message: e.target.value }))} />
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <input type="datetime-local" className="bg-zinc-50 rounded-2xl p-4 font-bold text-xs" value={pushData.scheduled_for} onChange={e => setPushData(prev => ({ ...prev, scheduled_for: e.target.value }))} />
             <label className="bg-zinc-50 p-4 rounded-2xl flex items-center justify-center cursor-pointer border border-dashed border-zinc-200">
               {uploading ? <Loader2 className="animate-spin text-[#0055ff]" /> : <span className="text-[10px] font-black uppercase text-zinc-400">{pushData.image_url ? '✅ Zdjęcie gotowe' : 'Dodaj zdjęcie'}</span>}
               <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                 const file = e.target.files?.[0]; if (!file) return; setUploading(true);
                 const url = await uploadAdminFile(file, 'broadcasts'); if (url) setPushData(p => ({ ...p, image_url: url })); setUploading(false);
               }} />
             </label>
           </div>
           <button disabled={isSending || subs === 0} className="w-full py-6 bg-[#0055ff] text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 cursor-pointer mt-4">
             {isSending ? <Loader2 className="animate-spin mx-auto" /> : pushData.scheduled_for ? 'Zaplanuj w kolejce' : `Wyślij do ${subs} osób 🚀`}
           </button>
         </form>
       </section>
    </motion.div>
  )
}
