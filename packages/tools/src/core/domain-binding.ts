/**
 * Gate: domain-binding
 *
 * Verifies that every stable domain/feature organon has at least one
 * implementation claim linking source code to the organon scope.
 *
 * Exempt: domains/features with status 'designing' or 'implementing'.
 * Also propagates orphaned @organon-implements diagnostics from the scanner.
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

export async function domainBindingGate(options: {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
}): Promise<VerifyGateResult> {
  const { projectRoot, config, fs } = options;

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

  // Propagate scanner diagnostics (orphaned annotations, unknown references)
  for (const diag of scan.diagnostics) {
    if (diag.severity === 'error') {
      errors.push(diag);
    } else {
      warnings.push(diag);
    }
  }

  // Collect unique scope keys from domain/feature organons.
  // Track exemption status (any file saying designing/implementing exempts the whole domain).
  // Use the first constraints file (ETHOS.md) as the representative for error reporting.
  const domainMap = new Map<
    string,
    { scope: string; name: string; exempt: boolean; representativeFile: string; hasImplementedBy: boolean }
  >();

  for (const file of organonFiles) {
    const fm = file.frontmatter;
    if (!fm) continue;
    if (fm.scope !== 'domain' && fm.scope !== 'feature') continue;
    if (!fm.name) continue;

    // Only constraints files (ETHOS.md) are authoritative domain documents.
    // Navigation (README.md) and rationale (PHILOSOPHY.md) may have different name values.
    if (fm.type !== 'constraints') continue;

    const scopePrefix = fm.scope === 'domain' ? 'domains' : 'features';
    const scopeKey = `${scopePrefix}/${fm.name}`;
    const status = fm.status ?? 'stable';
    const exempt = status === 'designing' || status === 'implementing';
    const hasImplementedBy =
      (fm.invariants ?? []).some((inv) => (inv.implemented_by?.length ?? 0) > 0) ||
      (fm.protocols ?? []).some((proto) => (proto.implemented_by?.length ?? 0) > 0);

    const existing = domainMap.get(scopeKey);
    if (!existing) {
      domainMap.set(scopeKey, {
        scope: fm.scope,
        name: fm.name,
        exempt,
        representativeFile: file.path,
        hasImplementedBy,
      });
    } else {
      // Update: a single exemption or implemented_by on any file covers the domain
      if (exempt) existing.exempt = true;
      if (hasImplementedBy) existing.hasImplementedBy = true;
      // Prefer constraints (ETHOS.md) as representative file
      if (fm.type === 'constraints') existing.representativeFile = file.path;
    }
  }

  for (const [scopeKey, domain] of domainMap) {
    if (domain.exempt) continue;
    const hasScopeClaim = (scan.byScope.get(scopeKey)?.length ?? 0) > 0;
    if (!hasScopeClaim && !domain.hasImplementedBy) {
      errors.push({
        severity: 'error',
        code: 'DOMAIN_BINDING_MISSING',
        message: `Stable ${domain.scope} '${domain.name}' has no implementation claims`,
        file: domain.representativeFile,
        suggestion: `In a source file add: // @organon-implements ${scopeKey}`,
      });
    }
  }

  return {
    gate: 'domain-binding',
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
