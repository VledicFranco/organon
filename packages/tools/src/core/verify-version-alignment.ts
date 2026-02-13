/**
 * Version alignment gate (advisory).
 *
 * Checks:
 * 1. organon.config.json methodology_version matches bundled METHODOLOGY_VERSION
 * 2. Both package.json versions match each other (monorepo sync check)
 *
 * @organon-invariant INV-TOOLS-2 every-command-has-tests
 */

import { joinPath } from './config.js';
import { METHODOLOGY_VERSION } from '../templates/config.js';
import type {
  DiagnosticMessage,
  FileSystem,
  OrganonConfig,
} from './types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VersionAlignmentResult {
  success: boolean;
  errors: DiagnosticMessage[];
  warnings: DiagnosticMessage[];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function verifyVersionAlignment(options: {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
}): Promise<VersionAlignmentResult> {
  const { projectRoot, fs } = options;
  const errors: DiagnosticMessage[] = [];
  const warnings: DiagnosticMessage[] = [];

  // 1. Check organon.config.json methodology_version vs bundled
  try {
    const configPath = joinPath(projectRoot, 'organon.config.json');
    const configContent = await fs.readFile(configPath);
    const config = JSON.parse(configContent);
    const configVersion = config.methodology_version;

    if (configVersion && configVersion !== METHODOLOGY_VERSION) {
      warnings.push({
        severity: 'warning',
        code: 'VERSION_METHODOLOGY_DRIFT',
        message: `organon.config.json methodology_version '${configVersion}' does not match CLI version '${METHODOLOGY_VERSION}'`,
        file: 'organon.config.json',
        suggestion: `Run 'organon upgrade' or update methodology_version to '${METHODOLOGY_VERSION}'`,
      });
    }
  } catch {
    // No config file — not an error for this gate
  }

  // 2. Check monorepo package.json version alignment
  try {
    const toolsPkg = JSON.parse(
      await fs.readFile(joinPath(projectRoot, 'packages/tools/package.json')),
    );
    const testingPkg = JSON.parse(
      await fs.readFile(joinPath(projectRoot, 'packages/testing/package.json')),
    );

    if (toolsPkg.version && testingPkg.version && toolsPkg.version !== testingPkg.version) {
      warnings.push({
        severity: 'warning',
        code: 'VERSION_PACKAGE_MISMATCH',
        message: `packages/tools (${toolsPkg.version}) and packages/testing (${testingPkg.version}) versions do not match`,
        suggestion: 'Ensure both packages have the same version before releasing',
      });
    }
  } catch {
    // Not a monorepo or packages not found — skip silently
  }

  return {
    success: true, // Advisory gate — always passes
    errors,
    warnings,
  };
}
