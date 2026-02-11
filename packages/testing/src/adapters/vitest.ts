/**
 * Vitest adapter for @organon/testing.
 *
 * Provides a TestRunner that delegates to vitest's `it()` so invariant tests
 * participate in vitest's lifecycle (reporting, --bail, watch-mode, etc.).
 *
 * Usage:
 * ```typescript
 * import { testInvariant, assertMaxValue } from '@organon/testing/vitest';
 *
 * testInvariant('INV-FOO-1', 'max cache TTL is 24h', async () => {
 *   await assertMaxValue({ files: ['src/config.ts'], pattern: /ttl:\s*(\d+)/, maxValue: 86400 });
 * });
 * ```
 *
 * Invariants:
 * - INV-TEST-4 (framework-agnostic-core): Core logic stays in invariant-test.ts;
 *   this file only bridges to vitest's `it()`.
 */

import { it } from 'vitest';
import {
  testInvariant as coreTestInvariant,
  type TestRunner,
  type InvariantTestFn,
  type InvariantTestMetadata,
  type TestInvariantOptions,
} from '../core/invariant-test.js';

// ---------------------------------------------------------------------------
// Vitest runner
// ---------------------------------------------------------------------------

/**
 * A TestRunner that wraps vitest's `it()`.
 *
 * vitest's `it()` accepts an async function and tracks the promise internally,
 * so the async test function integrates naturally.
 */
export const vitestRunner: TestRunner = (
  testName: string,
  testFn: InvariantTestFn,
  _metadata: InvariantTestMetadata,
): void => {
  it(testName, testFn);
};

// ---------------------------------------------------------------------------
// Pre-configured testInvariant (convenience)
// ---------------------------------------------------------------------------

/**
 * testInvariant pre-configured with the vitest runner.
 *
 * Drop-in replacement for the core testInvariant — same signature,
 * but tests run through vitest's `it()` instead of the default fire-and-forget runner.
 */
export function testInvariant(
  invariantId: string,
  description: string,
  testFn: InvariantTestFn,
  options?: Omit<TestInvariantOptions, 'runner'>,
): void {
  coreTestInvariant(invariantId, description, testFn, {
    ...options,
    runner: vitestRunner,
  });
}

// ---------------------------------------------------------------------------
// Re-exports for single-import convenience
// ---------------------------------------------------------------------------

export { assertMaxValue, MaxValueResolverError, MaxValueAssertionError } from '../core/assert-max-value.js';
export type { MaxValueOptions } from '../core/assert-max-value.js';
export type {
  InvariantTestMetadata,
  InvariantTestFn,
  TestRunner,
  TestInvariantOptions,
} from '../core/invariant-test.js';
export {
  createRegistry,
  getDefaultRegistry,
  InvariantTestError,
} from '../core/invariant-test.js';
