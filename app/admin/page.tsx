'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, X, Lock, Tag, LogOut, Loader2,
  Bell, Send, Wand2, Clock, Zap, Flame,
  Image as ImageIcon, Coffee, LayoutDashboard, History, ChevronRight
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
  const [activeTab, setActiveTab] = useState<'stats' | 'promos' | 'push' | 'history'>('stats')

  // --- STATE: DATA ---
  const [promos, setPromos] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [scheduledPushes, setScheduledPushes] = useState<any[]>([])
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [totalSubscriberCount, setTotalSubscriberCount] = useState(0)
  const [totalSentPushes, setTotalSentPushes] = useState(0) // ✅ NOWY STAN: Łączna liczba wysłanych powiadomień
  const [pushStats, setPushStats] = useState({ clicks: 0, closes: 0 })
  const [loading, setLoading] = useState(false)

  // --- STATE: FORMS ---
  const [isAddingPromo, setIsAddingPromo] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isSendingPush, setIsSendingPush] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<PushTopic>('wszystkie')
  const [pushData, setPushData] = useState({ title: '', message: '', image_url: '', scheduled_for: '' })
  const [promoForm, setPromoForm] = useState({ title: '', old_price: '', new_price: '', discount: '', category: 'Zabawki', expires_at: '' })

  // --- POBIERANIE DANYCH ---
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // ✅ Dodajemy zapytanie pobierające WSZYSTKIE wysłane powiadomienia, by zsumować ilość dostarczeń
      const [pRes, hRes, sRes, aRes, allHistRes] = await Promise.all([
        supabase.from('promocje').select('*').order('created_at', { ascending: false }),
        supabase.from('push_history').select('*').eq('status', 'sent').order('created_at', { ascending: false }).limit(10),
        supabase.from('push_history').select('*').eq('status', 'scheduled').order('scheduled_for', { ascending: true }),
        supabase.from('push_analytics').select('action'),
        supabase.from('push_history').select('sent_to_count').eq('status', 'sent') // Pobieramy tylko liczniki dla CTR
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

      // ✅ Obliczanie sumy wszystkich historycznych dostarczeń dla CTR
      if (allHistRes?.data) {
        const totalSent = allHistRes.data.reduce((sum, item) => sum + (item.sent_to_count || 0), 0)
        setTotalSentPushes(totalSent)
      }

      let query = supabase.from('push_subscriptions').select('*', { count: 'exact', head: true })
      if (selectedTopic !== 'wszystkie') {
        query = query.or(`topics.cs.{"${selectedTopic}"},topics.cs.{"wszystkie"}`)
      }
      const { count } = await query
      setSubscriberCount(count || 0)

      const { count: totalCount } = await supabase.from('push_subscriptions').select('*', { count: 'exact', head: true })
      setTotalSubscriberCount(totalCount || 0)

    } catch (error) {
      console.error('Błąd bazy danych:', error)
      toast.error('Brak dostępu do niektórych danych.')
    } finally {
      setLoading(false)
    }
  }, [supabase, selectedTopic])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, fetchData])

  // --- HANDLERY ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'URWIS2026') {
      setIsAuthenticated(true)
    } else {
      toast.error('Hasło niepoprawne!')
    }
  }

  const handleDeletePromo = async (id: string) => {
    if (confirm('Usunąć tę ofertę na stałe?')) {
      const { error } = await supabase.from('promocje').delete().eq('id', id)
      if (error) return toast.error('Błąd usuwania')
      toast.success('Usunięto')
      fetchData()
    }
  }

  const handleDeleteScheduled = async (id: string) => {
    const { error } = await supabase.from('push_history').delete().eq('id', id)
    if (error) return toast.error('Błąd usuwania')
    toast.success('Usunięto zaplanowaną wysyłkę')
    fetchData()
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
      setIsAddingPromo(false)
      setPromoForm({ title: '', old_price: '', new_price: '', discount: '', category: 'Zabawki', expires_at: '' })
      toast.success('Promocja dodana!')
      fetchData()
    } else {
      toast.error('Błąd dodawania promocji')
    }
  }

  const setQuickExpiry = (hours: number) => {
    const d = new Date()
    d.setHours(d.getHours() + hours)
    setPromoForm(prev => ({ ...prev, expires_at: d.toISOString().slice(0, 16) }))
    toast.success(`Wygaśnie za ${hours}h`)
  }

  const applyTemplate = (t: typeof QUICK_TEMPLATES[0]) => {
    setPushData(prev => ({ ...prev, title: t.title, message: t.message }))
    setSelectedTopic(t.topic)
    toast.success(`Wczytano: ${t.label}`)
  }

  const generateUrwisTalk = () => {
    const phrases = ['Pst! Zobacz nowości!', 'Urwis melduje okazję!', 'Hej! Wpadniesz sprawdzić?', 'Hop! Mamy coś ekstra!']
    setPushData(prev => ({ ...prev, title: phrases[Math.floor(Math.random() * phrases.length)] }))
    toast.success('🪄 Urwis podpowiedział hasło!')
  }

  async function onImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `broadcasts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    
    const { error } = await supabase.storage.from('push-images').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('push-images').getPublicUrl(path)
      setPushData(prev => ({ ...prev, image_url: data.publicUrl }))
      toast.success('Zdjęcie wgrane!')
    } else {
      toast.error('Błąd wgrywania zdjęcia')
    }
    setUploading(false)
  }

  async function handleSendPush(e: React.FormEvent) {
    e.preventDefault()
    if (subscriberCount === 0) return toast.error('Brak odbiorców!')
    setIsSendingPush(true)
    try {
      if (pushData.scheduled_for) {
        const { error } = await supabase.from('push_history').insert([{
          ...pushData,
          topic: selectedTopic,
          status: 'scheduled',
          sent_to_count: subscriberCount
        }])
        if (error) throw error
        toast.success('Zaplanowano wysyłkę!')
      } else {
        const res = await fetch('/api/push/send-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...pushData, topic: selectedTopic })
        })
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
        toast.success('Wysłano powiadomienia!')
      }
      setPushData({ title: '', message: '', image_url: '', scheduled_for: '' })
      fetchData()
    } catch (error) {
      console.error('Błąd wysyłki:', error)
      toast.error('Błąd wysyłki, spróbuj ponownie.')
    } finally {
      setIsSendingPush(false)
    }
  }

  // --- EKRAN LOGOWANIA ---
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-100 text-black">
        <div className="bg-white p-10 rounded-4xl shadow-2xl border border-gray-200 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl"><Lock size={32} /></div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900 mb-8">Admin Urwis</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Wpisz hasło..." 
              className="w-full p-5 rounded-2xl bg-gray-100 border border-gray-200 text-center font-black text-black text-xl focus:ring-2 ring-blue-500 outline-none" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              autoFocus 
            />
            <button className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg outline-none border-none cursor-pointer">
              Zaloguj się
            </button>
          </form>
        </div>
      </div>
    )
  }

  // --- EKRAN GŁÓWNY (DASHBOARD) ---
  return (
    <div className="fixed inset-0 z-[9999] bg-gray-50 flex text-gray-900 overflow-hidden">

      {/* --- MENU BOCZNE --- */}
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

      {/* --- ZAWARTOŚĆ --- */}
      <main className="flex-1 h-full overflow-y-auto p-10">
        <div className="max-w-6xl mx-auto">
          
          {/* WIDOK: STATYSTYKI */}
          {activeTab === 'stats' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Przegląd Systemu</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-4xl shadow-sm border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Baza Odbiorców</p>
                  <p className="text-4xl font-black text-blue-600">{totalSubscriberCount}</p>
                </div>
                {/* ✅ NOWY KAFELEK: WYSLANE POWIADOMIENIA (IMPRESJE) */}
                <div className="bg-white p-8 rounded-4xl shadow-sm border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Wysłane (Impresje)</p>
                  <p className="text-4xl font-black text-gray-900">{totalSentPushes}</p>
                </div>
                <div className="bg-white p-8 rounded-4xl shadow-sm border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Kliknięcia (Razem)</p>
                  <p className="text-4xl font-black text-green-500">{pushStats.clicks}</p>
                </div>
                <div className="bg-white p-8 rounded-4xl shadow-sm border border-gray-100 relative overflow-hidden">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Skuteczność CTR</p>
                  {/* ✅ POPRAWIONA MATEMATYKA: (Kliknięcia / Wysłane powiadomienia) * 100 */}
                  <p className="text-4xl font-black text-orange-500 relative z-10">
                    {totalSentPushes > 0 ? Math.round((pushStats.clicks / totalSentPushes) * 100) : 0}%
                  </p>
                </div>
              </div>

              <div className="bg-blue-600 p-10 rounded-4xl text-white shadow-xl flex items-center justify-between overflow-hidden relative">
                <div className="relative z-10">
                  <h3 className="text-2xl font-black italic uppercase mb-2">Witaj w Centrum Dowodzenia!</h3>
                  <p className="opacity-80 font-medium max-w-md text-sm">Z tego miejsca zarządzasz promocjami na stronie głównej oraz wysyłasz powiadomienia do telefonów swoich klientów.</p>
                </div>
                <Zap size={140} className="absolute right-10 opacity-20 rotate-12" />
              </div>
            </div>
          )}

          {/* WIDOK: PROMOCJE */}
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
                      {p.expires_at && <p className="text-[9px] font-black uppercase text-orange-500 mt-2 flex items-center gap-1"><Clock size={12} /> Wygasa: {new Date(p.expires_at).toLocaleString('pl-PL')}</p>}
                    </div>
                    <button onClick={() => handleDeletePromo(p.id)} className="p-4 bg-red-50 text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all border-none hover:bg-red-600 hover:text-white outline-none cursor-pointer"><Trash2 size={20} /></button>
                  </div>
                ))}
                {(!promos || promos.length === 0) && !loading && <p className="text-gray-400 italic col-span-2 py-10 text-center">Brak dodanych promocji.</p>}
              </div>
            </div>
          )}

          {/* WIDOK: KREATOR PUSH */}
          {activeTab === 'push' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-8">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Wysyłka Push</h2>
                <section className="bg-white p-8 rounded-4xl shadow-xl border border-gray-100 space-y-6">

                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {QUICK_TEMPLATES.map(t => (
                      <button key={t.id} onClick={() => applyTemplate(t)} className="flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all border-none outline-none shrink-0 cursor-pointer">
                        <div className={`${t.color} p-2 rounded-xl text-white`}><t.icon size={16} /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">{t.label}</span>
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSendPush} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-gray-400 ml-4">Do kogo wysyłamy?</label>
                      <div className="grid grid-cols-1 gap-2">
                        {PUSH_CATEGORIES.map(cat => (
                          <button key={cat.id} type="button" onClick={() => setSelectedTopic(cat.id)} className={`py-4 rounded-xl text-xs font-black uppercase transition-all border-2 border-solid outline-none cursor-pointer ${selectedTopic === cat.id ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <input required placeholder="Tytuł..." className="w-full p-5 rounded-2xl bg-gray-50 border-none font-bold text-black outline-none focus:ring-2 ring-blue-500" value={pushData.title} onChange={e => setPushData(prev => ({ ...prev, title: e.target.value }))} />
                        <Wand2 className="absolute right-5 top-5 text-gray-400 cursor-pointer hover:text-blue-500" onClick={generateUrwisTalk} />
                      </div>
                      <textarea required placeholder="Treść..." rows={3} className="w-full p-5 rounded-2xl bg-gray-50 border-none font-bold text-black outline-none focus:ring-2 ring-blue-500 text-sm" value={pushData.message} onChange={e => setPushData(prev => ({ ...prev, message: e.target.value }))} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl flex flex-col gap-1">
                        <label className="text-[8px] font-black uppercase text-gray-400">📅 Zaplanuj</label>
                        <input type="datetime-local" className="bg-transparent border-none font-bold text-[10px] outline-none text-black mt-1 cursor-pointer" value={pushData.scheduled_for} onChange={e => setPushData(prev => ({ ...prev, scheduled_for: e.target.value }))} />
                      </div>
                      <label className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all group">
                        {uploading ? <Loader2 className="animate-spin text-blue-600" /> : <><ImageIcon size={20} className="text-gray-400 group-hover:text-blue-600" /><span className="text-[8px] font-black uppercase text-gray-400 mt-1">Dodaj Foto</span></>}
                        <input type="file" className="hidden" onChange={onImageUpload} accept="image/*" />
                      </label>
                    </div>

                    <button disabled={isSendingPush || subscriberCount === 0} className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 active:scale-95 transition-all border-none outline-none disabled:opacity-50 cursor-pointer">
                      {isSendingPush ? <Loader2 className="animate-spin mx-auto" /> : <><Send size={18} className="inline mr-2" />{pushData.scheduled_for ? 'Zaplanuj wysyłkę' : `Wyślij do ${subscriberCount} osób`}</>}
                    </button>
                  </form>
                </section>
              </div>

              {/* Podgląd telefonu */}
              <div className="flex items-center justify-center mt-12 lg:mt-0">
                <div className="relative w-72 h-[550px] bg-gray-900 rounded-[3rem] border-[10px] border-gray-800 shadow-2xl p-4 flex flex-col">
                  <div className="w-24 h-5 bg-gray-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl" />
                  <div className="mt-16 flex-1">
                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-lg border border-white relative overflow-hidden">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                          <img src="/logo.png" className="w-6 h-6 object-contain" alt="Logo" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[11px] font-bold truncate pr-2 text-black">{pushData.title || 'Tytuł...'}</span>
                            <span className="text-[8px] text-gray-400 font-bold uppercase">teraz</span>
                          </div>
                          <p className="text-[10px] text-gray-600 leading-tight line-clamp-2">{pushData.message || 'Twoja wiadomość...'}</p>
                        </div>
                      </div>
                      {pushData.image_url && (
                        <div className="mt-3 rounded-xl overflow-hidden h-28 w-full bg-gray-200 shadow-inner">
                          <img src={pushData.image_url} className="w-full h-full object-cover" alt="Push preview" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WIDOK: HISTORIA I KOLEJKA */}
          {activeTab === 'history' && (
            <div className="space-y-10">
              <section>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3 text-blue-600"><Clock size={32} /> Zaplanowane Psoty</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {scheduledPushes?.map(s => (
                    <div key={s.id} className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm flex justify-between items-center">
                      <div>
                        <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-1">
                          {s.scheduled_for ? new Date(s.scheduled_for).toLocaleString('pl-PL') : ''}
                        </p>
                        <h4 className="text-lg font-black italic uppercase text-gray-900 line-clamp-1">{s.title}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{s.message}</p>
                      </div>
                      <button onClick={() => handleDeleteScheduled(s.id)} className="p-4 text-red-400 hover:text-red-600 border-none bg-transparent transition-colors cursor-pointer outline-none"><Trash2 size={24} /></button>
                    </div>
                  ))}
                  {(!scheduledPushes || scheduledPushes.length === 0) && <p className="text-gray-400 italic py-10 text-center col-span-2">Brak zaplanowanych wysyłek.</p>}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 text-gray-400">Archiwum wysyłek</h2>
                <div className="space-y-4">
                  {history?.map(h => (
                    <div key={h.id} className="bg-white p-5 rounded-3xl border border-gray-100 flex gap-5 items-center">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                        {h.image_url
                          ? <img src={h.image_url} className="w-full h-full object-cover" alt="img" />
                          : <Bell className="text-gray-300" size={24} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-base font-bold text-gray-800 truncate">{h.title}</h4>
                          <span className="text-[10px] font-bold text-gray-400 shrink-0 ml-2">
                            {h.created_at ? new Date(h.created_at).toLocaleDateString('pl-PL') : ''}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase font-black">{h.topic} • wysłano do {h.sent_to_count} urządzeń</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

    {/* MODAL: NOWA PROMOCJA */}
    <AnimatePresence>
        {isAddingPromo && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.form
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              onSubmit={handleAddPromo}
              className="bg-white rounded-[3.5rem] p-12 max-w-2xl w-full shadow-2xl relative text-black"
            >
              <button type="button" onClick={() => setIsAddingPromo(false)} className="absolute top-10 right-10 text-gray-400 hover:text-gray-900 border-none bg-transparent outline-none cursor-pointer">
                <X size={32} />
              </button>
              
              <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-10 flex items-center gap-3 text-blue-600">
                <Flame size={32} /> Nowa Okazja
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-black">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-4">Produkt / Tytuł</label>
                  <input required placeholder="np. Klocki LEGO" className="w-full p-5 rounded-2xl bg-gray-50 border-none font-bold text-black outline-none focus:ring-2 ring-blue-500" value={promoForm.title} onChange={e => setPromoForm(prev => ({ ...prev, title: e.target.value }))} />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-4">Kategoria</label>
                  <select className="w-full p-5 rounded-2xl bg-gray-50 font-bold border-none outline-none text-black cursor-pointer" value={promoForm.category} onChange={e => setPromoForm(prev => ({ ...prev, category: e.target.value }))}>
                    <option>Zabawki</option>
                    <option>Sala Zabaw</option>
                    <option>LEGO</option>
                    <option>Imprezy</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-4">Rabat</label>
                  <input placeholder="-20% / HIT" className="w-full p-5 rounded-2xl bg-gray-50 border-none outline-none font-bold text-black" value={promoForm.discount} onChange={e => setPromoForm(prev => ({ ...prev, discount: e.target.value }))} />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-4">Stara Cena</label>
                  <input required placeholder="99.00" className="w-full p-5 rounded-2xl bg-gray-50 border-none font-bold text-black outline-none" value={promoForm.old_price} onChange={e => setPromoForm(prev => ({ ...prev, old_price: e.target.value }))} />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-4">Nowa Cena</label>
                  <input required placeholder="79.00" className="w-full p-5 rounded-2xl bg-gray-50 border-none font-bold text-black outline-none" value={promoForm.new_price} onChange={e => setPromoForm(prev => ({ ...prev, new_price: e.target.value }))} />
                </div>

                <div className="md:col-span-2 space-y-3 p-8 bg-gray-50 rounded-4xl border border-gray-200 text-center mt-2">
                  <label className="text-[9px] font-black uppercase text-gray-500 italic flex items-center justify-center gap-2 mb-2">
                    <Clock size={12} /> Czas Trwania (Gorący Strzał)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 3, 24].map(h => (
                      <button key={h} type="button" onClick={() => setQuickExpiry(h)} className="py-4 rounded-xl bg-gray-900 text-white font-black text-[10px] uppercase hover:bg-orange-500 transition-all border-none outline-none cursor-pointer">+{h}h</button>
                    ))}
                  </div>
                  <input type="datetime-local" className="w-full p-4 rounded-xl bg-white border-none font-bold text-xs mt-3 text-center text-black outline-none cursor-pointer" value={promoForm.expires_at} onChange={e => setPromoForm(prev => ({ ...prev, expires_at: e.target.value }))} />
                </div>
              </div>

              <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 transition-all border-none outline-none active:scale-95 cursor-pointer">
                Dodaj i publikuj na stronie
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}