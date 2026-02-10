/**
 * organon coverage — Invariant coverage analysis.
 */

import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { resolveConfig } from '../../core/config.js';
import { computeInvariantCoverage } from '../../core/invariant-coverage.js';
import { NodeFileSystem } from '../../core/node-fs.js';

interface CoverageArgs {
  'project-root': string;
  config?: string;
  json: boolean;
}

export const coverageCommand: CommandModule<{}, CoverageArgs> = {
  command: 'coverage',
  describe: 'Analyze invariant test coverage',

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
      .example('$0 coverage', 'Show invariant coverage report')
      .example('$0 coverage --json', 'Output coverage as JSON');
  },

  handler: async (args) => {
    const fs = new NodeFileSystem();
    const config = await resolveConfig(args['project-root'], fs, args.config);

    const result = await computeInvariantCoverage({
      projectRoot: args['project-root'],
      config,
      fs,
    });

    if (args.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(chalk.blue('Organon Invariant Coverage'));
      console.log();

      if (result.invariants.length === 0) {
        console.log(chalk.dim('  No invariants defined in frontmatter.'));
        console.log(chalk.dim('  Add an `invariants` array to ETHOS.md frontmatter.'));
        return;
      }

      // Table header
      console.log(
        `  ${chalk.dim('ID'.padEnd(18))}${chalk.dim('Name'.padEnd(30))}${chalk.dim('Status'.padEnd(16))}${chalk.dim('Tests')}`,
      );
      console.log(chalk.dim('  ' + '─'.repeat(74)));

      for (const inv of result.invariants) {
        const statusIcon =
          inv.status === 'covered' ? chalk.green('covered')
            : inv.status === 'judgment_call' ? chalk.yellow('judgment')
              : chalk.red('uncovered');
        const tests = inv.tests.length > 0 ? inv.tests.join(', ') : chalk.dim('none');
        console.log(
          `  ${inv.id.padEnd(18)}${inv.name.padEnd(30)}${statusIcon.padEnd(16)}${tests}`,
        );
      }

      console.log();
      const { summary } = result;
      const parts = [
        `${summary.covered}/${summary.total} covered`,
      ];
      if (summary.judgment_call > 0) {
        parts.push(`${summary.judgment_call} judgment calls`);
      }
      if (summary.uncovered > 0) {
        parts.push(`${summary.uncovered} uncovered`);
      }

      if (result.success) {
        console.log(chalk.green(`  ✓ ${parts.join(', ')}`));
      } else {
        console.log(chalk.red(`  ✗ ${parts.join(', ')}`));
        process.exit(1);
      }
    }
  },
};
