import type { Locale } from '@/i18n/config';
import type es from '@/i18n/messages/es';

declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof es;
  }
}
