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

    // 2. Pobieramy kartę lojalnościową klienta, aby sprawdzić, kiedy kręcił ostatnio
    const { data: card, error: cardError } = await supabase
      .from('loyalty_cards')
      .select('last_spin_at')
      .eq('id', user.id)
      .single()

    if (cardError && cardError.code !== 'PGRST116') {
      return { error: 'Błąd podczas weryfikacji konta.' }
    }

    // 3. Sprawdzamy, czy kręcił już DZISIAJ
    if (card?.last_spin_at) {
      const lastSpin = new Date(card.last_spin_at)
      const today = new Date()
      
      // Jeśli rok, miesiąc i dzień są takie same = kręcił dzisiaj
      if (
        lastSpin.getFullYear() === today.getFullYear() &&
        lastSpin.getMonth() === today.getMonth() &&
        lastSpin.getDate() === today.getDate()
      ) {
        return { error: 'Już dziś wykorzystałeś swoją szansę! Wróć jutro.' }
      }
    }

    // 4. Pobieramy wszystkie aktywne nagrody z Koła z bazy danych
    const { data: prizes } = await supabase
      .from('wheel_prizes')
      .select('*')
      .eq('is_active', true)

    if (!prizes || prizes.length === 0) {
      return { error: 'Koło jest w trakcie naprawy. Brak nagród.' }
    }

    // 5. ALGORYTM LOSOWANIA (Ważony / Weighted Random)
    const totalWeight = prizes.reduce((sum, p) => sum + Number(p.chance), 0)
    let randomNum = Math.random() * totalWeight
    let winningPrize = prizes[0]

    for (const prize of prizes) {
      if (randomNum < Number(prize.chance)) {
        winningPrize = prize
        break
      }
      randomNum -= Number(prize.chance)
    }

    // 6. Generujemy unikalny kod kuponu (np. BONUS10-A4B9)
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    const finalCode = `${winningPrize.code_prefix}-${randomSuffix}`

    // 🚀 ZMIANA: Brak ustalonej daty wygaśnięcia. Kupon zostaje na koncie na zawsze (lub aż do użycia)
    const expiresAt = null;

    // 8. Zapisujemy wylosowany kupon TYLKO dla tego użytkownika (user_id)
    const { error: insertError } = await supabase
      .from('kupony')
      .insert({
        user_id: user.id, // Przypisanie do użytkownika
        title: winningPrize.title,
        code: finalCode,
        description: winningPrize.description || 'Wygrana w codziennym losowaniu!',
        gradient: winningPrize.gradient,
        is_reusable: false, // Kupon jednorazowy - jak wykorzysta (licznik dojdzie do limitu), to zniknie z zakładki "Dostępne"
        usage_limit: 1,
        current_usage: 0,
        expires_at: expiresAt, // null - nie znika samoczynnie o 23:59
        is_active: true
      })

    if (insertError) {
      console.error("Błąd zapisu kuponu:", insertError)
      return { error: 'Nie udało się przypisać nagrody. Spróbuj ponownie.' }
    }

    // 9. Aktualizujemy datę ostatniego kręcenia u użytkownika
    await supabase
      .from('loyalty_cards')
      .update({ last_spin_at: new Date().toISOString() })
      .eq('id', user.id)

    // Odświeżamy stronę rabatów
    revalidatePath('/rabaty')

    // Zwracamy wygraną nagrodę
    return { 
      success: true, 
      prize: winningPrize 
    }

  } catch (error) {
    console.error("Critical error in spinWheel:", error)
    return { error: 'Wystąpił nieoczekiwany błąd serwera.' }
  }
}