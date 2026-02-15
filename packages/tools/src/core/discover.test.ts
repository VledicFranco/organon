/**
 * Tests for shared organon file discovery.
 *
 * @organon-invariant INV-TOOLS-2 every-command-has-tests
 */

import { describe, it, expect } from 'vitest';
import { discoverOrganonFiles } from './discover.js';
import { MemoryFileSystem } from './test-helpers.js';
import type { OrganonConfig } from './types.js';

function makeConfig(overrides?: Partial<OrganonConfig>): OrganonConfig {
  return {
    projectRoot: '/project',
    organonPaths: ['.', 'organon'],
    organonGlobs: ['**/ETHOS.md', '**/PHILOSOPHY.md', '**/README.md'],
    ignorePatterns: [],
    workflowPaths: {},
    freshnessThresholdHours: 24,
    ...overrides,
  };
}

describe('discoverOrganonFiles', () => {
  it('discovers files in named organon paths recursively', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/ETHOS.md': 'ethos',
      '/project/organon/domains/tools/ETHOS.md': 'ethos nested',
      '/project/organon/domains/tools/PHILOSOPHY.md': 'philosophy nested',
    });
    const config = makeConfig({ organonPaths: ['organon'] });
    const result = await discoverOrganonFiles('/project', config, fs);

    expect(result).toEqual([
      'organon/ETHOS.md',
      'organon/domains/tools/ETHOS.md',
      'organon/domains/tools/PHILOSOPHY.md',
    ]);
  });

  it('discovers root-level files via "." path', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': 'root ethos',
      '/project/README.md': 'root readme',
    });
    const config = makeConfig({ organonPaths: ['.'] });
    const result = await discoverOrganonFiles('/project', config, fs);

    expect(result).toContain('ETHOS.md');
    expect(result).toContain('README.md');
  });

  it('does NOT discover nested files via "." path (the fix)', async () => {
    const fs = new MemoryFileSystem({
      '/project/README.md': 'root readme — organon file',
      '/project/ETHOS.md': 'root ethos — organon file',
      '/project/experiments/001/README.md': 'experiment readme — NOT organon',
      '/project/modules/app/README.md': 'module readme — NOT organon',
      '/project/research/README.md': 'research readme — NOT organon',
    });
    const config = makeConfig({ organonPaths: ['.'] });
    const result = await discoverOrganonFiles('/project', config, fs);

    expect(result).toContain('README.md');
    expect(result).toContain('ETHOS.md');
    expect(result).not.toContain('experiments/001/README.md');
    expect(result).not.toContain('modules/app/README.md');
    expect(result).not.toContain('research/README.md');
  });

  it('combines "." root-only with named path recursive discovery', async () => {
    const fs = new MemoryFileSystem({
      '/project/README.md': 'root readme',
      '/project/ETHOS.md': 'root ethos',
      '/project/experiments/README.md': 'should be excluded',
      '/project/organon/ETHOS.md': 'organon ethos',
      '/project/organon/domains/tools/ETHOS.md': 'nested organon ethos',
    });
    const config = makeConfig({ organonPaths: ['.', 'organon'] });
    const result = await discoverOrganonFiles('/project', config, fs);

    expect(result).toEqual([
      'ETHOS.md',
      'README.md',
      'organon/ETHOS.md',
      'organon/domains/tools/ETHOS.md',
    ]);
  });

  it('applies ignorePatterns', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/ETHOS.md': 'ethos',
      '/project/organon/vendor/ETHOS.md': 'vendor ethos',
    });
    const config = makeConfig({
      organonPaths: ['organon'],
      ignorePatterns: ['**/vendor/**'],
    });
    const result = await discoverOrganonFiles('/project', config, fs);

    expect(result).toEqual(['organon/ETHOS.md']);
    expect(result).not.toContain('organon/vendor/ETHOS.md');
  });

  it('deduplicates files matched by multiple paths', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/ETHOS.md': 'ethos',
    });
    // Both paths could match the same file
    const config = makeConfig({
      organonPaths: ['organon', 'organon'],
    });
    const result = await discoverOrganonFiles('/project', config, fs);

    expect(result).toEqual(['organon/ETHOS.md']);
  });

  it('returns sorted results', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/domains/z/ETHOS.md': 'z',
      '/project/organon/domains/a/ETHOS.md': 'a',
      '/project/organon/ETHOS.md': 'root',
    });
    const config = makeConfig({ organonPaths: ['organon'] });
    const result = await discoverOrganonFiles('/project', config, fs);

    expect(result).toEqual([
      'organon/ETHOS.md',
      'organon/domains/a/ETHOS.md',
      'organon/domains/z/ETHOS.md',
    ]);
  });

  it('returns empty array when no files match', async () => {
    const fs = new MemoryFileSystem({});
    const config = makeConfig();
    const result = await discoverOrganonFiles('/project', config, fs);

    expect(result).toEqual([]);
  });

  it('handles globs without **/ prefix via "." path unchanged', async () => {
    // A glob like "ETHOS.md" (no **/ prefix) should work as-is
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': 'ethos',
    });
    const config = makeConfig({
      organonPaths: ['.'],
      organonGlobs: ['ETHOS.md'],
    });
    const result = await discoverOrganonFiles('/project', config, fs);

    expect(result).toEqual(['ETHOS.md']);
  });
});
