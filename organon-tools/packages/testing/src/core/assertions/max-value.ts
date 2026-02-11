/**
 * assertMaxValue — Pure assertion that validates numeric values against a maximum.
 *
 * Invariants enforced:
 * - INV-TEST-1 (assertion-logic-pure): No I/O imports. Operates on pre-resolved data.
 * - INV-TEST-2 (fail-fast): Throws on first violation.
 * - INV-TEST-6 (always-async): Returns Promise<void>.
 * - INV-TEST-7 (composable): No module-level mutable state.
 *
 * This module must NEVER import fs, http, process, or any I/O module.
 * File reading is handled by the resolver layer (core/resolvers/).
 */

/**
 * A single extracted value to validate against the maximum.
 * This is the pre-resolved data structure fed by the resolver layer.
 */
export interface MaxValueEntry {
  /** Path of the file where the value was found */
  file: string;
  /** The line number (1-based) where the value was found */
  line: number;
  /** The full line of text containing the value */
  lineText: string;
  /** The extracted numeric value */
  value: number;
  /** The raw string that was parsed as a number */
  rawValue: string;
}

/**
 * Options for the pure max-value assertion.
 * Operates on pre-resolved values (no file paths or patterns).
 */
export interface ValidateMaxValueOptions {
  /** Pre-resolved numeric values to check */
  values: MaxValueEntry[];
  /** Upper bound (inclusive) */
  maxValue: number;
  /** Optional unit for error messages (e.g., "seconds", "bytes") */
  unit?: string;
}

/**
 * A violation found by the max-value assertion.
 */
export interface MaxValueViolation {
  /** File where the violation occurred */
  file: string;
  /** Line number (1-based) */
  line: number;
  /** The line text */
  lineText: string;
  /** The actual value that exceeded the max */
  actualValue: number;
  /** The maximum allowed value */
  maxValue: number;
  /** Optional unit */
  unit?: string;
}

/**
 * Error thrown when a max-value assertion fails.
 * Contains structured violation data for programmatic access
 * plus a human-readable message.
 */
export class MaxValueAssertionError extends Error {
  public readonly violations: MaxValueViolation[];

  constructor(violations: MaxValueViolation[]) {
    const details = violations
      .map((v) => {
        const unitSuffix = v.unit ? ` ${v.unit}` : '';
        return `  ${v.file}:${v.line} — found ${v.actualValue}${unitSuffix}, max allowed is ${v.maxValue}${unitSuffix}\n    > ${v.lineText.trim()}`;
      })
      .join('\n');

    super(
      `Max value assertion failed: ${violations.length} violation(s) found\n${details}`,
    );

    this.name = 'MaxValueAssertionError';
    this.violations = violations;
  }
}

/**
 * Validate that all pre-resolved values do not exceed a maximum.
 *
 * This is a pure function: no I/O, no side effects, deterministic.
 * The resolver layer feeds pre-extracted values; this function only validates.
 *
 * @throws {MaxValueAssertionError} if any value exceeds maxValue (INV-TEST-2: fail-fast)
 */
export async function validateMaxValue(
  options: ValidateMaxValueOptions,
): Promise<void> {
  const { values, maxValue, unit } = options;

  const violations: MaxValueViolation[] = [];

  for (const entry of values) {
    if (entry.value > maxValue) {
      violations.push({
        file: entry.file,
        line: entry.line,
        lineText: entry.lineText,
        actualValue: entry.value,
        maxValue,
        unit,
      });
    }
  }

  if (violations.length > 0) {
    throw new MaxValueAssertionError(violations);
  }
}
