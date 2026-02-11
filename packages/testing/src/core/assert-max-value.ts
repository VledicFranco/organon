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
 * @throws {MaxValueResolverError} if files can't be read or values can't be extracted
 * @throws {MaxValueAssertionError} if any value exceeds maxValue
 */
export async function assertMaxValue(
  options: MaxValueOptions,
  fs?: FileSystem,
): Promise<void> {
  const { files, pattern, maxValue, unit, cwd, fs: optionsFs } = options;
  const resolvedFs = fs ?? optionsFs ?? createNodeFileSystem();

  // 1. Resolve files and extract values
  const resolved = await resolveValues({ files, pattern, cwd }, resolvedFs);

  // 2. Fail-fast on resolver errors (INV-TEST-2)
  if (resolved.errors.length > 0) {
    throw new MaxValueResolverError(resolved.errors);
  }

  // 3. Validate extracted values against the maximum (pure assertion)
  await validateMaxValue({
    values: resolved.values,
    maxValue,
    unit,
  });
}

// Re-export assertion error for consumers
export { MaxValueAssertionError } from './assertions/max-value.js';
