import { describe, it, expect } from 'vitest';
import {
  validateMaxValue,
  MaxValueAssertionError,
} from '../src/core/assertions/max-value.js';
import type {
  MaxValueEntry,
  MaxValueViolation,
} from '../src/core/assertions/max-value.js';

describe('validateMaxValue (pure assertion)', () => {
  it('passes when no values are provided', () => {
    expect(() =>
      validateMaxValue({ values: [], maxValue: 100 }),
    ).not.toThrow();
  });

  it('passes when all values are below the maximum', () => {
    const values: MaxValueEntry[] = [
      { file: 'a.ts', line: 1, lineText: 'ttl: 100', value: 100, rawValue: '100' },
      { file: 'b.ts', line: 5, lineText: 'ttl: 200', value: 200, rawValue: '200' },
    ];

    expect(() =>
      validateMaxValue({ values, maxValue: 300 }),
    ).not.toThrow();
  });

  it('passes when a value exactly equals the maximum', () => {
    const values: MaxValueEntry[] = [
      { file: 'a.ts', line: 1, lineText: 'ttl: 86400', value: 86400, rawValue: '86400' },
    ];

    expect(() =>
      validateMaxValue({ values, maxValue: 86400 }),
    ).not.toThrow();
  });

  it('throws MaxValueAssertionError when a value exceeds the maximum', () => {
    const values: MaxValueEntry[] = [
      { file: 'config.ts', line: 10, lineText: '  ttl: 172800,', value: 172800, rawValue: '172800' },
    ];

    expect(() =>
      validateMaxValue({ values, maxValue: 86400 }),
    ).toThrow(MaxValueAssertionError);
  });

  it('includes violation details in the error', async () => {
    const values: MaxValueEntry[] = [
      { file: 'config.ts', line: 10, lineText: '  ttl: 172800,', value: 172800, rawValue: '172800' },
    ];

    try {
      validateMaxValue({ values, maxValue: 86400 });
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(MaxValueAssertionError);
      const error = err as MaxValueAssertionError;
      expect(error.violations).toHaveLength(1);
      expect(error.violations[0]).toEqual({
        file: 'config.ts',
        line: 10,
        lineText: '  ttl: 172800,',
        actualValue: 172800,
        maxValue: 86400,
        unit: undefined,
      });
    }
  });

  it('includes unit in error message when provided', async () => {
    const values: MaxValueEntry[] = [
      { file: 'config.ts', line: 10, lineText: '  ttl: 172800,', value: 172800, rawValue: '172800' },
    ];

    try {
      validateMaxValue({ values, maxValue: 86400, unit: 'seconds' });
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as MaxValueAssertionError;
      expect(error.message).toContain('seconds');
      expect(error.violations[0].unit).toBe('seconds');
    }
  });

  it('reports all violations (not just the first)', async () => {
    const values: MaxValueEntry[] = [
      { file: 'a.ts', line: 1, lineText: 'ttl: 100000', value: 100000, rawValue: '100000' },
      { file: 'b.ts', line: 5, lineText: 'ttl: 50', value: 50, rawValue: '50' },
      { file: 'c.ts', line: 3, lineText: 'ttl: 200000', value: 200000, rawValue: '200000' },
    ];

    try {
      validateMaxValue({ values, maxValue: 86400 });
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as MaxValueAssertionError;
      expect(error.violations).toHaveLength(2);
      expect(error.violations[0].file).toBe('a.ts');
      expect(error.violations[1].file).toBe('c.ts');
    }
  });

  it('error message includes file:line format', async () => {
    const values: MaxValueEntry[] = [
      { file: 'src/config.ts', line: 42, lineText: '  ttl: 99999,', value: 99999, rawValue: '99999' },
    ];

    try {
      validateMaxValue({ values, maxValue: 86400 });
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as MaxValueAssertionError;
      expect(error.message).toContain('src/config.ts:42');
      expect(error.message).toContain('found 99999');
      expect(error.message).toContain('max allowed is 86400');
    }
  });

  it('error message includes violation count', async () => {
    const values: MaxValueEntry[] = [
      { file: 'a.ts', line: 1, lineText: 'v: 999', value: 999, rawValue: '999' },
      { file: 'b.ts', line: 2, lineText: 'v: 888', value: 888, rawValue: '888' },
    ];

    try {
      validateMaxValue({ values, maxValue: 100 });
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as MaxValueAssertionError;
      expect(error.message).toContain('2 violation(s)');
    }
  });

  it('error has name MaxValueAssertionError', async () => {
    const values: MaxValueEntry[] = [
      { file: 'a.ts', line: 1, lineText: 'v: 999', value: 999, rawValue: '999' },
    ];

    try {
      validateMaxValue({ values, maxValue: 100 });
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect((err as Error).name).toBe('MaxValueAssertionError');
    }
  });

  it('includes trimmed line text in error message', async () => {
    const values: MaxValueEntry[] = [
      { file: 'a.ts', line: 1, lineText: '    ttl: 999,   ', value: 999, rawValue: '999' },
    ];

    try {
      validateMaxValue({ values, maxValue: 100 });
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as MaxValueAssertionError;
      expect(error.message).toContain('> ttl: 999,');
    }
  });
});
