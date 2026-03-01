import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.sklep-urwis.pl';

  // Definiujemy główne ścieżki, które mają być indeksowane
  const routes = [
    '',
    '/poznaj-urwisa',
    '/strefa-zabawy',
    '/strefa-zabawy/urwisek',
    '/strefa-zabawy/kolorowanki',
    '/strefa-zabawy/urwisar',
    '/oferta',
    '/oferta/zabawki',
    '/oferta/gry',
    '/oferta/szkola-i-biuro',
    '/oferta/imprezy',
    '/oferta/promocje',
  ];
  const productItems = Array.from({ length: 16 }, (_, i) => ({
    url: `${baseUrl}/?produkt=${i + 1}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/oferta/promocje' ? 'daily' : 'weekly', // Promocje sprawdzane częściej
    priority: route === '' ? 1 : 0.8, // Strona główna ma najwyższy priorytet
  }));
}