/**
 * Shared organon file discovery.
 *
 * Resolves organonPaths × organonGlobs into a deduplicated, sorted list of
 * organon file paths.  When the organon path is "." (project root),
 * recursive glob prefixes are stripped so that only root-level files match — this
 * prevents false-positive frontmatter checks on non-organon markdown files
 * buried deeper in the project tree.
 */

import type { FileSystem, OrganonConfig } from './types.js';

export async function discoverOrganonFiles(
  projectRoot: string,
  config: OrganonConfig,
  fs: FileSystem,
): Promise<string[]> {
  const allFiles = new Set<string>();

  for (const organonPath of config.organonPaths) {
    for (const pattern of config.organonGlobs) {
      // "." means project root — match root-level files only (no recursion).
      // Named paths like "organon" or "book-llms" keep recursive ** globs.
      const fullPattern = organonPath === '.'
        ? pattern.replace(/^\*\*\//, '')
        : `${organonPath}/${pattern}`;
      const matches = await fs.glob(fullPattern, {
        cwd: projectRoot,
        ignore: config.ignorePatterns,
      });
      for (const m of matches) {
        allFiles.add(m);
      }
    }
  }

  return [...allFiles].sort();
}
