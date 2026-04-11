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

const ofertaSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Pełna oferta Sklepu Urwis Białobrzegi",
  "description": "Zabawki, LEGO, wyprawka szkolna, artykuły biurowe oraz balony z helem.",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "url": "https://www.sklep-urwis.pl/oferta/zabawki",
      "name": "Klocki LEGO & Zabawki"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "url": "https://www.sklep-urwis.pl/oferta/szkola-i-biuro",
      "name": "Wyprawka Szkolna"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "url": "https://www.sklep-urwis.pl/oferta/imprezy",
      "name": "Party & Balony z Helem"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "url": "https://www.sklep-urwis.pl/oferta/gry",
      "name": "Gry Planszowe & Edu"
    }
  ]
};

export default function OfertaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ofertaSchema) }}
      />
      <OfertaContent />
    </>
  );
}