/**
 * Pure release plan computation.
 *
 * Computes version bump and lists files to update.
 * Never writes files or runs git commands — the CLI handler does that.
 *
 * @organon-invariant INV-TOOLS-2 every-command-has-tests
 */

import type { FileSystem } from './types.js';
import { joinPath } from './config.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BumpLevel = 'patch' | 'minor' | 'major';

export interface ReleasePlan {
  currentVersion: string;
  nextVersion: string;
  bump: BumpLevel;
  filesToUpdate: FileUpdate[];
}

export interface FileUpdate {
  file: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * Compute the release plan: current version, next version, files to update.
 * Pure function — no side effects.
 */
export async function computeReleasePlan(
  projectRoot: string,
  bump: BumpLevel,
  fs: FileSystem,
): Promise<ReleasePlan> {
  // Read current version from packages/tools/package.json
  const toolsPkgPath = joinPath(projectRoot, 'packages/tools/package.json');
  const toolsPkgContent = await fs.readFile(toolsPkgPath);
  const toolsPkg = JSON.parse(toolsPkgContent);
  const currentVersion = toolsPkg.version;

  if (!currentVersion) {
    throw new Error('Could not read current version from packages/tools/package.json');
  }

  const nextVersion = computeNextVersion(currentVersion, bump);

  const filesToUpdate: FileUpdate[] = [
    { file: 'packages/tools/package.json', description: `version → ${nextVersion}` },
    { file: 'packages/testing/package.json', description: `version → ${nextVersion}` },
    { file: 'organon.config.json', description: `methodology_version → ${nextVersion}` },
    { file: 'packages/tools/src/templates/config.ts', description: `METHODOLOGY_VERSION → ${nextVersion}` },
    { file: 'CHANGELOG.md', description: `Add [${nextVersion}] section` },
  ];

  return {
    currentVersion,
    nextVersion,
    bump,
    filesToUpdate,
  };
}

/**
 * Compute next version from current version and bump level.
 */
export function computeNextVersion(currentVersion: string, bump: BumpLevel): string {
  const parts = currentVersion.split('.').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid version format: '${currentVersion}'. Expected X.Y.Z`);
  }

  const [major, minor, patch] = parts;
  switch (bump) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}
