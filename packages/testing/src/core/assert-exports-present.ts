/**
 * assertExportsPresent — High-level assertion that verifies expected exports exist.
 *
 * Simplified backwards-compat check: scans a file for export statements
 * and verifies that all expected export names are present.
 *
 * Architecture:
 * - Reads file content via FileSystem (I/O layer)
 * - Extracts export names via regex
 * - Delegates to assertions/exports-present.ts for pure validation
 *
 * Invariants:
 * - INV-TEST-2 (fail-fast): Throws on violation or resolver errors
 * - INV-TEST-6 (always-async): Returns Promise<void>
 * - INV-TEST-7 (composable): No module-level mutable state
 */

import type { FileSystem } from './resolvers/types.js';
import { createNodeFileSystem } from './resolvers/node-fs.js';
import {
  validateExportsPresent,
  ExportsPresentAssertionError,
} from './assertions/exports-present.js';

/**
 * Options for assertExportsPresent.
 */
export interface ExportsPresentOptions {
  /** Path to the file to check */
  file: string;
  /** Expected export names that must be present */
  expectedExports: string[];
  /** Optional working directory */
  cwd?: string;
  /** Optional FileSystem implementation */
  fs?: FileSystem;
}

/**
 * Error thrown when assertExportsPresent encounters resolver-level errors.
 */
export class ExportsPresentResolverError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExportsPresentResolverError';
  }
}

/**
 * Patterns to extract export names from TypeScript/JavaScript files.
 *
 * Captures from:
 * - export function name
 * - export async function name
 * - export class name
 * - export interface name
 * - export type name
 * - export const/let/var name
 * - export enum name
 * - export { name, name2 }
 * - export { name } from '...'
 */
const EXPORT_PATTERNS = [
  /export\s+(?:async\s+)?function\s+(\w+)/,
  /export\s+class\s+(\w+)/,
  /export\s+interface\s+(\w+)/,
  /export\s+type\s+(\w+)/,
  /export\s+(?:const|let|var)\s+(\w+)/,
  /export\s+enum\s+(\w+)/,
];

const EXPORT_LIST_PATTERN = /export\s*\{([^}]+)\}/;

/**
 * Extract all exported names from file content.
 *
 * Pure function — no I/O.
 */
export function extractExportNames(content: string): string[] {
  const names: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    // Check named export patterns
    for (const pattern of EXPORT_PATTERNS) {
      const match = pattern.exec(line);
      if (match && match[1]) {
        names.push(match[1]);
        break;
      }
    }

    // Check export list pattern: export { a, b, c }
    const listMatch = EXPORT_LIST_PATTERN.exec(line);
    if (listMatch && listMatch[1]) {
      const items = listMatch[1].split(',');
      for (const item of items) {
        // Handle "name as alias" — use the original name
        const trimmed = item.trim();
        if (!trimmed) continue;
        const asMatch = /^(\w+)\s+as\s+/.exec(trimmed);
        const typedMatch = /^type\s+(\w+)/.exec(trimmed);
        if (typedMatch) {
          names.push(typedMatch[1]);
        } else if (asMatch) {
          names.push(asMatch[1]);
        } else {
          const nameOnly = trimmed.split(/\s/)[0];
          if (nameOnly) names.push(nameOnly);
        }
      }
    }
  }

  return names;
}

/**
 * Assert that a file contains all expected exports.
 *
 * @param options - Configuration including file path and expected exports
 * @throws {ExportsPresentResolverError} if file can't be read
 * @throws {ExportsPresentAssertionError} if any expected export is missing
 */
export async function assertExportsPresent(
  options: ExportsPresentOptions,
): Promise<void> {
  const { file, expectedExports, cwd, fs } = options;
  const resolvedFs = fs ?? createNodeFileSystem();

  // Fail-fast on empty inputs (INV-TEST-2)
  if (expectedExports.length === 0) {
    throw new ExportsPresentResolverError(
      'No expected exports provided. The expectedExports array must not be empty.',
    );
  }

  // Read the file
  const readPath = cwd ? `${cwd}/${file}` : file;
  let content: string;
  try {
    content = await resolvedFs.readFile(readPath);
  } catch (err) {
    throw new ExportsPresentResolverError(
      `Failed to read file "${file}": ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  // Extract export names
  const foundExports = extractExportNames(content);

  // Delegate to pure validator
  validateExportsPresent(file, expectedExports, foundExports);
}

// Re-export for consumers
export { ExportsPresentAssertionError } from './assertions/exports-present.js';
