import ImprezySection from '@/components/ImprezySection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Balony z Helem i Dekoracje Białobrzegi | Sklep Urwis",
  description: "Największy wybór balonów z helem, dekoracji urodzinowych i przebrań w Białobrzegach! 🎈 Pompujemy helem na miejscu. Stwórz niezapomnianą imprezę ze Sklepem Urwis!",
  keywords: ["balony z helem Białobrzegi", "dekoracje urodzinowe", "stroje karnawałowe Białobrzegi", "świeczki na tort", "hel do balonów", "artykuły imprezowe"],
  openGraph: {
    title: "Balony i Dekoracje Imprezowe w Sklepie Urwis - Białobrzegi",
    description: "Planujesz urodziny lub chrzciny? Mamy wszystko: balony z helem, talerzyki, świeczki i przebrania. Odwiedź nas przy ul. Reymonta 38A!",
    url: 'https://sklep-urwis.pl/oferta/imprezy',
    type: 'website',
  }
};

export default function ImprezyPage() {
  return <ImprezySection />;
}