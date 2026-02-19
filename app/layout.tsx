import type { Metadata } from "next";
import { Inter, Fredoka } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { Toaster } from 'sonner';
import { RibbonsBg } from '@/components/Ribbons';
import OrphansFixer from "@/components/utils/OrphansFixer"; 
import { GoogleAnalytics } from '@next/third-parties/google'; // 👈 IMPORT GA

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka" });

export const metadata: Metadata = {
  title: "Sklep Urwis | Zabawki, Balony i Artykuły Szkolne Białobrzegi",
  description: "Największy wybór zabawek, gier i artykułów imprezowych w Białobrzegach. Prawdziwy sklep stacjonarny dla dzieci!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${inter.variable} ${fredoka.variable}`}>
      <body className="antialiased bg-transparent text-zinc-900 selection:bg-blue-500 selection:text-white">
           <GoogleAnalytics gaId="G-FE44ZTQ7GT" />
        {/* AUTOMATYCZNA NAPRAWA SPÓJNIKÓW */}
        <OrphansFixer />

        {/* WARSTWA 1: SZKŁO (Musi być pod treścią, ale nad tłem) */}
        <div 
          className="fixed inset-0 z-[10] bg-white/40 backdrop-blur-[100px] pointer-events-none" 
          aria-hidden="true" 
        />

        {/* WARSTWA 2: TREŚĆ (Góra kanapki) */}
        <div className="relative z-[20] flex flex-col min-h-screen bg-transparent">
          <Navbar />
          <RibbonsBg />
          <main className="flex-grow bg-transparent">
            {children}
          </main>

          <Footer />
        </div>

        <Toaster position="bottom-right" richColors />

        {/* 👇 GOOGLE ANALYTICS - Wklej tu swój kod G-... */}
     
        
      </body>
    </html>
  );
}