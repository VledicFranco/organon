/**
 * organon upgrade — Detect version drift and apply updates.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { NodeFileSystem } from '../../core/node-fs.js';
import {
  detectVersion,
  computeUpgradePlan,
  applyUpgrade,
} from '../../core/upgrade.js';

interface UpgradeArgs {
  'target-dir': string;
  apply: boolean;
  skills: boolean;
  format: string;
}

export const upgradeCommand: CommandModule<{}, UpgradeArgs> = {
  command: 'upgrade [target-dir]',
  describe: 'Detect version drift and upgrade project to latest methodology',

  builder: (yargs) => {
    return yargs
      .positional('target-dir', {
        describe: 'Target directory (defaults to current directory)',
        type: 'string',
        default: process.cwd(),
      })
      .option('apply', {
        describe: 'Apply all changes',
        type: 'boolean',
        default: false,
      })
      .option('skills', {
        describe: 'Upgrade skills only',
        type: 'boolean',
        default: false,
      })
      .option('format', {
        describe: 'Output format',
        type: 'string',
        choices: ['human', 'json'] as const,
        default: 'human',
      })
      .example('$0 upgrade', 'Show upgrade report (dry run)')
      .example('$0 upgrade --apply', 'Apply all upgrades')
      .example('$0 upgrade --apply --skills', 'Upgrade skills only');
  },

  handler: async (args) => {
    const targetDir = path.resolve(args['target-dir']);
    const nodeFs = new NodeFileSystem();
    const shouldApply = args.apply;

    // 1. Detect version
    const version = await detectVersion(targetDir, nodeFs);

    // 2. Compute plan
    const plan = await computeUpgradePlan({
      projectRoot: targetDir,
      skillsOnly: args.skills,
      fs: nodeFs,
      version,
    });

    // JSON output (dry-run only — plan without apply)
    if (args.format === 'json' && !shouldApply) {
      const jsonResult = {
        version: plan.version,
        changes: plan.changes,
        applied: false,
      };
      console.log(JSON.stringify(jsonResult, null, 2));
      return;
    }

    // Human output
    console.log(chalk.blue('Organon Upgrade'));
    console.log();

    // Version info
    const currentLabel = version.current ?? chalk.dim('(unversioned)');
    if (version.drift === 'none') {
      console.log(`  Methodology: ${chalk.green(version.target)} (up to date)`);
    } else {
      console.log(`  Methodology: ${currentLabel} → ${chalk.green(version.target)}`);
    }
    console.log();

    // Changes
    if (plan.changes.length === 0) {
      console.log(chalk.green('  Everything is up to date. No changes needed.'));
      return;
    }

    // Group by type
    const skillChanges = plan.changes.filter((c) => c.type === 'skill');
    const configChanges = plan.changes.filter((c) => c.type === 'config');
    const structureChanges = plan.changes.filter((c) => c.type === 'structure');

    if (skillChanges.length > 0) {
      console.log(`  Skills (${skillChanges.length} change${skillChanges.length > 1 ? 's' : ''}):`);
      for (const change of skillChanges) {
        const icon = change.action === 'create' ? chalk.green('[N]') : chalk.yellow('[U]');
        console.log(`    ${icon} ${change.description}`);
      }
      console.log();
    }

    if (configChanges.length > 0) {
      console.log(`  Config (${configChanges.length} change${configChanges.length > 1 ? 's' : ''}):`);
      for (const change of configChanges) {
        const icon = change.action === 'create' ? chalk.green('[N]') : chalk.yellow('[U]');
        console.log(`    ${icon} ${change.description}`);
      }
      console.log();
    }

    if (structureChanges.length > 0) {
      console.log(`  Structure (${structureChanges.length} change${structureChanges.length > 1 ? 's' : ''}):`);
      for (const change of structureChanges) {
        const icon = change.action === 'create' ? chalk.green('[N]') : chalk.yellow('[U]');
        console.log(`    ${icon} ${change.description}`);
      }
      console.log();
    }

    // Apply or show dry-run message
    if (!shouldApply) {
      console.log(chalk.yellow(`  ${plan.changes.length} change(s) available. Run with --apply to upgrade.`));
      return;
    }

    // Apply
    const result = await applyUpgrade(plan, targetDir, nodeFs);

    const writeErrors: string[] = [];
    for (const [relativePath, content] of result.filesToWrite) {
      try {
        const fullPath = path.join(targetDir, relativePath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, content, 'utf-8');
      } catch (err) {
        writeErrors.push(`${relativePath}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    const overallSuccess = result.success && writeErrors.length === 0;

    // JSON output for apply mode
    if (args.format === 'json') {
      const jsonResult = {
        success: overallSuccess,
        version: plan.version,
        applied: result.applied,
        writeErrors,
        diagnostics: result.diagnostics,
      };
      console.log(JSON.stringify(jsonResult, null, 2));
      if (!overallSuccess) process.exit(1);
      return;
    }

    // Human output: report write errors
    if (writeErrors.length > 0) {
      console.log(chalk.red('  Write errors:'));
      for (const e of writeErrors) {
        console.log(chalk.red(`    ${e}`));
      }
    }

    // Report diagnostics
    for (const diag of result.diagnostics) {
      if (diag.severity === 'error') {
        console.log(chalk.red(`  Error: ${diag.message}`));
      }
    }

    if (overallSuccess) {
      console.log(chalk.green(`  Applied ${result.applied.length} change(s).`));
    } else {
      console.log(chalk.red(`  Upgrade completed with errors.`));
      process.exit(1);
    }
  },
};
