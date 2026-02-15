import { describe, it, expect } from 'vitest';
import { query } from './query.js';
import { MemoryFileSystem, makeEthos, makePhilosophy, makeReadme } from './test-helpers.js';
import type { OrganonConfig } from './types.js';

function makeConfig(projectRoot: string): OrganonConfig {
  return {
    projectRoot,
    organonPaths: ['.', 'organon'],
    organonGlobs: ['**/ETHOS.md', '**/PHILOSOPHY.md', '**/PROTOCOLS.md', '**/README.md'],
    ignorePatterns: [],
    workflowPaths: {},
    freshnessThresholdHours: 24,
  };
}

describe('query', () => {
  const ethosContent = makeEthos({ name: 'genesis', scope: 'domain', extra: { load_priority: 'high', 'required_for': '[genesis_impl]' } });
  const philContent = makePhilosophy({ name: 'genesis-phil' });
  const readmeContent = makeReadme({ name: 'root', scope: 'product' });

  function makeFs() {
    return new MemoryFileSystem({
      '/project/organon/domains/genesis/ETHOS.md': ethosContent,
      '/project/organon/domains/genesis/PHILOSOPHY.md': philContent,
      '/project/README.md': readmeContent,
    });
  }

  it('returns all files with frontmatter by default', async () => {
    const fs = makeFs();
    const config = makeConfig('/project');
    const result = await query({ projectRoot: '/project', config, fs });
    expect(result.success).toBe(true);
    expect(result.files.length).toBe(3);
  });

  it('filters by scope', async () => {
    const fs = makeFs();
    const config = makeConfig('/project');
    const result = await query({ projectRoot: '/project', config, fs, scope: 'domain' });
    expect(result.files.length).toBe(2); // genesis ETHOS + PHILOSOPHY
    expect(result.files.every((f) => f.frontmatter?.scope === 'domain')).toBe(true);
  });

  it('filters by type', async () => {
    const fs = makeFs();
    const config = makeConfig('/project');
    const result = await query({ projectRoot: '/project', config, fs, type: 'constraints' });
    expect(result.files.length).toBe(1);
    expect(result.files[0].frontmatter?.type).toBe('constraints');
  });

  it('filters by name pattern', async () => {
    const fs = makeFs();
    const config = makeConfig('/project');
    const result = await query({ projectRoot: '/project', config, fs, namePattern: 'genesis' });
    expect(result.files.length).toBe(2);
  });

  it('respects token budget', async () => {
    const fs = makeFs();
    const config = makeConfig('/project');
    // Budget of 200 tokens - should only fit small files
    const result = await query({ projectRoot: '/project', config, fs, budget: 200 });
    expect(result.totalTokens).toBeLessThanOrEqual(200);
    expect(result.warnings.some((w) => w.code === 'BUDGET_EXCEEDED')).toBe(true);
  });

  it('calculates total tokens', async () => {
    const fs = makeFs();
    const config = makeConfig('/project');
    const result = await query({ projectRoot: '/project', config, fs });
    expect(result.totalTokens).toBeGreaterThan(0);
  });

  it('strips body in non-verbose mode', async () => {
    const fs = makeFs();
    const config = makeConfig('/project');
    const result = await query({ projectRoot: '/project', config, fs, verbose: false });
    expect(result.files.every((f) => f.body === '')).toBe(true);
  });

  it('includes body in verbose mode', async () => {
    const fs = makeFs();
    const config = makeConfig('/project');
    const result = await query({ projectRoot: '/project', config, fs, verbose: true });
    expect(result.files.some((f) => f.body.length > 0)).toBe(true);
  });

  it('excludes files without frontmatter by default', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthos({ name: 'test', scope: 'product' }),
      '/project/README.md': '# No frontmatter',
    });
    const config = makeConfig('/project');
    const result = await query({ projectRoot: '/project', config, fs });
    expect(result.files.length).toBe(1);
  });

  it('includes invalid files when requested', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthos({ name: 'test', scope: 'product' }),
      '/project/README.md': '# No frontmatter',
    });
    const config = makeConfig('/project');
    const result = await query({ projectRoot: '/project', config, fs, includeInvalid: true });
    expect(result.files.length).toBe(2);
  });
});
