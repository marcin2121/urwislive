import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { cn } from '../lib/utils';

describe('cn utility function', () => {
  test('combines basic classes correctly', () => {
    assert.equal(cn('a', 'b', 'c'), 'a b c');
  });

  test('handles conditional classes', () => {
    const condition = true;
    const falseCondition = false;
    assert.equal(cn('a', condition && 'b', falseCondition && 'c'), 'a b');
  });

  test('handles array inputs', () => {
    assert.equal(cn(['a', 'b'], ['c', 'd']), 'a b c d');
  });

  test('handles object inputs', () => {
    assert.equal(cn({ a: true, b: false, c: true }), 'a c');
  });

  test('handles mixed inputs (string, array, object)', () => {
    assert.equal(
      cn('a', ['b', 'c'], { d: true, e: false }, 'f'),
      'a b c d f'
    );
  });

  test('merges tailwind classes correctly (twMerge)', () => {
    // p-4 and p-8 are conflicting padding classes, twMerge should keep the last one
    assert.equal(cn('p-4', 'p-8'), 'p-8');

    // text-red-500 and text-blue-500 are conflicting text color classes
    assert.equal(cn('text-red-500', 'text-blue-500'), 'text-blue-500');

    // bg-red-500 and hover:bg-blue-500 do not conflict directly but are related
    assert.equal(
      cn('bg-red-500 hover:bg-blue-500', 'bg-blue-500'),
      'hover:bg-blue-500 bg-blue-500'
    );
  });

  test('handles falsy values', () => {
    assert.equal(cn('a', null, undefined, false, 0, '', 'b'), 'a b');
  });

  test('handles empty input', () => {
    assert.equal(cn(), '');
  });
});
