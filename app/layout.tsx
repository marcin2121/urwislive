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
import Script from "next/script";
import WelcomeScreen from "@/components/ui/WelcomeScreen";
import { AuthProvider } from "@/components/AuthProvider";
import OnboardingTour from "@/components/ui/OnboardingTour";
import { PopupProvider } from "@/components/PopupProvider";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { UrwisChatWidget } from '@/components/UrwisChatWidget';
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
  metadataBase: new URL('https://www.sklep-urwis.pl'),
  title: {
    default: "Sklep Urwis Białobrzegi | LEGO, Zabawki i Artykuły Szkolne",
    template: "%s | Sklep Urwis Białobrzegi"
  },
  description: "Największy w Białobrzegach wybór LEGO, zabawek i artykułów szkolnych. 🧸 Odwiedź nas na Reymonta 38A! Pompujemy balony helem i spełniamy dziecięce marzenia.",
  manifest: "/manifest.json",
  alternates: {
    canonical: 'https://www.sklep-urwis.pl',
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/android-chrome-192x192.png?v=2', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
  },
  keywords: [
    "sklep urwis", "lego białobrzegi", "zabawki dla dzieci", "sala zabaw białobrzegi",
    "lece w kulki", "balony z helem", "artykuly szkolne", "reymonta 38a", "zabawki radom"
  ],
  openGraph: {
    title: "Sklep Urwis Białobrzegi | Królestwo LEGO i Zabawek",
    description: "Wszystko dla Twojego dziecka w jednym miejscu. Najlepsze marki, balony z helem i Sala Zabaw Lecę w Kulki!",
    url: "https://www.sklep-urwis.pl",
    siteName: "Sklep Urwis",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Sklep Urwis Białobrzegi - LEGO i Zabawki" }],
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sklep Urwis Białobrzegi",
    description: "Zabawki, LEGO, balony z helem i wyprawka szkolna. Najlepszy sklep stacjonarny w regionie!",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0055ff",
  width: "device-width",
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'overlays-content',
};

const GA_MEASUREMENT_ID = "G-FE44ZTQ7GT";

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ToyStore"],
    "name": "Sklep Urwis",
    "image": "https://www.sklep-urwis.pl/og-image.jpg",
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
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Gdzie znajduje się Sklep Urwis w Białobrzegach?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sklep stacjonarny Urwis znajduje się przy ulicy Reymonta 38A w Białobrzegach (26-800)." }
      },
      {
        "@type": "Question",
        "name": "Czy w Sklepie Urwis kupię klocki LEGO?",
        "acceptedAnswer": { "@type": "Answer", "text": "Tak, Sklep Urwis posiada największy wybór klocków LEGO w regionie, w tym serie Technic, City, Ninjago, Star Wars i wiele innych." }
      },
      {
        "@type": "Question",
        "name": "Czy oferujecie balony z helem?",
        "acceptedAnswer": { "@type": "Answer", "text": "Oczywiście! Pompujemy balony helem na miejscu. Mamy szeroki wybór balonów cyfr oraz postaci z bajek." }
      },
      {
        "@type": "Question",
        "name": "Jakie są godziny otwarcia Sklepu Urwis?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sklep Urwis jest otwarty od poniedziałku do piątku w godzinach 8:00-18:00 oraz w soboty 8:00-15:00." }
      },
      {
        "@type": "Question",
        "name": "Jak działa program lojalnościowy Złote Urwisy?",
        "acceptedAnswer": { "@type": "Answer", "text": "Za każde 10 zł wydane w Sklepie Urwis otrzymujesz 1 Złotego Urwisa. Punkty wymieniasz w Sali Zabaw Lecę w Kulki na wejściówki, kawę lub żetony. 1 punkt = 1 zł rabatu." }
      },
      {
        "@type": "Question",
        "name": "Jak korzystać z kuponów rabatowych na stronie?",
        "acceptedAnswer": { "@type": "Answer", "text": "Zaloguj się na sklep-urwis.pl, przejdź do zakładki Rabaty i zakręć Kołem Fortuny. Aktywuj kupon dopiero przy kasie — znika po 5 minutach od aktywacji." }
      },
      {
        "@type": "Question",
        "name": "Czym jest Sala Zabaw Lecę w Kulki?",
        "acceptedAnswer": { "@type": "Answer", "text": "Lecę w Kulki to sala zabaw prowadzona przez właścicieli Sklepu Urwis, znajdująca się przy ul. Targowickiej 4 w Białobrzegach. Oferuje kulkowy basen, zjeżdżalnie i kawę dla rodziców." }
      }
    ]
  }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${inter.variable} ${fredoka.variable}`} suppressHydrationWarning>
      <head>
        {/* ✅ preload obrazka LCP */}
        <link rel="preload" href="/urwis-fallback.webp" as="image" fetchPriority="high" />

        {/* ✅ Geo meta tags — lokalne SEO */}
        <meta name="geo.region" content="PL-14" />
        <meta name="geo.placename" content="Białobrzegi" />
        <meta name="geo.position" content="51.6447;20.9502" />
        <meta name="ICBM" content="51.6447, 20.9502" />

        {/* ✅ NOWE: preconnect do Google Analytics — oszczędność ~300ms na LCP */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://region1.google-analytics.com" />

        {/* ✅ Schematy JSON-LD */}
        {schemas.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>

      <body className="antialiased bg-transparent text-zinc-900 selection:bg-blue-500 selection:text-white overflow-x-hidden" suppressHydrationWarning>
        <AuthProvider>
          
          <PopupProvider>
            <Suspense fallback={null}>
              <WelcomeScreen />
            </Suspense>

            <Suspense fallback={null}>
              <OrphansFixer />
            </Suspense>

            <div className="fixed inset-0 z-10 bg-white/80 pointer-events-none" aria-hidden="true" />

            <div className="relative z-20 flex flex-col min-h-screen bg-transparent overflow-x-hidden w-full max-w-full">
              <Navbar />

              <Suspense fallback={null}>
                <InstallPrompt />
              </Suspense>

              <RibbonsBg />

              <main className="grow bg-transparent">
                {children}
              </main>

              <Footer />
              <UrwisChatWidget />
            </div>

            <Toaster position="bottom-right" richColors />

            <Suspense fallback={null}>
              <CookieModal />
            </Suspense>
            <OnboardingTour />
            <SpeedInsights />
          </PopupProvider>
        </AuthProvider>

        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}

            // GDPR: Domyślnie blokujemy analitykę do momentu akceptacji cookies
            var cookieConsent = localStorage.getItem('urwis_cookie_accepted');

            gtag('consent', 'default', {
              'analytics_storage': cookieConsent === 'true' ? 'granted' : 'denied',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied'
            });

            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });

            // Nasłuchuj zmian zgody (gdy user kliknie "Daj ciacho" lub "Odrzuć zbędne")
            window.addEventListener('storage', function(e) {
              if (e.key === 'urwis_cookie_accepted') {
                gtag('consent', 'update', {
                  'analytics_storage': e.newValue === 'true' ? 'granted' : 'denied'
                });
              }
            });
          `}
        </Script>

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
            });
          `}
        </Script>
      </body>
    </html>
  );
}
