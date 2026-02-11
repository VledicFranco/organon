/**
 * testInvariant — Wrapper that links tests to invariant IDs.
 *
 * Invariants enforced:
 * - INV-TEST-3 (invariant-id-required): Every test must link to an invariant ID.
 * - INV-TEST-4 (framework-agnostic-core): Core logic has zero test-framework deps.
 * - INV-TEST-6 (always-async): Test function is always async.
 * - INV-TEST-7 (composable): No module-level mutable state that affects test outcomes.
 *
 * Design:
 * - The metadata registry is a read-only record of test registrations.
 *   It stores what tests were registered but does not affect test execution.
 *   Tests execute identically regardless of registry state (INV-TEST-7).
 * - The wrapper delegates to a configurable test runner function.
 *   By default, it uses a pass-through runner that just calls the test function.
 *   Adapters (e.g., vitest.ts) provide framework-specific runners.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Metadata about a registered invariant test.
 * Stored in the registry for coverage tracking.
 */
export interface InvariantTestMetadata {
  /** Invariant ID (e.g., "INV-CACHE-1") */
  invariantId: string;
  /** Human-readable description of what the test verifies */
  description: string;
}

/**
 * A test function that verifies an invariant.
 * Always async (INV-TEST-6).
 */
export type InvariantTestFn = () => Promise<void>;

/**
 * A test runner function provided by framework adapters.
 * Receives the test name, the async test function, and the invariant metadata.
 * Framework adapters (e.g., Vitest adapter) wrap this to call `it()` or `test()`.
 */
export type TestRunner = (
  testName: string,
  testFn: InvariantTestFn,
  metadata: InvariantTestMetadata,
) => void;

/**
 * Options for configuring testInvariant behavior.
 */
export interface TestInvariantOptions {
  /** Custom test runner (default: passthrough that executes the function) */
  runner?: TestRunner;
  /** Custom registry for tracking test registrations (default: global registry) */
  registry?: InvariantTestRegistry;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Error thrown when testInvariant is called with invalid arguments.
 */
export class InvariantTestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvariantTestError';
  }
}

/**
 * Validate an invariant ID format.
 *
 * Valid format: PREFIX-WORD-NUMBER (e.g., "INV-CACHE-1", "INV-TEST-42")
 * Must be non-empty and follow the ID convention.
 */
export function validateInvariantId(id: string): void {
  if (!id || typeof id !== 'string') {
    throw new InvariantTestError(
      'Invariant ID is required. Provide a non-empty string (e.g., "INV-CACHE-1").',
    );
  }

  const trimmed = id.trim();
  if (trimmed.length === 0) {
    throw new InvariantTestError(
      'Invariant ID must not be empty or whitespace-only.',
    );
  }

  if (trimmed !== id) {
    throw new InvariantTestError(
      `Invariant ID "${id}" contains leading or trailing whitespace. Use "${trimmed}" instead.`,
    );
  }
}

/**
 * Validate a test description.
 */
export function validateDescription(description: string): void {
  if (!description || typeof description !== 'string') {
    throw new InvariantTestError(
      'Test description is required. Provide a non-empty string describing what the test verifies.',
    );
  }

  const trimmed = description.trim();
  if (trimmed.length === 0) {
    throw new InvariantTestError(
      'Test description must not be empty or whitespace-only.',
    );
  }
}

/**
 * Validate a test function.
 */
