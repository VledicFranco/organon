/**
 * organon release — Compute and execute version bump + release.
 */

import * as fsNode from 'node:fs/promises';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { resolveProjectRoot } from '../../core/config.js';
import { computeReleasePlan } from '../../core/release.js';
import type { BumpLevel } from '../../core/release.js';
import { NodeFileSystem } from '../../core/node-fs.js';

interface ReleaseArgs {
  bump: string;
  'project-root': string;
  'dry-run': boolean;
}

export const releaseCommand: CommandModule<{}, ReleaseArgs> = {
  command: 'release <bump>',
  describe: 'Bump version, update files, tag, and create GitHub release',

  builder: (yargs) => {
    return yargs
      .positional('bump', {
        describe: 'Version bump level',
        type: 'string',
        choices: ['patch', 'minor', 'major'],
        demandOption: true,
      })
      .option('project-root', {
        describe: 'Project root directory',
        type: 'string',
        default: process.cwd(),
      })
      .option('dry-run', {
        describe: 'Show what would happen without making changes',
        type: 'boolean',
        default: false,
      })
      .example('$0 release minor', 'Release a minor version bump')
      .example('$0 release patch --dry-run', 'Preview a patch release');
  },

  handler: async (args) => {
    const fs = new NodeFileSystem();
    const projectRoot = await resolveProjectRoot(args['project-root'], fs);
    const bump = args.bump as BumpLevel;

    const plan = await computeReleasePlan(projectRoot, bump, fs);

    console.log(chalk.blue('Organon Release'));
    console.log();
    console.log(`  ${plan.currentVersion} → ${chalk.green(plan.nextVersion)} (${plan.bump})`);
    console.log();

    console.log(chalk.dim('  Files to update:'));
    for (const f of plan.filesToUpdate) {
      console.log(`    ${f.file}: ${f.description}`);
    }
    console.log();

    if (args['dry-run']) {
      console.log(chalk.yellow('  Dry run — no changes made.'));
      return;
    }

    // Execute the release
    const run = (cmd: string) =>
      execSync(cmd, { cwd: projectRoot, encoding: 'utf-8', stdio: 'pipe' }).trim();

    // Validate environment
    const branch = run('git rev-parse --abbrev-ref HEAD');
    if (branch !== 'master') {
      console.error(chalk.red(`Must be on 'master' branch (currently on '${branch}')`));
      process.exit(1);
    }

    const status = run('git status --porcelain');
    if (status.length > 0) {
      console.error(chalk.red('Working tree is not clean. Commit or stash first.'));
      process.exit(1);
    }

    // Update package.json files
    for (const pkgName of ['tools', 'testing']) {
      const pkgPath = path.join(projectRoot, 'packages', pkgName, 'package.json');
      const pkg = JSON.parse(await fsNode.readFile(pkgPath, 'utf-8'));
      pkg.version = plan.nextVersion;
      await fsNode.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
      console.log(`  Updated packages/${pkgName}/package.json`);
    }

    // Update organon.config.json
    const configPath = path.join(projectRoot, 'organon.config.json');
    const config = JSON.parse(await fsNode.readFile(configPath, 'utf-8'));
    config.methodology_version = plan.nextVersion;
    await fsNode.writeFile(configPath, JSON.stringify(config, null, 2) + '\n');
    console.log('  Updated organon.config.json');

    // Update METHODOLOGY_VERSION in templates/config.ts
    const configTsPath = path.join(projectRoot, 'packages', 'tools', 'src', 'templates', 'config.ts');
    let configTs = await fsNode.readFile(configTsPath, 'utf-8');
    configTs = configTs.replace(
      /export const METHODOLOGY_VERSION = '[^']+';/,
      `export const METHODOLOGY_VERSION = '${plan.nextVersion}';`,
    );
    configTs = configTs.replace(
      /"methodology_version": "[^"]+"/,
      `"methodology_version": "${plan.nextVersion}"`,
    );
    await fsNode.writeFile(configTsPath, configTs);
    console.log('  Updated packages/tools/src/templates/config.ts');

    // Update CHANGELOG.md
    const changelogPath = path.join(projectRoot, 'CHANGELOG.md');
    const changelog = await fsNode.readFile(changelogPath, 'utf-8');
    const today = new Date().toISOString().split('T')[0];
    const newSection = `## [Unreleased]\n\n## [${plan.nextVersion}] - ${today}`;
    const updatedChangelog = changelog.replace('## [Unreleased]', newSection);
    await fsNode.writeFile(changelogPath, updatedChangelog);
    console.log('  Updated CHANGELOG.md');

    // Git commit and tag
    const tag = `v${plan.nextVersion}`;
    run('git add -A');
    run(`git commit -m "chore: release ${tag}"`);
    console.log(`  Committed: chore: release ${tag}`);

    run(`git tag ${tag}`);
    console.log(`  Tagged: ${tag}`);

    // Push
    run('git push');
    run('git push --tags');
    console.log('  Pushed commit and tag');

    // Create GitHub release
    try {
      run(`gh release create ${tag} --title "${tag}" --generate-notes`);
      console.log(`  Created GitHub release: ${tag}`);
    } catch {
      console.log(chalk.yellow('  Could not create GitHub release (gh CLI not available or not authenticated)'));
    }

    console.log();
    console.log(chalk.green(`Release ${tag} complete!`));
  },
};
