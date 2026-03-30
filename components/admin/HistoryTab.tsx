'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { History, RefreshCw } from "lucide-react"

export function HistoryTab() {
  const [history, setHistory] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHistory = async () => { 
    setIsRefreshing(true);
    const supabase = createClient();
    if (!supabase) {
      setIsRefreshing(false);
      return;
    }
    const { data } = await supabase.from('push_history').select('*').order('created_at', { ascending: false });
    setHistory(data || []);
    setIsRefreshing(false);
  };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchHistory(); }, []);
  
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-zinc-400"><History size={28} /> Historia Wysyłek</h2>
        <button onClick={fetchHistory} className="p-3 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 cursor-pointer shadow-sm text-zinc-500 flex items-center justify-center">
          <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </div>
      <div className="space-y-4">
        {history.map(h => (
          <div key={h.id} className="bg-white/60 p-6 rounded-3xl border border-zinc-100 flex justify-between items-center">
             <div><span className="text-[10px] font-black text-zinc-400 uppercase block">{new Date(h.created_at).toLocaleString()}</span><span className="text-lg font-black uppercase italic text-zinc-700">{h.title}</span></div>
             <div className="text-right"><p className="text-[9px] font-black text-zinc-400 uppercase">Wysłano do</p><p className="font-black text-xl text-zinc-900">{h.sent_to_count || 0} osób</p></div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
