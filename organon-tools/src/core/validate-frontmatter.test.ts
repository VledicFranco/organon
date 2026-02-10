import { describe, it, expect } from 'vitest';
import { validateFrontmatter } from './validate-frontmatter.js';
import { MemoryFileSystem, makeEthos, makePhilosophy, makeReadme } from './test-helpers.js';
import type { OrganonConfig } from './types.js';

function makeConfig(projectRoot: string): OrganonConfig {
  return {
    projectRoot,
    organonPaths: ['.'],
    organonGlobs: ['**/ETHOS.md', '**/PHILOSOPHY.md', '**/README.md'],
    ignorePatterns: ['node_modules/**'],
    workflowPaths: {},
    freshnessThresholdHours: 24,
  };
}

describe('validateFrontmatter', () => {
  describe('Stage 1: Schema', () => {
    it('passes valid ethos files', async () => {
      const fs = new MemoryFileSystem({
        '/project/ETHOS.md': makeEthos({ name: 'test', scope: 'product' }),
      });
      const config = makeConfig('/project');
      const result = await validateFrontmatter({
        projectRoot: '/project',
        config,
        fs,
        files: ['ETHOS.md'],
        stages: [1],
      });
      expect(result.success).toBe(true);
      expect(result.filesChecked).toBe(1);
    });

    it('reports missing frontmatter', async () => {
      const fs = new MemoryFileSystem({
        '/project/ETHOS.md': '# No frontmatter\n\nJust content.',
      });
      const config = makeConfig('/project');
      const result = await validateFrontmatter({
        projectRoot: '/project',
        config,
        fs,
        files: ['ETHOS.md'],
        stages: [1],
      });
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ code: 'FRONTMATTER_MISSING' }),
      );
    });

    it('reports invalid type enum', async () => {
      const fs = new MemoryFileSystem({
        '/project/ETHOS.md': `---
type: invalid_type
scope: domain
name: test
version: "1.0"
summary: Test
token_estimate: 100
---

# Content`,
      });
      const config = makeConfig('/project');
      const result = await validateFrontmatter({
        projectRoot: '/project',
        config,
        fs,
        files: ['ETHOS.md'],
        stages: [1],
      });
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ code: 'FRONTMATTER_INVALID_TYPE' }),
      );
    });

    it('reports non-kebab-case name', async () => {
      const fs = new MemoryFileSystem({
        '/project/ETHOS.md': `---
type: constraints
scope: domain
name: CamelCase
version: "1.0"
summary: Test
token_estimate: 100
---

# Content`,
      });
      const config = makeConfig('/project');
      const result = await validateFrontmatter({
        projectRoot: '/project',
        config,
        fs,
        files: ['ETHOS.md'],
        stages: [1],
      });
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ code: 'FRONTMATTER_NAME_FORMAT' }),
      );
    });

    it('reports invalid version format', async () => {
      const fs = new MemoryFileSystem({
        '/project/ETHOS.md': `---
type: constraints
scope: domain
name: test
version: "v1"
summary: Test
token_estimate: 100
---

# Content`,
      });
      const config = makeConfig('/project');
      const result = await validateFrontmatter({
        projectRoot: '/project',
        config,
        fs,
        files: ['ETHOS.md'],
        stages: [1],
      });
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ code: 'FRONTMATTER_VERSION_FORMAT' }),
      );
    });

    it('reports summary exceeding 200 characters', async () => {
      const fs = new MemoryFileSystem({
        '/project/ETHOS.md': `---
type: constraints
scope: domain
name: test
version: "1.0"
summary: ${'a'.repeat(201)}
token_estimate: 100
---

# Content`,
      });
      const config = makeConfig('/project');
      const result = await validateFrontmatter({
        projectRoot: '/project',
        config,
        fs,
        files: ['ETHOS.md'],
        stages: [1],
      });
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ code: 'FRONTMATTER_SUMMARY_TOO_LONG' }),
      );
    });

    it('warns about missing type-specific fields', async () => {
      const fs = new MemoryFileSystem({
        '/project/ETHOS.md': `---
type: constraints
scope: domain
name: test
version: "1.0"
summary: Test
token_estimate: 100
---

# Content`,
      });
      const config = makeConfig('/project');
      const result = await validateFrontmatter({
        projectRoot: '/project',
        config,
        fs,
        files: ['ETHOS.md'],
        stages: [1],
      });
      expect(result.success).toBe(true);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({ code: 'FRONTMATTER_MISSING_TYPE_FIELD' }),
      );
    });
  });

  describe('Stage 3: Truthfulness', () => {
    it('detects invariant count mismatch', async () => {
      const content = makeEthos({ invariants: 3 }).replace(
        'invariants_count: 3',
        'invariants_count: 5',
      );
      const fs = new MemoryFileSystem({
        '/project/ETHOS.md': content,
      });
      const config = makeConfig('/project');
      const result = await validateFrontmatter({
        projectRoot: '/project',
        config,
        fs,
        files: ['ETHOS.md'],
        stages: [3],
      });
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'FRONTMATTER_COUNT_MISMATCH',
          message: expect.stringContaining('invariants_count'),
        }),
      );
    });

    it('detects principles count mismatch', async () => {
      const content = makeEthos({ principles: 2 }).replace(
        'principles_count: 2',
        'principles_count: 5',
      );
      const fs = new MemoryFileSystem({
        '/project/ETHOS.md': content,
      });
      const config = makeConfig('/project');
      const result = await validateFrontmatter({
        projectRoot: '/project',
        config,
        fs,
        files: ['ETHOS.md'],
        stages: [3],
      });
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'FRONTMATTER_COUNT_MISMATCH',
          message: expect.stringContaining('principles_count'),
        }),
      );
    });

    it('warns on token estimate drift beyond 30%', async () => {
      const fs = new MemoryFileSystem({
        '/project/ETHOS.md': `---
type: constraints
scope: domain
name: test
version: "1.0"
summary: Test
token_estimate: 10000
---

# Short content`,
      });
      const config = makeConfig('/project');
      const result = await validateFrontmatter({
        projectRoot: '/project',
        config,
        fs,
        files: ['ETHOS.md'],
        stages: [3],
      });
      expect(result.warnings).toContainEqual(
        expect.objectContaining({ code: 'FRONTMATTER_TOKEN_DRIFT' }),
      );
    });

    it('detects invariants array count mismatch', async () => {
      const content = makeEthos({
        invariants: 2,
        extra: {
          invariants: `\n  - id: INV-TEST-1\n    name: rule-one\n  - id: INV-TEST-2\n    name: rule-two\n  - id: INV-TEST-3\n    name: rule-three`,
        },
      });
      const fs = new MemoryFileSystem({
        '/project/ETHOS.md': content,
      });
      const config = makeConfig('/project');
      const result = await validateFrontmatter({
        projectRoot: '/project',
        config,
        fs,
        files: ['ETHOS.md'],
        stages: [3],
      });
      expect(result.errors).toContainEqual(
        expect.objectContaining({ code: 'FRONTMATTER_INVARIANT_COUNT_MISMATCH' }),
      );
    });

    it('detects invalid invariant ID format', async () => {
      const content = makeEthos({
        extra: {
          invariants: `\n  - id: BAD-FORMAT\n    name: bad`,
        },
      });
      const fs = new MemoryFileSystem({
        '/project/ETHOS.md': content,
      });
      const config = makeConfig('/project');
      const result = await validateFrontmatter({
        projectRoot: '/project',
        config,
        fs,
        files: ['ETHOS.md'],
        stages: [3],
      });
      expect(result.errors).toContainEqual(
        expect.objectContaining({ code: 'FRONTMATTER_INVARIANT_ID_FORMAT' }),
      );
    });

    it('detects duplicate invariant IDs', async () => {
      const content = makeEthos({
        extra: {
          invariants: `\n  - id: INV-TEST-1\n    name: first\n  - id: INV-TEST-1\n    name: duplicate`,
        },
      });
      const fs = new MemoryFileSystem({
        '/project/ETHOS.md': content,
      });
      const config = makeConfig('/project');
      const result = await validateFrontmatter({
        projectRoot: '/project',
        config,
        fs,
        files: ['ETHOS.md'],
        stages: [3],
      });
      expect(result.errors).toContainEqual(
        expect.objectContaining({ code: 'FRONTMATTER_INVARIANT_DUPLICATE_ID' }),
      );
    });

    it('passes when counts match', async () => {
      const fs = new MemoryFileSystem({
        '/project/ETHOS.md': makeEthos({ invariants: 5, principles: 3, heuristics: 4 }),
      });
      const config = makeConfig('/project');
      const result = await validateFrontmatter({
        projectRoot: '/project',
        config,
        fs,
        files: ['ETHOS.md'],
        stages: [3],
      });
      const countErrors = result.errors.filter((e) => e.code === 'FRONTMATTER_COUNT_MISMATCH');
      expect(countErrors).toHaveLength(0);
    });
  });

  describe('Stage 4: Consistency', () => {
    it('warns when name does not match parent directory', async () => {
      const fs = new MemoryFileSystem({
        '/project/organon/domains/genesis/ETHOS.md': makeEthos({ name: 'wrong-name', scope: 'domain' }),
      });
      const config = makeConfig('/project');
      const result = await validateFrontmatter({
        projectRoot: '/project',
        config,
        fs,
        files: ['organon/domains/genesis/ETHOS.md'],
        stages: [4],
      });
      expect(result.warnings).toContainEqual(
        expect.objectContaining({ code: 'FRONTMATTER_NAME_DIR_MISMATCH' }),
      );
    });

    it('reports missing workflow for automated protocol', async () => {
      const fs = new MemoryFileSystem({
        '/project/PROTOCOL.md': `---
type: procedures
scope: domain
name: test
version: "1.0"
summary: Test
token_estimate: 200
protocols_count: 1
protocols:
  - id: PROTO-TEST-1
    name: Test
    steps: 6
    automation_tier: automated
    complexity: high
---

## Steps
1. Do thing.`,
      });
      const config = makeConfig('/project');
      config.organonGlobs.push('**/PROTOCOL.md');
      const result = await validateFrontmatter({
        projectRoot: '/project',
        config,
        fs,
        files: ['PROTOCOL.md'],
        stages: [4],
      });
      expect(result.errors).toContainEqual(
        expect.objectContaining({ code: 'FRONTMATTER_MISSING_WORKFLOW' }),
      );
    });
  });

  describe('auto-discovery', () => {
    it('discovers all organon files when no files specified', async () => {
      const fs = new MemoryFileSystem({
        '/project/ETHOS.md': makeEthos({ name: 'root', scope: 'product' }),
        '/project/README.md': makeReadme({ name: 'root', scope: 'product' }),
      });
      const config = makeConfig('/project');
      const result = await validateFrontmatter({
        projectRoot: '/project',
        config,
        fs,
        stages: [1],
      });
      expect(result.filesChecked).toBe(2);
    });
  });
});
