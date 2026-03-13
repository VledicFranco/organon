/**
 * Gate: protocol-coverage
 *
 * Checks that a minimum percentage of semi-automated and automated protocols
 * have at least one @organon-implements source annotation.
 *
 * Denominator: protocols with automation_tier in {semi-automated, automated}
 * in domain/feature scope organons, excluding those in organons with status
 * 'designing'.
 *
 * Threshold comes from config.coverage.protocolImplementation (default: 0).
 * Threshold of 0 means the gate always passes (opt-in coverage enforcement).
 * Per-protocol warnings are always emitted regardless of threshold.
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

export async function protocolCoverageGate(options: {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
}): Promise<VerifyGateResult> {
  const { projectRoot, config, fs } = options;
  const threshold = config.coverage?.protocolImplementation ?? 0;

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

  // Collect relevant protocols: semi-automated/automated, domain/feature scope, not designing
  const relevant: Array<{ id: string; name: string; file: string }> = [];
  for (const file of organonFiles) {
    const fm = file.frontmatter;
    if (!fm) continue;
    if (fm.scope !== 'domain' && fm.scope !== 'feature') continue;
    if ((fm.status ?? 'stable') === 'designing') continue;
    if (!fm.protocols) continue;
    for (const proto of fm.protocols) {
      if (proto.automation_tier === 'semi-automated' || proto.automation_tier === 'automated') {
        relevant.push({ id: proto.id.toUpperCase(), name: proto.name, file: file.path });
      }
    }
  }

  const total = relevant.length;
  if (total === 0) {
    return { gate: 'protocol-coverage', passed: true, errors, warnings };
  }

  let covered = 0;
  for (const proto of relevant) {
    if ((scan.byProtocol.get(proto.id)?.length ?? 0) > 0) {
      covered++;
    } else {
      // Always emit per-protocol warnings (makes report useful even when gate passes)
      warnings.push({
        severity: 'warning',
        code: 'PROTO_PROTOCOL_UNCOVERED',
        message: `${proto.id} (${proto.name}) has no @organon-implements source claim`,
        file: proto.file,
      });
    }
  }

  const pct = Math.round((covered / total) * 100);

  if (pct < threshold) {
    errors.push({
      severity: 'error',
      code: 'PROTO_COVERAGE_BELOW_THRESHOLD',
      message: `Protocol implementation coverage is ${pct}% (${covered}/${total}), below threshold of ${threshold}%`,
      suggestion: `Add @organon-implements PROTO-X-N annotations to source files, or lower coverage.protocolImplementation in organon.config.json`,
    });
  }

  return {
    gate: 'protocol-coverage',
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
