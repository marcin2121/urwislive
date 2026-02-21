import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Urwis Białobrzegi - LEGO i Szkoła',
    short_name: 'Sklep Urwis',
    description: 'Twoje centrum LEGO, artykułów szkolnych i biurowych w Białobrzegach. Zabawki, balony z helem i wyprawkę szkolną przy ul. Reymonta 38A.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0055ff',
    orientation: 'portrait',
    categories: ['shopping', 'kids', 'education'], // 🚀 SEO: Pomaga sklepom z aplikacjami kategoryzować PWA
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
        url: "/oferta/promocje",
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