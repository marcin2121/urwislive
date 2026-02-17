'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { useSupabaseLoyalty } from '@/contexts/SupabaseLoyaltyContext'
import { Brain, Search, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function DailyTaskZone() {
  const { profile } = useSupabaseAuth()
  const { addPoints, addExp } = useSupabaseLoyalty()
  const [completed, setCompleted] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Przykładowe zadania (możesz je później przenieść do bazy)
  const dailyTasks = [
    { id: 'task_quiz', title: 'Szybki Quiz', desc: 'Odpowiedz poprawnie na 3 pytania w sekcji Quizów.', icon: <Brain />, link: '/quiz' },
    { id: 'task_find', title: 'Poszukiwacz', desc: 'Znajdź dzisiejszą kryjówkę Urwisa.', icon: <Search />, link: '/' }
  ]

  // Wybór zadania na podstawie dnia
  const todayTask = dailyTasks[new Date().getDate() % dailyTasks.length]

  useEffect(() => {
    setMounted(true)
    if (profile) {
      const status = localStorage.getItem(`urwis_task_${todayTask.id}_${profile.id}_${new Date().toDateString()}`)
      setCompleted(!!status)
    }
  }, [profile, todayTask.id])

  if (!mounted) return null

  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-zinc-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center text-2xl">
          {todayTask.icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Zadanie Specjalne</span>
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="text-2xl font-black text-zinc-900">{todayTask.title}</h3>
        <p className="text-zinc-500 font-medium leading-relaxed">{todayTask.desc}</p>
      </div>

      <div className="mt-8">
        {completed ? (
          <div className="w-full py-4 bg-green-50 text-green-600 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2">
            Ukończono <CheckCircle2 size={16} />
          </div>
        ) : (
          <Link href={todayTask.link}>
            <button className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase hover:bg-orange-500 transition-all flex items-center justify-center gap-2 group">
              Rozpocznij <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        )}
      </div>
    </div>
  )
}