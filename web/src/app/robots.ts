import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { SITE_URL } from '@/lib/seo';

// Private areas, without locale. Each is blocked unprefixed (old URLs, which
// only redirect) and under every locale prefix.
const PRIVATE = ['/app', '/invoices', '/reports', '/settings', '/teams', '/login', '/register', '/invitations/'];

export default function robots(): MetadataRoute.Robots {
  const disallow = [
    ...PRIVATE,
    ...locales.flatMap((l) => PRIVATE.map((p) => `/${l}${p}`)),
    '/api/',
  ];
  return {
    rules: [{ userAgent: '*', allow: '/', disallow }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
