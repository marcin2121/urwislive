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

export default function SzkolaPage() {
  return <SzkolaSection />;
}