import { describe, it, expect } from 'vitest';
import { generateTests } from './generate-tests.js';
import { MemoryFileSystem, makeEthos } from './test-helpers.js';
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
    ...overrides,
  };
}

function makeEthosWithInvariants(invariants: Array<{ id: string; name: string; judgment_call?: boolean }>): string {
  const invYaml = invariants.map((inv) => {
    const jc = inv.judgment_call ? `\n    judgment_call: true` : '';
    return `  - id: ${inv.id}\n    name: ${inv.name}${jc}`;
  }).join('\n');

  return `---
type: constraints
scope: domain
name: test-domain
version: "1.0"
summary: Test ethos
token_estimate: 500
invariants_count: ${invariants.length}
principles_count: 1
heuristics_count: 1
invariants:
${invYaml}
---

# Test Domain

## Identity

### What This IS
- A test domain

### What This IS NOT
- Not production

## Invariants

1. **Rule 1.** Test rule.

## Principles (Prioritized)

1. **Principle 1.** Test principle.

## Decision Heuristics

| Situation | Action |
|-----------|--------|
| Test | Do test |
`;
}

describe('generateTests', () => {
  it('generates scaffolds for uncovered invariants', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthosWithInvariants([
        { id: 'INV-TEST-1', name: 'max-timeout' },
      ]),
    });

    const result = await generateTests({
      projectRoot: PROJECT_ROOT,
      config: makeConfig(),
      fs,
    });

    expect(result.generated).toHaveLength(1);
    expect(result.generated[0].invariant.id).toBe('INV-TEST-1');
    expect(result.generated[0].assertion).toBe('assertMaxValue');
    expect(result.generated[0].code).toContain('assertMaxValue');
    expect(result.generated[0].code).toContain('@organon-invariant INV-TEST-1');
    expect(result.generated[0].filename).toBe('inv-test-1.test.ts');
  });

  it('skips already covered invariants', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthosWithInvariants([
        { id: 'INV-TEST-1', name: 'max-timeout' },
      ]),
      '/project/tests/my-test.test.ts': `// @organon-invariant INV-TEST-1\nconsole.log("test");`,
    });

    const result = await generateTests({
      projectRoot: PROJECT_ROOT,
      config: makeConfig({ testGlobs: ['tests/**/*.test.ts'] }),
      fs,
    });

    expect(result.generated).toHaveLength(0);
    expect(result.alreadyCovered).toHaveLength(1);
  });

  it('separates judgment calls', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthosWithInvariants([
        { id: 'INV-TEST-1', name: 'requires-human-review', judgment_call: true },
      ]),
    });

    const result = await generateTests({
      projectRoot: PROJECT_ROOT,
      config: makeConfig(),
      fs,
    });

    expect(result.generated).toHaveLength(0);
    expect(result.judgmentCalls).toHaveLength(1);
  });

  it('matches heuristic: "pure" → assertNoSideEffects', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthosWithInvariants([
        { id: 'INV-TEST-1', name: 'assertion-logic-pure' },
      ]),
    });

    const result = await generateTests({
      projectRoot: PROJECT_ROOT,
      config: makeConfig(),
      fs,
    });

    expect(result.generated[0].assertion).toBe('assertNoSideEffects');
  });

  it('matches heuristic: "exists" → assertFileExists', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthosWithInvariants([
        { id: 'INV-TEST-1', name: 'config-file-must-exist' },
      ]),
    });

    const result = await generateTests({
      projectRoot: PROJECT_ROOT,
      config: makeConfig(),
      fs,
    });

    expect(result.generated[0].assertion).toBe('assertFileExists');
  });

  it('matches heuristic: "naming" → assertNamingConvention', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthosWithInvariants([
        { id: 'INV-TEST-1', name: 'file-naming-convention' },
      ]),
    });

    const result = await generateTests({
      projectRoot: PROJECT_ROOT,
      config: makeConfig(),
      fs,
    });

    expect(result.generated[0].assertion).toBe('assertNamingConvention');
  });

  it('falls back to assertCustom for unrecognized patterns', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthosWithInvariants([
        { id: 'INV-TEST-1', name: 'something-unusual' },
      ]),
    });

    const result = await generateTests({
      projectRoot: PROJECT_ROOT,
      config: makeConfig(),
      fs,
    });

    expect(result.generated[0].assertion).toBe('assertCustom');
  });

  it('filters by invariantIds when specified', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthosWithInvariants([
        { id: 'INV-A-1', name: 'max-timeout' },
        { id: 'INV-B-1', name: 'side-effect-free' },
        { id: 'INV-C-1', name: 'file-exists' },
      ]),
    });

    const result = await generateTests({
      projectRoot: PROJECT_ROOT,
      config: makeConfig(),
      fs,
      invariantIds: ['INV-B-1'],
    });

    expect(result.generated).toHaveLength(1);
    expect(result.generated[0].invariant.id).toBe('INV-B-1');
  });

  it('returns empty when no invariants defined', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthos({ invariants: 0 }),
    });

    const result = await generateTests({
      projectRoot: PROJECT_ROOT,
      config: makeConfig(),
      fs,
    });

    expect(result.generated).toHaveLength(0);
    expect(result.alreadyCovered).toHaveLength(0);
    expect(result.judgmentCalls).toHaveLength(0);
  });

  it('generated code includes testInvariant wrapper', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthosWithInvariants([
        { id: 'INV-TEST-1', name: 'limit-check' },
      ]),
    });

    const result = await generateTests({
      projectRoot: PROJECT_ROOT,
      config: makeConfig(),
      fs,
    });

    expect(result.generated[0].code).toContain("testInvariant('INV-TEST-1'");
    expect(result.generated[0].code).toContain("import { testInvariant } from '@organon-methodology/testing/vitest'");
  });
});
