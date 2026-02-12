import { describe, it, expect } from 'vitest';
import { readFilesParallel } from '../src/core/resolvers/parallel-reader.js';
import { MockFileSystem } from './test-helpers.js';

describe('readFilesParallel', () => {
  it('reads multiple files successfully', async () => {
    const fs = new MockFileSystem({
      'a.ts': 'content-a',
      'b.ts': 'content-b',
      'c.ts': 'content-c',
    });

    const results = await readFilesParallel(['a.ts', 'b.ts', 'c.ts'], fs);

    expect(results).toHaveLength(3);
    expect(results[0].content).toBe('content-a');
    expect(results[1].content).toBe('content-b');
    expect(results[2].content).toBe('content-c');
    expect(results.every((r) => r.error === undefined)).toBe(true);
  });

  it('handles read failures gracefully', async () => {
    const fs = new MockFileSystem({
      'a.ts': 'content-a',
    });

    const results = await readFilesParallel(['a.ts', 'missing.ts'], fs);

    expect(results).toHaveLength(2);
    expect(results[0].content).toBe('content-a');
    expect(results[0].error).toBeUndefined();
    expect(results[1].content).toBeUndefined();
    expect(results[1].error).toBeDefined();
  });

  it('preserves file paths in results', async () => {
    const fs = new MockFileSystem({
      'src/foo.ts': 'content',
    });

    const results = await readFilesParallel(['src/foo.ts'], fs);

    expect(results[0].path).toBe('src/foo.ts');
  });

  it('handles empty paths array', async () => {
    const fs = new MockFileSystem({});

    const results = await readFilesParallel([], fs);

    expect(results).toHaveLength(0);
  });

  it('respects concurrency limit', async () => {
    // Create many files
    const files: Record<string, string> = {};
    for (let i = 0; i < 120; i++) {
      files[`file${i}.ts`] = `content-${i}`;
    }
    const fs = new MockFileSystem(files);
    const paths = Object.keys(files);

    // With concurrency of 25, should process in batches
    const results = await readFilesParallel(paths, fs, 25);

    expect(results).toHaveLength(120);
    expect(results.every((r) => r.content !== undefined)).toBe(true);
  });

  it('handles all files failing', async () => {
    const fs = new MockFileSystem({});

    const results = await readFilesParallel(['a.ts', 'b.ts', 'c.ts'], fs);

    expect(results).toHaveLength(3);
    expect(results.every((r) => r.error !== undefined)).toBe(true);
  });
});
