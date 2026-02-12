import { describe, it, expect } from 'vitest';
import {
  extractFileStems,
  extractByPattern,
  resolveFileStems,
  resolveStringsByPattern,
} from '../src/core/resolvers/string-resolver.js';
import { MockFileSystem } from './test-helpers.js';

describe('extractFileStems (pure)', () => {
  it('extracts file stem from simple filename', () => {
    const result = extractFileStems(['foo.ts']);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe('foo');
    expect(result[0].line).toBe(0);
  });

  it('extracts stem from filename with multiple dots', () => {
    const result = extractFileStems(['foo.test.ts']);
    expect(result[0].value).toBe('foo');
  });

  it('extracts stem from path with directories', () => {
    const result = extractFileStems(['src/core/foo-bar.ts']);
    expect(result[0].value).toBe('foo-bar');
    expect(result[0].file).toBe('src/core/foo-bar.ts');
  });

  it('handles file without extension', () => {
    const result = extractFileStems(['Makefile']);
    expect(result[0].value).toBe('Makefile');
  });

  it('extracts multiple file stems', () => {
    const result = extractFileStems(['a.ts', 'b.ts', 'c.ts']);
    expect(result).toHaveLength(3);
    expect(result.map((r) => r.value)).toEqual(['a', 'b', 'c']);
  });
});

describe('extractByPattern (pure)', () => {
  it('extracts strings matching a pattern', () => {
    const content = `export function myFunc() {}\nexport function anotherFunc() {}`;
    const result = extractByPattern(
      'test.ts',
      content,
      /export function (\w+)/,
    );

    expect(result).toHaveLength(2);
    expect(result[0].value).toBe('myFunc');
    expect(result[0].line).toBe(1);
    expect(result[1].value).toBe('anotherFunc');
    expect(result[1].line).toBe(2);
  });

  it('returns empty array when no matches', () => {
    const content = `const x = 1;`;
    const result = extractByPattern('test.ts', content, /export function (\w+)/);
    expect(result).toHaveLength(0);
  });

  it('preserves file path', () => {
    const content = `export const FOO = 1;`;
    const result = extractByPattern(
      'src/constants.ts',
      content,
      /export const (\w+)/,
    );

    expect(result[0].file).toBe('src/constants.ts');
  });
});

describe('resolveFileStems', () => {
  it('resolves file stems from glob patterns', async () => {
    const fs = new MockFileSystem({
      'src/foo-bar.ts': '',
      'src/baz-qux.ts': '',
    });

    const result = await resolveFileStems({
      files: ['src/*.ts'],
      fs,
    });

    expect(result.strings).toHaveLength(2);
    expect(result.strings.map((s) => s.value).sort()).toEqual(['baz-qux', 'foo-bar']);
  });

  it('resolves file stems from concrete paths', async () => {
    const fs = new MockFileSystem({
      'foo.ts': '',
    });

    const result = await resolveFileStems({
      files: ['foo.ts'],
      fs,
    });

    expect(result.strings).toHaveLength(1);
    expect(result.strings[0].value).toBe('foo');
  });
});

describe('resolveStringsByPattern', () => {
  it('extracts strings from files using a pattern', async () => {
    const fs = new MockFileSystem({
      'src/foo.ts': `export function myFunc() {}`,
    });

    const result = await resolveStringsByPattern({
      files: ['src/*.ts'],
      pattern: /export function (\w+)/,
      fs,
    });

    expect(result.strings).toHaveLength(1);
    expect(result.strings[0].value).toBe('myFunc');
  });

  it('reports errors for unreadable files', async () => {
    const fs = new MockFileSystem({});

    const result = await resolveStringsByPattern({
      files: ['missing.ts'],
      pattern: /(\w+)/,
      fs,
    });

    expect(result.errors).toHaveLength(1);
    expect(result.filesRead).toHaveLength(0);
  });

  it('resolves with cwd', async () => {
    const fs = new MockFileSystem({
      'project/src/foo.ts': `export const MY_CONST = 1;`,
    });

    const result = await resolveStringsByPattern({
      files: ['src/*.ts'],
      pattern: /export const (\w+)/,
      cwd: 'project',
      fs,
    });

    expect(result.strings).toHaveLength(1);
    expect(result.strings[0].value).toBe('MY_CONST');
  });
});
