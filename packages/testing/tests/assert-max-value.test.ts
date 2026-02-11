import { describe, it, expect } from 'vitest';
import {
  assertMaxValue,
  MaxValueResolverError,
  MaxValueAssertionError,
} from '../src/core/assert-max-value.js';
import { MockFileSystem } from './test-helpers.js';

describe('assertMaxValue (high-level)', () => {
  it('passes when all values are within the maximum', async () => {
    const fs = new MockFileSystem({
      'src/config.ts': 'export const ttl = 3600;',
    });

    await expect(
      assertMaxValue({
        files: ['src/config.ts'],
        pattern: /ttl\s*=\s*(\d+)/,
        maxValue: 86400,
        fs,
      }),
    ).resolves.toBeUndefined();
  });

  it('throws MaxValueAssertionError when a value exceeds the maximum', async () => {
    const fs = new MockFileSystem({
      'src/config.ts': 'export const ttl = 172800;',
    });

    await expect(
      assertMaxValue({
        files: ['src/config.ts'],
        pattern: /ttl\s*=\s*(\d+)/,
        maxValue: 86400,
        unit: 'seconds',
        fs,
      }),
    ).rejects.toThrow(MaxValueAssertionError);
  });

  it('throws MaxValueResolverError when a file cannot be read', async () => {
    const fs = new MockFileSystem({});

    await expect(
      assertMaxValue({
        files: ['nonexistent.ts'],
        pattern: /ttl\s*=\s*(\d+)/,
        maxValue: 86400,
        fs,
      }),
    ).rejects.toThrow(MaxValueResolverError);
  });

  it('throws MaxValueResolverError when pattern captures non-numeric values', async () => {
    const fs = new MockFileSystem({
      'src/config.ts': 'export const ttl = infinity;',
    });

    await expect(
      assertMaxValue({
        files: ['src/config.ts'],
        pattern: /ttl\s*=\s*(\w+)/,
        maxValue: 86400,
        fs,
      }),
    ).rejects.toThrow(MaxValueResolverError);
  });

  it('works with glob patterns', async () => {
    const fs = new MockFileSystem({
      'src/a.ts': 'const ttl = 100;',
      'src/b.ts': 'const ttl = 200;',
      'src/c.ts': 'const ttl = 300;',
    });

    await expect(
      assertMaxValue({
        files: ['src/*.ts'],
        pattern: /ttl\s*=\s*(\d+)/,
        maxValue: 500,
        fs,
      }),
    ).resolves.toBeUndefined();
  });

  it('detects violations across multiple files', async () => {
    const fs = new MockFileSystem({
      'src/a.ts': 'const ttl = 100;',
      'src/b.ts': 'const ttl = 99999;',
    });

    try {
      await assertMaxValue({
        files: ['src/a.ts', 'src/b.ts'],
        pattern: /ttl\s*=\s*(\d+)/,
        maxValue: 86400,
        fs,
      });
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(MaxValueAssertionError);
      const error = err as MaxValueAssertionError;
      expect(error.violations).toHaveLength(1);
      expect(error.violations[0].file).toBe('src/b.ts');
      expect(error.violations[0].actualValue).toBe(99999);
    }
  });

  it('passes when no files match (no values to check)', async () => {
    const fs = new MockFileSystem({
      'src/config.ts': 'export const name = "test";',
    });

    await expect(
      assertMaxValue({
        files: ['src/config.ts'],
        pattern: /ttl\s*=\s*(\d+)/,
        maxValue: 86400,
        fs,
      }),
    ).resolves.toBeUndefined();
  });

  it('includes unit in assertion error when provided', async () => {
    const fs = new MockFileSystem({
      'src/config.ts': 'export const ttl = 172800;',
    });

    try {
      await assertMaxValue({
        files: ['src/config.ts'],
        pattern: /ttl\s*=\s*(\d+)/,
        maxValue: 86400,
        unit: 'seconds',
        fs,
      });
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as MaxValueAssertionError;
      expect(error.message).toContain('seconds');
    }
  });

  it('MaxValueResolverError includes structured error details', async () => {
    const fs = new MockFileSystem({});

    try {
      await assertMaxValue({
        files: ['missing.ts'],
        pattern: /ttl\s*=\s*(\d+)/,
        maxValue: 86400,
        fs,
      });
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(MaxValueResolverError);
      const error = err as MaxValueResolverError;
      expect(error.resolverErrors).toHaveLength(1);
      expect(error.resolverErrors[0].file).toBe('missing.ts');
      expect(error.name).toBe('MaxValueResolverError');
    }
  });

  it('supports cwd option for relative path resolution', async () => {
    const fs = new MockFileSystem({
      'project/src/config.ts': 'const ttl = 100;',
    });

    await expect(
      assertMaxValue({
        files: ['src/*.ts'],
        pattern: /ttl\s*=\s*(\d+)/,
        maxValue: 200,
        cwd: 'project',
        fs,
      }),
    ).resolves.toBeUndefined();
  });

  it('throws MaxValueResolverError when files array is empty', async () => {
    const fs = new MockFileSystem({});

    await expect(
      assertMaxValue({
        files: [],
        pattern: /ttl\s*=\s*(\d+)/,
        maxValue: 86400,
        fs,
      }),
    ).rejects.toThrow(MaxValueResolverError);
  });
});
