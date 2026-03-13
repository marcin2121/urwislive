'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const ChatContent = dynamic(() => import('./ChatContent'), {
  ssr: false,
  loading: () => <div className="w-full md:w-[400px] h-[65dvh] md:h-[550px] bg-white rounded-[2rem] shadow-xl animate-pulse flex items-center justify-center text-zinc-400 font-bold uppercase tracking-widest text-xs">Ładowanie czatu...</div>
});

export function UrwisChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="fixed z-[100] font-sans bottom-[90px] right-3 md:bottom-6 md:right-6 flex flex-col items-end pointer-events-none"
    >
      {isOpen && (
        <ChatContent onClose={() => setIsOpen(false)} />
      )}

      {/* Przycisk toggle wraz z zachętą i pierścieniem pulsowania */}
      <div className="relative pointer-events-auto">
        
        {/* Wyskakujący WIDŻET Powitalny (Kropeczki) */}
        {!isOpen && (
          <div 
            onClick={() => setIsOpen(true)}
            className="absolute -top-12 right-1 flex items-center justify-center bg-white border-2 border-zinc-300 px-3 py-2.5 rounded-full shadow-md animate-bounce cursor-pointer hover:bg-zinc-50 transition-colors z-20"
          >
            <div className="absolute bottom-[-6px] right-4 w-2.5 h-2.5 bg-white border-b-2 border-r-2 border-zinc-300 transform rotate-45"></div>
            {/* Animowane kropeczki */}
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}

        {/* Pierścień pulsujący wokół przycisku */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full border-[3px] border-[#0055ff] opacity-40 animate-ping [animation-duration:3s]" />
        )}

        <Button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Zamknij czat" : "Otwórz czat z Urwisem"}
          className={`relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg md:shadow-[0_10px_30px_rgba(0,85,255,0.4)] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center p-0 overflow-hidden border-2 md:border-4 bg-white ${
            isOpen ? 'border-[#BF2024]' : 'border-[#0055ff]'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 md:w-8 md:h-8 text-[#BF2024] animate-in fade-in zoom-in duration-200" strokeWidth={3} />
          ) : (
            <img src="/urwischat.webp" alt="Urwis" className="w-[110%] h-[110%] object-cover animate-in fade-in zoom-in duration-200 pt-0.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
