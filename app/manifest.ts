import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sklep Urwis - Zabawki i Artykuły Szkolne',
    short_name: 'Sklep Urwis',
    description: 'Najlepszy sklep z zabawkami, wyprawką szkolną i balonami z helem w Białobrzegach przy ul. Reymonta 38A.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0055ff',
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
  }
}