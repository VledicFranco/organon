import { describe, it, expect } from 'vitest';
import { resolveValues, expandGlobs } from '../src/core/resolvers/file-resolver.js';
import { MockFileSystem } from './test-helpers.js';

describe('expandGlobs', () => {
  it('returns literal paths as-is', async () => {
    const fs = new MockFileSystem({
      'src/config.ts': 'content',
    });

    const result = await expandGlobs(['src/config.ts'], fs);
    expect(result.paths).toEqual(['src/config.ts']);
    expect(result.errors).toEqual([]);
  });

  it('expands glob patterns', async () => {
    const fs = new MockFileSystem({
      'src/a.ts': 'content a',
      'src/b.ts': 'content b',
      'src/c.js': 'content c',
    });

    const result = await expandGlobs(['src/*.ts'], fs);
    expect(result.paths).toEqual(['src/a.ts', 'src/b.ts']);
    expect(result.errors).toEqual([]);
  });

  it('supports cwd option', async () => {
    const fs = new MockFileSystem({
      'project/src/a.ts': 'content a',
      'project/src/b.ts': 'content b',
    });

    const result = await expandGlobs(['src/*.ts'], fs, 'project');
    expect(result.paths).toEqual(['src/a.ts', 'src/b.ts']);
  });

  it('reports errors for failed glob expansion', async () => {
    const fs: MockFileSystem = new MockFileSystem();
    // Override glob to throw
    fs.glob = async () => {
      throw new Error('glob failed');
    };

    const result = await expandGlobs(['**/*.ts'], fs);
    expect(result.paths).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].file).toBe('**/*.ts');
    expect(result.errors[0].message).toContain('glob failed');
  });

  it('reports non-Error thrown values in glob expansion', async () => {
    const fs: MockFileSystem = new MockFileSystem();
    // Override glob to throw a non-Error value
    fs.glob = async () => {
      throw 'string error';
    };

    const result = await expandGlobs(['**/*.ts'], fs);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('string error');
  });
});

describe('resolveValues', () => {
  it('extracts numeric values from files using a pattern', async () => {
    const fs = new MockFileSystem({
      'src/config.ts': 'export const ttl = 3600;\nexport const retries = 3;\n',
    });

    const result = await resolveValues(
      {
        files: ['src/config.ts'],
        pattern: /ttl\s*=\s*(\d+)/,
      },
      fs,
    );

    expect(result.values).toHaveLength(1);
    expect(result.values[0].file).toBe('src/config.ts');
    expect(result.values[0].line).toBe(1);
    expect(result.values[0].value).toBe(3600);
    expect(result.values[0].rawValue).toBe('3600');
    expect(result.errors).toEqual([]);
    expect(result.filesRead).toEqual(['src/config.ts']);
  });

  it('extracts values from multiple files', async () => {
    const fs = new MockFileSystem({
      'src/a.ts': 'const ttl = 100;',
      'src/b.ts': 'const ttl = 200;',
    });

    const result = await resolveValues(
      {
        files: ['src/a.ts', 'src/b.ts'],
        pattern: /ttl\s*=\s*(\d+)/,
      },
      fs,
    );

    expect(result.values).toHaveLength(2);
    expect(result.values[0].value).toBe(100);
    expect(result.values[1].value).toBe(200);
    expect(result.filesRead).toEqual(['src/a.ts', 'src/b.ts']);
  });

  it('reports error for files that cannot be read', async () => {
    const fs = new MockFileSystem({});

    const result = await resolveValues(
      {
        files: ['nonexistent.ts'],
        pattern: /ttl\s*=\s*(\d+)/,
      },
      fs,
    );

    expect(result.values).toEqual([]);
    expect(result.filesRead).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].file).toBe('nonexistent.ts');
    expect(result.errors[0].message).toContain('Failed to read file');
  });

  it('reports non-Error thrown values during file read', async () => {
    const fs = new MockFileSystem({});
    // Override readFile to throw a non-Error value
    fs.readFile = async () => {
      throw 'raw string error';
    };

    const result = await resolveValues(
      {
        files: ['some-file.ts'],
        pattern: /ttl\s*=\s*(\d+)/,
      },
      fs,
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('raw string error');
  });

  it('reports error for non-numeric captures', async () => {
    const fs = new MockFileSystem({
      'src/config.ts': 'const ttl = abc;',
    });

    const result = await resolveValues(
      {
        files: ['src/config.ts'],
        pattern: /ttl\s*=\s*(\w+)/,
      },
      fs,
    );

    expect(result.values).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('not a valid number');
    expect(result.errors[0].message).toContain('abc');
  });

  it('handles files with no matches', async () => {
    const fs = new MockFileSystem({
      'src/config.ts': 'export const name = "test";',
    });

    const result = await resolveValues(
      {
        files: ['src/config.ts'],
        pattern: /ttl\s*=\s*(\d+)/,
      },
      fs,
    );

    expect(result.values).toEqual([]);
    expect(result.filesRead).toEqual(['src/config.ts']);
    expect(result.errors).toEqual([]);
  });

  it('handles glob patterns in file list', async () => {
    const fs = new MockFileSystem({
      'src/a.ts': 'const ttl = 100;',
      'src/b.ts': 'const ttl = 200;',
    });

    const result = await resolveValues(
      {
        files: ['src/*.ts'],
        pattern: /ttl\s*=\s*(\d+)/,
      },
      fs,
    );

    expect(result.values).toHaveLength(2);
  });

  it('handles multiple matches on different lines in same file', async () => {
    const fs = new MockFileSystem({
      'src/config.ts': 'const ttl1 = 100;\nconst ttl2 = 200;\nconst ttl3 = 300;',
    });

    const result = await resolveValues(
      {
        files: ['src/config.ts'],
        pattern: /ttl\d\s*=\s*(\d+)/,
      },
      fs,
    );

    expect(result.values).toHaveLength(3);
    expect(result.values[0].line).toBe(1);
    expect(result.values[0].value).toBe(100);
    expect(result.values[1].line).toBe(2);
    expect(result.values[1].value).toBe(200);
    expect(result.values[2].line).toBe(3);
    expect(result.values[2].value).toBe(300);
  });

  it('preserves lineText for error reporting', async () => {
    const fs = new MockFileSystem({
      'src/config.ts': '  const ttl = 86400; // 24 hours',
    });

    const result = await resolveValues(
      {
        files: ['src/config.ts'],
        pattern: /ttl\s*=\s*(\d+)/,
      },
      fs,
    );

    expect(result.values[0].lineText).toBe('  const ttl = 86400; // 24 hours');
  });

  it('supports cwd option for glob resolution', async () => {
    const fs = new MockFileSystem({
      'project/src/a.ts': 'const ttl = 100;',
    });

    const result = await resolveValues(
      {
        files: ['src/*.ts'],
        pattern: /ttl\s*=\s*(\d+)/,
        cwd: 'project',
      },
      fs,
    );

    expect(result.values).toHaveLength(1);
    expect(result.values[0].value).toBe(100);
  });

  it('handles regex with global flag safely', async () => {
    const fs = new MockFileSystem({
      'src/config.ts': 'const ttl = 100;\nconst other = 200;',
    });

    // Global regex patterns can have lastIndex issues
    const result = await resolveValues(
      {
        files: ['src/config.ts'],
        pattern: /=\s*(\d+)/g,
      },
      fs,
    );

    expect(result.values).toHaveLength(2);
    expect(result.values[0].value).toBe(100);
    expect(result.values[1].value).toBe(200);
  });
});
