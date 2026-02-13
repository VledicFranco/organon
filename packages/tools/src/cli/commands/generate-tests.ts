/**
 * organon generate-tests — Generate test scaffolds for uncovered invariants.
 */

import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { resolveConfig, resolveProjectRoot } from '../../core/config.js';
import { generateTests } from '../../core/generate-tests.js';
import { NodeFileSystem } from '../../core/node-fs.js';

interface GenerateTestsArgs {
  'project-root': string;
  config?: string;
  invariant?: string[];
  'out-dir'?: string;
  json: boolean;
}

export const generateTestsCommand: CommandModule<{}, GenerateTestsArgs> = {
  command: 'generate-tests',
  describe: 'Generate test scaffolds for uncovered invariants',

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
      .option('invariant', {
        describe: 'Generate for specific invariant ID(s)',
        type: 'array',
        string: true,
      })
      .option('out-dir', {
        describe: 'Directory to write generated test files',
        type: 'string',
      })
      .option('json', {
        describe: 'Output machine-readable JSON',
        type: 'boolean',
        default: false,
      })
      .example('$0 generate-tests', 'Generate scaffolds for all uncovered invariants')
      .example('$0 generate-tests --invariant INV-FOO-1', 'Generate for specific invariant')
      .example('$0 generate-tests --json', 'Output as JSON');
  },

  handler: async (args) => {
    const fs = new NodeFileSystem();
    const projectRoot = await resolveProjectRoot(args['project-root'], fs);
    const config = await resolveConfig(projectRoot, fs, args.config);

    const result = await generateTests({
      projectRoot,
      config,
      fs,
      invariantIds: args.invariant,
      outDir: args['out-dir'],
    });

    if (args.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log(chalk.blue('Organon Generate Tests'));
    console.log();

    if (result.generated.length === 0 && result.alreadyCovered.length === 0 && result.judgmentCalls.length === 0) {
      console.log(chalk.dim('  No invariants found. Add invariants to ETHOS.md frontmatter.'));
      return;
    }

    // Show already covered
    if (result.alreadyCovered.length > 0) {
      console.log(chalk.green(`  ✓ ${result.alreadyCovered.length} invariant(s) already covered`));
    }

    // Show judgment calls
    if (result.judgmentCalls.length > 0) {
      console.log(chalk.yellow(`  ○ ${result.judgmentCalls.length} judgment call(s) (no test needed)`));
    }

    // Show generated scaffolds
    if (result.generated.length > 0) {
      console.log(chalk.cyan(`  ⚡ ${result.generated.length} test scaffold(s) generated:`));
      console.log();

      for (const test of result.generated) {
        console.log(chalk.dim(`  ─── ${test.invariant.id}: ${test.invariant.name} ───`));
        console.log(chalk.dim(`  Suggested assertion: ${test.assertion}`));
        console.log(chalk.dim(`  Suggested filename: ${test.filename}`));
        console.log();
        console.log(test.code);
        console.log();
      }
    } else {
      console.log();
      console.log(chalk.green('  All invariants are covered!'));
    }
  },
};
