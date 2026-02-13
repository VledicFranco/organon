/**
 * organon health — Dashboard showing coverage, validation, tokens, freshness.
 */

import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { resolveConfig, resolveProjectRoot } from '../../core/config.js';
import { health } from '../../core/health.js';
import { NodeFileSystem } from '../../core/node-fs.js';

interface HealthArgs {
  'project-root': string;
  config?: string;
  detailed?: boolean;
  'fix-suggestions'?: boolean;
}

export const healthCommand: CommandModule<{}, HealthArgs> = {
  command: 'health',
  describe: 'Show organon health dashboard (coverage, validation, tokens, freshness)',

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
      .option('detailed', {
        describe: 'Show detailed issue breakdown',
        type: 'boolean',
        default: false,
      })
      .option('fix-suggestions', {
        describe: 'Include fix suggestions for issues',
        type: 'boolean',
        default: false,
      })
      .example('$0 health', 'Quick health summary')
      .example('$0 health --detailed --fix-suggestions', 'Detailed report with fixes');
  },

  handler: async (args) => {
    const fs = new NodeFileSystem();
    const projectRoot = await resolveProjectRoot(args['project-root'], fs);
    const config = await resolveConfig(projectRoot, fs, args.config);

    const result = await health({
      projectRoot,
      config,
      fs,
      fixSuggestions: args['fix-suggestions'],
    });

    const scoreColor = result.score >= 80 ? chalk.green : result.score >= 50 ? chalk.yellow : chalk.red;

    console.log(chalk.blue('Organon Health Dashboard'));
    console.log();
    console.log(`  Score: ${scoreColor(`${result.score}/100`)}`);
    console.log();

    // Coverage
    console.log(chalk.dim('  Coverage:'));
    console.log(`    ${result.coverage.withFrontmatter}/${result.coverage.totalFiles} files have frontmatter (${result.coverage.percentage}%)`);

    // Validation
    console.log(chalk.dim('  Validation:'));
    console.log(`    ${chalk.green(`${result.validation.passing} passing`)}  ${result.validation.failing > 0 ? chalk.red(`${result.validation.failing} failing`) : ''}  ${result.validation.warnings > 0 ? chalk.yellow(`${result.validation.warnings} warnings`) : ''}`);

    // Tokens
    console.log(chalk.dim('  Tokens:'));
    console.log(`    Total: ${result.tokens.total.toLocaleString()} | Average: ${result.tokens.average.toLocaleString()}`);
    if (result.tokens.largest.file) {
      console.log(`    Largest: ${result.tokens.largest.file} (${result.tokens.largest.tokens.toLocaleString()})`);
    }

    // Freshness
    console.log(chalk.dim('  Freshness:'));
    console.log(`    ${chalk.green(`${result.freshness.fresh} fresh`)}  ${result.freshness.stale > 0 ? chalk.yellow(`${result.freshness.stale} stale`) : ''}  ${result.freshness.unknown > 0 ? chalk.dim(`${result.freshness.unknown} unknown`) : ''}`);

    // Issues (detailed mode)
    if (args.detailed && result.issues.length > 0) {
      console.log();
      console.log(chalk.dim('  Issues:'));
      for (const issue of result.issues) {
        const prefix = issue.severity === 'error' ? chalk.red('    ✗') : chalk.yellow('    ⚠');
        console.log(`${prefix} [${issue.code}] ${issue.message}`);
        if (issue.suggestion) {
          console.log(chalk.dim(`      → ${issue.suggestion}`));
        }
      }
    }

    console.log();
  },
};
