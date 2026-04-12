'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
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
  Zap,
  Send,
  Bot,
  MessageSquare,
  Trash2,
  AlertTriangle,
  ArrowDown,
  User,
  ListTodo,
  Plus,
  Clock,
  ExternalLink,
  ChevronRight,
  LineChart as LineChartIcon
} from "lucide-react"
import { 
  LineChart, 
  Line, 
  XAxis as ReXAxis, 
  YAxis as ReYAxis, 
  CartesianGrid as ReCartesianGrid, 
  Tooltip as ReTooltip, 
  ResponsiveContainer as ReResponsiveContainer,
  AreaChart as ReAreaChart,
  Area as ReArea
} from 'recharts';
import { useChat } from '@ai-sdk/react';

// --- TYPES ---
interface SeoTask {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'done';
  createdAt: number;
}

const INITIAL_AI_INSIGHTS = [
  {
    id: 1,
    type: 'warning',
    message: 'Podstrona "/oferta/gry" zanotowała spadek CTR. Sugeruję optymalizację Meta Title.',
    actionPlan: 'Zaktualizuj Meta Title dla "/oferta/gry"'
  },
  {
    id: 2,
    type: 'success',
    message: 'Świetny zasięg lokalny na frazy "balony z helem".',
    actionPlan: 'Dodaj nowe zdjęcia realizacji do wizytówki GBP.'
  }
];

