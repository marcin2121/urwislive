import type { Metadata, Viewport } from "next";
import { Inter, Fredoka } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { Toaster } from 'sonner';
import { RibbonsBg } from '@/components/Ribbons';
import OrphansFixer from "@/components/utils/OrphansFixer";
import CookieModal from "@/components/ui/CookieModal";
import InstallPrompt from "@/components/ui/InstallPrompt";
import { Suspense } from "react";
import ReactDOM from "react-dom"; // 🚀 DODANE

// 🚀 ZMIANA: Dodano 'display: swap', aby tekst pojawiał się błyskawicznie (lepsze FCP)
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap' 
});

const fredoka = Fredoka({ 
  subsets: ["latin"], 
  variable: "--font-fredoka",
  display: 'swap'
});

export const metadata: Metadata = {
  title: "Sklep Urwis | Zabawki, Balony i Artykuły Szkolne Białobrzegi",
  description: "Największy wybór zabawek, gier i artykułów imprezowych w Białobrzegach. Prawdziwy sklep stacjonarny dla dzieci!",
  manifest: "/manifest.json", 
};

export const viewport: Viewport = {
  themeColor: "#0055ff", 
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 🚀 KLUCZ DO LCP: Preload obrazka fallback. 
  // Przeglądarka zacznie go pobierać równolegle z plikami CSS/JS.
  ReactDOM.preload("/urwis-fallback.webp", { 
    as: "image", 
    fetchPriority: "high" 
  });

  return (
    <html lang="pl" className={`${inter.variable} ${fredoka.variable}`}>
      <body className="antialiased bg-transparent text-zinc-900 selection:bg-blue-500 selection:text-white">
        
        <Suspense fallback={null}>
          <OrphansFixer />
        </Suspense>

        <div 
          className="fixed inset-0 z-10 bg-white/80 pointer-events-none" 
          aria-hidden="true" 
        />

        <div className="relative z-20 flex flex-col min-h-screen bg-transparent">
          <Navbar />
          
          <Suspense fallback={null}>
            <InstallPrompt />
          </Suspense>
          
          <RibbonsBg />
          
          <main className="grow bg-transparent">
            {children}
          </main>
          
          <Footer />
        </div>

        <Toaster position="bottom-right" richColors />
        
        <Suspense fallback={null}>
          <CookieModal />
        </Suspense>

        {/* REJESTRACJA SERVICE WORKERA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW registered!');
                    },
                    function(err) {
                      console.log('SW registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}