import type { Metadata } from 'next';
import { defaultLocale, langTag, locales, ogLocale, type Locale } from '@/i18n/config';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
).replace(/\/$/, '');

/** `/privacy` in `en` → `/en/privacy`; the home page is just `/en`. */
export function localePath(locale: Locale, path: string): string {
  return `/${locale}${path === '/' ? '' : path}`;
}

/**
 * hreflang → path for every locale of a page, keyed by BCP 47 tag (`es`, `en`,
 * `pt-BR`), plus `x-default` when asked (the default locale, which is also
 * where the old unprefixed URLs redirect).
 */
export function hreflangPaths(path: string, withDefault = true): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[langTag[l]] = localePath(l, path);
  if (withDefault) languages['x-default'] = localePath(defaultLocale, path);
  return languages;
}

/** canonical + hreflang for a public, indexed page. */
export function localizedAlternates(locale: Locale, path: string): NonNullable<Metadata['alternates']> {
  return { canonical: localePath(locale, path), languages: hreflangPaths(path) };
}

export function openGraphLocale(locale: Locale) {
  return {
    locale: ogLocale[locale],
    alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
  };
}
