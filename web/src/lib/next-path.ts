import { isLocale } from '@/i18n/config';

/**
 * The `?next=` target after login or sign-up, as a locale-free app path (the
 * locale-aware router adds the prefix back). Only same-site paths are accepted
 * — `//evil.com` or a full URL fall back to the dashboard — and a locale prefix
 * from an older link (`/es/app`) is dropped so it is not doubled.
 */
export function safeNextPath(raw: string | null | undefined, fallback = '/app'): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return fallback;
  const [first, ...rest] = raw.split('/').slice(1);
  if (isLocale(first)) {
    const stripped = `/${rest.join('/')}`;
    return stripped === '/' ? fallback : stripped;
  }
  return raw;
}
