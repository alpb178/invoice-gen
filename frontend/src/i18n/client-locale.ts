import { defaultLocale, isLocale, type Locale } from './config';

/**
 * Locale of the page currently open in the browser, for code that runs outside
 * React (API helpers, error translation, hard redirects). Reads the first path
 * segment, which the middleware guarantees is a locale; falls back to the
 * default on the server or on an unexpected path.
 */
export function currentLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  const first = window.location.pathname.split('/')[1];
  return isLocale(first) ? first : defaultLocale;
}

/** Prefixes an app path with the current locale: `/login` → `/es/login`. */
export function localizedPath(path: string): string {
  return `/${currentLocale()}${path === '/' ? '' : path}`;
}
