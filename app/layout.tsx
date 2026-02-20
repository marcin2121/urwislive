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
import ReactDOM from "react-dom";
import Script from "next/script"; // 🚀 DODANE: Importujemy zoptymalizowany tag Script

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
  
  openGraph: {
    title: "Sklep Urwis | Białobrzegi",
    description: "Największy wybór zabawek, gier i artykułów imprezowych w Białobrzegach. Odkryj prawdziwy sklep stacjonarny dla dzieci!",
    url: "https://sklep-urwis.pl", 
    siteName: "Sklep Urwis",
    images: [
      {
        url: "/og-image.webp", 
        width: 1200,
        height: 630,
        alt: "Front Sklepu Urwis i maskotka",
      },
    ],
    locale: "pl_PL",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Sklep Urwis | Zabawki i Balony",
    description: "Zabawki, gry planszowe, balony z helem i artykuły szkolne. Białobrzegi, Reymonta 38A.",
    images: ["/og-image.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0055ff", 
  width: "device-width",
  initialScale: 1,
};

// Twój identyfikator GA4
const GA_MEASUREMENT_ID = "G-FE44ZTQ7GT";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  ReactDOM.preload("/urwis-fallback.webp", { 
    as: "image", 
    fetchPriority: "high" 
  });

  return (
    <html lang="pl" className={`${inter.variable} ${fredoka.variable}`}>
      <head>
        {/* 🚀 DODANE: Google Analytics 4 (Ładuje się asynchronicznie po głównej zawartości) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>

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
          navigator.serviceWorker.register('/sw.js');
        });
      }

      // 🚀 ZDARZENIE GA4: Sukces instalacji PWA
      window.addEventListener('appinstalled', () => {
        if (typeof gtag === 'function') {
          gtag('event', 'pwa_installed', { platform: 'web' });
        }
        console.log('PWA zostało zainstalowane!');
      });
    `,
  }}
/>
      </body>
    </html>
  );
}