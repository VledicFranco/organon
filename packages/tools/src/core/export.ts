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
    exported_at: new Date().toISOString(),
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
  return files.map((f) => ({
    id: fileId(f),
    kind: 'organon-file',
    name: f.frontmatter!.name,
    scope: f.frontmatter!.scope,
    type: f.frontmatter!.type,
    category: classifyCategory(f),
  }));
}

// ---------------------------------------------------------------------------
// Assertion extraction
// ---------------------------------------------------------------------------

function buildAssertions(files: ParsedOrganonFile[]): ExportAssertion[] {
  const assertions: ExportAssertion[] = [];

  for (const f of files) {
    const fm = f.frontmatter!;
    const category = classifyCategory(f);

    // Extract invariants from ETHOS files as constraints
    if (fm.type === 'constraints' && fm.invariants) {
      for (const inv of fm.invariants) {
        assertions.push({
          id: `inv:${inv.id}`,
          category: 'constraint',
          source: f.path,
          predicate: 'declares_invariant',
          content: inv.name,
        });
      }
    }

    // Extract observations as assertions
    if (category === 'assertion') {
      assertions.push({
        id: `obs:${fm.name}`,
        category: 'assertion',
        source: f.path,
        predicate: 'observed',
        content: fm.summary,
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

  for (const f of files) {
    const fm = f.frontmatter!;
    const id = fileId(f);

    // inherits_from
    if (fm.inherits_from) {
      for (const parent of fm.inherits_from) {
        relationships.push({
          source: id,
          predicate: 'inherits_from',
          target: `organon:${parent}`,
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

    // primary_rfcs
    if (fm.primary_rfcs) {
      for (const rfc of fm.primary_rfcs) {
        relationships.push({
          source: id,
          predicate: 'shaped_by_rfc',
          target: `rfc:${String(rfc).padStart(3, '0')}`,
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
    predicate: 'validates',
    targets: ['all organon files'],
    type: 'blocking',
  }));
}
