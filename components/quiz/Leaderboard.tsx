'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Timer, Target, Trophy } from 'lucide-react'

export default function QuizLeaderboard() {
  const [leaders, setLeaders] = useState<any[]>([])
  const supabase = createClient();
  useEffect(() => {
    async function fetchQuizRankings() {
      const { data } = await supabase
        .from('quiz_results')
        .select(`
          correct_answers,
          total_time_ms,
          profiles ( username, avatar_url )
        `)
        // ✅ Kluczowe sortowanie: najpierw dobre odpowiedzi (DESC), potem czas (ASC)
        .order('correct_answers', { ascending: false })
        .order('total_time_ms', { ascending: true })
        .limit(10);

      if (data) setLeaders(data);
    }
    fetchQuizRankings();
  }, []);

  return (
    <div className="space-y-3">
      {leaders.map((res, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <span className="w-6 font-black text-zinc-500 italic">#{index + 1}</span>
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center overflow-hidden border border-blue-500/30">
               {res.profiles.avatar_url ? <img src={res.profiles.avatar_url} /> : <div className="text-blue-400 font-bold">{res.profiles.username[0]}</div>}
            </div>
            <div>
              <div className="text-white font-bold">{res.profiles.username}</div>
              <div className="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-zinc-500">
                <span className="flex items-center gap-1 text-green-400"><Target size={10} /> {res.correct_answers} poprawnych</span>
                <span className="flex items-center gap-1 text-blue-400"><Timer size={10} /> {(res.total_time_ms / 1000).toFixed(2)}s</span>
              </div>
            </div>
          </div>
          
          {/* Wizualny wskaźnik wyniku */}
          <div className="hidden md:block">
             {index === 0 && <Trophy className="text-yellow-400 animate-bounce" size={20} />}
          </div>
        </div>
      ))}
    </div>
  )
}