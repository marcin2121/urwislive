import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',    // Blokujemy dostęp do panelu administratora
        '/regulamin', // Blokujemy regulaminy z indeksowania
        '/api'
      ],
    },
    sitemap: 'https://www.sklep-urwis.pl/sitemap.xml',
  };
}