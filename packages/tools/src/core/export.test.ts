/**
 * Tests for organon export (knowledge graph).
 *
 * @organon-invariant INV-TOOLS-2 every-command-has-tests
 */

import { describe, it, expect } from 'vitest';
import { exportKnowledgeGraph } from './export.js';
import { MemoryFileSystem, makeEthos, makePhilosophy, makeReadme } from './test-helpers.js';
import type { OrganonConfig } from './types.js';

function makeConfig(projectRoot: string): OrganonConfig {
  return {
    projectRoot,
    organonPaths: ['.', 'organon'],
    organonGlobs: ['**/ETHOS.md', '**/PHILOSOPHY.md', '**/PROTOCOLS.md', '**/README.md', '**/observations/*.md'],
    ignorePatterns: [],
    workflowPaths: {},
    freshnessThresholdHours: 24,
  };
}

const observationContent = `---
type: rationale
scope: product
name: test-observation
version: "1.0"
summary: Two review passes is optimal for organon files
token_estimate: 300
status: pattern
created: "2026-02-15"
---

# Observation 001

Some learning about review passes.
`;

const ethosWithInvariants = `---
type: constraints
scope: domain
name: tools
version: "1.0"
summary: Tools domain constraints
token_estimate: 500
invariants_count: 2
principles_count: 1
heuristics_count: 1
invariants:
  - id: INV-TOOLS-1
    name: schema-fidelity
  - id: INV-TOOLS-2
    name: every-command-tested
inherits_from:
  - product
related_domains:
  - testing
---

# tools

## Identity

### What tools IS
- A CLI

### What tools IS NOT
- Not a library

## Invariants

1. **Schema fidelity.** All frontmatter validated.
2. **Every command tested.** All commands have tests.

## Principles (Prioritized)

1. **Fail fast.** Stop on first error.

## Decision Heuristics

| Situation | Action |
|-----------|--------|
| New command | Add tests |
`;

