/**
 * organon coverage — Four-section implementation coverage dashboard.
 *
 * Sections:
 *   1. Domain Binding   — which stable domains have implementation claims
 *   2. Invariant Implementation — % of invariants with @organon-implements
 *   3. Protocol Implementation  — % of protocols with @organon-implements
 *   4. Chain Completeness — declare + implement + verify traceability
 */

import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { resolveConfig, resolveProjectRoot, joinPath } from '../../core/config.js';
import { computeInvariantCoverage } from '../../core/invariant-coverage.js';
import { scanImplementationAnnotations, buildKnownIds } from '../../core/scan-implementation-annotations.js';
import { discoverOrganonFiles } from '../../core/discover.js';
import { parseFrontmatter } from '../../core/frontmatter-parser.js';
import { NodeFileSystem } from '../../core/node-fs.js';
import type { ParsedOrganonFile } from '../../core/types.js';

interface CoverageArgs {
  'project-root': string;
  config?: string;
  json: boolean;
}

export const coverageCommand: CommandModule<{}, CoverageArgs> = {
  command: 'coverage',
  describe: 'Show implementation coverage dashboard',

  builder: (yargs) => {
    return yargs
      .option('project-root', {
        describe: 'Project root directory',
        type: 'string',
        default: process.cwd(),
      })
      .option('config', {
        describe: 'Path to organon.config.json',
        type: 'string',
      })
      .option('json', {
        describe: 'Output machine-readable JSON',
        type: 'boolean',
        default: false,
      })
      .example('$0 coverage', 'Show full coverage dashboard')
      .example('$0 coverage --json', 'Output coverage as JSON');
  },

  handler: async (args) => {
    const fs = new NodeFileSystem();
    const projectRoot = await resolveProjectRoot(args['project-root'], fs);
    const config = await resolveConfig(projectRoot, fs, args.config);

    // Load all organon files once
    const organonFiles = await loadOrganonFiles(projectRoot, config, fs);

    // Build known IDs for the scanner
    const { invariantIds, protocolIds, scopes } = buildKnownIds(organonFiles);

    // Scan source files for @organon-implements
    const scan = await scanImplementationAnnotations({
      fileSystem: fs,
      projectRoot,
      config,
      knownInvariantIds: invariantIds,
      knownProtocolIds: protocolIds,
      knownScopes: scopes,
    });

    // Get test coverage (for chain completeness)
    const testCoverage = await computeInvariantCoverage({ projectRoot, config, fs });
    const testCoverageById = new Map(testCoverage.invariants.map((inv) => [inv.id, inv]));

    // Gather domain/feature organons — only constraints (ETHOS.md) files are authoritative for binding
    const domainOrganons = organonFiles.filter(
      (f) => f.frontmatter?.type === 'constraints' &&
        (f.frontmatter?.scope === 'domain' || f.frontmatter?.scope === 'feature'),
    );

    // Collect testable invariants (non-judgment_call, domain/feature, not designing)
    const testableInvariants: Array<{ id: string; name: string; file: string }> = [];
    for (const file of organonFiles) {
      const fm = file.frontmatter;
      if (!fm) continue;
      if (fm.scope !== 'domain' && fm.scope !== 'feature') continue;
      if ((fm.status ?? 'stable') === 'designing') continue;
      if (!fm.invariants) continue;
      for (const inv of fm.invariants) {
        if (!inv.judgment_call) {
          testableInvariants.push({ id: inv.id.toUpperCase(), name: inv.name, file: file.path });
        }
      }
    }

    // Collect relevant protocols (semi-automated/automated, domain/feature, not designing)
    const relevantProtocols: Array<{ id: string; name: string; file: string }> = [];
    for (const file of organonFiles) {
      const fm = file.frontmatter;
      if (!fm) continue;
      if (fm.scope !== 'domain' && fm.scope !== 'feature') continue;
      if ((fm.status ?? 'stable') === 'designing') continue;
      if (!fm.protocols) continue;
      for (const proto of fm.protocols) {
        if (proto.automation_tier === 'semi-automated' || proto.automation_tier === 'automated') {
          relevantProtocols.push({ id: proto.id.toUpperCase(), name: proto.name, file: file.path });
        }
      }
    }

    // Compute coverage stats
    const implThreshold = config.coverage?.invariantImplementation ?? 0;
    const protoThreshold = config.coverage?.protocolImplementation ?? 0;

    const implCovered = testableInvariants.filter(
      (inv) => (scan.byInvariant.get(inv.id)?.length ?? 0) > 0,
    ).length;
    const implTotal = testableInvariants.length;
    const implPct = implTotal > 0 ? Math.round((implCovered / implTotal) * 100) : 100;

    const protoCovered = relevantProtocols.filter(
      (p) => (scan.byProtocol.get(p.id)?.length ?? 0) > 0,
    ).length;
    const protoTotal = relevantProtocols.length;
    const protoPct = protoTotal > 0 ? Math.round((protoCovered / protoTotal) * 100) : 100;

    // Chain completeness
    let chainComplete = 0;
    let chainImplOnly = 0;
    let chainTestOnly = 0;
    let chainMissing = 0;
    for (const inv of testableInvariants) {
      const hasImpl = (scan.byInvariant.get(inv.id)?.length ?? 0) > 0;
      const testEntry = testCoverageById.get(inv.id);
      const hasTest = testEntry?.status === 'covered';
      if (hasImpl && hasTest) chainComplete++;
      else if (hasImpl && !hasTest) chainImplOnly++;
      else if (!hasImpl && hasTest) chainTestOnly++;
      else chainMissing++;
    }

    if (args.json) {
      const output = {
        domainBinding: domainOrganons.map((f) => {
          const fm = f.frontmatter!;
          const scopePrefix = fm.scope === 'domain' ? 'domains' : 'features';
          const scopeKey = `${scopePrefix}/${fm.name}`;
          const status = fm.status ?? 'stable';
          const claimCount = scan.byScope.get(scopeKey)?.length ?? 0;
          const exempt = status === 'designing' || status === 'implementing';
          return { scope: scopeKey, status, exempt, claimCount };
        }),
        invariantImplementation: { covered: implCovered, total: implTotal, pct: implPct, threshold: implThreshold },
        protocolImplementation: { covered: protoCovered, total: protoTotal, pct: protoPct, threshold: protoThreshold },
        chainCompleteness: { complete: chainComplete, implOnly: chainImplOnly, testOnly: chainTestOnly, missing: chainMissing },
      };
      console.log(JSON.stringify(output, null, 2));
      return;
    }

    // Human-readable dashboard
    console.log(chalk.blue('Organon Coverage'));
    console.log();

    // ── Section 1: Domain Binding ──────────────────────────────────────
    console.log(chalk.dim('  ── Domain Binding ') + chalk.dim('─'.repeat(45)));
    if (domainOrganons.length === 0) {
      console.log(chalk.dim('  No domain/feature organons found.'));
    } else {
      for (const file of domainOrganons) {
        const fm = file.frontmatter!;
        const scopePrefix = fm.scope === 'domain' ? 'domains' : 'features';
        const scopeKey = `${scopePrefix}/${fm.name ?? '?'}`;
        const status = fm.status ?? 'stable';
        const exempt = status === 'designing' || status === 'implementing';

        if (exempt) {
          const label = scopeKey.padEnd(28);
          console.log(`  ${chalk.yellow('~')} ${label} [${status} — exempt]`);
        } else {
          const claimCount = scan.byScope.get(scopeKey)?.length ?? 0;
          const hasFrontmatterImpl =
            (fm.invariants ?? []).some((inv) => (inv.implemented_by?.length ?? 0) > 0) ||
            (fm.protocols ?? []).some((proto) => (proto.implemented_by?.length ?? 0) > 0);
          const bound = claimCount > 0 || hasFrontmatterImpl;
          const label = scopeKey.padEnd(28);
          const claimsText = claimCount > 0
            ? `${claimCount} file${claimCount === 1 ? '' : 's'} claim`
            : hasFrontmatterImpl ? 'implemented_by set' : '(no claims)';
          if (bound) {
            console.log(`  ${chalk.green('✓')} ${label} ${chalk.dim(claimsText.padEnd(20))} [${status}]`);
          } else {
            console.log(`  ${chalk.red('✗')} ${label} ${chalk.red(claimsText.padEnd(20))} [${status}]`);
          }
        }
      }
    }

    console.log();

    // ── Section 2: Invariant Implementation ───────────────────────────
    const implThresholdLabel = `Threshold: ${implThreshold}% ${implPct >= implThreshold ? chalk.green('✓') : chalk.red('✗')}`;
    console.log(
      chalk.dim('  ── Invariant Implementation ') +
      chalk.dim('─'.repeat(4)) +
      ` ${implCovered}/${implTotal} (${implPct}%)  ${implThresholdLabel}`,
    );
    if (testableInvariants.length === 0) {
      console.log(chalk.dim('  No testable invariants in domain/feature organons.'));
    } else {
      for (const inv of testableInvariants) {
        const hasImpl = (scan.byInvariant.get(inv.id)?.length ?? 0) > 0;
        const icon = hasImpl ? chalk.green('●') : chalk.dim('○');
        console.log(`  ${icon} ${inv.id.padEnd(18)} ${inv.name}`);
      }
    }

    console.log();

    // ── Section 3: Protocol Implementation ────────────────────────────
    const protoThresholdLabel = `Threshold: ${protoThreshold}% ${protoPct >= protoThreshold ? chalk.green('✓') : chalk.red('✗')}`;
    console.log(
      chalk.dim('  ── Protocol Implementation ') +
      chalk.dim('─'.repeat(5)) +
      ` ${protoCovered}/${protoTotal} (${protoPct}%)  ${protoThresholdLabel}`,
    );
    if (relevantProtocols.length === 0) {
      console.log(chalk.dim('  No semi-automated/automated protocols in domain/feature organons.'));
    } else {
      for (const proto of relevantProtocols) {
        const hasClaim = (scan.byProtocol.get(proto.id)?.length ?? 0) > 0;
        const icon = hasClaim ? chalk.green('●') : chalk.dim('○');
        console.log(`  ${icon} ${proto.id.padEnd(18)} ${proto.name}`);
      }
    }

    console.log();

    // ── Section 4: Chain Completeness ─────────────────────────────────
    console.log(chalk.dim('  ── Chain Completeness ') + chalk.dim('─'.repeat(41)));
    console.log(`  ${chalk.green('●')} Complete    (declare + implement + verify)              ${chainComplete}`);
    console.log(`  ${chalk.cyan('◐')} Impl only   (has @organon-implements, no test)          ${chainImplOnly}`);
    console.log(`  ${chalk.yellow('◑')} Test only   (has @organon-invariant test, no impl)     ${chainTestOnly}`);
    console.log(`  ${chalk.dim('○')} Missing     (no impl claim, no test)                    ${chainMissing}`);
    console.log();
  },
};

async function loadOrganonFiles(
  projectRoot: string,
  config: import('../../core/types.js').OrganonConfig,
  fs: import('../../core/types.js').FileSystem,
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
