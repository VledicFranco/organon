#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: root, encoding: 'utf-8', stdio: 'pipe', ...opts }).trim();
}

function fail(msg) {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

// --- Validate arguments ---
const bump = process.argv[2];
if (!['patch', 'minor', 'major'].includes(bump)) {
  console.log('Usage: node scripts/release.mjs <patch|minor|major>');
  process.exit(1);
}

// --- Validate environment ---
try {
  run('git rev-parse --is-inside-work-tree');
} catch {
  fail('Not inside a git repository.');
}

const branch = run('git rev-parse --abbrev-ref HEAD');
if (branch !== 'master') {
  fail(`Must be on the 'master' branch (currently on '${branch}').`);
}

const status = run('git status --porcelain');
if (status.length > 0) {
  fail('Working tree is not clean. Commit or stash your changes first.');
}

try {
  run('gh --version');
} catch {
  fail('GitHub CLI (gh) is not installed or not in PATH.');
}

// --- Read current version ---
const toolsPackagePath = join(root, 'packages', 'tools', 'package.json');
const toolsPackage = JSON.parse(readFileSync(toolsPackagePath, 'utf-8'));
const currentVersion = toolsPackage.version;

if (!currentVersion) {
  fail('Could not read current version from packages/tools/package.json.');
}

// --- Compute next version ---
const [major, minor, patch] = currentVersion.split('.').map(Number);
let nextVersion;
switch (bump) {
  case 'major':
    nextVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    nextVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    nextVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

console.log(`Bumping version: ${currentVersion} → ${nextVersion} (${bump})`);

// --- Update packages/tools/package.json ---
toolsPackage.version = nextVersion;
writeFileSync(toolsPackagePath, JSON.stringify(toolsPackage, null, 2) + '\n');
console.log('  Updated packages/tools/package.json');

// --- Update packages/testing/package.json ---
const testingPackagePath = join(root, 'packages', 'testing', 'package.json');
const testingPackage = JSON.parse(readFileSync(testingPackagePath, 'utf-8'));
testingPackage.version = nextVersion;
writeFileSync(testingPackagePath, JSON.stringify(testingPackage, null, 2) + '\n');
console.log('  Updated packages/testing/package.json');

// --- Update organon.config.json ---
const configPath = join(root, 'organon.config.json');
const config = JSON.parse(readFileSync(configPath, 'utf-8'));
config.methodology_version = nextVersion;
writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
console.log('  Updated organon.config.json');

// --- Update METHODOLOGY_VERSION constant in templates/config.ts ---
const configTsPath = join(root, 'packages', 'tools', 'src', 'templates', 'config.ts');
let configTs = readFileSync(configTsPath, 'utf-8');
configTs = configTs.replace(
  /export const METHODOLOGY_VERSION = '[^']+';/,
  `export const METHODOLOGY_VERSION = '${nextVersion}';`,
);
configTs = configTs.replace(
  /"methodology_version": "[^"]+"/,
  `"methodology_version": "${nextVersion}"`,
);
writeFileSync(configTsPath, configTs);
console.log('  Updated packages/tools/src/templates/config.ts');

// --- Update packages/testing-scala/build.sbt ---
const buildSbtPath = join(root, 'packages', 'testing-scala', 'build.sbt');
let buildSbt = readFileSync(buildSbtPath, 'utf-8');
buildSbt = buildSbt.replace(
  /ThisBuild \/ version\s*:=\s*"[^"]+"/,
  `ThisBuild / version      := "${nextVersion}"`,
);
writeFileSync(buildSbtPath, buildSbt);
console.log('  Updated packages/testing-scala/build.sbt');

// --- Update CHANGELOG.md ---
const changelogPath = join(root, 'CHANGELOG.md');
const changelog = readFileSync(changelogPath, 'utf-8');
const today = new Date().toISOString().split('T')[0];
const newSection = `## [Unreleased]\n\n## [${nextVersion}] - ${today}`;
const updatedChangelog = changelog.replace('## [Unreleased]', newSection);
writeFileSync(changelogPath, updatedChangelog);
console.log('  Updated CHANGELOG.md');

// --- Git commit and tag ---
const tag = `v${nextVersion}`;
run('git add -A');
run(`git commit -m "chore: release ${tag}"`);
console.log(`  Committed: chore: release ${tag}`);

run(`git tag ${tag}`);
console.log(`  Tagged: ${tag}`);

// --- Push ---
run('git push');
run('git push --tags');
console.log('  Pushed commit and tag');

// --- Create GitHub release ---
run(`gh release create ${tag} --title "${tag}" --generate-notes`);
console.log(`  Created GitHub release: ${tag}`);

console.log(`\nRelease ${tag} complete!`);
