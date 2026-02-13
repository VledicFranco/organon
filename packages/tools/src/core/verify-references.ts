/**
 * References verification gate (blocking).
 *
 * Checks that cross-file references actually resolve:
 * - inherits_from names → real organon file name fields
 * - related_domains / related_features → real organon names
 * - Workflow loads: paths → exist on disk
 * - Workflow protocol_file paths → exist on disk
 *
 * @organon-invariant INV-TOOLS-2 every-command-has-tests
 */

import { parseFrontmatter } from './frontmatter-parser.js';
import { joinPath } from './config.js';
import type {
  DiagnosticMessage,
  FileSystem,
  Frontmatter,
  OrganonConfig,
} from './types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReferencesResult {
  success: boolean;
  errors: DiagnosticMessage[];
  warnings: DiagnosticMessage[];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function verifyReferences(options: {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
}): Promise<ReferencesResult> {
  const { projectRoot, config, fs } = options;
  const errors: DiagnosticMessage[] = [];
  const warnings: DiagnosticMessage[] = [];

  // 1. Collect all organon files + their frontmatter
  const organonFiles = await discoverOrganonFiles(projectRoot, config, fs);
  const allFrontmatter = new Map<string, Frontmatter | null>();

  for (const file of organonFiles) {
    const absPath = joinPath(projectRoot, file);
    try {
      const content = await fs.readFile(absPath);
      const { frontmatter } = parseFrontmatter(content);
      allFrontmatter.set(file, frontmatter);
    } catch {
      allFrontmatter.set(file, null);
    }
  }

  // Build a set of known organon names for quick lookup
  const knownNames = new Set<string>();
  for (const [, fm] of allFrontmatter) {
    if (fm?.name) knownNames.add(fm.name);
  }

  // 2. Check organon file references
  for (const [file, fm] of allFrontmatter) {
    if (!fm) continue;

    // inherits_from → must resolve to a real organon name
    if (fm.inherits_from) {
      for (const parent of fm.inherits_from) {
        if (!knownNames.has(parent)) {
          errors.push({
            severity: 'error',
            code: 'REFERENCE_BROKEN_INHERIT',
            message: `inherits_from references '${parent}' but no organon with that name found`,
            file,
          });
        }
      }
    }

    // related_domains → must resolve
    if (fm.related_domains) {
      for (const domain of fm.related_domains) {
        if (!knownNames.has(domain)) {
          errors.push({
            severity: 'error',
            code: 'REFERENCE_BROKEN_DOMAIN',
            message: `related_domains references '${domain}' but no organon with that name found`,
            file,
          });
        }
      }
    }

    // related_features → must resolve
    if (fm.related_features) {
      for (const feature of fm.related_features) {
        if (!knownNames.has(feature)) {
          errors.push({
            severity: 'error',
            code: 'REFERENCE_BROKEN_FEATURE',
            message: `related_features references '${feature}' but no organon with that name found`,
            file,
          });
        }
      }
    }
  }

  // 3. Check workflow file references
  const workflowFiles = await discoverWorkflowFiles(projectRoot, config, fs);

  for (const file of workflowFiles) {
    const absPath = joinPath(projectRoot, file);
    let content: string;
    try {
      content = await fs.readFile(absPath);
    } catch {
      continue;
    }

    const { frontmatter } = parseFrontmatter(content);
    if (!frontmatter) continue;

    // loads: paths → must exist on disk
    const loads = frontmatter['loads'] as string[] | undefined;
    if (loads && Array.isArray(loads)) {
      for (const loadPath of loads) {
        const absLoadPath = joinPath(projectRoot, loadPath);
        if (!await fs.exists(absLoadPath)) {
          errors.push({
            severity: 'error',
            code: 'REFERENCE_BROKEN_LOADS',
            message: `Workflow loads path '${loadPath}' does not exist on disk`,
            file,
          });
        }
      }
    }

    // protocol_file → must exist on disk
    const protocolFile = frontmatter['protocol_file'] as string | undefined;
    if (protocolFile) {
      const absProtoPath = joinPath(projectRoot, protocolFile);
      if (!await fs.exists(absProtoPath)) {
        errors.push({
          severity: 'error',
          code: 'REFERENCE_BROKEN_PROTOCOL_FILE',
          message: `Workflow protocol_file '${protocolFile}' does not exist on disk`,
          file,
        });
      }
    }
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
      for (const m of matches) allFiles.add(m);
    }
  }
  return [...allFiles].sort();
}

async function discoverWorkflowFiles(
  projectRoot: string,
  config: OrganonConfig,
  fs: FileSystem,
): Promise<string[]> {
  const files = new Set<string>();
  const paths = config.workflowPaths;
  const searchPaths = [
    paths.claudeCode,
    paths.cursor,
    paths.generic,
  ].filter((p): p is string => p !== undefined);

  for (const dir of searchPaths) {
    const fullDir = joinPath(projectRoot, dir);
    if (await fs.exists(fullDir)) {
      const matches = await fs.glob('**/*.md', { cwd: fullDir, ignore: [] });
      for (const m of matches) {
        files.add(joinPath(dir, m));
      }
    }
  }
  return [...files].sort();
}
