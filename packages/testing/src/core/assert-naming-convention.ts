/**
 * assertNamingConvention — High-level assertion that checks naming conventions.
 *
 * Two modes:
 * - 'filenames': checks file stems (filename without extension) against the convention
 * - 'identifiers': extracts identifiers from code via regex and checks them
 *
 * Architecture:
 * - Uses resolvers/string-resolver.ts to extract strings (I/O layer)
 * - Delegates to assertions/naming-convention.ts for pure validation (no I/O)
 *
 * Invariants:
 * - INV-TEST-2 (fail-fast): Throws on violation or resolver errors
 * - INV-TEST-6 (always-async): Returns Promise<void>
 * - INV-TEST-7 (composable): No module-level mutable state
 */

import type { FileSystem } from './resolvers/types.js';
import { createNodeFileSystem } from './resolvers/node-fs.js';
import { resolveFileStems, resolveStringsByPattern } from './resolvers/string-resolver.js';
import {
  validateNamingConvention,
  NamingConventionAssertionError,
  type Convention,
} from './assertions/naming-convention.js';

/**
 * Options for assertNamingConvention.
 */
export interface NamingConventionOptions {
  /** Check mode: 'filenames' checks file stems, 'identifiers' extracts from code */
  mode: 'filenames' | 'identifiers';
  /** File paths or glob patterns */
  files: string[];
  /** The naming convention to enforce */
  convention: Convention;
  /** Regex with capturing group for identifier extraction (required for 'identifiers' mode) */
  pattern?: RegExp;
  /** Names to exclude from validation */
  exceptions?: string[];
  /** Optional working directory */
  cwd?: string;
  /** Optional FileSystem implementation */
  fs?: FileSystem;
}

/**
 * Error thrown when assertNamingConvention encounters resolver-level errors.
 */
export class NamingConventionResolverError extends Error {
  public readonly resolverErrors: Array<{ file: string; message: string }>;

  constructor(errors: Array<{ file: string; message: string }>) {
    const details = errors
      .map((e) => `  ${e.file}: ${e.message}`)
      .join('\n');
    super(`assertNamingConvention resolver errors:\n${details}`);
    this.name = 'NamingConventionResolverError';
    this.resolverErrors = errors;
  }
}

/**
 * Assert that names follow a specified naming convention.
 *
 * @param options - Configuration including mode, files, convention, and optional pattern
 * @throws {NamingConventionResolverError} if files can't be resolved
 * @throws {NamingConventionAssertionError} if any name violates the convention
 */
export async function assertNamingConvention(
  options: NamingConventionOptions,
): Promise<void> {
  const { mode, files, convention, pattern, exceptions, cwd, fs } = options;
  const resolvedFs = fs ?? createNodeFileSystem();

  // Fail-fast on empty files array (INV-TEST-2)
  if (files.length === 0) {
    throw new NamingConventionResolverError([{
      file: '(none)',
      message: 'No file patterns provided. The files array must not be empty.',
    }]);
  }

  // Fail-fast on identifiers mode without pattern
  if (mode === 'identifiers' && !pattern) {
    throw new NamingConventionResolverError([{
      file: '(none)',
      message: 'The pattern option is required for identifiers mode.',
    }]);
  }

  if (mode === 'filenames') {
    const resolved = await resolveFileStems({ files, cwd, fs: resolvedFs });

    if (resolved.errors.length > 0) {
      throw new NamingConventionResolverError(resolved.errors);
    }

    if (resolved.strings.length === 0) {
      throw new NamingConventionResolverError([{
        file: files.join(', '),
        message: 'No files matched the glob pattern(s). Check your file globs.',
      }]);
    }

    validateNamingConvention(resolved.strings, convention, exceptions);
  } else {
    const resolved = await resolveStringsByPattern({
      files,
      pattern: pattern!,
      cwd,
      fs: resolvedFs,
    });

    if (resolved.errors.length > 0) {
      throw new NamingConventionResolverError(resolved.errors);
    }

    if (resolved.filesRead.length === 0) {
      throw new NamingConventionResolverError([{
        file: files.join(', '),
        message: 'No files matched the glob pattern(s). Check your file globs.',
      }]);
    }

    validateNamingConvention(resolved.strings, convention, exceptions);
  }
}

// Re-export for consumers
export { NamingConventionAssertionError } from './assertions/naming-convention.js';
export type { Convention } from './assertions/naming-convention.js';
