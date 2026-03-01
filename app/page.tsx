import StoreFrontContent from '@/components/StoreFrontContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Sklep Urwis Białobrzegi | LEGO, Zabawki, Artykuły Szkolne i Biurowe",
  description: "Królestwo zabawek i profesjonalne centrum szkolno-biurowe w Białobrzegach. 🧸 Najlepsze ceny LEGO, balony z helem i pełna wyprawka. Odwiedź nas na ul. Reymonta 38A!",
  alternates: {
    canonical: 'https://www.sklep-urwis.pl',
  },
  openGraph: {
    title: "Sklep Urwis Białobrzegi - Twoje Centrum Zabawy i Nauki",
    description: "Ponad 1000 pomysłów na prezent, największy wybór klocków LEGO w regionie i wszystko do biura. Sprawdź nasze promocje!",
    url: 'https://www.sklep-urwis.pl',
    siteName: 'Sklep Urwis Białobrzegi',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Front Sklepu Urwis w Białobrzegach przy ul. Reymonta 38A',
      },
    ],
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function HomePage() {
  return <StoreFrontContent />;
}