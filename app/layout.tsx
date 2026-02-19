import type { Metadata } from "next";
import { Inter, Fredoka } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { Toaster } from 'sonner';
import { RibbonsBg } from '@/components/Ribbons';
import OrphansFixer from "@/components/utils/OrphansFixer"; 
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka" });

// --- 🚀 ROZBUDOWANE METADANE SEO 🚀 ---
export const metadata: Metadata = {
  metadataBase: new URL('https://www.sklep-urwis.pl'),
  title: "Sklep z zabawkami Białobrzegi | Urwis - Art. Szkolne i Biurowe",
  description: "Najlepszy sklep z zabawkami w Białobrzegach! Największy wybór zabawek, gier planszowych, LEGO, balonów z helem i artykułów szkolnych. Zapraszamy na ul. Reymonta 38A.",
  keywords: [
    "sklep z zabawkami Białobrzegi", 
    "zabawki Białobrzegi", 
    "balony z helem Białobrzegi", 
    "artykuły szkolne Białobrzegi", 
    "gry planszowe Białobrzegi", 
    "sklep Urwis"
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Sklep z zabawkami Białobrzegi | Urwis",
    description: "Największy wybór zabawek, gier planszowych, balonów z helem i artykułów szkolnych w Białobrzegach. Sprawdź naszą ofertę stacjonarnie!",
    url: 'https://www.sklep-urwis.pl',
    siteName: 'Sklep Urwis Białobrzegi',
    locale: 'pl_PL',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  
  // --- 🤖 DANE STRUKTURALNE JSON-LD DLA GOOGLE LOKALNEGO 🤖 ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ToyStore", 
    "name": "Sklep Urwis",
    "image": "https://www.sklep-urwis.pl/logo.png",
    "@id": "https://www.sklep-urwis.pl",
    "url": "https://www.sklep-urwis.pl",
    "telephone": "+48604208183", 
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "ul. Reymonta 38A",
      "addressLocality": "Białobrzegi",
      "postalCode": "26-800",
      "addressCountry": "PL"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 51.644767922296516,
      "longitude": 20.950334289637663
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "08:00",
        "closes": "15:00"
      }
    ],
    "sameAs": [
      "https://facebook.com/sklepurwis.bialobrzegi",
      "https://instagram.com/sklepurwis.bialobrzegi"
    ]
  };

  return (
    <html lang="pl" className={`${inter.variable} ${fredoka.variable}`}>
      <head>
        {/* Tu wstrzykujemy kod JSON-LD zdefiniowany wyżej */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-transparent text-zinc-900 selection:bg-blue-500 selection:text-white">
           
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

        {/* 👇 GOOGLE ANALYTICS */}
        <GoogleAnalytics gaId="G-FE44ZTQ7GT" />
        
      </body>
    </html>
  );
}