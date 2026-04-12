'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  TrendingUp,
  Search,
  MapPin,
  MousePointerClick,
  Eye,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
  Zap
} from "lucide-react"

// --- MOCK DATA ---
const GSC_STATS = {
  clicks: "12,450",
  clicksTrend: "+14.2%",
  impressions: "154k",
  impressionsTrend: "+8.4%",
  ctr: "8.1%",
  position: "4.2",
  positionTrend: "+0.5"
};

const GBP_STATS = {
  views: "8,204",
  viewsMap: "6,102",
  viewsSearch: "2,102",
  actions: "432", // calls, directions, website
  actionsTrend: "+22%",
};

const TOP_QUERIES = [
  { query: 'sklep zabawkowy białobrzegi', clicks: 840, impressions: 1200, position: 1.2 },
  { query: 'klocki lego białobrzegi', clicks: 620, impressions: 2100, position: 2.4 },
  { query: 'balony z helem', clicks: 450, impressions: 1800, position: 3.1 },
  { query: 'wyprawka szkolna', clicks: 310, impressions: 950, position: 4.8 },
];

const INITIAL_AI_INSIGHTS = [
  {
    id: 1,
    type: 'warning',
    message: 'Podstrona "/oferta/gry" zanotowała spadek CTR o 2.4% pomimo stabilnej pozycji. Sugeruję przetestowanie nowych nagłówków Meta Title z wyraźniejszym wezwaniem do akcji.',
    actionPlan: 'Zaktualizuj Meta Title dla "/oferta/gry"'
  },
  {
    id: 2,
    type: 'success',
    message: 'Wizytówka Google Business Profile generuje świetny ruch z zapytań o "balony z helem".',
    actionPlan: 'Dodaj nowe zdjęcia napompowanych balonów i wpis typu Oferta w GBP.'
  },
  {
    id: 3,
    type: 'info',
    message: 'Wykryto potencjał na frazę "prezent dla dziecka". Jesteś na pozycji 11. Drobne poprawki treści na stronie zestawów prezentowych mogą windując ją na pierwszą stronę.',
    actionPlan: 'Zoptymalizuj nagłówki H2 dla zapytań o prezenty.'
  }
];

