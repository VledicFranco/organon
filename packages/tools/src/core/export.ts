/**
 * Export organon knowledge graph as structured JSON.
 *
 * Produces a snapshot of entities, assertions, relationships, and rules
 * classified by epistemic category. This is the interoperability surface —
 * external tools consume this instead of parsing organon files directly.
 */

import { parseOrganonFile } from './frontmatter-parser.js';
import { joinPath } from './config.js';
import { discoverOrganonFiles } from './discover.js';
import { classifyCategory } from './query.js';
import { getRegisteredGates } from './verify.js';
import type {
  ExportAssertion,
  ExportAssertionArg,
  ExportEntity,
  ExportRelationship,
  ExportResult,
  ExportRule,
  FileSystem,
  OrganonConfig,
  ParsedOrganonFile,
} from './types.js';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface ExportOptions {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
  /** Package version to include in export metadata */
  version?: string;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function exportKnowledgeGraph(options: ExportOptions): Promise<ExportResult> {
  const { projectRoot, config, fs } = options;
  const version = options.version ?? '0.0.0';

  // Discover and parse all organon files
  const allFiles = await discoverOrganonFiles(projectRoot, config, fs);
  const parsed: ParsedOrganonFile[] = [];
  for (const file of allFiles) {
    const absPath = joinPath(projectRoot, file);
    try {
      const content = await fs.readFile(absPath);
      parsed.push(parseOrganonFile(file, content));
    } catch {
      // Skip unreadable files
    }
  }

  const withFrontmatter = parsed.filter((f) => f.frontmatter !== null);

  const entities = buildEntities(withFrontmatter);
  const assertions = buildAssertions(withFrontmatter);
  const relationships = buildRelationships(withFrontmatter);
  const rules = buildRules();

  return {
    version,
    exportedAt: new Date().toISOString(),
    entities,
    assertions,
    relationships,
    rules,
  };
}

// ---------------------------------------------------------------------------
// Entity extraction
// ---------------------------------------------------------------------------

function fileId(file: ParsedOrganonFile): string {
  // Strip extension and normalize path
  const clean = file.path.replace(/\\/g, '/').replace(/\.md$/, '');
  return `organon:${clean}`;
}

function buildEntities(files: ParsedOrganonFile[]): ExportEntity[] {
  return files.map((f) => {
    const fm = f.frontmatter!;
    const category = classifyCategory(f);
    // Fallback: derive name from path when frontmatter name is missing
    const name = fm.name ?? f.path.replace(/\\/g, '/').replace(/\.md$/, '').split('/').pop() ?? f.path;
    return {
      id: fileId(f),
      kind: 'organon-file',
      name,
      source: f.path,
      attrs: {
        scope: fm.scope,
        type: fm.type,
        ...(category ? { category } : {}),
      },
    };
  });
}

// ---------------------------------------------------------------------------
// Assertion extraction
// ---------------------------------------------------------------------------

function buildAssertions(files: ParsedOrganonFile[]): ExportAssertion[] {
  const assertions: ExportAssertion[] = [];
  const now = new Date().toISOString();

  for (const f of files) {
    const fm = f.frontmatter!;
    const category = classifyCategory(f);
    const entityId = fileId(f);

    // Extract invariants from ETHOS files as SHOULD assertions (desired states)
    if (fm.type === 'constraints' && fm.invariants) {
      for (const inv of fm.invariants) {
        assertions.push({
          id: `inv:${inv.id}`,
          kind: 'SHOULD',
          predicate: 'declares_invariant',
          args: [
            { type: 'entity', id: entityId },
            { type: 'literal', value: inv.name },
          ],
          status: 'ACTIVE',
          source: f.path,
          observedAt: now,
        });
      }
    }

    // Extract observations as FACT assertions (observed reality)
    if (category === 'assertion') {
      assertions.push({
        id: `obs:${fm.name}`,
        kind: 'FACT',
        predicate: 'observed',
        args: [
          { type: 'entity', id: entityId },
        ],
        status: 'ACTIVE',
        source: f.path,
        observedAt: now,
      });
    }
  }

  return assertions;
}

// ---------------------------------------------------------------------------
// Relationship extraction
// ---------------------------------------------------------------------------

function buildRelationships(files: ParsedOrganonFile[]): ExportRelationship[] {
  const relationships: ExportRelationship[] = [];

  // Build name→entity ID map so inherits_from names resolve to real entities
  const nameToId = new Map<string, string>();
  for (const f of files) {
    if (f.frontmatter?.name) {
      nameToId.set(f.frontmatter.name, fileId(f));
    }
  }

  for (const f of files) {
    const fm = f.frontmatter!;
    const id = fileId(f);

    // inherits_from — resolve names to entity IDs when possible
    if (fm.inherits_from) {
      for (const parent of fm.inherits_from) {
        relationships.push({
          source: id,
          predicate: 'inherits_from',
          target: nameToId.get(parent) ?? `organon:${parent}`,
        });
      }
    }

    // related_domains
    if (fm.related_domains) {
      for (const domain of fm.related_domains) {
        relationships.push({
          source: id,
          predicate: 'related_to_domain',
          target: `domain:${domain}`,
        });
      }
    }

    // related_features
    if (fm.related_features) {
      for (const feature of fm.related_features) {
        relationships.push({
          source: id,
          predicate: 'related_to_feature',
          target: `feature:${feature}`,
        });
      }
    }

  }

  return relationships;
}

// ---------------------------------------------------------------------------
// Rule extraction
// ---------------------------------------------------------------------------

function buildRules(): ExportRule[] {
  const gateNames = getRegisteredGates();
  return gateNames.map((name) => ({
    id: `gate:${name}`,
    name: `${name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')} gate`,
    enforcement: 'blocking',
    source: 'packages/tools/src/cli/commands/verify.ts',
  }));
}
