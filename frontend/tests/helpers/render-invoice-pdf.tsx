// Renderiza una factura a PDF en un proceso aparte y escribe el resultado en
// stdout como JSON.
//
// Vive en su propio proceso a propósito: el fallo que este test vigila es un
// bucle infinito de paginación en react-pdf, y es SÍNCRONO. Dentro del proceso
// de test bloquearía el event loop y ningún timeout llegaría a dispararse; la
// única forma de detectarlo es matar el proceso hijo desde fuera.
//
// Entrada (stdin, JSON): { invoice, showHours }
// Salida (stdout, JSON): { bytes, pages, warnings }

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

// react-pdf avisa por console.warn cuando un nodo con wrap={false} no cabe en
// una página y lo recorta. Lo capturamos: para el test es una señal de fallo.
const warnings: string[] = [];
console.warn = (...args: unknown[]) => {
  warnings.push(args.map(String).join(' '));
};

const pageCount = (pdf: Buffer) => {
  const match = pdf.toString('latin1').match(/\/Count\s+(\d+)/);
  return match ? Number(match[1]) : 0;
};

(async () => {
  const { invoice, showHours } = JSON.parse(await readStdin());
  const buffer = await renderToBuffer(
    React.createElement(InvoicePDF, { invoice, showHours: !!showHours }) as any,
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
