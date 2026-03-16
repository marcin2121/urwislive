import KlockiGame from '@/components/urwisek/games/KlockiGame'

export const metadata = {
  title: 'Klocki Urwisa | Sklep Urwis',
  description: 'Graj w wciągającą grę logiczną z klockami na planszy 9x9!',
}

export default function KlockiGamePage() {
  return (
    <div className="fixed inset-0 z-[1000] bg-[#050712] overflow-hidden flex flex-col items-center justify-center p-0 m-0">
      {/* Ambient background colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
         <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
         <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full h-full relative z-10 flex flex-col p-0 m-0">
        <div className="bg-slate-950/40 md:border md:border-slate-800/40 md:rounded-3xl shadow-2xl flex-1 flex flex-col overflow-hidden relative w-full h-full">
           <KlockiGame />
        </div>
      </div>
    </div>
  )
}
