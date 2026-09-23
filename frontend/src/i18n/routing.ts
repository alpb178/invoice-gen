import { defineRouting } from 'next-intl/routing';
import { defaultLocale, locales } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Every URL carries its locale (/es/..., /en/...). Unprefixed URLs are
  // redirected by the middleware.
  localePrefix: 'always',
  // hreflang is declared in each public page's metadata instead; a Link header
  // on every response (private pages included) would only duplicate it.
  alternateLinks: false,
});
