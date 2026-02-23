'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, X, Lock, Tag, LogOut, Loader2,
  Bell, Send, Wand2, Clock, Zap, Flame,
  Image as ImageIcon, Coffee, LayoutDashboard, History, ChevronRight,
  CreditCard, Search, UserPlus, Coins, Store, ChevronDown, ArrowDownCircle, ArrowUpCircle,
  Users, Filter, Calendar, Heart
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { PUSH_CATEGORIES, PushTopic } from '@/lib/push-config'

// --- SZABLONY PUSH ---
const QUICK_TEMPLATES = [
  { id: 'luz-na-sali', label: 'Dużo luzu', title: 'Mamy sporo miejsca! 🤸', message: 'Szukasz pomysłu na popołudnie? Zapraszamy na kawę!', topic: 'lecewkulki' as PushTopic, icon: Coffee, color: 'bg-orange-500' },
  { id: 'nowe-lego', label: 'Nowe LEGO', title: 'Dostawa LEGO! 🧩', message: 'Właśnie rozpakowaliśmy nowe zestawy na półkach. Sprawdź!', topic: 'urwis' as PushTopic, icon: Zap, color: 'bg-blue-600' }
]

export default function AdminDashboard() {
  const supabase = useMemo(() => createClient(), [])

  // --- STATE: AUTH & NAV ---
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<'stats' | 'promos' | 'push' | 'history' | 'loyalty'>('stats')

  // --- STATE: DATA ---
  const [promos, setPromos] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [scheduledPushes, setScheduledPushes] = useState<any[]>([])
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [totalSubscriberCount, setTotalSubscriberCount] = useState(0)
  const [totalSentPushes, setTotalSentPushes] = useState(0) 
  const [pushStats, setPushStats] = useState({ clicks: 0, closes: 0 })
  const [loading, setLoading] = useState(false)

  // --- STATE: LOYALTY ---
  const [allLoyaltyUsers, setAllLoyaltyUsers] = useState<any[]>([])
  const [showAllUsers, setShowAllUsers] = useState(false)
  const [loyaltySearchQuery, setLoyaltySearchQuery] = useState('')
  const [loyaltyPhone, setLoyaltyPhone] = useState('')
  const [loyaltyName, setLoyaltyName] = useState('')
  const [activeCard, setActiveCard] = useState<any>(null)
  const [cardSearchStatus, setCardSearchStatus] = useState<'idle' | 'searching' | 'found' | 'not_found'>('idle')
  const [transactionAmount, setTransactionAmount] = useState('')
  const [redeemAmount, setRedeemAmount] = useState('')

  // --- FORMS ---
  const [isAddingPromo, setIsAddingPromo] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isSendingPush, setIsSendingPush] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<PushTopic>('wszystkie')
  const [pushData, setPushData] = useState({ title: '', message: '', image_url: '', scheduled_for: '' })
  const [promoForm, setPromoForm] = useState({ 
    title: '', 
    old_price: '', 
    new_price: '', 
    discount: '', 
    category: 'Zabawki', 
    expires_at: '',
    image_url: '' 
  })
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  // --- GTAG TRACKING ---
  const trackAdminEvent = useCallback((name: string, params: object = {}) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', `admin_${name}`, params);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, hRes, sRes, aRes, allHistRes, loyaltyRes] = await Promise.all([
        supabase.from('promocje').select('*').order('created_at', { ascending: false }),
        supabase.from('push_history').select('*').eq('status', 'sent').order('created_at', { ascending: false }).limit(10),
        supabase.from('push_history').select('*').eq('status', 'scheduled').order('scheduled_for', { ascending: true }),
        supabase.from('push_analytics').select('action'),
        supabase.from('push_history').select('sent_to_count').eq('status', 'sent'),
        supabase.from('loyalty_cards').select('*').order('points', { ascending: false })
      ])

      setPromos(pRes?.data || [])
      setHistory(hRes?.data || [])
      setScheduledPushes(sRes?.data || [])
      setAllLoyaltyUsers(loyaltyRes?.data || [])
      
      if (aRes?.data) {
        setPushStats({
          clicks: aRes.data.filter((d: any) => d?.action === 'click').length || 0,
          closes: aRes.data.filter((d: any) => d?.action === 'close').length || 0
        })
      }

      if (allHistRes?.data) setTotalSentPushes(allHistRes.data.reduce((sum, item) => sum + (item.sent_to_count || 0), 0))

      let query = supabase.from('push_subscriptions').select('*', { count: 'exact', head: true })
      if (selectedTopic !== 'wszystkie') query = query.or(`topics.cs.{"${selectedTopic}"},topics.cs.{"wszystkie"}`)
      const { count } = await query
      setSubscriberCount(count || 0)

      const { count: totalCount } = await supabase.from('push_subscriptions').select('*', { count: 'exact', head: true })
      setTotalSubscriberCount(totalCount || 0)

    } catch (error) {
      toast.error('Błąd połączenia z bazą.');
    } finally {
      setLoading(false)
    }
  }, [supabase, selectedTopic])

  useEffect(() => { if (isAuthenticated) fetchData() }, [isAuthenticated, fetchData])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'URWIS2026') {
        setIsAuthenticated(true)
        trackAdminEvent('login_success')
    } else {
        toast.error('Hasło niepoprawne!')
        trackAdminEvent('login_failed')
    }
  }

  // --- IMAGE UPLOAD LOGIC ---
  async function handleFileUpload(file: File, folder: 'broadcasts' | 'promos') {
    setUploading(true)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    
    const { error } = await supabase.storage.from('push-images').upload(path, file)
    
    if (error) {
      toast.error('Błąd wgrywania pliku')
      setUploading(false)
      return null
    }

    const { data } = supabase.storage.from('push-images').getPublicUrl(path)
    setUploading(false)
    return data.publicUrl
  }

  // --- HANDLERS: PROMOS ---
  const onPromoImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const url = await handleFileUpload(file, 'promos');
    if (url) setPromoForm(prev => ({ ...prev, image_url: url }));
  }

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { 
        ...promoForm, 
        expires_at: promoForm.expires_at ? new Date(promoForm.expires_at).toISOString() : null, 
        is_active: true 
    }
    const { error } = await supabase.from('promocje').insert([payload])
    if (!error) {
      setIsAddingPromo(false);
      setIsCustomCategory(false);
      setPromoForm({ title: '', old_price: '', new_price: '', discount: '', category: 'Zabawki', expires_at: '', image_url: '' });
      toast.success('Okazja opublikowana!');
      trackAdminEvent('promo_add');
      fetchData();
    } else toast.error('Błąd zapisu promocji')
  }

  const handleDeletePromo = async (id: string) => {
    if (confirm('Usunąć ofertę z serwisu?')) {
      await supabase.from('promocje').delete().eq('id', id)
      toast.success('Usunięto ofertę')
      trackAdminEvent('promo_delete')
      fetchData()
    }
  }

  // --- HANDLERS: PUSH ---
  async function onPushImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const url = await handleFileUpload(file, 'broadcasts');
    if (url) setPushData(prev => ({ ...prev, image_url: url }));
  }

  async function handleSendPush(e: React.FormEvent) {
    e.preventDefault()
    if (subscriberCount === 0) return toast.error('Brak odbiorców!')
    setIsSendingPush(true)
    try {
      if (pushData.scheduled_for) {
        const { error } = await supabase.from('push_history').insert([{ ...pushData, topic: selectedTopic, status: 'scheduled', sent_to_count: subscriberCount }])
        if (error) throw error; toast.success('Zaplanowano wysyłkę!')
      } else {
        const res = await fetch('/api/push/send-all', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...pushData, topic: selectedTopic }) })
        if (!res.ok) throw new Error(); toast.success('Wysłano natychmiast!')
      }
      setPushData({ title: '', message: '', image_url: '', scheduled_for: '' }); fetchData()
    } catch (error) { toast.error('Błąd wysyłki Push') } finally { setIsSendingPush(false) }
  }

  // --- HANDLERS: LOYALTY ---
  const handleSearchCard = async (e: React.FormEvent) => {
    e.preventDefault(); if (!loyaltyPhone) return toast.error("Wpisz numer telefonu")
    setCardSearchStatus('searching')
    const { data } = await supabase.from('loyalty_cards').select('*').eq('phone_number', loyaltyPhone).maybeSingle()
    if (data) { 
      setActiveCard(data); setCardSearchStatus('found'); 
      trackAdminEvent('loyalty_search_found')
    } else { 
      setActiveCard(null); setCardSearchStatus('not_found');
    }
  }

  const handleAddPoints = async () => {
    if (!activeCard || !transactionAmount) return;
    const amount = Number(transactionAmount);
    if (amount < 10) return toast.error("Minimum 10 zł.");
    const pointsToAdd = Math.floor(amount / 10);
    const newPoints = (activeCard.points || 0) + pointsToAdd;
    const { error } = await supabase.from('loyalty_cards').update({ points: newPoints, last_visit_at: new Date().toISOString() }).eq('id', activeCard.id)
    if (!error) {
      await supabase.from('loyalty_history').insert([{ card_id: activeCard.id, source: 'sklep', points_change: pointsToAdd }]);
      toast.success(`Dodano ${pointsToAdd} punktów! 🪙`);
      setActiveCard({ ...activeCard, points: newPoints }); setTransactionAmount('');
      trackAdminEvent('loyalty_add_points', { amount: pointsToAdd })
    }
  }

  const handleRedeemPoints = async () => {
    if (!activeCard || !redeemAmount) return;
    const pts = Number(redeemAmount);
    if (pts > (activeCard.points || 0)) return toast.error("Brak punktów na zniżkę!");
    const newPoints = (activeCard.points || 0) - pts;
    const { error } = await supabase.from('loyalty_cards').update({ points: newPoints, last_visit_at: new Date().toISOString() }).eq('id', activeCard.id)
    if (!error) {
      await supabase.from('loyalty_history').insert([{ card_id: activeCard.id, source: 'sala', points_change: -pts }]);
      toast.success(`Zastosowano -${pts} zł zniżki! ☕`);
      setActiveCard({ ...activeCard, points: newPoints }); setRedeemAmount('');
      trackAdminEvent('loyalty_redeem_points', { amount: pts })
    }
  }

  const filteredLoyaltyUsers = allLoyaltyUsers.filter(u => 
    u.phone_number.includes(loyaltySearchQuery) || u.full_name?.toLowerCase().includes(loyaltySearchQuery.toLowerCase())
  );

  const resetSearch = () => { setCardSearchStatus('idle'); setActiveCard(null); setLoyaltyPhone(''); setLoyaltyName(''); }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-10000 flex items-center justify-center bg-zinc-950/90 backdrop-blur-xl p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-10 rounded-4xl shadow-2xl w-full max-w-md text-center border border-white/20">
          <div className="w-20 h-20 bg-[#0055ff] rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-blue-500/30"><Lock size={32} /></div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900 mb-8">Admin Urwis</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Hasło dostępu..." className="w-full p-5 rounded-2xl bg-zinc-100 border border-zinc-200 text-center font-black text-2xl focus:ring-2 ring-[#0055ff] outline-none transition-all" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
            <button className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#0055ff] transition-all shadow-lg border-none cursor-pointer">Zaloguj się</button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-10000 bg-zinc-50 flex text-zinc-900 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-zinc-200 flex flex-col h-full shrink-0 p-6 overflow-y-auto">
        <div className="mb-10 px-2">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Admin <span className="text-[#0055ff]">Urwis</span></h1>
          <div className="flex items-center gap-2 mt-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> System Aktywny
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'stats', label: 'Statystyki', icon: LayoutDashboard },
            { id: 'loyalty', label: 'Złote Urwisy', icon: Coins },
            { id: 'promos', label: 'Katalog Ofert', icon: Tag },
            { id: 'push', label: 'Kreator Push', icon: Bell },
            { id: 'history', label: 'Historia', icon: History }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all border-none outline-none cursor-pointer ${activeTab === id ? 'bg-blue-50 text-[#0055ff]' : 'hover:bg-zinc-100 text-zinc-500'}`}
            >
              <Icon size={20} aria-hidden="true" /> {label}
            </button>
          ))}
        </nav>

        <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-3 p-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all mt-auto border-none bg-transparent cursor-pointer">
          <LogOut size={20} /> Wyloguj się
        </button>
      </aside>

      <main className="flex-1 h-full overflow-y-auto p-10 bg-zinc-50/50 custom-scrollbar">
        <div className="max-w-6xl mx-auto pb-20">
          <AnimatePresence mode="wait">
            
            {/* --- DASHBOARD --- */}
            {activeTab === 'stats' && (
              <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900">Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-4xl shadow-sm border border-zinc-100">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Baza Odbiorców Push</p>
                    <p className="text-4xl font-black text-[#0055ff] tracking-tighter">{totalSubscriberCount}</p>
                  </div>
                  <div className="bg-white p-8 rounded-4xl shadow-sm border border-zinc-100">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Aktywne Portfele</p>
                    <p className="text-4xl font-black text-amber-500 tracking-tighter">{allLoyaltyUsers.length}</p>
                  </div>
                  <div className="bg-white p-8 rounded-4xl shadow-sm border border-zinc-100">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Łączna Wysyłka</p>
                    <p className="text-4xl font-black text-zinc-900 tracking-tighter">{totalSentPushes}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- LOYALTY --- */}
            {activeTab === 'loyalty' && (
              <motion.div key="loyalty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-amber-500 flex items-center gap-3">
                    <Coins size={32} /> Złote Urwisy
                  </h2>
                  <button onClick={() => setShowAllUsers(!showAllUsers)} className="px-6 py-3 bg-amber-100 text-amber-700 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-200 transition-all border-none cursor-pointer">
                    {showAllUsers ? 'Obsługa Klienta' : 'Wszyscy Klienci'}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {showAllUsers ? (
                    <motion.div key="all-list" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-4xl border border-zinc-100 shadow-xl overflow-hidden">
                      <div className="p-8 border-b border-zinc-50 bg-zinc-50/50 flex justify-between items-center">
                        <div className="relative w-full max-w-sm">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                          <input type="text" placeholder="Szukaj klienta..." className="w-full pl-12 pr-6 py-4 rounded-2xl border-none bg-white shadow-sm font-bold outline-none focus:ring-2 ring-amber-500" value={loyaltySearchQuery} onChange={(e) => setLoyaltySearchQuery(e.target.value)} />
                        </div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Baza: {filteredLoyaltyUsers.length} osób</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-zinc-50/30 text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b border-zinc-50">
                            <tr>
                              <th className="p-6">Imię i Nazwisko / Telefon</th>
                              <th className="p-6 text-center">Punkty</th>
                              <th className="p-6">Ostatnio u nas</th>
                              <th className="p-6 text-right">Akcja</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-50">
                            {filteredLoyaltyUsers.map((u) => (
                              <tr key={u.id} className="hover:bg-amber-50/30 transition-colors">
                                <td className="p-6">
                                  <div className="flex flex-col">
                                    <span className="font-black text-zinc-900 uppercase italic">{u.full_name || 'Urwis bez imienia'}</span>
                                    <span className="text-xs font-bold text-zinc-400">{u.phone_number}</span>
                                  </div>
                                </td>
                                <td className="p-6 text-center">
                                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl font-black italic">{u.points} <Coins size={14} /></div>
                                </td>
                                <td className="p-6 text-xs font-bold text-zinc-500 uppercase">
                                  {u.last_visit_at ? new Date(u.last_visit_at).toLocaleDateString() : '---'}
                                </td>
                                <td className="p-6 text-right">
                                  <button onClick={() => { setLoyaltyPhone(u.phone_number); setActiveCard(u); setCardSearchStatus('found'); setShowAllUsers(false); }} className="p-3 bg-zinc-900 text-white rounded-xl hover:bg-amber-500 transition-all border-none cursor-pointer"><ChevronRight size={18} /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-4xl shadow-sm border border-zinc-100">
                          <h3 className="text-xl font-black uppercase text-zinc-900 mb-6">Wyszukaj Portfel</h3>
                          <form onSubmit={handleSearchCard} className="space-y-4">
                            <input type="tel" placeholder="Numer telefonu..." className="w-full p-4 rounded-2xl bg-zinc-50 border-none font-bold text-zinc-900 outline-none focus:ring-2 ring-amber-500 text-center text-lg" value={loyaltyPhone} onChange={e => setLoyaltyPhone(e.target.value)} />
                            <button disabled={cardSearchStatus === 'searching'} className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase hover:bg-amber-500 transition-all border-none cursor-pointer">
                              {cardSearchStatus === 'searching' ? <Loader2 className="animate-spin mx-auto" /> : 'Szukaj Klienta'}
                            </button>
                          </form>
                          {cardSearchStatus === 'found' && <button onClick={resetSearch} className="w-full mt-4 py-3 text-zinc-400 font-bold uppercase text-[10px] tracking-widest bg-transparent border-none cursor-pointer">Zakończ obsługę</button>}
                        </div>
                      </div>

                      <div className="lg:col-span-2">
                        {cardSearchStatus === 'found' && activeCard ? (
                          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 rounded-4xl shadow-xl border border-zinc-100">
                             <div className="flex justify-between items-center mb-10 pb-8 border-b border-zinc-50">
                                <div>
                                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Aktywny Klient</p>
                                  <h2 className="text-4xl font-black italic uppercase text-zinc-900">{activeCard.full_name || 'Klient VIP'}</h2>
                                  <p className="text-zinc-500 font-bold tracking-widest mt-2">{activeCard.phone_number}</p>
                                </div>
                                <div className="text-right">
                                   <div className="text-6xl font-black text-amber-500 flex items-center justify-end gap-3">{activeCard.points || 0} <Coins size={44} /></div>
                                   <p className="text-xs font-bold text-zinc-400 mt-2 uppercase tracking-widest italic">Złotych Urwisów</p>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 bg-red-50 rounded-4xl border border-red-100 space-y-6">
                                   <div className="flex items-center gap-3 text-red-600 font-black uppercase italic tracking-tighter"><Store size={24} /> Sklep Urwis</div>
                                   <div className="space-y-4">
                                      <input type="number" placeholder="Kwota z paragonu (zł)" className="w-full p-4 rounded-xl border-none bg-white font-black text-xl text-center outline-none focus:ring-2 ring-red-400" value={transactionAmount} onChange={e => setTransactionAmount(e.target.value)} />
                                      <button onClick={handleAddPoints} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all border-none cursor-pointer shadow-lg shadow-red-500/20">Dodaj Punkty</button>
                                   </div>
                                </div>
                                <div className="p-8 bg-blue-50 rounded-4xl border border-blue-100 space-y-6">
                                   <div className="flex items-center gap-3 text-[#0055ff] font-black uppercase italic tracking-tighter"><Coffee size={24} /> Sala Zabaw</div>
                                   <div className="space-y-4">
                                      <input type="number" placeholder="Wartość zniżki (zł)" className="w-full p-4 rounded-xl border-none bg-white font-black text-xl text-center outline-none focus:ring-2 ring-blue-400" value={redeemAmount} onChange={e => setRedeemAmount(e.target.value)} />
                                      <button onClick={handleRedeemPoints} className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#0055ff] transition-all border-none cursor-pointer shadow-lg">Pobierz Punkty</button>
                                   </div>
                                </div>
                             </div>
                          </motion.div>
                        ) : (
                          <div className="h-full border-4 border-dashed border-zinc-200 rounded-4xl flex flex-col items-center justify-center text-zinc-300 p-10 text-center">
                            <Coins size={64} className="mb-4 opacity-20" />
                            <p className="font-black uppercase text-xs tracking-widest">Wyszukaj numer po lewej <br/> lub wybierz klienta z listy</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* --- PROMOS --- */}
            {activeTab === 'promos' && (
              <motion.div key="promos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900">Katalog Ofert</h2>
                  <button onClick={() => setIsAddingPromo(true)} className="px-6 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase text-xs flex items-center gap-2 hover:bg-[#BF2024] transition-all border-none cursor-pointer shadow-lg"><Plus size={18} /> Nowa Promocja</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {promos.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-4xl border border-zinc-100 shadow-sm flex flex-col justify-between group relative overflow-hidden">
                      {p.image_url && <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-100 opacity-20 -mr-6 -mt-6 rounded-full blur-2xl" />}
                      <div>
                        <span className={`px-3 py-1 text-[8px] font-black uppercase rounded-lg mb-4 inline-block ${p.category === 'LEGO' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-[#0055ff]'}`}>{p.category}</span>
                        <h3 className="text-xl font-black uppercase italic text-zinc-900 line-clamp-2 mb-4 leading-[0.95]">{p.title}</h3>
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-3xl font-black text-zinc-900">{p.new_price} zł</span>
                          <span className="text-sm text-zinc-400 line-through font-bold">{p.old_price} zł</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-zinc-50">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{p.is_active ? '✅ Widoczna' : '❌ Ukryta'}</span>
                        <button onClick={() => handleDeletePromo(p.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all border-none cursor-pointer"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* --- PUSHBroadcaster --- */}
            {activeTab === 'push' && (
              <motion.div key="push" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-2xl">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Broadcasting Center</h2>
                <section className="bg-white p-10 rounded-4xl shadow-xl border border-zinc-100 space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Kto ma otrzymać wiadomość?</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {PUSH_CATEGORIES.map(cat => (
                        <button key={cat.id} type="button" onClick={() => setSelectedTopic(cat.id)} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 border-solid outline-none cursor-pointer ${selectedTopic === cat.id ? 'bg-[#0055ff] border-[#0055ff] text-white shadow-md' : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200'}`}>{cat.label}</button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSendPush} className="space-y-4">
                    <div className="space-y-4">
                        <div className="relative group">
                            <input required placeholder="Tytuł powiadomienia..." className="w-full p-5 rounded-2xl bg-zinc-50 border-none font-bold text-zinc-900 outline-none focus:ring-2 ring-[#0055ff] transition-all" value={pushData.title} onChange={e => setPushData(prev => ({ ...prev, title: e.target.value }))} />
                            <button type="button" onClick={() => setPushData(p => ({ ...p, title: "Pst! Mamy coś nowego! 🧩" }))} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-[#0055ff] hover:scale-110 transition-transform"><Wand2 size={20} /></button>
                        </div>
                        <textarea required placeholder="Treść wiadomości..." rows={4} className="w-full p-5 rounded-2xl bg-zinc-50 border-none font-bold text-zinc-900 outline-none focus:ring-2 ring-[#0055ff] text-sm resize-none" value={pushData.message} onChange={e => setPushData(prev => ({ ...prev, message: e.target.value }))} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="datetime-local" className="bg-zinc-50 rounded-2xl p-4 border-none font-bold text-xs text-zinc-900" value={pushData.scheduled_for} onChange={e => setPushData(prev => ({ ...prev, scheduled_for: e.target.value }))} />
                      <label className="bg-zinc-50 p-4 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-zinc-100 transition-all border border-dashed border-zinc-200">
                          {uploading ? <Loader2 className="animate-spin text-[#0055ff]" /> : <span className="text-[10px] font-black uppercase text-zinc-400">{pushData.image_url ? '✅ Zdjęcie gotowe' : 'Dodaj zdjęcie'}</span>}
                          <input type="file" className="hidden" onChange={onPushImageUpload} accept="image/*" />
                      </label>
                    </div>

                    <button disabled={isSendingPush || subscriberCount === 0} className="w-full py-6 bg-[#0055ff] text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 active:scale-95 transition-all border-none outline-none disabled:opacity-50 cursor-pointer mt-4 italic">
                      {isSendingPush ? <Loader2 className="animate-spin mx-auto" /> : pushData.scheduled_for ? 'Zaplanuj w kolejce' : `Wyślij do ${subscriberCount} osób teraz 🚀`}
                    </button>
                  </form>
                </section>
              </motion.div>
            )}

            {/* --- HISTORY --- */}
            {activeTab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                <section>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3 text-[#0055ff]"><Clock size={32} /> Zaplanowane</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {scheduledPushes.map(s => (
                        <div key={s.id} className="bg-white p-6 rounded-4xl border border-zinc-100 shadow-sm flex justify-between items-center group">
                        <div>
                            <p className="text-[11px] font-black text-[#0055ff] uppercase tracking-widest mb-1">{new Date(s.scheduled_for).toLocaleString()}</p>
                            <h4 className="text-lg font-black italic uppercase text-zinc-900 line-clamp-1">{s.title}</h4>
                        </div>
                        <button onClick={() => { supabase.from('push_history').delete().eq('id', s.id); fetchData(); }} className="p-4 text-red-300 hover:text-red-500 border-none bg-transparent cursor-pointer"><Trash2 size={24} /></button>
                        </div>
                    ))}
                    </div>
                </section>

                <section>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3 text-zinc-400"><History size={32} /> Ostatnie Wysłane</h2>
                  <div className="space-y-4">
                    {history.map(h => (
                      <div key={h.id} className="bg-white/60 p-6 rounded-3xl border border-zinc-100 flex items-center justify-between">
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-zinc-400 uppercase">{new Date(h.created_at).toLocaleString()}</span>
                            <span className="text-lg font-black uppercase italic text-zinc-700">{h.title}</span>
                         </div>
                         <div className="text-right"><p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Wysłano do</p><p className="font-black text-xl text-zinc-900">{h.sent_to_count} osób</p></div>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* --- MODAL: NOWA PROMOCJA (Z WGRYWANIEM ZDJĘCIA) --- */}
      <AnimatePresence>
        {isAddingPromo && (
          <div className="fixed inset-0 z-10000 flex items-center justify-center p-6 bg-zinc-950/60 backdrop-blur-md">
            <motion.form initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} onSubmit={handleAddPromo} className="bg-white rounded-4xl p-12 max-w-2xl w-full shadow-2xl relative text-zinc-900 border border-zinc-100 overflow-y-auto max-h-[90vh]">
              <button type="button" onClick={() => setIsAddingPromo(false)} className="absolute top-10 right-10 text-zinc-400 hover:text-zinc-900 border-none bg-transparent outline-none cursor-pointer p-2"><X size={32} /></button>
              
              <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-10 flex items-center gap-3 text-[#BF2024]"><Flame size={32} /> Nowa Okazja</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Nazwa */}
                <input required placeholder="Nazwa produktu..." className="md:col-span-2 w-full p-5 rounded-2xl bg-zinc-50 border-none font-bold text-zinc-900 outline-none focus:ring-2 ring-red-500" value={promoForm.title} onChange={e => setPromoForm(prev => ({ ...prev, title: e.target.value }))} />
                
                {/* Wgrywanie zdjęcia produktu */}
                <div className="md:col-span-2">
                    <label className="flex items-center justify-center w-full h-32 transition bg-zinc-50 border-2 border-zinc-200 border-dashed rounded-2xl cursor-pointer hover:border-red-400">
                        {uploading ? (
                            <Loader2 className="animate-spin text-red-500" />
                        ) : promoForm.image_url ? (
                            <div className="flex items-center gap-4">
                                <img src={promoForm.image_url} alt="Podgląd" className="w-20 h-20 object-cover rounded-xl shadow-md" />
                                <span className="text-xs font-black uppercase text-green-600 tracking-widest">✅ Zdjęcie Wybrane</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <ImageIcon className="text-zinc-300" />
                                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Kliknij by dodać zdjęcie produktu</span>
                            </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={onPromoImageUpload} />
                    </label>
                </div>

                <div className="md:col-span-2">
  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2 mb-1 block">
    Kategoria produktu
  </label>
  
  {!isCustomCategory ? (
    /* --- WIDOK: WYBÓR Z LISTY --- */
    <div className="relative">
      <select 
        className="w-full p-5 rounded-2xl bg-zinc-50 font-black border-none outline-none text-zinc-900 cursor-pointer appearance-none" 
        value={promoForm.category} 
        onChange={e => {
          if (e.target.value === "INNA") {
            setIsCustomCategory(true);
            setPromoForm(prev => ({ ...prev, category: '' })); // Czyścimy pod własny wpis
          } else {
            setPromoForm(prev => ({ ...prev, category: e.target.value }));
          }
        }}
      >
        <option value="Zabawki">Zabawki</option>
        <option value="LEGO">LEGO</option>
        <option value="Szkoła">Szkoła</option>
        <option value="Sala Zabaw">Sala Zabaw</option>
        <option value="INNA" className="text-blue-600 font-bold">➕ Własna / Inna...</option>
      </select>
      {/* Ikona strzałki dla selecta */}
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
        <ChevronDown size={18} />
      </div>
    </div>
  ) : (
    /* --- WIDOK: WPISYWANIE WŁASNEJ --- */
    <motion.div 
      initial={{ opacity: 0, x: -10 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="relative"
    >
      <input 
        autoFocus
        placeholder="Wpisz nazwę nowej kategorii..." 
        className="w-full p-5 rounded-2xl bg-white border-2 border-blue-500 font-black outline-none text-zinc-900 shadow-[0_0_15px_rgba(0,85,255,0.1)]"
        value={promoForm.category}
        onChange={e => setPromoForm(prev => ({ ...prev, category: e.target.value }))}
      />
      <button 
        type="button"
        onClick={() => {
          setIsCustomCategory(false);
          setPromoForm(prev => ({ ...prev, category: 'Zabawki' }));
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-xl transition-all"
        title="Wróć do listy"
      >
        <X size={16} strokeWidth={3} />
      </button>
    </motion.div>
  )}
</div>
                <input placeholder="Rabat (np. -20%)" className="w-full p-5 rounded-2xl bg-zinc-50 border-none outline-none font-black text-zinc-900 focus:ring-2 ring-red-500" value={promoForm.discount} onChange={e => setPromoForm(prev => ({ ...prev, discount: e.target.value }))} />
                
                <div className="space-y-1.5"><label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Stara Cena (zł)</label>
                  <input required placeholder="0.00" className="w-full p-4 rounded-2xl bg-zinc-50 border-none font-black text-zinc-900 outline-none" value={promoForm.old_price} onChange={e => setPromoForm(prev => ({ ...prev, old_price: e.target.value }))} />
                </div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Cena Promocyjna (zł)</label>
                  <input required placeholder="0.00" className="w-full p-4 rounded-2xl bg-zinc-50 border-none font-black text-zinc-900 outline-none focus:ring-2 ring-green-500" value={promoForm.new_price} onChange={e => setPromoForm(prev => ({ ...prev, new_price: e.target.value }))} />
                </div>
              </div>
              <button type="submit" disabled={uploading} className="w-full py-6 bg-zinc-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-600 transition-all border-none outline-none active:scale-95 cursor-pointer italic disabled:opacity-50">
                  {uploading ? 'Wgrywanie...' : 'Opublikuj Teraz 🔥'}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}