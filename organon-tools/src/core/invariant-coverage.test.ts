import { describe, it, expect } from 'vitest';
import { extractInvariants, scanTestAnnotations, computeCoverage, computeInvariantCoverage } from './invariant-coverage.js';
import { MemoryFileSystem, makeEthos } from './test-helpers.js';
import type { InvariantEntry, OrganonConfig } from './types.js';

function makeConfig(projectRoot: string): OrganonConfig {
  return {
    projectRoot,
    organonPaths: ['.'],
    organonGlobs: ['**/ETHOS.md'],
    ignorePatterns: ['node_modules/**'],
    workflowPaths: {},
    freshnessThresholdHours: 24,
  };
}

describe('extractInvariants', () => {
  it('extracts invariants from constraints files', () => {
    const files = [
      {
        path: 'ETHOS.md',
        frontmatter: {
          type: 'constraints' as const,
          invariants: [
            { id: 'INV-META-1', name: 'ethos-required' },
            { id: 'INV-META-2', name: 'identity-first', judgment_call: true },
          ],
        },
      },
    ];
    const result = extractInvariants(files);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: 'INV-META-1', name: 'ethos-required', file: 'ETHOS.md' });
    expect(result[1]).toEqual({ id: 'INV-META-2', name: 'identity-first', judgment_call: true, file: 'ETHOS.md' });
  });

  it('ignores non-constraints files', () => {
    const files = [
      {
        path: 'PHILOSOPHY.md',
        frontmatter: {
          type: 'rationale' as const,
          invariants: [{ id: 'INV-X-1', name: 'should-not-appear' }],
        },
      },
    ];
    const result = extractInvariants(files);
    expect(result).toHaveLength(0);
  });

  it('handles files with no invariants array', () => {
    const files = [
      {
        path: 'ETHOS.md',
        frontmatter: { type: 'constraints' as const },
      },
    ];
    const result = extractInvariants(files);
    expect(result).toHaveLength(0);
  });

  it('handles files with null frontmatter', () => {
    const files = [{ path: 'ETHOS.md', frontmatter: null }];
    const result = extractInvariants(files);
    expect(result).toHaveLength(0);
  });
});

describe('scanTestAnnotations', () => {
  it('finds annotations in test files', async () => {
    const fs = new MemoryFileSystem({
      '/project/src/core/verify.test.ts': `import { describe, it } from 'vitest';
// @organon-invariant INV-META-1
it('ethos is required', () => {
  expect(true).toBe(true);
});`,
    });
    const config = makeConfig('/project');
    const result = await scanTestAnnotations(fs, '/project', config);
    expect(result.get('INV-META-1')).toEqual(['src/core/verify.test.ts:2']);
  });

  it('handles multiple IDs on one line', async () => {
    const fs = new MemoryFileSystem({
      '/project/src/test.test.ts': `// @organon-invariant INV-META-1 INV-META-2
it('tests both', () => {});`,
    });
    const config = makeConfig('/project');
    const result = await scanTestAnnotations(fs, '/project', config);
    expect(result.get('INV-META-1')).toEqual(['src/test.test.ts:1']);
    expect(result.get('INV-META-2')).toEqual(['src/test.test.ts:1']);
  });

  it('finds annotations across multiple files', async () => {
    const fs = new MemoryFileSystem({
      '/project/src/a.test.ts': `// @organon-invariant INV-META-1
it('test a', () => {});`,
      '/project/src/b.test.ts': `// @organon-invariant INV-META-1
it('test b', () => {});`,
    });
    const config = makeConfig('/project');
    const result = await scanTestAnnotations(fs, '/project', config);
    expect(result.get('INV-META-1')).toHaveLength(2);
  });

  it('returns empty map when no test files exist', async () => {
    const fs = new MemoryFileSystem({});
    const config = makeConfig('/project');
    const result = await scanTestAnnotations(fs, '/project', config);
    expect(result.size).toBe(0);
  });
});

