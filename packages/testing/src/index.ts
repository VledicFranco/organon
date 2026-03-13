/**
 * @organon-methodology/testing — Semantic testing framework for tier-4 invariant verification.
 * @organon-implements domains/testing
 *
 * Public API exports for the @organon-methodology/testing package.
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

// ---------------------------------------------------------------------------
// Assertions: assertFileExists()
// ---------------------------------------------------------------------------

export {
  assertFileExists,
  FileExistsResolverError,
  FileExistsAssertionError,
} from './core/assert-file-exists.js';

export type {
  FileExistsOptions,
} from './core/assert-file-exists.js';

export {
  validateFileExists,
} from './core/assertions/file-exists.js';

export type {
  FileExistsEntry,
  FileExistsViolation,
} from './core/assertions/file-exists.js';

// ---------------------------------------------------------------------------
// Assertions: assertCustom()
// ---------------------------------------------------------------------------

export {
  assertCustom,
  CustomAssertionError,
} from './core/assert-custom.js';

export type {
  CustomAssertionOptions,
} from './core/assert-custom.js';

// ---------------------------------------------------------------------------
// Assertions: assertNoSideEffects()
// ---------------------------------------------------------------------------

export {
  assertNoSideEffects,
  NoSideEffectsResolverError,
  NoSideEffectsAssertionError,
} from './core/assert-no-side-effects.js';

export type {
  NoSideEffectsOptions,
} from './core/assert-no-side-effects.js';

export {
  validateNoSideEffects,
  isForbidden,
} from './core/assertions/no-side-effects.js';

export type {
  NoSideEffectsViolation,
} from './core/assertions/no-side-effects.js';

// ---------------------------------------------------------------------------
// Assertions: assertNamingConvention()
// ---------------------------------------------------------------------------

export {
  assertNamingConvention,
  NamingConventionResolverError,
  NamingConventionAssertionError,
} from './core/assert-naming-convention.js';

export type {
  NamingConventionOptions,
  Convention,
} from './core/assert-naming-convention.js';

export {
  validateNamingConvention,
  matchesConvention,
} from './core/assertions/naming-convention.js';

export type {
  NamingConventionViolation,
} from './core/assertions/naming-convention.js';

// ---------------------------------------------------------------------------
// Assertions: assertExportsPresent()
// ---------------------------------------------------------------------------

export {
  assertExportsPresent,
  ExportsPresentResolverError,
  ExportsPresentAssertionError,
  extractExportNames,
} from './core/assert-exports-present.js';

export type {
  ExportsPresentOptions,
} from './core/assert-exports-present.js';

export {
  validateExportsPresent,
} from './core/assertions/exports-present.js';

export type {
  ExportsPresentViolation,
} from './core/assertions/exports-present.js';

// ---------------------------------------------------------------------------
// Resolvers (for advanced use)
// ---------------------------------------------------------------------------

export {
  extractImports,
  resolveImports,
} from './core/resolvers/import-resolver.js';

export type {
  ImportMatch,
  ResolvedImports,
} from './core/resolvers/import-resolver.js';

export {
  extractFileStems,
  extractByPattern,
  resolveFileStems,
  resolveStringsByPattern,
} from './core/resolvers/string-resolver.js';

export type {
  ExtractedString,
  ResolvedStrings,
} from './core/resolvers/string-resolver.js';

export {
  readFilesParallel,
} from './core/resolvers/parallel-reader.js';

export type {
  FileReadResult,
} from './core/resolvers/parallel-reader.js';
