/**
 * @organon/testing — Semantic testing framework for tier-4 invariant verification.
 *
 * Public API exports for the @organon/testing package.
 */

// ---------------------------------------------------------------------------
// Core: testInvariant() wrapper
// ---------------------------------------------------------------------------

export {
  testInvariant,
  createRegistry,
  getDefaultRegistry,
  validateInvariantId,
  validateDescription,
  validateTestFn,
  InvariantTestError,
} from './core/invariant-test.js';

export type {
  InvariantTestMetadata,
  InvariantTestFn,
  TestRunner,
  TestInvariantOptions,
  InvariantTestRegistry,
} from './core/invariant-test.js';

// ---------------------------------------------------------------------------
// Assertions: assertMaxValue()
// ---------------------------------------------------------------------------

export {
  assertMaxValue,
  MaxValueResolverError,
  MaxValueAssertionError,
} from './core/assert-max-value.js';

export type {
  MaxValueOptions,
} from './core/assert-max-value.js';

// ---------------------------------------------------------------------------
// Pure assertion validators (for advanced use / testing)
// ---------------------------------------------------------------------------

export {
  validateMaxValue,
} from './core/assertions/max-value.js';

export type {
  MaxValueEntry,
  ValidateMaxValueOptions,
  MaxValueViolation,
} from './core/assertions/max-value.js';

// ---------------------------------------------------------------------------
// Resolver types (for custom FileSystem implementations)
// ---------------------------------------------------------------------------

export type {
  FileSystem,
} from './core/resolvers/types.js';

export { createNodeFileSystem } from './core/resolvers/node-fs.js';

export {
  resolveValues,
  expandGlobs,
} from './core/resolvers/file-resolver.js';

export type {
  ExtractedValue,
  ResolvedValues,
  ResolverError,
  FileMatch,
  ResolveValuesOptions,
} from './core/resolvers/file-resolver.js';
