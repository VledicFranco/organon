/**
 * Gate: implementation-coverage
 *
 * Checks that a minimum percentage of testable invariants have at least one
 * @organon-implements source annotation.
 *
 * Denominator: non-judgment_call invariants in domain/feature scope organons,
 * excluding those in organons with status 'designing'.
 *
 * Threshold comes from config.coverage.invariantImplementation (default: 0).
 * Threshold of 0 means the gate always passes (opt-in coverage enforcement).
 * Per-invariant warnings are always emitted regardless of threshold.
 */

import { parseFrontmatter } from './frontmatter-parser.js';
import { joinPath } from './config.js';
import { discoverOrganonFiles } from './discover.js';
import {
  scanImplementationAnnotations,
  buildKnownIds,
} from './scan-implementation-annotations.js';
import type {
  DiagnosticMessage,
  FileSystem,
  OrganonConfig,
  ParsedOrganonFile,
  VerifyGateResult,
} from './types.js';

export async function implementationCoverageGate(options: {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
}): Promise<VerifyGateResult> {
  const { projectRoot, config, fs } = options;
  const threshold = config.coverage?.invariantImplementation ?? 0;

  const organonFiles = await loadOrganonFiles(projectRoot, config, fs);
  const { invariantIds, protocolIds, scopes } = buildKnownIds(organonFiles);

  const scan = await scanImplementationAnnotations({
    fileSystem: fs,
    projectRoot,
    config,
    knownInvariantIds: invariantIds,
    knownProtocolIds: protocolIds,
    knownScopes: scopes,
  });

  const errors: DiagnosticMessage[] = [];
  const warnings: DiagnosticMessage[] = [];

  // Collect testable invariants: non-judgment_call, domain/feature scope, not designing
  const testable: Array<{ id: string; name: string; file: string }> = [];
  for (const file of organonFiles) {
    const fm = file.frontmatter;
    if (!fm) continue;
    if (fm.scope !== 'domain' && fm.scope !== 'feature') continue;
    if ((fm.status ?? 'stable') === 'designing') continue;
    if (!fm.invariants) continue;
    for (const inv of fm.invariants) {
      if (!inv.judgment_call) {
        testable.push({ id: inv.id.toUpperCase(), name: inv.name, file: file.path });
      }
    }
  }

  const total = testable.length;
  if (total === 0) {
    return { gate: 'implementation-coverage', passed: true, errors, warnings };
  }

  let covered = 0;
  for (const inv of testable) {
    if ((scan.byInvariant.get(inv.id)?.length ?? 0) > 0) {
      covered++;
    } else {
      // Always emit per-invariant warnings (makes report useful even when gate passes)
      warnings.push({
        severity: 'warning',
        code: 'IMPL_INVARIANT_UNCOVERED',
        message: `${inv.id} (${inv.name}) has no @organon-implements source claim`,
        file: inv.file,
      });
    }
  }

  const pct = Math.round((covered / total) * 100);

  if (pct < threshold) {
    errors.push({
      severity: 'error',
      code: 'IMPL_COVERAGE_BELOW_THRESHOLD',
      message: `Invariant implementation coverage is ${pct}% (${covered}/${total}), below threshold of ${threshold}%`,
      suggestion: `Add @organon-implements INV-X-N annotations to source files, or lower coverage.invariantImplementation in organon.config.json`,
    });
  }

  return {
    gate: 'implementation-coverage',
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

async function loadOrganonFiles(
  projectRoot: string,
  config: OrganonConfig,
  fs: FileSystem,
): Promise<ParsedOrganonFile[]> {
  const filePaths = await discoverOrganonFiles(projectRoot, config, fs);
  const files: ParsedOrganonFile[] = [];
  for (const filePath of filePaths) {
    try {
      const content = await fs.readFile(joinPath(projectRoot, filePath));
      const { frontmatter, body } = parseFrontmatter(content);
      files.push({ path: filePath, frontmatter, rawFrontmatter: '', body, content });
    } catch {
      // Skip unreadable files
    }
  }
  return files;
}
