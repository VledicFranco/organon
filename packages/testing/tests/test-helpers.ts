/**
 * Test helpers for @organon/testing's own tests.
 *
 * Provides a mock FileSystem implementation for testing resolvers
 * and high-level assertions without real I/O.
 */

import type { FileSystem } from '../src/core/resolvers/types.js';

/**
 * In-memory FileSystem for testing.
 */
export class MockFileSystem implements FileSystem {
  private files: Map<string, string>;

  constructor(files?: Record<string, string>) {
    this.files = new Map();
    if (files) {
      for (const [path, content] of Object.entries(files)) {
        this.files.set(normalize(path), content);
      }
    }
  }

  async readFile(path: string): Promise<string> {
    const content = this.files.get(normalize(path));
    if (content === undefined) {
      throw new Error(`ENOENT: no such file or directory: ${path}`);
    }
    return content;
  }

  async exists(path: string): Promise<boolean> {
    return this.files.has(normalize(path));
  }

  async glob(pattern: string, options?: { cwd?: string }): Promise<string[]> {
    const cwd = options?.cwd ? normalize(options.cwd) : '';
    const results: string[] = [];

    for (const key of this.files.keys()) {
      const relative = cwd
        ? key.startsWith(cwd + '/') ? key.slice(cwd.length + 1) : null
        : key;
      if (relative === null) continue;

      if (matchGlob(relative, pattern)) {
        results.push(relative);
      }
    }

    return results.sort();
  }
}

function normalize(p: string): string {
  return p.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/\/$/, '');
}

/**
 * Simple glob matcher supporting * and ** patterns.
 */
function matchGlob(path: string, pattern: string): boolean {
  let regexStr = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*\//g, '\u00A7\u00A7/')
    .replace(/\*\*/g, '\u00A7\u00A7')
    .replace(/\*/g, '[^/]*')
    .replace(/\u00A7\u00A7\//g, '(.*/)?')
    .replace(/\u00A7\u00A7/g, '.*');
  return new RegExp(`^${regexStr}$`).test(path);
}
