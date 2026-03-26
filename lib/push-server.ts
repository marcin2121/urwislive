import webpush from 'web-push';

/**
 * Bezpieczna inicjalizacja modułu Web Push.
 * Zapobiega błędom podczas budowania (build time) w środowiskach bez kluczy VAPID.
 */
export function initWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    // Logujemy ostrzeżenie tylko w trybie deweloperskim lub gdy nie jesteśmy w procesie budowania (CI)
    if (process.env.NODE_ENV !== 'production' || !process.env.CI) {
      console.warn('⚠️ Web Push: Brak kluczy VAPID (PUBLIC/PRIVATE). Powiadomienia nie będą wysyłane.');
    }
    return false;
  }

  try {
    webpush.setVapidDetails(
      'mailto:kontakt@sklep-urwis.pl',
      publicKey,
      privateKey
    );
    return true;
  } catch (error) {
    console.error('❌ Web Push Error during setup:', error);
    return false;
  }
}

export default webpush;
