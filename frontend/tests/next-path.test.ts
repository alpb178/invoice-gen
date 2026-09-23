import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { safeNextPath } from '../src/lib/next-path';

describe('safeNextPath', () => {
  it('keeps a same-site app path, query included', () => {
    assert.equal(safeNextPath('/invitations/abc123'), '/invitations/abc123');
    assert.equal(safeNextPath('/invoices/5?x=1'), '/invoices/5?x=1');
  });

  it('falls back to the dashboard when there is no usable target', () => {
    assert.equal(safeNextPath(null), '/app');
    assert.equal(safeNextPath(''), '/app');
    assert.equal(safeNextPath('app'), '/app');
  });

  it('rejects other sites', () => {
    assert.equal(safeNextPath('https://evil.example'), '/app');
    assert.equal(safeNextPath('//evil.example/x'), '/app');
    assert.equal(safeNextPath('/\\evil.example'), '/app');
  });

  it('drops a locale prefix so the router does not double it', () => {
    assert.equal(safeNextPath('/es/invitations/abc'), '/invitations/abc');
    assert.equal(safeNextPath('/en/app'), '/app');
    assert.equal(safeNextPath('/en'), '/app');
    assert.equal(safeNextPath('/pt/invoices/7?tab=1'), '/invoices/7?tab=1');
  });
});
