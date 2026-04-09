import BubbleShooter from '@/components/urwisek/games/BubbleShooter'

export const metadata = {
  title: 'Lecę w Kulki | Sklep Urwis',
  description: 'Graj w kultową grę Bubble Shooter i bij rekordy w strefie Urwiska!',
}

export default function BubbleShooterPage() {
  return (
    // Zmiana na absolute inset-0 rozwiązuje problem skakania 100dvh
    <div className="fixed inset-0 z-[1000] bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-0 m-0">
      {/* Kolorowe tło ambientowe */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
         <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
         <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full h-full relative z-10 flex flex-col p-0 m-0">
        <div className="bg-slate-950/80 md:border md:border-slate-800 md:rounded-3xl shadow-2xl flex-1 flex flex-col overflow-hidden relative w-full h-full">
           <BubbleShooter />
        </div>
      </div>
    </div>
  )
}