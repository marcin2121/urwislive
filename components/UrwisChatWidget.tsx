'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, User, X, Minus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function UrwisChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  const { messages, error, stop, sendMessage, status } = useChat({
    id: 'urwis-widget',
  });

  const isLoading = status === 'submitted' || status === 'streaming';
  const isInputEmpty = input.trim() === '';

  // Scroll tylko przy otwarciu czatu
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 150);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div
  className="fixed z-[100] font-sans top-[7px] right-2 md:top-auto md:bottom-6 md:right-6 flex flex-col items-end pointer-events-none">

      {isOpen && (
        <Card className="w-full md:w-[400px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] bg-white border-0 overflow-hidden flex flex-col h-[65dvh] md:h-[550px] mt-16 md:mt-0 mb-4 animate-in slide-in-from-top-10 md:slide-in-from-bottom-10 fade-in duration-300 rounded-[2rem] pointer-events-auto">

          {/* NAGŁÓWEK */}
          <CardHeader className="bg-gradient-to-r from-[#BF2024] to-[#0055ff] text-white p-3 md:p-4 shrink-0 flex flex-row items-center justify-between border-b-4 border-yellow-400">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded-full shadow-inner overflow-hidden w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-2 border-white/20">
                <img src="/urwischat.webp" alt="Urwis" className="w-full h-full object-cover scale-110" />
              </div>
              <div>
                <CardTitle className="text-lg md:text-xl font-black italic uppercase tracking-tighter drop-shadow-md leading-none">
                  Wirtualny Urwis
                </CardTitle>
                <p className="text-[10px] md:text-xs text-blue-100 font-bold uppercase tracking-widest opacity-90 drop-shadow-sm mt-0.5">
                  {isLoading ? (
                    <span className="animate-pulse">pisze...</span>
                  ) : (
                    'Superbohater Sklepu'
                  )}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 hover:text-white rounded-full transition-colors active:scale-95 w-8 h-8 md:w-10 md:h-10"
            >
              <Minus className="w-5 h-5 md:w-6 md:h-6" />
            </Button>
          </CardHeader>

          {/* ZAWARTOŚĆ */}
          <CardContent
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-3 md:p-4 flex flex-col gap-3 bg-zinc-50"
          >
            {error ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 animate-in fade-in">
                <img src="/urwissleep.webp" alt="Urwis Śpi" className="w-24 h-24 md:w-32 md:h-32 drop-shadow-lg object-contain" />
                <p className="text-[11px] md:text-sm font-bold text-zinc-600 px-4 tracking-tight">
                  <span className="text-sm md:text-lg text-zinc-800 uppercase italic font-black block mb-1">Zzz...</span>
                  Urwis poszedł spać! Wykorzystano limit zapytań lub wystąpił błąd.
                </p>
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium max-w-[90%] text-left break-words">
                  <span className="font-bold">Błąd:</span> {error.message || 'Nieznany błąd serwera.'}
                </div>
                <Button variant="outline" size="sm" onClick={() => stop()} className="h-8 text-xs font-bold rounded-full">
                  Odblokuj wpisywanie
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                <img src="/urwischat.webp" alt="Urwis" className="w-24 h-24 md:w-28 md:h-28 drop-shadow-2xl animate-bounce-slow object-contain" />
                <div className="space-y-1">
                  <p className="text-xs md:text-sm font-black text-zinc-700 uppercase tracking-tight italic">
                    Cześć! Jestem Urwis.
                  </p>
                  <p className="text-xs text-zinc-500 font-medium">
                    Zapytaj o produkty, godziny, atrakcje 🦸‍♂️
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map(m => (
                  <div
                    key={m.id}
                    className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[88%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end`}>

                      {/* Avatar */}
                      <div className="shrink-0 mb-1">
                        {m.role === 'user' ? (
                          <div className="bg-zinc-200 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <User className="w-3.5 h-3.5 text-zinc-500" />
                          </div>
                        ) : (
                          <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#0055ff] overflow-hidden shadow-sm shrink-0">
                            <img src="/urwischat.webp" alt="Urwis" className="w-full h-full object-cover scale-110" />
                          </div>
                        )}
                      </div>

                   <div className={`rounded-[1.25rem] px-3 md:px-4 py-2.5 text-base md:text-sm shadow-sm font-medium leading-relaxed ${
  m.role === 'user'
    ? 'bg-zinc-900 text-white rounded-br-sm'
    : 'bg-white text-zinc-800 border border-zinc-200 rounded-bl-sm'
}`}>
  {m.parts?.map((part, i) =>
    part.type === 'text' ? (
     <ReactMarkdown
  key={i}
  components={{
    a: (props) => {
      const { href, children } = props;
      return (
        <a
          href={href ?? '#'}
          className="text-[#0055ff] font-bold underline underline-offset-2 hover:text-blue-800 transition-colors cursor-pointer"
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => (
      <strong className="font-black text-zinc-900">{children}</strong>
    ),
    p: ({ children }) => (
      <span className="whitespace-pre-wrap">{children}</span>
    ),
  }}
>
  {part.text}
</ReactMarkdown>

    ) : null

                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Animacja "pisze" */}
                {status === 'submitted' && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 items-end">
                      <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#0055ff] overflow-hidden shadow-sm">
                        <img src="/urwischat.webp" alt="Urwis" className="w-full h-full object-cover scale-110" />
                      </div>
                      <div className="bg-white border border-zinc-200 rounded-[1.25rem] rounded-bl-sm px-4 py-3 shadow-sm">
                        <div className="flex gap-1 items-center h-4">
                          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </CardContent>

          {/* FORMULARZ */}
          <CardFooter className="p-2.5 md:p-3 bg-white border-t border-zinc-100 shrink-0 z-10">
            <form onSubmit={handleSubmit} className="flex w-full gap-2 items-center">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={error ? 'Urwis teraz śpi...' : 'Napisz do Urwisa...'}
                className="flex-1 rounded-full border-2 border-zinc-200 focus-visible:ring-[#0055ff] focus-visible:border-[#0055ff] bg-zinc-50 font-medium text-base md:text-sm h-11 md:h-12 px-5 shadow-inner"
                disabled={isLoading || !!error}
                autoComplete="off"
              />
              <Button
                type="submit"
                size="icon"
                className={`rounded-full w-11 h-11 md:w-12 md:h-12 shrink-0 shadow-md border-2 transition-all duration-200 ${
                  isLoading || isInputEmpty
                    ? 'bg-zinc-100 border-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed'
                    : 'bg-gradient-to-br from-[#0055ff] to-blue-700 hover:scale-105 active:scale-95 border-blue-400/50 text-white'
                }`}
                disabled={isLoading || isInputEmpty || !!error}
              >
                <Send className="w-4 h-4 md:w-5 md:h-5 ml-0.5" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      {/* Przycisk toggle */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 md:w-16 md:h-16 rounded-full shadow-lg md:shadow-[0_10px_30px_rgba(0,85,255,0.4)] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center p-0 overflow-hidden border-2 md:border-4 bg-white pointer-events-auto ${
          isOpen ? 'border-[#BF2024]' : 'border-[#0055ff]'
        }`}
      >
        {isOpen ? (
          <X className="w-5 h-5 md:w-8 md:h-8 text-[#BF2024] animate-in fade-in zoom-in duration-200" strokeWidth={3} />
        ) : (
          <img src="/urwischat.webp" alt="Uruchom czat" className="w-[110%] h-[110%] object-cover animate-in fade-in zoom-in duration-200 pt-0.5" />
        )}
      </Button>
    </div>
  );
}
