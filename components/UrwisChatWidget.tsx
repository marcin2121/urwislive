'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import type { UIMessage } from '@ai-sdk/react';
import type { UIToolInvocation } from 'ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Ghost, Sparkles, Send, User, X, Minus } from 'lucide-react';

export function UrwisChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [input, setInput] = useState('');

  // useChat przechowuje stan rozmowy. Najnowsza wersja (v5+) używa sendMessage i status zamiast isLoading/handleSubmit
  const { messages, error, stop, sendMessage, status } = useChat({
  id: 'urwis-widget',  // api usunięte — /api/chat jest domyślne
});


  const isLoading = status === 'submitted' || status === 'streaming';
  console.log("UrwisChatWidget state =>", { status, inputLength: input.length, error });

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isNearBottom);
  };

  // Automatyczne przewijanie na dół
  useEffect(() => {
    if (isOpen && autoScroll) {
      messagesEndRef.current?.scrollIntoView();
    }
  }, [messages, isOpen, autoScroll, error, status]);

  // Gdy użytkownik sam otworzy czat, automatycznie włącz przewijanie
  useEffect(() => {
    if (isOpen) {
      setAutoScroll(true);
      setTimeout(() => {
         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
sendMessage({ text: input });
    setInput('');
  };

  // Bezpieczne sprawdzenie wpisywanego tekstu
  const isInputEmpty = input.trim() === '';

  return (
    <div className="fixed z-[100] font-sans bottom-[85px] md:bottom-6 right-4 left-4 md:left-auto md:right-6 flex flex-col items-end pointer-events-none">
      
      {/* Okno czatu (widoczne tylko, gdy isOpen === true) */}
      {isOpen && (
        <Card className="w-full md:w-[400px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] bg-white border-0 overflow-hidden flex flex-col h-[65vh] md:h-[550px] mb-4 animate-in slide-in-from-bottom-10 fade-in duration-300 rounded-[2rem] pointer-events-auto">
          
          {/* NAGŁÓWEK */}
          <CardHeader className="bg-gradient-to-r from-[#BF2024] to-[#0055ff] text-white p-3 md:p-4 shrink-0 flex flex-row items-center justify-between border-b-4 border-yellow-400">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded-full shadow-inner overflow-hidden w-10 h-10 md:w-12 md:h-12 flex flex-col justify-center items-center border-2 border-white/20">
                <img src="/urwischat.webp" alt="Urwis" className="w-full h-full object-cover scale-110" />
              </div>
              <div>
                <CardTitle className="text-lg md:text-xl font-black italic uppercase tracking-tighter drop-shadow-md leading-none">
                  Wirtualny Urwis
                </CardTitle>
                <p className="text-[10px] md:text-xs text-blue-100 font-bold uppercase tracking-widest opacity-90 drop-shadow-sm mt-0.5">
                  Superbohater Sklepu
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
          
          {/* ZAWARTOSC CZATU */}
          <CardContent 
            className="flex-1 overflow-y-auto p-3 md:p-4 flex flex-col gap-4 bg-zinc-50"
            ref={scrollContainerRef}
            onScroll={handleScroll}
          >
            {error ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-2 md:gap-4 mt-4 animate-in fade-in flex-1">
                <img src="/urwissleep.webp" alt="Urwis Śpi" className="w-24 h-24 md:w-32 md:h-32 drop-shadow-lg object-contain" />
                <p className="text-[11px] md:text-sm font-bold text-zinc-600 px-4 md:px-6 tracking-tight">
                  <span className="text-sm md:text-lg text-zinc-800 uppercase italic font-black block mb-1">Zzz...</span>
                  Urwis poszedł spać! Wykorzystano cały limit zapytań do AI lub wystąpił inny błąd.
                </p>
                {/* Pokazujemy faktyczny błąd, aby ułatwić debugowanie */}
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs md:text-[11px] text-red-600 font-medium max-w-[90%] text-left break-words overflow-hidden">
                  <span className="font-bold">Błąd:</span> {error.message || "Nieznany błąd serwera."}
                </div>
                <Button variant="outline" size="sm" onClick={() => stop()} className="mt-2 h-8 text-xs font-bold rounded-full">
                  Odblokuj wpisywanie
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-2 md:gap-4 mt-4 flex-1">
                <img src="/urwischat.webp" alt="Urwis" className="w-24 h-24 md:w-28 md:h-28 drop-shadow-2xl animate-bounce-slow object-contain" />
                <p className="text-xs md:text-sm font-bold text-zinc-700 px-4 md:px-6 uppercase tracking-tight italic">
                  Cześć! Jestem Urwis. <br/>
                  <span className="text-[#0055ff]">O co chcesz zapytać? 🦸‍♂️</span>
                </p>
              </div>
            ) : (
              <>
                {messages.map(m => (
                  <div key={m.id} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 max-w-[90%] md:max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end`}>
                      
                      {/* Avatar */}
                      <div className="shrink-0 mb-1">
                        {m.role === 'user' ? (
                          <div className="bg-zinc-200 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-zinc-500" />
                          </div>
                        ) : (
                          <div className="bg-white w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center border-2 border-[#0055ff] overflow-hidden shadow-sm">
                            <img src="/urwischat.webp" alt="Urwis" className="w-full h-full object-cover scale-110" />
                          </div>
                        )}
                      </div>

                      {/* Dymek */}
                      <div className={`rounded-[1.25rem] md:rounded-[1.5rem] px-3 md:px-4 py-2.5 md:py-3 text-[13px] md:text-sm shadow-md font-medium ${
                        m.role === 'user' 
                          ? 'bg-zinc-900 text-white rounded-br-sm' 
                          : 'bg-white text-zinc-800 border-2 border-zinc-100 rounded-bl-sm'
                      }`}>
                       <div className="whitespace-pre-wrap leading-relaxed">
  {m.parts?.map((part, i) =>
    part.type === 'text' ? <span key={i}>{part.text}</span> : null
  )}
</div>
                        
             {m.parts
  ?.filter(p => p.type === 'tool-invocation')
  .map((part, i) => {
    const ti = (part as unknown as { 
      type: 'tool-invocation'; 
      toolInvocation: UIToolInvocation<any> 
    }).toolInvocation;
    return (
      <div key={ti.toolCallId} className="mt-2 md:mt-3 text-[10px] md:text-[11px] font-bold tracking-widest uppercase bg-yellow-50 text-yellow-700 p-2 md:p-2.5 rounded-xl border-2 border-yellow-200 flex items-start gap-2 shadow-inner">
        <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5 shrink-0 text-yellow-500" />
        <div>
          {ti.state === 'result' ? (
            <span className="text-yellow-600">Magia zadziałała: "{ti.args?.productName}"</span>
          ) : (
            <span className="animate-pulse">Wróżę los dla: "{ti.args?.productName}"...</span>
          )}
        </div>
      </div>
    );
  })
}

                      </div>
                    </div>
                  </div>
                ))}
            <div ref={messagesEndRef} className="h-2" />
              </>
            )}
          </CardContent>

          {/* POLE FORMULARZA */}
          <CardFooter className="p-2.5 md:p-3 bg-white border-t-2 border-zinc-100 shrink-0 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] z-10 flex-col items-stretch">
            {isLoading && <div className="text-[10px] text-zinc-400 font-bold mb-1 ml-2 animate-pulse uppercase tracking-wider">Urwis pisze...</div>}
            <form onSubmit={handleSubmit} className="flex w-full gap-2 items-center">
              <Input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                placeholder={error ? "Urwis teraz śpi..." : "Napisz do Urwisa..."}
                className="flex-1 rounded-full border-2 border-zinc-200 focus-visible:ring-[#0055ff] focus-visible:border-[#0055ff] bg-zinc-50 font-bold text-[13px] md:text-sm h-10 md:h-12 px-4 md:px-5 shadow-inner"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon"
                className={`rounded-full w-10 h-10 md:w-12 md:h-12 shrink-0 shadow-md border-2 transition-all ${
                  (isLoading || isInputEmpty) 
                    ? 'bg-zinc-100 border-zinc-200 text-zinc-400 opacity-50' 
                    : 'bg-gradient-to-br from-[#0055ff] to-blue-700 hover:scale-105 active:scale-95 border-blue-400/50 text-white'
                }`}
                disabled={isLoading || isInputEmpty}
              >
                <Send className="w-4 h-4 md:w-5 md:h-5 ml-0.5" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      {/* Przycisk otwierający/zamykający widget */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full shadow-[0_10px_30px_rgba(0,85,255,0.4)] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center p-0 overflow-hidden border-[3px] md:border-4 bg-white pointer-events-auto ${
          isOpen ? 'border-[#BF2024]' : 'border-[#0055ff]'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 md:w-8 md:h-8 text-[#BF2024] animate-in fade-in zoom-in duration-200" strokeWidth={3} />
        ) : (
          <img src="/urwischat.webp" alt="Uruchom czat" className="w-[110%] h-[110%] object-cover animate-in fade-in zoom-in duration-200 pt-1" />
        )}
      </Button>
    </div>
  );
}