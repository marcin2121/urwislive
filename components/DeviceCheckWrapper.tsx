'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import JellyButton from '@/components/ui/JellyButton'
import { MonitorSmartphone, Download } from 'lucide-react'

export default function DeviceCheckWrapper({ children }: { children: React.ReactNode }) {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    // Sprawdzamy czy to duży ekran LUB czy aplikacja jest zainstalowana jako PWA
    const isDesktop = window.innerWidth >= 1024; 
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    
    setIsAllowed(isDesktop || isPWA)
  }, [])

  if (isAllowed === null) return null; // Zapobiega miganiu UI podczas sprawdzania

  if (!isAllowed) {
    return (
      <div className="fixed inset-0 min-h-screen bg-gray-900 flex items-center justify-center p-4 z-50">
        <Card className="max-w-md w-full p-8 text-center bg-linear-to-b from-orange-50 to-white border-4 border-orange-200 rounded-[32px] shadow-2xl relative overflow-hidden">
          <MonitorSmartphone className="w-16 h-16 text-orange-500 mx-auto mb-4 relative z-10" />
          <h2 className="text-2xl font-black text-gray-800 mb-4 relative z-10">Urwisek śpi w aplikacji! 🦖</h2>
          <p className="text-gray-600 mb-6 font-bold relative z-10">
            Pełny ekran, zero rozpraszaczy. <br /><br />
            <strong className="text-orange-600">Zainstaluj naszą aplikację</strong> na swoim telefonie (opcja "Dodaj do ekranu głównego") lub wejdź na stronę na komputerze, aby grać i zbierać Złote Urwisy.
          </p>
          <JellyButton 
            variant="primary" 
            onClick={() => alert('Rozwiń menu przeglądarki (trzy kropki) i wybierz "Dodaj do ekranu głównego" lub "Zainstaluj aplikację".')}
            className="w-full text-sm py-3 relative z-10"
          >
            <Download className="w-4 h-4 mr-2" />
            Jak zainstalować?
          </JellyButton>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}