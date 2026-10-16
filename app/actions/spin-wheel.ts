'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function spinWheel() {
  const supabase = await createClient()
  if (!supabase) return { error: 'Usługa tymczasowo niedostępna.' }

  try {
    // 1. Sprawdzamy, czy użytkownik jest zalogowany
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Zaloguj się, aby zakręcić kołem.' }
    }

    // 2. Limit "jedna wygrana na dobę" pilnuje baza (claim_wheel_coupon, czas polski, bez wyścigu)

    // 3. Pobieramy wszystkie aktywne nagrody z Koła z bazy danych
    const { data: prizes } = await supabase
      .from('wheel_prizes')
      .select('*')
      .eq('is_active', true)

    if (!prizes || prizes.length === 0) {
      return { error: 'Koło jest w trakcie naprawy. Brak nagród.' }
    }

    // Dodatek: SPRAWDZENIE CO MA UŻYTKOWNIK
    const { data: userCurrentCoupons } = await supabase
      .from('kupony')
      .select('title, current_usage, usage_limit')
      .eq('user_id', user.id)
      .eq('is_active', true)

    const unspentCoupons = userCurrentCoupons?.filter((c: any) => (c.current_usage || 0) < (c.usage_limit || 1)) || [];
    const usedTitles = unspentCoupons.map((c: any) => c.title);
    
    // Filtrujemy nagrody
    const availablePrizes = prizes.filter((p: any) => !usedTitles.includes(p.title));

    if (availablePrizes.length === 0) {
      return { error: 'Posiadasz już wszystkie rabaty! Zużyj przynajmniej jeden z nich pod kasą, by zwolnić miejsce.' }
    }

    // 4. ALGORYTM LOSOWANIA (Ważony) z puli tylko dostępnych nagród
    const totalWeight = availablePrizes.reduce((sum: number, p: any) => sum + Number(p.chance), 0)
    let randomNum = Math.random() * totalWeight
    let winningPrize = availablePrizes[0]

    for (const prize of availablePrizes) {
      if (randomNum < Number(prize.chance)) {
        winningPrize = prize
        break
      }
      randomNum -= Number(prize.chance)
    }

    // 5. Generujemy unikalny kod kuponu (np. BONUS10-A4B9)
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    const finalCode = `${winningPrize.code_prefix}-${randomSuffix}`

    // 6. Zapisujemy wylosowany kupon dla użytkownika
    // RLS nie pozwala klientom dodawać kuponów - zapis przez service role po weryfikacji powyżej
    const supabaseAdmin = createAdminClient()
    if (!supabaseAdmin) return { error: 'Usługa tymczasowo niedostępna.' }

    // Kupon jednorazowy, bez daty wygaśnięcia - czeka aż go użyjesz przy kasie
    const { data: granted, error: insertError } = await supabaseAdmin.rpc('claim_wheel_coupon', {
      p_user_id: user.id,
      p_title: winningPrize.title,
      p_code: finalCode,
      p_description: winningPrize.description || 'Wygrana w codziennym losowaniu!',
      p_gradient: winningPrize.gradient,
    })

    if (insertError) {
      console.error("Błąd zapisu kuponu:", insertError)
      return { error: 'Nie udało się przypisać nagrody. Spróbuj ponownie.' }
    }

    if (!granted) {
      return { error: 'Już dziś wykorzystałeś swoją szansę! Wróć jutro.' }
    }

    // Odświeżamy widok
    revalidatePath('/rabaty')

    // Zwracamy wygraną nagrodę do animacji
    return { 
      success: true, 
      prize: winningPrize 
    }

  } catch (error) {
    console.error("Critical error in spinWheel:", error)
    return { error: 'Wystąpił nieoczekiwany błąd serwera.' }
  }
}