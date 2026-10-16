import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Klient z kluczem service role - OMIJA RLS.
 * Tylko po stronie serwera i tylko po własnej weryfikacji uprawnień
 * (CRON_SECRET, zalogowany użytkownik, admin).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    if (process.env.NODE_ENV !== 'production' || !process.env.CI) {
      console.warn('⚠️ Supabase Admin: Brak kluczy URL/SERVICE_ROLE. Klient nie zostanie zainicjalizowany.')
    }
    return null
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
