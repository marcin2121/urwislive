import PromocjeSection from '@/components/PromocjeSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Promocje i Okazje Białobrzegi | Zabawki i Art. Szkolne - Sklep Urwis",
  description: "Łap gorące okazje w Sklepie Urwis! 🏷️ Najlepsze promocje na zabawki, gry i wyprawkę szkolną w Białobrzegach. Sprawdź aktualne rabaty i rezerwuj produkty online!",
  keywords: ["promocje zabawki Białobrzegi", "tania wyprawka szkolna", "wyprzedaż gier planszowych", "okazje cenowe Białobrzegi", "sklep urwis rabaty"],
  openGraph: {
    title: "Gorące Okazje w Sklepie Urwis - Białobrzegi",
    description: "Zabawki, klocki i artykuły biurowe w najniższych cenach. Nie czekaj, aż okazja ucieknie!",
    url: 'https://sklep-urwis.pl/oferta/promocje',
    type: 'website',
  }
};

export default function PromocjePage() {
  return <PromocjeSection />;
}