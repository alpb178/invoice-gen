import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { isRowBreakable } from '../src/components/InvoicePDF';

// Exporting an invoice broke twice for the same reason: react-pdf does not
// warn, it hangs. These tests cover both failures:
//
//  1. `minPresenceAhead` on a View taller than a page sent react-pdf into an
//     infinite pagination loop. Being synchronous, it froze the tab and the
//     browser aborted the export on timeout.
//  2. `wrap={false}` on a row taller than a page made react-pdf clip it,
//     losing description text without telling the user.
//
// Case 1 can only be detected with a separate process and a hard timeout: a
// synchronous loop blocks the event loop and no internal timer would fire.

const HELPER = path.join(__dirname, 'helpers', 'render-invoice-pdf.tsx');
const TIMEOUT_MS = 30_000;

interface RenderResult {
  bytes: number;
  pages: number;
  isPdf: boolean;
  warnings: string[];
}

function render(invoice: unknown, showHours = true, locale?: 'es' | 'en'): RenderResult {
  const res = spawnSync(process.execPath, ['--import', 'tsx', HELPER], {
    input: JSON.stringify({ invoice, showHours, locale }),
    encoding: 'utf8',
    timeout: TIMEOUT_MS,
    maxBuffer: 20 * 1024 * 1024,
  });

  if (res.signal) {
    assert.fail(
      `PDF generation did not finish within ${TIMEOUT_MS / 1000}s (process killed with ${res.signal}). ` +
        'It is almost certainly an infinite pagination loop in react-pdf: check `minPresenceAhead` ' +
        'on nodes that can be taller than a page.',
    );
  }
  assert.equal(res.status, 0, `Render failed:\n${res.stderr}`);
  return JSON.parse(res.stdout) as RenderResult;
}

const task = (n: number, description: string) => ({
  number: n,
  code: `TSK-${1000 + n}`,
  description,
  amount: 100 + n,
  hours: 3.5,
});

const LONG = 'descripción muy larga que ocupa varias líneas y fuerza el salto de página. ';

/**
 * Synthetic invoice: `sections` × `tasksPerSection`. `repeat` controls the
 * description length; with 0 they are short one-line descriptions.
 */
function invoiceOf(sections: number, tasksPerSection: number, repeat = 1) {
  return {
    number: '2026-001',
    date: '2026-07-29',
    status: 'sent',
    currency: 'USD',
    companyName: 'CorpSC LLC',
    companyCIF: 'B12345678',
    companyAddress: 'Calle Falsa 123\nMadrid, España',
    clientName: 'Cliente Demo',
    clientIBAN: 'ES91 2100 0418 4502 0005 1332',
    clientSwift: 'CAIXESBBXXX',
    clientBank: 'CaixaBank, Barcelona',
    notes: 'Pago a 30 días.\nGracias por su confianza.',
    sections: Array.from({ length: sections }, (_, s) => ({
      title: `Sección ${s + 1}`,
      subtitle: 'Responsable del periodo',
      tasks: Array.from({ length: tasksPerSection }, (_, t) =>
        task(
          s * tasksPerSection + t + 1,
          repeat === 0
            ? `Tarea ${t + 1} — implementación de módulo y pruebas`
            : `Tarea ${t + 1} — ${LONG.repeat(repeat)}`,
        ),
      ),
    })),
  };
}

describe('isRowBreakable', () => {
  it('keeps normal rows unbroken', () => {
    assert.equal(isRowBreakable(''), false);
    assert.equal(isRowBreakable(undefined), false);
    assert.equal(isRowBreakable('Endpoint de facturas y pruebas'), false);
    // A long description that still fits comfortably on one page.
    assert.equal(isRowBreakable('x'.repeat(600)), false);
  });

  it('allows breaking rows that do not fit on a page', () => {
    assert.equal(isRowBreakable('x'.repeat(3000)), true);
    assert.equal(isRowBreakable('x'.repeat(9000)), true);
  });
});

describe('invoice export to PDF', () => {
  it('generates a one-page PDF for a small invoice', () => {
    const r = render(invoiceOf(1, 5, 0));
    assert.ok(r.isPdf, 'the output is not a PDF');
    assert.ok(r.bytes > 1000, `suspiciously small PDF: ${r.bytes} bytes`);
    assert.equal(r.pages, 1);
    assert.deepEqual(r.warnings, []);
  });

  it('paginates a multi-page invoice without hanging', () => {
    const r = render(invoiceOf(1, 45));
    assert.ok(r.pages > 1, `expected several pages, got ${r.pages}`);
    assert.deepEqual(r.warnings, []);
  });

  // This is the exact case that froze the site: several sections that together
  // take up more than two pages.
  it('does not hang with many sections and many tasks', () => {
    const r = render(invoiceOf(3, 30));
    assert.ok(r.pages >= 3, `expected at least 3 pages, got ${r.pages}`);
    assert.deepEqual(r.warnings, []);
  });

  it('does not hang with long descriptions spread over many sections', () => {
    const r = render(invoiceOf(5, 40, 12));
    assert.ok(r.pages > 5, `expected many pages, got ${r.pages}`);
    assert.deepEqual(r.warnings, []);
  });

  it('does not hang with one section per member', () => {
    const r = render(invoiceOf(10, 15, 12));
    assert.ok(r.pages > 3);
    assert.deepEqual(r.warnings, []);
  });

  // Clipping regression: a description taller than a whole page must break
  // across pages, not lose text.
  it('breaks rows taller than a page instead of clipping them', () => {
    const r = render(invoiceOf(1, 2, 120));
    assert.deepEqual(
      r.warnings,
      [],
      'react-pdf warned that a node does not fit and clipped it: description text is being lost',
    );
    assert.ok(r.pages >= 3, `a huge row must span several pages, got ${r.pages}`);
  });

  it('renders with the English labels too', () => {
    const r = render(invoiceOf(3, 30), true, 'en');
    assert.ok(r.isPdf);
    assert.ok(r.pages >= 3, `expected at least 3 pages, got ${r.pages}`);
    assert.deepEqual(r.warnings, []);
  });

  it('works without the hours column', () => {
    const r = render(invoiceOf(2, 20), false);
    assert.ok(r.isPdf);
    assert.deepEqual(r.warnings, []);
  });

  it('copes with an almost empty invoice', () => {
    const r = render({
      number: '',
      date: '',
      status: 'draft',
      currency: 'USD',
      sections: [{ title: '', subtitle: '', tasks: [{ description: '', amount: 0 }] }],
    });
    assert.ok(r.isPdf);
    assert.equal(r.pages, 1);
  });
});
