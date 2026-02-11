/**
 * assertMaxValue — High-level assertion that combines file resolution with pure validation.
 *
 * This is the public API function users call in their tests:
 * ```typescript
 * await assertMaxValue({
 *   files: ['src/config/*.ts'],
 *   pattern: /ttl:\s*(\d+)/,
 *   maxValue: 86400,
 *   unit: 'seconds',
 * });
 * ```
 *
 * Architecture:
 * - Uses resolvers/file-resolver.ts to read files and extract values (I/O layer)
 * - Delegates to assertions/max-value.ts for pure validation (no I/O)
 * - This module is the composition layer that wires I/O to pure logic
 *
 * Invariants:
 * - INV-TEST-2 (fail-fast): Throws on violation or resolver errors
 * - INV-TEST-6 (always-async): Returns Promise<void>
 * - INV-TEST-7 (composable): No module-level mutable state
 */

import type { FileSystem } from './resolvers/types.js';
import { resolveValues } from './resolvers/file-resolver.js';
import { validateMaxValue, MaxValueAssertionError } from './assertions/max-value.js';
import { createNodeFileSystem } from './resolvers/node-fs.js';

/**
 * Options for assertMaxValue.
 *
 * Uses the options-object pattern (RFC 001 Design Decision 4: Clarity > Conciseness).
 */
export interface MaxValueOptions {
  /** File paths or glob patterns to scan */
  files: string[];
  /** Regex with a capturing group for the numeric value */
  pattern: RegExp;
  /** Upper bound (inclusive) that values must not exceed */
  maxValue: number;
  /** Optional unit for error messages (e.g., "seconds", "bytes") */
  unit?: string;
  /** Optional working directory for glob resolution */
  cwd?: string;
  /** Optional FileSystem implementation (defaults to Node.js fs + fast-glob) */
  fs?: FileSystem;
  /**
   * Require at least one value to be extracted (default: true).
   * When true, throws if no files match the glob or no lines match the pattern.
   * This prevents silent passes from typos in file globs or regex patterns.
   * Set to false when the absence of matches is a valid (expected) outcome.
   */
  requireMatches?: boolean;
}

/**
 * Error thrown when assertMaxValue encounters resolver-level errors
 * (e.g., files not found, globs failing, non-numeric captures).
 */
export class MaxValueResolverError extends Error {
  public readonly resolverErrors: Array<{ file: string; message: string }>;

  constructor(errors: Array<{ file: string; message: string }>) {
    const details = errors
      .map((e) => `  ${e.file}: ${e.message}`)
      .join('\n');
    super(`assertMaxValue resolver errors:\n${details}`);
    this.name = 'MaxValueResolverError';
    this.resolverErrors = errors;
  }
}

/**
 * Assert that numeric values extracted from files do not exceed a maximum.
 *
 * Workflow:
 * 1. Expand glob patterns and read files (resolver layer)
 * 2. Extract numeric values matching the pattern
 * 3. Validate all values against maxValue (pure assertion)
 *
 * @param options - Configuration including files, pattern, maxValue, and optional fs/cwd/unit
 * @throws {MaxValueResolverError} if files can't be read or values can't be extracted
 * @throws {MaxValueAssertionError} if any value exceeds maxValue
 */
export async function assertMaxValue(
  options: MaxValueOptions,
): Promise<void> {
  const { files, pattern, maxValue, unit, cwd, fs, requireMatches = true } = options;
  const resolvedFs = fs ?? createNodeFileSystem();

  // 0. Fail-fast on empty files array (INV-TEST-2)
  if (files.length === 0) {
    throw new MaxValueResolverError([{
      file: '(none)',
      message: 'No file patterns provided. The files array must not be empty.',
    }]);
  }

  // 1. Resolve files and extract values
  const resolved = await resolveValues({ files, pattern, cwd }, resolvedFs);

  // 2. Fail-fast on resolver errors (INV-TEST-2)
  if (resolved.errors.length > 0) {
    throw new MaxValueResolverError(resolved.errors);
  }

  // 3. Fail-fast when no values found and requireMatches is true (INV-TEST-2)
  //    Prevents silent passes from typos in file globs or regex patterns.
  if (requireMatches && resolved.values.length === 0) {
    const filesDetail = resolved.filesRead.length === 0
      ? 'No files matched the glob pattern(s).'
      : `Searched ${resolved.filesRead.length} file(s) but pattern matched no lines.`;
    throw new MaxValueResolverError([{
      file: files.join(', '),
      message: `No values extracted. ${filesDetail} Check your file globs and regex pattern.`,
    }]);
  }

  // 4. Validate extracted values against the maximum (pure assertion, sync)
  validateMaxValue({
    values: resolved.values,
    maxValue,
    unit,
  });
}

// Re-export assertion error for consumers
export { MaxValueAssertionError } from './assertions/max-value.js';
