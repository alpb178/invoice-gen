// CorpSC Group sites promoted by the top ticker. Invoices does not list
// itself: each group site only links to its siblings.

export interface GroupSite {
  slug: string;
  name: string;
  // Short description shown next to the link in the strip.
  tagline: string;
  url: string;
  // Brand accent, chosen so the dot reads against the strip's navy blue.
  accent: string;
}

export const GROUP_SITES: GroupSite[] = [
  {
    slug: 'corpsc',
    name: 'CorpSC',
    tagline: 'Convertimos tus ideas en productos digitales',
    url: 'https://www.corpsc.com/es',
    accent: '#1668e3',
  },
  {
    slug: 'tu-chamba',
    name: 'Tu Chamba',
    tagline: 'Empleos en Bolivia',
    url: 'https://tu-chamba.corpsc.com',
    accent: '#00b473',
  },
  {
    slug: 'iris-natural',
    name: 'Iris Natural',
    tagline: 'Productos naturales',
    url: 'https://irisnatural.corpsc.com',
    accent: '#f9a8d4',
  },
  {
    slug: 'dando-muela',
    name: 'Dando Muela',
    tagline: 'Conoce gente y chatea',
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
