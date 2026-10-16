import { MetadataRoute } from 'next';

// Bez lastModified/priority/changeFrequency: Google ignoruje priority i changefreq,
// a data ustawiana na moment builda (jak wcześniej) uczy go nie ufać lastmod.
// /regulamin pominięty celowo - ma noindex.
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.sklep-urwis.pl';

  const paths = [
    '',
    '/oferta',
    '/oferta/zabawki',
    '/oferta/gry',
    '/oferta/szkola-i-biuro',
    '/oferta/imprezy',
    '/oferta/promocje',
    '/salazabaw',
    '/kontakt',
    '/rabaty',
    '/aktualnosci',
    '/poznaj-urwisa',
    '/polityka-prywatnosci',
    '/strefa-zabawy',
    '/strefa-zabawy/kolorowanki',
    '/strefa-zabawy/urwisek',
    '/strefa-zabawy/urwisar',
  ];

  return paths.map((path) => ({ url: `${baseUrl}${path}` }));
}
