/**
 * Invariant coverage analysis.
 *
 * Extracts invariant IDs from ETHOS.md frontmatter (type: constraints)
 * and scans test files for @organon-invariant annotations to compute
 * coverage: which invariants have tests, which don't, and which are
 * marked as judgment calls (requiring human review, not automated tests).
 */

import { parseFrontmatter } from './frontmatter-parser.js';
import { joinPath } from './config.js';
import { discoverOrganonFiles } from './discover.js';
import type {
  DiagnosticMessage,
  FileSystem,
  InvariantCoverageEntry,
  InvariantCoverageResult,
  InvariantEntry,
  OrganonConfig,
} from './types.js';

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
  '**/test_*.py',
  '**/*_test.go',
];

const ANNOTATION_RE = /@organon-invariant\s+(INV-[\w-]+(?:\s+INV-[\w-]+)*)/g;
const ANNOTATION_PRESENT_RE = /@organon-invariant\s+INV-[\w-]+/;
const TESTING_IMPORT_RE = /from\s+['"]@organon-methodology\/testing|import\s+io\.github\.vledicfranco\.organon\.testing\./;
const TEST_INVARIANT_RE = /testInvariant\s*\(/;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExtractedInvariant extends InvariantEntry {
  file: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Extract invariant entries from all type: constraints files.
 */
export function extractInvariants(
  files: Array<{ path: string; frontmatter: { type?: string; invariants?: InvariantEntry[] } | null }>,
): ExtractedInvariant[] {
  const result: ExtractedInvariant[] = [];
  for (const file of files) {
    if (file.frontmatter?.type !== 'constraints') continue;
    if (!file.frontmatter.invariants) continue;
    for (const inv of file.frontmatter.invariants) {
      result.push({ ...inv, file: file.path });
    }
  }
  return result;
}

/**
 * Scan test files for @organon-invariant annotations.
 * Returns a map: invariant ID → list of "file:line" references.
 */
export async function scanTestAnnotations(
  fs: FileSystem,
  projectRoot: string,
  config: OrganonConfig,
): Promise<Map<string, string[]>> {
  const testGlobs = config.testGlobs ?? DEFAULT_TEST_GLOBS;
  const ignorePatterns = config.testIgnorePatterns ?? config.ignorePatterns;
  const annotations = new Map<string, string[]>();

  for (const pattern of testGlobs) {
    const files = await fs.glob(pattern, { cwd: projectRoot, ignore: ignorePatterns });
    for (const file of files) {
      const absPath = joinPath(projectRoot, file);
      let content: string;
      try {
        content = await fs.readFile(absPath);
      } catch {
        continue;
      }

      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let match: RegExpExecArray | null;
        // Reset regex state for each line
        ANNOTATION_RE.lastIndex = 0;
        while ((match = ANNOTATION_RE.exec(line)) !== null) {
          const ids = match[1].split(/\s+/);
          for (const id of ids) {
            const refs = annotations.get(id) ?? [];
            refs.push(`${file}:${i + 1}`);
            annotations.set(id, refs);
          }
        }
      }
    }
  }

  return annotations;
}

/**
 * Compute coverage by joining invariants with test annotations.
 */
export function computeCoverage(
  invariants: ExtractedInvariant[],
  annotations: Map<string, string[]>,
): InvariantCoverageResult {
  const errors: DiagnosticMessage[] = [];
  const warnings: DiagnosticMessage[] = [];
  const entries: InvariantCoverageEntry[] = [];

  let covered = 0;
  let uncovered = 0;
  let judgmentCall = 0;

  for (const inv of invariants) {
    const tests = annotations.get(inv.id) ?? [];

    if (inv.judgment_call) {
      entries.push({
        id: inv.id,
        name: inv.name,
        file: inv.file,
        status: 'judgment_call',
        tests,
      });
      judgmentCall++;
    } else if (tests.length > 0) {
      entries.push({
        id: inv.id,
        name: inv.name,
        file: inv.file,
        status: 'covered',
        tests,
      });
      covered++;
    } else {
      entries.push({
        id: inv.id,
        name: inv.name,
        file: inv.file,
        status: 'uncovered',
        tests: [],
      });
      uncovered++;
      errors.push({
        severity: 'error',
        code: 'INVARIANT_UNCOVERED',
        message: `Invariant ${inv.id} (${inv.name}) has no test with @organon-invariant annotation`,
        file: inv.file,
        suggestion: `Add a test with // @organon-invariant ${inv.id} comment`,
      });
    }
  }

  return {
    success: uncovered === 0,
    invariants: entries,
    summary: {
      total: invariants.length,
      covered,
      uncovered,
      judgment_call: judgmentCall,
    },
    errors,
    warnings,
  };
}

/**
 * Check that test files with @organon-invariant annotations import from
 * @organon-methodology/testing and call testInvariant(). Produces warnings.
 */
async function checkTestInfrastructure(
  fs: FileSystem,
  projectRoot: string,
  config: OrganonConfig,
): Promise<DiagnosticMessage[]> {
  const testGlobs = config.testGlobs ?? DEFAULT_TEST_GLOBS;
  const ignorePatterns = config.testIgnorePatterns ?? config.ignorePatterns;
  const warnings: DiagnosticMessage[] = [];

  for (const pattern of testGlobs) {
    const files = await fs.glob(pattern, { cwd: projectRoot, ignore: ignorePatterns });
    for (const file of files) {
      const absPath = joinPath(projectRoot, file);
      let content: string;
      try {
        content = await fs.readFile(absPath);
      } catch {
        continue;
      }
      if (!ANNOTATION_PRESENT_RE.test(content)) continue;

      if (!TESTING_IMPORT_RE.test(content)) {
        const isScala = file.endsWith('.scala');
        warnings.push({
          severity: 'warning',
          code: 'TIER4_MISSING_IMPORT',
          message: `Test file has @organon-invariant annotation but does not import from @organon-methodology/testing`,
          file,
          suggestion: isScala
            ? `Add: import io.github.vledicfranco.organon.testing.adapters.OrganonSuite`
            : `Add: import { testInvariant } from '@organon-methodology/testing/vitest';`,
        });
      }

      if (!TEST_INVARIANT_RE.test(content)) {
        warnings.push({
          severity: 'warning',
          code: 'TIER4_MISSING_TEST_INVARIANT',
          message: `Test file has @organon-invariant annotation but does not call testInvariant()`,
          file,
          suggestion: `Wrap assertions with testInvariant('INV-ID', 'description', async () => { ... });`,
        });
      }
    }
  }

  return warnings;
}

/**
 * Full coverage pipeline: discover organon files, extract invariants,
 * scan tests, compute coverage.
 */
export async function computeInvariantCoverage(options: {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
}): Promise<InvariantCoverageResult> {
  const { projectRoot, config, fs: fileSystem } = options;

  // Discover organon files and parse frontmatter
  const files = await discoverOrganonFiles(projectRoot, config, fileSystem);
  const parsedFiles: Array<{ path: string; frontmatter: { type?: string; invariants?: InvariantEntry[] } | null }> = [];

  for (const file of files) {
    const absPath = joinPath(projectRoot, file);
    try {
      const content = await fileSystem.readFile(absPath);
      const { frontmatter } = parseFrontmatter(content);
      parsedFiles.push({ path: file, frontmatter });
    } catch {
      // Skip unreadable files
    }
  }

  const invariants = extractInvariants(parsedFiles);
  const [annotations, infraWarnings] = await Promise.all([
    scanTestAnnotations(fileSystem, projectRoot, config),
    checkTestInfrastructure(fileSystem, projectRoot, config),
  ]);
  const coverage = computeCoverage(invariants, annotations);
  return { ...coverage, warnings: [...coverage.warnings, ...infraWarnings] };
}
