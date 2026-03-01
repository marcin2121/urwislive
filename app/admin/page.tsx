'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, X, Tag, LogOut, Loader2,
  Bell, Send, Wand2, Clock, Zap, Flame,
  Image as ImageIcon, Coffee, LayoutDashboard, History, ChevronRight,
  Search, Users, ChevronDown, CheckCircle2,
  Calendar, Repeat, TicketPercent, Menu, Pencil, CircleDashed,
  TrendingUp, MousePointer2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { PUSH_CATEGORIES, PushTopic } from '@/lib/push-config'

// --- NOWE IMPORTY DLA WYKRESÓW ---
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend, AreaChart, Area 
} from 'recharts'

const DAYS_OF_WEEK = [
  { id: 1, label: 'Pn' }, { id: 2, label: 'Wt' }, { id: 3, label: 'Śr' },
  { id: 4, label: 'Cz' }, { id: 5, label: 'Pt' }, { id: 6, label: 'Sb' }, { id: 0, label: 'Nd' }
]

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminDashboard() {
  const supabase = useMemo(() => createClient(), [])

  // --- STATE: NAV ---
  const [activeTab, setActiveTab] = useState<'stats' | 'promos' | 'push' | 'history' | 'clients' | 'kupony' | 'wheel'>('stats')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // --- STATE: DATA ---
  const [promos, setPromos] = useState<any[]>([])
  const [kupony, setKupony] = useState<any[]>([])
  const [wheelPrizes, setWheelPrizes] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [scheduledPushes, setScheduledPushes] = useState<any[]>([])
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [totalSubscriberCount, setTotalSubscriberCount] = useState(0)
  const [totalSentPushes, setTotalSentPushes] = useState(0) 
  const [pushStats, setPushStats] = useState({ clicks: 0, closes: 0 })
  const [loading, setLoading] = useState(false)
  
  // --- STATE: SZCZEGÓŁY UŻYTKOWNIKA ---
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [userCoupons, setUserCoupons] = useState<any[]>([])
  const [loadingUserCoupons, setLoadingUserCoupons] = useState(false)

  const handleSelectUser = async (user: any) => {
    setSelectedUser(user)
    setLoadingUserCoupons(true)
    try {
      const { data, error } = await supabase
        .from('kupony')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setUserCoupons(data || [])
    } catch (err) {
      toast.error('Błąd pobierania kuponów użytkownika')
    } finally {
      setLoadingUserCoupons(false)
    }
  }

  // --- STATE: NOWE STATYSTYKI ---
  const [advancedStats, setAdvancedStats] = useState({
    totalExperience: 0,
    todaySpins: 0,
    avgExperience: 0,
    usedCoupons: 0,
    activeGlobalCoupons: 0
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [wheelStats, setWheelStats] = useState<any[]>([])
  const [wheelDailyChart, setWheelDailyChart] = useState<any[]>([]) // <--- NOWY STAN WYKRESU DNI KOŁA

  // --- STATE: CLIENTS ---
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [clientSearchQuery, setClientSearchQuery] = useState('')

  // --- FORMS ---
  const [isAddingPromo, setIsAddingPromo] = useState(false)
  const [isAddingKupon, setIsAddingKupon] = useState(false)
  const [isAddingWheelPrize, setIsAddingWheelPrize] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isSendingPush, setIsSendingPush] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<PushTopic>('wszystkie')
  const [pushData, setPushData] = useState({ title: '', message: '', image_url: '', scheduled_for: '' })
  
  const [promoForm, setPromoForm] = useState({ 
    title: '', old_price: '', new_price: '', discount: '', category: 'Zabawki', expires_at: '', image_url: '' 
  })
  const [isCustomCategory, setIsCustomCategory] = useState(false)

  const [kuponForm, setKuponForm] = useState<{
    id?: string; title: string; code: string; description: string; gradient: string; 
    image_url: string; is_reusable: boolean; allowed_days: number[];
    expires_at: string; usage_limit: string;
  }>({
    title: '', code: '', description: '', gradient: 'from-[#0055ff] to-blue-500', 
    image_url: '', is_reusable: false, allowed_days: [], expires_at: '', usage_limit: ''
  })

  const [wheelForm, setWheelForm] = useState<{
    id?: string; title: string; code_prefix: string; description: string; gradient: string; chance: string;
  }>({
    title: '', code_prefix: '', description: '', gradient: 'from-[#0055ff] to-blue-500', chance: '10'
  })
  
  const trackAdminEvent = useCallback((name: string, params: object = {}) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', `admin_${name}`, params);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, hRes, sRes, aRes, allHistRes, usersRes, kuponyRes, wheelRes, allCouponsRes, loyaltyRes] = await Promise.all([
        supabase.from('promocje').select('*').order('created_at', { ascending: false }),
        supabase.from('push_history').select('*').eq('status', 'sent').order('created_at', { ascending: false }).limit(10),
        supabase.from('push_history').select('*').eq('status', 'scheduled').order('scheduled_for', { ascending: true }),
        supabase.from('push_analytics').select('action'),
        supabase.from('push_history').select('sent_to_count').eq('status', 'sent'),
        supabase.from('loyalty_cards').select('id, full_name, phone_number, created_at, user_id, email').order('created_at', { ascending: false }), // Zwróć uwagę, dodałem email jeśli jest w tabeli (albo zostaw bez zmian)
        supabase.from('kupony').select('*').is('user_id', null).order('created_at', { ascending: false }),
        supabase.from('wheel_prizes').select('*').order('chance', { ascending: false }),
        supabase.from('kupony').select('title, current_usage, user_id, created_at, is_active'),
        supabase.from('loyalty_cards').select('experience', { count: 'exact' })
      ])

      setPromos(pRes?.data || [])
      setKupony(kuponyRes?.data || [])
      setWheelPrizes(wheelRes?.data || [])
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

      // --- PRZETWARZANIE DANYCH DLA NOWYCH WYKRESÓW ---
      const allCoupons = allCouponsRes?.data || []
      const loyaltyData = loyaltyRes?.data || []
      const userCount = loyaltyRes?.count || 0

      const totalUsed = allCoupons.reduce((acc, curr) => acc + (curr.current_usage || 0), 0)
      const activeGlobal = allCoupons.filter(k => k.is_active && !k.user_id).length

      const today = new Date()
      today.setHours(0,0,0,0)
      const spinsToday = allCoupons.filter(k => k.user_id && new Date(k.created_at) >= today).length

      const distributionMap: any = {}
      allCoupons.filter(k => k.user_id).forEach(p => { distributionMap[p.title] = (distributionMap[p.title] || 0) + 1 })
      const formattedWheelData = Object.entries(distributionMap).map(([name, value]) => ({ name, value }))

      const chartMap = new Map()
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i)
        chartMap.set(d.toLocaleDateString('pl-PL', { weekday: 'short' }), 0)
      }
      allCoupons.forEach(c => {
        const day = new Date(c.created_at).toLocaleDateString('pl-PL', { weekday: 'short' })
        if (chartMap.has(day)) chartMap.set(day, chartMap.get(day) + 1)
      })

      // 🚀 TWOJA NOWA LOGIKA DLA WYKRESU DNI KOŁA FORTUNY:
      const wheelSpinsByDay = new Map()
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i)
        wheelSpinsByDay.set(d.toLocaleDateString('pl-PL', { weekday: 'short' }), 0)
      }
      // Zakładamy, że kupony z przypisanym user_id to te wylosowane w kole
      allCoupons.filter(k => k.user_id).forEach(c => {
        const day = new Date(c.created_at).toLocaleDateString('pl-PL', { weekday: 'short' })
        if (wheelSpinsByDay.has(day)) wheelSpinsByDay.set(day, wheelSpinsByDay.get(day) + 1)
      })

      const totalExp = loyaltyData.reduce((acc, curr) => acc + (curr.experience || 0), 0)

      setAdvancedStats({
        totalExperience: totalExp,
        todaySpins: spinsToday,
        avgExperience: userCount ? Math.floor(totalExp / userCount) : 0,
        usedCoupons: totalUsed,
        activeGlobalCoupons: activeGlobal
      })
      setChartData(Array.from(chartMap, ([name, aktywnosc]) => ({ name, aktywnosc })))
      setWheelStats(formattedWheelData)
      setWheelDailyChart(Array.from(wheelSpinsByDay, ([name, spins]) => ({ name, spins }))) // Zapis nowego stanu

    } catch (error) { toast.error('Błąd połączenia z bazą.') } finally { setLoading(false) }
  }, [supabase, selectedTopic])

  useEffect(() => { 
    fetchData()
    const channel = supabase.channel('admin-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loyalty_cards' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kupony' }, () => fetchData())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchData])

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/strefa-zabawy/urwisek' }

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
  const handleEditKupon = (k: any) => {
    setKuponForm({
      id: k.id, title: k.title, code: k.code, description: k.description || '',
      gradient: k.gradient, image_url: k.image_url || '', is_reusable: k.is_reusable,
      allowed_days: k.allowed_days || [], expires_at: k.expires_at ? new Date(k.expires_at).toISOString().slice(0, 16) : '',
      usage_limit: k.usage_limit?.toString() || ''
    })
    setIsAddingKupon(true)
  }

  const handleSaveKupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedUsageLimit = kuponForm.usage_limit && kuponForm.usage_limit.trim() !== '' ? parseInt(kuponForm.usage_limit, 10) : null;
    const parsedExpiresAt = kuponForm.expires_at && kuponForm.expires_at.trim() !== '' ? new Date(kuponForm.expires_at).toISOString() : null;

    const payload = {
      title: kuponForm.title, code: kuponForm.code, description: kuponForm.description,
      gradient: kuponForm.gradient, image_url: kuponForm.image_url, is_reusable: kuponForm.is_reusable, 
      allowed_days: kuponForm.allowed_days, expires_at: parsedExpiresAt, usage_limit: parsedUsageLimit, is_active: true
    };

    let error;
    if (kuponForm.id) {
      const res = await supabase.from('kupony').update(payload).eq('id', kuponForm.id); error = res.error;
    } else {
      const res = await supabase.from('kupony').insert([payload]); error = res.error;
    }

    if (!error) {
      setIsAddingKupon(false);
      setKuponForm({ title: '', code: '', description: '', gradient: 'from-[#0055ff] to-blue-500', image_url: '', is_reusable: false, allowed_days: [], expires_at: '', usage_limit: '' });
      toast.success(kuponForm.id ? 'Zaktualizowano kupon!' : 'Dodano nowy kupon!'); fetchData();
    } else toast.error(`Błąd: ${error.message}`);
  };

  const handleDeleteKupon = async (id: string) => {
    if (confirm('Usunąć ten kupon rabatowy?')) {
      await supabase.from('kupony').delete().eq('id', id); toast.success('Usunięto kupon'); fetchData()
    }
  }

  const toggleDay = (dayId: number) => {
    setKuponForm(prev => ({ ...prev, allowed_days: prev.allowed_days.includes(dayId) ? prev.allowed_days.filter(d => d !== dayId) : [...prev.allowed_days, dayId] }))
  }

  const getDayNames = (days: number[]) => {
    if (!days || days.length === 0) return 'Codziennie'
    const sorted = [...days].sort()
    return sorted.map(d => DAYS_OF_WEEK.find(dw => dw.id === d)?.label).join(', ')
  }

  // --- HANDLERS: KOŁO FORTUNY ---
  const handleEditWheelPrize = (p: any) => {
    setWheelForm({
      id: p.id, title: p.title, code_prefix: p.code_prefix, description: p.description || '',
      gradient: p.gradient, chance: p.chance?.toString() || '10'
    })
    setIsAddingWheelPrize(true)
  }

  const handleSaveWheelPrize = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: wheelForm.title, code_prefix: wheelForm.code_prefix, description: wheelForm.description,
      gradient: wheelForm.gradient, chance: parseFloat(wheelForm.chance), is_active: true
    };

    let error;
    if (wheelForm.id) {
      const res = await supabase.from('wheel_prizes').update(payload).eq('id', wheelForm.id); error = res.error;
    } else {
      const res = await supabase.from('wheel_prizes').insert([payload]); error = res.error;
    }

    if (!error) {
      setIsAddingWheelPrize(false);
      setWheelForm({ title: '', code_prefix: '', description: '', gradient: 'from-[#0055ff] to-blue-500', chance: '10' });
      toast.success(wheelForm.id ? 'Zaktualizowano nagrodę!' : 'Dodano do Koła!'); fetchData();
    } else toast.error(`Błąd: ${error.message}`);
  };

  const handleDeleteWheelPrize = async (id: string) => {
    if (confirm('Usunąć tę nagrodę z Koła Fortuny?')) {
      await supabase.from('wheel_prizes').delete().eq('id', id); toast.success('Usunięto nagrodę'); fetchData()
    }
  }


  // --- HANDLERS: PUSH ---
  const onPushImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const filteredClients = allUsers.filter(u => 
    u.phone_number?.includes(clientSearchQuery) || u.full_name?.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  const navItems = [
    { id: 'stats', label: 'Statystyki & Wykresy', icon: LayoutDashboard },
    { id: 'clients', label: 'Baza Klientów', icon: Users },
    { id: 'kupony', label: 'Kupony Rabatowe', icon: TicketPercent },
    { id: 'wheel', label: 'Koło Fortuny', icon: CircleDashed },
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
            <button key={id} onClick={() => setActiveTab(id as any)} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all border-none outline-none cursor-pointer ${activeTab === id ? 'bg-blue-50 text-[#0055ff]' : 'hover:bg-zinc-100 text-zinc-500'}`}>
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
                  <button key={id} onClick={() => { setActiveTab(id as any); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all border-none outline-none cursor-pointer ${activeTab === id ? 'bg-blue-50 text-[#0055ff]' : 'hover:bg-zinc-100 text-zinc-500'}`}>
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
            
            {/* 🚀 NOWE ZAAWANSOWANE STATYSTYKI */}
            {activeTab === 'stats' && (
              <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                
                <header className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase flex items-center gap-3 text-zinc-900">
                      <Zap className="text-amber-500 fill-amber-500" /> Analityka <span className="text-[#0055ff]">Live</span>
                    </h1>
                    <p className="text-zinc-500 mt-1 font-bold">Wydajność grywalizacji i PWA.</p>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-zinc-200 shadow-sm">
                    <div className="text-center px-4">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Dziś w Kole</p>
                        <p className="text-2xl font-black text-[#0055ff]">{advancedStats.todaySpins}</p>
                    </div>
                    <div className="w-px h-10 bg-zinc-200" />
                    <div className="text-center px-4">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Avg XP / User</p>
                        <p className="text-2xl font-black text-emerald-500">{advancedStats.avgExperience}</p>
                    </div>
                  </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <StatCard title="Baza PWA / Push" value={totalSubscriberCount} icon={<Users />} color="text-blue-500" />
                  <StatCard title="Aktywne Promocje" value={advancedStats.activeGlobalCoupons} icon={<TicketPercent />} color="text-amber-500" />
                  <StatCard title="Zrealizowane Kupony" value={advancedStats.usedCoupons} icon={<CheckCircle2 />} color="text-emerald-500" />
                  <StatCard title="Łączny XP Urwisów" value={advancedStats.totalExperience} icon={<TrendingUp />} color="text-violet-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  {/* WYKRES 1 */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-zinc-100 shadow-md">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-700 mb-6">
                      <TrendingUp className="w-4 h-4 text-[#0055ff]" /> Generowanie Kuponów (7 dni)
                    </h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorAktywnosc" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0055ff" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#0055ff" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12, fontWeight: 'bold'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12, fontWeight: 'bold'}} />
                          <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" dataKey="aktywnosc" name="Nowe Kupony" stroke="#0055ff" strokeWidth={4} fillOpacity={1} fill="url(#colorAktywnosc)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* WYKRES 2 */}
                  <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-md flex flex-col">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-700 mb-6">
                      <MousePointer2 className="w-4 h-4 text-amber-500" /> Rozkład Nagród (Koło)
                    </h3>
                    <div className="h-[200px] flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={wheelStats} innerRadius={50} outerRadius={80} paddingAngle={8} dataKey="value">
                            {wheelStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                      {wheelStats.map((s, i) => (
                        <div key={s.name} className="flex items-center justify-between text-xs font-black">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                              <span className="opacity-80 text-zinc-700 truncate max-w-[120px]">{s.name}</span>
                            </div>
                            <span className="text-[#0055ff]">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 🚀 NOWY WYKRES 3: Aktywność Koła Fortuny na przestrzeni dni */}
                  <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-zinc-100 shadow-md">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-700 mb-6">
                      <CircleDashed className="w-4 h-4 text-emerald-500" /> Losowania w Kole Fortuny (7 dni)
                    </h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={wheelDailyChart}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12, fontWeight: 'bold'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12, fontWeight: 'bold'}} />
                          <Tooltip 
                            cursor={{fill: '#f4f4f5'}}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                          />
                          <Bar dataKey="spins" name="Liczba Losowań" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* BAZA KLIENTÓW */}
            {activeTab === 'clients' && (
              <motion.div key="clients" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-green-600 flex items-center gap-3">
                    <Users size={28} className="md:w-8 md:h-8" /> Nasi Klienci
                  </h2>
                </div>
                <div className="bg-white rounded-3xl md:rounded-4xl border border-zinc-100 shadow-xl overflow-hidden">
                  <div className="p-4 md:p-8 border-b border-zinc-50 bg-zinc-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="relative w-full md:max-w-sm">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input type="text" placeholder="Szukaj (imię/telefon)..." className="w-full pl-12 pr-6 py-4 rounded-2xl border-none bg-white shadow-sm font-bold outline-none focus:ring-2 ring-green-500 text-sm" value={clientSearchQuery} onChange={(e) => setClientSearchQuery(e.target.value)} />
                    </div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 md:ml-0">Baza: {filteredClients.length} osób</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-zinc-50/30 text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b border-zinc-50">
                        <tr>
                          <th className="p-4 md:p-6 whitespace-nowrap">Imię / Email</th>
                          <th className="p-4 md:p-6 whitespace-nowrap">Telefon</th>
                          <th className="p-4 md:p-6 whitespace-nowrap">Rejestracja</th>
                          <th className="p-4 md:p-6 whitespace-nowrap text-right">Akcje</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                        {filteredClients.map((u) => (
                          <tr key={u.id} className="hover:bg-green-50/30 transition-colors">
                            <td className="p-4 md:p-6">
                              <div className="flex flex-col">
                                <span className="font-black text-zinc-900 uppercase italic text-sm md:text-base">{u.full_name || 'Brak Imienia'}</span>
                                <span className="text-[10px] md:text-xs font-bold text-zinc-400">{u.email || 'brak emaila'}</span>
                              </div>
                            </td>
                            <td className="p-4 md:p-6 text-sm font-bold text-zinc-600">{u.phone_number || '---'}</td>
                            <td className="p-4 md:p-6 text-[10px] md:text-xs font-bold text-zinc-500 uppercase whitespace-nowrap">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString('pl-PL') : '---'}
                            </td>
                            <td className="p-4 md:p-6 text-right">
                              <button 
                                onClick={() => handleSelectUser(u)} 
                                className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl text-xs font-black uppercase transition-colors border-none cursor-pointer"
                              >
                                Szczegóły
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredClients.length === 0 && (
                          <tr><td colSpan={4} className="p-10 text-center text-zinc-400 font-bold">Brak wyników.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* MODAL SZCZEGÓŁÓW UŻYTKOWNIKA */}
                <AnimatePresence>
                  {selectedUser && (
                    <div className="fixed inset-0 z-[15000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto relative shadow-2xl border border-white">
                        <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full border-none cursor-pointer"><X size={20}/></button>
                        
                        <h2 className="text-2xl font-black italic uppercase text-green-600 mb-2">{selectedUser.full_name || 'Użytkownik'}</h2>
                        <p className="text-sm font-bold text-zinc-500 mb-6">{selectedUser.phone_number || 'Brak Telefonu'} | Zarejestrowany: {new Date(selectedUser.created_at).toLocaleDateString()}</p>

                        <h3 className="text-sm font-black uppercase text-zinc-400 tracking-widest mb-4">Historia Kuponów Użytkownika</h3>
                        
                        {loadingUserCoupons ? (
                          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-green-500" /></div>
                        ) : userCoupons.length === 0 ? (
                          <div className="p-8 bg-zinc-50 rounded-2xl text-center text-zinc-400 font-bold">Użytkownik nie posiada żadnych kuponów.</div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {userCoupons.map(coupon => (
                              <div key={coupon.id} className={`p-4 rounded-2xl border-2 flex flex-col gap-2 ${coupon.current_usage > 0 ? 'bg-zinc-50 border-zinc-200 opacity-70' : 'bg-white border-green-200 shadow-sm'}`}>
                                <div className="flex justify-between items-start">
                                  <span className="font-black uppercase text-sm leading-none mt-1">{coupon.title}</span>
                                  {coupon.current_usage > 0 ? (
                                    <span className="text-[9px] bg-zinc-200 text-zinc-600 px-2 py-1 rounded-md font-bold uppercase">Wykorzystano</span>
                                  ) : (
                                    <span className="text-[9px] bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold uppercase">Dostępny</span>
                                  )}
                                </div>
                                <div className="text-xl font-black tracking-widest bg-zinc-100 py-2 px-3 rounded-lg text-center mt-2">{coupon.code}</div>
                                <div className="flex justify-between text-[10px] text-zinc-400 font-bold mt-1">
                                  <span>Wylosowano: {new Date(coupon.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

              </motion.div>
            )}

            {/* KUPONY RABATOWE */}
            {activeTab === 'kupony' && (
              <motion.div key="kupony" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-[#0055ff] flex items-center gap-3">
                    <TicketPercent size={28} className="md:w-8 md:h-8" /> Globalne Kupony
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
                      <div className="absolute top-4 right-4 flex gap-2 z-10">
                        <button onClick={() => handleEditKupon(k)} className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors cursor-pointer border-none backdrop-blur-sm"><Pencil size={16} /></button>
                        <button onClick={() => handleDeleteKupon(k.id)} className="p-2 bg-white/20 hover:bg-red-500 text-white rounded-full transition-colors cursor-pointer border-none backdrop-blur-sm"><Trash2 size={16} /></button>
                      </div>
                      <div className="mb-4 pr-16">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                           {k.is_reusable && <span className="bg-white/20 text-white flex items-center gap-1 px-2.5 py-1 rounded-full font-black uppercase tracking-widest text-[8px] backdrop-blur-sm border border-white/30"><Repeat size={10}/> Wielorazowy</span>}
                           {k.allowed_days?.length > 0 && <span className="bg-white/20 text-white flex items-center gap-1 px-2.5 py-1 rounded-full font-black uppercase tracking-widest text-[8px] backdrop-blur-sm border border-white/30"><Calendar size={10}/> {getDayNames(k.allowed_days)}</span>}
                        </div>
                        <h3 className="text-xl md:text-2xl font-black italic uppercase leading-none mb-1">{k.title}</h3>
                        <div className="mt-2 flex flex-col gap-1">
                          {k.expires_at && <span className="text-[10px] font-bold text-white/80">Ważny do: {new Date(k.expires_at).toLocaleDateString()}</span>}
                          {k.usage_limit && <span className="text-[10px] font-bold text-white/80">Pula: {k.current_usage || 0} / {k.usage_limit} szt.</span>}
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

            {/* KOŁO FORTUNY (WHEEL PRIZES) */}
            {activeTab === 'wheel' && (
              <motion.div key="wheel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-amber-500 flex items-center gap-3">
                      <CircleDashed size={28} className="md:w-8 md:h-8" /> Koło Fortuny
                    </h2>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Nagrody w codziennym losowaniu ({wheelPrizes.reduce((sum, p) => sum + Number(p.chance), 0)}% szans łącznie)</p>
                  </div>
                  <button onClick={() => {
                    setWheelForm({ title: '', code_prefix: '', description: '', gradient: 'from-amber-400 to-orange-500', chance: '10' });
                    setIsAddingWheelPrize(true);
                  }} className="w-full sm:w-auto px-6 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-amber-600 transition-all border-none cursor-pointer shadow-lg">
                    <Plus size={18} /> Dodaj Nagrodę
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {wheelPrizes.map(p => (
                    <div key={p.id} className={`bg-gradient-to-br ${p.gradient} p-5 md:p-6 rounded-3xl md:rounded-[2rem] text-white shadow-xl flex flex-col justify-between relative min-h-[200px]`}>
                      <div className="absolute top-4 right-4 flex gap-2 z-10">
                        <button onClick={() => handleEditWheelPrize(p)} className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors cursor-pointer border-none backdrop-blur-sm"><Pencil size={16} /></button>
                        <button onClick={() => handleDeleteWheelPrize(p.id)} className="p-2 bg-white/20 hover:bg-red-500 text-white rounded-full transition-colors cursor-pointer border-none backdrop-blur-sm"><Trash2 size={16} /></button>
                      </div>
                      <div className="mb-4 pr-16">
                        <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-black/30 rounded-xl font-black text-sm mb-3">
                           {p.chance}% Szans
                        </div>
                        <h3 className="text-xl md:text-2xl font-black italic uppercase leading-none mb-1">{p.title}</h3>
                        <p className="text-white/80 text-[10px] md:text-xs font-medium line-clamp-2 mt-2">{p.description}</p>
                      </div>
                      <div className="bg-white text-zinc-900 py-2.5 px-4 rounded-xl inline-block border-2 border-white/20 shadow-lg text-center mt-auto w-fit">
                        <span className="block text-[8px] uppercase font-black text-zinc-400 mb-0.5">PREFIX KODU</span>
                        <span className="text-lg font-black tracking-widest">{p.code_prefix}-***</span>
                      </div>
                    </div>
                  ))}
                  {wheelPrizes.length === 0 && <div className="col-span-full text-center py-12 text-zinc-400 font-bold border-2 border-dashed border-zinc-200 rounded-3xl">Brak nagród w kole. Dodaj pierwszą!</div>}
                </div>
              </motion.div>
            )}

            {/* KATALOG OFERT (PROMOS) */}
            {activeTab === 'promos' && (
              <motion.div key="promos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-zinc-900">Katalog Ofert</h2>
                  <button onClick={() => setIsAddingPromo(true)} className="w-full sm:w-auto px-6 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-[#BF2024] transition-all border-none cursor-pointer shadow-lg"><Plus size={18} /> Nowa Promocja</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {promos.map(p => (
                    <div key={p.id} className="bg-white p-5 md:p-6 rounded-3xl md:rounded-4xl border border-zinc-100 shadow-sm flex flex-col justify-between group relative overflow-hidden">
                      {p.image_url && <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-100 opacity-20 -mr-6 -mt-6 rounded-full blur-2xl" />}
                      <div>
                        <span className={`px-2.5 py-1 text-[8px] font-black uppercase rounded-lg mb-3 inline-block ${p.category === 'LEGO' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-[#0055ff]'}`}>{p.category}</span>
                        <h3 className="text-lg md:text-xl font-black uppercase italic text-zinc-900 line-clamp-2 mb-3 leading-[0.95]">{p.title}</h3>
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-2xl md:text-3xl font-black text-zinc-900">{p.new_price} zł</span>
                          <span className="text-xs md:text-sm text-zinc-400 line-through font-bold">{p.old_price} zł</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-zinc-50">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{p.is_active ? '✅ Widoczna' : '❌ Ukryta'}</span>
                        <button onClick={() => handleDeletePromo(p.id)} className="p-2 md:p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all border-none cursor-pointer"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                  {promos.length === 0 && <div className="col-span-full text-center py-12 text-zinc-400 font-bold border-2 border-dashed border-zinc-200 rounded-3xl">Brak dodanych promocji.</div>}
                </div>
              </motion.div>
            )}

            {/* KREATOR PUSH */}
            {activeTab === 'push' && (
              <motion.div key="push" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8 max-w-2xl">
                <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Wysyłka Push</h2>
                <section className="bg-white p-6 md:p-10 rounded-3xl md:rounded-4xl shadow-xl border border-zinc-100 space-y-6 md:space-y-8">
                  <div className="space-y-3 md:space-y-4">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Kto ma otrzymać wiadomość?</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {PUSH_CATEGORIES.map(cat => (
                        <button key={cat.id} type="button" onClick={() => setSelectedTopic(cat.id)} className={`py-3 px-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all border-2 border-solid outline-none cursor-pointer text-center leading-tight ${selectedTopic === cat.id ? 'bg-[#0055ff] border-[#0055ff] text-white shadow-md' : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200'}`}>{cat.label}</button>
                      ))}
                    </div>
                  </div>
                  <form onSubmit={handleSendPush} className="space-y-4">
                    <div className="space-y-3 md:space-y-4">
                        <div className="relative group">
                            <input required placeholder="Tytuł powiadomienia..." className="w-full p-4 md:p-5 rounded-2xl bg-zinc-50 border-none font-bold text-sm md:text-base text-zinc-900 outline-none focus:ring-2 ring-[#0055ff] transition-all pr-12" value={pushData.title} onChange={e => setPushData(prev => ({ ...prev, title: e.target.value }))} />
                            <button type="button" onClick={() => setPushData(p => ({ ...p, title: "Pst! Mamy coś nowego! 🧩" }))} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 text-[#0055ff] hover:scale-110 transition-transform cursor-pointer border-none bg-transparent"><Wand2 size={20} /></button>
                        </div>
                        <textarea required placeholder="Treść wiadomości..." rows={4} className="w-full p-4 md:p-5 rounded-2xl bg-zinc-50 border-none font-bold text-zinc-900 outline-none focus:ring-2 ring-[#0055ff] text-sm resize-none" value={pushData.message} onChange={e => setPushData(prev => ({ ...prev, message: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <input type="datetime-local" className="bg-zinc-50 rounded-2xl p-4 border-none font-bold text-xs text-zinc-900" value={pushData.scheduled_for} onChange={e => setPushData(prev => ({ ...prev, scheduled_for: e.target.value }))} />
                      <label className="bg-zinc-50 p-4 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-zinc-100 transition-all border border-dashed border-zinc-200">
                          {uploading ? <Loader2 className="animate-spin text-[#0055ff]" /> : <span className="text-[10px] font-black uppercase text-zinc-400 text-center">{pushData.image_url ? '✅ Zdjęcie gotowe' : 'Dodaj zdjęcie'}</span>}
                          <input type="file" className="hidden" onChange={onPushImageUpload} accept="image/*" />
                      </label>
                    </div>
                    <button disabled={isSendingPush || subscriberCount === 0} className="w-full py-5 md:py-6 bg-[#0055ff] text-white rounded-2xl md:rounded-3xl font-black uppercase tracking-widest md:tracking-[0.2em] shadow-xl hover:bg-blue-700 active:scale-95 transition-all border-none outline-none disabled:opacity-50 cursor-pointer mt-4 italic text-xs md:text-sm">
                      {isSendingPush ? <Loader2 className="animate-spin mx-auto" /> : pushData.scheduled_for ? 'Zaplanuj w kolejce' : `Wyślij do ${subscriberCount} osób 🚀`}
                    </button>
                  </form>
                </section>
              </motion.div>
            )}

            {/* HISTORIA WYSYŁEK */}
            {activeTab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-12">
                <section>
                    <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter mb-4 md:mb-8 flex items-center gap-3 text-[#0055ff]"><Clock size={28} className="md:w-8 md:h-8" /> Zaplanowane</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {scheduledPushes.map(s => (
                        <div key={s.id} className="bg-white p-5 md:p-6 rounded-3xl md:rounded-4xl border border-zinc-100 shadow-sm flex justify-between items-center group">
                        <div>
                            <p className="text-[10px] md:text-[11px] font-black text-[#0055ff] uppercase tracking-widest mb-1">{new Date(s.scheduled_for).toLocaleString()}</p>
                            <h4 className="text-base md:text-lg font-black italic uppercase text-zinc-900 line-clamp-1">{s.title}</h4>
                        </div>
                        <button onClick={() => { supabase.from('push_history').delete().eq('id', s.id); fetchData(); }} className="p-3 md:p-4 text-red-300 hover:text-red-500 border-none bg-transparent cursor-pointer"><Trash2 size={20} className="md:w-6 md:h-6" /></button>
                        </div>
                    ))}
                    {scheduledPushes.length === 0 && <p className="text-zinc-400 font-bold text-sm">Brak zaplanowanych wysyłek.</p>}
                    </div>
                </section>
                <section>
                  <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter mb-4 md:mb-8 flex items-center gap-3 text-zinc-400"><History size={28} className="md:w-8 md:h-8" /> Ostatnie Wysłane</h2>
                  <div className="space-y-3 md:space-y-4">
                    {history.map(h => (
                      <div key={h.id} className="bg-white/60 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                         <div className="flex flex-col gap-1">
                            <span className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase">{new Date(h.created_at).toLocaleString()}</span>
                            <span className="text-base md:text-lg font-black uppercase italic text-zinc-700">{h.title}</span>
                         </div>
                         <div className="text-left sm:text-right"><p className="text-[8px] md:text-[9px] font-black text-zinc-400 uppercase tracking-widest">Wysłano do</p><p className="font-black text-lg md:text-xl text-zinc-900">{h.sent_to_count} osób</p></div>
                      </div>
                    ))}
                    {history.length === 0 && <p className="text-zinc-400 font-bold text-sm">Brak historii wysyłek.</p>}
                  </div>
                </section>
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
                     <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${kuponForm.is_reusable ? 'bg-[#0055ff] border-[#0055ff] text-white' : 'bg-white border-zinc-300 text-transparent'}`}><Repeat size={14} /></div>
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
                         <button key={day.id} type="button" onClick={() => toggleDay(day.id)} className={`w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl font-black text-xs md:text-sm transition-all border-none cursor-pointer ${kuponForm.allowed_days.includes(day.id) ? 'bg-[#0055ff] text-white shadow-md' : 'bg-white text-blue-400 hover:bg-blue-100'}`}>
                           {day.label}
                         </button>
                       ))}
                     </div>
                   </div>
                </div>
                <div>
                  <label className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 md:ml-2 mb-2 block">Kolor Kafelka</label>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {[ 'from-[#0055ff] to-blue-500', 'from-[#BF2024] to-red-500', 'from-amber-400 to-orange-500', 'from-pink-500 to-rose-500', 'from-emerald-500 to-green-500', 'from-zinc-800 to-black' ].map(c => (
                      <button key={c} type="button" onClick={() => setKuponForm(prev => ({...prev, gradient: c}))} className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${c} border-4 transition-all cursor-pointer ${kuponForm.gradient === c ? 'border-zinc-900 scale-110 shadow-lg' : 'border-transparent'}`} />
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

      {/* 🚀 MODAL: NAGRODA W KOLE FORTUNY */}
      <AnimatePresence>
        {isAddingWheelPrize && (
          <div className="fixed inset-0 z-[15000] flex items-center justify-center p-4 md:p-6 bg-zinc-950/80 backdrop-blur-md">
            <motion.form initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} onSubmit={handleSaveWheelPrize} className="bg-white rounded-3xl md:rounded-4xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative text-zinc-900 border border-zinc-100 overflow-y-auto max-h-[90vh]">
              <button type="button" onClick={() => setIsAddingWheelPrize(false)} className="absolute top-4 right-4 md:top-6 md:right-6 text-zinc-400 hover:text-zinc-900 border-none bg-transparent outline-none cursor-pointer"><X size={24} /></button>
              <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter mb-6 md:mb-8 flex items-center gap-3 text-amber-500">
                <CircleDashed size={24} className="md:w-7 md:h-7" /> {wheelForm.id ? 'Edytuj Nagrodę' : 'Nowa Nagroda'}
              </h3>
              <div className="space-y-4 md:space-y-5 mb-6 md:mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 md:ml-2 mb-1 block">Tytuł (Co widzi klient)</label>
                    <input required placeholder="np. Zniżka 10%" className="w-full p-4 rounded-xl md:rounded-2xl bg-zinc-50 border-none font-black text-sm md:text-base text-zinc-900 outline-none focus:ring-2 ring-amber-500" value={wheelForm.title} onChange={e => setWheelForm(prev => ({ ...prev, title: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 md:ml-2 mb-1 block">Szansa Wylosowania (%)</label>
                    <input required type="number" step="0.1" min="0" max="100" placeholder="np. 15" className="w-full p-4 rounded-xl md:rounded-2xl bg-zinc-50 border-none font-black text-sm md:text-base text-zinc-900 outline-none focus:ring-2 ring-amber-500" value={wheelForm.chance} onChange={e => setWheelForm(prev => ({ ...prev, chance: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 md:ml-2 mb-1 block">Krótki opis / warunki</label>
                  <input placeholder="np. Tylko na nieprzecenione zestawy LEGO." className="w-full p-4 rounded-xl md:rounded-2xl bg-zinc-50 border-none font-bold text-sm md:text-base text-zinc-900 outline-none focus:ring-2 ring-amber-500 text-sm" value={wheelForm.description} onChange={e => setWheelForm(prev => ({ ...prev, description: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 md:ml-2 mb-1 block">Prefix Kodu (Baza)</label>
                  <p className="text-[10px] text-zinc-500 mb-2 ml-1">System stworzy z tego unikalny kod np. "BONUS10-A4B9"</p>
                  <input required placeholder="np. BONUS10" className="w-full p-4 rounded-xl md:rounded-2xl bg-zinc-50 border-none font-black text-sm md:text-base text-zinc-900 outline-none focus:ring-2 ring-amber-500 uppercase tracking-widest" value={wheelForm.code_prefix} onChange={e => setWheelForm(prev => ({ ...prev, code_prefix: e.target.value.toUpperCase() }))} />
                </div>
                <div>
                  <label className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 md:ml-2 mb-2 block">Kolor w Kole</label>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {[ 'from-[#0055ff] to-blue-500', 'from-[#BF2024] to-red-500', 'from-amber-400 to-orange-500', 'from-pink-500 to-rose-500', 'from-emerald-500 to-green-500', 'from-zinc-800 to-black' ].map(c => (
                      <button key={c} type="button" onClick={() => setWheelForm(prev => ({...prev, gradient: c}))} className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${c} border-4 transition-all cursor-pointer ${wheelForm.gradient === c ? 'border-zinc-900 scale-110 shadow-lg' : 'border-transparent'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-4 md:py-5 bg-amber-500 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest md:tracking-[0.2em] shadow-xl hover:bg-amber-600 transition-all border-none outline-none active:scale-95 cursor-pointer italic text-xs md:text-sm">
                  Zapisz Nagrodę 🎡
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: NOWA PROMOCJA --- */}
      <AnimatePresence>
        {isAddingPromo && (
          <div className="fixed inset-0 z-[15000] flex items-center justify-center p-4 md:p-6 bg-zinc-950/80 backdrop-blur-md">
            <motion.form initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} onSubmit={handleAddPromo} className="bg-white rounded-3xl md:rounded-4xl p-6 md:p-12 max-w-2xl w-full shadow-2xl relative text-zinc-900 border border-zinc-100 overflow-y-auto max-h-[90vh]">
              <button type="button" onClick={() => setIsAddingPromo(false)} className="absolute top-4 right-4 md:top-8 md:right-8 text-zinc-400 hover:text-zinc-900 border-none bg-transparent outline-none cursor-pointer p-2"><X size={24} className="md:w-8 md:h-8" /></button>
              <h3 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter mb-6 md:mb-10 flex items-center gap-3 text-[#BF2024]"><Flame size={28} className="md:w-8 md:h-8" /> Nowa Okazja</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                <input required placeholder="Nazwa produktu..." className="md:col-span-2 w-full p-4 md:p-5 rounded-xl md:rounded-2xl bg-zinc-50 border-none font-bold text-sm md:text-base text-zinc-900 outline-none focus:ring-2 ring-red-500" value={promoForm.title} onChange={e => setPromoForm(prev => ({ ...prev, title: e.target.value }))} />
                <div className="md:col-span-2">
                    <label className="flex items-center justify-center w-full h-24 md:h-32 transition bg-zinc-50 border-2 border-zinc-200 border-dashed rounded-xl md:rounded-2xl cursor-pointer hover:border-red-400">
                        {uploading ? (
                            <Loader2 className="animate-spin text-red-500" />
                        ) : promoForm.image_url ? (
                            <div className="flex items-center gap-4">
                                <img src={promoForm.image_url} alt="Podgląd" className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg md:rounded-xl shadow-md" />
                                <span className="text-[10px] md:text-xs font-black uppercase text-green-600 tracking-widest">✅ Zdjęcie Wybrane</span>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                                <ImageIcon className="text-zinc-300" />
                                <span className="text-[9px] md:text-[10px] font-black uppercase text-zinc-400 tracking-widest text-center">Kliknij by dodać zdjęcie produktu</span>
                            </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={onPromoImageUpload} />
                    </label>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 md:ml-2 mb-1 block">Kategoria produktu</label>
                  {!isCustomCategory ? (
                    <div className="relative">
                      <select className="w-full p-4 md:p-5 rounded-xl md:rounded-2xl bg-zinc-50 font-black border-none outline-none text-sm md:text-base text-zinc-900 cursor-pointer appearance-none" value={promoForm.category} onChange={e => { if (e.target.value === "INNA") { setIsCustomCategory(true); setPromoForm(prev => ({ ...prev, category: '' })); } else { setPromoForm(prev => ({ ...prev, category: e.target.value })); } }}>
                        <option value="Zabawki">Zabawki</option>
                        <option value="LEGO">LEGO</option>
                        <option value="Szkoła">Szkoła</option>
                        <option value="Sala Zabaw">Sala Zabaw</option>
                        <option value="INNA" className="text-blue-600 font-bold">➕ Własna / Inna...</option>
                      </select>
                      <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400"><ChevronDown size={18} /></div>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative">
                      <input autoFocus placeholder="Wpisz nazwę nowej kategorii..." className="w-full p-4 md:p-5 rounded-xl md:rounded-2xl bg-white border-2 border-blue-500 font-black outline-none text-sm md:text-base text-zinc-900 shadow-[0_0_15px_rgba(0,85,255,0.1)]" value={promoForm.category} onChange={e => setPromoForm(prev => ({ ...prev, category: e.target.value }))} />
                      <button type="button" onClick={() => { setIsCustomCategory(false); setPromoForm(prev => ({ ...prev, category: 'Zabawki' })); }} className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-lg md:rounded-xl transition-all cursor-pointer border-none"><X size={16} strokeWidth={3} /></button>
                    </motion.div>
                  )}
                </div>
                <input placeholder="Rabat (np. -20%)" className="w-full p-4 md:p-5 rounded-xl md:rounded-2xl bg-zinc-50 border-none outline-none font-black text-sm md:text-base text-zinc-900 focus:ring-2 ring-red-500" value={promoForm.discount} onChange={e => setPromoForm(prev => ({ ...prev, discount: e.target.value }))} />
                <div className="space-y-1 md:space-y-1.5"><label className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 md:ml-2">Stara Cena (zł)</label><input required placeholder="0.00" className="w-full p-4 rounded-xl md:rounded-2xl bg-zinc-50 border-none font-black text-sm md:text-base text-zinc-900 outline-none" value={promoForm.old_price} onChange={e => setPromoForm(prev => ({ ...prev, old_price: e.target.value }))} /></div>
                <div className="space-y-1 md:space-y-1.5"><label className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 md:ml-2">Cena Promocyjna (zł)</label><input required placeholder="0.00" className="w-full p-4 rounded-xl md:rounded-2xl bg-zinc-50 border-none font-black text-sm md:text-base text-zinc-900 outline-none focus:ring-2 ring-green-500" value={promoForm.new_price} onChange={e => setPromoForm(prev => ({ ...prev, new_price: e.target.value }))} /></div>
              </div>
              <button type="submit" disabled={uploading} className="w-full py-5 md:py-6 bg-zinc-900 text-white rounded-2xl md:rounded-3xl font-black uppercase tracking-widest md:tracking-[0.2em] shadow-xl hover:bg-red-600 transition-all border-none outline-none active:scale-95 cursor-pointer italic disabled:opacity-50 text-xs md:text-sm">
                  {uploading ? 'Wgrywanie...' : 'Opublikuj Teraz 🔥'}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white border-none shadow-md rounded-3xl p-6 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-current opacity-5 -mr-6 -mt-6 rounded-full blur-xl ${color}`} />
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className={`p-3 rounded-2xl bg-zinc-50 ${color} group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
        </div>
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1 relative z-10">{title}</p>
        <h3 className="text-3xl font-black tracking-tighter text-zinc-900 relative z-10">{value.toLocaleString()}</h3>
    </div>
  )
}