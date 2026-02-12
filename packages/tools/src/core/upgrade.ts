/**
 * Pure upgrade logic for `organon upgrade`.
 *
 * Detects version drift, computes upgrade plan, and applies changes.
 * Each function is pure, composable, and testable.
 *
 * @organon-invariant INV-TOOLS-5 idempotent-operations
 */

import type { FileSystem, DiagnosticMessage } from './types.js';
import { joinPath } from './config.js';
import {
  getSkillTemplates,
  METHODOLOGY_VERSION,
  CONFIG_TEMPLATE,
} from '../templates/index.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UpgradeOptions {
  projectRoot: string;
  skillsOnly: boolean;
  fs: FileSystem;
}

export interface VersionInfo {
  /** Current methodology version (null = pre-versioning or not found) */
  current: string | null;
  /** CLI's bundled methodology version */
  target: string;
  /** Type of drift */
  drift: 'none' | 'behind' | 'ahead' | 'unknown';
}

export interface UpgradeChange {
  type: 'skill' | 'config' | 'structure';
  action: 'create' | 'update';
  path: string;
  description: string;
}

export interface UpgradePlan {
  version: VersionInfo;
  changes: UpgradeChange[];
}

export interface UpgradeResult {
  success: boolean;
  plan: UpgradePlan;
  applied: string[];
  diagnostics: DiagnosticMessage[];
  /** Files to write: relative path → content */
  filesToWrite: Map<string, string>;
}

// ---------------------------------------------------------------------------
// Version detection
// ---------------------------------------------------------------------------

export async function detectVersion(
  projectRoot: string,
  fs: FileSystem,
): Promise<VersionInfo> {
  const target = METHODOLOGY_VERSION;

  // Try reading methodology_version from organon.config.json
  const configPath = joinPath(projectRoot, 'organon.config.json');
  let current: string | null = null;

  try {
    if (await fs.exists(configPath)) {
      const raw = await fs.readFile(configPath);
      const config = JSON.parse(raw);
      if (typeof config.methodology_version === 'string') {
        current = config.methodology_version;
      }
    }
  } catch {
    // Config doesn't exist or isn't valid JSON — treat as pre-versioning
  }

  let drift: VersionInfo['drift'];
  if (current === null) {
    drift = 'unknown';
  } else if (current === target) {
    drift = 'none';
  } else if (compareSemver(current, target) < 0) {
    drift = 'behind';
  } else {
    drift = 'ahead';
  }

  return { current, target, drift };
}

// ---------------------------------------------------------------------------
// Upgrade plan computation
// ---------------------------------------------------------------------------

export async function computeUpgradePlan(
  options: UpgradeOptions & { version: VersionInfo },
): Promise<UpgradePlan> {
  const { projectRoot, skillsOnly, fs, version } = options;
  const changes: UpgradeChange[] = [];

  // Skill changes
  const skillTemplates = getSkillTemplates();
  for (const [skillName, { path: relativePath, content }] of skillTemplates) {
    try {
      const fullPath = joinPath(projectRoot, relativePath);
      const exists = await fs.exists(fullPath);

      if (!exists) {
        changes.push({
          type: 'skill',
          action: 'create',
          path: relativePath,
          description: `New skill: ${skillName}`,
        });
      } else {
        // Compare content
        try {
          const existing = await fs.readFile(fullPath);
          if (normalizeContent(existing) !== normalizeContent(content)) {
            changes.push({
              type: 'skill',
              action: 'update',
              path: relativePath,
              description: `Updated: ${skillName}`,
            });
          }
        } catch {
          // Can't read — treat as needing update
          changes.push({
            type: 'skill',
            action: 'update',
            path: relativePath,
            description: `Updated: ${skillName} (could not read existing)`,
          });
        }
      }
    } catch {
      // Can't check existence — treat as needing create
      changes.push({
        type: 'skill',
        action: 'create',
        path: relativePath,
        description: `New skill: ${skillName} (could not check existing)`,
      });
    }
  }

  // Config changes (skip if skills-only)
  if (!skillsOnly) {
    try {
      const configPath = joinPath(projectRoot, 'organon.config.json');
      const configExists = await fs.exists(configPath);

      if (!configExists) {
        changes.push({
          type: 'config',
          action: 'create',
          path: 'organon.config.json',
          description: 'Create organon.config.json with methodology_version',
        });
      } else if (version.drift === 'behind' || version.drift === 'unknown') {
        changes.push({
          type: 'config',
          action: 'update',
          path: 'organon.config.json',
          description: `Update methodology_version: ${version.current ?? '(none)'} → ${version.target}`,
        });
      }
    } catch {
      // Can't check config — suggest creating it
      changes.push({
        type: 'config',
        action: 'create',
        path: 'organon.config.json',
        description: 'Create organon.config.json (could not check existing)',
      });
    }
  }

  return { version, changes };
}

