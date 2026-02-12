/**
 * validateFileExists — Pure assertion that validates file existence results.
 *
 * Invariants enforced:
 * - INV-TEST-1 (assertion-logic-pure): No I/O imports. Operates on pre-resolved data.
 * - INV-TEST-2 (fail-fast): Throws on violation (collects all before throwing for better diagnostics).
 * - INV-TEST-6 (always-async): Public API is async; pure validators are sync.
 * - INV-TEST-7 (composable): No module-level mutable state.
 *
 * This module must NEVER import fs, http, process, or any I/O module.
 * File existence checking is handled by the resolver layer (core/resolvers/).
 */

/**
 * A single file existence check result fed by the resolver layer.
 */
export interface FileExistsEntry {
  /** Path of the file that was checked */
  file: string;
  /** Whether the file exists */
  exists: boolean;
}

/**
 * A violation: a file that was expected to exist but doesn't.
 */
export interface FileExistsViolation {
  /** Path of the missing file */
  file: string;
}

/**
 * Error thrown when a file-exists assertion fails.
 * Contains structured violation data for programmatic access.
 */
export class FileExistsAssertionError extends Error {
  public readonly violations: FileExistsViolation[];

  constructor(violations: FileExistsViolation[]) {
    const details = violations
      .map((v) => `  ${v.file}`)
      .join('\n');

    super(
      `File exists assertion failed: ${violations.length} missing file(s)\n${details}`,
    );

    this.name = 'FileExistsAssertionError';
    this.violations = violations;
  }
}

/**
 * Validate that all checked files exist.
 *
 * This is a pure, synchronous function: no I/O, no side effects, deterministic.
 *
 * @throws {FileExistsAssertionError} if any file does not exist (INV-TEST-2: fail-fast)
 */
export function validateFileExists(entries: FileExistsEntry[]): void {
  const violations: FileExistsViolation[] = [];

  for (const entry of entries) {
    if (!entry.exists) {
      violations.push({ file: entry.file });
    }
  }

  if (violations.length > 0) {
    throw new FileExistsAssertionError(violations);
  }
}
