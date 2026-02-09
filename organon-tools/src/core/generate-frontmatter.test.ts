import { describe, it, expect } from 'vitest';
import { generateFrontmatter, serializeFrontmatter } from './generate-frontmatter.js';
import { MemoryFileSystem, makeEthos } from './test-helpers.js';
import type { OrganonConfig } from './types.js';

function makeConfig(projectRoot: string): OrganonConfig {
  return {
    projectRoot,
    organonPaths: ['.'],
    organonGlobs: ['**/ETHOS.md'],
    ignorePatterns: [],
    workflowPaths: {},
    freshnessThresholdHours: 24,
  };
}

describe('generateFrontmatter', () => {
  it('infers type from filename', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': '# Test\n\n## Identity\n\n## Invariants\n\n1. **Rule.** Desc.',
    });
    const config = makeConfig('/project');
    const result = await generateFrontmatter({
      projectRoot: '/project',
      config,
      fs,
      file: 'ETHOS.md',
    });
    expect(result.generated.type).toBe('constraints');
  });

  it('infers scope from path', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/domains/genesis/ETHOS.md': '# Genesis\n\n## Invariants\n\n1. **Rule.** Desc.',
    });
    const config = makeConfig('/project');
    const result = await generateFrontmatter({
      projectRoot: '/project',
      config,
      fs,
      file: 'organon/domains/genesis/ETHOS.md',
    });
    expect(result.generated.scope).toBe('domain');
  });

  it('infers name from parent directory', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/domains/genesis/ETHOS.md': '# Genesis\n\n## Invariants\n\n1. **Rule.** Desc.',
    });
    const config = makeConfig('/project');
    const result = await generateFrontmatter({
      projectRoot: '/project',
      config,
      fs,
      file: 'organon/domains/genesis/ETHOS.md',
    });
    expect(result.generated.name).toBe('genesis');
  });

  it('counts invariants and principles for constraints type', async () => {
    const content = `# Test

## Invariants

1. **Rule one.** First.
2. **Rule two.** Second.
3. **Rule three.** Third.

## Principles (Prioritized)

1. **Principle one.** First.
2. **Principle two.** Second.

## Decision Heuristics

| Situation | Action |
|-----------|--------|
| When X | Do Y |
`;
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': content,
    });
    const config = makeConfig('/project');
    const result = await generateFrontmatter({
      projectRoot: '/project',
      config,
      fs,
      file: 'ETHOS.md',
    });
    expect(result.generated.invariants_count).toBe(3);
    expect(result.generated.principles_count).toBe(2);
    expect(result.generated.heuristics_count).toBe(1);
  });

  it('preserves existing relationship fields', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthos({
        name: 'test',
        scope: 'domain',
        extra: {
          'inherits_from': '[product]',
          'related_domains': '[other]',
          load_priority: 'high',
        },
      }),
    });
    const config = makeConfig('/project');
    const result = await generateFrontmatter({
      projectRoot: '/project',
      config,
      fs,
      file: 'ETHOS.md',
    });
    expect(result.generated.inherits_from).toEqual(['product']);
    expect(result.generated.related_domains).toEqual(['other']);
    expect(result.generated.load_priority).toBe('high');
  });

  it('allows type override', async () => {
    const fs = new MemoryFileSystem({
      '/project/custom.md': '# Custom\n\nContent.',
    });
    const config = makeConfig('/project');
    config.organonGlobs = ['**/*.md'];
    const result = await generateFrontmatter({
      projectRoot: '/project',
      config,
      fs,
      file: 'custom.md',
      type: 'rationale',
    });
    expect(result.generated.type).toBe('rationale');
  });

  it('calculates token estimate', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthos(),
    });
    const config = makeConfig('/project');
    const result = await generateFrontmatter({
      projectRoot: '/project',
      config,
      fs,
      file: 'ETHOS.md',
    });
    expect(result.generated.token_estimate).toBeGreaterThan(0);
  });

  it('returns error for missing file', async () => {
    const fs = new MemoryFileSystem();
    const config = makeConfig('/project');
    const result = await generateFrontmatter({
      projectRoot: '/project',
      config,
      fs,
      file: 'nonexistent.md',
    });
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'FILE_READ_ERROR' }),
    );
  });
});

describe('serializeFrontmatter', () => {
  it('produces valid YAML with delimiters', () => {
    const yaml = serializeFrontmatter({ type: 'constraints', name: 'test' });
    expect(yaml).toMatch(/^---\n/);
    expect(yaml).toMatch(/---\n$/);
    expect(yaml).toContain('type: constraints');
    expect(yaml).toContain('name: test');
  });
});
