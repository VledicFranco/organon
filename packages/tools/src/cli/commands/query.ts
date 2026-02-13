/**
 * organon query — Filter organon files by frontmatter metadata.
 */

import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { resolveConfig, resolveProjectRoot } from '../../core/config.js';
import { query } from '../../core/query.js';
import { NodeFileSystem } from '../../core/node-fs.js';

interface QueryArgs {
  'project-root': string;
  config?: string;
  scope?: string;
  type?: string;
  priority?: string;
  task?: string;
  budget?: number;
  name?: string;
  related?: string;
  verbose?: boolean;
}

export const queryCommand: CommandModule<{}, QueryArgs> = {
  command: 'query',
  describe: 'Query organon files by frontmatter metadata',

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
      .option('scope', {
        describe: 'Filter by scope',
        type: 'string',
        choices: ['product', 'domain', 'feature', 'component', 'meta', 'methodology'],
      })
      .option('type', {
        describe: 'Filter by type',
        type: 'string',
        choices: ['navigation', 'constraints', 'rationale', 'procedures', 'mapping'],
      })
      .option('priority', {
        describe: 'Filter by load priority',
        type: 'string',
        choices: ['high', 'medium', 'low'],
      })
      .option('task', {
        describe: 'Filter by required_for task',
        type: 'string',
      })
      .option('budget', {
        describe: 'Maximum total token budget',
        type: 'number',
      })
      .option('name', {
        describe: 'Filter by name (substring match)',
        type: 'string',
      })
      .option('related', {
        describe: 'Filter by related domain or feature',
        type: 'string',
      })
      .option('verbose', {
        describe: 'Show full file content',
        type: 'boolean',
        default: false,
      })
      .example('$0 query --scope=meta', 'List all meta-scope organons')
      .example('$0 query --budget=20000', 'Plan context loading within 20K tokens')
      .example('$0 query --task=genesis_tool_impl', 'Find organons for a specific task');
  },

  handler: async (args) => {
    const fs = new NodeFileSystem();
    const projectRoot = await resolveProjectRoot(args['project-root'], fs);
    const config = await resolveConfig(projectRoot, fs, args.config);

    const result = await query({
      projectRoot,
      config,
      fs,
      scope: args.scope as any,
      type: args.type as any,
      priority: args.priority as any,
      task: args.task,
      budget: args.budget,
      namePattern: args.name,
      relatedDomain: args.related,
      relatedFeature: args.related,
      verbose: args.verbose,
    });

    console.log(chalk.blue('Organon Query'));
    console.log();

    if (result.files.length === 0) {
      console.log(chalk.yellow('  No matching files found'));
    } else {
      for (const f of result.files) {
        const fm = f.frontmatter;
        const tokens = fm?.token_estimate ?? '?';
        const priority = fm?.load_priority ?? '-';
        console.log(`  ${chalk.green(f.path)}`);
        console.log(chalk.dim(`    ${fm?.type ?? '?'} | ${fm?.scope ?? '?'} | ${tokens} tokens | priority: ${priority}`));
        if (fm?.summary) {
          console.log(chalk.dim(`    ${fm.summary}`));
        }
      }
    }

    console.log();
    console.log(chalk.dim(`${result.files.length} file(s) | ${result.totalTokens} total tokens`));

    for (const w of result.warnings) {
      console.log(chalk.yellow(`  ⚠ ${w.message}`));
    }
  },
};
