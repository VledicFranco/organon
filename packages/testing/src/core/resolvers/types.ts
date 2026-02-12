/**
 * FileSystem interface for the testing package resolver layer.
 *
 * Mirrors the organon-tools FileSystem interface but is self-contained
 * so @organon/testing has no dependency on @organon/tools internals.
 * The resolver layer uses this interface for all I/O; assertion functions
 * in core/assertions/ never import this module (INV-TEST-1).
 */

export interface FileSystem {
  readFile(path: string): Promise<string>;
  glob(pattern: string, options?: { cwd?: string }): Promise<string[]>;
  exists(path: string): Promise<boolean>;
}
