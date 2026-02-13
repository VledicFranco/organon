/**
 * Pure init logic for `organon init`.
 *
 * Returns a file tree as Map<string, string> (path → content).
 * Never writes directly — the CLI handler applies the result.
 *
 * @organon-invariant INV-TOOLS-5 idempotent-operations
 */

import type { FileSystem, DiagnosticMessage } from './types.js';
import { joinPath, baseName } from './config.js';
import { parseFrontmatter } from './frontmatter-parser.js';
import {
  getSkillTemplates,
  ethosTemplate,
  philosophyTemplate,
  README_TEMPLATE,
  PROTOCOLS_TEMPLATE,
  CLAUDE_MD_TEMPLATE,
  OBSERVATIONS_README_TEMPLATE,
  PRIMER_TEMPLATE,
  METHODOLOGY_REFERENCE_TEMPLATE,
  CONFIG_TEMPLATE,
} from '../templates/index.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InitOptions {
  projectRoot: string;
  installSkills: boolean;
  force: boolean;
  fs: FileSystem;
  /** Override auto-detected project name. */
  projectName?: string;
}

export interface InitResult {
  success: boolean;
  /** Files to create: relative path → content */
  files: Map<string, string>;
  /** Files skipped because they already exist (and --force not set) */
  skipped: string[];
  diagnostics: DiagnosticMessage[];
}

// ---------------------------------------------------------------------------
// Project name detection
// ---------------------------------------------------------------------------

/**
 * Detect project name from package.json, Cargo.toml, or directory basename.
 */
export async function detectProjectName(
  projectRoot: string,
  fs: FileSystem,
): Promise<string> {
  // 1. Try package.json
  try {
    const packageJson = await fs.readFile(joinPath(projectRoot, 'package.json'));
    const parsed = JSON.parse(packageJson);
    if (parsed.name && typeof parsed.name === 'string') {
      // Strip npm scope (e.g., @org/name → name)
      const name = parsed.name.replace(/^@[^/]+\//, '');
      if (name) return toKebabCase(name);
    }
  } catch {
    // package.json not found or unparseable
  }

  // 2. Try Cargo.toml
  try {
    const cargoToml = await fs.readFile(joinPath(projectRoot, 'Cargo.toml'));
    const nameMatch = cargoToml.match(/^\s*name\s*=\s*"([^"]+)"/m);
    if (nameMatch?.[1]) {
      return toKebabCase(nameMatch[1]);
    }
  } catch {
    // Cargo.toml not found
  }

  // 3. Fallback: directory basename
  const dirName = baseName(projectRoot.replace(/[/\\]$/, ''));
  return toKebabCase(dirName || 'my-project');
}

function toKebabCase(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'my-project';
}

// ---------------------------------------------------------------------------
// Unbound skill detection
// ---------------------------------------------------------------------------

/**
 * Scan workflow paths for .md files without `protocol_id` in frontmatter.
 * Returns info diagnostics for each unbound skill found.
 */
async function detectUnboundSkills(
  projectRoot: string,
  fs: FileSystem,
): Promise<DiagnosticMessage[]> {
  const diagnostics: DiagnosticMessage[] = [];

  const workflowDirs = [
    '.claude/skills',
    '.cursor/rules',
    'organon/workflows',
  ];

  for (const dir of workflowDirs) {
    const fullDir = joinPath(projectRoot, dir);
    if (!await fs.exists(fullDir)) continue;

    let files: string[];
    try {
      files = await fs.glob('**/*.md', { cwd: fullDir, ignore: [] });
    } catch {
      continue;
    }

    for (const file of files) {
      const fullPath = joinPath(fullDir, file);
      try {
        const content = await fs.readFile(fullPath);
        const { frontmatter } = parseFrontmatter(content);
        if (!frontmatter?.['protocol_id']) {
          diagnostics.push({
            severity: 'info',
            code: 'INIT_SKILL_NO_BINDING',
            message: `Skill '${joinPath(dir, file)}' has no protocol_id binding — consider adding protocol_id and protocol_file to its frontmatter`,
            file: joinPath(dir, file),
          });
        }
      } catch {
        // Skip files we can't read
      }
    }
  }

  return diagnostics;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function init(options: InitOptions): Promise<InitResult> {
  const { projectRoot, installSkills, force, fs } = options;

  const files = new Map<string, string>();
  const skipped: string[] = [];
  const diagnostics: DiagnosticMessage[] = [];

  // Detect project name
  const projectName = options.projectName ?? await detectProjectName(projectRoot, fs);

  // 1. Generate organon scaffold files (with parameterized templates)
  const organonFiles: Array<[string, string]> = [
    ['organon.config.json', CONFIG_TEMPLATE],
    ['CLAUDE.md', CLAUDE_MD_TEMPLATE],
    ['organon/ETHOS.md', ethosTemplate(projectName)],
    ['organon/PHILOSOPHY.md', philosophyTemplate(projectName)],
    ['organon/README.md', README_TEMPLATE],
    ['organon/PRIMER.md', PRIMER_TEMPLATE],
    ['organon/methodology-reference.md', METHODOLOGY_REFERENCE_TEMPLATE],
    ['organon/protocols/PROTOCOLS.md', PROTOCOLS_TEMPLATE],
    ['organon/observations/README.md', OBSERVATIONS_README_TEMPLATE],
  ];

  for (const [relativePath, content] of organonFiles) {
    try {
      const fullPath = joinPath(projectRoot, relativePath);
      const exists = await fs.exists(fullPath);

      if (exists && !force) {
        skipped.push(relativePath);
        diagnostics.push({
          severity: 'info',
          code: 'INIT_FILE_EXISTS',
          message: `Skipped (already exists): ${relativePath}`,
          file: relativePath,
        });
      } else {
        files.set(relativePath, content);
      }
    } catch (err) {
      diagnostics.push({
        severity: 'error',
        code: 'INIT_CHECK_ERROR',
        message: `Could not check ${relativePath}: ${err instanceof Error ? err.message : String(err)}`,
        file: relativePath,
      });
    }
  }

  // 2. Generate skill files (if requested)
  if (installSkills) {
    const skillTemplates = getSkillTemplates();
    for (const [, { path: relativePath, content }] of skillTemplates) {
      try {
        const fullPath = joinPath(projectRoot, relativePath);
        const exists = await fs.exists(fullPath);

        if (exists && !force) {
          skipped.push(relativePath);
          diagnostics.push({
            severity: 'info',
            code: 'INIT_SKILL_EXISTS',
            message: `Skipped skill (already exists): ${relativePath}`,
            file: relativePath,
          });
        } else {
          files.set(relativePath, content);
        }
      } catch (err) {
        diagnostics.push({
          severity: 'error',
          code: 'INIT_CHECK_ERROR',
          message: `Could not check ${relativePath}: ${err instanceof Error ? err.message : String(err)}`,
          file: relativePath,
        });
      }
    }
  }

  // 3. Detect pre-existing unbound skills (A3)
  const unboundDiags = await detectUnboundSkills(projectRoot, fs);
  diagnostics.push(...unboundDiags);

  // 4. Summary diagnostic
  if (files.size === 0 && skipped.length > 0) {
    diagnostics.push({
      severity: 'info',
      code: 'INIT_ALREADY_INITIALIZED',
      message: `Project already initialized. All ${skipped.length} files exist. Use --force to overwrite.`,
    });
  }

  return {
    success: diagnostics.filter((d) => d.severity === 'error').length === 0,
    files,
    skipped,
    diagnostics,
  };
}
