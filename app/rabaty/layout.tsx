import type { Metadata } from 'next';

// Strona jest komponentem klienckim, więc metadane muszą być w layoucie
export const metadata: Metadata = {
  title: "Rabaty i Koło Fortuny",
  description: "Zakręć Kołem Fortuny i odbierz kupon rabatowy do Sklepu Urwis w Białobrzegach. Codzienne losowanie zniżek na zabawki i artykuły szkolne!",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
