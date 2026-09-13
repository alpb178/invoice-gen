// Sitios del Grupo CorpSC que promociona el cintillo superior. Invoices no se
// lista a sí mismo: cada sitio del grupo enlaza solo a sus hermanos.

export interface GroupSite {
  slug: string;
  name: string;
  // Descripción corta que acompaña al enlace en la franja.
  tagline: string;
  url: string;
  // Acento de la marca, elegido para que el punto se lea sobre el azul marino
  // de la franja.
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

// Marca los enlaces del cintillo con UTM para poder medir, del lado del sitio
// de destino (GA/GTM), cuánta atención trae la franja del grupo. Si la URL ya
// traía parámetros se conservan; llamarla dos veces da el mismo resultado.
export function groupSiteUrl(url: string): string {
  const target = new URL(url);
  target.searchParams.set('utm_source', 'invoices');
  target.searchParams.set('utm_medium', 'cintillo');
  target.searchParams.set('utm_campaign', 'grupo-corpsc');
  return target.toString();
}

// Dominio que se muestra junto al nombre en el cintillo: el enlace a la vista,
// sin protocolo, sin "www." y sin la barra final.
export function siteDomain(url: string): string {
  return new URL(url).host.replace(/^www\./, '');
}
