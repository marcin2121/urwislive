'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Search, Smartphone, Clock, X, Loader2, RefreshCw } from "lucide-react"
import { getAdminUsersDetails, getAdminUserCoupons } from '@/app/actions/get-admin-users'

export function ClientsTab() {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userCoupons, setUserCoupons] = useState<any[]>([]);
  const [loadingUserCoupons, setLoadingUserCoupons] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUsers = async () => {
    setIsRefreshing(true);
    const supabase = createClient();
    if (!supabase) {
      setIsRefreshing(false);
      return;
    }
    const [usersRes, extraUsersRes] = await Promise.all([
      supabase.from('loyalty_cards').select('id, full_name, phone_number, created_at').order('created_at', { ascending: false }),
      getAdminUsersDetails()
    ]);

    const loyaltyClients = usersRes?.data || [];
    const extraData = (extraUsersRes as any)?.success ? (extraUsersRes as any).extraData : {};
    const combinedClientsMap = new Map();
    
    Object.entries(extraData).forEach(([phone, extra]: [string, any]) => {
       combinedClientsMap.set(phone, {
          id: extra.auth_user_id, auth_user_id: extra.auth_user_id, phone_number: phone, full_name: extra.full_name, email: extra.email,
          created_at: extra.created_at, last_sign_in_at: extra.last_sign_in_at, has_pwa: extra.has_pwa || false
       });
    });

    loyaltyClients.forEach((c: any) => {
       const existing = combinedClientsMap.get(c.phone_number) || { auth_user_id: null, email: null, last_sign_in_at: null, has_pwa: false, full_name: null };
       combinedClientsMap.set(c.phone_number, { ...existing, ...c, auth_user_id: existing.auth_user_id, email: existing.email, last_sign_in_at: existing.last_sign_in_at, has_pwa: existing.has_pwa, full_name: c.full_name || existing.full_name });
    });

    setAllUsers(Array.from(combinedClientsMap.values()).sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchUsers();
    // 🟢 Realtime dla bazy klientów (np. gdy ktoś włączy PWA)
    const supabase = createClient();
    if (supabase) {
      const channel = supabase.channel('clients-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'push_subscriptions' }, fetchUsers)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'loyalty_cards' }, fetchUsers)
        .subscribe();

      return () => { supabase.removeChannel(channel); }
    }
  }, []);

  const handleSelectUser = async (user: any) => {
    setSelectedUser(user);
    setLoadingUserCoupons(true);
    try {
      const res = await getAdminUserCoupons(user.auth_user_id || user.id);
      if (res.success) setUserCoupons(res.coupons);
    } finally { setLoadingUserCoupons(false); }
  };

  const filteredClients = allUsers.filter((u: any) => !clientSearchQuery || (u.email || '').toLowerCase().includes(clientSearchQuery.toLowerCase()) || (u.phone_number || '').includes(clientSearchQuery) || (u.full_name || '').toLowerCase().includes(clientSearchQuery.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-green-600 flex items-center gap-3">
           <Users size={28} /> Nasi Klienci
        </h2>
        <button onClick={fetchUsers} className="p-3 bg-white border border-zinc-200 shadow-sm rounded-2xl text-zinc-500 hover:text-green-600 hover:bg-green-50 transition-all cursor-pointer flex items-center gap-2 font-bold text-sm">
           <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} /> Odśwież Listę
        </button>
      </div>

      <div className="bg-white rounded-3xl md:rounded-4xl border border-zinc-100 shadow-xl overflow-hidden">
        <div className="p-4 md:p-8 border-b border-zinc-50 bg-zinc-50/50 flex justify-between items-center">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input type="text" placeholder="Szukaj (imię/telefon/email)..." className="w-full pl-12 pr-6 py-4 rounded-2xl border-none bg-white shadow-sm font-bold outline-none focus:ring-2 ring-green-500 text-sm" value={clientSearchQuery} onChange={(e) => setClientSearchQuery(e.target.value)} />
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hidden md:block">Baza: {filteredClients.length} osób</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50/30 text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b border-zinc-50">
              <tr>
                <th className="p-4 md:p-6 whitespace-nowrap">Imię / Email</th>
                <th className="p-4 md:p-6 whitespace-nowrap">Telefon / PWA</th>
                <th className="p-4 md:p-6 whitespace-nowrap">Daty konta</th>
                <th className="p-4 md:p-6 whitespace-nowrap text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredClients.map((u: any) => (
                <tr key={u.id} className="hover:bg-green-50/30 transition-colors">
                  <td className="p-4 md:p-6"><span className="font-black text-zinc-900 uppercase italic text-sm md:text-base block">{u.full_name || 'Brak Imienia'}</span><span className="text-[10px] font-bold text-zinc-400">{u.email || 'brak emaila'}</span></td>
                  <td className="p-4 md:p-6"><span className="text-sm font-bold text-zinc-600 block">{u.phone_number || 'Brak telefonu'}</span>{u.has_pwa ? <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#0055ff] bg-blue-50 px-2 py-0.5 rounded-md mt-1"><Smartphone size={10}/> PWA / PUSH</span> : <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md mt-1">Brak App PWA</span>}</td>
                  <td className="p-4 md:p-6"><span className="text-[10px] font-bold text-zinc-500 uppercase block">Utworzono: {u.created_at ? new Date(u.created_at).toLocaleDateString() : '---'}</span><span className="text-[10px] font-bold text-[#0055ff] uppercase flex items-center gap-1 mt-1"><Clock size={12}/> {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : '---'}</span></td>
                  <td className="p-4 md:p-6 text-right"><button onClick={() => handleSelectUser(u)} className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl text-xs font-black uppercase transition-colors border-none cursor-pointer">Szczegóły</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[15000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto relative shadow-2xl">
              <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full border-none cursor-pointer"><X size={20}/></button>
              <h2 className="text-2xl font-black italic uppercase text-green-600 mb-2">{selectedUser.full_name || 'Użytkownik'}</h2>
              <p className="text-sm font-bold text-zinc-500 mb-6">{selectedUser.phone_number || 'Brak Telefonu'} | Zarejestrowany: {new Date(selectedUser.created_at).toLocaleDateString()}</p>
              <h3 className="text-sm font-black uppercase text-zinc-400 tracking-widest mb-4">Kupony Użytkownika</h3>
              {loadingUserCoupons ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-green-500" /></div> : userCoupons.length === 0 ? <div className="p-8 bg-zinc-50 rounded-2xl text-center text-zinc-400 font-bold">Użytkownik nie posiada kuponów.</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userCoupons.map((coupon: any) => (
                    <div key={coupon.id} className={`p-4 rounded-2xl border-2 flex flex-col gap-2 ${coupon.current_usage > 0 ? 'bg-zinc-50 border-zinc-200 opacity-70' : 'bg-white border-green-200 shadow-sm'}`}>
                      <div className="flex justify-between items-start"><span className="font-black uppercase text-sm leading-none mt-1">{coupon.title}</span>{coupon.current_usage > 0 ? <span className="text-[9px] bg-zinc-200 text-zinc-600 px-2 py-1 rounded-md font-bold uppercase">Wykorzystano</span> : <span className="text-[9px] bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold uppercase">Dostępny</span>}</div>
                      <div className="text-xl font-black tracking-widest bg-zinc-100 py-2 px-3 rounded-lg text-center mt-2">{coupon.code}</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}