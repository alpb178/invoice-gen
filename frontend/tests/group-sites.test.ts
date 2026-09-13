import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GROUP_SITES, groupSiteUrl, siteDomain } from '../src/lib/group-sites';

describe('GROUP_SITES', () => {
  it('no se lista a sí mismo', () => {
    assert.ok(GROUP_SITES.every((s) => !s.url.includes('invoices.corpsc.com')));
  });
});

describe('groupSiteUrl', () => {
  it('marca el enlace con la campaña del cintillo', () => {
    const url = new URL(groupSiteUrl('https://dandomuela.com'));
    assert.equal(url.searchParams.get('utm_source'), 'invoices');
    assert.equal(url.searchParams.get('utm_medium'), 'cintillo');
    assert.equal(url.searchParams.get('utm_campaign'), 'grupo-corpsc');
  });

  it('conserva la ruta y los parámetros que ya traía la URL', () => {
    const url = new URL(groupSiteUrl('https://www.corpsc.com/es?ref=invoices'));
    assert.equal(url.pathname, '/es');
    assert.equal(url.searchParams.get('ref'), 'invoices');
  });

  it('es idempotente', () => {
    const once = groupSiteUrl('https://tu-chamba.corpsc.com');
    assert.equal(groupSiteUrl(once), once);
  });
});

describe('siteDomain', () => {
  it('muestra el enlace sin protocolo ni barra final', () => {
    assert.equal(siteDomain('https://tu-chamba.corpsc.com/'), 'tu-chamba.corpsc.com');
  });

  it('quita el www', () => {
    assert.equal(siteDomain('https://www.corpsc.com/es'), 'corpsc.com');
  });
});
