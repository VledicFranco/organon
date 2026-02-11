/**
 * organon generate — Auto-generate frontmatter from file content.
 */

import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { resolveConfig } from '../../core/config.js';
import { generateFrontmatter, serializeFrontmatter } from '../../core/generate-frontmatter.js';
import { NodeFileSystem } from '../../core/node-fs.js';

interface GenerateArgs {
  file: string;
  'project-root': string;
  config?: string;
  update?: boolean;
  type?: string;
  scope?: string;
}

export const generateCommand: CommandModule<{}, GenerateArgs> = {
  command: 'generate <file>',
  describe: 'Auto-generate frontmatter for an organon file',

  builder: (yargs) => {
    return yargs
      .positional('file', {
        describe: 'File to generate frontmatter for',
        type: 'string',
        demandOption: true,
      })
      .option('project-root', {
        describe: 'Project root directory',
        type: 'string',
        default: process.cwd(),
      })
      .option('config', {
        describe: 'Path to organon.config.json',
        type: 'string',
      })
      .option('update', {
        describe: 'Write generated frontmatter back to file',
        type: 'boolean',
        default: false,
      })
      .option('type', {
        describe: 'Override auto-detected type',
        type: 'string',
        choices: ['navigation', 'constraints', 'rationale', 'procedures', 'mapping'],
      })
      .option('scope', {
        describe: 'Override auto-detected scope',
        type: 'string',
        choices: ['product', 'domain', 'feature', 'component', 'meta', 'methodology'],
      })
      .example('$0 generate book-llms/ETHOS.md', 'Generate frontmatter (dry run)')
      .example('$0 generate book-llms/ETHOS.md --update', 'Generate and write to file');
  },

  handler: async (args) => {
    const fs = new NodeFileSystem();
    const config = await resolveConfig(args['project-root'], fs, args.config);

    const result = await generateFrontmatter({
      projectRoot: args['project-root'],
      config,
      fs,
      file: args.file,
      update: args.update,
      type: args.type as any,
      scope: args.scope as any,
    });

    console.log(chalk.blue('Organon Generate'));
    console.log();

    if (!result.success) {
      for (const e of result.errors) {
        console.log(chalk.red(`  ✗ [${e.code}] ${e.message}`));
      }
      process.exit(1);
    }

    const yaml = serializeFrontmatter(result.generated);
    console.log(chalk.dim('Generated frontmatter:'));
    console.log();
    console.log(yaml);

    if (args.update) {
      console.log(chalk.green(`✓ Updated ${args.file}`));
    } else {
      console.log(chalk.dim('(dry run — use --update to write)'));
    }
  },
};
