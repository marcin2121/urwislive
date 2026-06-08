import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { calculateDecay } from './engine';

describe('calculateDecay', () => {
  describe('Zero Bound', () => {
    test('bounds the result to 0 when a large amount of time has passed', () => {
      // 1000000 seconds is large enough to decay any small value to 0, regardless of the exact rate
      assert.strictEqual(calculateDecay(10, 1000000), 0);
    });

    test('returns 0 when initial value is 0', () => {
      assert.strictEqual(calculateDecay(0, 10), 0);
    });

    test('returns 0 when initial value is negative', () => {
      // Bounding should ensure negative values are clamped to 0
      assert.strictEqual(calculateDecay(-10, 10), 0);
    });
  });
});
