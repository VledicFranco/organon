import { describe, it, expect } from 'vitest';
import {
  assertNoSideEffects,
  NoSideEffectsResolverError,
  NoSideEffectsAssertionError,
} from '../src/core/assert-no-side-effects.js';
import { MockFileSystem } from './test-helpers.js';

describe('assertNoSideEffects (high-level)', () => {
  it('passes when no forbidden imports found', async () => {
    const fs = new MockFileSystem({
      'src/pure.ts': `import { join } from 'node:path';\nexport const x = 1;`,
    });

    await expect(
      assertNoSideEffects({
        files: ['src/pure.ts'],
        forbiddenModules: ['fs', 'http'],
        fs,
      }),
    ).resolves.toBeUndefined();
  });

  it('throws NoSideEffectsAssertionError when forbidden import found', async () => {
    const fs = new MockFileSystem({
      'src/bad.ts': `import { readFile } from 'node:fs/promises';`,
    });

    await expect(
      assertNoSideEffects({
        files: ['src/bad.ts'],
        forbiddenModules: ['fs'],
        fs,
      }),
    ).rejects.toThrow(NoSideEffectsAssertionError);
  });

  it('throws NoSideEffectsResolverError when files array is empty', async () => {
    const fs = new MockFileSystem({});

    await expect(
      assertNoSideEffects({
        files: [],
        forbiddenModules: ['fs'],
        fs,
      }),
    ).rejects.toThrow(NoSideEffectsResolverError);
  });

  it('throws NoSideEffectsResolverError when forbiddenModules is empty', async () => {
    const fs = new MockFileSystem({
      'src/a.ts': 'export const x = 1;',
    });

    await expect(
      assertNoSideEffects({
        files: ['src/a.ts'],
        forbiddenModules: [],
        fs,
      }),
    ).rejects.toThrow(NoSideEffectsResolverError);
  });

  it('throws when no files match and requireMatches is true', async () => {
    const fs = new MockFileSystem({});

    await expect(
      assertNoSideEffects({
        files: ['src/*.ts'],
        forbiddenModules: ['fs'],
        fs,
      }),
    ).rejects.toThrow(NoSideEffectsResolverError);
  });

  it('passes when no files match and requireMatches is false', async () => {
    const fs = new MockFileSystem({});

    await expect(
      assertNoSideEffects({
        files: ['src/*.ts'],
        forbiddenModules: ['fs'],
        fs,
        requireMatches: false,
      }),
    ).resolves.toBeUndefined();
  });

  it('scans glob patterns', async () => {
    const fs = new MockFileSystem({
      'src/a.ts': `export const x = 1;`,
      'src/b.ts': `import fs from 'fs';`,
    });

    await expect(
      assertNoSideEffects({
        files: ['src/*.ts'],
        forbiddenModules: ['fs'],
        fs,
      }),
    ).rejects.toThrow(NoSideEffectsAssertionError);
  });

  it('resolves paths relative to cwd', async () => {
    const fs = new MockFileSystem({
      'project/src/pure.ts': `export const x = 1;`,
    });

    await expect(
      assertNoSideEffects({
        files: ['src/*.ts'],
        forbiddenModules: ['fs'],
        cwd: 'project',
        fs,
      }),
    ).resolves.toBeUndefined();
  });

  it('detects require() calls as forbidden', async () => {
    const fs = new MockFileSystem({
      'src/legacy.ts': `const http = require('http');`,
    });

    await expect(
      assertNoSideEffects({
        files: ['src/legacy.ts'],
        forbiddenModules: ['http'],
        fs,
      }),
    ).rejects.toThrow(NoSideEffectsAssertionError);
  });

  it('throws resolver error when file cannot be read (concrete path)', async () => {
    const fs = new MockFileSystem({});

    await expect(
      assertNoSideEffects({
        files: ['missing.ts'],
        forbiddenModules: ['fs'],
        fs,
      }),
    ).rejects.toThrow(NoSideEffectsResolverError);
  });
});
