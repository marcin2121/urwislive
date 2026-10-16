import type { Metadata } from 'next';

// Strona jest komponentem klienckim, więc metadane muszą być w layoucie
export const metadata: Metadata = {
  title: "Poznaj Urwisa – o nas",
  description: "Poznaj Sklep Urwis w Białobrzegach: zabawki, klocki LEGO i artykuły szkolne przy ul. Reymonta 38A. Zobacz, kim jesteśmy!",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
