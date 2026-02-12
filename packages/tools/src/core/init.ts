/**
 * Pure init logic for `organon init`.
 *
 * Returns a file tree as Map<string, string> (path → content).
 * Never writes directly — the CLI handler applies the result.
 *
 * @organon-invariant INV-TOOLS-5 idempotent-operations
 */

import type { FileSystem, DiagnosticMessage } from './types.js';
import { joinPath } from './config.js';
import {
  getSkillTemplates,
  ETHOS_TEMPLATE,
  PHILOSOPHY_TEMPLATE,
  README_TEMPLATE,
  PROTOCOLS_TEMPLATE,
  CLAUDE_MD_TEMPLATE,
  OBSERVATIONS_README_TEMPLATE,
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
// Main
// ---------------------------------------------------------------------------

export async function init(options: InitOptions): Promise<InitResult> {
  const { projectRoot, installSkills, force, fs } = options;

  const files = new Map<string, string>();
  const skipped: string[] = [];
  const diagnostics: DiagnosticMessage[] = [];

  // 1. Generate organon scaffold files
  const organonFiles: Array<[string, string]> = [
    ['organon.config.json', CONFIG_TEMPLATE],
    ['CLAUDE.md', CLAUDE_MD_TEMPLATE],
    ['organon/ETHOS.md', ETHOS_TEMPLATE],
    ['organon/PHILOSOPHY.md', PHILOSOPHY_TEMPLATE],
    ['organon/README.md', README_TEMPLATE],
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

  // 3. Summary diagnostic
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
