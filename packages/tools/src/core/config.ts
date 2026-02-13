/**
 * OrganonConfig resolution.
 *
 * Discovery order:
 * 1. Explicit config file path (--config flag)
 * 2. organon.config.json in projectRoot
 * 3. Convention-based defaults (scan for organon/, .claude/skills/, etc.)
 */

import { z } from 'zod';
import type { FileSystem, OrganonConfig } from './types.js';

const CONFIG_FILENAME = 'organon.config.json';

const WorkflowPathsSchema = z.object({
  claudeCode: z.string().optional(),
  cursor: z.string().optional(),
  generic: z.string().optional(),
}).strict();

const ConfigFileSchema = z.object({
  methodology_version: z.string().optional(),
  organonPaths: z.array(z.string()).optional(),
  organonGlobs: z.array(z.string()).optional(),
  ignorePatterns: z.array(z.string()).optional(),
  workflowPaths: WorkflowPathsSchema.optional(),
  freshnessThresholdHours: z.number().positive().optional(),
  testGlobs: z.array(z.string()).optional(),
  testIgnorePatterns: z.array(z.string()).optional(),
}).strict();

export type ConfigFile = z.infer<typeof ConfigFileSchema>;

const DEFAULT_ORGANON_GLOBS = [
  '**/ETHOS.md',
  '**/PHILOSOPHY.md',
  '**/PROTOCOL.md',
  '**/PROTOCOLS.md',
  '**/README.md',
  '**/components.md',
];

const DEFAULT_IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.git/**',
  '**/coverage/**',
  '*.test.*',
  '*.spec.*',
];

const CONVENTION_ORGANON_DIRS = [
  'organon',
  'book-llms',
];

const CONVENTION_WORKFLOW_PATHS = {
  claudeCode: '.claude/skills',
  cursor: '.cursor/rules',
  generic: 'organon/workflows',
};

/**
 * Resolve config by merging file-based config with convention defaults.
 */
export async function resolveConfig(
  projectRoot: string,
  fs: FileSystem,
  configPath?: string,
): Promise<OrganonConfig> {
  const fileConfig = await loadConfigFile(projectRoot, fs, configPath);
  const conventionPaths = await discoverConventionPaths(projectRoot, fs);

  const organonPaths = fileConfig?.organonPaths ?? conventionPaths;
  const organonGlobs = fileConfig?.organonGlobs ?? DEFAULT_ORGANON_GLOBS;
  const ignorePatterns = fileConfig?.ignorePatterns ?? DEFAULT_IGNORE_PATTERNS;
  const workflowPaths = {
    ...CONVENTION_WORKFLOW_PATHS,
    ...fileConfig?.workflowPaths,
  };
  const freshnessThresholdHours = fileConfig?.freshnessThresholdHours ?? 24;
  const testGlobs = fileConfig?.testGlobs;
  const testIgnorePatterns = fileConfig?.testIgnorePatterns;

  return {
    projectRoot,
    organonPaths,
    organonGlobs,
    ignorePatterns,
    workflowPaths,
    freshnessThresholdHours,
    testGlobs,
    testIgnorePatterns,
  };
}

async function loadConfigFile(
  projectRoot: string,
  fs: FileSystem,
  configPath?: string,
): Promise<ConfigFile | null> {
  const path = configPath
    ? joinPath(projectRoot, configPath)
    : joinPath(projectRoot, CONFIG_FILENAME);

  if (!await fs.exists(path)) {
    return null;
  }

  const raw = await fs.readFile(path);
  const parsed = JSON.parse(raw);
  return ConfigFileSchema.parse(parsed);
}

async function discoverConventionPaths(
  projectRoot: string,
  fs: FileSystem,
): Promise<string[]> {
  const found: string[] = [];
  for (const dir of CONVENTION_ORGANON_DIRS) {
    if (await fs.exists(joinPath(projectRoot, dir))) {
      found.push(dir);
    }
  }
  // Always include project root for top-level ETHOS.md etc.
  if (!found.includes('.')) {
    found.push('.');
  }
  return found;
}

/**
 * Simple path join that handles both / and \ separators.
 * Avoids importing node:path in the core module.
 */
export function joinPath(...segments: string[]): string {
  return segments
    .map((s, i) => (i === 0 ? s : s.replace(/^[/\\]+/, '')))
    .join('/')
    .replace(/\/+/g, '/');
}

/**
 * Get the directory portion of a path.
 */
export function dirName(path: string): string {
  const normalized = path.replace(/\\/g, '/');
  const lastSlash = normalized.lastIndexOf('/');
  if (lastSlash === -1) return '.';
  return normalized.substring(0, lastSlash);
}

/**
 * Get the filename from a path.
 */
export function baseName(path: string): string {
  const normalized = path.replace(/\\/g, '/');
  const lastSlash = normalized.lastIndexOf('/');
  return lastSlash === -1 ? normalized : normalized.substring(lastSlash + 1);
}

/**
 * Walk up directories looking for organon.config.json.
 * Stops at .git root or filesystem root.
 */
export async function findProjectRoot(
  startDir: string,
  fs: FileSystem,
): Promise<string | null> {
  let current = startDir.replace(/\\/g, '/').replace(/\/+$/, '');

  while (current) {
    // Check for organon.config.json
    if (await fs.exists(joinPath(current, CONFIG_FILENAME))) {
      return current;
    }

    // Stop at .git root (common project boundary)
    if (await fs.exists(joinPath(current, '.git'))) {
      // .git exists but no config found at this level — this IS the project root
      // but it has no organon config. Return it as the closest root anyway.
      return current;
    }

    // Go up one directory
    const parent = dirName(current);
    // Reached filesystem root — stop
    if (parent === current || parent === '.' || parent === '') {
      break;
    }
    current = parent;
  }

  return null;
}

/**
 * Resolve project root with directory walking fallback.
 * Used by CLI commands to find the project root when --project-root
 * is not explicitly specified.
 */
export async function resolveProjectRoot(
  explicitRoot: string | undefined,
  fs: FileSystem,
): Promise<string> {
  // If explicitly provided, use it
  if (explicitRoot && explicitRoot !== process.cwd()) {
    return explicitRoot;
  }

  // Walk up from cwd to find project root
  const found = await findProjectRoot(process.cwd(), fs);
  return found ?? process.cwd();
}
