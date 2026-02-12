/**
 * File resolver — I/O layer that reads files and feeds data to pure assertions.
 *
 * This module handles all file system interactions for assertions.
 * It expands globs, reads file contents, and extracts pattern matches
 * that are then validated by pure assertion functions in core/assertions/.
 *
 * Design:
 * - Depends on FileSystem interface (mockable for tests)
 * - Returns structured data, never throws on I/O errors (wraps them)
 * - Assertions receive pre-resolved data, never file paths
 */

import { join } from 'node:path';
import type { FileSystem } from './types.js';
import { readFilesParallel } from './parallel-reader.js';

/**
 * A single match found in a file by the resolver.
 */
export interface FileMatch {
  /** Path of the file where the match was found */
  file: string;
  /** The line number (1-based) where the match occurred */
  line: number;
  /** The full line of text containing the match */
  lineText: string;
  /** The raw matched string from the capturing group */
  rawMatch: string;
}

/**
 * A numeric value extracted from a file by pattern matching.
 */
export interface ExtractedValue {
  /** Path of the file where the value was found */
  file: string;
  /** The line number (1-based) where the value was found */
  line: number;
  /** The full line of text containing the value */
  lineText: string;
  /** The extracted numeric value */
  value: number;
  /** The raw string that was parsed as a number */
  rawValue: string;
}

/**
 * Result of resolving files and extracting numeric values by pattern.
 */
export interface ResolvedValues {
  /** Successfully extracted numeric values */
  values: ExtractedValue[];
  /** Files that were resolved and read */
  filesRead: string[];
  /** Errors encountered during resolution (e.g., file not found) */
  errors: ResolverError[];
}

/**
 * An error encountered during file resolution.
 */
export interface ResolverError {
  file: string;
  message: string;
}

/**
 * Options for resolving numeric values from files.
 */
export interface ResolveValuesOptions {
  /** File paths or glob patterns to scan */
  files: string[];
  /** Regex pattern with at least one capturing group for the numeric value */
  pattern: RegExp;
  /** Working directory for glob resolution */
  cwd?: string;
}

/**
 * Expand glob patterns to concrete file paths.
 *
 * Non-glob paths (no * or ? characters) are returned as-is.
 */
export async function expandGlobs(
  files: string[],
  fs: FileSystem,
  cwd?: string,
): Promise<{ paths: string[]; errors: ResolverError[] }> {
  const paths: string[] = [];
  const errors: ResolverError[] = [];

  for (const file of files) {
    if (file.includes('*') || file.includes('?')) {
      try {
        const expanded = await fs.glob(file, cwd ? { cwd } : undefined);
        paths.push(...expanded);
      } catch (err) {
        errors.push({
          file,
          message: `Failed to expand glob: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    } else {
      paths.push(file);
    }
  }

  return { paths, errors };
}

/**
 * Resolve files and extract numeric values matching a pattern.
 *
 * This function:
 * 1. Expands glob patterns to concrete file paths
 * 2. Reads each file
 * 3. Scans each line for the regex pattern
 * 4. Extracts numeric values from the first capturing group
 *
 * Non-numeric captures are reported as errors rather than silently skipped.
 */
export async function resolveValues(
  options: ResolveValuesOptions,
  fs: FileSystem,
): Promise<ResolvedValues> {
  const { files, pattern, cwd } = options;

  const { paths, errors } = await expandGlobs(files, fs, cwd);
  const values: ExtractedValue[] = [];
  const filesRead: string[] = [];

  // Build read paths (prepend cwd when set)
  const readPaths = paths.map((p) => cwd ? join(cwd, p) : p);

  // Read all files in parallel with concurrency control
  const readResults = await readFilesParallel(readPaths, fs);

  for (let idx = 0; idx < readResults.length; idx++) {
    const result = readResults[idx];
    const filePath = paths[idx];

    if (result.error) {
      errors.push({
        file: filePath,
        message: `Failed to read file: ${result.error}`,
      });
      continue;
    }

    filesRead.push(filePath);
    const content = result.content!;

    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i];
      // Reset regex state for global patterns
      const localPattern = new RegExp(pattern.source, pattern.flags.replace('g', ''));
      const match = localPattern.exec(lineText);

      if (match && match[1] !== undefined) {
        const rawValue = match[1];
        const parsed = Number(rawValue);

        if (Number.isNaN(parsed)) {
          errors.push({
            file: filePath,
            message: `Line ${i + 1}: Captured "${rawValue}" is not a valid number`,
          });
        } else {
          values.push({
            file: filePath,
            line: i + 1,
            lineText,
            value: parsed,
            rawValue,
          });
        }
      }
    }
  }

  return { values, filesRead, errors };
}
