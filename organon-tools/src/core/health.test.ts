import { describe, it, expect } from 'vitest';
import { health } from './health.js';
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

describe('health', () => {
  it('reports 100% coverage when all files have frontmatter', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthos({ name: 'test', scope: 'product' }),
      '/project/README.md': makeReadme({ name: 'root', scope: 'product' }),
    });
    const config = makeConfig('/project');
    const result = await health({ projectRoot: '/project', config, fs });
    expect(result.coverage.percentage).toBe(100);
  });

  it('reports partial coverage', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthos({ name: 'test', scope: 'product' }),
      '/project/README.md': '# No frontmatter here',
    });
    const config = makeConfig('/project');
    const result = await health({ projectRoot: '/project', config, fs });
    expect(result.coverage.percentage).toBe(50);
    expect(result.coverage.withFrontmatter).toBe(1);
    expect(result.coverage.totalFiles).toBe(2);
  });

  it('calculates a health score', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthos({ name: 'test', scope: 'product' }),
    });
    const config = makeConfig('/project');
    const result = await health({ projectRoot: '/project', config, fs });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('includes token analysis', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthos({ name: 'test', scope: 'product' }),
    });
    const config = makeConfig('/project');
    const result = await health({ projectRoot: '/project', config, fs });
    expect(result.tokens.total).toBeGreaterThan(0);
    expect(result.tokens.average).toBeGreaterThan(0);
    expect(result.tokens.largest.file).toBeTruthy();
  });

  it('reports freshness', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthos({ name: 'test', scope: 'product' }),
    });
    const config = makeConfig('/project');
    const result = await health({ projectRoot: '/project', config, fs });
    expect(result.freshness.fresh + result.freshness.stale + result.freshness.unknown)
      .toBe(1);
  });

  it('detects stale files', async () => {
    const fs = new MemoryFileSystem();
    // Add file with old mtime
    const oldDate = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48h ago
    fs.addFile('/project/ETHOS.md', makeEthos({ name: 'test', scope: 'product' }), oldDate);

    const config = makeConfig('/project');
    const result = await health({ projectRoot: '/project', config, fs });
    expect(result.freshness.stale).toBe(1);
    expect(result.freshness.stalestFile).toBeTruthy();
  });

  it('includes fix suggestions when requested', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthos({ name: 'test', scope: 'product' }),
      '/project/README.md': '# No frontmatter',
    });
    const config = makeConfig('/project');
    const result = await health({
      projectRoot: '/project',
      config,
      fs,
      fixSuggestions: true,
    });
    const missing = result.issues.find((i) => i.code === 'HEALTH_MISSING_FRONTMATTER');
    expect(missing?.suggestion).toBeTruthy();
  });

  it('gives high score for perfect project', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthos({ name: 'test', scope: 'product' }),
    });
    const config = makeConfig('/project');
    const result = await health({ projectRoot: '/project', config, fs });
    expect(result.score).toBeGreaterThanOrEqual(80);
  });
});