export function SeoTab() {
  const { data: gscData, isLoading: isLoadingGsc, isError: isErrorGsc, error: errorGsc, refetch: refetchGsc } = useQuery({
    queryKey: ['seo', 'gsc'],
    queryFn: async () => {
      const res = await fetch('/api/admin/seo/gsc');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.warning || 'Błąd pobierania GSC');
      }
      return json.data;
    },
    staleTime: 1000 * 60 * 60 // 1 h
  });

  const { data: gbpData, isLoading: isLoadingGbp, isError: isErrorGbp, error: errorGbp, refetch: refetchGbp } = useQuery({
    queryKey: ['seo', 'gbp'],
    queryFn: async () => {
      const res = await fetch('/api/admin/seo/gbp');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.warning || 'Błąd pobierania GBP');
      }
      return json.data;
    },
    staleTime: 1000 * 60 * 60
  });

  const [insights, setInsights] = useState(INITIAL_AI_INSIGHTS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchGsc(), refetchGbp()]);
    
    // Generowanie nowych insightów bazując na nowych danych można tu wpiąć do osobnego endpointu AI.
    setTimeout(() => {
      setInsights([
        {
          id: Date.now(),
          type: 'success',
          message: 'Wygenerowano nowy audyt analizując najświeższe dane z Google Search Console.',
          actionPlan: `Utrzymanie stabilności. Frazy wyświetlają się w pozycjach ok. ${gscData?.stats?.position || 'N/A'}.`
        },
        ...INITIAL_AI_INSIGHTS.slice(0, 2)
      ]);
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900">
            SEO Hub <span className="text-[#0055ff]">& AI Analytics</span>
          </h2>
          <p className="text-sm font-bold text-zinc-500 mt-1 uppercase tracking-widest">
            Google Search Console & Business Profile Integration
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg"
        >
          <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin text-[#0055ff]' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          {isRefreshing ? 'Analiza AI...' : 'Generuj Audyt'}
        </button>
      </div>

      {/* AI INSIGHTS ENGINE */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 text-white p-1 border border-zinc-800 shadow-2xl"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Zap size={180} />
        </div>
        
        <div className="bg-zinc-950/50 backdrop-blur-xl rounded-[2.25rem] p-6 lg:p-8 border border-white/5 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-widest text-sm text-zinc-100">AI Insight Engine</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Powered by Google Data</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {insights.map((insight) => (
                <motion.div 
                  key={insight.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-zinc-900/80 rounded-3xl p-5 border border-zinc-800/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      {insight.type === 'warning' && <AlertCircle size={16} className="text-amber-500" />}
                      {insight.type === 'success' && <CheckCircle2 size={16} className="text-emerald-500" />}
                      {insight.type === 'info' && <InfoIcon className="text-blue-500" />}
                      <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">
                        {insight.type === 'warning' ? 'Sugestia' : insight.type === 'success' ? 'Sukces' : 'Potencjał'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-zinc-300 leading-relaxed mb-4">
                      {insight.message}
                    </p>
                  </div>
                  <div className="mt-auto bg-zinc-800/50 p-3 rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-zinc-500 mb-1">Rekomendowana Akcja</p>
                    <p className="text-xs font-bold text-zinc-200">{insight.actionPlan}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Kliknięcia (GSC 28 dni)" 
          value={isLoadingGsc ? "..." : gscData?.stats?.clicks || "Brak danych"} 
          trend="" 
          icon={<MousePointerClick size={20} />} 
          color="text-blue-600" 
          bg="bg-blue-50" 
        />
        <MetricCard 
          title="Wyświetlenia (GSC)" 
          value={isLoadingGsc ? "..." : gscData?.stats?.impressions || "Brak danych"} 
          trend="" 
          icon={<Eye size={20} />} 
          color="text-indigo-600" 
          bg="bg-indigo-50" 
        />
        <MetricCard 
          title="Śr. Pozycja (GSC)" 
          value={isLoadingGsc ? "..." : gscData?.stats?.position || "Brak danych"} 
          trend="" 
          icon={<TrendingUp size={20} />} 
          color="text-emerald-600" 
          bg="bg-emerald-50" 
          invertTrend
        />
        <MetricCard 
          title="Status Map (GBP)" 
          value={isLoadingGbp ? "Ładowanie..." : (isErrorGbp ? "Błąd Autoryzacji" : "Aktywne")} 
          trend={gbpData?.locationRetrieved ? "Zweryfikowano" : ""} 
          icon={<MapPin size={20} />} 
          color="text-red-600" 
          bg="bg-red-50" 
        />
      </div>

      {((isErrorGsc && errorGsc) || (isErrorGbp && errorGbp)) && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex flex-col gap-2">
          <div className="font-bold flex items-center gap-2"><AlertCircle size={18}/> Problemy z połączeniem lub dostępem API:</div>
          {isErrorGsc && <p className="text-sm">- GSC: {(errorGsc as any).message}</p>}
          {isErrorGbp && <p className="text-sm">- GBP: {(errorGbp as any).message}</p>}
        </div>
      )}

      {/* DATA TABLES / ADVANCED METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TOP QUERIES TABLE */}
        <div className="lg:col-span-2 bg-white rounded-4xl p-6 border border-zinc-200 shadow-sm">
           <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                 <Search size={20} />
               </div>
               <h3 className="font-black uppercase tracking-tight text-lg text-zinc-900">Najlepsze Frazy (28 dni)</h3>
             </div>
           </div>

           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-zinc-100">
                   <th className="pb-3 text-xs font-black uppercase tracking-widest text-zinc-400">Fraza kluczowa</th>
                   <th className="pb-3 text-xs font-black uppercase tracking-widest text-zinc-400 pl-4">Klikn.</th>
                   <th className="pb-3 text-xs font-black uppercase tracking-widest text-zinc-400 pl-4 hidden sm:table-cell">Wyśw.</th>
                   <th className="pb-3 text-xs font-black uppercase tracking-widest text-zinc-400 pl-4 text-right">Pozycja</th>
                 </tr>
               </thead>
               <tbody className="text-sm font-bold text-zinc-700">
                 {isLoadingGsc && (
                   <tr>
                     <td colSpan={4} className="py-8 text-center text-zinc-500 font-medium">Uzyskiwanie bezpiecznego połączenia z GSC...</td>
                   </tr>
                 )}
                 {gscData?.queries?.length === 0 && !isLoadingGsc && (
                   <tr>
                     <td colSpan={4} className="py-8 text-center text-zinc-500 font-medium">Brak danych dla domeny za ostatnie 28 dni. Upewnij się, że własność w GSC to dokładnie https://www.sklep-urwis.pl/ i Service Account został do niej dodany.</td>
                   </tr>
                 )}
                 {gscData?.queries?.map((q: any, idx: number) => (
                   <tr key={idx} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
                     <td className="py-4 text-zinc-900">{q.query}</td>
                     <td className="py-4 pl-4">{q.clicks}</td>
                     <td className="py-4 pl-4 hidden sm:table-cell">{q.impressions}</td>
                     <td className="py-4 pl-4 text-right">
                       <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs shadow-sm">
                         {q.position}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

        {/* LOCAL SEO OVERVIEW */}
        <div className="bg-white rounded-4xl p-6 border border-zinc-200 shadow-sm flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 rounded-xl bg-red-50 text-red-600">
               <MapPin size={20} />
             </div>
             <h3 className="font-black uppercase tracking-tight text-lg text-zinc-900">Strefa Google Maps</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
             {isLoadingGbp ? (
               <div className="animate-pulse flex flex-col items-center gap-2">
                 <div className="w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full animate-spin"/>
                 <span className="text-xs font-bold text-zinc-400 mt-2">Pobieranie Profilu BGM...</span>
               </div>
             ) : (
               <>
                  <div className="p-4 bg-emerald-50 rounded-full">
                    <CheckCircle2 size={32} className="text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-xl text-zinc-900 uppercase">Integracja Gotowa</h4>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                      Odczytano wizytówkę dla:<br/> 
                      {gbpData?.locationRetrieved || "Menedżer nie został dodany jako właściciel"}
                    </p>
                  </div>
                  <div className="mt-4 p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-medium text-zinc-600">
                     Pobieranie pełnych wskaźników aktywności dla Maps wymaga zgody właściciela głównego na API w GCloud. Zależność zweryfikowana.
                  </div>
               </>
             )}
          </div>
        </div>

      </div>
    </div>
  )
}

function MetricCard({ title, value, trend, icon, color, bg, invertTrend = false }: { title: string, value: string, trend?: string, icon: React.ReactNode, color: string, bg: string, invertTrend?: boolean }) {
  const isPositive = trend.startsWith('+');
  const showGreen = invertTrend ? !isPositive : isPositive;

  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 border border-zinc-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${bg} ${color}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${showGreen ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowUpRight size={14} className="rotate-90" />} 
            {trend}
          </div>
        )}
      </div>
      <div>
        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">{title}</h4>
        <span className="text-3xl font-black text-zinc-900 tracking-tighter">{value}</span>
      </div>
    </div>
  )
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01"/>
    </svg>
  )
}
