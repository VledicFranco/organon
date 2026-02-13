/**
 * organon validate — Validate organon frontmatter (4-stage validation).
 */

import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { resolveConfig, resolveProjectRoot } from '../../core/config.js';
import { validateFrontmatter } from '../../core/validate-frontmatter.js';
import { NodeFileSystem } from '../../core/node-fs.js';
import type { DiagnosticMessage } from '../../core/types.js';

interface ValidateArgs {
  'project-root': string;
  config?: string;
  files?: string[];
  stages?: number[];
}

export const validateCommand: CommandModule<{}, ValidateArgs> = {
  command: 'validate [files..]',
  describe: 'Validate organon frontmatter (schema, references, truthfulness, consistency)',

  builder: (yargs) => {
    return yargs
      .positional('files', {
        describe: 'Specific files to validate (validates all if omitted)',
        type: 'string',
        array: true,
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
      .option('stages', {
        describe: 'Validation stages to run (1=schema, 2=references, 3=truthfulness, 4=consistency)',
        type: 'array',
        coerce: (arr: unknown[]) => arr.map(Number),
      })
      .example('$0 validate', 'Validate all organon files')
      .example('$0 validate book-llms/ETHOS.md', 'Validate a specific file')
      .example('$0 validate --stages 1 3', 'Run only schema and truthfulness checks');
  },

  handler: async (args) => {
    const fs = new NodeFileSystem();
    const projectRoot = await resolveProjectRoot(args['project-root'], fs);
    const config = await resolveConfig(projectRoot, fs, args.config);

    const result = await validateFrontmatter({
      projectRoot,
      config,
      fs,
      files: args.files,
      stages: args.stages as Array<1 | 2 | 3 | 4> | undefined,
    });

    // Output results
    console.log(chalk.blue('Organon Validate'));
    console.log();
    console.log(`Files checked: ${result.filesChecked}`);

    for (const fileResult of result.results) {
      if (fileResult.valid && fileResult.warnings.length === 0) {
        console.log(chalk.green(`  ✓ ${fileResult.file}`));
      } else if (fileResult.valid) {
        console.log(chalk.yellow(`  ⚠ ${fileResult.file} (${fileResult.warnings.length} warnings)`));
        for (const w of fileResult.warnings) {
          printDiagnostic(w);
        }
      } else {
        console.log(chalk.red(`  ✗ ${fileResult.file} (${fileResult.errors.length} errors)`));
        for (const e of fileResult.errors) {
          printDiagnostic(e);
        }
        for (const w of fileResult.warnings) {
          printDiagnostic(w);
        }
      }
    }

    console.log();
    if (result.success) {
      console.log(chalk.green(`✓ All ${result.filesChecked} files passed validation`));
    } else {
      console.log(chalk.red(`✗ ${result.filesWithErrors} file(s) failed validation`));
      process.exit(1);
    }
  },
};

function printDiagnostic(d: DiagnosticMessage): void {
  const prefix = d.severity === 'error' ? chalk.red('    ✗') :
                 d.severity === 'warning' ? chalk.yellow('    ⚠') :
                 chalk.dim('    ℹ');
  console.log(`${prefix} [${d.code}] ${d.message}`);
  if (d.suggestion) {
    console.log(chalk.dim(`      → ${d.suggestion}`));
  }
}
