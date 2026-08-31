import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { strokeDrawProps } from '../src/components/Charts';

// El dibujado de la línea de tendencia va en tres pasos y el orden importa:
// con la transición puesta antes de pintar el estado inicial, la línea aparecía
// de golpe en vez de dibujarse.
describe('strokeDrawProps', () => {
  it('sin medir: oculta y sin nada que animar', () => {
    const s = strokeDrawProps(0, false, false);
    assert.equal(s.visible, false);
    assert.equal(s.dashArray, undefined);
    assert.equal(s.animated, false);
  });

  it('medida y sin arrancar: trazo fuera y SIN transición', () => {
    const s = strokeDrawProps(500, false, false);
    assert.equal(s.visible, true);
    assert.equal(s.dashArray, 500);
    assert.equal(s.dashOffset, 500);
    assert.equal(s.animated, false, 'la transición aquí anima el salto inicial al revés');
  });

  it('arrancada: destino 0 y transición puesta', () => {
    const s = strokeDrawProps(500, true, false);
    assert.equal(s.dashOffset, 0);
    assert.equal(s.animated, true);
  });

  it('con movimiento reducido: estado final sin transición', () => {
    for (const on of [false, true]) {
      const s = strokeDrawProps(500, on, true);
      assert.equal(s.visible, true);
      assert.equal(s.dashArray, undefined);
      assert.equal(s.dashOffset, 0);
      assert.equal(s.animated, false);
    }
  });
});
