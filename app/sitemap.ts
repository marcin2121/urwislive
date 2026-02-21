import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sklep-urwis.pl';

  // Definiujemy główne ścieżki, które mają być indeksowane
  const routes = [
    '',
    '/o-nas',
    '/kontakt',
    '/salazabaw',
    '/oferta',
    '/oferta/zabawki',
    '/oferta/gry',
    '/oferta/szkola',
    '/oferta/imprezy',
    '/oferta/promocje',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/oferta/promocje' ? 'daily' : 'weekly', // Promocje sprawdzane częściej
    priority: route === '' ? 1 : 0.8, // Strona główna ma najwyższy priorytet
  }));
}