/**
 * validateNamingConvention — Pure assertion that checks strings against naming conventions.
 *
 * Invariants enforced:
 * - INV-TEST-1 (assertion-logic-pure): No I/O imports. Operates on pre-resolved data.
 * - INV-TEST-2 (fail-fast): Throws on violation (collects all before throwing).
 * - INV-TEST-7 (composable): No module-level mutable state.
 *
 * This module must NEVER import fs, http, process, or any I/O module.
 */

import type { ExtractedString } from '../resolvers/string-resolver.js';

/**
 * Supported naming conventions.
 */
export type Convention =
  | 'kebab-case'
  | 'camelCase'
  | 'PascalCase'
  | 'SCREAMING_SNAKE_CASE'
  | 'snake_case';

/**
 * Regex patterns for each convention.
 */
const CONVENTION_PATTERNS: Record<Convention, RegExp> = {
  'kebab-case': /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/,
  'camelCase': /^[a-z][a-zA-Z0-9]*$/,
  'PascalCase': /^[A-Z][a-zA-Z0-9]*$/,
  'SCREAMING_SNAKE_CASE': /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/,
  'snake_case': /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/,
};

/**
 * Check if a string matches a naming convention.
 */
export function matchesConvention(
  value: string,
  convention: Convention,
): boolean {
  return CONVENTION_PATTERNS[convention].test(value);
}

/**
 * A naming convention violation.
 */
export interface NamingConventionViolation {
  /** Path of the file */
  file: string;
  /** The line number (1-based), or 0 for file-level checks */
  line: number;
  /** The name that violates the convention */
  value: string;
  /** The expected convention */
  convention: Convention;
}

/**
 * Error thrown when a naming convention assertion fails.
 */
export class NamingConventionAssertionError extends Error {
  public readonly violations: NamingConventionViolation[];

  constructor(violations: NamingConventionViolation[]) {
    const details = violations
      .map((v) => {
        const location = v.line > 0 ? `${v.file}:${v.line}` : v.file;
        return `  ${location} — "${v.value}" does not match ${v.convention}`;
      })
      .join('\n');

    super(
      `Naming convention assertion failed: ${violations.length} violation(s) found\n${details}`,
    );

    this.name = 'NamingConventionAssertionError';
    this.violations = violations;
  }
}

/**
 * Validate that all extracted strings match a naming convention.
 *
 * This is a pure, synchronous function: no I/O, no side effects, deterministic.
 *
 * @param strings - Pre-resolved strings to validate
 * @param convention - The naming convention to enforce
 * @param exceptions - Names to exclude from validation
 * @throws {NamingConventionAssertionError} if any string violates the convention
 */
export function validateNamingConvention(
  strings: ExtractedString[],
  convention: Convention,
  exceptions: string[] = [],
): void {
  const exceptionSet = new Set(exceptions);
  const violations: NamingConventionViolation[] = [];

  for (const entry of strings) {
    if (exceptionSet.has(entry.value)) continue;

    if (!matchesConvention(entry.value, convention)) {
      violations.push({
        file: entry.file,
        line: entry.line,
        value: entry.value,
        convention,
      });
    }
  }

  if (violations.length > 0) {
    throw new NamingConventionAssertionError(violations);
  }
}
