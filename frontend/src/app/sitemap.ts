import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { SITE_URL, localePath } from '@/lib/seo';

// Public, indexable pages. Each gets one entry per locale, and every entry
// lists all its language versions (hreflang).
const PAGES: Array<{ path: string; changeFrequency: 'weekly' | 'yearly'; priority: number }> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/cookies', changeFrequency: 'yearly', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PAGES.flatMap(({ path, changeFrequency, priority }) => {
    const languages = Object.fromEntries(
      locales.map((l) => [l, `${SITE_URL}${localePath(l, path)}`]),
    );
    return locales.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      lastModified: now,
      changeFrequency,
      priority,
      alternates: { languages },
    }));
  });
}
