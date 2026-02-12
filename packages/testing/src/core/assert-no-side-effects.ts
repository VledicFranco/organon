/**
 * assertNoSideEffects — High-level assertion that checks for forbidden imports.
 *
 * Architecture:
 * - Uses resolvers/import-resolver.ts to scan files for imports (I/O layer)
 * - Delegates to assertions/no-side-effects.ts for pure validation (no I/O)
 * - This module is the composition layer that wires I/O to pure logic
 *
 * Invariants:
 * - INV-TEST-2 (fail-fast): Throws on violation or resolver errors
 * - INV-TEST-6 (always-async): Returns Promise<void>
 * - INV-TEST-7 (composable): No module-level mutable state
 */

import type { FileSystem } from './resolvers/types.js';
import { createNodeFileSystem } from './resolvers/node-fs.js';
import { resolveImports } from './resolvers/import-resolver.js';
import {
  validateNoSideEffects,
  NoSideEffectsAssertionError,
} from './assertions/no-side-effects.js';

/**
 * Options for assertNoSideEffects.
 */
export interface NoSideEffectsOptions {
  /** File paths or glob patterns to scan */
  files: string[];
  /** Module names to forbid (e.g., ['fs', 'http', 'vitest']) */
  forbiddenModules: string[];
  /** Optional working directory for glob resolution */
  cwd?: string;
  /** Optional FileSystem implementation */
  fs?: FileSystem;
  /**
   * Require at least one file to be scanned (default: true).
   * When true, throws if no files match the glob patterns.
   */
  requireMatches?: boolean;
}

/**
 * Error thrown when assertNoSideEffects encounters resolver-level errors.
 */
export class NoSideEffectsResolverError extends Error {
  public readonly resolverErrors: Array<{ file: string; message: string }>;

  constructor(errors: Array<{ file: string; message: string }>) {
    const details = errors
      .map((e) => `  ${e.file}: ${e.message}`)
      .join('\n');
    super(`assertNoSideEffects resolver errors:\n${details}`);
    this.name = 'NoSideEffectsResolverError';
    this.resolverErrors = errors;
  }
}

/**
 * Assert that files do not import any forbidden modules.
 *
 * @param options - Configuration including files, forbiddenModules, and optional fs/cwd
 * @throws {NoSideEffectsResolverError} if files can't be read or globs fail
 * @throws {NoSideEffectsAssertionError} if any forbidden import is found
 */
export async function assertNoSideEffects(
  options: NoSideEffectsOptions,
): Promise<void> {
  const { files, forbiddenModules, cwd, fs, requireMatches = true } = options;
  const resolvedFs = fs ?? createNodeFileSystem();

  // Fail-fast on empty inputs (INV-TEST-2)
  if (files.length === 0) {
    throw new NoSideEffectsResolverError([{
      file: '(none)',
      message: 'No file patterns provided. The files array must not be empty.',
    }]);
  }

  if (forbiddenModules.length === 0) {
    throw new NoSideEffectsResolverError([{
      file: '(none)',
      message: 'No forbidden modules provided. The forbiddenModules array must not be empty.',
    }]);
  }

  // Resolve imports from files
  const resolved = await resolveImports({ files, cwd, fs: resolvedFs });

  // Fail-fast on resolver errors (INV-TEST-2)
  if (resolved.errors.length > 0) {
    throw new NoSideEffectsResolverError(resolved.errors);
  }

  // Fail-fast when no files found and requireMatches is true
  if (requireMatches && resolved.filesRead.length === 0) {
    throw new NoSideEffectsResolverError([{
      file: files.join(', '),
      message: 'No files matched the glob pattern(s). Check your file globs.',
    }]);
  }

  // Delegate to pure validator
  validateNoSideEffects(resolved.imports, forbiddenModules);
}

// Re-export assertion error for consumers
export { NoSideEffectsAssertionError } from './assertions/no-side-effects.js';
