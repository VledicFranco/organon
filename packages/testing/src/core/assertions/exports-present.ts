/**
 * validateExportsPresent — Pure assertion that checks expected exports exist.
 *
 * Invariants enforced:
 * - INV-TEST-1 (assertion-logic-pure): No I/O imports. Operates on pre-resolved data.
 * - INV-TEST-2 (fail-fast): Throws on violation (collects all before throwing).
 * - INV-TEST-7 (composable): No module-level mutable state.
 *
 * This module must NEVER import fs, http, process, or any I/O module.
 */

/**
 * A missing export violation.
 */
export interface ExportsPresentViolation {
  /** The expected export name that was not found */
  name: string;
  /** The file that was scanned */
  file: string;
}

/**
 * Error thrown when an exports-present assertion fails.
 */
export class ExportsPresentAssertionError extends Error {
  public readonly violations: ExportsPresentViolation[];

  constructor(violations: ExportsPresentViolation[]) {
    const details = violations
      .map((v) => `  ${v.file} — missing export "${v.name}"`)
      .join('\n');

    super(
      `Exports present assertion failed: ${violations.length} missing export(s)\n${details}`,
    );

    this.name = 'ExportsPresentAssertionError';
    this.violations = violations;
  }
}

/**
 * Validate that all expected export names are present in the found exports list.
 *
 * This is a pure, synchronous function: no I/O, no side effects, deterministic.
 *
 * @param file - The file being checked (for error messages)
 * @param expectedExports - Names that must be exported
 * @param foundExports - Names that were actually found as exports
 * @throws {ExportsPresentAssertionError} if any expected export is missing
 */
export function validateExportsPresent(
  file: string,
  expectedExports: string[],
  foundExports: string[],
): void {
  const foundSet = new Set(foundExports);
  const violations: ExportsPresentViolation[] = [];

  for (const name of expectedExports) {
    if (!foundSet.has(name)) {
      violations.push({ name, file });
    }
  }

  if (violations.length > 0) {
    throw new ExportsPresentAssertionError(violations);
  }
}
