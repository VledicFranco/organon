import { describe, it, expect } from 'vitest';
import { find } from './find.js';
import { MemoryFileSystem, makeEthos, makeReadme } from './test-helpers.js';
import type { OrganonConfig } from './types.js';

function makeConfig(projectRoot: string): OrganonConfig {
  return {
    projectRoot,
    organonPaths: ['.'],
    organonGlobs: ['**/ETHOS.md', '**/README.md'],
    ignorePatterns: [],
    workflowPaths: {},
    freshnessThresholdHours: 24,
  };
}

describe('find', () => {
  function makeFs() {
    return new MemoryFileSystem({
      '/project/ETHOS.md': makeEthos({ name: 'product', scope: 'product' }),
      '/project/organon/domains/genesis/ETHOS.md': makeEthos({ name: 'genesis', scope: 'domain' }),
      '/project/organon/domains/agents/ETHOS.md': makeEthos({ name: 'agents', scope: 'domain' }),
      '/project/README.md': makeReadme({ name: 'root', scope: 'product' }),
    });
  }

  describe('by-scope', () => {
    it('finds all domain-scoped organons', async () => {
      const fs = makeFs();
      const config = makeConfig('/project');
      const result = await find({ projectRoot: '/project', config, fs, scope: 'domain' });
      expect(result.mode).toBe('by-scope');
      expect(result.matches.length).toBe(2);
      expect(result.matches.every((m) => m.frontmatter?.scope === 'domain')).toBe(true);
    });

    it('finds product-scoped organons', async () => {
      const fs = makeFs();
      const config = makeConfig('/project');
      const result = await find({ projectRoot: '/project', config, fs, scope: 'product' });
      expect(result.matches.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('by-type', () => {
    it('finds all constraints files', async () => {
      const fs = makeFs();
      const config = makeConfig('/project');
      const result = await find({ projectRoot: '/project', config, fs, type: 'constraints' });
      expect(result.mode).toBe('by-type');
      expect(result.matches.length).toBe(3); // product + genesis + agents
      expect(result.matches.every((m) => m.frontmatter?.type === 'constraints')).toBe(true);
    });
  });

  describe('by-name', () => {
    it('finds organons matching a name pattern', async () => {
      const fs = makeFs();
      const config = makeConfig('/project');
      const result = await find({ projectRoot: '/project', config, fs, name: 'genesis' });
      expect(result.mode).toBe('by-name');
      expect(result.matches.length).toBeGreaterThanOrEqual(1);
      expect(result.matches.some((m) => m.frontmatter?.name === 'genesis')).toBe(true);
    });

    it('returns empty for no match', async () => {
      const fs = makeFs();
      const config = makeConfig('/project');
      const result = await find({ projectRoot: '/project', config, fs, name: 'nonexistent' });
      expect(result.matches.length).toBe(0);
    });
  });

  describe('by-file', () => {
    it('finds governing organons for a file path', async () => {
      const fs = makeFs();
      const config = makeConfig('/project');
      const result = await find({
        projectRoot: '/project',
        config,
        fs,
        file: 'organon/domains/genesis/something.ts',
      });
      expect(result.mode).toBe('by-file');
      // Should include product-level and genesis-level
      expect(result.matches.some((m) => m.frontmatter?.scope === 'product')).toBe(true);
      expect(result.matches.some((m) => m.frontmatter?.name === 'genesis')).toBe(true);
    });
  });

  describe('no criteria', () => {
    it('returns error when no search criteria provided', async () => {
      const fs = makeFs();
      const config = makeConfig('/project');
      const result = await find({ projectRoot: '/project', config, fs });
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ code: 'FIND_NO_CRITERIA' }),
      );
    });
  });
});
