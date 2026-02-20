// lib/push-config.ts

export const PUSH_CATEGORIES = [
    { id: 'wszystkie', label: 'Wszystkie powiadomienia' }, // Zawsze zostawiamy
    { id: 'urwis', label: 'Sklep Urwis' },
    { id: 'lecewkulki', label: 'Sala Zabaw Lecę w Kulki' },
    // Możesz tu dodać cokolwiek w przyszłości i zmieni się wszędzie!
  ] as const;
  
  export type PushTopic = (typeof PUSH_CATEGORIES)[number]['id'];