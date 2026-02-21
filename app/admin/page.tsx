'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, X, Lock, Tag, LogOut, Loader2,
  Bell, Send, Wand2, Clock, Zap, Flame,
  Image as ImageIcon, Coffee, LayoutDashboard, History, ChevronRight,
  CreditCard, Search, UserPlus, Coins, Store, ArrowDownCircle, ArrowUpCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { PUSH_CATEGORIES, PushTopic } from '@/lib/push-config'

// --- SZABLONY ---
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
  const [loyaltyPhone, setLoyaltyPhone] = useState('')
  const [loyaltyName, setLoyaltyName] = useState('')
  const [activeCard, setActiveCard] = useState<any>(null)
  const [cardSearchStatus, setCardSearchStatus] = useState<'idle' | 'searching' | 'found' | 'not_found'>('idle')
  const [transactionAmount, setTransactionAmount] = useState('') // kwota w sklepie
  const [redeemAmount, setRedeemAmount] = useState('') // kwota zniżki

  // --- FORMS ---
  const [isAddingPromo, setIsAddingPromo] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isSendingPush, setIsSendingPush] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<PushTopic>('wszystkie')
  const [pushData, setPushData] = useState({ title: '', message: '', image_url: '', scheduled_for: '' })
  const [promoForm, setPromoForm] = useState({ title: '', old_price: '', new_price: '', discount: '', category: 'Zabawki', expires_at: '' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, hRes, sRes, aRes, allHistRes] = await Promise.all([
        supabase.from('promocje').select('*').order('created_at', { ascending: false }),
        supabase.from('push_history').select('*').eq('status', 'sent').order('created_at', { ascending: false }).limit(10),
        supabase.from('push_history').select('*').eq('status', 'scheduled').order('scheduled_for', { ascending: true }),
        supabase.from('push_analytics').select('action'),
        supabase.from('push_history').select('sent_to_count').eq('status', 'sent')
      ])

      setPromos(pRes?.data || [])
      setHistory(hRes?.data || [])
      setScheduledPushes(sRes?.data || [])
      
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
      toast.error('Błąd pobierania danych z bazy.')
    } finally {
      setLoading(false)
    }
  }, [supabase, selectedTopic])

  useEffect(() => { if (isAuthenticated) fetchData() }, [isAuthenticated, fetchData])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'URWIS2026') setIsAuthenticated(true)
    else toast.error('Hasło niepoprawne!')
  }

  const handleDeletePromo = async (id: string) => {
    if (confirm('Usunąć ofertę?')) { await supabase.from('promocje').delete().eq('id', id); toast.success('Usunięto'); fetchData() }
  }

  const handleDeleteScheduled = async (id: string) => {
    await supabase.from('push_history').delete().eq('id', id); toast.success('Usunięto'); fetchData()
  }

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...promoForm, expires_at: promoForm.expires_at ? new Date(promoForm.expires_at).toISOString() : null, is_active: true }
    const { error } = await supabase.from('promocje').insert([payload])
    if (!error) {
      setIsAddingPromo(false); setPromoForm({ title: '', old_price: '', new_price: '', discount: '', category: 'Zabawki', expires_at: '' }); toast.success('Promocja dodana!'); fetchData()
    } else toast.error('Błąd dodawania')
  }

  const setQuickExpiry = (hours: number) => {
    const d = new Date(); d.setHours(d.getHours() + hours)
    setPromoForm(prev => ({ ...prev, expires_at: d.toISOString().slice(0, 16) })); toast.success(`Wygaśnie za ${hours}h`)
  }

  const applyTemplate = (t: typeof QUICK_TEMPLATES[0]) => {
    setPushData(prev => ({ ...prev, title: t.title, message: t.message })); setSelectedTopic(t.topic); toast.success(`Wczytano: ${t.label}`)
  }

  const generateUrwisTalk = () => {
    const phrases = ['Pst! Zobacz nowości!', 'Urwis melduje okazję!', 'Hej! Wpadniesz sprawdzić?', 'Hop! Mamy coś ekstra!']
    setPushData(prev => ({ ...prev, title: phrases[Math.floor(Math.random() * phrases.length)] })); toast.success('🪄 Zrobione!')
  }

  async function onImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return; setUploading(true)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `broadcasts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('push-images').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('push-images').getPublicUrl(path)
      setPushData(prev => ({ ...prev, image_url: data.publicUrl })); toast.success('Zdjęcie wgrane!')
    } else toast.error('Błąd wgrywania')
    setUploading(false)
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
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`); toast.success('Wysłano!')
      }
      setPushData({ title: '', message: '', image_url: '', scheduled_for: '' }); fetchData()
    } catch (error) { toast.error('Błąd wysyłki') } finally { setIsSendingPush(false) }
  }

  // --- LOYALTY ---
  const handleSearchCard = async (e: React.FormEvent) => {
    e.preventDefault(); if (!loyaltyPhone) return toast.error("Wpisz numer telefonu")
    setCardSearchStatus('searching')
    const { data } = await supabase.from('loyalty_cards').select('*').eq('phone_number', loyaltyPhone).maybeSingle()
    if (data) { 
      setActiveCard(data); 
      setCardSearchStatus('found'); 
      toast.success(`Znaleziono portfel: ${data.full_name}`) 
    } 
    else { setActiveCard(null); setCardSearchStatus('not_found'); toast.info("Nie znaleziono portfela.") }
  }

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault(); if (!loyaltyName || !loyaltyPhone) return toast.error("Wypełnij dane")
    const { data, error } = await supabase.from('loyalty_cards').insert([{ phone_number: loyaltyPhone, full_name: loyaltyName, points: 0 }]).select().single()
    if (!error && data) { setActiveCard(data); setCardSearchStatus('found'); toast.success("Portfel założony!") } 
    else toast.error("Błąd zapisu.")
  }

  // Funkcja naliczania Urwisów (Sklep)
  const handleAddPoints = async () => {
    if (!activeCard || !transactionAmount) return;
    const amount = Number(transactionAmount);
    if (isNaN(amount) || amount < 10) return toast.error("Kwota musi wynosić minimum 10 zł.");

    const pointsToAdd = Math.floor(amount / 10);
    const currentPoints = activeCard.points !== undefined ? activeCard.points : activeCard.stamps_count;
    const newPoints = currentPoints + pointsToAdd;

    const { error } = await supabase.from('loyalty_cards').update({ points: newPoints, last_visit_at: new Date().toISOString() }).eq('id', activeCard.id)
    
    if (error) return toast.error("Błąd zapisu");
    
    await supabase.from('loyalty_history').insert([{ card_id: activeCard.id, source: 'sklep' }]);
    
    toast.success(`Dodano ${pointsToAdd} Złotych Urwisów za zakupy! 🪙`);
    setActiveCard({ ...activeCard, points: newPoints });
    setTransactionAmount('');
  }

  // Funkcja pobierania Urwisów (Zniżka Sala)
  const handleRedeemPoints = async () => {
    if (!activeCard || !redeemAmount) return;
    const pointsToRedeem = Number(redeemAmount);
    const currentPoints = activeCard.points !== undefined ? activeCard.points : activeCard.stamps_count;

    if (isNaN(pointsToRedeem) || pointsToRedeem <= 0) return toast.error("Podaj prawidłową wartość zniżki.");
    if (pointsToRedeem > currentPoints) return toast.error("Klient nie ma wystarczającej liczby punktów!");

    const newPoints = currentPoints - pointsToRedeem;

    const { error } = await supabase.from('loyalty_cards').update({ points: newPoints, last_visit_at: new Date().toISOString() }).eq('id', activeCard.id)
    
    if (error) return toast.error("Błąd zapisu");
    
    await supabase.from('loyalty_history').insert([{ card_id: activeCard.id, source: 'sala' }]);
    
    toast.success(`Zastosowano zniżkę ${pointsToRedeem} zł! ☕`);
    setActiveCard({ ...activeCard, points: newPoints });
    setRedeemAmount('');
  }

  const resetSearch = () => { setCardSearchStatus('idle'); setActiveCard(null); setLoyaltyPhone(''); setLoyaltyName(''); setTransactionAmount(''); setRedeemAmount(''); }

  const currentPoints = activeCard ? (activeCard.points !== undefined ? activeCard.points : activeCard.stamps_count) : 0;

  // --- UI ---
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-100/95 backdrop-blur-sm text-black">
        <div className="bg-white p-10 rounded-4xl shadow-2xl border border-gray-200 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl"><Lock size={32} /></div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900 mb-8">Admin Urwis</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Wpisz hasło..." className="w-full p-5 rounded-2xl bg-gray-100 border border-gray-200 text-center font-black text-black text-xl focus:ring-2 ring-blue-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
            <button className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg outline-none border-none cursor-pointer">Zaloguj się</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-50 flex text-gray-900 overflow-hidden">
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 p-6 overflow-y-auto">
        <div className="mb-10 px-2">
          <h1 className="text-2xl font-black italic tracking-tighter">ADMIN <span className="text-blue-600">URWIS</span></h1>
          <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> System Aktywny
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {([
            { id: 'stats', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'loyalty', label: 'Złote Urwisy', icon: Coins },
            { id: 'promos', label: 'Promocje', icon: Tag },
            { id: 'push', label: 'Kreator Push', icon: Bell },
            { id: 'history', label: 'Historia i Kolejka', icon: History }
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all outline-none border-none cursor-pointer ${activeTab === id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <Icon size={20} /> {label}
            </button>
          ))}
        </nav>

        <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-3 p-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all mt-auto border-none bg-transparent outline-none cursor-pointer">
          <LogOut size={20} /> Wyloguj się
        </button>
      </aside>

      <main className="flex-1 h-full overflow-y-auto p-10">
        <div className="max-w-6xl mx-auto">
          
          {activeTab === 'stats' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Przegląd Systemu</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-4xl shadow-sm border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Baza Odbiorców</p>
                  <p className="text-4xl font-black text-blue-600">{totalSubscriberCount}</p>
                </div>
                <div className="bg-white p-8 rounded-4xl shadow-sm border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Wysłane Powiadomienia</p>
                  <p className="text-4xl font-black text-gray-900">{totalSentPushes}</p>
                </div>
                <div className="bg-white p-8 rounded-4xl shadow-sm border border-gray-100 relative overflow-hidden">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Skuteczność CTR</p>
                  <p className="text-4xl font-black text-orange-500 relative z-10">
                    {totalSentPushes > 0 ? Math.round((pushStats.clicks / totalSentPushes) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* WIDOK: LOJALNOŚĆ (ZŁOTE URWISY) */}
          {activeTab === 'loyalty' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-amber-500 flex items-center gap-3">
                  <Coins size={32} /> Centralny Portfel Urwisa
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Wyszukiwarka */}
                <div className="lg:col-span-1 space-y-6">
                  {cardSearchStatus === 'idle' || cardSearchStatus === 'searching' ? (
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-6"><Search size={24} /></div>
                      <h3 className="text-xl font-black uppercase text-gray-900 mb-4">Wyszukaj klienta</h3>
                      <form onSubmit={handleSearchCard} className="space-y-4">
                        <input type="tel" placeholder="Numer telefonu..." className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-black outline-none focus:ring-2 ring-amber-500 text-center text-lg" value={loyaltyPhone} onChange={e => setLoyaltyPhone(e.target.value)} />
                        <button disabled={cardSearchStatus === 'searching'} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-amber-500 transition-all cursor-pointer">
                          {cardSearchStatus === 'searching' ? <Loader2 className="animate-spin mx-auto" /> : 'Szukaj'}
                        </button>
                      </form>
                    </div>
                  ) : cardSearchStatus === 'not_found' ? (
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                      <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6"><UserPlus size={24} /></div>
                      <h3 className="text-xl font-black uppercase text-gray-900 mb-2">Nowy Portfel</h3>
                      <p className="text-xs font-bold text-gray-400 mb-6">Numer {loyaltyPhone} nie istnieje. Załóż profil:</p>
                      <form onSubmit={handleCreateCard} className="space-y-4">
                        <input type="text" placeholder="Imię klienta (np. Jan K.)" className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-black outline-none focus:ring-2 ring-amber-500 text-center" value={loyaltyName} onChange={e => setLoyaltyName(e.target.value)} autoFocus />
                        <button className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg cursor-pointer">Załóż portfel</button>
                        <button type="button" onClick={resetSearch} className="w-full py-3 text-gray-400 font-bold uppercase text-xs tracking-widest hover:text-gray-900 bg-transparent border-none cursor-pointer">Wróć</button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Zarządzanie</h3>
                      <button onClick={resetSearch} className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase text-xs hover:bg-gray-200 transition-all cursor-pointer">Zakończ obsługę</button>
                    </div>
                  )}
                </div>

                {/* Obsługa znalezionej karty */}
                <div className="lg:col-span-2">
                  {cardSearchStatus === 'found' && activeCard ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                      
                      {/* Wizytówka */}
                      <div className="bg-zinc-900 rounded-[3.5rem] p-10 shadow-xl relative overflow-hidden text-white flex items-center justify-between">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />
                        <div className="relative z-10">
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Klient</p>
                          <h2 className="text-3xl font-black italic uppercase text-white">{activeCard.full_name}</h2>
                          <p className="text-amber-500 font-bold tracking-widest mt-1">{activeCard.phone_number}</p>
                        </div>
                        <div className="relative z-10 text-right">
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Aktualne Saldo</p>
                          <div className="text-5xl font-black text-amber-400 flex items-center justify-end gap-3">
                             {currentPoints} <Coins size={36} />
                          </div>
                          <p className="text-xs font-bold text-green-400 mt-2">= {currentPoints} zł zniżki</p>
                        </div>
                      </div>

                      {/* Moduły Transakcyjne */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* SKLEP (Zarabianie) */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-red-100 shadow-sm">
                          <div className="flex items-center gap-3 text-red-600 mb-6">
                             <Store size={24} /> <h3 className="font-black uppercase tracking-tighter text-xl">Sklep Urwis</h3>
                          </div>
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-4">Nalicz punkty za zakupy (10 zł = 1 pkt)</p>
                          
                          <div className="space-y-4">
                            <div className="relative">
                              <input 
                                type="number" placeholder="Wpisz kwotę paragonu (zł)" 
                                className="w-full p-4 rounded-xl bg-gray-50 border-none font-bold text-black text-center focus:ring-2 ring-red-500 outline-none pr-12"
                                value={transactionAmount} onChange={e => setTransactionAmount(e.target.value)}
                              />
                              <span className="absolute right-4 top-4 font-bold text-gray-400">zł</span>
                            </div>
                            
                            {transactionAmount && Number(transactionAmount) >= 10 && (
                              <div className="text-center text-sm font-bold text-green-600 bg-green-50 py-2 rounded-lg">
                                Klient otrzyma: +{Math.floor(Number(transactionAmount) / 10)} Złotych Urwisów
                              </div>
                            )}

                            <button onClick={handleAddPoints} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border-none cursor-pointer">
                              <ArrowUpCircle size={18} /> Dodaj Urwisy
                            </button>
                          </div>
                        </div>

                        {/* SALA ZABAW (Wydawanie) */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-sm">
                          <div className="flex items-center gap-3 text-blue-600 mb-6">
                             <Coffee size={24} /> <h3 className="font-black uppercase tracking-tighter text-xl">Lecę w Kulki</h3>
                          </div>
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-4">Pobierz punkty (1 pkt = 1 zł zniżki)</p>
                          
                          <div className="space-y-4">
                            <div className="relative">
                              <input 
                                type="number" placeholder="Ile zł zniżki?" 
                                className="w-full p-4 rounded-xl bg-gray-50 border-none font-bold text-black text-center focus:ring-2 ring-blue-500 outline-none pr-12"
                                value={redeemAmount} onChange={e => setRedeemAmount(e.target.value)}
                              />
                              <span className="absolute right-4 top-4 font-bold text-gray-400">zł</span>
                            </div>

                            <button onClick={handleRedeemPoints} className="w-full py-4 bg-zinc-900 hover:bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border-none cursor-pointer mt-auto">
                              <ArrowDownCircle size={18} /> Udziel zniżki
                            </button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full border-4 border-dashed border-gray-200 rounded-[3.5rem] flex flex-col items-center justify-center text-gray-400 p-10 text-center">
                      <Coins size={64} className="mb-4 opacity-30" />
                      <h3 className="text-xl font-black uppercase tracking-widest text-gray-500 mb-2">Brak aktywnego konta</h3>
                      <p className="text-sm">Wyszukaj numer telefonu po lewej stronie, aby zarządzać Złotymi Urwisami.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* POZOSTAŁE ZAKŁADKI (Promocje, Push, Historia) - Zwijam dla czytelności, logika bez zmian */}
          {activeTab === 'promos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Katalog Ofert</h2>
                <button onClick={() => setIsAddingPromo(true)} className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg border-none outline-none cursor-pointer"><Plus size={18} /> Nowa Promocja</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {promos?.map(p => (
                  <div key={p.id} className={`bg-white p-6 rounded-4xl border border-gray-100 shadow-sm flex justify-between items-center group ${!p.is_active && 'opacity-50'}`}>
                    <div>
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[8px] font-black uppercase rounded-lg mb-2 inline-block">{p.category}</span>
                      <h3 className="text-xl font-black italic uppercase text-gray-900 line-clamp-1">{p.title}</h3>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-blue-600">{p.new_price} zł</span>
                        <span className="text-xs text-gray-400 line-through font-bold">{p.old_price} zł</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeletePromo(p.id)} className="p-4 bg-red-50 text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all border-none hover:bg-red-600 hover:text-white outline-none cursor-pointer"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'push' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-8">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Wysyłka Push</h2>
                <section className="bg-white p-8 rounded-4xl shadow-xl border border-gray-100 space-y-6">
                  <form onSubmit={handleSendPush} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-gray-400 ml-4">Do kogo wysyłamy?</label>
                      <div className="grid grid-cols-1 gap-2">
                        {PUSH_CATEGORIES.map(cat => (
                          <button key={cat.id} type="button" onClick={() => setSelectedTopic(cat.id)} className={`py-4 rounded-xl text-xs font-black uppercase transition-all border-2 border-solid outline-none cursor-pointer ${selectedTopic === cat.id ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}>{cat.label}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <input required placeholder="Tytuł..." className="w-full p-5 rounded-2xl bg-gray-50 border-none font-bold text-black outline-none focus:ring-2 ring-blue-500" value={pushData.title} onChange={e => setPushData(prev => ({ ...prev, title: e.target.value }))} />
                      <textarea required placeholder="Treść..." rows={3} className="w-full p-5 rounded-2xl bg-gray-50 border-none font-bold text-black outline-none focus:ring-2 ring-blue-500 text-sm" value={pushData.message} onChange={e => setPushData(prev => ({ ...prev, message: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="datetime-local" className="bg-gray-50 rounded-2xl p-4 border-none font-bold text-[10px] outline-none text-black cursor-pointer" value={pushData.scheduled_for} onChange={e => setPushData(prev => ({ ...prev, scheduled_for: e.target.value }))} />
                      <label className="bg-gray-50 p-4 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all">
                        {uploading ? <Loader2 className="animate-spin text-blue-600" /> : <span className="text-[10px] font-black uppercase text-gray-400">Wgraj zdjęcie</span>}
                        <input type="file" className="hidden" onChange={onImageUpload} accept="image/*" />
                      </label>
                    </div>
                    <button disabled={isSendingPush || subscriberCount === 0} className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 active:scale-95 transition-all border-none outline-none disabled:opacity-50 cursor-pointer">
                      {isSendingPush ? <Loader2 className="animate-spin mx-auto" /> : pushData.scheduled_for ? 'Zaplanuj wysyłkę' : `Wyślij do ${subscriberCount} osób`}
                    </button>
                  </form>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-10">
              <section>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3 text-blue-600"><Clock size={32} /> Zaplanowane Psoty</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {scheduledPushes?.map(s => (
                    <div key={s.id} className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm flex justify-between items-center">
                      <div>
                        <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-1">{s.scheduled_for ? new Date(s.scheduled_for).toLocaleString('pl-PL') : ''}</p>
                        <h4 className="text-lg font-black italic uppercase text-gray-900 line-clamp-1">{s.title}</h4>
                      </div>
                      <button onClick={() => handleDeleteScheduled(s.id)} className="p-4 text-red-400 hover:text-red-600 border-none bg-transparent transition-colors cursor-pointer outline-none"><Trash2 size={24} /></button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

    <AnimatePresence>
        {isAddingPromo && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.form initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} onSubmit={handleAddPromo} className="bg-white rounded-[3.5rem] p-12 max-w-2xl w-full shadow-2xl relative text-black">
              <button type="button" onClick={() => setIsAddingPromo(false)} className="absolute top-10 right-10 text-gray-400 hover:text-gray-900 border-none bg-transparent outline-none cursor-pointer"><X size={32} /></button>
              <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-10 flex items-center gap-3 text-blue-600"><Flame size={32} /> Nowa Okazja</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <input required placeholder="Produkt / Tytuł" className="md:col-span-2 w-full p-5 rounded-2xl bg-gray-50 border-none font-bold text-black outline-none focus:ring-2 ring-blue-500" value={promoForm.title} onChange={e => setPromoForm(prev => ({ ...prev, title: e.target.value }))} />
                <select className="w-full p-5 rounded-2xl bg-gray-50 font-bold border-none outline-none text-black cursor-pointer" value={promoForm.category} onChange={e => setPromoForm(prev => ({ ...prev, category: e.target.value }))}>
                  <option>Zabawki</option><option>Sala Zabaw</option><option>LEGO</option><option>Imprezy</option>
                </select>
                <input placeholder="Rabat np. -20%" className="w-full p-5 rounded-2xl bg-gray-50 border-none outline-none font-bold text-black" value={promoForm.discount} onChange={e => setPromoForm(prev => ({ ...prev, discount: e.target.value }))} />
                <input required placeholder="Stara Cena" className="w-full p-5 rounded-2xl bg-gray-50 border-none font-bold text-black outline-none" value={promoForm.old_price} onChange={e => setPromoForm(prev => ({ ...prev, old_price: e.target.value }))} />
                <input required placeholder="Nowa Cena" className="w-full p-5 rounded-2xl bg-gray-50 border-none font-bold text-black outline-none" value={promoForm.new_price} onChange={e => setPromoForm(prev => ({ ...prev, new_price: e.target.value }))} />
              </div>
              <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 transition-all border-none outline-none active:scale-95 cursor-pointer">Dodaj i publikuj</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}