import { Metadata } from 'next';
import ClientLobby from '@/components/ClientLobby';

// ==========================================
// OPTYMALIZACJA SEO (METADATA) DLA GOOGLE
// ==========================================
export const metadata: Metadata = {
  title: 'Darmowe Kolorowanki Online dla Dzieci | Sklep Urwis',
  description: 'Odkryj interaktywne kolorowanki dla dzieci. Maluj online, baw się i pobieraj darmowe obrazki do druku. Idealna kreatywna zabawa edukacyjna w Akademii Urwisa!',
  keywords: 'kolorowanki dla dzieci, kolorowanki online, darmowe malowanki, gry edukacyjne, zabawy dla dzieci, sklep urwis, akademia urwisa, kolorowanki do druku',
  openGraph: {
    title: 'Interaktywne Kolorowanki dla Dzieci | Studio Urwisa',
    description: 'Wirtualny pędzel, mnóstwo kolorów i świetna zabawa. Wejdź i stwórz własne dzieło sztuki zupełnie za darmo!',
    url: 'https://www.sklep-urwis.pl/kolorowanki',
    siteName: 'Sklep Urwis',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function KolorowankiPage() {
  return (
    // Renderowanie komponentu klienckiego z logiką gry
    <ClientLobby />
  );
}