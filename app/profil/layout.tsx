import type { Metadata } from 'next';

// Strona jest komponentem klienckim, więc metadane muszą być w layoucie
export const metadata: Metadata = {
  title: "Mój profil",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
