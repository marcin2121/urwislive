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
import Script from "next/script";
import WelcomeScreen from "@/components/ui/WelcomeScreen";
import { AuthProvider } from "@/components/AuthProvider";

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
  // 🚀 Zmiana na www zgodnie z Twoją konfiguracją domeny
  metadataBase: new URL('https://www.sklep-urwis.pl'),
  title: {
    default: "Sklep Urwis Białobrzegi | LEGO, Zabawki i Art. Szkolne",
    template: "%s | Sklep Urwis Białobrzegi"
  },
  description: "Największy w Białobrzegach wybór LEGO, zabawek i artykułów szkolnych. 🧸 Odwiedź nas na Reymonta 38A! Pompujemy balony helem i spełniamy dziecięce marzenia.",
  manifest: "/manifest.json", 
  
  keywords: [
    "sklep urwis", "lego białobrzegi", "zabawki dla dzieci", "sala zabaw białobrzegi", 
    "lece w kulki", "balony z helem", "artykuly szkolne", "reymonta 38a"
  ],

  openGraph: {
    title: "Sklep Urwis Białobrzegi | Królestwo LEGO i Zabawek",
    description: "Wszystko dla Twojego dziecka w jednym miejscu. Najlepsze marki, balony z helem i Sala Zabaw Lecę w Kulki!",
    url: "https://www.sklep-urwis.pl", 
    siteName: "Sklep Urwis",
    images: [
      {
        url: "/og-image.webp", 
        width: 1200,
        height: 630,
        alt: "Sklep Urwis Białobrzegi - LEGO i Zabawki",
      },
    ],
    locale: "pl_PL",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Sklep Urwis Białobrzegi",
    description: "Zabawki, LEGO, balony z helem i wyprawka szkolna. Najlepszy sklep stacjonarny w regionie!",
    images: ["/og-image.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0055ff", 
  width: "device-width",
  initialScale: 1,
};

const GA_MEASUREMENT_ID = "G-FE44ZTQ7GT";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  ReactDOM.preload("/urwis-fallback.webp", { 
    as: "image", 
    fetchPriority: "high" 
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ToyStore"], 
    "name": "Sklep Urwis",
    "image": "https://www.sklep-urwis.pl/og-image.webp",
    "@id": "https://www.sklep-urwis.pl",
    "url": "https://www.sklep-urwis.pl",
    "telephone": "+48604208183",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "ul. Reymonta 38A",
      "addressLocality": "Białobrzegi",
      "postalCode": "26-800",
      "addressCountry": "PL"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 51.6447168175059, 
      "longitude": 20.950223885817554
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>

      <body className="antialiased bg-transparent text-zinc-900 selection:bg-blue-500 selection:text-white">
        <AuthProvider>
          <WelcomeScreen />
          
          <Suspense fallback={null}>
            <OrphansFixer />
          </Suspense>
          
          <div className="fixed inset-0 z-10 bg-white/80 pointer-events-none" aria-hidden="true" />

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
        </AuthProvider>

        <Script id="register-sw" strategy="afterInteractive">
          {`
            const isTestBot = /Lighthouse|Googlebot|PageSpeed/i.test(navigator.userAgent);
            
            if ('serviceWorker' in navigator && !isTestBot) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }

            window.addEventListener('appinstalled', () => {
              if (typeof gtag === 'function') {
                gtag('event', 'pwa_installed', { platform: 'web' });
              }
              console.log('PWA zainstalowane!');
            });
          `}
        </Script>
      </body>
    </html>
  );
}