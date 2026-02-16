/**
 * Multi-stage frontmatter validation.
 *
 * Stage 1: Schema — required fields, type enums, format rules
 * Stage 2: References — inherits_from, related_domains, related_features, primary_rfcs exist
 * Stage 3: Truthfulness — counts match content, token_estimate order-of-magnitude accurate
 * Stage 4: Consistency — name↔directory, scope↔directory, bidirectional refs
 */

import { parseFrontmatter, estimateTokens, extractSection, countSectionEntries, countTableRows } from './frontmatter-parser.js';
import { joinPath, baseName, dirName } from './config.js';
import { discoverOrganonFiles } from './discover.js';
import type {
  DiagnosticMessage,
  FileSystem,
  FileValidationResult,
  Frontmatter,
  FrontmatterScope,
  FrontmatterType,
  OrganonConfig,
  ValidateFrontmatterResult,
} from './types.js';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface ValidateFrontmatterOptions {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
  /** Specific files to validate. If empty, validates all discovered organon files. */
  files?: string[];
  /** Which stages to run. Defaults to all 4. */
  stages?: Array<1 | 2 | 3 | 4>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_TYPES: FrontmatterType[] = ['navigation', 'constraints', 'rationale', 'procedures', 'mapping'];
const VALID_SCOPES: FrontmatterScope[] = ['product', 'domain', 'feature', 'component', 'meta', 'methodology'];
const KEBAB_CASE_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const VERSION_RE = /^\d+\.\d+$/;
const MAX_SUMMARY_LENGTH = 200;
const TOKEN_TOLERANCE = 0.5; // 50% — warn when estimate deviates significantly from actual

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function validateFrontmatter(
  options: ValidateFrontmatterOptions,
): Promise<ValidateFrontmatterResult> {
  const { projectRoot, config, fs, stages = [1, 2, 3, 4] } = options;

  const files = options.files && options.files.length > 0
    ? options.files
    : await discoverOrganonFiles(projectRoot, config, fs);

  const allErrors: DiagnosticMessage[] = [];
  const allWarnings: DiagnosticMessage[] = [];
  const results: FileValidationResult[] = [];

  // Pre-load all frontmatter for cross-reference checks
  const allFrontmatter = new Map<string, Frontmatter | null>();
  for (const file of files) {
    const absPath = joinPath(projectRoot, file);
    try {
      const content = await fs.readFile(absPath);
      const { frontmatter } = parseFrontmatter(content);
      allFrontmatter.set(file, frontmatter);
    } catch {
      allFrontmatter.set(file, null);
    }
  }

  for (const file of files) {
    const fileErrors: DiagnosticMessage[] = [];
    const fileWarnings: DiagnosticMessage[] = [];

    const absPath = joinPath(projectRoot, file);
    let content: string;
    try {
      content = await fs.readFile(absPath);
    } catch {
      fileErrors.push({
        severity: 'error',
        code: 'FILE_READ_ERROR',
        message: `Cannot read file: ${file}`,
        file,
      });
      results.push({ file, valid: false, errors: fileErrors, warnings: fileWarnings });
      allErrors.push(...fileErrors);
      continue;
    }

    const { frontmatter, body } = parseFrontmatter(content);

    if (!frontmatter) {
      fileErrors.push({
        severity: 'error',
        code: 'FRONTMATTER_MISSING',
        message: 'File has no YAML frontmatter',
        file,
        suggestion: 'Add --- delimited YAML block at the top of the file',
      });
      results.push({ file, valid: false, errors: fileErrors, warnings: fileWarnings });
      allErrors.push(...fileErrors);
      continue;
    }

    // Stage 1: Schema validation
    if (stages.includes(1)) {
      validateSchema(frontmatter, file, body, fileErrors, fileWarnings);
    }

    // Stage 2: Reference validation
    if (stages.includes(2)) {
      await validateReferences(frontmatter, file, allFrontmatter, projectRoot, config, fs, fileErrors, fileWarnings);
    }

    // Stage 3: Truthfulness validation
    if (stages.includes(3)) {
      validateTruthfulness(frontmatter, content, body, file, fileErrors, fileWarnings);
    }

    // Stage 4: Consistency validation
    if (stages.includes(4)) {
      validateConsistency(frontmatter, file, allFrontmatter, fileErrors, fileWarnings);
    }

    const valid = fileErrors.length === 0;
    results.push({ file, valid, errors: fileErrors, warnings: fileWarnings });
    allErrors.push(...fileErrors);
    allWarnings.push(...fileWarnings);
  }

  return {
    success: allErrors.length === 0,
    filesChecked: files.length,
    filesWithErrors: results.filter((r) => !r.valid).length,
    filesWithWarnings: results.filter((r) => r.warnings.length > 0).length,
    results,
    errors: allErrors,
    warnings: allWarnings,
  };
}

// ---------------------------------------------------------------------------
// Stage 1: Schema
// ---------------------------------------------------------------------------

function validateSchema(
  fm: Frontmatter,
  file: string,
  body: string,
  errors: DiagnosticMessage[],
  warnings: DiagnosticMessage[],
): void {
  // Required fields
  const required = ['type', 'scope', 'name', 'version', 'summary', 'token_estimate'] as const;
  for (const field of required) {
    if (fm[field] === undefined || fm[field] === null || fm[field] === '') {
      errors.push({
        severity: 'error',
        code: 'FRONTMATTER_MISSING_FIELD',
        message: `Missing required field: ${field}`,
        file,
        suggestion: `Add '${field}:' to the frontmatter`,
      });
    }
  }

  // Type enum
  if (fm.type && !VALID_TYPES.includes(fm.type)) {
    errors.push({
      severity: 'error',
      code: 'FRONTMATTER_INVALID_TYPE',
      message: `Invalid type '${fm.type}'. Must be one of: ${VALID_TYPES.join(', ')}`,
      file,
    });
  }

  // Scope enum
  if (fm.scope && !VALID_SCOPES.includes(fm.scope)) {
    errors.push({
      severity: 'error',
      code: 'FRONTMATTER_INVALID_SCOPE',
      message: `Invalid scope '${fm.scope}'. Must be one of: ${VALID_SCOPES.join(', ')}`,
      file,
    });
  }

  // Name: kebab-case
  if (fm.name && !KEBAB_CASE_RE.test(fm.name)) {
    errors.push({
      severity: 'error',
      code: 'FRONTMATTER_NAME_FORMAT',
      message: `Name '${fm.name}' is not kebab-case`,
      file,
      suggestion: 'Use lowercase letters, numbers, and hyphens (e.g., "my-organon")',
    });
  }

  // Version: X.Y format
  if (fm.version && !VERSION_RE.test(String(fm.version))) {
    errors.push({
      severity: 'error',
      code: 'FRONTMATTER_VERSION_FORMAT',
      message: `Version '${fm.version}' is not in X.Y format`,
      file,
      suggestion: 'Use semantic version format like "1.0" or "3.0"',
    });
  }

  // Summary length
  if (fm.summary && fm.summary.length > MAX_SUMMARY_LENGTH) {
    errors.push({
      severity: 'error',
      code: 'FRONTMATTER_SUMMARY_TOO_LONG',
      message: `Summary is ${fm.summary.length} characters (max ${MAX_SUMMARY_LENGTH})`,
      file,
      suggestion: 'Shorten the summary to one concise sentence',
    });
  }

  // Token estimate must be positive number
  if (fm.token_estimate !== undefined && (typeof fm.token_estimate !== 'number' || fm.token_estimate <= 0)) {
    errors.push({
      severity: 'error',
      code: 'FRONTMATTER_INVALID_TOKEN_ESTIMATE',
      message: `token_estimate must be a positive number, got: ${fm.token_estimate}`,
      file,
    });
  }

  // Type-specific required fields (content-aware: only warn when section exists)
  if (fm.type === 'constraints') {
    const sectionFieldMap: Array<[string, string]> = [
      ['invariants_count', 'Invariants'],
      ['principles_count', 'Principles'],
      ['heuristics_count', 'Decision Heuristics'],
    ];
    for (const [field, sectionName] of sectionFieldMap) {
      if (fm[field] === undefined && extractSection(body, sectionName)) {
        warnings.push({
          severity: 'warning',
          code: 'FRONTMATTER_MISSING_TYPE_FIELD',
          message: `Constraints file missing recommended field: ${field}`,
          file,
          suggestion: `Add '${field}:' to track content counts`,
        });
      }
    }
  }

  if (fm.type === 'rationale') {
    // decision_count is only expected for PHILOSOPHY.md files, not RFCs or observations
    const isPhilosophy = file.replace(/\\/g, '/').toUpperCase().includes('PHILOSOPHY');
    if (isPhilosophy && fm.decision_count === undefined && extractSection(body, 'Design Decisions')) {
      warnings.push({
        severity: 'warning',
        code: 'FRONTMATTER_MISSING_TYPE_FIELD',
        message: 'Rationale file missing recommended field: decision_count',
        file,
      });
    }
  }

  if (fm.type === 'procedures') {
    if (fm.protocols_count === undefined) {
      warnings.push({
        severity: 'warning',
        code: 'FRONTMATTER_MISSING_TYPE_FIELD',
        message: 'Procedures file missing recommended field: protocols_count',
        file,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Stage 2: References
// ---------------------------------------------------------------------------

async function validateReferences(
  fm: Frontmatter,
  file: string,
  allFrontmatter: Map<string, Frontmatter | null>,
  projectRoot: string,
  config: OrganonConfig,
  fs: FileSystem,
  errors: DiagnosticMessage[],
  warnings: DiagnosticMessage[],
): Promise<void> {
  // Check inherits_from references exist
  if (fm.inherits_from) {
    for (const parent of fm.inherits_from) {
      const found = [...allFrontmatter.entries()].some(
        ([, fmData]) => fmData?.name === parent,
      );
      if (!found) {
        warnings.push({
          severity: 'warning',
          code: 'FRONTMATTER_BROKEN_INHERIT',
          message: `inherits_from references '${parent}' but no organon with that name found`,
          file,
        });
      }
    }
  }

  // Check related_domains reference existing domains
  if (fm.related_domains) {
    for (const domain of fm.related_domains) {
      const found = [...allFrontmatter.entries()].some(
        ([, fmData]) => fmData?.name === domain && fmData?.scope === 'domain',
      );
      if (!found) {
        warnings.push({
          severity: 'warning',
          code: 'FRONTMATTER_BROKEN_DOMAIN_REF',
          message: `related_domains references '${domain}' but no domain organon with that name found`,
          file,
        });
      }
    }
  }

  // Check related_features reference existing features
  if (fm.related_features) {
    for (const feature of fm.related_features) {
      const found = [...allFrontmatter.entries()].some(
        ([, fmData]) => fmData?.name === feature && fmData?.scope === 'feature',
      );
      if (!found) {
        warnings.push({
          severity: 'warning',
          code: 'FRONTMATTER_BROKEN_FEATURE_REF',
          message: `related_features references '${feature}' but no feature organon with that name found`,
          file,
        });
      }
    }
  }

  // Check primary_rfcs reference existing RFC files
  if (fm.primary_rfcs) {
    for (const rfcNum of fm.primary_rfcs) {
      // Try common RFC file patterns (RFC-001*, rfc-001*, 001-*, RFC_1*)
      const padded = String(rfcNum).padStart(3, '0');
      const patterns = [
        `**/RFC-${padded}*`,
        `**/rfc-${padded}*`,
        `**/${padded}-*`,
        `**/RFC_${rfcNum}*`,
      ];
      let found = false;
      for (const pattern of patterns) {
        const matches = await fs.glob(pattern, {
          cwd: projectRoot,
          ignore: config.ignorePatterns,
        });
        if (matches.length > 0) {
          found = true;
          break;
        }
      }
      if (!found) {
        warnings.push({
          severity: 'warning',
          code: 'FRONTMATTER_BROKEN_RFC_REF',
          message: `primary_rfcs references RFC ${rfcNum} but no matching file found`,
          file,
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Stage 3: Truthfulness
// ---------------------------------------------------------------------------

function validateTruthfulness(
  fm: Frontmatter,
  fullContent: string,
  body: string,
  file: string,
  errors: DiagnosticMessage[],
  warnings: DiagnosticMessage[],
): void {
  // Token estimate accuracy
  if (fm.token_estimate && typeof fm.token_estimate === 'number') {
    const actual = estimateTokens(fullContent);
    const deviation = Math.abs(fm.token_estimate - actual) / actual;
    if (deviation > TOKEN_TOLERANCE) {
      warnings.push({
        severity: 'warning',
        code: 'FRONTMATTER_TOKEN_DRIFT',
        message: `token_estimate ${fm.token_estimate} deviates ${Math.round(deviation * 100)}% from actual ~${actual}`,
        file,
        suggestion: `Update token_estimate to approximately ${actual}`,
      });
    }
  }

  // Invariants count (for constraints type)
  if (fm.type === 'constraints' && fm.invariants_count !== undefined) {
    const section = extractSection(body, 'Invariants');
    if (section) {
      const actual = countSectionEntries(section);
      if (actual !== fm.invariants_count) {
        errors.push({
          severity: 'error',
          code: 'FRONTMATTER_COUNT_MISMATCH',
          message: `invariants_count is ${fm.invariants_count} but found ${actual} entries`,
          file,
          suggestion: `Update invariants_count to ${actual}`,
        });
      }
    }
  }

  // Principles count (for constraints type)
  if (fm.type === 'constraints' && fm.principles_count !== undefined) {
    const section = extractSection(body, 'Principles');
    if (section) {
      const actual = countSectionEntries(section);
      if (actual !== fm.principles_count) {
        errors.push({
          severity: 'error',
          code: 'FRONTMATTER_COUNT_MISMATCH',
          message: `principles_count is ${fm.principles_count} but found ${actual} entries`,
          file,
          suggestion: `Update principles_count to ${actual}`,
        });
      }
    }
  }

  // Heuristics count (for constraints type) — count table rows
  if (fm.type === 'constraints' && fm.heuristics_count !== undefined) {
    const section = extractSection(body, 'Decision Heuristics');
    if (section) {
      const actual = countTableRows(section);
      if (actual !== fm.heuristics_count) {
        errors.push({
          severity: 'error',
          code: 'FRONTMATTER_COUNT_MISMATCH',
          message: `heuristics_count is ${fm.heuristics_count} but found ${actual} table rows`,
          file,
          suggestion: `Update heuristics_count to ${actual}`,
        });
      }
    }
  }

  // Decision count (for rationale type)
  if (fm.type === 'rationale' && fm.decision_count !== undefined) {
    const section = extractSection(body, 'Design Decisions');
    if (section) {
      const actual = countSectionEntries(section);
      if (actual !== fm.decision_count) {
        errors.push({
          severity: 'error',
          code: 'FRONTMATTER_COUNT_MISMATCH',
          message: `decision_count is ${fm.decision_count} but found ${actual} entries`,
          file,
          suggestion: `Update decision_count to ${actual}`,
        });
      }
    }
  }

  // Protocols count (for procedures type)
  if (fm.type === 'procedures' && fm.protocols_count !== undefined) {
    if (fm.protocols) {
      if (fm.protocols.length !== fm.protocols_count) {
        errors.push({
          severity: 'error',
          code: 'FRONTMATTER_COUNT_MISMATCH',
          message: `protocols_count is ${fm.protocols_count} but protocols array has ${fm.protocols.length} entries`,
          file,
          suggestion: `Update protocols_count to ${fm.protocols.length}`,
        });
      }
    }
  }

  // Invariants array validation (for constraints type)
  if (fm.type === 'constraints' && fm.invariants) {
    const invArray = fm.invariants as Array<{ id?: string; name?: string }>;

    // Count matches invariants_count
    if (fm.invariants_count !== undefined && invArray.length !== fm.invariants_count) {
      errors.push({
        severity: 'error',
        code: 'FRONTMATTER_INVARIANT_COUNT_MISMATCH',
        message: `invariants_count is ${fm.invariants_count} but invariants array has ${invArray.length} entries`,
        file,
        suggestion: `Update invariants_count to ${invArray.length}`,
      });
    }

    // ID format and duplicates
    const INVARIANT_ID_RE = /^INV-[\w]+-\d+$/;
    const seenIds = new Set<string>();
    for (const inv of invArray) {
      if (inv.id) {
        if (!INVARIANT_ID_RE.test(inv.id)) {
          errors.push({
            severity: 'error',
            code: 'FRONTMATTER_INVARIANT_ID_FORMAT',
            message: `Invariant ID '${inv.id}' does not match INV-{SCOPE}-{N} format`,
            file,
            suggestion: `Use format INV-SCOPE-1, e.g., INV-META-1`,
          });
        }
        if (seenIds.has(inv.id)) {
          errors.push({
            severity: 'error',
            code: 'FRONTMATTER_INVARIANT_DUPLICATE_ID',
            message: `Duplicate invariant ID: ${inv.id}`,
            file,
          });
        }
        seenIds.add(inv.id);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Stage 4: Consistency
// ---------------------------------------------------------------------------

// Well-known Organon container/collection directories where name-directory
// match is inappropriate (these hold files from multiple domains/topics).
const COLLECTION_CONTAINER_DIRS = new Set([
  'organon',
  'book-llms',
  'book-humans',
  'observations',
  'rfcs',
  'protocols',
]);

function validateConsistency(
  fm: Frontmatter,
  file: string,
  allFrontmatter: Map<string, Frontmatter | null>,
  errors: DiagnosticMessage[],
  warnings: DiagnosticMessage[],
): void {
  const dir = dirName(file);
  const dirParts = dir.replace(/\\/g, '/').split('/');

  // Name should match parent directory (domain-boundary dirs only)
  if (fm.name && dirParts.length > 0) {
    const parentDir = dirParts[dirParts.length - 1];
    // Only check for non-root files, non-READMEs, and non-collection containers
    if (parentDir !== '.' && parentDir !== '' && baseName(file) !== 'README.md' && !COLLECTION_CONTAINER_DIRS.has(parentDir)) {
      if (fm.name !== parentDir && fm.name !== parentDir.toLowerCase()) {
        warnings.push({
          severity: 'warning',
          code: 'FRONTMATTER_NAME_DIR_MISMATCH',
          message: `name '${fm.name}' doesn't match parent directory '${parentDir}'`,
          file,
          suggestion: `Consider renaming to '${parentDir.toLowerCase()}'`,
        });
      }
    }
  }

  // Scope should match directory structure
  if (fm.scope) {
    const pathStr = file.replace(/\\/g, '/');
    const scopeFromPath = inferScopeFromPath(pathStr);
    if (scopeFromPath && scopeFromPath !== fm.scope) {
      warnings.push({
        severity: 'warning',
        code: 'FRONTMATTER_SCOPE_DIR_MISMATCH',
        message: `scope '${fm.scope}' doesn't match expected scope '${scopeFromPath}' from directory structure`,
        file,
      });
    }
  }

  // Bidirectional references: if A references B in related_domains, B should reference A
  if (fm.related_domains) {
    for (const domain of fm.related_domains) {
      const targetEntry = [...allFrontmatter.entries()].find(
        ([, fmData]) => fmData?.name === domain,
      );
      if (targetEntry) {
        const [, targetFm] = targetEntry;
        if (targetFm?.related_domains && !targetFm.related_domains.includes(fm.name)) {
          warnings.push({
            severity: 'warning',
            code: 'FRONTMATTER_UNIDIRECTIONAL_REF',
            message: `References domain '${domain}' but '${domain}' doesn't reference back`,
            file,
            suggestion: `Add '${fm.name}' to related_domains in ${domain}'s organon`,
          });
        }
      }
    }
  }

  // Automation tier consistency: if automated, workflow should exist
  if (fm.type === 'procedures' && fm.protocols) {
    for (const proto of fm.protocols) {
      if (proto.automation_tier === 'automated' && !proto.workflow) {
        errors.push({
          severity: 'error',
          code: 'FRONTMATTER_MISSING_WORKFLOW',
          message: `Protocol ${proto.id} declares automation_tier 'automated' but has no workflow binding`,
          file,
          suggestion: `Add 'workflow:' to protocol ${proto.id} or change tier to 'manual'`,
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function inferScopeFromPath(path: string): FrontmatterScope | null {
  if (path.includes('/domains/')) return 'domain';
  if (path.includes('/features/')) return 'feature';
  if (path.includes('/components/')) return 'component';
  if (path.includes('/methodology/')) return 'methodology';
  if (path.includes('book-llms/') || path.includes('book-humans/')) return 'meta';
  return null;
}

