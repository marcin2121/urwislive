'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Ticket, 
  ChevronLeft, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import Particles from "@/components/Particles";
import MagicBento from '@/components/ui/MagicBento';
import Footer from '@/components/ui/Footer';

export default function RedeemCodePage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const supabase = createClient();
  const router = useRouter();

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setStatus('idle');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Musisz być zalogowany!');

      // 1. Sprawdź czy kod istnieje i jest aktywny
      const { data: promo, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (promoError || !promo) {
        throw new Error('Kod jest nieprawidłowy lub wygasł.');
      }

      // 2. Sprawdź czy użytkownik już go nie użył
      const { data: alreadyUsed } = await supabase
        .from('used_codes')
        .select('id')
        .eq('user_id', user.id)
        .eq('code_id', promo.id)
        .single();

      if (alreadyUsed) {
        throw new Error('Ten kod został już przez Ciebie wykorzystany.');
      }

      // 3. Dodaj rekord do wykorzystanych kodów
      const { error: useError } = await supabase
        .from('used_codes')
        .insert({ user_id: user.id, code_id: promo.id });

      if (useError) throw useError;

      // 4. Przyznaj nagrodę (Kuleczki / Urwiski / EXP)
      const { error: updateError } = await supabase.rpc('increment_profile_value', {
        user_id: user.id,
        column_name: promo.reward_type,
        amount: promo.reward_value
      });

      // Jeśli RPC nie jest ustawione, używamy zwykłego update (uproszczone):
      if (updateError) {
        const { data: profile } = await supabase.from('profiles').select(promo.reward_type).eq('id', user.id).single();
        await supabase.from('profiles').update({ 
          [promo.reward_type]: (profile?.[promo.reward_type] || 0) + promo.reward_value 
        }).eq('id', user.id);
      }

      setStatus('success');
      toast.success(`Zrealizowano! Otrzymujesz ${promo.reward_value} ${promo.reward_type}`);
      setCode('');
      router.refresh();
      
    } catch (error: any) {
      setStatus('error');
      toast.error(error.message || 'Wystąpił błąd podczas realizacji kodu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-zinc-950 overflow-x-hidden text-white">
      
      {/* TŁO */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <Particles particleCount={40} particleColors={["#0055ff", "#BF2024"]} alphaParticles speed={0.03} />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#0055ff15,transparent_50%)]" />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          
          {/* POWRÓT */}
          <Link 
            href="/profil" 
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold uppercase tracking-widest text-xs">Wróć do bazy</span>
          </Link>

          <MagicBento glowColor="0, 85, 255" className="bg-zinc-900/40 backdrop-blur-2xl border-white/5 rounded-[3rem] p-10 shadow-2xl">
            <div className="text-center space-y-4 mb-10">
              <div className="w-20 h-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center text-blue-400 mx-auto border border-blue-500/20 shadow-inner">
                < Ticket size={40} />
              </div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">Zrealizuj Kod</h1>
              <p className="text-zinc-500 font-medium max-w-sm mx-auto">
                Wpisz otrzymany kod promocyjny, aby odblokować Kuleczki lub inne nagrody w Twoim ekwipunku.
              </p>
            </div>

            <form onSubmit={handleRedeem} className="space-y-6">
              <div className="relative group">
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="NP. URWIS-2024"
                  className="w-full bg-zinc-950/50 border-2 border-white/10 rounded-[2rem] px-8 py-6 text-center text-2xl font-black uppercase tracking-[0.3em] focus:border-blue-500/50 focus:outline-none transition-all placeholder:text-zinc-800 placeholder:tracking-normal"
                  disabled={loading}
                />
                <AnimatePresence>
                  {status === 'success' && (
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-green-500"
                    >
                      <CheckCircle2 size={32} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                type="submit"
                disabled={loading || !code}
                className="w-full relative overflow-hidden bg-white text-zinc-950 rounded-[2rem] py-6 font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl"
              >
                <span className="flex items-center justify-center gap-3">
                  {loading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>Zatwierdź Kod <Sparkles size={20} /></>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-12 pt-10 border-t border-white/5 grid grid-cols-2 gap-4">
               <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Gdzie znajdę kody?</div>
                  <div className="text-xs font-bold text-zinc-300">Social Media i Eventy</div>
               </div>
               <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Ważność</div>
                  <div className="text-xs font-bold text-zinc-300">Kody są jednorazowe</div>
               </div>
            </div>
          </MagicBento>
        </div>
      </div>
    </main>
  );
}