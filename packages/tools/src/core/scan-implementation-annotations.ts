/**
 * Source annotation scanner for @organon-implements comments.
 *
 * Pure-logic module: no side effects. Takes a file system, config, and known IDs,
 * returns a structured scan result. Gates in 7C call this.
 */

import { joinPath } from './config.js';
import type {
  DiagnosticMessage,
  FileSystem,
  OrganonConfig,
  ParsedOrganonFile,
} from './types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ImplementationClaimType = 'scope' | 'invariant' | 'protocol' | 'unknown';

export interface ImplementationClaim {
  /** Source file path (relative to projectRoot) */
  file: string;
  /** Line number of the annotation (1-indexed) */
  line: number;
  /** Raw reference string after @organon-implements */
  reference: string;
  type: ImplementationClaimType;
}

export interface ImplementationAnnotationScan {
  /** All claims found across all source files */
  claims: ImplementationClaim[];
  /** invariant ID (uppercase) → source file paths that claim it */
  byInvariant: Map<string, string[]>;
  /** protocol ID (uppercase) → source file paths that claim it */
  byProtocol: Map<string, string[]>;
  /** scope reference → source file paths that claim it */
  byScope: Map<string, string[]>;
  /** Claims pointing to IDs/scopes not found in organon files */
  orphans: ImplementationClaim[];
  /** Diagnostics (warnings for unknown claim types, errors for orphans) */
  diagnostics: DiagnosticMessage[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ANNOTATION_RE = /@organon-implements\s+(\S+)/;
const INVARIANT_RE = /^INV-[A-Z0-9]+-\d+$/i;
const PROTOCOL_RE = /^PROTO-[A-Z0-9]+-\d+$/i;
const SCOPE_PREFIXES = ['domains/', 'features/', 'components/', 'product'];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function scanImplementationAnnotations(options: {
  fileSystem: FileSystem;
  projectRoot: string;
  config: OrganonConfig;
  /** Invariant IDs known to exist (from parsed organon files), uppercased */
  knownInvariantIds: Set<string>;
  /** Protocol IDs known to exist (from parsed organon files), uppercased */
  knownProtocolIds: Set<string>;
  /** Domain/feature/component scope names known to exist */
  knownScopes: Set<string>;
}): Promise<ImplementationAnnotationScan> {
  const { fileSystem, projectRoot, config } = options;

  const sourceFiles = await resolveSourceFiles(fileSystem, projectRoot, config);

  // Scan each file for @organon-implements lines
  const claims: ImplementationClaim[] = [];
  for (const file of sourceFiles) {
    const content = await fileSystem.readFile(joinPath(projectRoot, file));
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const match = ANNOTATION_RE.exec(lines[i]);
      if (match) {
        const reference = match[1].trim();
        claims.push({
          file,
          line: i + 1,
          reference,
          type: classifyReference(reference),
        });
      }
    }
  }

  // Build lookup maps and detect orphans
  const byInvariant = new Map<string, string[]>();
  const byProtocol = new Map<string, string[]>();
  const byScope = new Map<string, string[]>();
  const orphans: ImplementationClaim[] = [];
  const diagnostics: DiagnosticMessage[] = [];

  for (const claim of claims) {
    switch (claim.type) {
      case 'invariant': {
        const key = claim.reference.toUpperCase();
        if (!options.knownInvariantIds.has(key)) {
          orphans.push(claim);
          diagnostics.push({
            severity: 'error',
            code: 'IMPL_ORPHANED_INVARIANT',
            message: `@organon-implements references unknown invariant: ${claim.reference}`,
            file: claim.file,
            line: claim.line,
          });
        } else {
          addToMap(byInvariant, key, claim.file);
        }
        break;
      }
      case 'protocol': {
        const key = claim.reference.toUpperCase();
        if (!options.knownProtocolIds.has(key)) {
          orphans.push(claim);
          diagnostics.push({
            severity: 'error',
            code: 'IMPL_ORPHANED_PROTOCOL',
            message: `@organon-implements references unknown protocol: ${claim.reference}`,
            file: claim.file,
            line: claim.line,
          });
        } else {
          addToMap(byProtocol, key, claim.file);
        }
        break;
      }
      case 'scope': {
        if (!options.knownScopes.has(claim.reference)) {
          orphans.push(claim);
          diagnostics.push({
            severity: 'warning',
            code: 'IMPL_ORPHANED_SCOPE',
            message: `@organon-implements references unknown scope: ${claim.reference}`,
            file: claim.file,
            line: claim.line,
          });
        } else {
          addToMap(byScope, claim.reference, claim.file);
        }
        break;
      }
      case 'unknown': {
        diagnostics.push({
          severity: 'warning',
          code: 'IMPL_UNKNOWN_REFERENCE',
          message: `@organon-implements has unrecognized reference format: ${claim.reference}`,
          file: claim.file,
          line: claim.line,
          suggestion: 'Use: domains/name, INV-SCOPE-N, or PROTO-SCOPE-N',
        });
        break;
      }
    }
  }

  return { claims, byInvariant, byProtocol, byScope, orphans, diagnostics };
}

/**
 * Extract known IDs and scopes from parsed organon files.
 * Used by gates to build the knownXxx sets passed to scanImplementationAnnotations.
 */
export function buildKnownIds(files: ParsedOrganonFile[]): {
  invariantIds: Set<string>;
  protocolIds: Set<string>;
  scopes: Set<string>;
} {
  const invariantIds = new Set<string>();
  const protocolIds = new Set<string>();
  const scopes = new Set<string>();

  for (const file of files) {
    const fm = file.frontmatter;
    if (!fm) continue;

    if (fm.invariants) {
      for (const inv of fm.invariants) {
        if (inv.id) invariantIds.add(inv.id.toUpperCase());
      }
    }

    if (fm.protocols) {
      for (const proto of fm.protocols) {
        if (proto.id) protocolIds.add(proto.id.toUpperCase());
      }
    }

    if (fm.scope === 'domain' && fm.name) {
      scopes.add(`domains/${fm.name}`);
    } else if (fm.scope === 'feature' && fm.name) {
      scopes.add(`features/${fm.name}`);
    } else if (fm.scope === 'component' && fm.name) {
      scopes.add(`components/${fm.name}`);
    } else if (fm.scope === 'product') {
      scopes.add('product');
    }
  }

  return { invariantIds, protocolIds, scopes };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function classifyReference(ref: string): ImplementationClaimType {
  if (INVARIANT_RE.test(ref)) return 'invariant';
  if (PROTOCOL_RE.test(ref)) return 'protocol';
  if (SCOPE_PREFIXES.some((p) => ref.startsWith(p))) return 'scope';
  return 'unknown';
}

async function resolveSourceFiles(
  fs: FileSystem,
  projectRoot: string,
  config: OrganonConfig,
): Promise<string[]> {
  const globs = config.sourceGlobs ?? [];
  const ignore = config.sourceIgnorePatterns ?? [];
  const files = new Set<string>();
  for (const pattern of globs) {
    const matches = await fs.glob(pattern, { cwd: projectRoot, ignore });
    for (const f of matches) files.add(f);
  }
  return [...files].sort();
}

function addToMap(map: Map<string, string[]>, key: string, value: string): void {
  const existing = map.get(key);
  if (existing) {
    if (!existing.includes(value)) existing.push(value);
  } else {
    map.set(key, [value]);
  }
}
