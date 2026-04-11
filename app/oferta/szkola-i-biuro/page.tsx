import SzkolaSection from '@/components/SzkolaSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Artykuły Szkolne i Biurowe Białobrzegi | Wyprawka - Sklep Urwis",
  description: "Kompletna wyprawka szkolna i artykuły biurowe w Białobrzegach! 🎒 Plecaki, zeszyty, artykuły plastyczne i biurowe. Marki: Bambino, Oxford, Stabilo, Herlitz. Zapraszamy do Sklepu Urwis!",
  keywords: ["artykuły szkolne Białobrzegi", "wyprawka szkolna", "plecaki szkolne", "zeszyty Oxford", "artykuły biurowe", "papier ksero Białobrzegi", "akcesoria biurowe"],
  openGraph: {
    title: "Szkoła i Biuro w Sklepie Urwis - Wszystko dla ucznia i firmy",
    description: "Przygotuj się na nowy rok szkolny lub doposaż swoje biuro. Największy wybór artykułów papierniczych i piśmienniczych w Białobrzegach przy ul. Reymonta 38A.",
    url: 'https://www.sklep-urwis.pl/oferta/szkola-i-biuro',
    type: 'website',
  }
};

const schoolSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Wyprawka szkolna i artykuły biurowe w Białobrzegach - Sklep Urwis",
  "description": "Kompletna oferta dla uczniów i firm: plecaki, zeszyty Oxford, artykuły plastyczne i biurowe.",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Wyprawka Szkolna",
      "description": "Zeszyty, piórniki, farby i akcesoria marek Bambino, Oxford, Herlitz."
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Plecaki i Tornistry",
      "description": "Ergonomiczne plecaki St.Right, CoolPack, Herlitz dbające o kręgosłup."
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Artykuły Plastyczne",
      "description": "Kredki, farby, bloki rysunkowe i techniczne dla małych artystów."
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Biuro i Firma",
      "description": "Papier ksero, segregatory, tusze i kluczowe materiały eksploatacyjne."
    }
  ]
};

export default function SzkolaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schoolSchema) }}
      />
      <SzkolaSection />
    </>
  );
}