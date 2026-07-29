import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { isRowBreakable } from '../src/components/InvoicePDF';

// Exportar una factura se rompió dos veces por la misma razón: react-pdf no
// avisa, se cuelga. Estos tests cubren los dos fallos:
//
//  1. `minPresenceAhead` en un View más alto que una página metía a react-pdf en
//     un bucle infinito de paginación. Al ser síncrono congelaba la pestaña y el
//     navegador abortaba la exportación por timeout.
//  2. `wrap={false}` en una fila más alta que una página hacía que react-pdf la
//     recortara, perdiendo texto de la descripción sin avisar al usuario.
//
// El caso 1 solo se detecta con un proceso aparte y un timeout duro: un bucle
// síncrono bloquea el event loop y ningún temporizador interno se dispararía.

const HELPER = path.join(__dirname, 'helpers', 'render-invoice-pdf.tsx');
const TIMEOUT_MS = 30_000;

interface RenderResult {
  bytes: number;
  pages: number;
  isPdf: boolean;
  warnings: string[];
}

function render(invoice: unknown, showHours = true): RenderResult {
  const res = spawnSync(process.execPath, ['--import', 'tsx', HELPER], {
    input: JSON.stringify({ invoice, showHours }),
    encoding: 'utf8',
    timeout: TIMEOUT_MS,
    maxBuffer: 20 * 1024 * 1024,
  });

  if (res.signal) {
    assert.fail(
      `La generación del PDF no terminó en ${TIMEOUT_MS / 1000}s (proceso terminado con ${res.signal}). ` +
        'Casi seguro es un bucle infinito de paginación en react-pdf: revisa `minPresenceAhead` ' +
        'en nodos que puedan ser más altos que una página.',
    );
  }
  assert.equal(res.status, 0, `El render falló:\n${res.stderr}`);
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
 * Factura sintética: `sections` × `tasksPerSection`. `repeat` controla el largo
 * de la descripción; con 0 son descripciones cortas de una línea.
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
  it('mantiene las filas normales sin partir', () => {
    assert.equal(isRowBreakable(''), false);
    assert.equal(isRowBreakable(undefined), false);
    assert.equal(isRowBreakable('Endpoint de facturas y pruebas'), false);
    // Una descripción larga pero que sigue cabiendo de sobra en una página.
    assert.equal(isRowBreakable('x'.repeat(600)), false);
  });

  it('permite partir las filas que no caben en una página', () => {
    assert.equal(isRowBreakable('x'.repeat(3000)), true);
    assert.equal(isRowBreakable('x'.repeat(9000)), true);
  });
});

describe('exportación de la factura a PDF', () => {
  it('genera un PDF de una página para una factura pequeña', () => {
    const r = render(invoiceOf(1, 5, 0));
    assert.ok(r.isPdf, 'la salida no es un PDF');
    assert.ok(r.bytes > 1000, `PDF sospechosamente pequeño: ${r.bytes} bytes`);
    assert.equal(r.pages, 1);
    assert.deepEqual(r.warnings, []);
  });

  it('pagina una factura de varias páginas sin colgarse', () => {
    const r = render(invoiceOf(1, 45));
    assert.ok(r.pages > 1, `esperaba varias páginas, salieron ${r.pages}`);
    assert.deepEqual(r.warnings, []);
  });

  // Este es el caso exacto que congelaba la web: varias secciones que en
  // conjunto ocupan más de dos páginas.
  it('no se cuelga con muchas secciones y muchas tareas', () => {
    const r = render(invoiceOf(3, 30));
    assert.ok(r.pages >= 3, `esperaba al menos 3 páginas, salieron ${r.pages}`);
    assert.deepEqual(r.warnings, []);
  });

  it('no se cuelga con descripciones largas repartidas en muchas secciones', () => {
    const r = render(invoiceOf(5, 40, 12));
    assert.ok(r.pages > 5, `esperaba muchas páginas, salieron ${r.pages}`);
    assert.deepEqual(r.warnings, []);
  });

  it('no se cuelga con una sección por integrante', () => {
    const r = render(invoiceOf(10, 15, 12));
    assert.ok(r.pages > 3);
    assert.deepEqual(r.warnings, []);
  });

  // Regresión del recorte: una descripción más alta que la página entera debe
  // partirse entre páginas, no perder texto.
  it('parte las filas más altas que una página en vez de recortarlas', () => {
    const r = render(invoiceOf(1, 2, 120));
    assert.deepEqual(
      r.warnings,
      [],
      'react-pdf avisó de que un nodo no cabe y lo recortó: se está perdiendo texto de la descripción',
    );
    assert.ok(r.pages >= 3, `una fila enorme debe ocupar varias páginas, salieron ${r.pages}`);
  });

  it('funciona sin la columna de horas', () => {
    const r = render(invoiceOf(2, 20), false);
    assert.ok(r.isPdf);
    assert.deepEqual(r.warnings, []);
  });

  it('aguanta una factura casi vacía', () => {
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