export function SeoTab() {
  const [localInput, setLocalInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // SEO TASKS STATE
  const [tasks, setTasks] = useState<SeoTask[]>([
    { id: '1', title: 'Optymalizacja obrazów WebP w sekcji Oferta', priority: 'high', status: 'todo', createdAt: Date.now() },
    { id: '2', title: 'Weryfikacja danych strukturalnych LocalBusiness', priority: 'medium', status: 'todo', createdAt: Date.now() }
  ]);

  // 1. GSC Data Query
  const { data: gscData, isLoading: isLoadingGsc, isError: isErrorGsc, error: errorGsc, refetch: refetchGsc } = useQuery({
    queryKey: ['seo', 'gsc'],
    queryFn: async () => {
      const res = await fetch('/api/admin/seo/gsc');
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Błąd GSC');
      return json.data;
    },
    staleTime: 1000 * 60 * 30
  });

  // 2. GBP Data Query
  const { data: gbpData, isLoading: isLoadingGbp, isError: isErrorGbp, error: errorGbp, refetch: refetchGbp } = useQuery({
    queryKey: ['seo', 'gbp'],
    queryFn: async () => {
      const res = await fetch('/api/admin/seo/gbp');
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Błąd GBP');
      return json.data;
    },
    staleTime: 1000 * 60 * 30
  });

  // 3. SEO Expert Chat
  const { messages, sendMessage, status, setMessages } = useChat({
    id: 'seo-expert-admin',
    // @ts-ignore
    body: {
      siteStats: {
        gsc: gscData,
        gbp: gbpData
      }
    }
  });

  const isChatLoading = status === 'submitted' || status === 'streaming';

  // AUTO-TASK PARSER
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && status === 'ready') {
      // Łączymy tekst z części (parts), bo 'content' nie istnieje w tej wersji SDK
      const fullText = lastMessage.parts
        ? lastMessage.parts
            .map((p: any) => p.type === 'text' ? p.text : '')
            .join('')
        : '';

      const taskMatch = fullText.match(/\[TASK:\s*(.*?)\s*\|\s*(high|medium|low)\]/i);
      if (taskMatch) {
         const title = taskMatch[1];
         const priority = taskMatch[2].toLowerCase() as any;
         
         // Sprawdź czy zadanie już istnieje
         if (!tasks.some(t => t.title === title)) {
            const newTask: SeoTask = {
              id: Math.random().toString(36).substr(2, 9),
              title,
              priority,
              status: 'todo',
              createdAt: Date.now()
            };
            setTasks(prev => [newTask, ...prev]);
         }
      }
    }
  }, [messages.length, status]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localInput.trim() || isChatLoading) return;
    sendMessage({ text: localInput });
    setLocalInput('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'todo' ? 'done' : 'todo' } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const [insights, setInsights] = useState(INITIAL_AI_INSIGHTS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { data: latestGsc } = await refetchGsc();
      const { data: latestGbp } = await refetchGbp();

      const aiRes = await fetch('/api/admin/seo/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gscData: latestGsc || gscData,
          gbpData: latestGbp || gbpData,
        })
      });

      const aiJson = await aiRes.json();
      if (aiRes.ok && aiJson.success) setInsights(aiJson.data);
    } catch (error) {
      console.error("AI Audit Error:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0055ff] flex items-center justify-center shadow-lg shadow-[#0055ff]/20">
            <TrendingUp className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900 leading-none">
              SEO Hub <span className="text-[#0055ff]">& Strategist</span>
            </h2>
            <p className="text-[10px] font-black text-zinc-400 mt-1 uppercase tracking-widest">
              Live Data & Autonomous Roadmap
            </p>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all disabled:opacity-50 shadow-xl"
        >
          <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Analizuję Dane...' : 'Generuj Audyt AI'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <div className="lg:col-span-3 space-y-6">
          
          {/* TRENDS CHART */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                     <LineChartIcon size={20} />
                   </div>
                   <div>
                     <h3 className="font-black uppercase tracking-tight text-zinc-900 leading-none">Trendy Widoczności</h3>
                     <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase">Ostatnie 28 dni (Kliknięcia vs Wyświetlenia)</p>
                   </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-[9px] font-black uppercase text-zinc-500">Kliknięcia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-200" />
                    <span className="text-[9px] font-black uppercase text-zinc-500">Impresje</span>
                  </div>
                </div>
             </div>
             
             <div className="flex-1 w-full h-[300px] mt-auto">
                {isLoadingGsc ? (
                  <div className="h-full w-full flex items-center justify-center bg-zinc-50 rounded-3xl animate-pulse">
                    <p className="text-[10px] font-black uppercase text-zinc-400">Pobieram dane GSC...</p>
                  </div>
                ) : gscData?.daily?.length > 0 ? (
                  <ReResponsiveContainer width="100%" height="100%">
                    <ReAreaChart data={gscData.daily}>
                      <defs>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <ReCartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                      <ReXAxis 
                        dataKey="date" 
                        hide 
                      />
                      <ReYAxis hide />
                      <ReTooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <ReArea 
                        type="monotone" 
                        dataKey="impressions" 
                        stroke="#e2e8f0" 
                        fill="#f8fafc" 
                        strokeWidth={2}
                      />
                      <ReArea 
                        type="monotone" 
                        dataKey="clicks" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#colorClicks)" 
                        strokeWidth={3}
                      />
                    </ReAreaChart>
                  </ReResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-3xl">
                    <p className="text-[10px] font-black uppercase text-zinc-400">Brak danych czasowych dla tej witryny</p>
                  </div>
                )}
             </div>
          </div>

          {/* METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Kliknięcia (GSC)" 
              value={isLoadingGsc ? "..." : gscData?.stats?.clicks || "0"} 
              icon={<MousePointerClick size={20} />} 
              color="text-blue-600" 
              bg="bg-blue-50" 
            />
            <MetricCard 
              title="Wyświetlenia" 
              value={isLoadingGsc ? "..." : gscData?.stats?.impressions || "0"} 
              icon={<Eye size={20} />} 
              color="text-indigo-600" 
              bg="bg-indigo-50" 
            />
            <MetricCard 
              title="Pozycja" 
              value={isLoadingGsc ? "..." : gscData?.stats?.position || "0"} 
              icon={<TrendingUp size={20} />} 
              color="text-emerald-600" 
              bg="bg-emerald-50" 
              invertTrend
            />
            <MetricCard 
              title="Google Maps" 
              value={isLoadingGbp ? "..." : (gbpData?.locationRetrieved ? "Active" : "Brak")} 
              icon={<MapPin size={20} />} 
              color="text-red-600" 
              bg="bg-red-50" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* STRATEGIC TASKS ROADMAP */}
             <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-200 shadow-sm flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <ListTodo size={20} />
                      </div>
                      <h3 className="font-black uppercase tracking-tight text-zinc-900">Roadmapa SEO</h3>
                   </div>
                   <span className="text-[10px] font-black bg-zinc-100 px-3 py-1 rounded-full uppercase text-zinc-500">
                     {tasks.filter(t => t.status==='todo').length} Aktywnych
                   </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                   {tasks.length > 0 ? tasks.map(task => (
                     <div key={task.id} className={`group flex items-center gap-4 p-4 rounded-[1.5rem] border transition-all ${
                       task.status === 'done' ? 'bg-zinc-50/50 border-zinc-100 opacity-60' : 'bg-white border-zinc-100 hover:border-indigo-200 shadow-sm'
                     }`}>
                        <button 
                          onClick={() => toggleTask(task.id)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                            task.status === 'done' ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-zinc-200 hover:border-indigo-400'
                          }`}
                        >
                           {task.status === 'done' && <CheckCircle2 size={14} />}
                        </button>
                        <div className="flex-1 min-w-0 py-1">
                           <p className={`text-xs font-bold leading-relaxed ${task.status === 'done' ? 'text-zinc-400 line-through' : 'text-zinc-800'} break-words whitespace-normal`}>
                             {task.title}
                           </p>
                           <div className="flex items-center gap-3 mt-1">
                              <span className={`text-[8px] font-black uppercase tracking-widest ${
                                task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-orange-500' : 'text-emerald-500'
                              }`}>
                                {task.priority} Priority
                              </span>
                              <span className="text-[8px] text-zinc-400 font-bold uppercase">{new Date(task.createdAt).toLocaleDateString()}</span>
                           </div>
                        </div>
                        <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-2 text-zinc-300 hover:text-red-500 transition-all">
                           <Trash2 size={14} />
                        </button>
                     </div>
                   )) : (
                     <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-12">
                        <ListTodo size={40} className="mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Kolejka jest pusta</p>
                     </div>
                   )}
                </div>
                
                <div className="mt-6 pt-6 border-t border-zinc-50">
                   <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-relaxed">
                     Tip: Powiedz asystentowi „Dodaj zadanie [Nazwa] | high”, aby zaktualizować listę.
                   </p>
                </div>
             </div>

             {/* AI INSIGHTS */}
             <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-200 shadow-sm h-full">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="font-black uppercase tracking-tight text-zinc-900">Audyt AI (Live)</h3>
                </div>

                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="p-5 rounded-3xl bg-zinc-50 border border-zinc-100 hover:border-blue-200 transition-all group">
                       <div className="flex items-start gap-4">
                         <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${insight.type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                         <div className="flex-1">
                           <p className="text-xs font-bold text-zinc-800 mb-2 leading-relaxed">{insight.message}</p>
                           <div className="bg-white/50 p-3 rounded-xl border border-zinc-100 flex items-center justify-between">
                             <div>
                               <p className="text-[8px] font-black uppercase text-zinc-400 mb-0.5 tracking-tighter">Akcja</p>
                               <p className="text-[11px] font-black text-blue-600 italic tracking-tight">{insight.actionPlan}</p>
                             </div>
                             <button 
                                onClick={() => {
                                   const newTask: SeoTask = {
                                      id: Math.random().toString(36).substr(2, 9),
                                      title: insight.actionPlan,
                                      priority: insight.type === 'warning' ? 'high' : 'medium',
                                      status: 'todo',
                                      createdAt: Date.now()
                                   };
                                   setTasks(prev => [newTask, ...prev]);
                                }}
                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                             >
                                <Plus size={14} />
                             </button>
                           </div>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          {/* TOP QUERIES */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-200 shadow-sm overflow-hidden">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Search size={20} />
                </div>
                <h3 className="font-black uppercase tracking-tight text-zinc-900">Widoczność Fraz (Live)</h3>
             </div>
             <div className="space-y-2">
                {gscData?.queries?.length > 0 ? gscData.queries.slice(0, 10).map((q: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0 hover:scale-[1.01] transition-transform">
                    <span className="text-sm font-bold text-zinc-700">{q.query}</span>
                    <div className="flex items-center gap-4">
                       <div className="text-right">
                          <p className="text-[10px] font-black text-zinc-400 uppercase leading-none">Kliknięcia</p>
                          <p className="text-sm font-black text-zinc-900">{q.clicks}</p>
                       </div>
                       <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 text-white text-xs font-black shadow-lg">
                          {q.position}
                       </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs opacity-50 border-2 border-dashed border-zinc-100 rounded-[2rem]">
                    BRAK DANYCH DLA DOMENY (SPRAWDŹ UPRAWNIENIA)
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* SEO STRATEGIST CHAT */}
        <div className="lg:col-span-1 flex flex-col gap-6">
           <div className="bg-zinc-950 rounded-[2.5rem] shadow-2xl flex flex-col h-[750px] overflow-hidden relative border border-zinc-900">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600" />
              
              <div className="p-6 border-b border-zinc-900 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                    <Bot className="text-zinc-950 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-tight text-white leading-none">SEO Architect</h3>
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1 italic animate-pulse">Autonomous Agent Online</p>
                  </div>
                </div>
                <button onClick={() => setMessages([])} className="p-2 text-zinc-700 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-zinc-950/20">
                {messages.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:scale-110 transition-transform shadow-xl">
                         <Zap className="text-blue-500 fill-blue-500/20" size={32} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-zinc-100 uppercase tracking-widest mb-1">Cześć Marcin!</p>
                        <p className="text-[10px] text-zinc-500 font-bold leading-relaxed px-4 italic">Analizuję llms-full i dane live. Powiedz mi np. „Zaplanuj zadania na ten tydzień”.</p>
                      </div>
                   </div>
                )}
                {messages.map((m) => (
                  <div key={m.id} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] p-4 rounded-[1.75rem] text-[13px] leading-relaxed shadow-lg ${
                      m.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none font-medium'
                    }`}>
                        {m.parts ? m.parts.map((part, i) => part.type === 'text' && (
                          <div key={i} className="prose prose-invert prose-sm">
                            <ReactMarkdown>{part.text}</ReactMarkdown>
                          </div>
                        )) : null}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-900 p-4 rounded-2xl flex gap-1.5 border border-zinc-800">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:150ms]" />
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-6 bg-black/60 border-t border-zinc-900">
                <form onSubmit={handleChatSubmit} className="space-y-3">
                  <div className="relative">
                    <textarea 
                      value={localInput}
                      onChange={(e) => setLocalInput(e.target.value)}
                      placeholder="Rozpocznij planowanie strategii..."
                      rows={2}
                      className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm text-zinc-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none resize-none placeholder:text-zinc-700"
                      onKeyDown={(e) => {
                         if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleChatSubmit(e);
                         }
                      }}
                    />
                    <button 
                      type="submit"
                      disabled={!localInput.trim() || isChatLoading}
                      className="absolute bottom-3 right-3 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-10 transition-all border-none cursor-pointer shadow-xl"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-[7px] font-black text-zinc-600 uppercase tracking-widest">
                    <span>Code Intelligence</span>
                    <span>•</span>
                    <span>Task Automation</span>
                  </div>
                </form>
              </div>
           </div>
        </div>

      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, color, bg, invertTrend = false }: { title: string, value: string, icon: React.ReactNode, color: string, bg: string, invertTrend?: boolean }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-4 rounded-2xl ${bg} ${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{title}</h4>
        <span className="text-2xl font-black text-zinc-900 tracking-tight leading-none">{value}</span>
      </div>
    </div>
  )
}
