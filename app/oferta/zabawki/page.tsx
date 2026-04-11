import ZabawkiSection from '@/components/ZabawkiSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Sklep z Zabawkami Białobrzegi | LEGO, Barbie, Bruder - Urwis",
  description: "Szukasz wymarzonego prezentu? 🧸 Sklep Urwis w Białobrzegach to prawdziwe królestwo zabawek! Najnowsze LEGO, lalki Barbie i auta Hot Wheels czekają na Ciebie przy ul. Reymonta 38A. Spełniamy dziecięce marzenia!",
  keywords: ["sklep z zabawkami Białobrzegi", "prezent dla dziecka", "LEGO Białobrzegi", "klocki dla dzieci", "lalki dla dziewczynek", "auta dla chłopców", "zabawki edukacyjne"],
  openGraph: {
    title: "Urwis Białobrzegi - Tu Mieszkają Twoje Ulubione Zabawki",
    description: "Od klocków LEGO po przytulanki i gry. Największy wybór zabawek w Białobrzegach, profesjonalne doradztwo i najniższe ceny w regionie!",
    url: 'https://www.sklep-urwis.pl/oferta/zabawki',
    type: 'website',
  }
};

const toySchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Kategorie zabawek w Sklepie Urwis Białobrzegi",
  "description": "Największy wybór klocków LEGO, lalek, pojazdów i gier edukacyjnych w regionie.",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Klocki LEGO i Konstrukcje",
      "description": "Zestawy LEGO Technic, City, Friends, Duplo oraz klocki Cobi."
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Lalki i Figurki",
      "description": "Barbie, L.O.L. Surprise, Baby Born oraz figurki Schleich."
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Pojazdy i RC",
      "description": "Bruder, Hot Wheels oraz pojazdy sterowane radiowo."
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Gry i Edukacja",
      "description": "Gry planszowe Clementoni, Trefl i edukacyjne zestawy naukowe."
    }
  ]
};

export default function ZabawkiPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toySchema) }}
      />
      <ZabawkiSection />
    </>
  );
}