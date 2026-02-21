import AboutSection from '@/components/O-nasSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "O nas | Urwis Białobrzegi - Centrum Zabawy, Szkoły i Biura",
  description: "Poznaj historię Urwisa w Białobrzegach. Od najlepszych zabawek i pełnej wyprawki szkolnej po szalone przygody w Sali Zabaw Lecę w Kulki. Dowiedz się, dlaczego jesteśmy więcej niż tylko sklepem!",
  openGraph: {
    title: "O nas | Urwis Białobrzegi - Pasja i Radość Odkrywania",
    description: "Tworzymy miejsce, gdzie zabawa łączy się z edukacją. Odkryj nasz sklep z zabawkami, artykułami biurowymi oraz Salę Zabaw w sercu Białobrzegów.",
  }
};

export default function AboutPage() {
  return <AboutSection />;
}