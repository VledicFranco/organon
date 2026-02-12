/**
 * Import resolver — scans files for import/require statements.
 *
 * Extracts structured import data from TypeScript/JavaScript files.
 * Used by assertNoSideEffects to check for forbidden module imports.
 *
 * Design:
 * - Depends on FileSystem interface (mockable for tests)
 * - Returns structured data for pure assertion validation
 */

import { join } from 'node:path';
import type { FileSystem } from './types.js';

/**
 * A single import/require match found in a file.
 */
export interface ImportMatch {
  /** Path of the file containing the import */
  file: string;
  /** The line number (1-based) where the import was found */
  line: number;
  /** The full line of text containing the import */
  lineText: string;
  /** The module specifier (e.g., 'fs', 'node:http', './utils') */
  module: string;
}

/**
 * Patterns to match import/require statements.
 * Captures the module specifier from:
 * - import ... from 'module'
 * - import 'module'
 * - require('module')
 * - import('module')  (dynamic import)
 */
const IMPORT_PATTERNS = [
  /import\s+.*?\s+from\s+['"]([^'"]+)['"]/,
  /import\s+['"]([^'"]+)['"]/,
  /require\(\s*['"]([^'"]+)['"]\s*\)/,
  /import\(\s*['"]([^'"]+)['"]\s*\)/,
];

/**
 * Extract all import/require module specifiers from a file's content.
 *
 * This is a pure function — no I/O. Takes content string, returns matches.
 */
export function extractImports(
  file: string,
  content: string,
): ImportMatch[] {
  const matches: ImportMatch[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];

    for (const pattern of IMPORT_PATTERNS) {
      const match = pattern.exec(lineText);
      if (match && match[1]) {
        matches.push({
          file,
          line: i + 1,
          lineText,
          module: match[1],
        });
        break; // One match per line is sufficient
      }
    }
  }

  return matches;
}

/**
 * Result of resolving imports across multiple files.
 */
export interface ResolvedImports {
  /** All import matches found across files */
  imports: ImportMatch[];
  /** Files that were successfully read */
  filesRead: string[];
  /** Errors encountered during resolution */
  errors: Array<{ file: string; message: string }>;
}

/**
 * Resolve imports from files matching glob patterns.
 *
 * Expands globs, reads files, and extracts all imports.
 */
export async function resolveImports(options: {
  files: string[];
  cwd?: string;
  fs: FileSystem;
}): Promise<ResolvedImports> {
  const { files, cwd, fs } = options;
  const imports: ImportMatch[] = [];
  const filesRead: string[] = [];
  const errors: Array<{ file: string; message: string }> = [];

  // Expand globs
  const expandedPaths: string[] = [];
  for (const file of files) {
    if (file.includes('*') || file.includes('?')) {
      try {
        const expanded = await fs.glob(file, cwd ? { cwd } : undefined);
        expandedPaths.push(...expanded);
      } catch (err) {
        errors.push({
          file,
          message: `Failed to expand glob: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    } else {
      expandedPaths.push(file);
    }
  }

  // Read files and extract imports
  for (const filePath of expandedPaths) {
    const readPath = cwd ? join(cwd, filePath) : filePath;
    let content: string;
    try {
      content = await fs.readFile(readPath);
    } catch (err) {
      errors.push({
        file: filePath,
        message: `Failed to read file: ${err instanceof Error ? err.message : String(err)}`,
      });
      continue;
    }
    filesRead.push(filePath);
    imports.push(...extractImports(filePath, content));
  }

  return { imports, filesRead, errors };
}
