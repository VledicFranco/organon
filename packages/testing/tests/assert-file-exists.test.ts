import { describe, it, expect } from 'vitest';
import {
  assertFileExists,
  FileExistsResolverError,
  FileExistsAssertionError,
} from '../src/core/assert-file-exists.js';
import { MockFileSystem } from './test-helpers.js';

describe('assertFileExists (high-level)', () => {
  it('passes when all files exist', async () => {
    const fs = new MockFileSystem({
      'src/foo.ts': 'export const foo = 1;',
      'src/bar.ts': 'export const bar = 2;',
    });

    await expect(
      assertFileExists({ files: ['src/foo.ts', 'src/bar.ts'], fs }),
    ).resolves.toBeUndefined();
  });

  it('throws FileExistsAssertionError when a file is missing', async () => {
    const fs = new MockFileSystem({
      'src/foo.ts': 'export const foo = 1;',
    });

    await expect(
      assertFileExists({ files: ['src/foo.ts', 'src/missing.ts'], fs }),
    ).rejects.toThrow(FileExistsAssertionError);
  });

  it('throws FileExistsResolverError when files array is empty', async () => {
    const fs = new MockFileSystem({});

    await expect(
      assertFileExists({ files: [], fs }),
    ).rejects.toThrow(FileExistsResolverError);
  });

  it('resolves paths relative to cwd', async () => {
    const fs = new MockFileSystem({
      'project/src/foo.ts': 'content',
    });

    await expect(
      assertFileExists({ files: ['src/foo.ts'], cwd: 'project', fs }),
    ).resolves.toBeUndefined();
  });

  it('reports missing file with correct path when using cwd', async () => {
    const fs = new MockFileSystem({});

    try {
      await assertFileExists({ files: ['src/missing.ts'], cwd: 'project', fs });
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as FileExistsAssertionError;
      expect(error.violations[0].file).toBe('src/missing.ts');
    }
  });

  it('checks multiple files and reports all missing ones', async () => {
    const fs = new MockFileSystem({
      'b.ts': 'content',
    });

    try {
      await assertFileExists({ files: ['a.ts', 'b.ts', 'c.ts'], fs });
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as FileExistsAssertionError;
      expect(error.violations).toHaveLength(2);
      expect(error.violations[0].file).toBe('a.ts');
      expect(error.violations[1].file).toBe('c.ts');
    }
  });
});
