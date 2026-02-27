'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend, AreaChart, Area 
} from 'recharts'
import { Users, Ticket, Gamepad2, Zap, CircleDashed, TrendingUp, MousePointer2, Loader2, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboard() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCoupons: 0,
    usedCoupons: 0,
    totalExperience: 0,
    todaySpins: 0,
    avgExperience: 0
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [wheelStats, setWheelStats] = useState<any[]>([])

  useEffect(() => {
    fetchAllData()

    const channel = supabase
      .channel('admin-pro-monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loyalty_cards' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kupony' }, () => fetchAllData())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const fetchAllData = async () => {
    try {
      // 1. Podstawowe metryki użytkowników
      const { data: loyaltyData, count: userCount } = await supabase
        .from('loyalty_cards')
        .select('experience', { count: 'exact' })

      // 2. Kupony: Aktywne vs Wykorzystane
      const { data: coupons, count: activeCount } = await supabase
        .from('kupony')
        .select('title, current_usage, user_id, created_at')
        .eq('is_active', true)

      // Wykorzystane kupony = suma wszystkich użyć (current_usage) w bazie
      const totalUsed = coupons?.reduce((acc, curr) => acc + (curr.current_usage || 0), 0) || 0

      // 3. Statystyki Koła Fortuny (losowania z dzisiaj)
      const today = new Date()
      today.setHours(0,0,0,0)
      const spinsToday = coupons?.filter(k => k.user_id && new Date(k.created_at) >= today).length || 0

      // 4. Rozkład nagród w Kole
      const distributionMap: any = {}
      coupons?.filter(k => k.user_id).forEach(p => {
        distributionMap[p.title] = (distributionMap[p.title] || 0) + 1
      })
      const formattedWheelData = Object.entries(distributionMap).map(([name, value]) => ({ name, value }))

      // 5. Trendy 7 dni (generowanie kuponów)
      const chartMap = new Map()
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i)
        chartMap.set(d.toLocaleDateString('pl-PL', { weekday: 'short' }), 0)
      }
      coupons?.forEach(c => {
        const day = new Date(c.created_at).toLocaleDateString('pl-PL', { weekday: 'short' })
        if (chartMap.has(day)) chartMap.set(day, chartMap.get(day) + 1)
      })

      const totalExp = loyaltyData?.reduce((acc, curr) => acc + (curr.experience || 0), 0) || 0

      setStats({
        totalUsers: userCount || 0,
        activeCoupons: activeCount || 0,
        usedCoupons: totalUsed,
        totalExperience: totalExp,
        todaySpins: spinsToday,
        avgExperience: userCount ? Math.floor(totalExp / userCount) : 0
      })
      setChartData(Array.from(chartMap, ([name, aktywnosc]) => ({ name, aktywnosc })))
      setWheelStats(formattedWheelData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        <p className="text-zinc-900 dark:text-white font-black uppercase tracking-tighter animate-pulse">Synchronizacja danych Urwisa...</p>
      </div>
    </div>
  )

  return (
    <div className="relative z-[9998] p-4 md:p-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      
      {/* NAGŁÓWEK ZEROWY */}
      <header className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-3 text-zinc-900 dark:text-white">
            <Zap className="text-amber-500 fill-amber-500" /> Live <span className="text-indigo-600">Urwis</span> Monitoring
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-bold">Analityka lojalnościowa i wydajność promocji.</p>
        </div>
        
        <div className="flex items-center gap-6 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
           <div className="text-center px-2">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Dziś w Kole</p>
              <p className="text-3xl font-black text-indigo-600">{stats.todaySpins}</p>
           </div>
           <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-800" />
           <div className="text-center px-2">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Avg XP / User</p>
              <p className="text-3xl font-black text-emerald-500">{stats.avgExperience}</p>
           </div>
        </div>
      </header>

      {/* 📊 KLUCZOWE WSKAŹNIKI (KPI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Klienci (PWA)" value={stats.totalUsers} icon={<Users />} color="text-blue-500" trend="Łączna baza" />
        <StatCard title="Aktywne Kupony" value={stats.activeCoupons} icon={<Ticket />} color="text-amber-500" trend="Oczekujące" />
        <StatCard title="Zrealizowane" value={stats.usedCoupons} icon={<CheckCircle />} color="text-emerald-500" trend="Sukces przy kasie" />
        <StatCard title="Aktywność (XP)" value={stats.totalExperience} icon={<TrendingUp />} color="text-violet-500" trend="Zaangażowanie" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* WYKRES 1: LINIOWY - POPULARNOŚĆ W CZASIE */}
        <Card className="lg:col-span-2 border-none shadow-2xl bg-white dark:bg-zinc-900 overflow-hidden">
          <CardHeader className="border-b border-zinc-50 dark:border-zinc-800/50 p-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Ilość wygenerowanych nagród (7 dni)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAktywnosc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'currentColor', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'currentColor', fontSize: 12, fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '16px', color: '#fff' }}
                  itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Area 
                  name="Nowe kupony na kontach"
                  type="monotone" 
                  dataKey="aktywnosc" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorAktywnosc)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* WYKRES 2: KOŁOWY - ROZKŁAD NAGRÓD */}
        <Card className="border-none shadow-2xl bg-white dark:bg-zinc-900 overflow-hidden">
          <CardHeader className="border-b border-zinc-50 dark:border-zinc-800/50 p-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <MousePointer2 className="w-4 h-4 text-amber-500" /> Skuteczność Koła Fortuny
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={wheelStats} 
                    innerRadius={70} 
                    outerRadius={100} 
                    paddingAngle={8} 
                    dataKey="value"
                  >
                    {wheelStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* LEGENDA DLA KOŁA */}
            <div className="mt-6 space-y-3">
               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center mb-4">Podział wygranych nagród</p>
               {wheelStats.map((s, i) => (
                 <div key={s.name} className="flex items-center justify-between text-xs font-black">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                      <span className="opacity-80 dark:text-zinc-200 truncate max-w-[140px] uppercase italic">{s.name}</span>
                    </div>
                    <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">{s.value} szt.</span>
                 </div>
               ))}
               {wheelStats.length === 0 && (
                 <p className="text-center text-xs text-zinc-400 font-bold italic py-4">Oczekiwanie na pierwsze losowania...</p>
               )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, trend }: any) {
  return (
    <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 hover:scale-[1.03] transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 ${color} group-hover:scale-110 transition-transform`}>
            {React.cloneElement(icon, { size: 28 })}
          </div>
          <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-tighter shadow-sm">Live Sync</span>
        </div>
        <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-1">{title}</p>
        <h3 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white">{value.toLocaleString()}</h3>
        <p className="text-[10px] font-bold text-zinc-400 mt-4 italic">{trend}</p>
      </CardContent>
    </Card>
  )
}