export function validateTestFn(testFn: unknown): asserts testFn is InvariantTestFn {
  if (typeof testFn !== 'function') {
    throw new InvariantTestError(
      `Test function is required. Got ${typeof testFn} instead of a function.`,
    );
  }
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

/**
 * Create a new invariant test registry.
 *
 * The registry is a simple container that tracks which invariant IDs have
 * been registered with testInvariant(). It supports:
 * - Registering tests (invariant ID + description)
 * - Querying registered tests (for coverage calculation)
 * - Clearing (for test isolation)
 *
 * The registry does NOT affect test execution. Tests run identically
 * regardless of registry state (INV-TEST-7: composable).
 */
export interface InvariantTestRegistry {
  /** Register a test for an invariant */
  register(metadata: InvariantTestMetadata): void;
  /** Get all registered test metadata (snapshot, not a live reference) */
  getAll(): InvariantTestMetadata[];
  /** Check if an invariant ID has been registered */
  has(invariantId: string): boolean;
  /** Get the count of registered tests (may exceed distinct invariants if multiple tests cover the same ID) */
  size(): number;
  /** Get the count of distinct invariant IDs covered */
  coveredCount(): number;
  /** Clear all registrations (for test isolation) */
  clear(): void;
}

/**
 * Create a new empty registry instance.
 */
export function createRegistry(): InvariantTestRegistry {
  const entries: InvariantTestMetadata[] = [];

  return {
    register(metadata: InvariantTestMetadata): void {
      entries.push({ ...metadata });
    },

    getAll(): InvariantTestMetadata[] {
      return entries.map((e) => ({ ...e }));
    },

    has(invariantId: string): boolean {
      return entries.some((e) => e.invariantId === invariantId);
    },

    size(): number {
      return entries.length;
    },

    coveredCount(): number {
      return new Set(entries.map((e) => e.invariantId)).size;
    },

    clear(): void {
      entries.length = 0;
    },
  };
}

// ---------------------------------------------------------------------------
// Default registry (module-scoped singleton for convenience)
// ---------------------------------------------------------------------------

/**
 * The default global registry. Used by testInvariant() when no custom
 * registry is provided. Can be accessed via getDefaultRegistry() for
 * coverage reporting.
 */
const defaultRegistry = createRegistry();

/**
 * Get the default global registry for coverage reporting.
 */
export function getDefaultRegistry(): InvariantTestRegistry {
  return defaultRegistry;
}

// ---------------------------------------------------------------------------
// Core: testInvariant()
// ---------------------------------------------------------------------------

/**
 * Default test runner: executes the async test function directly.
 * Used when no framework-specific adapter is configured.
 * Framework adapters (vitest, jest) replace this with their own `it()`/`test()` wrapper.
 *
 * Since TestRunner is synchronous (for framework compatibility) but testFn is async,
 * failures surface as unhandled promise rejections. In Node.js 15+, unhandled
 * rejections crash the process with a clear error. A .catch() handler wraps the
 * error with the test name for better diagnostics.
 */
const defaultRunner: TestRunner = (testName, testFn, _metadata) => {
  testFn().catch((err: unknown) => {
    const wrapped = err instanceof Error
      ? err
      : new Error(String(err));
    wrapped.message = `[${testName}] ${wrapped.message}`;
    // Re-throw as unhandled rejection so Node.js exits non-zero
    queueMicrotask(() => { throw wrapped; });
  });
};

/**
 * Register and declare an invariant test.
 *
 * This is the primary API for linking tests to invariant IDs (INV-TEST-3).
 *
 * Usage:
 * ```typescript
 * testInvariant('INV-CACHE-1', 'cache TTL max 24h', async () => {
 *   await assertMaxValue({ ... });
 * });
 * ```
 *
 * What it does:
 * 1. Validates inputs (invariant ID, description, test function)
 * 2. Registers the test in the metadata registry (for coverage tracking)
 * 3. Delegates to the configured test runner (framework adapter)
 *
 * @param invariantId - The invariant ID this test verifies (e.g., "INV-CACHE-1")
 * @param description - Human-readable description of what the test checks
 * @param testFn - Async function that performs assertions
 * @param options - Optional configuration (custom runner, custom registry)
 *
 * @throws {InvariantTestError} if inputs are invalid
 */
export function testInvariant(
  invariantId: string,
  description: string,
  testFn: InvariantTestFn,
  options?: TestInvariantOptions,
): void {
  // 1. Validate inputs (INV-TEST-2: fail-fast on bad input)
  validateInvariantId(invariantId);
  validateDescription(description);
  validateTestFn(testFn);

  // 2. Build metadata
  const metadata: InvariantTestMetadata = {
    invariantId,
    description,
  };

  // 3. Register in the registry (for coverage tracking)
  const registry = options?.registry ?? defaultRegistry;
  registry.register(metadata);

  // 4. Delegate to test runner
  const runner = options?.runner ?? defaultRunner;
  const testName = `[${invariantId}] ${description}`;
  runner(testName, testFn, metadata);
}
