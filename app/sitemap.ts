import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sklep-urwis.pl' 

  // Definiujemy główne ścieżki
  const routes = [
    '',
    '/o-nas',
    '/oferta',
    '/oferta/zabawki',
    '/oferta/szkola',
    '/oferta/imprezy',
    '/oferta/gry',
    '/kontakt',
    '/salazabaw',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1.0 : route.startsWith('/oferta/') ? 0.8 : 0.5,
  }))
}