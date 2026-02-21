import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Oferta Sklepu Urwis Białobrzegi | LEGO, Szkoła i Biuro",
  description: "Odkryj świat zabawek i profesjonalne zaopatrzenie dla ucznia oraz firmy w Białobrzegach. 🧸 Największy wybór klocków LEGO, wyprawka szkolna i artykuły biurowe czekają na Reymonta 38A!",
  keywords: [
    "sklep urwis białobrzegi",
    "zabawki dla dzieci białobrzegi",
    "klocki lego białobrzegi",
    "wyprawka szkolna białobrzegi",
    "artykuły biurowe białobrzegi",
    "sklep z zabawkami reymonta",
    "gry planszowe białobrzegi",
    "prezenty dla dziecka"
  ],
  openGraph: {
    title: "Oferta Sklepu Urwis - Najlepsze Zabawki i Artykuły Szkolne",
    description: "Wszystko czego potrzebuje Twoje dziecko i Twoje biuro w jednym miejscu w Białobrzegach. Sprawdź nasze kategorie produktowe!",
    url: 'https://www.sklep-urwis.pl/oferta', // 🚀 Dodano www
    type: 'website',
  },
};

export default function OfertaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* Layout pełni rolę kontenera metadanych dla wszystkich podstron oferty */}
      {children}
    </section>
  );
}