import { createClient } from '@/lib/supabase/server'

/**
 * Zwraca zalogowanego admina albo null.
 * Rola MUSI pochodzić z app_metadata (użytkownik nie może jej zmienić sam),
 * tak samo jak w proxy.ts i w funkcji bazy public.is_admin().
 */
export async function requireAdmin() {
  const supabase = await createClient()
  if (!supabase) return null

  const { data: { user } } = await supabase.auth.getUser()
  return user?.app_metadata?.role === 'admin' ? user : null
}
