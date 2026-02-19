import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
      <div className="relative w-64 h-64 mb-8">
         <Image 
           src="/Urwis-Register.webp" 
           alt="Zagubiony Urwis"
           fill
           className="object-contain opacity-00"
         />
      </div>

      <h1 className="text-6xl font-black text-blue-600 mb-4 z-100  tracking-tighter">
        404
      </h1>
      
      <h2 className="text-2xl font-bold text-zinc-800 z-100 mb-4">
        Ojej! Urwis gdzieś schował tę stronę...
      </h2>
      
      <p className="text-zinc-500 mb-8 z-100 max-w-md">
        Wygląda na to, że link, którego szukasz, nie istnieje.
      </p>

      <Link 
        href="/"
        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors z-100 shadow-lg"
      >
        Wróć do bazy
      </Link>
    </div>
  )
}