import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sklep Urwis - Zabawki i Artykuły Szkolne',
    short_name: 'Sklep Urwis',
    description: 'Największy wybór zabawek, gier i artykułów imprezowych w Białobrzegach przy ul. Reymonta 38A.',
    start_url: '/',
    display: 'standalone', // Dzięki temu zachowuje się jak apka (bez paska URL)
    background_color: '#ffffff',
    theme_color: '#0055ff', // Główny niebieski kolor Twojej marki
    orientation: 'portrait', // Wymusza tryb pionowy (najlepszy dla telefonu)
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
        purpose: 'maskable', // Pozwala systemom (np. Android) ładnie zaokrąglać ikonę
      },
    ],
  }
}