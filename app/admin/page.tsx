'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, X, Tag, LogOut, Loader2,
  Bell, Send, Wand2, Clock, Zap, Flame,
  Image as ImageIcon, Coffee, LayoutDashboard, History, ChevronRight,
  Search, Users, ChevronDown, CheckCircle2,
  Calendar, Repeat, TicketPercent, Menu, Pencil
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { PUSH_CATEGORIES, PushTopic } from '@/lib/push-config'

const DAYS_OF_WEEK = [
  { id: 1, label: 'Pn' }, { id: 2, label: 'Wt' }, { id: 3, label: 'Śr' },
  { id: 4, label: 'Cz' }, { id: 5, label: 'Pt' }, { id: 6, label: 'Sb' }, { id: 0, label: 'Nd' }
]

export default function AdminDashboard() {
  const supabase = useMemo(() => createClient(), [])

  const [activeTab, setActiveTab] = useState<'stats' | 'promos' | 'push' | 'history' | 'clients' | 'kupony'>('stats')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [promos, setPromos] = useState<any[]>([])
  const [kupony, setKupony] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [scheduledPushes, setScheduledPushes] = useState<any[]>([])
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [totalSubscriberCount, setTotalSubscriberCount] = useState(0)
  const [totalSentPushes, setTotalSentPushes] = useState(0) 
  const [pushStats, setPushStats] = useState({ clicks: 0, closes: 0 })
  const [loading, setLoading] = useState(false)

  const [allUsers, setAllUsers] = useState<any[]>([])
  const [clientSearchQuery, setClientSearchQuery] = useState('')

  const [isAddingPromo, setIsAddingPromo] = useState(false)
  const [isAddingKupon, setIsAddingKupon] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isSendingPush, setIsSendingPush] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<PushTopic>('wszystkie')
  const [pushData, setPushData] = useState({ title: '', message: '', image_url: '', scheduled_for: '' })
  
  const [promoForm, setPromoForm] = useState({ 
    title: '', old_price: '', new_price: '', discount: '', category: 'Zabawki', expires_at: '', image_url: '' 
  })
  const [isCustomCategory, setIsCustomCategory] = useState(false)

  // 🚀 ZMIANA: Formularz Kuponu posiada ID, expires_at i usage_limit
  const [kuponForm, setKuponForm] = useState<{
    id?: string; title: string; code: string; description: string; gradient: string; 
    image_url: string; is_reusable: boolean; allowed_days: number[];
    expires_at: string; usage_limit: string;
  }>({
    title: '', code: '', description: '', gradient: 'from-[#0055ff] to-blue-500', 
    image_url: '', is_reusable: false, allowed_days: [], expires_at: '', usage_limit: ''
  })
  
  const trackAdminEvent = useCallback((name: string, params: object = {}) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', `admin_${name}`, params);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, hRes, sRes, aRes, allHistRes, usersRes, kuponyRes] = await Promise.all([
        supabase.from('promocje').select('*').order('created_at', { ascending: false }),
        supabase.from('push_history').select('*').eq('status', 'sent').order('created_at', { ascending: false }).limit(10),
        supabase.from('push_history').select('*').eq('status', 'scheduled').order('scheduled_for', { ascending: true }),
        supabase.from('push_analytics').select('action'),
        supabase.from('push_history').select('sent_to_count').eq('status', 'sent'),
        supabase.from('loyalty_cards').select('id, full_name, phone_number, created_at').order('created_at', { ascending: false }),
        supabase.from('kupony').select('*').order('created_at', { ascending: false })
      ])

      setPromos(pRes?.data || [])
      setKupony(kuponyRes?.data || [])
      setHistory(hRes?.data || [])
      setScheduledPushes(sRes?.data || [])
      setAllUsers(usersRes?.data || [])
      
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

    } catch (error) { toast.error('Błąd połączenia z bazą.') } finally { setLoading(false) }
  }, [supabase, selectedTopic])

  useEffect(() => { fetchData() }, [fetchData])

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/urwisek' }

  async function handleFileUpload(file: File, folder: 'broadcasts' | 'promos' | 'kupony') {
    setUploading(true)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    
    const { error } = await supabase.storage.from('push-images').upload(path, file)
    if (error) { toast.error('Błąd wgrywania pliku'); setUploading(false); return null; }
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
    const payload = { ...promoForm, expires_at: promoForm.expires_at ? new Date(promoForm.expires_at).toISOString() : null, is_active: true }
    const { error } = await supabase.from('promocje').insert([payload])
    if (!error) {
      setIsAddingPromo(false); setIsCustomCategory(false);
      setPromoForm({ title: '', old_price: '', new_price: '', discount: '', category: 'Zabawki', expires_at: '', image_url: '' });
      toast.success('Okazja opublikowana!'); trackAdminEvent('promo_add'); fetchData();
    } else toast.error('Błąd zapisu promocji')
  }

  const handleDeletePromo = async (id: string) => {
    if (confirm('Usunąć ofertę z serwisu?')) {
      await supabase.from('promocje').delete().eq('id', id)
      toast.success('Usunięto ofertę'); trackAdminEvent('promo_delete'); fetchData()
    }
  }

  // --- HANDLERS: KUPONY ---
  const onKuponImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const url = await handleFileUpload(file, 'kupony');
    if (url) setKuponForm(prev => ({ ...prev, image_url: url }));
  }

  // 🚀 ZMIANA: Obsługa Edycji i Zapisywania
  const handleEditKupon = (k: any) => {
    setKuponForm({
      id: k.id,
      title: k.title,
      code: k.code,
      description: k.description || '',
      gradient: k.gradient,
      image_url: k.image_url || '',
      is_reusable: k.is_reusable,
      allowed_days: k.allowed_days || [],
      expires_at: k.expires_at ? new Date(k.expires_at).toISOString().slice(0, 16) : '',
      usage_limit: k.usage_limit?.toString() || ''
    })
    setIsAddingKupon(true)
  }

  const handleSaveKupon = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      title: kuponForm.title, code: kuponForm.code, description: kuponForm.description,
      gradient: kuponForm.gradient, image_url: kuponForm.image_url, 
      is_reusable: kuponForm.is_reusable, allowed_days: kuponForm.allowed_days,
      expires_at: kuponForm.expires_at ? new Date(kuponForm.expires_at).toISOString() : null,
      usage_limit: kuponForm.usage_limit ? parseInt(kuponForm.usage_limit) : null,
      is_active: true
    }

    let error;
    if (kuponForm.id) {
      const res = await supabase.from('kupony').update(payload).eq('id', kuponForm.id)
      error = res.error
    } else {
      const res = await supabase.from('kupony').insert([payload])
      error = res.error
    }

    if (!error) {
      setIsAddingKupon(false);
      setKuponForm({ title: '', code: '', description: '', gradient: 'from-[#0055ff] to-blue-500', image_url: '', is_reusable: false, allowed_days: [], expires_at: '', usage_limit: '' });
      toast.success(kuponForm.id ? 'Zaktualizowano kupon!' : 'Dodano nowy kupon!'); 
      fetchData();
    } else toast.error('Błąd zapisu kuponu')
  }

  const handleDeleteKupon = async (id: string) => {
    if (confirm('Usunąć ten kupon rabatowy?')) {
      await supabase.from('kupony').delete().eq('id', id); toast.success('Usunięto kupon'); fetchData()
    }
  }

  const toggleDay = (dayId: number) => {
    setKuponForm(prev => ({
      ...prev,
      allowed_days: prev.allowed_days.includes(dayId) ? prev.allowed_days.filter(d => d !== dayId) : [...prev.allowed_days, dayId]
    }))
  }

  const getDayNames = (days: number[]) => {
    if (!days || days.length === 0) return 'Codziennie'
    const sorted = [...days].sort()
    return sorted.map(d => DAYS_OF_WEEK.find(dw => dw.id === d)?.label).join(', ')
  }

  // --- HANDLERS: PUSH ---
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

  const navItems = [
    { id: 'stats', label: 'Statystyki', icon: LayoutDashboard },
    { id: 'clients', label: 'Baza Klientów', icon: Users },
    { id: 'kupony', label: 'Kupony Rabatowe', icon: TicketPercent },
    { id: 'promos', label: 'Katalog Ofert', icon: Tag },
    { id: 'push', label: 'Kreator Push', icon: Bell },
    { id: 'history', label: 'Historia Wysyłek', icon: History }
  ] as const;

  return (
    <div className="fixed inset-0 z-[10000] bg-zinc-50 flex flex-col md:flex-row text-zinc-900 overflow-hidden font-sans">
      
      {/* 🚀 TOP BAR (Mobile) */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-zinc-200 p-4 shrink-0 shadow-sm z-50">
        <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">Admin <span className="text-[#0055ff]">Urwis</span></h1>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-zinc-100 rounded-xl text-zinc-600 hover:bg-zinc-200 transition-colors border-none"><Menu size={24} /></button>
      </div>

      {/* 🚀 SIDEBAR (Desktop) */}
      <aside className="hidden md:flex w-72 bg-white border-r border-zinc-200 flex-col h-full shrink-0 p-6 overflow-y-auto">
        <div className="mb-10 px-2">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Admin <span className="text-[#0055ff]">Urwis</span></h1>
          <div className="flex items-center gap-2 mt-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> System Aktywny
          </div>
        </div>
        <nav className="space-y-2 flex-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all border-none outline-none cursor-pointer ${activeTab === id ? 'bg-blue-50 text-[#0055ff]' : 'hover:bg-zinc-100 text-zinc-500'}`}>
              <Icon size={20} aria-hidden="true" /> {label}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 p-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all mt-auto border-none bg-transparent cursor-pointer"><LogOut size={20} /> Wyloguj się</button>
      </aside>

      {/* 🚀 MODAL: MENU MOBILNE */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[11000] md:hidden" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 left-0 w-[280px] bg-white shadow-2xl z-[12000] md:hidden flex flex-col p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">Menu <span className="text-[#0055ff]">Admin</span></h1>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-zinc-100 rounded-full text-zinc-600 border-none"><X size={20} /></button>
              </div>
              <nav className="space-y-2 flex-1">
                {navItems.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all border-none outline-none cursor-pointer ${activeTab === id ? 'bg-blue-50 text-[#0055ff]' : 'hover:bg-zinc-100 text-zinc-500'}`}>
                    <Icon size={20} aria-hidden="true" /> {label}
                  </button>
                ))}
              </nav>
              <button onClick={handleLogout} className="flex items-center gap-3 p-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all mt-8 border-none bg-transparent cursor-pointer"><LogOut size={20} /> Wyloguj się</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 h-full overflow-y-auto p-4 md:p-10 bg-zinc-50/50 custom-scrollbar">
        <div className="max-w-6xl mx-auto pb-24 md:pb-20">
          <AnimatePresence mode="wait">
            
            {/* STATS */}
            {activeTab === 'stats' && (
              <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
                <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-zinc-900">Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-4xl shadow-sm border border-zinc-100"><p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Baza Odbiorców Push</p><p className="text-3xl md:text-4xl font-black text-[#0055ff] tracking-tighter">{totalSubscriberCount}</p></div>
                  <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-4xl shadow-sm border border-zinc-100"><p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Zarejestrowani Klienci</p><p className="text-3xl md:text-4xl font-black text-green-500 tracking-tighter">{allUsers.length}</p></div>
                  <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-4xl shadow-sm border border-zinc-100"><p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Łączna Wysyłka Push</p><p className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tighter">{totalSentPushes}</p></div>
                </div>
              </motion.div>
            )}

            {/* KUPONY RABATOWE */}
            {activeTab === 'kupony' && (
              <motion.div key="kupony" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-[#0055ff] flex items-center gap-3">
                    <TicketPercent size={28} className="md:w-8 md:h-8" /> Kupony
                  </h2>
                  <button onClick={() => {
                    setKuponForm({ title: '', code: '', description: '', gradient: 'from-[#0055ff] to-blue-500', image_url: '', is_reusable: false, allowed_days: [], expires_at: '', usage_limit: '' });
                    setIsAddingKupon(true);
                  }} className="w-full sm:w-auto px-6 py-4 bg-[#0055ff] text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-blue-600 transition-all border-none cursor-pointer shadow-lg">
                    <Plus size={18} /> Nowy Kupon
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {kupony.map(k => (
                    <div key={k.id} className={`bg-gradient-to-br ${k.gradient} p-5 md:p-6 rounded-3xl md:rounded-[2rem] text-white shadow-xl flex flex-col justify-between relative min-h-[200px]`}>
                      
                      {/* Przyciski Edycji i Usuwania */}
                      <div className="absolute top-4 right-4 flex gap-2 z-10">
                        <button onClick={() => handleEditKupon(k)} className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors cursor-pointer border-none backdrop-blur-sm">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDeleteKupon(k.id)} className="p-2 bg-white/20 hover:bg-red-500 text-white rounded-full transition-colors cursor-pointer border-none backdrop-blur-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mb-4 pr-16">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                           {k.is_reusable && <span className="bg-white/20 text-white flex items-center gap-1 px-2.5 py-1 rounded-full font-black uppercase tracking-widest text-[8px] backdrop-blur-sm border border-white/30"><Repeat size={10}/> Wielorazowy</span>}
                           {k.allowed_days?.length > 0 && <span className="bg-white/20 text-white flex items-center gap-1 px-2.5 py-1 rounded-full font-black uppercase tracking-widest text-[8px] backdrop-blur-sm border border-white/30"><Calendar size={10}/> {getDayNames(k.allowed_days)}</span>}
                        </div>
                        <h3 className="text-xl md:text-2xl font-black italic uppercase leading-none mb-1">{k.title}</h3>
                        
                        <div className="mt-2 flex flex-col gap-1">
                          {k.expires_at && <span className="text-[10px] font-bold text-white/80">Ważny do: {new Date(k.expires_at).toLocaleDateString()}</span>}
                          {k.usage_limit && <span className="text-[10px] font-bold text-white/80">Pula: {k.current_usage} / {k.usage_limit} szt.</span>}
                        </div>
                      </div>
                      
                      <div className="bg-white text-zinc-900 py-2.5 px-4 rounded-xl inline-block border-2 border-white/20 shadow-lg text-center mt-auto w-fit">
                        <span className="block text-[8px] uppercase font-black text-zinc-400 mb-0.5">KOD PRZY KASIE</span>
                        <span className="text-lg md:text-xl font-black tracking-widest">{k.code}</span>
                      </div>
                    </div>
                  ))}
                  {kupony.length === 0 && <div className="col-span-full text-center py-12 text-zinc-400 font-bold border-2 border-dashed border-zinc-200 rounded-3xl">Brak aktywnych kuponów.</div>}
                </div>
              </motion.div>
            )}

            {/* POZOSTAŁE ZAKŁADKI BEZ ZMIAN (Ucięte dla oszczędności miejsca w oknie chatu, wrzuć swoje stare Promos, Klienci, Historia stąd) */}
            {activeTab === 'promos' && (
              <motion.div key="promos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
                 <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-zinc-900">Katalog Ofert</h2>
                 {/* Twój kod promos... */}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* --- MODAL: KUPON RABATOWY --- */}
      <AnimatePresence>
        {isAddingKupon && (
          <div className="fixed inset-0 z-[15000] flex items-center justify-center p-4 md:p-6 bg-zinc-950/80 backdrop-blur-md">
            <motion.form initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} onSubmit={handleSaveKupon} className="bg-white rounded-3xl md:rounded-4xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative text-zinc-900 border border-zinc-100 overflow-y-auto max-h-[90vh]">
              <button type="button" onClick={() => setIsAddingKupon(false)} className="absolute top-4 right-4 md:top-6 md:right-6 text-zinc-400 hover:text-zinc-900 border-none bg-transparent outline-none cursor-pointer"><X size={24} /></button>
              
              <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter mb-6 md:mb-8 flex items-center gap-3 text-[#0055ff]">
                <TicketPercent size={24} className="md:w-7 md:h-7" /> {kuponForm.id ? 'Edytuj Kupon' : 'Nowy Kupon'}
              </h3>
              
              <div className="space-y-4 md:space-y-5 mb-6 md:mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 md:ml-2 mb-1 block">Tytuł Kuponu</label>
                    <input required placeholder="np. -10% na LEGO" className="w-full p-4 rounded-xl md:rounded-2xl bg-zinc-50 border-none font-black text-sm md:text-base text-zinc-900 outline-none focus:ring-2 ring-blue-500" value={kuponForm.title} onChange={e => setKuponForm(prev => ({ ...prev, title: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 md:ml-2 mb-1 block">Kod przy kasie</label>
                    <input required placeholder="np. LEGO10" className="w-full p-4 rounded-xl md:rounded-2xl bg-zinc-50 border-none font-black text-sm md:text-base text-zinc-900 outline-none focus:ring-2 ring-blue-500 uppercase tracking-widest" value={kuponForm.code} onChange={e => setKuponForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))} />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 md:ml-2 mb-1 block">Krótki opis warunków</label>
                  <input placeholder="np. Obowiązuje na zestawy nieprzecenione." className="w-full p-4 rounded-xl md:rounded-2xl bg-zinc-50 border-none font-bold text-sm md:text-base text-zinc-900 outline-none focus:ring-2 ring-blue-500 text-sm" value={kuponForm.description} onChange={e => setKuponForm(prev => ({ ...prev, description: e.target.value }))} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 md:ml-2 mb-1 block">Limit użyć (Opcjonalnie)</label>
                    <input type="number" placeholder="np. 10 (tylko dla 10 osób)" className="w-full p-4 rounded-xl md:rounded-2xl bg-zinc-50 border-none font-black text-sm md:text-base text-zinc-900 outline-none focus:ring-2 ring-blue-500" value={kuponForm.usage_limit} onChange={e => setKuponForm(prev => ({ ...prev, usage_limit: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 md:ml-2 mb-1 block">Data ważności (Opcjonalnie)</label>
                    <input type="datetime-local" className="w-full p-4 rounded-xl md:rounded-2xl bg-zinc-50 border-none font-black text-sm md:text-base text-zinc-900 outline-none focus:ring-2 ring-blue-500" value={kuponForm.expires_at} onChange={e => setKuponForm(prev => ({ ...prev, expires_at: e.target.value }))} />
                  </div>
                </div>

                <div className="p-4 md:p-5 bg-blue-50 rounded-xl md:rounded-2xl border border-blue-100 space-y-4">
                   <label className="flex items-center gap-3 cursor-pointer select-none">
                     <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${kuponForm.is_reusable ? 'bg-[#0055ff] border-[#0055ff] text-white' : 'bg-white border-zinc-300 text-transparent'}`}>
                        <Repeat size={14} />
                     </div>
                     <input type="checkbox" className="hidden" checked={kuponForm.is_reusable} onChange={e => setKuponForm(prev => ({...prev, is_reusable: e.target.checked}))} />
                     <div className="flex flex-col">
                       <span className="font-black text-xs md:text-sm uppercase text-blue-900">Kupon Wielorazowy</span>
                       <span className="text-[9px] md:text-[10px] font-bold text-blue-700">Odblokuje się ponownie następnego (dozwolonego) dnia.</span>
                     </div>
                   </label>

                   <div>
                     <span className="text-[9px] md:text-[10px] font-black text-blue-800 uppercase tracking-widest mb-2 block">Dni dostępności (Puste = Codziennie)</span>
                     <div className="flex flex-wrap gap-1.5 md:gap-2">
                       {DAYS_OF_WEEK.map(day => (
                         <button 
                            key={day.id} type="button" onClick={() => toggleDay(day.id)}
                            className={`w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl font-black text-xs md:text-sm transition-all border-none cursor-pointer ${kuponForm.allowed_days.includes(day.id) ? 'bg-[#0055ff] text-white shadow-md' : 'bg-white text-blue-400 hover:bg-blue-100'}`}
                         >
                           {day.label}
                         </button>
                       ))}
                     </div>
                   </div>
                </div>

                <div>
                  <label className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 md:ml-2 mb-2 block">Kolor Kafelka</label>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {[
                      { val: 'from-[#0055ff] to-blue-500' },
                      { val: 'from-[#BF2024] to-red-500' },
                      { val: 'from-amber-400 to-orange-500' },
                      { val: 'from-pink-500 to-rose-500' },
                      { val: 'from-emerald-500 to-green-500' },
                      { val: 'from-zinc-800 to-black' }
                    ].map(c => (
                      <button key={c.val} type="button" onClick={() => setKuponForm(prev => ({...prev, gradient: c.val}))} className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${c.val} border-4 transition-all cursor-pointer ${kuponForm.gradient === c.val ? 'border-zinc-900 scale-110 shadow-lg' : 'border-transparent'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={uploading} className="w-full py-4 md:py-5 bg-[#0055ff] text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest md:tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all border-none outline-none active:scale-95 cursor-pointer italic disabled:opacity-50 text-xs md:text-sm">
                  {uploading ? 'Wgrywanie...' : 'Zapisz Kupon 🎟️'}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}