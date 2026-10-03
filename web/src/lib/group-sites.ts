// CorpSC Group sites promoted by the top ticker. Invoices does not list
// itself: each group site only links to its siblings.

import type { Locale } from '@/i18n/config';

export interface GroupSite {
  slug: string;
  name: string;
  // Short description shown next to the link in the strip, per UI locale.
  tagline: Record<Locale, string>;
  url: string;
  // Same site in each UI locale, when it has localized URLs.
  localizedUrl?: Record<Locale, string>;
  // Brand accent, chosen so the dot reads against the strip's navy blue.
  accent: string;
}

export const GROUP_SITES: GroupSite[] = [
  {
    slug: 'corpsc',
    name: 'CorpSC',
    tagline: {
      es: 'Convertimos tus ideas en productos digitales',
      en: 'We turn your ideas into digital products',
      pt: 'Transformamos suas ideias em produtos digitais',
    },
    url: 'https://www.corpsc.com/es',
    localizedUrl: {
      es: 'https://www.corpsc.com/es',
      en: 'https://www.corpsc.com/en',
      pt: 'https://www.corpsc.com/pt',
    },
    accent: '#1668e3',
  },
  {
    slug: 'tu-chamba',
    name: 'Tu Chamba',
    tagline: { es: 'Empleos en Bolivia', en: 'Jobs in Bolivia', pt: 'Empregos na Bolívia' },
    url: 'https://tu-chamba.corpsc.com',
    accent: '#00b473',
  },
  {
    slug: 'iris-natural',
    name: 'Iris Natural',
    tagline: { es: 'Productos naturales', en: 'Natural products', pt: 'Produtos naturais' },
    url: 'https://irisnatural.corpsc.com',
    accent: '#f9a8d4',
  },
  {
    slug: 'dando-muela',
    name: 'Dando Muela',
    tagline: { es: 'Conoce gente y chatea', en: 'Meet people and chat', pt: 'Conheça pessoas e converse' },
    url: 'https://dandomuela.com',
    accent: '#a78bfa',
  },
];

// Tags the ticker links with UTM so the destination site (GA/GTM) can measure
// how much attention the group strip brings. Existing URL parameters are kept;
// calling it twice gives the same result.
export function groupSiteUrl(url: string): string {
  const target = new URL(url);
  target.searchParams.set('utm_source', 'invoices');
  target.searchParams.set('utm_medium', 'cintillo');
  target.searchParams.set('utm_campaign', 'grupo-corpsc');
  return target.toString();
}

// Domain shown next to the name in the ticker: the visible link, without
// protocol, without "www." and without the trailing slash.
export function siteDomain(url: string): string {
  return new URL(url).host.replace(/^www\./, '');
}
