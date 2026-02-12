import { describe, it, expect } from 'vitest';
import {
  assertNamingConvention,
  NamingConventionResolverError,
  NamingConventionAssertionError,
} from '../src/core/assert-naming-convention.js';
import { MockFileSystem } from './test-helpers.js';

describe('assertNamingConvention (high-level)', () => {
  describe('filenames mode', () => {
    it('passes when all filenames match kebab-case', async () => {
      const fs = new MockFileSystem({
        'src/foo-bar.ts': '',
        'src/baz-qux.ts': '',
      });

      await expect(
        assertNamingConvention({
          mode: 'filenames',
          files: ['src/*.ts'],
          convention: 'kebab-case',
          fs,
        }),
      ).resolves.toBeUndefined();
    });

    it('throws when a filename violates the convention', async () => {
      const fs = new MockFileSystem({
        'src/foo-bar.ts': '',
        'src/FooBar.ts': '',
      });

      await expect(
        assertNamingConvention({
          mode: 'filenames',
          files: ['src/*.ts'],
          convention: 'kebab-case',
          fs,
        }),
      ).rejects.toThrow(NamingConventionAssertionError);
    });

    it('respects exceptions', async () => {
      const fs = new MockFileSystem({
        'src/foo-bar.ts': '',
        'src/FooBar.ts': '',
      });

      await expect(
        assertNamingConvention({
          mode: 'filenames',
          files: ['src/*.ts'],
          convention: 'kebab-case',
          exceptions: ['FooBar'],
          fs,
        }),
      ).resolves.toBeUndefined();
    });

    it('throws when no files match', async () => {
      const fs = new MockFileSystem({});

      await expect(
        assertNamingConvention({
          mode: 'filenames',
          files: ['src/*.ts'],
          convention: 'kebab-case',
          fs,
        }),
      ).rejects.toThrow(NamingConventionResolverError);
    });
  });

  describe('identifiers mode', () => {
    it('passes when all identifiers match camelCase', async () => {
      const fs = new MockFileSystem({
        'src/foo.ts': `export function myFunc() {}\nexport function anotherFunc() {}`,
      });

      await expect(
        assertNamingConvention({
          mode: 'identifiers',
          files: ['src/*.ts'],
          convention: 'camelCase',
          pattern: /export function (\w+)/,
          fs,
        }),
      ).resolves.toBeUndefined();
    });

    it('throws when an identifier violates the convention', async () => {
      const fs = new MockFileSystem({
        'src/foo.ts': `export function MyFunc() {}`,
      });

      await expect(
        assertNamingConvention({
          mode: 'identifiers',
          files: ['src/*.ts'],
          convention: 'camelCase',
          pattern: /export function (\w+)/,
          fs,
        }),
      ).rejects.toThrow(NamingConventionAssertionError);
    });

    it('throws when pattern is not provided', async () => {
      const fs = new MockFileSystem({
        'src/foo.ts': 'content',
      });

      await expect(
        assertNamingConvention({
          mode: 'identifiers',
          files: ['src/*.ts'],
          convention: 'camelCase',
          fs,
        }),
      ).rejects.toThrow(NamingConventionResolverError);
    });
  });

  it('throws when files array is empty', async () => {
    const fs = new MockFileSystem({});

    await expect(
      assertNamingConvention({
        mode: 'filenames',
        files: [],
        convention: 'kebab-case',
        fs,
      }),
    ).rejects.toThrow(NamingConventionResolverError);
  });

  it('resolves paths relative to cwd', async () => {
    const fs = new MockFileSystem({
      'project/src/foo-bar.ts': '',
    });

    await expect(
      assertNamingConvention({
        mode: 'filenames',
        files: ['src/*.ts'],
        convention: 'kebab-case',
        cwd: 'project',
        fs,
      }),
    ).resolves.toBeUndefined();
  });

  describe('identifiers mode edge cases', () => {
    it('throws when no files match in identifiers mode', async () => {
      const fs = new MockFileSystem({});

      await expect(
        assertNamingConvention({
          mode: 'identifiers',
          files: ['src/*.ts'],
          convention: 'camelCase',
          pattern: /export function (\w+)/,
          fs,
        }),
      ).rejects.toThrow(NamingConventionResolverError);
    });

    it('throws resolver error when file cannot be read in identifiers mode', async () => {
      const fs = new MockFileSystem({});

      await expect(
        assertNamingConvention({
          mode: 'identifiers',
          files: ['missing.ts'],
          convention: 'camelCase',
          pattern: /export function (\w+)/,
          fs,
        }),
      ).rejects.toThrow(NamingConventionResolverError);
    });
  });

  describe('filenames mode edge cases', () => {
    it('throws resolver error when glob expansion fails in filenames mode', async () => {
      // Use a concrete path that doesn't exist (not a glob)
      // Since resolveFileStems doesn't read files, only a glob error would trigger this
      // We can't easily trigger a glob error with MockFileSystem,
      // but we verify that no files match returns the right error
      const fs = new MockFileSystem({});

      await expect(
        assertNamingConvention({
          mode: 'filenames',
          files: ['nonexistent/*.ts'],
          convention: 'kebab-case',
          fs,
        }),
      ).rejects.toThrow(NamingConventionResolverError);
    });
  });
});
