import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { strokeDrawProps } from '../src/components/Charts';

// Drawing the trend line takes three steps and the order matters: with the
// transition set before the initial state was painted, the line popped in at
// once instead of being drawn.
describe('strokeDrawProps', () => {
  it('not measured: hidden and nothing to animate', () => {
    const s = strokeDrawProps(0, false, false);
    assert.equal(s.visible, false);
    assert.equal(s.dashArray, undefined);
    assert.equal(s.animated, false);
  });

  it('measured, not started: stroke offset out and NO transition', () => {
    const s = strokeDrawProps(500, false, false);
    assert.equal(s.visible, true);
    assert.equal(s.dashArray, 500);
    assert.equal(s.dashOffset, 500);
    assert.equal(s.animated, false, 'a transition here animates the initial jump backwards');
  });

  it('started: target 0 with the transition on', () => {
    const s = strokeDrawProps(500, true, false);
    assert.equal(s.dashOffset, 0);
    assert.equal(s.animated, true);
  });

  it('reduced motion: final state with no transition', () => {
    for (const on of [false, true]) {
      const s = strokeDrawProps(500, on, true);
      assert.equal(s.visible, true);
      assert.equal(s.dashArray, undefined);
      assert.equal(s.dashOffset, 0);
      assert.equal(s.animated, false);
    }
  });
});
