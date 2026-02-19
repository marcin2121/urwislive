import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regulamin i Prywatność | Sklep Urwis Białobrzegi",
  description: "Zasady korzystania z serwisu Sklepu Urwis w Białobrzegach. Dowiedz się więcej o ochronie Twoich danych.",
  robots: "noindex, follow", // Prawne strony zazwyczaj nie muszą walczyć o SEO, ale warto by linki działały
};

export default function RegulaminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}