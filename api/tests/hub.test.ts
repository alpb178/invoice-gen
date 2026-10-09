import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildPayload, localDay } from '../src/api/hub/services/hub';

describe('localDay', () => {
  it('returns a YYYY-MM-DD string', () => {
    assert.match(localDay(0), /^\d{4}-\d{2}-\d{2}$/);
  });

  it('offset -1 is strictly before offset 0', () => {
    assert.ok(localDay(-1) <= localDay(0));
  });
});

describe('buildPayload', () => {
  it('returns no days when there is nothing to report', () => {
    const payload = buildPayload([], [], [], '2026-03-01', '2026-03-02');
    assert.deepEqual(payload.days, []);
    assert.equal(payload.schemaVersion, 1);
    assert.equal(payload.project, 'invoice-gen');
    assert.equal(payload.range.from, '2026-03-01');
    assert.equal(payload.range.to, '2026-03-02');
  });

  it('declares invoices, revenue, signups and users_total, revenue without a fixed currency', () => {
    const payload = buildPayload([], [], [], '2026-03-01', '2026-03-01');
    const keys = payload.definitions.map((d) => d.key);
    assert.deepEqual(keys, ['invoices', 'revenue', 'signups', 'users_total']);
    const revenue = payload.definitions.find((d) => d.key === 'revenue');
    assert.equal((revenue as any).currency, undefined);
  });

  it('declares users_total with aggregation "last", a point-in-time snapshot', () => {
    const payload = buildPayload([], [], [], '2026-03-01', '2026-03-01');
    const usersTotal = payload.definitions.find((d) => d.key === 'users_total');
    assert.equal(usersTotal?.aggregation, 'last');
  });

  it('sums invoice counts per day across statuses and currencies', () => {
    const payload = buildPayload(
      [
        { d: '2026-03-01', status: 'draft', currency: 'USD', count: 2, amount: 100 },
        { d: '2026-03-01', status: 'paid', currency: 'EUR', count: 3, amount: 50 },
      ],
      [],
      [],
      '2026-03-01',
      '2026-03-01',
    );
    const day = payload.days.find((d) => d.date === '2026-03-01')!;
    assert.equal(day.metrics.invoices, 5);
  });

  it('breaks down invoices by status (counts), never mixing currencies in it', () => {
    const payload = buildPayload(
      [
        { d: '2026-03-01', status: 'draft', currency: 'USD', count: 2, amount: 100 },
        { d: '2026-03-01', status: 'paid', currency: 'EUR', count: 3, amount: 50 },
        { d: '2026-03-01', status: 'paid', currency: 'USD', count: 1, amount: 20 },
      ],
      [],
      [],
      '2026-03-01',
      '2026-03-01',
    );
    const day = payload.days.find((d) => d.date === '2026-03-01')!;
    const statusBreakdown = day.breakdowns.find(
      (b) => b.metric === 'invoices' && b.dimension === 'status',
    )!;
    assert.deepEqual(statusBreakdown.values, { draft: 2, paid: 4 });
  });

  it('breaks down revenue by currency (amounts), summed across statuses, with no flat total', () => {
    const payload = buildPayload(
      [
        { d: '2026-03-01', status: 'draft', currency: 'USD', count: 2, amount: 100 },
        { d: '2026-03-01', status: 'paid', currency: 'USD', count: 1, amount: 20 },
        { d: '2026-03-01', status: 'paid', currency: 'EUR', count: 3, amount: 50 },
      ],
      [],
      [],
      '2026-03-01',
      '2026-03-01',
    );
    const day = payload.days.find((d) => d.date === '2026-03-01')!;
    assert.equal(day.metrics.revenue, undefined, 'never a flat mixed-currency total');
    const revenueBreakdown = day.breakdowns.find(
      (b) => b.metric === 'revenue' && b.dimension === 'currency',
    )!;
    assert.deepEqual(revenueBreakdown.values, { USD: 120, EUR: 50 });
  });

  it('counts signups per day and breaks them down by signup method (provider)', () => {
    const payload = buildPayload(
      [],
      [
        { d: '2026-03-01', provider: 'local', count: 4 },
        { d: '2026-03-01', provider: 'google', count: 1 },
      ],
      [],
      '2026-03-01',
      '2026-03-01',
    );
    const day = payload.days.find((d) => d.date === '2026-03-01')!;
    assert.equal(day.metrics.signups, 5);
    const providerBreakdown = day.breakdowns.find(
      (b) => b.metric === 'signups' && b.dimension === 'provider',
    )!;
    assert.deepEqual(providerBreakdown.values, { local: 4, google: 1 });
  });

  it('still counts a signup row without a provider, but adds no breakdown entry for it', () => {
    const payload = buildPayload(
      [],
      [{ d: '2026-03-01', provider: null, count: 2 }],
      [],
      '2026-03-01',
      '2026-03-01',
    );
    const day = payload.days.find((d) => d.date === '2026-03-01')!;
    assert.equal(day.metrics.signups, 2);
    const providerBreakdown = day.breakdowns.find(
      (b) => b.metric === 'signups' && b.dimension === 'provider',
    );
    assert.equal(providerBreakdown, undefined);
  });

  it('sorts days ascending by date', () => {
    const payload = buildPayload(
      [
        { d: '2026-03-02', status: 'draft', currency: 'USD', count: 1, amount: 10 },
        { d: '2026-03-01', status: 'draft', currency: 'USD', count: 1, amount: 10 },
      ],
      [],
      [],
      '2026-03-01',
      '2026-03-02',
    );
    assert.deepEqual(
      payload.days.map((d) => d.date),
      ['2026-03-01', '2026-03-02'],
    );
  });

  it('reports users_total as a cumulative snapshot per day, not a per-day aggregate', () => {
    // The two rows stand for what the correlated subquery in `build()` would
    // compute (count of up_users with created_at <= that day): day 1's total
    // excludes a user who signs up on day 2, so it must stay 10, not creep up
    // to 12 just because a later day's row is also in the batch.
    const payload = buildPayload(
      [],
      [],
      [
        { d: '2026-03-01', total: 10 },
        { d: '2026-03-02', total: 12 },
      ],
      '2026-03-01',
      '2026-03-02',
    );
    const day1 = payload.days.find((d) => d.date === '2026-03-01')!;
    const day2 = payload.days.find((d) => d.date === '2026-03-02')!;
    assert.equal(day1.metrics.users_total, 10, 'excludes the user created on day 2');
    assert.equal(day2.metrics.users_total, 12);
  });

  it('no personal identifiers end up in any breakdown value key', () => {
    const payload = buildPayload(
      [{ d: '2026-03-01', status: 'paid', currency: 'USD', count: 1, amount: 10 }],
      [{ d: '2026-03-01', provider: 'local', count: 1 }],
      [],
      '2026-03-01',
      '2026-03-01',
    );
    const allDimensionValues = payload.days.flatMap((d) =>
      d.breakdowns.flatMap((b) => Object.keys(b.values)),
    );
    for (const v of allDimensionValues) {
      assert.ok(!v.includes('@'), `dimension value "${v}" looks like an email`);
    }
  });
});
