import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Oferta i Kategorie | Sklep Urwis Białobrzegi",
  description: "Poznaj pełną ofertę Sklepu Urwis w Białobrzegach. Szeroki wybór zabawek, klocków LEGO, artykułów szkolnych, gier planszowych oraz profesjonalne pompowanie balonów helem.",
  keywords: [
    "oferta sklep urwis",
    "zabawki białobrzegi",
    "balony z helem białobrzegi",
    "wyprawka szkolna białobrzegi",
    "gry planszowe białobrzegi",
    "laminacja książek białobrzegi"
  ],
  openGraph: {
    title: "Oferta i Kategorie | Sklep Urwis Białobrzegi",
    description: "Wszystko dla Twojego dziecka w jednym miejscu. Sprawdź nasze zabawki, artykuły szkolne i akcesoria imprezowe.",
    url: 'https://www.sklep-urwis.pl/oferta',
  },
};

export default function OfertaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* Layout dla sekcji oferta nie wymaga dodatkowych owijaczy, 
          ponieważ globals.css i główne kontenery są w RootLayout */}
      {children}
    </section>
  );
}