import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sklep Urwis — Królestwo Zabawy i Rozwoju',
    short_name: 'Sklep Urwis',
    description: 'Nowoczesne centrum zabawek i artykułów szkolnych w Białobrzegach. Wspieramy zdrowy rozwój dzieci poprzez mądrą zabawę, zaawansowane gry edukacyjne i technologię AR.',
    id: 'pl.sklep-urwis.pwa', // 🚀 Top 1%: Unikalny identyfikator aplikacji
    start_url: '/',
    scope: '/', // 🚀 Top 1%: Precyzyjny zakres działania
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0055ff',
    prefer_related_applications: false, // 🚀 Top 1%: Wymuszanie pierwszeństwa PWA
    orientation: 'any',
    categories: ['shopping', 'kids', 'education', 'game'], // 🚀 SEO: Rozszerzona kategoryzacja PWA
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    // Rejestracja aplikacji w menu udostępniania telefonu
    share_target: {
      action: '/share-target',
      method: 'GET',
      enctype: 'application/x-www-form-urlencoded',
      params: {
        title: 'title',
        text: 'text',
        url: 'url'
      }
    },
    // 🚀 SKRÓTY: Dodaliśmy Salę Zabaw, bo to kluczowa fraza z Twoich danych!
    shortcuts: [
      {
        name: "Sala Zabaw - Lecę w Kulki",
        short_name: "Sala Zabaw",
        description: "Zarezerwuj urodziny lub sprawdź kawiarnię",
        url: "/salazabaw",
        icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }]
      },
      {
        name: "Gorące Promocje",
        short_name: "Promocje",
        description: "Sprawdź najnowsze okazje u Urwisa",
        url: "/rabaty",
        icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }]
      },
      {
        name: "Kontakt i Dojazd",
        short_name: "Kontakt",
        description: "Zapytaj o LEGO lub wyprawkę",
        url: "/kontakt",
        icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }]
      }
    ]
  }
}