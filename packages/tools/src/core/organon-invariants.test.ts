/**
 * Dogfood tests: @organon-methodology/testing used inside @organon-methodology/tools.
 *
 * These tests exercise the @organon-methodology/testing library against real source files
 * in this package, proving the API works end-to-end from a consumer perspective.
 *
 * @organon-invariant INV-TOOLS-1 schema-fidelity
 * @organon-invariant INV-TOOLS-2 every-command-has-tests
 * @organon-invariant INV-TOOLS-3 gates-fail-not-warn
 * @organon-invariant INV-TOOLS-4 machine-parsable-output
 * @organon-invariant INV-TOOLS-5 idempotent-operations
 * @organon-invariant INV-TOOLS-6 breaking-changes-major-version
 */

import { describe } from 'vitest';
import { testInvariant, assertMaxValue } from '@organon-methodology/testing/vitest';
import { resolve } from 'node:path';
import { readdir, readFile } from 'node:fs/promises';
import { validateFrontmatter } from './validate-frontmatter.js';
import { MemoryFileSystem, makeEthos } from './test-helpers.js';
import type { OrganonConfig } from './types.js';

const coreDir = resolve(import.meta.dirname, '.');

describe('@organon-methodology/testing dogfood — tools invariant verification', () => {
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

  // -------------------------------------------------------------------------
  // INV-TOOLS-3: gates-fail-not-warn — gate errors use 'error' severity
  // -------------------------------------------------------------------------
  testInvariant(
    'INV-TOOLS-3',
    'verification gates produce errors (not warnings) for blocking checks',
    async () => {
      // A file missing required frontmatter fields should produce errors, not warnings
      const fs = new MemoryFileSystem({
        '/project/ETHOS.md': '# No frontmatter',
      });
      const config: OrganonConfig = {
        projectRoot: '/project',
        organonPaths: ['.'],
        organonGlobs: ['**/ETHOS.md'],
        ignorePatterns: [],
        workflowPaths: {},
        freshnessThresholdHours: 24,
      };
      const result = await validateFrontmatter({ projectRoot: '/project', config, fs });
      // Must fail (not just warn)
      if (result.success) {
        throw new Error('Gate should fail for missing frontmatter, not silently pass');
      }
      // Blocking issues must be errors, not warnings
      if (result.errors.length === 0) {
        throw new Error('Expected at least one error diagnostic for missing frontmatter');
      }
      for (const err of result.errors) {
        if (err.severity !== 'error') {
          throw new Error(`Blocking diagnostic ${err.code} has severity '${err.severity}', expected 'error'`);
        }
      }
    },
  );

  // -------------------------------------------------------------------------
  // INV-TOOLS-4: machine-parsable-output — results are structured objects
  // -------------------------------------------------------------------------
  testInvariant(
    'INV-TOOLS-4',
    'validation results are structured objects with success/errors fields',
    async () => {
      const fs = new MemoryFileSystem({
        '/project/ETHOS.md': makeEthos(),
      });
      const config: OrganonConfig = {
        projectRoot: '/project',
        organonPaths: ['.'],
        organonGlobs: ['**/ETHOS.md'],
        ignorePatterns: [],
        workflowPaths: {},
        freshnessThresholdHours: 24,
      };
      const result = await validateFrontmatter({ projectRoot: '/project', config, fs });
      // Result must have structured fields for programmatic consumption
      if (typeof result.success !== 'boolean') {
        throw new Error('Result must have boolean success field');
      }
      if (!Array.isArray(result.errors)) {
        throw new Error('Result must have errors array');
      }
      if (!Array.isArray(result.warnings)) {
        throw new Error('Result must have warnings array');
      }
    },
  );

  // -------------------------------------------------------------------------
  // INV-TOOLS-5: idempotent-operations — same input → same output
  // -------------------------------------------------------------------------
  testInvariant(
    'INV-TOOLS-5',
    're-running validation with identical input produces identical output',
    async () => {
      const fs = new MemoryFileSystem({
        '/project/ETHOS.md': makeEthos(),
      });
      const config: OrganonConfig = {
        projectRoot: '/project',
        organonPaths: ['.'],
        organonGlobs: ['**/ETHOS.md'],
        ignorePatterns: [],
        workflowPaths: {},
        freshnessThresholdHours: 24,
      };
      const opts = { projectRoot: '/project', config, fs };
      const result1 = await validateFrontmatter(opts);
      const result2 = await validateFrontmatter(opts);
      if (result1.success !== result2.success) {
        throw new Error('Idempotency violated: success differs between runs');
      }
      if (result1.errors.length !== result2.errors.length) {
        throw new Error('Idempotency violated: error count differs between runs');
      }
    },
  );

  // -------------------------------------------------------------------------
  // INV-TOOLS-6: breaking-changes-major-version — version is semver
  // -------------------------------------------------------------------------
  testInvariant(
    'INV-TOOLS-6',
    'package.json version follows semver format',
    async () => {
      const pkgPath = resolve(coreDir, '../../package.json');
      const pkgJson = JSON.parse(await readFile(pkgPath, 'utf-8'));
      const semverRe = /^\d+\.\d+\.\d+/;
      if (!semverRe.test(pkgJson.version)) {
        throw new Error(`Version "${pkgJson.version}" does not follow semver`);
      }
    },
  );
});
