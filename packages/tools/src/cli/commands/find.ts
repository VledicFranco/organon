/**
 * organon find — Cross-domain discovery.
 */

import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { resolveConfig, resolveProjectRoot } from '../../core/config.js';
import { find } from '../../core/find.js';
import { NodeFileSystem } from '../../core/node-fs.js';

interface FindArgs {
  'project-root': string;
  config?: string;
  file?: string;
  scope?: string;
  type?: string;
  name?: string;
}

export const findCommand: CommandModule<{}, FindArgs> = {
  command: 'find',
  describe: 'Cross-domain discovery (find organons by file, scope, type, or name)',

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
      .option('file', {
        describe: 'Find organons governing this file path',
        type: 'string',
      })
      .option('scope', {
        describe: 'List organons at this scope level',
        type: 'string',
        choices: ['product', 'domain', 'feature', 'component', 'meta', 'methodology'],
      })
      .option('type', {
        describe: 'List organons of this type',
        type: 'string',
        choices: ['navigation', 'constraints', 'rationale', 'procedures', 'mapping'],
      })
      .option('name', {
        describe: 'Find organons matching this name (substring)',
        type: 'string',
      })
      .check((argv) => {
        if (!argv.file && !argv.scope && !argv.type && !argv.name) {
          throw new Error('Specify at least one: --file, --scope, --type, or --name');
        }
        return true;
      })
      .example('$0 find --file=src/domain/genesis/Store.ts', 'Find governing organons')
      .example('$0 find --scope=domain', 'List all domain organons')
      .example('$0 find --name=frontmatter', 'Search by name');
  },

  handler: async (args) => {
    const fs = new NodeFileSystem();
    const projectRoot = await resolveProjectRoot(args['project-root'], fs);
    const config = await resolveConfig(projectRoot, fs, args.config);

    const result = await find({
      projectRoot,
      config,
      fs,
      file: args.file,
      scope: args.scope as any,
      type: args.type as any,
      name: args.name,
    });

    console.log(chalk.blue('Organon Find'));
    console.log(chalk.dim(`  Mode: ${result.mode}`));
    console.log();

    if (result.matches.length === 0) {
      console.log(chalk.yellow('  No matches found'));
    } else {
      for (const match of result.matches) {
        console.log(`  ${chalk.green(match.file)}`);
        if (match.frontmatter) {
          console.log(chalk.dim(`    ${match.frontmatter.type} | ${match.frontmatter.scope} | ${match.frontmatter.name}`));
        }
        console.log(chalk.dim(`    ${match.relevance}`));
      }
    }

    console.log();
    console.log(chalk.dim(`${result.matches.length} match(es)`));
  },
};
