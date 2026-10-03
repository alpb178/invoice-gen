export const locales = ['es', 'en', 'pt'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

/**
 * BCP 47 tag for `<html lang>`, `hreflang` and the language menu. The URL
 * prefix is the bare language (`/pt`), but the Portuguese copy is Brazilian.
 */
export const langTag: Record<Locale, string> = {
  es: 'es',
  en: 'en',
  pt: 'pt-BR',
};

/** BCP 47 tag used for dates and numbers in each locale. */
export const intlTag: Record<Locale, string> = {
  es: 'es-ES',
  en: 'en-US',
  pt: 'pt-BR',
};

/** Open Graph locale per UI locale. */
export const ogLocale: Record<Locale, string> = {
  es: 'es_ES',
  en: 'en_US',
  pt: 'pt_BR',
};
