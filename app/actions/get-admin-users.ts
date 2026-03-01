'use server'

import { createClient } from '@supabase/supabase-js';

export async function getAdminUsersDetails() {
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!adminKey || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Brak kluczy dostępu admina. Sprawdź ENV.');
    return { success: false, users: [], error: 'Brak zmiennych środowiskowych Supabase.' };
  }

  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, adminKey);

  try {
    // 1. Fetch public users data from loyalty_cards without updated_at which might crash
    const { data: loyaltyCards, error: dbError } = await supabaseAdmin
      .from('loyalty_cards')
      .select('id, full_name, phone_number, created_at, user_id, email');
      
    if (dbError) throw dbError;

    // 2. Fetch push subscriptions to check PWA status
    const { data: pushData } = await supabaseAdmin
      .from('push_subscriptions')
      .select('user_id')
      .not('user_id', 'is', null);

    const pwaUserIds = new Set(pushData?.map(p => p.user_id));

    // 3. Fetch auth users to get exact last_sign_in_at
    const { data: authData, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('Błąd pobierania bazy auth.users:', error);
      // Fallback: zwrot przynajmniej danych lojalnościowych, jeśli auth wyrzuci błąd
      return { success: true, users: loyaltyCards?.map(card => ({
        ...card,
        has_pwa: pwaUserIds.has(card.user_id),
        last_sign_in_at: card.created_at
      })) || [] };
    }

    const authMap = new Map(authData.users.map(u => [u.id, u.last_sign_in_at]));

    const users = loyaltyCards?.map(card => ({
      ...card,
      has_pwa: pwaUserIds.has(card.user_id),
      last_sign_in_at: authMap.get(card.user_id) || card.created_at
    })) || [];

    return { success: true, users };
  } catch (error) {
    console.error('Błąd getAdminUsersDetails:', error);
    return { success: false, users: [], error: 'Nie udało się pobrać szczegółowych danych.' };
  }
}
