import { describe, it, expect } from 'vitest';
import {
  validateNoSideEffects,
  NoSideEffectsAssertionError,
  isForbidden,
} from '../src/core/assertions/no-side-effects.js';
import type { ImportMatch } from '../src/core/resolvers/import-resolver.js';

describe('isForbidden', () => {
  it('matches exact module name', () => {
    expect(isForbidden('fs', ['fs'])).toBe(true);
  });

  it('matches node:-prefixed module', () => {
    expect(isForbidden('node:fs', ['fs'])).toBe(true);
  });

  it('matches subpath imports', () => {
    expect(isForbidden('fs/promises', ['fs'])).toBe(true);
  });

  it('matches node:-prefixed subpath imports', () => {
    expect(isForbidden('node:fs/promises', ['fs'])).toBe(true);
  });

  it('does not match partial name', () => {
    expect(isForbidden('fast-glob', ['fs'])).toBe(false);
  });

  it('does not match unrelated module', () => {
    expect(isForbidden('lodash', ['fs', 'http'])).toBe(false);
  });
});

describe('validateNoSideEffects (pure assertion)', () => {
  it('passes when no imports are provided', () => {
    expect(() =>
      validateNoSideEffects([], ['fs']),
    ).not.toThrow();
  });

  it('passes when no imports match forbidden list', () => {
    const imports: ImportMatch[] = [
      { file: 'a.ts', line: 1, lineText: "import { join } from 'node:path';", module: 'node:path' },
    ];

    expect(() =>
      validateNoSideEffects(imports, ['fs', 'http']),
    ).not.toThrow();
  });

  it('throws when a forbidden import is found', () => {
    const imports: ImportMatch[] = [
      { file: 'a.ts', line: 1, lineText: "import fs from 'fs';", module: 'fs' },
    ];

    expect(() =>
      validateNoSideEffects(imports, ['fs']),
    ).toThrow(NoSideEffectsAssertionError);
  });

  it('includes violation details in the error', () => {
    const imports: ImportMatch[] = [
      { file: 'pure.ts', line: 3, lineText: "import { readFile } from 'node:fs/promises';", module: 'node:fs/promises' },
    ];

    try {
      validateNoSideEffects(imports, ['fs']);
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as NoSideEffectsAssertionError;
      expect(error.violations).toHaveLength(1);
      expect(error.violations[0].file).toBe('pure.ts');
      expect(error.violations[0].line).toBe(3);
      expect(error.violations[0].module).toBe('node:fs/promises');
    }
  });

  it('reports all violations (not just the first)', () => {
    const imports: ImportMatch[] = [
      { file: 'a.ts', line: 1, lineText: "import fs from 'fs';", module: 'fs' },
      { file: 'a.ts', line: 2, lineText: "import path from 'path';", module: 'path' },
      { file: 'b.ts', line: 5, lineText: "import http from 'http';", module: 'http' },
    ];

    try {
      validateNoSideEffects(imports, ['fs', 'http']);
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as NoSideEffectsAssertionError;
      expect(error.violations).toHaveLength(2);
      expect(error.violations[0].module).toBe('fs');
      expect(error.violations[1].module).toBe('http');
    }
  });

  it('error message includes file:line format', () => {
    const imports: ImportMatch[] = [
      { file: 'src/bad.ts', line: 42, lineText: "  import fs from 'fs';  ", module: 'fs' },
    ];

    try {
      validateNoSideEffects(imports, ['fs']);
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as NoSideEffectsAssertionError;
      expect(error.message).toContain('src/bad.ts:42');
      expect(error.message).toContain('forbidden module "fs"');
    }
  });

  it('error has name NoSideEffectsAssertionError', () => {
    const imports: ImportMatch[] = [
      { file: 'a.ts', line: 1, lineText: "import fs from 'fs';", module: 'fs' },
    ];

    try {
      validateNoSideEffects(imports, ['fs']);
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect((err as Error).name).toBe('NoSideEffectsAssertionError');
    }
  });
});
