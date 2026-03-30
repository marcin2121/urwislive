'use client';

import { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, User, Minus } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

interface ChatContentProps {
  onClose: () => void;
}

export default function ChatContent({ onClose }: ChatContentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const { messages, error, stop, sendMessage, status } = useChat({
    id: 'urwis-widget',
  });

  const isLoading = status === 'submitted' || status === 'streaming';
  const isInputEmpty = input.trim() === '';

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 150);
  }, [messages.length]);

  return (
    <Card className="w-full md:w-[400px] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.35),0_0_40px_-10px_rgba(0,85,255,0.2)] bg-white border border-zinc-200 overflow-hidden flex flex-col h-[65dvh] md:h-[550px] mt-16 md:mt-0 mb-4 animate-in slide-in-from-top-10 md:slide-in-from-bottom-10 fade-in duration-300 rounded-[2rem] pointer-events-auto ring-1 ring-zinc-900/5">
      <CardHeader className="relative overflow-hidden bg-zinc-950 p-4 shrink-0 flex flex-row items-center justify-between border-b border-zinc-800 z-20 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#BF2024] via-[#0055ff] to-[#fbbf24]" />
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#BF2024]/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#0055ff]/20 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-3 relative z-10 pt-1">
          <div className="relative shrink-0">
            <div className="bg-zinc-800 p-[3px] rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden w-12 h-12 flex items-center justify-center border border-zinc-700">
              <div className="bg-white rounded-full w-full h-full flex items-center justify-center overflow-hidden">
                <Image src="/urwischat.webp" alt="Urwis" width={64} height={64} className="w-[115%] h-[115%] object-cover pt-1" />
              </div>
            </div>
            <span className={`absolute bottom-0 -right-0.5 w-[14px] h-[14px] rounded-full border-[2.5px] border-zinc-950 shadow-sm ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-500'}`} />
          </div>
          
          <div className="flex flex-col justify-center">
            <CardTitle className="text-[17px] md:text-[19px] font-black italic uppercase tracking-tight leading-none text-white">
              Wirtualny Urwis
            </CardTitle>
            <div className="mt-1">
              <p className="text-[10px] md:text-[11px] text-zinc-400 font-bold uppercase tracking-widest leading-none">
                {isLoading ? 'Odpowiada...' : 'Czat Online'}
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Zminimalizuj czat"
          className="relative z-10 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-full transition-colors active:scale-95 w-9 h-9 border border-transparent hover:border-zinc-700"
        >
          <Minus className="w-5 h-5" strokeWidth={2.5} />
        </Button>
      </CardHeader>

      <CardContent
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-3 md:p-5 flex flex-col gap-4 bg-zinc-50"
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
          <div className="flex flex-col items-center justify-center h-full text-center gap-5 animate-in fade-in zoom-in-95 duration-500 pt-4 pb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-[#0055ff]/10 blur-2xl rounded-full scale-150" />
              <Image src="/urwischat.webp" alt="Urwis" width={140} height={140} className="relative w-24 h-24 md:w-28 md:h-28 drop-shadow-2xl animate-bounce-slow object-contain" />
            </div>
            <div className="space-y-1.5 px-2 text-balance">
              <h3 className="text-sm md:text-base font-black text-zinc-800 uppercase tracking-tight italic">
                Cześć! Tu Twój asystent 🦸‍♂️
              </h3>
              <p className="text-[11px] md:text-sm text-zinc-500 font-medium leading-relaxed max-w-[260px] mx-auto pb-1">
                Zapytaj o program lojalnościowy, klocki LEGO, godziny otwarcia lub po prostu przywitaj się!
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2 w-full max-w-[95%] mx-auto">
              {['O której zamykacie?', 'Jak działają rabaty?', 'Gry i zabawy?'].map(q => (
                <button 
                  key={q}
                  onClick={() => sendMessage({ text: q })}
                  className="text-[10px] md:text-xs font-bold leading-none bg-white text-zinc-600 border border-zinc-200 px-3.5 py-2.5 rounded-xl hover:bg-blue-50 hover:text-[#0055ff] hover:border-blue-200 transition-all shadow-sm active:scale-95 text-center flex-1 min-w-[max-content]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[92%] md:max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end`}>
                  <div className="shrink-0 mb-1">
                    {m.role === 'user' ? (
                      <div className="bg-gradient-to-br from-zinc-200 to-zinc-300 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        <User className="w-3.5 h-3.5 text-zinc-600" />
                      </div>
                    ) : (
                      <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#0055ff] overflow-hidden shadow-sm shrink-0">
                        <Image src="/urwischat.webp" alt="Urwis" width={48} height={48} className="w-full h-full object-cover scale-110" />
                      </div>
                    )}
                  </div>

                  <div className={`rounded-[1.25rem] px-4 py-3 text-[13px] md:text-sm shadow-sm font-medium leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 text-white rounded-br-[6px]'
                      : 'bg-white text-zinc-800 border border-zinc-100 rounded-bl-[6px] shadow-[0_2px_15px_rgba(0,0,0,0.03)]'
                  }`}>
                    {m.parts?.map((part, i) =>
                      part.type === 'text' ? (
                        <ReactMarkdown
                          key={i}
                          components={{
                            a: (props: any) => (
                              <a
                                href={props.href ?? '#'}
                                className="text-[#0055ff] font-bold underline underline-offset-2 hover:text-blue-800 transition-colors cursor-pointer"
                              >
                                {props.children}
                              </a>
                            ),
                            strong: ({ children }: any) => (
                              <strong className="font-black text-zinc-900">{children}</strong>
                            ),
                            p: ({ children }: any) => (
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

            {status === 'submitted' && (

              <div className="flex justify-start">
                <div className="flex gap-2 items-end">
                  <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#0055ff] overflow-hidden shadow-sm">
                    <Image src="/urwischat.webp" alt="Urwis" width={48} height={48} className="w-full h-full object-cover scale-110" />
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

      <CardFooter className="p-3 md:p-3.5 bg-white border-t border-zinc-100 shrink-0 z-10">
        <form onSubmit={handleFormSubmit} className="flex w-full gap-2 items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={error ? 'Urwis teraz śpi...' : 'Napisz do Urwisa...'}
            className="flex-1 rounded-full border-2 border-zinc-200 focus-visible:ring-[#0055ff] focus-visible:border-[#0055ff] bg-zinc-50 font-medium text-base md:text-sm h-11 md:h-12 px-5 shadow-sm"
            disabled={isLoading || !!error}
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Wyślij wiadomość"
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
  );
}
