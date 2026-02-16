/**
 * tier4-tests verification gate.
 *
 * Static analysis gate that checks whether test files with @organon-invariant
 * annotations properly import from @organon-methodology/testing and call testInvariant().
 *
 * This gate does NOT run tests — that's CI's job. It only checks structure:
 * 1. Find files with @organon-invariant annotations
 * 2. Verify they import from @organon-methodology/testing
 * 3. Verify they contain testInvariant() calls
 * 4. Report gaps
 */

import { joinPath } from './config.js';
import type {
  DiagnosticMessage,
  FileSystem,
  OrganonConfig,
} from './types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Tier4TestsResult {
  success: boolean;
  /** Test files that were scanned */
  filesScanned: number;
  /** Files with @organon-invariant annotations */
  annotatedFiles: number;
  /** Files that pass all checks */
  validFiles: number;
  errors: DiagnosticMessage[];
  warnings: DiagnosticMessage[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_TEST_GLOBS = [
  '**/*.test.ts',
  '**/*.test.js',
  '**/*.test.tsx',
  '**/*.test.jsx',
  '**/*.spec.ts',
  '**/*.spec.js',
  '**/*Spec.scala',
  '**/*Test.scala',
];

const ANNOTATION_RE = /@organon-invariant\s+INV-[\w-]+/;
const TESTING_IMPORT_RE = /from\s+['"]@organon-methodology\/testing|import\s+io\.github\.vledicfranco\.organon\.testing\./;
const TEST_INVARIANT_RE = /testInvariant\s*\(/;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Verify that test files with @organon-invariant annotations
 * properly use @organon-methodology/testing infrastructure.
 */
export async function verifyTier4Tests(options: {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
}): Promise<Tier4TestsResult> {
  const { projectRoot, config, fs } = options;
  const testGlobs = config.testGlobs ?? DEFAULT_TEST_GLOBS;
  const ignorePatterns = config.testIgnorePatterns ?? config.ignorePatterns;
  const errors: DiagnosticMessage[] = [];
  const warnings: DiagnosticMessage[] = [];

  let filesScanned = 0;
  let annotatedFiles = 0;
  let validFiles = 0;

  for (const pattern of testGlobs) {
    const files = await fs.glob(pattern, { cwd: projectRoot, ignore: ignorePatterns });
    for (const file of files) {
      filesScanned++;
      const absPath = joinPath(projectRoot, file);
      let content: string;
      try {
        content = await fs.readFile(absPath);
      } catch {
        continue;
      }

      // Only check files that have @organon-invariant annotations
      if (!ANNOTATION_RE.test(content)) continue;

      annotatedFiles++;
      let isValid = true;

      // Check for @organon-methodology/testing import
      if (!TESTING_IMPORT_RE.test(content)) {
        const isScala = file.endsWith('.scala');
        const suggestion = isScala
          ? `Add: import io.github.vledicfranco.organon.testing.adapters.OrganonSuite`
          : `Add: import { testInvariant } from '@organon-methodology/testing/vitest';`;
        warnings.push({
          severity: 'warning',
          code: 'TIER4_MISSING_IMPORT',
          message: `Test file has @organon-invariant annotation but does not import from @organon-methodology/testing`,
          file,
          suggestion,
        });
        isValid = false;
      }

      // Check for testInvariant() call
      if (!TEST_INVARIANT_RE.test(content)) {
        warnings.push({
          severity: 'warning',
          code: 'TIER4_MISSING_TEST_INVARIANT',
          message: `Test file has @organon-invariant annotation but does not call testInvariant()`,
          file,
          suggestion: `Wrap assertions with testInvariant('INV-ID', 'description', async () => { ... });`,
        });
        isValid = false;
      }

      if (isValid) {
        validFiles++;
      }
    }
  }

  // Info warning when no annotated files found
  if (annotatedFiles === 0 && filesScanned > 0) {
    warnings.push({
      severity: 'warning',
      code: 'TIER4_NO_ANNOTATED_FILES',
      message: `No test files found with @organon-invariant annotations (scanned ${filesScanned} file(s))`,
      suggestion: `Add // @organon-invariant INV-ID comments to test files that verify invariants`,
    });
  }

  return {
    success: errors.length === 0,
    filesScanned,
    annotatedFiles,
    validFiles,
    errors,
    warnings,
  };
}
