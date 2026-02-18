'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { 
  UserPlus, UserMinus, Check, X, Search, 
  Users, MessageSquare, Swords, Loader2, ShieldCheck, User as UserIcon 
} from 'lucide-react'
import Link from 'next/link'
import Particles from "@/components/Particles"

export default function FriendsPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchSocialData(user.id);
      }
    }
    init();
  }, []);

  const fetchSocialData = async (userId: string) => {
    setLoading(true);
    // 1. Pobierz zaakceptowanych znajomych
    const { data: friendsData } = await supabase
      .from('friendships')
      .select(`
        *,
        sender:profiles!friendships_sender_id_fkey(id, username, avatar_url, level),
        receiver:profiles!friendships_receiver_id_fkey(id, username, avatar_url, level)
      `)
      .eq('status', 'accepted')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    // 2. Pobierz oczekujące zaproszenia (do Ciebie)
    const { data: requestsData } = await supabase
      .from('friendships')
      .select(`*, sender:profiles!friendships_sender_id_fkey(id, username, avatar_url, level)`)
      .eq('receiver_id', userId)
      .eq('status', 'pending');

    if (friendsData) {
      const formattedFriends = friendsData.map(f => 
        f.sender_id === userId ? f.receiver : f.sender
      );
      setFriends(formattedFriends);
    }
    if (requestsData) setPendingRequests(requestsData);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (searchQuery.length < 3) return;
    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, level')
      .ilike('username', `%${searchQuery}%`)
      .neq('id', user?.id)
      .limit(5);
    setSearchResults(data || []);
  };

  const sendRequest = async (receiverId: string) => {
    await supabase.from('friendships').insert({
      sender_id: user.id,
      receiver_id: receiverId,
      status: 'pending'
    });
    alert("Zaproszenie wysłane!");
    setSearchResults([]);
  };

  const updateRequest = async (requestId: string, newStatus: 'accepted' | 'declined') => {
    if (newStatus === 'declined') {
      await supabase.from('friendships').delete().eq('id', requestId);
    } else {
      await supabase.from('friendships').update({ status: 'accepted' }).eq('id', requestId);
    }
    fetchSocialData(user.id);
  };

  return (
    <main className="relative min-h-screen w-full bg-zinc-950 text-white pt-32 pb-20 px-6">
      <div className="fixed inset-0 -z-10"><Particles particleCount={30} /></div>
      
      <div className="max-w-4xl mx-auto space-y-12">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Twoja <span className="text-blue-500">Siatka Szpiegowska</span></h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-2">Zarządzaj znajomymi i planuj pojedynki</p>
          </div>
          <div className="flex items-center gap-3 bg-zinc-900 border border-white/5 p-2 rounded-2xl w-full md:w-auto">
            <Search className="text-zinc-600 ml-2" size={20} />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Szukaj agenta po nicku..." 
              className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full md:w-64"
            />
            <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-500 p-2 px-4 rounded-xl text-xs font-black uppercase transition-all">Szukaj</button>
          </div>
        </div>

        {/* SEARCH RESULTS */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-blue-500/5 border border-blue-500/20 rounded-[2.5rem] p-6 space-y-4">
              <h3 className="text-[10px] font-black uppercase text-blue-500 tracking-widest px-4">Wyniki wyszukiwania</h3>
              {searchResults.map(agent => (
                <div key={agent.id} className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-3xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {agent.avatar_url ? <img src={agent.avatar_url} className="w-full h-full object-cover" /> : <UserIcon size={20} className="text-zinc-600" />}
                    </div>
                    <span className="font-bold">{agent.username} <span className="text-[10px] text-zinc-600 ml-2">LVL {agent.level}</span></span>
                  </div>
                  <button onClick={() => sendRequest(agent.id)} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all">
                    <UserPlus size={14} /> Dodaj
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* PENDING REQUESTS */}
        {pendingRequests.length > 0 && (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase text-yellow-500 tracking-widest px-4">
              <ShieldCheck size={14} /> Oczekujące zaproszenia ({pendingRequests.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map(req => (
                <div key={req.id} className="bg-zinc-900/80 border border-yellow-500/20 p-4 rounded-[2rem] flex items-center justify-between">
                  <span className="font-bold text-sm">{req.sender.username}</span>
                  <div className="flex gap-2">
                    <button onClick={() => updateRequest(req.id, 'accepted')} className="p-2 bg-green-500/20 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all"><Check size={18} /></button>
                    <button onClick={() => updateRequest(req.id, 'declined')} className="p-2 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><X size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FRIENDS LIST */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 tracking-widest">
              <Users size={14} /> Twoi Znajomi ({friends.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map(friend => (
              <div key={friend.id} className="group bg-zinc-900/40 border border-white/5 p-6 rounded-[2.5rem] hover:bg-zinc-900/60 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/10 overflow-hidden shrink-0">
                    {friend.avatar_url ? <img src={friend.avatar_url} className="w-full h-full object-cover" /> : <UserIcon size={24} className="text-zinc-600" />}
                  </div>
                  <div>
                    <div className="font-black uppercase text-sm tracking-tight">{friend.username}</div>
                    <div className="text-[10px] font-bold text-zinc-600 uppercase">Agent LVL {friend.level}</div>
                  </div>
                </div>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-3 bg-white/5 text-zinc-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all" title="Pojedynek 1v1">
                    <Swords size={20} />
                  </button>
                  <button className="p-3 bg-white/5 text-zinc-400 rounded-2xl hover:bg-red-600 hover:text-white transition-all" title="Usuń">
                    <UserMinus size={20} />
                  </button>
                </div>
              </div>
            ))}
            {friends.length === 0 && !loading && (
              <div className="col-span-2 py-12 text-center bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/5">
                <p className="text-zinc-600 font-bold uppercase text-xs">Nie masz jeszcze znajomych. Czas kogoś zaprosić!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}