import type { Metadata } from 'next';
import { defaultLocale, locales, ogLocale, type Locale } from '@/i18n/config';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
).replace(/\/$/, '');

/** `/privacy` in `en` → `/en/privacy`; the home page is just `/en`. */
export function localePath(locale: Locale, path: string): string {
  return `/${locale}${path === '/' ? '' : path}`;
}

/**
 * canonical + hreflang for a public, indexed page. Every locale points at its
 * own URL and `x-default` at the default locale, which is also where the old
 * unprefixed URLs redirect.
 */
export function localizedAlternates(locale: Locale, path: string): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = localePath(l, path);
  languages['x-default'] = localePath(defaultLocale, path);
  return { canonical: localePath(locale, path), languages };
}

export function openGraphLocale(locale: Locale) {
  return {
    locale: ogLocale[locale],
    alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
  };
}
