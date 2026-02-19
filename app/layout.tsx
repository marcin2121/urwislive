import type { Metadata, Viewport } from "next"; // DODANO: Import Viewport
import { Inter, Fredoka } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { Toaster } from 'sonner';
import { RibbonsBg } from '@/components/Ribbons';
import OrphansFixer from "@/components/utils/OrphansFixer";
import CookieModal from "@/components/ui/CookieModal";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka" });

// DODANO: link do manifestu PWA
export const metadata: Metadata = {
  title: "Sklep Urwis | Zabawki, Balony i Artykuły Szkolne Białobrzegi",
  description: "Największy wybór zabawek, gier i artykułów imprezowych w Białobrzegach. Prawdziwy sklep stacjonarny dla dzieci!",
  manifest: "/manifest.webmanifest", 
};

// NOWE: Konfiguracja Viewportu dla aplikacji PWA na telefony
export const viewport: Viewport = {
  themeColor: "#0055ff", // Kolor paska statusu w telefonie (niebieski Urwisa)
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Blokuje psucie się layoutu przy klikaniu
  userScalable: false, // Zabrania szczypania/przybliżania (jak w natywnych apkach)
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${inter.variable} ${fredoka.variable}`}>
      <body className="antialiased bg-transparent text-zinc-900 selection:bg-blue-500 selection:text-white">
        
        {/* AUTOMATYCZNA NAPRAWA SPÓJNIKÓW */}
        <OrphansFixer />

        {/* WARSTWA 1: SZKŁO (Musi być pod treścią, ale nad tłem) */}
        <div 
          className="fixed inset-0 z-10 bg-white/40 backdrop-blur-[100px] pointer-events-none" 
          aria-hidden="true" 
        />

        {/* WARSTWA 2: TREŚĆ (Góra kanapki) */}
        <div className="relative z-20 flex flex-col min-h-screen bg-transparent">
          <Navbar />
          <RibbonsBg />
          <main className="grow bg-transparent">
            {children}
          </main>

          <Footer />
        </div>

        <Toaster position="bottom-right" richColors />
        <CookieModal />
      </body>
    </html>
  );
}