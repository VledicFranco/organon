import { describe, it, expect } from 'vitest';
import { verifyTier4Tests } from './verify-tier4-tests.js';
import { MemoryFileSystem } from './test-helpers.js';
import type { OrganonConfig } from './types.js';

const PROJECT_ROOT = '/project';

function makeConfig(overrides?: Partial<OrganonConfig>): OrganonConfig {
  return {
    projectRoot: PROJECT_ROOT,
    organonPaths: ['.'],
    organonGlobs: ['**/ETHOS.md'],
    ignorePatterns: ['node_modules/**'],
    workflowPaths: {},
    freshnessThresholdHours: 720,
    testGlobs: ['**/*.test.ts'],
    testIgnorePatterns: ['node_modules/**'],
    ...overrides,
  };
}

describe('verifyTier4Tests', () => {
  it('passes when annotated files have proper imports and testInvariant calls', async () => {
    const fs = new MemoryFileSystem({
      '/project/tests/my.test.ts': [
        `// @organon-invariant INV-FOO-1`,
        `import { testInvariant } from '@organon/testing/vitest';`,
        `testInvariant('INV-FOO-1', 'test', async () => {});`,
      ].join('\n'),
    });

    const result = await verifyTier4Tests({
      projectRoot: PROJECT_ROOT,
      config: makeConfig(),
      fs,
    });

    expect(result.success).toBe(true);
    expect(result.annotatedFiles).toBe(1);
    expect(result.validFiles).toBe(1);
    expect(result.warnings).toHaveLength(0);
  });

  it('warns when annotated file is missing @organon/testing import', async () => {
    const fs = new MemoryFileSystem({
      '/project/tests/my.test.ts': [
        `// @organon-invariant INV-FOO-1`,
        `import { it } from 'vitest';`,
        `it('test', () => {});`,
      ].join('\n'),
    });

    const result = await verifyTier4Tests({
      projectRoot: PROJECT_ROOT,
      config: makeConfig(),
      fs,
    });

    // Advisory gate — still passes
    expect(result.success).toBe(true);
    expect(result.warnings.some((w) => w.code === 'TIER4_MISSING_IMPORT')).toBe(true);
    expect(result.warnings.some((w) => w.code === 'TIER4_MISSING_TEST_INVARIANT')).toBe(true);
  });

  it('warns when annotated file has import but no testInvariant call', async () => {
    const fs = new MemoryFileSystem({
      '/project/tests/my.test.ts': [
        `// @organon-invariant INV-FOO-1`,
        `import { assertMaxValue } from '@organon/testing/vitest';`,
        `// no testInvariant call`,
      ].join('\n'),
    });

    const result = await verifyTier4Tests({
      projectRoot: PROJECT_ROOT,
      config: makeConfig(),
      fs,
    });

    expect(result.success).toBe(true);
    expect(result.warnings.some((w) => w.code === 'TIER4_MISSING_TEST_INVARIANT')).toBe(true);
  });

  it('ignores test files without annotations', async () => {
    const fs = new MemoryFileSystem({
      '/project/tests/regular.test.ts': [
        `import { it } from 'vitest';`,
        `it('regular test', () => {});`,
      ].join('\n'),
    });

    const result = await verifyTier4Tests({
      projectRoot: PROJECT_ROOT,
      config: makeConfig(),
      fs,
    });

    expect(result.success).toBe(true);
    expect(result.annotatedFiles).toBe(0);
    expect(result.filesScanned).toBe(1);
  });

  it('warns when no annotated files found', async () => {
    const fs = new MemoryFileSystem({
      '/project/tests/regular.test.ts': `// no annotations\nit('test', () => {});`,
    });

    const result = await verifyTier4Tests({
      projectRoot: PROJECT_ROOT,
      config: makeConfig(),
      fs,
    });

    expect(result.success).toBe(true);
    expect(result.warnings.some((w) => w.code === 'TIER4_NO_ANNOTATED_FILES')).toBe(true);
  });

  it('checks multiple files independently', async () => {
    const fs = new MemoryFileSystem({
      '/project/tests/good.test.ts': [
        `// @organon-invariant INV-FOO-1`,
        `import { testInvariant } from '@organon/testing/vitest';`,
        `testInvariant('INV-FOO-1', 'test', async () => {});`,
      ].join('\n'),
      '/project/tests/bad.test.ts': [
        `// @organon-invariant INV-BAR-1`,
        `import { it } from 'vitest';`,
        `it('test', () => {});`,
      ].join('\n'),
    });

    const result = await verifyTier4Tests({
      projectRoot: PROJECT_ROOT,
      config: makeConfig(),
      fs,
    });

    expect(result.success).toBe(true); // Advisory
    expect(result.annotatedFiles).toBe(2);
    expect(result.validFiles).toBe(1);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('reports warning suggestions with correct import path', async () => {
    const fs = new MemoryFileSystem({
      '/project/tests/my.test.ts': [
        `// @organon-invariant INV-FOO-1`,
        `console.log('no imports at all');`,
      ].join('\n'),
    });

    const result = await verifyTier4Tests({
      projectRoot: PROJECT_ROOT,
      config: makeConfig(),
      fs,
    });

    const importWarning = result.warnings.find((w) => w.code === 'TIER4_MISSING_IMPORT');
    expect(importWarning).toBeDefined();
    expect(importWarning!.suggestion).toContain('@organon/testing/vitest');
    expect(importWarning!.file).toBe('tests/my.test.ts');
  });
});
