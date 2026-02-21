import ContactSection from '@/components/ContactSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Kontakt | Urwis Białobrzegi - Zabawki, Art. Szkolne i Biurowe",
  description: "Szukasz zabawek, wyprawki szkolnej lub artykułów biurowych w Białobrzegach? Skontaktuj się z nami! Znajdziesz nas przy ul. Reymonta 38A. Zapraszamy!",
  openGraph: {
    title: "Kontakt | Urwis Białobrzegi - Sklep dla Dzieci i Biura",
    description: "Zadzwoń, napisz lub odwiedź nas osobiście. Największy wybór zabawek oraz artykułów szkolnych i biurowych w Białobrzegach.",
  }
};

export default function KontaktPage() {
  return <ContactSection />;
}