'use server'

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function getAdminUsersDetails() {
  const supabaseServer = await createServerClient();
  if (!supabaseServer) {
    return { success: false, extraData: {}, error: 'Brak połączenia z bazą.' };
  }
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user || user.app_metadata?.role !== 'admin') {
    return { success: false, extraData: {}, error: 'Brak uprawnień administratora.' };
  }

  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!adminKey || !url) {
    if (process.env.NODE_ENV !== 'production' || !process.env.CI) {
      console.warn('⚠️ Supabase Admin: Brak kluczy URL/KEY. Akcja getAdminUsersDetails pominięta.');
    }
    return { success: false, extraData: {}, error: 'Brak zmiennych środowiskowych Supabase.' };
  }

  const supabaseAdmin = createClient(url, adminKey);

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
  const supabaseServer = await createServerClient();
  if (!supabaseServer) {
    return { success: false, coupons: [], error: 'Brak połączenia z bazą.' };
  }
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user || user.app_metadata?.role !== 'admin') {
    return { success: false, coupons: [], error: 'Brak uprawnień administratora.' };
  }

  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!adminKey || !url) {
    return { success: false, coupons: [], error: 'Brak kluczy do bazy.' };
  }

  const supabaseAdmin = createClient(url, adminKey);

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
