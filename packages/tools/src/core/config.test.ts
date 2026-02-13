import { describe, it, expect } from 'vitest';
import { resolveConfig, joinPath, dirName, baseName, findProjectRoot } from './config.js';
import { MemoryFileSystem } from './test-helpers.js';

describe('resolveConfig', () => {
  it('uses convention defaults when no config file exists', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/ETHOS.md': 'content',
      '/project/book-llms/ETHOS.md': 'content',
    });

    const config = await resolveConfig('/project', fs);
    expect(config.projectRoot).toBe('/project');
    expect(config.organonPaths).toContain('organon');
    expect(config.organonPaths).toContain('book-llms');
    expect(config.organonPaths).toContain('.');
    expect(config.freshnessThresholdHours).toBe(24);
  });

  it('loads config from organon.config.json', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': JSON.stringify({
        organonPaths: ['docs'],
        freshnessThresholdHours: 48,
      }),
    });

    const config = await resolveConfig('/project', fs);
    expect(config.organonPaths).toEqual(['docs']);
    expect(config.freshnessThresholdHours).toBe(48);
  });

  it('loads config from custom path', async () => {
    const fs = new MemoryFileSystem({
      '/project/custom/config.json': JSON.stringify({
        organonPaths: ['custom-docs'],
      }),
    });

    const config = await resolveConfig('/project', fs, 'custom/config.json');
    expect(config.organonPaths).toEqual(['custom-docs']);
  });

  it('includes default workflow paths', async () => {
    const fs = new MemoryFileSystem();
    const config = await resolveConfig('/project', fs);
    expect(config.workflowPaths.claudeCode).toBe('.claude/skills');
    expect(config.workflowPaths.cursor).toBe('.cursor/rules');
    expect(config.workflowPaths.generic).toBe('organon/workflows');
  });

  it('merges config file workflow paths with defaults', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': JSON.stringify({
        workflowPaths: { claudeCode: '.custom/skills' },
      }),
    });

    const config = await resolveConfig('/project', fs);
    expect(config.workflowPaths.claudeCode).toBe('.custom/skills');
    expect(config.workflowPaths.cursor).toBe('.cursor/rules'); // still default
  });
});

describe('joinPath', () => {
  it('joins path segments', () => {
    expect(joinPath('/project', 'book-llms', 'ETHOS.md')).toBe('/project/book-llms/ETHOS.md');
  });

  it('handles trailing slashes', () => {
    expect(joinPath('/project/', 'file.md')).toBe('/project/file.md');
  });

  it('handles leading slashes on segments', () => {
    expect(joinPath('/project', '/book-llms')).toBe('/project/book-llms');
  });
});

describe('dirName', () => {
  it('returns directory portion', () => {
    expect(dirName('book-llms/ETHOS.md')).toBe('book-llms');
  });

  it('returns . for root-level file', () => {
    expect(dirName('ETHOS.md')).toBe('.');
  });

  it('handles nested paths', () => {
    expect(dirName('organon/domains/genesis/ETHOS.md')).toBe('organon/domains/genesis');
  });

  it('normalizes backslashes', () => {
    expect(dirName('organon\\domains\\genesis\\ETHOS.md')).toBe('organon/domains/genesis');
  });
});

describe('baseName', () => {
  it('returns filename', () => {
    expect(baseName('book-llms/ETHOS.md')).toBe('ETHOS.md');
  });

  it('returns the input for bare filenames', () => {
    expect(baseName('ETHOS.md')).toBe('ETHOS.md');
  });
});

describe('findProjectRoot', () => {
  it('finds project root with organon.config.json', async () => {
    const fs = new MemoryFileSystem({
      '/repo/organon.config.json': '{}',
      '/repo/packages/tools/src/file.ts': 'content',
    });
    const result = await findProjectRoot('/repo/packages/tools/src', fs);
    expect(result).toBe('/repo');
  });

  it('stops at .git root when no config found', async () => {
    const fs = new MemoryFileSystem({
      '/repo/.git/HEAD': 'ref: refs/heads/master',
      '/repo/packages/tools/src/file.ts': 'content',
    });
    const result = await findProjectRoot('/repo/packages/tools/src', fs);
    expect(result).toBe('/repo');
  });

  it('returns null when neither config nor .git found', async () => {
    const fs = new MemoryFileSystem({
      '/some/deep/path/file.ts': 'content',
    });
    const result = await findProjectRoot('/some/deep/path', fs);
    expect(result).toBeNull();
  });

  it('finds config at the start directory itself', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': '{}',
    });
    const result = await findProjectRoot('/project', fs);
    expect(result).toBe('/project');
  });

  it('prefers config over .git when both exist higher up', async () => {
    const fs = new MemoryFileSystem({
      '/repo/organon.config.json': '{}',
      '/repo/.git/HEAD': 'ref: refs/heads/master',
      '/repo/packages/tools/file.ts': 'content',
    });
    const result = await findProjectRoot('/repo/packages/tools', fs);
    expect(result).toBe('/repo');
  });
});
