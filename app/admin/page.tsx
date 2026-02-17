'use client'

import { useEffect, useState } from 'react'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, ShieldCheck, Search, Plus, Minus, CheckCircle, 
  Package, ShoppingBag, RefreshCw, LayoutDashboard, Gift, 
  Zap, Coins, Circle, Ticket, Loader2, Trash2
} from 'lucide-react'

type TabType = 'overview' | 'users' | 'orders' | 'codes';

export default function AdminDashboard() {
  const { profile, supabase, loading: authLoading } = useSupabaseAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  
  const [users, setUsers] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [promoCodes, setPromoCodes] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Formularz nowego kodu
  const [newCode, setNewCode] = useState({ code: '', reward_type: 'kuleczki', reward_value: 100, type: 'once_per_user', max_uses: 100 })

  const [stats, setStats] = useState({ totalUsers: 0, totalUrwiski: 0, totalKuleczki: 0, pendingOrders: 0 })

  useEffect(() => { setMounted(true) }, [])

  const fetchAllData = async () => {
    setLoadingData(true)
    const { data: u } = await supabase.from('profiles').select('*').order('exp', { ascending: false })
    const { data: o } = await supabase.from('reward_claims').select(`*, profiles:user_id (username), rewards:reward_id (name, image_url)`).order('created_at', { ascending: false })
    const { data: c } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false })
    
    if (u) setUsers(u)
    if (o) setOrders(o)
    if (c) setPromoCodes(c)
    setLoadingData(false)
  }

  useEffect(() => {
    if (users.length) {
      setStats({
        totalUsers: users.length,
        totalUrwiski: users.reduce((acc, u) => acc + (u.urwiski || 0), 0),
        totalKuleczki: users.reduce((acc, u) => acc + (u.kuleczki || 0), 0),
        pendingOrders: orders.filter(o => o.status === 'pending').length
      })
    }
  }, [users, orders])

  useEffect(() => {
    if (mounted && profile?.role === 'admin') fetchAllData()
    else if (mounted && !authLoading && profile?.role !== 'admin') router.push('/')
  }, [mounted, profile, authLoading])

  const adjustCurrency = async (userId: string, field: string, amount: number) => {
    const user = users.find(u => u.id === userId)
    if (!user) return
    const newValue = Math.max(0, (user[field] || 0) + amount)
    setUsers(users.map(u => u.id === userId ? { ...u, [field]: newValue } : u))
    await supabase.from('profiles').update({ [field]: newValue }).eq('id', userId)
  }

  const handleCreateCode = async () => {
    const { error } = await supabase.from('promo_codes').insert({ ...newCode, code: newCode.code.toUpperCase() })
    if (!error) {
      fetchAllData()
      setNewCode({ code: '', reward_type: 'kuleczki', reward_value: 100, type: 'once_per_user', max_uses: 100 })
    }
  }

  const handleDeleteCode = async (id: string) => {
    await supabase.from('promo_codes').delete().eq('id', id)
    fetchAllData()
  }

  if (!mounted || authLoading) return null

  return (
    <div className="min-h-screen bg-[#F4F7FE] pt-28 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-zinc-900 p-4 rounded-3xl text-white shadow-xl"><ShieldCheck size={32} /></div>
            <div>
              <h1 className="text-4xl font-black text-zinc-900 tracking-tight italic">Panel Sterowania</h1>
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Zarządzanie Skarbcem Urwisa</p>
            </div>
          </div>
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-zinc-100 overflow-x-auto">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={18}/>} label="Pulpit" />
            <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={18}/>} label="Urwisy" />
            <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingBag size={18}/>} label="Wydawanie" />
            <TabButton active={activeTab === 'codes'} onClick={() => setActiveTab('codes')} icon={<Ticket size={18}/>} label="Kody" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Agenci" value={stats.totalUsers} icon={<Users size={20}/>} color="bg-zinc-100" />
              <StatCard label="Suma Urwisków" value={stats.totalUrwiski} icon={<Circle size={20} className="fill-red-500 text-red-500"/>} color="bg-red-50" />
              <StatCard label="Suma Kuleczek" value={stats.totalKuleczki} icon={<Coins size={20} className="text-blue-500"/>} color="bg-blue-50" />
              <StatCard label="Do wydania" value={stats.pendingOrders} icon={<Package size={20} className="text-orange-500"/>} color="bg-orange-50" alert={stats.pendingOrders > 0} />
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[2.5rem] shadow-xl border border-zinc-100 overflow-hidden">
              <div className="p-6 border-b border-zinc-100"><input type="text" placeholder="Szukaj agenta..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full max-w-md px-6 py-3 rounded-xl bg-zinc-50 border border-zinc-100 outline-none" /></div>
              <table className="w-full text-left">
                <thead className="bg-zinc-50 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                  <tr><th className="px-8 py-4">Agent</th><th className="text-center">Urwiski</th><th className="text-center">Kuleczki</th><th className="text-center">EXP</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {users.filter(u => u.username?.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                    <tr key={u.id}>
                      <td className="px-8 py-4 font-bold">{u.username} <span className="block text-[10px] text-zinc-400 uppercase tracking-tighter">LVL {Math.floor((u.exp || 0) / 1000) + 1}</span></td>
                      <td className="py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => adjustCurrency(u.id, 'urwiski', -10)} className="p-1 bg-zinc-100 rounded hover:bg-red-100"><Minus size={12}/></button>
                          <span className="w-8 font-black text-red-600">{u.urwiski || 0}</span>
                          <button onClick={() => adjustCurrency(u.id, 'urwiski', 10)} className="p-1 bg-zinc-100 rounded hover:bg-green-100"><Plus size={12}/></button>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => adjustCurrency(u.id, 'kuleczki', -50)} className="p-1 bg-zinc-100 rounded hover:bg-red-100"><Minus size={12}/></button>
                          <span className="w-8 font-black text-blue-600">{u.kuleczki || 0}</span>
                          <button onClick={() => adjustCurrency(u.id, 'kuleczki', 50)} className="p-1 bg-zinc-100 rounded hover:bg-green-100"><Plus size={12}/></button>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => adjustCurrency(u.id, 'exp', -100)} className="p-1 bg-zinc-100 rounded hover:bg-red-100 text-[10px] px-2">-100</button>
                          <span className="w-12 font-black text-yellow-600">{u.exp || 0}</span>
                          <button onClick={() => adjustCurrency(u.id, 'exp', 100)} className="p-1 bg-zinc-100 rounded hover:bg-green-100 text-[10px] px-2">+100</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'codes' && (
            <motion.div key="codes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div><label className="text-[10px] font-black uppercase text-zinc-400 mb-2 block">Kod</label><input type="text" value={newCode.code} onChange={e => setNewCode({...newCode, code: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl font-bold uppercase" placeholder="NP. SUPERMOC"/></div>
                <div><label className="text-[10px] font-black uppercase text-zinc-400 mb-2 block">Waluta</label><select value={newCode.reward_type} onChange={e => setNewCode({...newCode, reward_type: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl font-bold"><option value="kuleczki">Kuleczki</option><option value="urwiski">Urwiski</option><option value="exp">EXP</option></select></div>
                <div><label className="text-[10px] font-black uppercase text-zinc-400 mb-2 block">Wartość</label><input type="number" value={newCode.reward_value} onChange={e => setNewCode({...newCode, reward_value: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl font-bold"/></div>
                <button onClick={handleCreateCode} className="bg-zinc-900 text-white py-3.5 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all">Stwórz Kod</button>
              </div>
              <div className="bg-white rounded-[2.5rem] border border-zinc-100 overflow-hidden shadow-xl">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                    <tr><th className="px-8 py-4">Kod</th><th>Typ</th><th>Nagroda</th><th>Użycia</th><th className="text-right px-8">Akcja</th></tr>
                  </thead>
                  <tbody>
                    {promoCodes.map(c => (
                      <tr key={c.id} className="border-t border-zinc-50">
                        <td className="px-8 py-4 font-black text-zinc-800">{c.code}</td>
                        <td className="text-[10px] font-bold uppercase text-zinc-400">{c.type === 'once_per_user' ? 'Dla każdego' : 'Limitowany'}</td>
                        <td className="font-bold">{c.reward_value} {c.reward_type}</td>
                        <td><span className="bg-zinc-100 px-2 py-1 rounded-lg text-xs font-black">{c.current_uses} / {c.max_uses || '∞'}</span></td>
                        <td className="text-right px-8"><button onClick={() => handleDeleteCode(c.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${active ? 'bg-zinc-900 text-white shadow-xl' : 'text-zinc-400 hover:bg-zinc-50'}`}>{icon} {label}</button>
  )
}

function StatCard({ label, value, icon, color, alert }: any) {
  return (
    <div className={`p-6 bg-white rounded-4xl border border-zinc-100 shadow-sm flex items-center gap-4 ${alert ? 'ring-2 ring-orange-200' : ''}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>{icon}</div>
      <div><p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{label}</p><p className="text-2xl font-black">{value}</p></div>
    </div>
  )
}