/**
 * Dogfood tests: @organon/testing used inside @organon/tools.
 *
 * These tests exercise the @organon/testing library against real source files
 * in this package, proving the API works end-to-end from a consumer perspective.
 *
 * @organon-invariant INV-TOOLS-1 schema-fidelity
 * @organon-invariant INV-TOOLS-2 every-command-has-tests
 */

import { describe } from 'vitest';
import { testInvariant, assertMaxValue } from '@organon/testing/vitest';
import { resolve } from 'node:path';
import { readdir } from 'node:fs/promises';

const coreDir = resolve(import.meta.dirname, '.');

describe('@organon/testing dogfood — tools invariant verification', () => {
  // -------------------------------------------------------------------------
  // INV-TOOLS-1: schema-fidelity — MAX_SUMMARY_LENGTH ≤ 200
  // -------------------------------------------------------------------------
  testInvariant(
    'INV-TOOLS-1',
    'MAX_SUMMARY_LENGTH does not exceed 200 characters',
    async () => {
      await assertMaxValue({
        files: ['src/core/validate-frontmatter.ts'],
        pattern: /MAX_SUMMARY_LENGTH\s*=\s*(\d+)/,
        maxValue: 200,
        unit: 'characters',
        cwd: resolve(coreDir, '../..'),
      });
    },
  );

  // -------------------------------------------------------------------------
  // INV-TOOLS-1: schema-fidelity — TOKEN_TOLERANCE ≤ 2.0
  // -------------------------------------------------------------------------
  testInvariant(
    'INV-TOOLS-1',
    'TOKEN_TOLERANCE stays within reasonable bounds (max 2.0)',
    async () => {
      await assertMaxValue({
        files: ['src/core/validate-frontmatter.ts'],
        pattern: /TOKEN_TOLERANCE\s*=\s*([\d.]+)/,
        maxValue: 2.0,
        unit: 'ratio',
        cwd: resolve(coreDir, '../..'),
      });
    },
  );

  // -------------------------------------------------------------------------
  // INV-TOOLS-2: every-command-has-tests — core/ has ≥ 5 test files
  // -------------------------------------------------------------------------
  testInvariant(
    'INV-TOOLS-2',
    'core/ directory has at least 5 test files',
    async () => {
      const entries = await readdir(coreDir);
      const testFiles = entries.filter((f) => f.endsWith('.test.ts'));

      if (testFiles.length < 5) {
        throw new Error(
          `Expected at least 5 test files in core/, found ${testFiles.length}: ${testFiles.join(', ')}`,
        );
      }
    },
  );
});
