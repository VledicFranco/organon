import { describe, it, expect } from 'vitest';
import {
  validateExportsPresent,
  ExportsPresentAssertionError,
} from '../src/core/assertions/exports-present.js';

describe('validateExportsPresent (pure assertion)', () => {
  it('passes when all expected exports are found', () => {
    expect(() =>
      validateExportsPresent('index.ts', ['foo', 'bar'], ['foo', 'bar', 'baz']),
    ).not.toThrow();
  });

  it('throws when an expected export is missing', () => {
    expect(() =>
      validateExportsPresent('index.ts', ['foo', 'bar'], ['foo']),
    ).toThrow(ExportsPresentAssertionError);
  });

  it('includes violation details', () => {
    try {
      validateExportsPresent('index.ts', ['foo', 'bar', 'baz'], ['foo']);
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as ExportsPresentAssertionError;
      expect(error.violations).toHaveLength(2);
      expect(error.violations[0].name).toBe('bar');
      expect(error.violations[0].file).toBe('index.ts');
      expect(error.violations[1].name).toBe('baz');
    }
  });

  it('error message includes count and names', () => {
    try {
      validateExportsPresent('lib.ts', ['missing'], []);
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as ExportsPresentAssertionError;
      expect(error.message).toContain('1 missing export(s)');
      expect(error.message).toContain('"missing"');
    }
  });

  it('error has name ExportsPresentAssertionError', () => {
    try {
      validateExportsPresent('index.ts', ['foo'], []);
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect((err as Error).name).toBe('ExportsPresentAssertionError');
    }
  });

  it('passes when expected exports is a subset of found exports', () => {
    expect(() =>
      validateExportsPresent('index.ts', ['foo'], ['foo', 'bar', 'baz']),
    ).not.toThrow();
  });
});
