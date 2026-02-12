/**
 * assertFileExists — High-level assertion that checks file existence.
 *
 * Architecture:
 * - Uses FileSystem.exists() to check each file (I/O layer)
 * - Delegates to assertions/file-exists.ts for pure validation (no I/O)
 * - This module is the composition layer that wires I/O to pure logic
 *
 * Invariants:
 * - INV-TEST-2 (fail-fast): Throws on violation or empty files array
 * - INV-TEST-6 (always-async): Returns Promise<void>
 * - INV-TEST-7 (composable): No module-level mutable state
 */

import { join } from 'node:path';
import type { FileSystem } from './resolvers/types.js';
import { createNodeFileSystem } from './resolvers/node-fs.js';
import {
  validateFileExists,
  FileExistsAssertionError,
  type FileExistsEntry,
} from './assertions/file-exists.js';

/**
 * Options for assertFileExists.
 */
export interface FileExistsOptions {
  /** File paths to check (not globs — existence check only) */
  files: string[];
  /** Optional working directory to resolve relative paths */
  cwd?: string;
  /** Optional FileSystem implementation (defaults to Node.js fs) */
  fs?: FileSystem;
}

/**
 * Error thrown when assertFileExists receives invalid input.
 */
export class FileExistsResolverError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileExistsResolverError';
  }
}

/**
 * Assert that all specified files exist on the filesystem.
 *
 * @param options - Configuration including file paths and optional cwd/fs
 * @throws {FileExistsResolverError} if files array is empty
 * @throws {FileExistsAssertionError} if any file does not exist
 */
export async function assertFileExists(
  options: FileExistsOptions,
): Promise<void> {
  const { files, cwd, fs } = options;
  const resolvedFs = fs ?? createNodeFileSystem();

  // Fail-fast on empty files array (INV-TEST-2)
  if (files.length === 0) {
    throw new FileExistsResolverError(
      'No file paths provided. The files array must not be empty.',
    );
  }

  // Resolve existence for each file
  const entries: FileExistsEntry[] = [];
  for (const file of files) {
    const fullPath = cwd ? join(cwd, file) : file;
    const exists = await resolvedFs.exists(fullPath);
    entries.push({ file, exists });
  }

  // Delegate to pure validator
  validateFileExists(entries);
}

// Re-export assertion error for consumers
export { FileExistsAssertionError } from './assertions/file-exists.js';
