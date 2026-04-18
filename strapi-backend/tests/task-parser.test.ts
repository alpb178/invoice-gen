import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseTasksFromText } from '../src/api/invoice/services/task-parser';

describe('parseTasksFromText', () => {
  it('returns empty array for empty input', () => {
    assert.deepEqual(parseTasksFromText(''), []);
    assert.deepEqual(parseTasksFromText('   \n\n'), []);
  });

  it('parses invoice-style rows with row index + description + amount', () => {
    const input = `
      1  Checklist General (torneo, empleados, general)   70.00
      2  Adjuntos de Golf                                  18.00
      3  Adicionar vehículo a los mantenimientos            6.50
    `;
    const tasks = parseTasksFromText(input);
    assert.equal(tasks.length, 3);
    assert.equal(tasks[0].description, 'Checklist General (torneo, empleados, general)');
    assert.equal(tasks[0].amount, 70);
    assert.equal(tasks[1].amount, 18);
    assert.equal(tasks[2].amount, 6.5);
  });

  it('extracts code when present (TF-xxx / TIK-xxx)', () => {
    const input = `
      1  TIK-466  Cambios en Mantenimiento      50.00
      2  TIK-463  Cambios en la IA              95.00
      3  TIK 421  Cambios en Phitosanitary      50.00
      4  TIK-461  CRUD para Checklist          190.00
      5  TIK-383  CRUD para Torneo             200
    `;
    const tasks = parseTasksFromText(input);
    assert.equal(tasks.length, 5);
    assert.equal(tasks[0].code, 'TIK-466');
    assert.equal(tasks[0].description, 'Cambios en Mantenimiento');
    assert.equal(tasks[0].amount, 50);
    assert.equal(tasks[2].code, 'TIK-421', 'normalizes "TIK 421" to "TIK-421"');
    assert.equal(tasks[4].amount, 200);
  });

  it('skips header and subtotal/total lines', () => {
    const input = `
      Nº  Tarea                  Estimación (USD)
      1   Checklist              70.00
      2   Adjuntos               18.00
      Subtotal Sección 1: 88.00 USD
      TOTAL GENERAL A PAGAR: 88.00 USD
    `;
    const tasks = parseTasksFromText(input);
    assert.equal(tasks.length, 2);
    assert.equal(tasks[0].amount, 70);
    assert.equal(tasks[1].amount, 18);
  });

  it('skips Jira-style status keywords on the same line', () => {
    const input = `
      TF-352  Feature: Events — group chat              DONE  15
      TF-351  feat(maintenance): add products section   DONE   6
    `;
    const tasks = parseTasksFromText(input);
    assert.equal(tasks.length, 2);
    assert.equal(tasks[0].code, 'TF-352');
    assert.equal(tasks[0].amount, 15);
    assert.ok(!/DONE/.test(tasks[0].description));
    assert.equal(tasks[1].code, 'TF-351');
    assert.equal(tasks[1].amount, 6);
  });

  it('handles lines without a code', () => {
    const input = `
      Golf Torneo        60.00
      Mantenimiento      32.00
      Presupuesto        34.00
    `;
    const tasks = parseTasksFromText(input);
    assert.equal(tasks.length, 3);
    assert.equal(tasks[0].code, undefined);
    assert.equal(tasks[0].description, 'Golf Torneo');
    assert.equal(tasks[0].amount, 60);
  });

  it('coalesces orphan PDF-style lines (index / description / amount on separate lines)', () => {
    const input = `
1
Checklist General (torneo, empleados, general)
70.00
2
Adjuntos de Golf
18.00
    `;
    const tasks = parseTasksFromText(input);
    assert.equal(tasks.length, 2);
    assert.equal(tasks[0].description, 'Checklist General (torneo, empleados, general)');
    assert.equal(tasks[0].amount, 70);
    assert.equal(tasks[1].description, 'Adjuntos de Golf');
    assert.equal(tasks[1].amount, 18);
  });

  it('detects hours column when two numbers appear per row', () => {
    // descripción + horas(penúltimo) + monto(último)
    const input = `
      1  Landing Page Human Core   10  149.00
      2  Chrono por empleados       2   15.00
    `;
    const tasks = parseTasksFromText(input);
    assert.equal(tasks.length, 2);
    assert.equal(tasks[0].amount, 149);
    assert.equal(tasks[0].hours, 10);
    assert.equal(tasks[1].amount, 15);
    assert.equal(tasks[1].hours, 2);
  });

  it('does NOT misinterpret a large second number as hours', () => {
    // Si hay "800 900" ninguno es claramente horas: solo toma el último como amount.
    const input = `Cosas grandes 800 900`;
    const tasks = parseTasksFromText(input);
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].amount, 900);
    assert.equal(tasks[0].hours, undefined);
  });

  it('ignores lines that are only numbers with no description', () => {
    const input = `
      15
      6
      Real Task 12
    `;
    const tasks = parseTasksFromText(input);
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].description, 'Real Task');
    assert.equal(tasks[0].amount, 12);
  });

  it('parses comma decimals (EU locale)', () => {
    const input = `Diseño de landing 123,45`;
    const tasks = parseTasksFromText(input);
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].amount, 123.45);
  });

  it('parses the full reference invoice body without crashing', () => {
    const input = `
FACTURA - No. 29/2025
Emx Comunicaciones S.L.U.
CIF: B85173963
Calle Ferrerías 19, Oficina 1
San Sebastián / Gipuzkoa
Emitido a favor de:
Alejandro Pérez
IBAN: BE95905522553858
Swift/BIC: TRWIBEB1XXX

Tareas de Desarrollo (Front-Diciembre)
Nº  Tarea                                                        Estimación (USD)
1   Checklist General (torneo, empleados, general)               70.00
2   Adjuntos de Golf                                             18.00
3   Adicionar vehículo a los mantenimientos                       6.50
4   Cambios en el diseño del drawer layout para orlegitech y tikneo 8.50
7   Formateo de la Respuesta de IA para el chat de orlegitech     9.00

Subtotal Sección 1: 550.00 USD

Tareas de Desarrollo (Back-Diciembre)
Nº  Tarea                                  Precio (USD)
1   TIK 466 Cambios en Mantenimiento        50.00
2   TIK 463 Cambios en la IA                95.00
3   TIK 421 Cambios en Phitosanitary        50.00
4   TIK-461 CRUD para Checklist            190.00
5   TIK-383 CRUD para Torneo               200

Subtotal Sección 2: 535.00 USD
    `;
    const tasks = parseTasksFromText(input);
    assert.ok(tasks.length >= 10, `expected at least 10 tasks, got ${tasks.length}`);

    // No deben entrar los encabezados ni los subtotales
    const descriptions = tasks.map((t) => t.description.toLowerCase());
    for (const d of descriptions) {
      assert.ok(!d.includes('subtotal'));
      assert.ok(!d.startsWith('tareas de desarrollo'));
      assert.ok(!d.includes('factura'));
    }

    // verifica algunos campos conocidos
    const byAmount = new Map(tasks.map((t) => [t.amount, t]));
    assert.ok(byAmount.has(70), 'checklist general = 70');
    assert.ok(byAmount.has(190), 'crud checklist = 190');
    assert.ok(byAmount.has(200), 'crud torneo = 200');
  });
});
