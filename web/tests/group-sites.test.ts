import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GROUP_SITES, groupSiteUrl, siteDomain } from '../src/lib/group-sites';

describe('GROUP_SITES', () => {
  it('does not list itself', () => {
    assert.ok(GROUP_SITES.every((s) => !s.url.includes('invoices.corpsc.com')));
  });
});

describe('groupSiteUrl', () => {
  it('tags the link with the ticker campaign', () => {
    const url = new URL(groupSiteUrl('https://dandomuela.com'));
    assert.equal(url.searchParams.get('utm_source'), 'invoices');
    assert.equal(url.searchParams.get('utm_medium'), 'cintillo');
    assert.equal(url.searchParams.get('utm_campaign'), 'grupo-corpsc');
  });

  it('keeps the path and the parameters the URL already had', () => {
    const url = new URL(groupSiteUrl('https://www.corpsc.com/es?ref=invoices'));
    assert.equal(url.pathname, '/es');
    assert.equal(url.searchParams.get('ref'), 'invoices');
  });

  it('is idempotent', () => {
    const once = groupSiteUrl('https://tu-chamba.corpsc.com');
    assert.equal(groupSiteUrl(once), once);
  });
});

describe('siteDomain', () => {
  it('shows the link without protocol or trailing slash', () => {
    assert.equal(siteDomain('https://tu-chamba.corpsc.com/'), 'tu-chamba.corpsc.com');
  });

  it('strips the www', () => {
    assert.equal(siteDomain('https://www.corpsc.com/es'), 'corpsc.com');
  });
});
