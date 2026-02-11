/**
 * Cross-domain discovery.
 *
 * Rewritten (not ported) from Agent Tavern — the AT version was
 * 60% AT-specific. This version operates on organon files + frontmatter
 * rather than components.md or domain-specific structures.
 *
 * Search modes:
 *   by-file   — find organons that govern a given file path
 *   by-scope  — list all organons at a given scope level
 *   by-type   — list all organons of a given type
 *   by-name   — find organons matching a name pattern
 */

import { parseFrontmatter, parseOrganonFile } from './frontmatter-parser.js';
import { joinPath, dirName } from './config.js';
import type {
  DiagnosticMessage,
  FileSystem,
  FindMatch,
  FindResult,
  FrontmatterScope,
  FrontmatterType,
  OrganonConfig,
  ParsedOrganonFile,
} from './types.js';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface FindOptions {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
  /** Find organons that govern this file path */
  file?: string;
  /** Find all organons at this scope level */
  scope?: FrontmatterScope;
  /** Find all organons of this type */
  type?: FrontmatterType;
  /** Find organons matching this name (substring) */
  name?: string;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function find(options: FindOptions): Promise<FindResult> {
  const { projectRoot, config, fs } = options;
  const errors: DiagnosticMessage[] = [];
  const warnings: DiagnosticMessage[] = [];

  // Discover and parse all organon files
  const allFiles = await discoverOrganonFiles(projectRoot, config, fs);
  const parsed: ParsedOrganonFile[] = [];
  for (const file of allFiles) {
    const absPath = joinPath(projectRoot, file);
    try {
      const content = await fs.readFile(absPath);
      parsed.push(parseOrganonFile(file, content));
    } catch {
      errors.push({
        severity: 'error',
        code: 'FILE_READ_ERROR',
        message: `Cannot read file: ${file}`,
        file,
      });
    }
  }

  let mode: FindResult['mode'];
  let matches: FindMatch[];

  if (options.file) {
    mode = 'by-file';
    matches = findByFile(options.file, parsed);
  } else if (options.scope) {
    mode = 'by-scope';
    matches = findByScope(options.scope, parsed);
  } else if (options.type) {
    mode = 'by-type';
    matches = findByType(options.type, parsed);
  } else if (options.name) {
    mode = 'by-name';
    matches = findByName(options.name, parsed);
  } else {
    return {
      success: false,
      mode: 'by-name',
      matches: [],
      errors: [{
        severity: 'error',
        code: 'FIND_NO_CRITERIA',
        message: 'Specify at least one search criterion: file, scope, type, or name',
      }],
      warnings: [],
    };
  }

  return {
    success: errors.length === 0,
    mode,
    matches,
    errors,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Search implementations
// ---------------------------------------------------------------------------

/**
 * Find organons that govern a given file path.
 * Walks up the directory tree to find the nearest ETHOS.md,
 * plus product-level constraints.
 */
function findByFile(targetFile: string, parsed: ParsedOrganonFile[]): FindMatch[] {
  const normalized = targetFile.replace(/\\/g, '/');
  const matches: FindMatch[] = [];

  // Always include product-level organons (root ETHOS.md, etc.)
  const productFiles = parsed.filter(
    (f) => f.frontmatter?.scope === 'product' ||
           (f.frontmatter === null && isRootFile(f.path)),
  );
  for (const pf of productFiles) {
    matches.push({
      file: pf.path,
      frontmatter: pf.frontmatter,
      relevance: 'product-level constraint',
    });
  }

  // Walk up the directory tree to find governing organons
  let dir = dirName(normalized);
  const visited = new Set<string>();
  while (dir && dir !== '.' && !visited.has(dir)) {
    visited.add(dir);
    const governing = parsed.filter((f) => {
      const organonDir = dirName(f.path.replace(/\\/g, '/'));
      return organonDir === dir;
    });
    for (const g of governing) {
      if (!matches.find((m) => m.file === g.path)) {
        matches.push({
          file: g.path,
          frontmatter: g.frontmatter,
          relevance: `directory ancestor: ${dir}`,
        });
      }
    }
    // Move up
    const lastSlash = dir.lastIndexOf('/');
    dir = lastSlash > 0 ? dir.substring(0, lastSlash) : '';
  }

  // Find by domain name match in the path
  for (const p of parsed) {
    if (p.frontmatter?.scope === 'domain' && p.frontmatter?.name) {
      if (normalized.includes(`/${p.frontmatter.name}/`) || normalized.includes(`\\${p.frontmatter.name}\\`)) {
        if (!matches.find((m) => m.file === p.path)) {
          matches.push({
            file: p.path,
            frontmatter: p.frontmatter,
            relevance: `domain name match: ${p.frontmatter.name}`,
          });
        }
      }
    }
  }

  return matches;
}

function findByScope(scope: FrontmatterScope, parsed: ParsedOrganonFile[]): FindMatch[] {
  return parsed
    .filter((f) => f.frontmatter?.scope === scope)
    .map((f) => ({
      file: f.path,
      frontmatter: f.frontmatter,
      relevance: `scope: ${scope}`,
    }));
}

function findByType(type: FrontmatterType, parsed: ParsedOrganonFile[]): FindMatch[] {
  return parsed
    .filter((f) => f.frontmatter?.type === type)
    .map((f) => ({
      file: f.path,
      frontmatter: f.frontmatter,
      relevance: `type: ${type}`,
    }));
}

function findByName(name: string, parsed: ParsedOrganonFile[]): FindMatch[] {
  const lower = name.toLowerCase();
  return parsed
    .filter((f) =>
      f.frontmatter?.name?.toLowerCase().includes(lower) ||
      f.path.toLowerCase().includes(lower),
    )
    .map((f) => ({
      file: f.path,
      frontmatter: f.frontmatter,
      relevance: `name match: ${name}`,
    }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isRootFile(path: string): boolean {
  const normalized = path.replace(/\\/g, '/');
  return !normalized.includes('/') || normalized.split('/').length <= 2;
}

async function discoverOrganonFiles(
  projectRoot: string,
  config: OrganonConfig,
  fs: FileSystem,
): Promise<string[]> {
  const allFiles = new Set<string>();

  for (const organonPath of config.organonPaths) {
    for (const pattern of config.organonGlobs) {
      const fullPattern = organonPath === '.' ? pattern : `${organonPath}/${pattern}`;
      const matches = await fs.glob(fullPattern, {
        cwd: projectRoot,
        ignore: config.ignorePatterns,
      });
      for (const m of matches) {
        allFiles.add(m);
      }
    }
  }

  return [...allFiles].sort();
}
