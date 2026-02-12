/**
 * Parallel reader — batched file reading with concurrency control.
 *
 * Provides a shared utility for reading multiple files in parallel
 * using Promise.allSettled with a configurable concurrency limit
 * to avoid file descriptor exhaustion.
 *
 * Used by file-resolver.ts and other resolvers for efficient I/O.
 */

import type { FileSystem } from './types.js';

/**
 * Default concurrency limit to avoid file descriptor exhaustion.
 */
const DEFAULT_CONCURRENCY = 50;

/**
 * Result of reading a single file.
 */
export interface FileReadResult {
  /** The file path that was read */
  path: string;
  /** The file content (undefined if reading failed) */
  content?: string;
  /** Error message if reading failed */
  error?: string;
}

/**
 * Read multiple files in parallel with concurrency control.
 *
 * Uses Promise.allSettled to ensure all reads complete (or fail)
 * without aborting on the first error. Files are processed in
 * batches to avoid exhausting file descriptors.
 *
 * @param paths - File paths to read
 * @param fs - FileSystem implementation
 * @param concurrency - Maximum number of concurrent reads (default: 50)
 * @returns Results for each file (success or error)
 */
export async function readFilesParallel(
  paths: string[],
  fs: FileSystem,
  concurrency: number = DEFAULT_CONCURRENCY,
): Promise<FileReadResult[]> {
  const results: FileReadResult[] = [];

  // Process in batches
  for (let i = 0; i < paths.length; i += concurrency) {
    const batch = paths.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map(async (path) => {
        const content = await fs.readFile(path);
        return { path, content };
      }),
    );

    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j];
      const path = batch[j];

      if (result.status === 'fulfilled') {
        results.push({
          path,
          content: result.value.content,
        });
      } else {
        results.push({
          path,
          error: result.reason instanceof Error
            ? result.reason.message
            : String(result.reason),
        });
      }
    }
  }

  return results;
}
