// app/actions/urwis-pet.ts
'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function interactWithUrwis(actionType: 'feed' | 'play') {
  const supabase = await createClient();
  if (!supabase) throw new Error('Konfiguracja Supabase jest nieprawidłowa.');
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Musisz być zalogowany w Akademii Urwisa!');

  // Logika aktualizacji stanu w zależności od czasu
  // Punkty z grywalizacji trafiają do portfela "Złotych Urwisów"
  const { data, error } = await supabase
    .from('urwis_pet')
    .update({ 
      last_interaction: new Date().toISOString(),
      // Przykładowa logika: karmienie zwiększa hunger_level
    })
    .eq('user_id', user.id);

  revalidatePath('/akademia');
  return { success: true };
}