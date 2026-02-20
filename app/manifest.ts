import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sklep Urwis - Zabawki i Artykuły Szkolne',
    short_name: 'Sklep Urwis',
    description: 'Największy wybór zabawek, gier i artykułów imprezowych w Białobrzegach przy ul. Reymonta 38A.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0055ff',
    orientation: 'portrait',
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
    // DODANO: Skróty pod ikoną aplikacji
    shortcuts: [
      {
        name: "Aktualne Promocje",
        short_name: "Promocje",
        description: "Sprawdź najnowsze okazje w Sklepie Urwis",
        url: "/oferta/promocje",
        icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }]
      },
      {
        name: "Kontakt i Mapa",
        short_name: "Kontakt",
        description: "Jak do nas dojechać?",
        url: "/kontakt",
        icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }]
      }
    ]
  }
}