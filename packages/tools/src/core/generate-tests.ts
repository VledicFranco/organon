/**
 * generate-tests — Find uncovered invariants and generate test scaffolds.
 *
 * Scans organon files for invariant declarations, checks which ones
 * already have tests (via @organon-invariant annotations), and generates
 * test scaffold files for uncovered invariants using heuristic assertion matching.
 */

import { parseFrontmatter } from './frontmatter-parser.js';
import { joinPath } from './config.js';
import { discoverOrganonFiles } from './discover.js';
import {
  extractInvariants,
  scanTestAnnotations,
  type ExtractedInvariant,
} from './invariant-coverage.js';
import type {
  FileSystem,
  InvariantEntry,
  OrganonConfig,
} from './types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GenerateTestsOptions {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
  /** If set, only generate for these invariant IDs */
  invariantIds?: string[];
  /** Directory to write generated test files */
  outDir?: string;
}

export interface GeneratedTest {
  /** The invariant this test covers */
  invariant: ExtractedInvariant;
  /** Suggested assertion function */
  assertion: string;
  /** Generated test scaffold code */
  code: string;
  /** Suggested filename */
  filename: string;
}

export interface GenerateTestsResult {
  /** Tests generated for uncovered invariants */
  generated: GeneratedTest[];
  /** Invariants that already have test coverage */
  alreadyCovered: ExtractedInvariant[];
  /** Invariants marked as judgment calls */
  judgmentCalls: ExtractedInvariant[];
}

// ---------------------------------------------------------------------------
// Heuristic assertion matching
// ---------------------------------------------------------------------------

interface AssertionTemplate {
  assertion: string;
  scaffold: (inv: ExtractedInvariant) => string;
}

function matchAssertion(invariant: ExtractedInvariant): AssertionTemplate {
  const name = invariant.name.toLowerCase();
  const id = invariant.id.toLowerCase();
  const combined = `${name} ${id}`;

  if (/max|limit|threshold|ceiling|bound/.test(combined)) {
    return {
      assertion: 'assertMaxValue',
      scaffold: (inv) => scaffoldMaxValue(inv),
    };
  }

  if (/pure|side.?effect|no.?io|no.?import/.test(combined)) {
    return {
      assertion: 'assertNoSideEffects',
      scaffold: (inv) => scaffoldNoSideEffects(inv),
    };
  }

  if (/naming|convention|case|kebab|camel|pascal|snake/.test(combined)) {
    return {
      assertion: 'assertNamingConvention',
      scaffold: (inv) => scaffoldNamingConvention(inv),
    };
  }

  if (/exist|present|require|file/.test(combined)) {
    return {
      assertion: 'assertFileExists',
      scaffold: (inv) => scaffoldFileExists(inv),
    };
  }

  return {
    assertion: 'assertCustom',
    scaffold: (inv) => scaffoldCustom(inv),
  };
}

// ---------------------------------------------------------------------------
// Scaffold templates
// ---------------------------------------------------------------------------

function testFileHeader(inv: ExtractedInvariant): string {
  return `// @organon-invariant ${inv.id}
import { describe } from 'vitest';
import { testInvariant } from '@organon-methodology/testing/vitest';
`;
}

function scaffoldMaxValue(inv: ExtractedInvariant): string {
  return `${testFileHeader(inv)}import { assertMaxValue } from '@organon-methodology/testing/vitest';

describe('${inv.id}', () => {
  testInvariant('${inv.id}', '${inv.name}', async () => {
    await assertMaxValue({
      files: ['src/**/*.ts'],   // TODO: adjust file pattern
      pattern: /TODO_PATTERN/,  // TODO: regex with capturing group for numeric value
      maxValue: 100,            // TODO: set appropriate maximum
      unit: 'TODO',             // TODO: set unit (e.g., 'lines', 'seconds')
    });
  });
});
`;
}

