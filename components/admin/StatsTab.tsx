'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Zap, Users, TicketPercent, CheckCircle2, TrendingUp, MousePointer2, CircleDashed, Loader2, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, AreaChart, Area } from 'recharts'
import { COLORS } from '@/lib/admin-utils'

export function StatsTab() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const fetchStats = async () => {
    setIsRefreshing(true);
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      setIsRefreshing(false);
      return;
    }
    
    const [allCouponsRes, pushSubsRes] = await Promise.all([
      supabase.from('kupony').select('title, current_usage, user_id, created_at, is_active'),
      supabase.from('push_subscriptions').select('*', { count: 'exact', head: true })
    ]);

    const allCoupons = allCouponsRes?.data || [];
    const totalUsed = allCoupons.reduce((acc: any, curr: any) => acc + (curr.current_usage || 0), 0);
    const activeGlobal = allCoupons.filter((k: any) => k.is_active && !k.user_id).length;

    const today = new Date(); today.setHours(0,0,0,0);
    const spinsToday = allCoupons.filter((k: any) => k.user_id && new Date(k.created_at) >= today).length;

    const distributionMap: any = {};
    allCoupons.filter((k: any) => k.user_id).forEach((p: any) => { distributionMap[p.title] = (distributionMap[p.title] || 0) + 1 });
    const wheelStats = Object.entries(distributionMap).map(([name, value]) => ({ name, value }));

    const chartMap = new Map();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      chartMap.set(d.toLocaleDateString('pl-PL', { weekday: 'short' }), 0);
    }
    allCoupons.forEach((c: any) => {
      const day = new Date(c.created_at).toLocaleDateString('pl-PL', { weekday: 'short' });
      if (chartMap.has(day)) chartMap.set(day, chartMap.get(day) + 1);
    });

    const wheelSpinsByDay = new Map();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      wheelSpinsByDay.set(d.toLocaleDateString('pl-PL', { weekday: 'short' }), 0);
    }
    allCoupons.filter((k: any) => k.user_id).forEach((c: any) => {
      const day = new Date(c.created_at).toLocaleDateString('pl-PL', { weekday: 'short' });
      if (wheelSpinsByDay.has(day)) wheelSpinsByDay.set(day, wheelSpinsByDay.get(day) + 1);
    });

    setStats({
      todaySpins: spinsToday,
      avgExperience: 0,
      totalSubscriberCount: pushSubsRes?.count || 0,
      activeGlobalCoupons: activeGlobal,
      usedCoupons: totalUsed,
      totalExperience: 0,
      chartData: Array.from(chartMap, ([name, aktywnosc]) => ({ name, aktywnosc })),
      wheelStats,
      wheelDailyChart: Array.from(wheelSpinsByDay, ([name, spins]) => ({ name, spins }))
    });
    setLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
    // 🟢 Realtime dla Bazy PWA i Kuponów w tle
    const supabase = createClient();
    if (supabase) {
      const channel = supabase.channel('stats-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'push_subscriptions' }, fetchStats)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'kupony' }, fetchStats)
        .subscribe();

      return () => { supabase.removeChannel(channel); }
    }
  }, []);

  if (loading) return <div className="flex justify-center mt-32"><Loader2 className="w-10 h-10 animate-spin text-[#0055ff]" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase flex items-center gap-3 text-zinc-900">
            <Zap className="text-amber-500 fill-amber-500" /> Analityka <span className="text-[#0055ff]">Live</span>
          </h1>
          <p className="text-zinc-500 mt-1 font-bold">Wydajność grywalizacji i PWA.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchStats} className="p-3 bg-white border border-zinc-200 shadow-sm rounded-2xl text-zinc-500 hover:text-[#0055ff] hover:bg-blue-50 transition-all cursor-pointer flex items-center gap-2 font-bold text-sm">
             <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} /> Odśwież
          </button>
          <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="text-center px-4"><p className="text-[10px] font-bold text-zinc-400 uppercase">Dziś w Kole</p><p className="text-2xl font-black text-[#0055ff]">{stats.todaySpins}</p></div>
            <div className="w-px h-10 bg-zinc-200" />
            <div className="text-center px-4"><p className="text-[10px] font-bold text-zinc-400 uppercase">Avg XP / User</p><p className="text-2xl font-black text-emerald-500">{stats.avgExperience}</p></div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Baza PWA / Push" value={stats.totalSubscriberCount} icon={<Users />} color="text-blue-500" />
        <StatCard title="Aktywne Promocje" value={stats.activeGlobalCoupons} icon={<TicketPercent />} color="text-amber-500" />
        <StatCard title="Zrealizowane Kupony" value={stats.usedCoupons} icon={<CheckCircle2 />} color="text-emerald-500" />
        <StatCard title="Dziś w Kole Fortuny" value={stats.todaySpins} icon={<CircleDashed />} color="text-violet-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-zinc-100 shadow-md">
          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-700 mb-6"><TrendingUp className="w-4 h-4 text-[#0055ff]" /> Generowanie Kuponów (7 dni)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorAktywnosc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0055ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#0055ff" stopOpacity={0}/></linearGradient>
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
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-md flex flex-col">
          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-700 mb-6"><MousePointer2 className="w-4 h-4 text-amber-500" /> Rozkład Nagród</h3>
          <div className="h-[200px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.wheelStats} innerRadius={50} outerRadius={80} paddingAngle={8} dataKey="value">
                  {stats.wheelStats.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white border-none shadow-md rounded-3xl p-6 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-current opacity-5 -mr-6 -mt-6 rounded-full blur-xl ${color}`} />
        <div className="flex items-center justify-between mb-4 relative z-10"><div className={`p-3 rounded-2xl bg-zinc-50 ${color} group-hover:scale-110 transition-transform`}>{icon}</div></div>
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1 relative z-10">{title}</p>
        <h3 className="text-3xl font-black tracking-tighter text-zinc-900 relative z-10">{value?.toLocaleString()}</h3>
    </div>
  )
}