import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isPrivatePath } from '../src/lib/hub-tracker/click-target';
import { normalizePath } from '../src/lib/hub-tracker/path';
import { locales } from '../src/i18n/config';
import { PATH_PATTERNS, PRIVATE_SEGMENTS } from '../src/lib/hub-settings';

describe('hub analytics settings of Invoices', () => {
  for (const path of ['/es/app', '/en/invoices/42', '/es/teams', '/pt/reports', '/es/settings', '/es/invitations/abc']) {
    it(`keeps screen text out of ${path}`, () => {
      assert.equal(isPrivatePath(path, PRIVATE_SEGMENTS), true);
    });
  }

  for (const path of ['/es', '/en/pricing', '/es/login']) {
    it(`treats ${path} as public`, () => {
      assert.equal(isPrivatePath(path, PRIVATE_SEGMENTS), false);
    });
  }

  it('never lets an invitation token reach the hub', () => {
    assert.equal(normalizePath('/es/invitations/9f2c4a7e1b3d45f8', { locales, patterns: PATH_PATTERNS }), '/invitations/:token');
  });

  it('counts every invoice as one page, and drops the locale', () => {
    assert.equal(normalizePath('/en/invoices/812', { locales, patterns: PATH_PATTERNS }), '/invoices/:id');
    assert.equal(normalizePath('/pt', { locales, patterns: PATH_PATTERNS }), '/');
  });
});
