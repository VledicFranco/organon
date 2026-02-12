/**
 * organon init — Bootstrap a new project with Organon structure.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { init } from '../../core/init.js';
import { NodeFileSystem } from '../../core/node-fs.js';

interface InitArgs {
  'target-dir': string;
  skills: boolean;
  force: boolean;
  'dry-run': boolean;
  format: string;
}

export const initCommand: CommandModule<{}, InitArgs> = {
  command: 'init [target-dir]',
  describe: 'Bootstrap a new project with Organon structure and skills',

  builder: (yargs) => {
    return yargs
      .positional('target-dir', {
        describe: 'Target directory (defaults to current directory)',
        type: 'string',
        default: process.cwd(),
      })
      .option('skills', {
        describe: 'Install Claude Code skills',
        type: 'boolean',
        default: true,
      })
      .option('force', {
        describe: 'Overwrite existing files',
        type: 'boolean',
        default: false,
      })
      .option('dry-run', {
        describe: 'Show what would be created without writing',
        type: 'boolean',
        default: false,
      })
      .option('format', {
        describe: 'Output format',
        type: 'string',
        choices: ['human', 'json'] as const,
        default: 'human',
      })
      .example('$0 init', 'Initialize current directory')
      .example('$0 init ./my-project', 'Initialize a specific directory')
      .example('$0 init --dry-run', 'Preview what would be created')
      .example('$0 init --no-skills', 'Skip skill installation');
  },

  handler: async (args) => {
    const targetDir = path.resolve(args['target-dir']);
    const nodeFs = new NodeFileSystem();

    const result = await init({
      projectRoot: targetDir,
      installSkills: args.skills,
      force: args.force,
      fs: nodeFs,
    });

    // JSON output
    if (args.format === 'json') {
      const jsonResult = {
        success: result.success,
        targetDir,
        dryRun: args['dry-run'],
        files: [...result.files.keys()],
        skipped: result.skipped,
        diagnostics: result.diagnostics,
      };
      console.log(JSON.stringify(jsonResult, null, 2));
      if (!result.success) process.exit(1);
      return;
    }

    // Human output
    console.log(chalk.blue('Organon Init'));
    console.log();

    if (args['dry-run']) {
      console.log(chalk.yellow('Dry run — no files will be written'));
      console.log();
    }

    // Show files to create
    if (result.files.size > 0) {
      console.log(chalk.green(args['dry-run'] ? 'Files to create:' : 'Files created:'));
      for (const filePath of result.files.keys()) {
        console.log(`  ${chalk.green('+')} ${filePath}`);
      }
    }

    // Show skipped files
    if (result.skipped.length > 0) {
      console.log();
      console.log(chalk.dim(`Skipped (already exist):`));
      for (const filePath of result.skipped) {
        console.log(`  ${chalk.dim('-')} ${filePath}`);
      }
    }

    // Actually write files (unless dry-run)
    if (!args['dry-run'] && result.files.size > 0) {
      const writeErrors: string[] = [];
      for (const [relativePath, content] of result.files) {
        try {
          const fullPath = path.join(targetDir, relativePath);
          await fs.mkdir(path.dirname(fullPath), { recursive: true });
          await fs.writeFile(fullPath, content, 'utf-8');
        } catch (err) {
          writeErrors.push(`${relativePath}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
      if (writeErrors.length > 0) {
        console.log();
        console.log(chalk.red('Write errors:'));
        for (const e of writeErrors) {
          console.log(chalk.red(`  ${e}`));
        }
        process.exit(1);
      }
    }

    // Summary
    console.log();
    if (result.files.size === 0) {
      console.log(chalk.dim('No files to create. Project is already initialized.'));
      console.log(chalk.dim('Use --force to overwrite existing files.'));
    } else if (args['dry-run']) {
      console.log(chalk.yellow(`Would create ${result.files.size} file(s). Run without --dry-run to apply.`));
    } else {
      console.log(chalk.green(`Created ${result.files.size} file(s).`));
      console.log();
      console.log(chalk.blue('Next steps:'));
      console.log(`  1. Edit ${chalk.bold('organon/ETHOS.md')} — define your project's identity and constraints`);
      console.log(`  2. Edit ${chalk.bold('organon/PHILOSOPHY.md')} — document your design rationale`);
      console.log(`  3. Run ${chalk.bold('organon verify')} — check project integrity`);
    }
  },
};
