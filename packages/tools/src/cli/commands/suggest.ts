/**
 * organon suggest — Suggest automation tier upgrades for protocols.
 */

import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { resolveConfig, resolveProjectRoot } from '../../core/config.js';
import { suggestTools } from '../../core/suggest-tools.js';
import { NodeFileSystem } from '../../core/node-fs.js';

interface SuggestArgs {
  'project-root': string;
  config?: string;
  format: string;
}

export const suggestCommand: CommandModule<{}, SuggestArgs> = {
  command: 'suggest',
  describe: 'Suggest automation tier upgrades for manual protocols',

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
      .option('format', {
        describe: 'Output format',
        type: 'string',
        choices: ['human', 'json'] as const,
        default: 'human',
      })
      .example('$0 suggest', 'Show automation suggestions')
      .example('$0 suggest --format json', 'Output as JSON');
  },

  handler: async (args) => {
    const fs = new NodeFileSystem();
    const projectRoot = await resolveProjectRoot(args['project-root'], fs);
    const config = await resolveConfig(projectRoot, fs, args.config);

    const result = await suggestTools({ projectRoot, config, fs });

    if (args.format === 'json') {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log(chalk.blue('Organon Suggest'));
    console.log();

    if (result.suggestions.length === 0) {
      console.log(chalk.dim('  No automation upgrade suggestions found.'));
      console.log(chalk.dim('  All protocols are at their recommended automation tier.'));
    } else {
      for (const s of result.suggestions) {
        const arrow = chalk.yellow(`${s.currentTier} → ${s.suggestedTier}`);
        console.log(`  ${chalk.green(s.protocolId)} (${s.protocolFile})`);
        console.log(`    ${arrow}`);
        console.log(chalk.dim(`    ${s.reason}`));
        console.log();
      }
      console.log(chalk.dim(`${result.suggestions.length} suggestion(s)`));
    }
  },
};
