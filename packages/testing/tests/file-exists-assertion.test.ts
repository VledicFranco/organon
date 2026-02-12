import { describe, it, expect } from 'vitest';
import {
  validateFileExists,
  FileExistsAssertionError,
} from '../src/core/assertions/file-exists.js';
import type { FileExistsEntry } from '../src/core/assertions/file-exists.js';

describe('validateFileExists (pure assertion)', () => {
  it('passes when no entries are provided', () => {
    expect(() => validateFileExists([])).not.toThrow();
  });

  it('passes when all files exist', () => {
    const entries: FileExistsEntry[] = [
      { file: 'a.ts', exists: true },
      { file: 'b.ts', exists: true },
    ];

    expect(() => validateFileExists(entries)).not.toThrow();
  });

  it('throws FileExistsAssertionError when a file is missing', () => {
    const entries: FileExistsEntry[] = [
      { file: 'a.ts', exists: true },
      { file: 'missing.ts', exists: false },
    ];

    expect(() => validateFileExists(entries)).toThrow(FileExistsAssertionError);
  });

  it('includes violation details in the error', () => {
    const entries: FileExistsEntry[] = [
      { file: 'missing.ts', exists: false },
    ];

    try {
      validateFileExists(entries);
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(FileExistsAssertionError);
      const error = err as FileExistsAssertionError;
      expect(error.violations).toHaveLength(1);
      expect(error.violations[0]).toEqual({ file: 'missing.ts' });
    }
  });

  it('reports all missing files (not just the first)', () => {
    const entries: FileExistsEntry[] = [
      { file: 'a.ts', exists: false },
      { file: 'b.ts', exists: true },
      { file: 'c.ts', exists: false },
    ];

    try {
      validateFileExists(entries);
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as FileExistsAssertionError;
      expect(error.violations).toHaveLength(2);
      expect(error.violations[0].file).toBe('a.ts');
      expect(error.violations[1].file).toBe('c.ts');
    }
  });

  it('error message includes count and file paths', () => {
    const entries: FileExistsEntry[] = [
      { file: 'src/foo.ts', exists: false },
      { file: 'src/bar.ts', exists: false },
    ];

    try {
      validateFileExists(entries);
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as FileExistsAssertionError;
      expect(error.message).toContain('2 missing file(s)');
      expect(error.message).toContain('src/foo.ts');
      expect(error.message).toContain('src/bar.ts');
    }
  });

  it('error has name FileExistsAssertionError', () => {
    const entries: FileExistsEntry[] = [
      { file: 'missing.ts', exists: false },
    ];

    try {
      validateFileExists(entries);
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect((err as Error).name).toBe('FileExistsAssertionError');
    }
  });
});