describe('computeCoverage', () => {
  it('classifies covered invariants', () => {
    const invariants = [
      { id: 'INV-META-1', name: 'ethos-required', file: 'ETHOS.md' },
    ];
    const annotations = new Map([['INV-META-1', ['test.ts:5']]]);
    const result = computeCoverage(invariants, annotations);
    expect(result.success).toBe(true);
    expect(result.invariants[0].status).toBe('covered');
    expect(result.summary.covered).toBe(1);
    expect(result.summary.uncovered).toBe(0);
  });

  it('classifies uncovered invariants', () => {
    const invariants = [
      { id: 'INV-META-1', name: 'ethos-required', file: 'ETHOS.md' },
    ];
    const annotations = new Map<string, string[]>();
    const result = computeCoverage(invariants, annotations);
    expect(result.success).toBe(false);
    expect(result.invariants[0].status).toBe('uncovered');
    expect(result.summary.uncovered).toBe(1);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'INVARIANT_UNCOVERED' }),
    );
  });

  it('classifies judgment_call invariants', () => {
    const invariants = [
      { id: 'INV-META-2', name: 'identity-first', judgment_call: true, file: 'ETHOS.md' },
    ];
    const annotations = new Map<string, string[]>();
    const result = computeCoverage(invariants, annotations);
    expect(result.success).toBe(true);
    expect(result.invariants[0].status).toBe('judgment_call');
    expect(result.summary.judgment_call).toBe(1);
    expect(result.summary.uncovered).toBe(0);
  });

  it('reports success when all non-judgment invariants are covered', () => {
    const invariants = [
      { id: 'INV-META-1', name: 'ethos-required', file: 'ETHOS.md' },
      { id: 'INV-META-2', name: 'identity-first', judgment_call: true, file: 'ETHOS.md' },
      { id: 'INV-META-3', name: 'principles-prioritized', file: 'ETHOS.md' },
    ];
    const annotations = new Map([
      ['INV-META-1', ['a.test.ts:1']],
      ['INV-META-3', ['b.test.ts:2']],
    ]);
    const result = computeCoverage(invariants, annotations);
    expect(result.success).toBe(true);
    expect(result.summary).toEqual({ total: 3, covered: 2, uncovered: 0, judgment_call: 1 });
  });

  it('reports failure when any non-judgment invariant is uncovered', () => {
    const invariants = [
      { id: 'INV-META-1', name: 'ethos-required', file: 'ETHOS.md' },
      { id: 'INV-META-2', name: 'identity-first', judgment_call: true, file: 'ETHOS.md' },
      { id: 'INV-META-3', name: 'uncovered-one', file: 'ETHOS.md' },
    ];
    const annotations = new Map([
      ['INV-META-1', ['a.test.ts:1']],
    ]);
    const result = computeCoverage(invariants, annotations);
    expect(result.success).toBe(false);
    expect(result.summary.uncovered).toBe(1);
  });
});

describe('computeInvariantCoverage (integration)', () => {
  it('runs the full pipeline', async () => {
    const ethosContent = makeEthos({
      name: 'test',
      scope: 'meta',
      extra: {
        invariants: `\n  - id: INV-TEST-1\n    name: rule-one\n  - id: INV-TEST-2\n    name: rule-two\n    judgment_call: true`,
      },
    });
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': ethosContent,
      '/project/src/core/check.test.ts': `// @organon-invariant INV-TEST-1
it('tests rule one', () => {});`,
    });
    const config = makeConfig('/project');
    const result = await computeInvariantCoverage({ projectRoot: '/project', config, fs });
    expect(result.success).toBe(true);
    expect(result.summary.total).toBe(2);
    expect(result.summary.covered).toBe(1);
    expect(result.summary.judgment_call).toBe(1);
    expect(result.summary.uncovered).toBe(0);
  });
});
