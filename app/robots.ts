import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',    // Blokujemy dostęp do panelu administratora
        '/karta',    // Blokujemy dostęp do portfela lojalnościowego
        '/regulamin', // Blokujemy regulaminy z indeksowania
      ],
    },
    sitemap: 'https://sklep-urwis.pl/sitemap.xml',
  };
}