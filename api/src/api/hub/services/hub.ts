// Sends invoice-gen's daily business aggregates to corpsc-hub.
//
// invoice-gen has no traffic of its own to report (no visits, no page views):
// only business metrics the backend knows about. See the contract and the
// Strapi reference implementation in corpsc-hub:
//   docs/envio-de-metricas/CONTRATO.md
//   docs/envio-de-metricas/strapi.md

// EMX Comunicaciones (the company issuing invoices) is based in San Sebastián,
// Spain — days are cut on that calendar, never UTC.
const TZ = 'Europe/Madrid';

// Re-send the last few days: an invoice that moves from draft to paid (or
// gets cancelled) changes the aggregate for days already sent, and the hub
// replaces the whole declared window.
const RESEND_DAYS = 3;

// Literal table names: Postgres does not accept parameters for identifiers,
// and these never come from a request.
const INVOICES = 'invoices';
const USERS = 'up_users';

export function localDay(offset: number, tz: string = TZ): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offset);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export interface InvoiceAggRow {
  d: string;
  status: string;
  currency: string;
  count: string | number;
  amount: string | number;
}

export interface SignupAggRow {
  d: string;
  provider: string | null;
  count: string | number;
}

export interface DayPayload {
  date: string;
  metrics: Record<string, number>;
  breakdowns: { metric: string; dimension: string; values: Record<string, number> }[];
}

export interface HubPayload {
  schemaVersion: 1;
  project: string;
  timezone: string;
  generatedAt: string;
  range: { from: string; to: string };
  definitions: { key: string; label: string; unit: string }[];
  days: DayPayload[];
}

// Pure aggregation: turns the SQL rows into the wire payload. Kept apart from
// `build()` (which runs the SQL) so it can be tested without a database.
export function buildPayload(
  invoiceRows: InvoiceAggRow[],
  signupRows: SignupAggRow[],
  from: string,
  to: string,
): HubPayload {
  const byDay = new Map<string, DayPayload>();
  const day = (d: string): DayPayload => {
    if (!byDay.has(d)) byDay.set(d, { date: d, metrics: {}, breakdowns: [] });
    return byDay.get(d) as DayPayload;
  };

  // invoices: count per day, with breakdowns by status (count) and by
  // currency (amount). Never a flat total for the amount — rule 5 of the
  // contract forbids summing invoices across currencies.
  const statusByDay = new Map<string, Record<string, number>>();
  const currencyByDay = new Map<string, Record<string, number>>();

  for (const r of invoiceRows) {
    const count = Number(r.count);
    const amount = Number(r.amount);
    const d = day(r.d);
    d.metrics.invoices = (d.metrics.invoices || 0) + count;

    const statusValues = statusByDay.get(r.d) || {};
    statusValues[r.status] = (statusValues[r.status] || 0) + count;
    statusByDay.set(r.d, statusValues);

    const currencyValues = currencyByDay.get(r.d) || {};
    currencyValues[r.currency] = (currencyValues[r.currency] || 0) + amount;
    currencyByDay.set(r.d, currencyValues);
  }

  for (const [d, values] of statusByDay) {
    day(d).breakdowns.push({ metric: 'invoices', dimension: 'status', values });
  }
  for (const [d, values] of currencyByDay) {
    day(d).breakdowns.push({ metric: 'revenue', dimension: 'currency', values });
  }

  // signups: count of this app's own users created that day, broken down by
  // signup method (`provider`: 'local' for email/password, or the OAuth
  // provider name) when the data distinguishes it. No personal identifiers.
  for (const r of signupRows) {
    const count = Number(r.count);
    const d = day(r.d);
    d.metrics.signups = (d.metrics.signups || 0) + count;

    if (r.provider) {
      const existing = d.breakdowns.find(
        (b) => b.metric === 'signups' && b.dimension === 'provider',
      );
      if (existing) {
        existing.values[r.provider] = (existing.values[r.provider] || 0) + count;
      } else {
        d.breakdowns.push({
          metric: 'signups',
          dimension: 'provider',
          values: { [r.provider]: count },
        });
      }
    }
  }

  return {
    schemaVersion: 1,
    project: 'invoice-gen',
    timezone: TZ,
    generatedAt: new Date().toISOString(),
    range: { from, to },
    definitions: [
      { key: 'invoices', label: 'Facturas', unit: 'count' },
      // No `currency` here on purpose: invoices can be issued in more than
      // one currency, so the total only ever travels inside the `currency`
      // breakdown above, never as a single mixed number.
      { key: 'revenue', label: 'Importe facturado', unit: 'currency' },
      { key: 'signups', label: 'Altas', unit: 'count' },
    ],
    days: [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date)),
  };
}

export default () => ({
  async push() {
    const url = process.env.HUB_URL;
    const key = process.env.HUB_API_KEY;
    // Not configured: a dev environment sends nothing to the hub.
    if (!url || !key) return;

    const to = localDay(-1);
    const from = localDay(-RESEND_DAYS);

    try {
      const payload = await this.build(from, to);

      const response = await fetch(`${url}/api/ingest/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Api-Key': key },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
      }

      const result = (await response.json()) as { rowsWritten?: number; warnings?: string[] };
      strapi.log.info(`Hub: sent ${from}…${to}, ${result.rowsWritten} rows`);
      (result.warnings || []).forEach((w: string) => strapi.log.warn(`Hub: ${w}`));
    } catch (e: any) {
      // Never rethrown: the hub being down cannot break Strapi's cron.
      strapi.log.error(`Hub: push failed — ${e.message}`);
    }
  },

  async build(from: string, to: string) {
    const knex = strapi.db.connection;
    const localDate = (column: string) =>
      `((${column}) AT TIME ZONE 'UTC' AT TIME ZONE ?)::date`;

    const [invoices, signups] = await Promise.all([
      knex.raw(
        `SELECT to_char(${localDate('created_at')}, 'YYYY-MM-DD') AS d,
                coalesce(status, 'draft')     AS status,
                coalesce(currency, 'USD')     AS currency,
                count(*)::int                 AS count,
                coalesce(sum(total_amount), 0)::float AS amount
           FROM ${INVOICES}
          WHERE ${localDate('created_at')} BETWEEN ?::date AND ?::date
          GROUP BY 1, 2, 3`,
        [TZ, TZ, from, to],
      ),
      knex.raw(
        `SELECT to_char(${localDate('created_at')}, 'YYYY-MM-DD') AS d,
                coalesce(provider, 'local') AS provider,
                count(*)::int               AS count
           FROM ${USERS}
          WHERE ${localDate('created_at')} BETWEEN ?::date AND ?::date
          GROUP BY 1, 2`,
        [TZ, TZ, from, to],
      ),
    ]);

    return buildPayload(invoices.rows, signups.rows, from, to);
  },
});
