/**
 * Default Node.js FileSystem implementation.
 *
 * Uses node:fs/promises for file reading and fast-glob for glob expansion.
 * This is the default filesystem used by assertMaxValue when no custom
 * FileSystem is provided.
 */

import { readFile, access } from 'node:fs/promises';
import fg from 'fast-glob';
import type { FileSystem } from './types.js';

/**
 * Create a FileSystem backed by Node.js built-in modules + fast-glob.
 */
export function createNodeFileSystem(): FileSystem {
  return {
    async readFile(path: string): Promise<string> {
      return readFile(path, 'utf-8');
    },

    async glob(pattern: string, options?: { cwd?: string }): Promise<string[]> {
      return fg(pattern, { cwd: options?.cwd });
    },

    async exists(path: string): Promise<boolean> {
      try {
        await access(path);
        return true;
      } catch {
        return false;
      }
    },
  };
}
