/**
 * Centralized routing for the application.
 * Use these constants to avoid typos and make refactoring easier.
 */
export const ROUTES = {
  HOME: '/',
  OFFER: '/oferta',
  WHEEL: '/rabaty',
  DRAGON: '/smok',
  PLAYZONE: '/strefa-zabawy',
  SALAZABAW: '/salazabaw',
  CONTACT: '/kontakt',
  PROFILE: '/profil',
  POLICIES: {
    PRIVACY: '/polityka-prywatnosci',
    TERMS: '/regulamin',
  },
  API: {
    CHAT: '/api/chat',
    PUSH: {
      SUBSCRIBE: '/api/push',
      TRACK: '/api/push/track',
      SCHEDULER: '/api/cron/push-scheduler',
    },
    URWIS: {
      SYNC: '/api/urwis/sync',
    }
  }
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES] | string;