// ---------------------------------------------------------------------------
// Apply upgrade
// ---------------------------------------------------------------------------

export async function applyUpgrade(
  plan: UpgradePlan,
  projectRoot: string,
  fs: FileSystem,
): Promise<UpgradeResult> {
  const applied: string[] = [];
  const diagnostics: DiagnosticMessage[] = [];

  // Collect files to write
  const filesToWrite = new Map<string, string>();
  const skillTemplates = getSkillTemplates();

  for (const change of plan.changes) {
    if (change.type === 'skill') {
      const skill = [...skillTemplates.values()].find((s) => s.path === change.path);
      if (skill) {
        filesToWrite.set(change.path, skill.content);
        applied.push(change.path);
      } else {
        diagnostics.push({
          severity: 'warning',
          code: 'UPGRADE_SKILL_TEMPLATE_NOT_FOUND',
          message: `Skill template not found for path: ${change.path}`,
          file: change.path,
        });
      }
    } else if (change.type === 'structure') {
      // Structure changes not yet implemented — report as diagnostic
      diagnostics.push({
        severity: 'warning',
        code: 'UPGRADE_STRUCTURE_NOT_SUPPORTED',
        message: `Structure change not applied (not yet supported): ${change.description}`,
        file: change.path,
      });
    } else if (change.type === 'config') {
      if (change.action === 'create') {
        filesToWrite.set('organon.config.json', CONFIG_TEMPLATE);
        applied.push('organon.config.json');
      } else if (change.action === 'update') {
        // Update methodology_version in existing config
        const configPath = joinPath(projectRoot, 'organon.config.json');
        try {
          const raw = await fs.readFile(configPath);
          const config = JSON.parse(raw);
          config.methodology_version = plan.version.target;
          filesToWrite.set('organon.config.json', JSON.stringify(config, null, 2) + '\n');
          applied.push('organon.config.json');
        } catch (err) {
          diagnostics.push({
            severity: 'error',
            code: 'UPGRADE_CONFIG_READ_ERROR',
            message: `Could not update config: ${err instanceof Error ? err.message : String(err)}`,
            file: 'organon.config.json',
          });
        }
      }
    }
  }

  return {
    success: diagnostics.filter((d) => d.severity === 'error').length === 0,
    plan,
    applied,
    diagnostics,
    filesToWrite,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalize content for comparison (trim, normalize line endings). */
function normalizeContent(content: string): string {
  return content.replace(/\r\n/g, '\n').trim();
}

/** Simple semver comparison. Returns -1, 0, or 1. Strips pre-release suffixes. */
function compareSemver(a: string, b: string): number {
  // Strip pre-release suffix (e.g., "0.3.0-beta.1" → "0.3.0")
  const clean = (v: string) => v.replace(/-.*$/, '');
  const pa = clean(a).split('.').map(Number);
  const pb = clean(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (Number.isNaN(va) || Number.isNaN(vb)) return 0;
    if (va < vb) return -1;
    if (va > vb) return 1;
  }
  return 0;
}
