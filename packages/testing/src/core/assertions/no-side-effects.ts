/**
 * validateNoSideEffects — Pure assertion that checks imports against a forbidden list.
 *
 * Invariants enforced:
 * - INV-TEST-1 (assertion-logic-pure): No I/O imports. Operates on pre-resolved data.
 * - INV-TEST-2 (fail-fast): Throws on violation (collects all before throwing).
 * - INV-TEST-7 (composable): No module-level mutable state.
 *
 * This module must NEVER import fs, http, process, or any I/O module.
 */

import type { ImportMatch } from '../resolvers/import-resolver.js';

/**
 * A violation: a forbidden module import was found.
 */
export interface NoSideEffectsViolation {
  /** Path of the file containing the forbidden import */
  file: string;
  /** The line number (1-based) */
  line: number;
  /** The full line text */
  lineText: string;
  /** The forbidden module that was imported */
  module: string;
}

/**
 * Error thrown when a no-side-effects assertion fails.
 */
export class NoSideEffectsAssertionError extends Error {
  public readonly violations: NoSideEffectsViolation[];

  constructor(violations: NoSideEffectsViolation[]) {
    const details = violations
      .map(
        (v) =>
          `  ${v.file}:${v.line} — imports forbidden module "${v.module}"\n    > ${v.lineText.trim()}`,
      )
      .join('\n');

    super(
      `No side effects assertion failed: ${violations.length} forbidden import(s) found\n${details}`,
    );

    this.name = 'NoSideEffectsAssertionError';
    this.violations = violations;
  }
}

/**
 * Check whether a module specifier matches a forbidden module.
 *
 * Matches both bare specifier and node: prefixed specifier.
 * For example, forbidden 'fs' matches 'fs', 'node:fs', 'fs/promises', 'node:fs/promises'.
 */
export function isForbidden(
  moduleSpecifier: string,
  forbiddenModules: string[],
): boolean {
  for (const forbidden of forbiddenModules) {
    // Exact match
    if (moduleSpecifier === forbidden) return true;
    // node:-prefixed match
    if (moduleSpecifier === `node:${forbidden}`) return true;
    // Subpath match (e.g., 'fs/promises' when 'fs' is forbidden)
    if (moduleSpecifier.startsWith(`${forbidden}/`)) return true;
    if (moduleSpecifier.startsWith(`node:${forbidden}/`)) return true;
  }
  return false;
}

/**
 * Validate that no imports match the forbidden module list.
 *
 * This is a pure, synchronous function: no I/O, no side effects, deterministic.
 *
 * @throws {NoSideEffectsAssertionError} if any forbidden import is found
 */
export function validateNoSideEffects(
  imports: ImportMatch[],
  forbiddenModules: string[],
): void {
  const violations: NoSideEffectsViolation[] = [];

  for (const imp of imports) {
    if (isForbidden(imp.module, forbiddenModules)) {
      violations.push({
        file: imp.file,
        line: imp.line,
        lineText: imp.lineText,
        module: imp.module,
      });
    }
  }

  if (violations.length > 0) {
    throw new NoSideEffectsAssertionError(violations);
  }
}
