'use client'

import { usePathname } from 'next/navigation'
import "./globals.css"
import AppProviders from "@/components/providers/AppProviders"
import Navbar from "@/components/ui/Navbar"
import Footer from "@/components/ui/Footer"
import SocialSidebar from "@/components/ui/SocialSidebar"
import { Toaster } from 'sonner'
import GamificationListener from "@/components/systems/GamificationListener"
import { Inter, Fredoka } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Sprawdzamy czy jesteśmy na mapie
  const isMap = pathname === '/mapa'

  return (
    <html lang="pl" className={`${inter.variable} ${fredoka.variable}`}>
      <body className="antialiased selection:bg-blue-500 selection:text-white overflow-x-hidden">
        <AppProviders>
          <div className="relative flex flex-col min-h-screen">
            {/* Ukrywamy Navbar i Footer na mapie, aby odzyskać pełne 100vh */}
            {!isMap && <Navbar />}
            
            <main className="flex-grow">
              {children}
            </main>

            {!isMap && <Footer />}
            
            {/* Sidebar jest widoczny wszędzie poza stroną główną (opcjonalnie) */}
            <SocialSidebar />
          </div>
          
          <GamificationListener />
          <Toaster position="bottom-right" richColors />
        </AppProviders>
      </body>
    </html>
  )
}