'use client';
import { createBrowserClient } from '@supabase/ssr';  // ✅ MAMASZ TO!
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

export function createClient(): SupabaseClient | null {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (process.env.NODE_ENV !== 'production' || !process.env.CI) {
      console.warn('⚠️ Supabase: Brak kluczy URL/ANON. Klient nie zostanie zainicjalizowany.');
    }
    return null; // Zmusza konsumenta do sprawdzenia przed użyciem
  }

  client = createBrowserClient(url, anonKey);
  return client;
}