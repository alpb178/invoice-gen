// Renders an invoice to PDF in a separate process and writes the result to
// stdout as JSON.
//
// It lives in its own process on purpose: the failure this test guards against
// is an infinite pagination loop in react-pdf, and it is SYNCHRONOUS. Inside the
// test process it would block the event loop and no timeout would ever fire;
// the only way to detect it is to kill the child process from outside.
//
// Input (stdin, JSON): { invoice, showHours, locale? }
// Output (stdout, JSON): { bytes, pages, warnings }

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import InvoicePDF from '../../src/components/InvoicePDF';

const readStdin = () =>
  new Promise<string>((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });

// react-pdf warns through console.warn when a node with wrap={false} does not
// fit on a page and clips it. We capture it: for the test it signals failure.
const warnings: string[] = [];
console.warn = (...args: unknown[]) => {
  warnings.push(args.map(String).join(' '));
};

const pageCount = (pdf: Buffer) => {
  const match = pdf.toString('latin1').match(/\/Count\s+(\d+)/);
  return match ? Number(match[1]) : 0;
};

(async () => {
  const { invoice, showHours, locale } = JSON.parse(await readStdin());
  const buffer = await renderToBuffer(
    React.createElement(InvoicePDF, { invoice, showHours: !!showHours, locale }) as any,
  );
  process.stdout.write(
    JSON.stringify({
      bytes: buffer.length,
      pages: pageCount(buffer),
      isPdf: buffer.subarray(0, 5).toString() === '%PDF-',
      warnings,
    }),
  );
})().catch((err) => {
  process.stderr.write(String(err?.stack || err));
  process.exit(1);
});
