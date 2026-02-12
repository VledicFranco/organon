/**
 * organon verify — Run verification gates.
 */

import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { resolveConfig } from '../../core/config.js';
import { verify, getRegisteredGates } from '../../core/verify.js';
import { NodeFileSystem } from '../../core/node-fs.js';

interface VerifyArgs {
  'project-root': string;
  config?: string;
  gate?: string[];
}

export const verifyCommand: CommandModule<{}, VerifyArgs> = {
  command: 'verify',
  describe: 'Run verification gates (frontmatter, triplets, freshness)',

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
      .option('gate', {
        describe: 'Run specific gate(s)',
        type: 'array',
        string: true,
      })
      .example('$0 verify', 'Run all verification gates')
      .example('$0 verify --gate frontmatter', 'Run only frontmatter gate')
      .example('$0 verify --gate frontmatter triplets', 'Run specific gates');
  },

  handler: async (args) => {
    const fs = new NodeFileSystem();
    const config = await resolveConfig(args['project-root'], fs, args.config);

    const result = await verify({
      projectRoot: args['project-root'],
      config,
      fs,
      gates: args.gate,
    });

    console.log(chalk.blue('Organon Verify'));
    console.log();

    for (const gate of result.gates) {
      const icon = gate.passed ? chalk.green('✓') : chalk.red('✗');
      console.log(`  ${icon} ${gate.gate}`);

      for (const e of gate.errors) {
        const filePrefix = e.file ? `${e.file}: ` : '';
        console.log(chalk.red(`    ✗ [${e.code}] ${filePrefix}${e.message}`));
        if (e.suggestion) console.log(chalk.dim(`      → ${e.suggestion}`));
      }
      for (const w of gate.warnings) {
        const filePrefix = w.file ? `${w.file}: ` : '';
        console.log(chalk.yellow(`    ⚠ [${w.code}] ${filePrefix}${w.message}`));
      }
    }

    console.log();
    if (result.success) {
      console.log(chalk.green(`✓ All ${result.gates.length} gate(s) passed`));
    } else {
      const failed = result.gates.filter((g) => !g.passed).length;
      console.log(chalk.red(`✗ ${failed} gate(s) failed`));
      process.exit(1);
    }
  },
};
