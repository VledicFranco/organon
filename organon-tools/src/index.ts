/**
 * Public API for programmatic use of Organon tools.
 *
 * Import from '@organon/tools' or '@organon/tools/core/*'.
 */

// Core types
export type {
  FileSystem,
  FileStat,
  DiagnosticMessage,
  Severity,
  Frontmatter,
  FrontmatterType,
  FrontmatterScope,
  AutomationTier,
  LoadPriority,
  Complexity,
  Audience,
  ProtocolEntry,
  ParsedOrganonFile,
  OrganonConfig,
  WorkflowPaths,
  ValidateFrontmatterResult,
  FileValidationResult,
  GenerateFrontmatterResult,
  QueryResult,
  HealthResult,
  FindResult,
  FindMatch,
  VerifyTripletsResult,
  TripletBinding,
  SuggestToolsResult,
  ToolSuggestion,
  VerifyResult,
  VerifyGateResult,
  VerifyGateFn,
} from './core/types.js';

// Config
export { resolveConfig, joinPath, dirName, baseName } from './core/config.js';
export type { ConfigFile } from './core/config.js';

// FileSystem implementation
export { NodeFileSystem, resolvePath } from './core/node-fs.js';

// Frontmatter parser
export {
  parseFrontmatter,
  parseOrganonFile,
  estimateTokens,
  countSectionEntries,
  extractSection,
  countTableRows,
} from './core/frontmatter-parser.js';

// Core functions
export { validateFrontmatter } from './core/validate-frontmatter.js';
export type { ValidateFrontmatterOptions } from './core/validate-frontmatter.js';

export { generateFrontmatter, serializeFrontmatter } from './core/generate-frontmatter.js';
export type { GenerateFrontmatterOptions } from './core/generate-frontmatter.js';

export { query } from './core/query.js';
export type { QueryOptions } from './core/query.js';

export { health } from './core/health.js';
export type { HealthOptions } from './core/health.js';

export { find } from './core/find.js';
export type { FindOptions } from './core/find.js';

export { verifyTriplets } from './core/verify-triplets.js';
export type { VerifyTripletsOptions } from './core/verify-triplets.js';

export { suggestTools } from './core/suggest-tools.js';
export type { SuggestToolsOptions } from './core/suggest-tools.js';

export { verify, registerGate, getRegisteredGates } from './core/verify.js';
export type { VerifyOptions } from './core/verify.js';

// Protocol parsing
export { parseProtocols } from './core/add-protocols-array.js';