describe('exportKnowledgeGraph', () => {
  function makeFs() {
    return new MemoryFileSystem({
      '/project/organon/domains/tools/ETHOS.md': ethosWithInvariants,
      '/project/organon/observations/001-test.md': observationContent,
      '/project/organon/domains/tools/PHILOSOPHY.md': makePhilosophy({ name: 'tools-phil' }),
      '/project/README.md': makeReadme({ name: 'root', scope: 'product' }),
    });
  }

  it('returns structured export with all sections', async () => {
    const fs = makeFs();
    const config = makeConfig('/project');
    const result = await exportKnowledgeGraph({
      projectRoot: '/project',
      config,
      fs,
      version: '0.4.1',
    });

    expect(result.version).toBe('0.4.1');
    expect(result.exported_at).toBeTruthy();
    expect(result.entities).toBeInstanceOf(Array);
    expect(result.assertions).toBeInstanceOf(Array);
    expect(result.relationships).toBeInstanceOf(Array);
    expect(result.rules).toBeInstanceOf(Array);
  });

  it('builds entities from parsed files', async () => {
    const fs = makeFs();
    const config = makeConfig('/project');
    const result = await exportKnowledgeGraph({
      projectRoot: '/project',
      config,
      fs,
      version: '0.4.1',
    });

    expect(result.entities.length).toBeGreaterThan(0);

    const toolsEntity = result.entities.find((e) => e.name === 'tools');
    expect(toolsEntity).toBeDefined();
    expect(toolsEntity!.kind).toBe('organon-file');
    expect(toolsEntity!.type).toBe('constraints');
    expect(toolsEntity!.category).toBe('constraint');
    expect(toolsEntity!.scope).toBe('domain');
  });

  it('extracts invariants as constraint assertions', async () => {
    const fs = makeFs();
    const config = makeConfig('/project');
    const result = await exportKnowledgeGraph({
      projectRoot: '/project',
      config,
      fs,
      version: '0.4.1',
    });

    const invariantAssertions = result.assertions.filter((a) => a.category === 'constraint');
    expect(invariantAssertions.length).toBe(2);
    expect(invariantAssertions[0].id).toBe('inv:INV-TOOLS-1');
    expect(invariantAssertions[0].predicate).toBe('declares_invariant');
    expect(invariantAssertions[0].content).toBe('schema-fidelity');
  });

  it('extracts observations as assertion assertions', async () => {
    const fs = makeFs();
    const config = makeConfig('/project');
    const result = await exportKnowledgeGraph({
      projectRoot: '/project',
      config,
      fs,
      version: '0.4.1',
    });

    const obsAssertions = result.assertions.filter((a) => a.category === 'assertion');
    expect(obsAssertions.length).toBe(1);
    expect(obsAssertions[0].id).toBe('obs:test-observation');
    expect(obsAssertions[0].predicate).toBe('observed');
    expect(obsAssertions[0].content).toContain('Two review passes');
  });

  it('extracts inherits_from relationships', async () => {
    const fs = makeFs();
    const config = makeConfig('/project');
    const result = await exportKnowledgeGraph({
      projectRoot: '/project',
      config,
      fs,
      version: '0.4.1',
    });

    const inherits = result.relationships.filter((r) => r.predicate === 'inherits_from');
    expect(inherits.length).toBeGreaterThan(0);
    // 'product' doesn't match any entity name, so falls back to organon:product
    expect(inherits.some((r) => r.target === 'organon:product')).toBe(true);
  });

  it('resolves inherits_from names to entity IDs when possible', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/ETHOS.md': makeEthos({ name: 'my-project', scope: 'product' }),
      '/project/organon/domains/tools/ETHOS.md': ethosWithInvariants,
    });
    // Override the tools ETHOS to inherit from 'my-project' instead of 'product'
    const toolsEthos = ethosWithInvariants.replace('inherits_from:\n  - product', 'inherits_from:\n  - my-project');
    fs.addFile('/project/organon/domains/tools/ETHOS.md', toolsEthos);

    const config = makeConfig('/project');
    const result = await exportKnowledgeGraph({
      projectRoot: '/project',
      config,
      fs,
      version: '0.4.1',
    });

    const inherits = result.relationships.filter((r) => r.predicate === 'inherits_from');
    // Should resolve 'my-project' to the actual entity ID
    expect(inherits.some((r) => r.target === 'organon:organon/ETHOS')).toBe(true);
  });

  it('extracts related_domains relationships', async () => {
    const fs = makeFs();
    const config = makeConfig('/project');
    const result = await exportKnowledgeGraph({
      projectRoot: '/project',
      config,
      fs,
      version: '0.4.1',
    });

    const domainRels = result.relationships.filter((r) => r.predicate === 'related_to_domain');
    expect(domainRels.length).toBeGreaterThan(0);
    expect(domainRels.some((r) => r.target === 'domain:testing')).toBe(true);
  });

  it('extracts verification gates as rules', async () => {
    const fs = makeFs();
    const config = makeConfig('/project');
    const result = await exportKnowledgeGraph({
      projectRoot: '/project',
      config,
      fs,
      version: '0.4.1',
    });

    // Built-in gates are registered when verify module loads
    expect(result.rules.length).toBeGreaterThan(0);
    expect(result.rules[0].predicate).toBe('validates');
    expect(result.rules[0].type).toBe('blocking');
  });

  it('skips files without frontmatter', async () => {
    const fs = new MemoryFileSystem({
      '/project/README.md': '# No frontmatter here',
    });
    const config = makeConfig('/project');
    const result = await exportKnowledgeGraph({
      projectRoot: '/project',
      config,
      fs,
      version: '0.4.1',
    });

    expect(result.entities.length).toBe(0);
    expect(result.assertions.length).toBe(0);
  });

  it('uses default version when not provided', async () => {
    const fs = makeFs();
    const config = makeConfig('/project');
    const result = await exportKnowledgeGraph({
      projectRoot: '/project',
      config,
      fs,
    });

    expect(result.version).toBe('0.0.0');
  });

  it('handles unreadable files gracefully', async () => {
    const fs = makeFs();
    fs.throwOnRead('ETHOS.md');
    const config = makeConfig('/project');
    const result = await exportKnowledgeGraph({
      projectRoot: '/project',
      config,
      fs,
      version: '0.4.1',
    });

    // Should still return results for readable files
    expect(result.entities).toBeInstanceOf(Array);
  });

  it('classifies entities by epistemic category', async () => {
    const fs = makeFs();
    const config = makeConfig('/project');
    const result = await exportKnowledgeGraph({
      projectRoot: '/project',
      config,
      fs,
      version: '0.4.1',
    });

    const categories = result.entities.map((e) => e.category);
    expect(categories).toContain('constraint');
    expect(categories).toContain('assertion');
    // PHILOSOPHY and README files have null category
    expect(categories).toContain(null);
  });
});
