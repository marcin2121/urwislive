'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Share2, ArrowRight, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

// 1. Wydzielamy logikę formularza do osobnego komponentu "wewnętrznego"
function ShareTargetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sharedData, setSharedData] = useState<{ title?: string; text?: string; url?: string } | null>(null);
  
  const hasSaved = useRef(false);

  useEffect(() => {
    const title = searchParams.get('title') || '';
    const text = searchParams.get('text') || '';
    const url = searchParams.get('url') || '';

    if (title || text || url) {
      setSharedData({ title, text, url });
      
      if (!hasSaved.current) {
        hasSaved.current = true;
        fetch('/api/shared-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, text, url })
        }).catch(err => console.error('Błąd zapisu w tle', err));
      }

      toast.success('Link odebrany w aplikacji Urwis!', {
        description: 'Możesz teraz zapytać nas o ten produkt.'
      });
    } else {
      router.push('/');
    }
  }, [searchParams, router]);

  const handleAskAboutProduct = () => {
    const message = `Cześć! Szukam tego produktu, macie go może u siebie? \n\n${sharedData?.title ? sharedData.title + '\n' : ''}${sharedData?.url || sharedData?.text}`;
    window.open(`https://m.me/sklepurwis.bialobrzegi?text=${encodeURIComponent(message)}`, '_blank');
    router.push('/'); 
  };

  if (!sharedData) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-zinc-100 p-8 text-center"
    >
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Share2 className="text-blue-600" size={32} />
      </div>

      <h1 className="text-2xl font-bold mb-2">Udostępniono do Urwisa</h1>
      <p className="text-zinc-500 mb-8">
        Świetnie! Otrzymaliśmy Twój link. Co chcesz z nim zrobić?
      </p>

      <div className="bg-zinc-50 rounded-xl p-4 mb-8 text-left break-all text-sm text-zinc-600 border border-zinc-100">
        {sharedData.title && <strong className="block mb-1 text-zinc-800">{sharedData.title}</strong>}
        {sharedData.text && <span className="block mb-1">{sharedData.text}</span>}
        {sharedData.url && <a href={sharedData.url} className="text-blue-500 underline">{sharedData.url}</a>}
      </div>

      <div className="space-y-3">
        <button 
          onClick={handleAskAboutProduct}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          Zapytaj nas o ten produkt <ArrowRight size={18} />
        </button>
        
        <button 
          onClick={() => router.push('/')}
          className="w-full bg-zinc-100 text-zinc-700 font-bold py-4 rounded-xl hover:bg-zinc-200 transition flex items-center justify-center gap-2"
        >
          Wróć do sklepu <ShoppingBag size={18} />
        </button>
      </div>
    </motion.div>
  );
}

// 2. Eksportujemy główną stronę OPAKOWANĄ W SUSPENSE
export default function ShareTargetPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 mt-20">
      <Suspense fallback={<div className="text-zinc-500">Odbieranie danych...</div>}>
        <ShareTargetContent />
      </Suspense>
    </div>
  );
}