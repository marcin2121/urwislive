import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.sklep-urwis.pl';

  const routes = [
    { path: '', priority: 1, changeFreq: 'weekly' as const },
    { path: '/aktualnosci', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/poznaj-urwisa', priority: 0.8, changeFreq: 'monthly' as const },
    { path: '/kontakt', priority: 0.8, changeFreq: 'monthly' as const },
    { path: '/salazabaw', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/rabaty', priority: 0.9, changeFreq: 'daily' as const },
    { path: '/regulamin', priority: 0.3, changeFreq: 'yearly' as const },
    { path: '/polityka-prywatnosci', priority: 0.3, changeFreq: 'yearly' as const },
    { path: '/strefa-zabawy', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/strefa-zabawy/urwisek', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/strefa-zabawy/kolorowanki', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/strefa-zabawy/urwisar', priority: 0.6, changeFreq: 'monthly' as const },
    { path: '/oferta', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/oferta/zabawki', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/oferta/gry', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/oferta/szkola-i-biuro', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/oferta/imprezy', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/oferta/promocje', priority: 0.9, changeFreq: 'daily' as const },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }));
}