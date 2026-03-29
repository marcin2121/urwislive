'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, LogOut, X, Menu, LayoutDashboard, Users, TicketPercent, CircleDashed, Tag, Bell, History } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export const navItems = [
  { id: 'stats', label: 'Statystyki & Wykresy', icon: LayoutDashboard },
  { id: 'clients', label: 'Baza Klientów', icon: Users },
  { id: 'kupony', label: 'Kupony Rabatowe', icon: TicketPercent },
  { id: 'wheel', label: 'Koło Fortuny', icon: CircleDashed },
  { id: 'promos', label: 'Katalog Ofert', icon: Tag },
  { id: 'push', label: 'Kreator Push', icon: Bell },
  { id: 'history', label: 'Historia Wysyłek', icon: History }
] as const;

export function AdminSidebar({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen }: any) {
  const handleLogout = async () => { 
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut(); 
    }
    window.location.href = '/strefa-zabawy/urwisek';
  };

  return (
    <>
      <div className="md:hidden flex items-center justify-between bg-white border-b border-zinc-200 p-4 shrink-0 shadow-sm z-50">
        <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">Admin <span className="text-[#0055ff]">Urwis</span></h1>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-zinc-100 rounded-xl text-zinc-600 hover:bg-zinc-200 transition-colors border-none"><Menu size={24} /></button>
      </div>

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
        <div className="mt-auto space-y-2">
          <button onClick={() => window.location.href = '/'} className="w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-zinc-500 hover:text-[#0055ff] hover:bg-blue-50 transition-all border-none bg-transparent cursor-pointer"><Home size={20} /> Sklep Urwis</button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-zinc-500 hover:text-red-500 hover:bg-red-50 transition-all border-none bg-transparent cursor-pointer"><LogOut size={20} /> Wyloguj się</button>
        </div>
      </aside>

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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}