/**
 * String resolver — generic string pattern extractor.
 *
 * Provides reusable utilities for extracting strings from files
 * using regex patterns. Used by assertNamingConvention and
 * potentially other assertions that need to extract identifiers.
 *
 * Design:
 * - Pure extraction functions (no validation)
 * - Depends on FileSystem interface for file reading
 */

import { join, basename } from 'node:path';
import type { FileSystem } from './types.js';

/**
 * A string extracted from a file.
 */
export interface ExtractedString {
  /** Path of the file */
  file: string;
  /** The extracted string */
  value: string;
  /** The line number (1-based) where it was found, or 0 for file-level extractions */
  line: number;
}

/**
 * Extract file stems (filename without extension) from a list of file paths.
 *
 * Pure function — no I/O.
 */
export function extractFileStems(files: string[]): ExtractedString[] {
  return files.map((file) => {
    const base = basename(file);
    const dotIndex = base.indexOf('.');
    const stem = dotIndex > 0 ? base.slice(0, dotIndex) : base;
    return { file, value: stem, line: 0 };
  });
}

/**
 * Extract strings matching a regex pattern from file contents.
 *
 * Pure function — takes content string, returns matches.
 * The pattern must have at least one capturing group; the first
 * capturing group is used as the extracted string.
 */
export function extractByPattern(
  file: string,
  content: string,
  pattern: RegExp,
): ExtractedString[] {
  const results: ExtractedString[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];
    const localPattern = new RegExp(pattern.source, pattern.flags.replace('g', ''));
    const match = localPattern.exec(lineText);

    if (match && match[1] !== undefined) {
      results.push({
        file,
        value: match[1],
        line: i + 1,
      });
    }
  }

  return results;
}

/**
 * Result of resolving strings from files.
 */
export interface ResolvedStrings {
  strings: ExtractedString[];
  filesRead: string[];
  errors: Array<{ file: string; message: string }>;
}

/**
 * Resolve file stems from files matching glob patterns.
 */
export async function resolveFileStems(options: {
  files: string[];
  cwd?: string;
  fs: FileSystem;
}): Promise<ResolvedStrings> {
  const { files, cwd, fs } = options;
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

  return {
    strings: extractFileStems(expandedPaths),
    filesRead: expandedPaths,
    errors,
  };
}

/**
 * Resolve strings from file contents using a regex pattern.
 */
export async function resolveStringsByPattern(options: {
  files: string[];
  pattern: RegExp;
  cwd?: string;
  fs: FileSystem;
}): Promise<ResolvedStrings> {
  const { files, pattern, cwd, fs } = options;
  const strings: ExtractedString[] = [];
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

  // Read files and extract strings
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
    strings.push(...extractByPattern(filePath, content, pattern));
  }

  return { strings, filesRead, errors };
}
