import { createClient } from '@/lib/supabase/server'

export type TriviaQuestion = {
  id: number
  question: string
  options: string[] // ✅ Array!
  correct: number
  exp: number
  category: string
}

export async function getCategories(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('trivia_questions')
    .select('category')
    .eq('is_active', true)

  return [...new Set((data || []).map((q: any) => q.category))]
}

export async function getRandomQuestions(
  category?: string,
  count = 10
): Promise<TriviaQuestion[]> {
  const supabase = await createClient()

  let query = supabase
    .from('trivia_questions')
    .select('id,question,options,correct,exp,category')
    .eq('is_active', true)
    .limit(count)

  if (category && category !== 'mixed') {
    query = query.eq('category', category)
  }

  const { data } = await query

  // ✅ Options już JSONB array w Supabase!
  return (data || []).map((q: any): TriviaQuestion => ({
    id: q.id,
    question: q.question,
    options: Array.isArray(q.options) ? q.options : JSON.parse(q.options), // ✅ Parse jeśli string
    correct: q.correct,
    exp: q.exp,
    category: q.category,
  }))
}

export async function getLeaderboard(
  limit = 20
): Promise<{ user_id: string; total_exp: number }[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles') // ✅ Z profiles, nie quiz_leaderboard!
    .select('id, total_exp')
    .order('total_exp', { ascending: false })
    .limit(limit)

  return (data || []).map(p => ({ user_id: p.id, total_exp: p.total_exp }))
}
