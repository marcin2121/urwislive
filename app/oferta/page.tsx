import OfertaContent from '@/components/OfertaContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Oferta Sklepu Urwis | Zabawki, LEGO i Artykuły Szkolne Białobrzegi",
  description: "Poznaj pełną ofertę Sklepu Urwis w Białobrzegach. 🧸 Największy wybór klocków LEGO, wyprawka szkolna, balony z helem oraz gry planszowe. Wszystko dla Twojego dziecka na Reymonta 38A!",
  keywords: ["sklep urwis oferta", "zabawki białobrzegi", "klocki lego białobrzegi", "balony z helem", "wyprawka szkolna białobrzegi", "artykuły biurowe"],
  openGraph: {
    title: "Sklep Urwis Białobrzegi - Więcej niż zabawki",
    description: "Sprawdź nasze kategorie: od klocków LEGO po akcesoria imprezowe i artykuły szkolne. Najlepsze marki w jednym miejscu!",
    url: 'https://www.sklep-urwis.pl/oferta',
    type: 'website',
  },
};

export default function OfertaPage() {
  return <OfertaContent />;
}