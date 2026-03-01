'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function spinWheel() {
  const supabase = await createClient()

  try {
    // 1. Sprawdzamy, czy użytkownik jest zalogowany
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Zaloguj się, aby zakręcić kołem.' }
    }

    // 2. NIEZAWODNE SPRAWDZANIE: Czy użytkownik ma już wygenerowany dzisiaj "Prywatny Kupon"?
    // Data dzisiejsza od północy:
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: recentCoupons } = await supabase
      .from('kupony')
      .select('id')
      .eq('user_id', user.id) // Tylko kupony tego klienta
      .gte('created_at', todayStart.toISOString()) // Stworzone dzisiaj
      .limit(1);

    if (recentCoupons && recentCoupons.length > 0) {
      return { error: 'Już dziś wykorzystałeś swoją szansę! Wróć jutro.' }
    }

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

    const unspentCoupons = userCurrentCoupons?.filter(c => (c.current_usage || 0) < (c.usage_limit || 1)) || [];
    const usedTitles = unspentCoupons.map(c => c.title);
    
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
    const { error: insertError } = await supabase
      .from('kupony')
      .insert({
        user_id: user.id,
        title: winningPrize.title,
        code: finalCode,
        description: winningPrize.description || 'Wygrana w codziennym losowaniu!',
        gradient: winningPrize.gradient,
        is_reusable: false, // Po zrealizowaniu przy kasie, zniknie
        usage_limit: 1,
        current_usage: 0,
        expires_at: null, // Nie wygasa samoczynnie o północy, czeka aż go użyjesz!
        is_active: true
      })

    if (insertError) {
      console.error("Błąd zapisu kuponu:", insertError)
      return { error: 'Nie udało się przypisać nagrody. Spróbuj ponownie.' }
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