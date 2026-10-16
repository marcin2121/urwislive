'use client'

import { useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { StatsTab } from '@/components/admin/StatsTab'
import { ClientsTab } from '@/components/admin/ClientsTab'
import { PromosTab } from '@/components/admin/PromosTab'
import { KuponyTab } from '@/components/admin/KuponyTab'
import { WheelTab } from '@/components/admin/WheelTab'
import { PushTab } from '@/components/admin/PushTab'
import { HistoryTab } from '@/components/admin/HistoryTab'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'stats' | 'promos' | 'push' | 'history' | 'clients' | 'kupony' | 'wheel'>('stats')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="fixed inset-0 z-[10000] bg-zinc-50 flex flex-col md:flex-row text-zinc-900 overflow-hidden font-sans">
      
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      <main className="flex-1 h-full overflow-y-auto p-4 md:p-10 bg-zinc-50/50 custom-scrollbar">
        <div className="max-w-6xl mx-auto pb-24 md:pb-20">
          {activeTab === 'stats' && <StatsTab />}
          {activeTab === 'clients' && <ClientsTab />}
          {activeTab === 'promos' && <PromosTab />}
          {activeTab === 'kupony' && <KuponyTab />}
          {activeTab === 'wheel' && <WheelTab />}
          {activeTab === 'push' && <PushTab />}
          {activeTab === 'history' && <HistoryTab />}
        </div>
      </main>

    </div>
  )
}