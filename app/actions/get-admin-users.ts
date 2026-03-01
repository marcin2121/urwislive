'use server'

import { createClient } from '@supabase/supabase-js';

export async function getAdminUsersDetails() {
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!adminKey || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Brak kluczy dostępu admina. Sprawdź ENV.');
    return { success: false, extraData: {}, error: 'Brak zmiennych środowiskowych Supabase.' };
  }

  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, adminKey);

  try {
    const { data: authData, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) throw error;

    const extraData: Record<string, any> = {};
    for (const u of authData.users) {
      const phone = u.user_metadata?.phone || (u.email ? u.email.split('@')[0] : null);
      if (phone) {
        extraData[phone] = {
          auth_user_id: u.id,
          full_name: u.user_metadata?.full_name || 'Konto (Auth)',
          email: u.email || 'brak@emaila.pl',
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at || u.created_at,
          has_pwa: u.user_metadata?.has_pwa === true
        };
      }
    }

    return { success: true, extraData };
  } catch (error) {
    console.error('Błąd getAdminUsersDetails:', error);
    return { success: false, extraData: {}, error: 'Nie udało się pobrać szczegółowych danych.' };
  }
}

// 🚀 OMIJA Zabezpieczenia RLS do sczytania cudzych kuponów z bazy 
export async function getAdminUserCoupons(userId: string) {
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!adminKey || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { success: false, coupons: [], error: 'Brak kluczy do bazy.' };
  }

  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, adminKey);

  try {
    const { data: coupons, error } = await supabaseAdmin
      .from('kupony')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { success: true, coupons: coupons || [] };
  } catch (error) {
    console.error('Błąd w pobieraniu Kuponów Admina:', error);
    return { success: false, coupons: [], error: 'Nie udało się pobrać widoku kuponów.' };
  }
}
