import { describe, it, expect } from 'vitest';
import {
  extractImports,
  resolveImports,
} from '../src/core/resolvers/import-resolver.js';
import { MockFileSystem } from './test-helpers.js';

describe('extractImports (pure)', () => {
  it('extracts ES import ... from statements', () => {
    const content = `import { readFile } from 'fs';`;
    const matches = extractImports('test.ts', content);

    expect(matches).toHaveLength(1);
    expect(matches[0].module).toBe('fs');
    expect(matches[0].line).toBe(1);
  });

  it('extracts default imports', () => {
    const content = `import path from 'node:path';`;
    const matches = extractImports('test.ts', content);

    expect(matches).toHaveLength(1);
    expect(matches[0].module).toBe('node:path');
  });

  it('extracts side-effect imports', () => {
    const content = `import 'reflect-metadata';`;
    const matches = extractImports('test.ts', content);

    expect(matches).toHaveLength(1);
    expect(matches[0].module).toBe('reflect-metadata');
  });

  it('extracts require() calls', () => {
    const content = `const fs = require('fs');`;
    const matches = extractImports('test.ts', content);

    expect(matches).toHaveLength(1);
    expect(matches[0].module).toBe('fs');
  });

  it('extracts dynamic import() calls', () => {
    const content = `const mod = await import('fs');`;
    const matches = extractImports('test.ts', content);

    expect(matches).toHaveLength(1);
    expect(matches[0].module).toBe('fs');
  });

  it('extracts multiple imports from a file', () => {
    const content = [
      `import { readFile } from 'node:fs/promises';`,
      `import path from 'node:path';`,
      `import { describe } from 'vitest';`,
    ].join('\n');

    const matches = extractImports('test.ts', content);

    expect(matches).toHaveLength(3);
    expect(matches[0].module).toBe('node:fs/promises');
    expect(matches[1].module).toBe('node:path');
    expect(matches[2].module).toBe('vitest');
  });

  it('returns empty array for files without imports', () => {
    const content = `export const foo = 1;`;
    const matches = extractImports('test.ts', content);

    expect(matches).toHaveLength(0);
  });

  it('preserves file name and line text', () => {
    const content = `import http from 'http';`;
    const matches = extractImports('src/server.ts', content);

    expect(matches[0].file).toBe('src/server.ts');
    expect(matches[0].lineText).toBe(`import http from 'http';`);
  });

  it('handles double-quoted imports', () => {
    const content = `import fs from "fs";`;
    const matches = extractImports('test.ts', content);

    expect(matches).toHaveLength(1);
    expect(matches[0].module).toBe('fs');
  });
});

describe('resolveImports', () => {
  it('resolves imports from concrete file paths', async () => {
    const fs = new MockFileSystem({
      'src/pure.ts': `import { join } from 'node:path';`,
    });

    const result = await resolveImports({
      files: ['src/pure.ts'],
      fs,
    });

    expect(result.imports).toHaveLength(1);
    expect(result.imports[0].module).toBe('node:path');
    expect(result.filesRead).toEqual(['src/pure.ts']);
    expect(result.errors).toHaveLength(0);
  });

  it('resolves imports from glob patterns', async () => {
    const fs = new MockFileSystem({
      'src/a.ts': `import fs from 'fs';`,
      'src/b.ts': `import http from 'http';`,
    });

    const result = await resolveImports({
      files: ['src/*.ts'],
      fs,
    });

    expect(result.imports).toHaveLength(2);
    expect(result.filesRead).toHaveLength(2);
  });

  it('reports errors for unreadable files', async () => {
    const fs = new MockFileSystem({});

    const result = await resolveImports({
      files: ['missing.ts'],
      fs,
    });

    expect(result.imports).toHaveLength(0);
    expect(result.filesRead).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].file).toBe('missing.ts');
  });

  it('resolves with cwd', async () => {
    const fs = new MockFileSystem({
      'project/src/foo.ts': `import fs from 'fs';`,
    });

    const result = await resolveImports({
      files: ['src/*.ts'],
      cwd: 'project',
      fs,
    });

    expect(result.imports).toHaveLength(1);
    expect(result.imports[0].module).toBe('fs');
  });
});
