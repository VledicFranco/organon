/**
 * NodeFileSystem — concrete FileSystem implementation using Node.js APIs.
 *
 * Used by CLI and MCP server for real I/O. Core functions receive the
 * FileSystem interface, not this class directly.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { glob as globFn } from 'glob';
import type { FileSystem, FileStat } from './types.js';

export class NodeFileSystem implements FileSystem {
  async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf-8');
  }

  async readDir(dirPath: string): Promise<string[]> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.map((e) => e.name);
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async glob(
    pattern: string,
    options?: { cwd: string; ignore?: string[] },
  ): Promise<string[]> {
    const results = await globFn(pattern, {
      cwd: options?.cwd,
      ignore: options?.ignore,
      nodir: true,
      posix: true,
    });
    return results;
  }

  async stat(filePath: string): Promise<FileStat> {
    const s = await fs.stat(filePath);
    return { mtime: s.mtime, size: s.size };
  }
}

/**
 * Resolve a potentially relative path against a base directory.
 */
export function resolvePath(base: string, relative: string): string {
  return path.resolve(base, relative);
}
