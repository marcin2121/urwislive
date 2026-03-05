'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat, Message, ToolInvocation } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Ghost, Sparkles, Send, User, X, Minus } from 'lucide-react';

export function UrwisChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // useChat przechowuje stan rozmowy. Z racji bycia w layout.tsx, nie zniknie przy zmianie strony.
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    id: 'urwis-widget', // Identyfikator pomagający w utrzymaniu cache'u hooka
  });

  // Automatyczne przewijanie na dół
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* Okno czatu (widoczne tylko, gdy isOpen === true) */}
      {isOpen && (
        <Card className="w-[350px] sm:w-[400px] shadow-2xl border border-zinc-200 overflow-hidden flex flex-col h-[500px] mb-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          <CardHeader className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 shrink-0 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <Ghost className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-black tracking-tight">Wirtualny Urwis</CardTitle>
                <p className="text-xs text-indigo-100 font-medium opacity-90">Twój magiczny doradca</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 hover:text-white rounded-full transition-colors"
            >
              <Minus className="w-5 h-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-zinc-50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 gap-3 opacity-70">
                <Sparkles className="w-10 h-10 text-violet-300" />
                <p className="text-sm font-medium">
                  Kliknij i zapytaj,<br/>a ja spróbuję to wywróżyć! 🔮
                </p>
              </div>
            )}

            {messages.map(m => (
              <div key={m.id} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  <div className="shrink-0 mt-auto">
                    {m.role === 'user' ? (
                      <div className="bg-zinc-200 w-7 h-7 rounded-full flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-zinc-600" />
                      </div>
                    ) : (
                      <div className="bg-violet-100 w-7 h-7 rounded-full flex items-center justify-center border border-violet-200">
                        <Ghost className="w-3.5 h-3.5 text-violet-600" />
                      </div>
                    )}
                  </div>

                  <div className={`rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-violet-600 text-white rounded-br-sm' 
                      : 'bg-white text-zinc-800 border border-zinc-100 rounded-bl-sm'
                  }`}>
                    <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                    
                    {m.toolInvocations?.map(toolInvocation => (
                      <div key={toolInvocation.toolCallId} className="mt-2 text-[11px] font-mono bg-violet-50 text-violet-700 p-2 rounded-lg border border-violet-100 flex items-start gap-1.5">
                        <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
                        <div>
                          {toolInvocation.state === 'result' ? (
                            <span className="font-semibold">Magia działa dla: "{toolInvocation.args.productName}"</span>
                          ) : (
                            <span className="animate-pulse">Wróżę los dla: "{toolInvocation.args.productName}"...</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>

          <CardFooter className="p-3 bg-white border-t shrink-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-10">
            <form onSubmit={handleSubmit} className="flex w-full gap-2 items-center">
              <Input 
                value={input} 
                onChange={handleInputChange} 
                placeholder="Zapytaj Urwisa..." 
                className="flex-1 rounded-full border-zinc-200 focus-visible:ring-violet-500 bg-zinc-50 text-sm"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon"
                className="rounded-full w-10 h-10 bg-violet-600 hover:bg-violet-700 shrink-0 transition-all active:scale-95"
                disabled={isLoading || !input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      {/* Przycisk otwierający/zamykający widget */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-xl bg-violet-600 hover:bg-violet-700 text-white transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
      >
        {isOpen ? (
          <X className="w-6 h-6 animate-in fade-in zoom-in duration-200" />
        ) : (
          <Ghost className="w-7 h-7 animate-in fade-in zoom-in duration-200" />
        )}
      </Button>
    </div>
  );
}