function scaffoldNoSideEffects(inv: ExtractedInvariant): string {
  return `${testFileHeader(inv)}import { assertNoSideEffects } from '@organon-methodology/testing/vitest';

describe('${inv.id}', () => {
  testInvariant('${inv.id}', '${inv.name}', async () => {
    await assertNoSideEffects({
      files: ['src/**/*.ts'],                 // TODO: adjust file pattern
      forbiddenModules: ['fs', 'http'],       // TODO: adjust forbidden modules
    });
  });
});
`;
}

function scaffoldFileExists(inv: ExtractedInvariant): string {
  return `${testFileHeader(inv)}import { assertFileExists } from '@organon-methodology/testing/vitest';

describe('${inv.id}', () => {
  testInvariant('${inv.id}', '${inv.name}', async () => {
    await assertFileExists({
      files: ['TODO/path/to/required-file.ts'],  // TODO: list required files
    });
  });
});
`;
}

function scaffoldNamingConvention(inv: ExtractedInvariant): string {
  return `${testFileHeader(inv)}import { assertNamingConvention } from '@organon-methodology/testing/vitest';

describe('${inv.id}', () => {
  testInvariant('${inv.id}', '${inv.name}', async () => {
    await assertNamingConvention({
      mode: 'filenames',              // TODO: 'filenames' or 'identifiers'
      files: ['src/**/*.ts'],         // TODO: adjust file pattern
      convention: 'kebab-case',       // TODO: adjust convention
    });
  });
});
`;
}

function scaffoldCustom(inv: ExtractedInvariant): string {
  return `${testFileHeader(inv)}import { assertCustom } from '@organon-methodology/testing/vitest';

describe('${inv.id}', () => {
  testInvariant('${inv.id}', '${inv.name}', async () => {
    await assertCustom({
      label: '${inv.name}',
      validate: async () => {
        // TODO: implement custom validation logic
        throw new Error('Not implemented');
      },
    });
  });
});
`;
}

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

/**
 * Generate test scaffolds for uncovered invariants.
 */
export async function generateTests(
  options: GenerateTestsOptions,
): Promise<GenerateTestsResult> {
  const { projectRoot, config, fs, invariantIds } = options;

  // 1. Discover organon files and extract invariants
  const discoveredFiles = await discoverOrganonFiles(projectRoot, config, fs);
  const parsedFiles: Array<{
    path: string;
    frontmatter: { type?: string; invariants?: InvariantEntry[] } | null;
  }> = [];

  for (const file of discoveredFiles) {
    const absPath = joinPath(projectRoot, file);
    try {
      const content = await fs.readFile(absPath);
      const { frontmatter } = parseFrontmatter(content);
      parsedFiles.push({ path: file, frontmatter });
    } catch {
      // Skip unreadable files
    }
  }

  const allInvariants = extractInvariants(parsedFiles);

  // 2. Filter by requested IDs if specified
  const targetInvariants = invariantIds
    ? allInvariants.filter((inv) => invariantIds.includes(inv.id))
    : allInvariants;

  // 3. Scan for existing test annotations
  const annotations = await scanTestAnnotations(fs, projectRoot, config);

  // 4. Categorize invariants
  const generated: GeneratedTest[] = [];
  const alreadyCovered: ExtractedInvariant[] = [];
  const judgmentCalls: ExtractedInvariant[] = [];

  for (const inv of targetInvariants) {
    if (inv.judgment_call) {
      judgmentCalls.push(inv);
      continue;
    }

    const existingTests = annotations.get(inv.id) ?? [];
    if (existingTests.length > 0) {
      alreadyCovered.push(inv);
      continue;
    }

    // Generate scaffold
    const template = matchAssertion(inv);
    const code = template.scaffold(inv);
    const filename = `${inv.id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.test.ts`;

    generated.push({
      invariant: inv,
      assertion: template.assertion,
      code,
      filename,
    });
  }

  return { generated, alreadyCovered, judgmentCalls };
}
