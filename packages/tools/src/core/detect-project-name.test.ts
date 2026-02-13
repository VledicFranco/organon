/**
 * Tests for detectProjectName.
 *
 * @organon-invariant INV-TOOLS-2 every-command-has-tests
 */

import { describe, it, expect } from 'vitest';
import { detectProjectName } from './init.js';
import { MemoryFileSystem } from './test-helpers.js';

describe('detectProjectName', () => {
  it('reads name from package.json', async () => {
    const fs = new MemoryFileSystem({
      '/project/package.json': JSON.stringify({ name: 'my-cool-tool' }),
    });
    expect(await detectProjectName('/project', fs)).toBe('my-cool-tool');
  });

  it('strips npm scope from package.json name', async () => {
    const fs = new MemoryFileSystem({
      '/project/package.json': JSON.stringify({ name: '@org/scoped-package' }),
    });
    expect(await detectProjectName('/project', fs)).toBe('scoped-package');
  });

  it('reads name from Cargo.toml when no package.json', async () => {
    const fs = new MemoryFileSystem({
      '/project/Cargo.toml': '[package]\nname = "rust-crate"\nversion = "0.1.0"',
    });
    expect(await detectProjectName('/project', fs)).toBe('rust-crate');
  });

  it('falls back to directory basename', async () => {
    const fs = new MemoryFileSystem();
    expect(await detectProjectName('/repos/awesome-project', fs)).toBe('awesome-project');
  });

  it('converts CamelCase to kebab-case', async () => {
    const fs = new MemoryFileSystem({
      '/project/package.json': JSON.stringify({ name: 'MyProject' }),
    });
    expect(await detectProjectName('/project', fs)).toBe('my-project');
  });

  it('handles special characters in name', async () => {
    const fs = new MemoryFileSystem({
      '/project/package.json': JSON.stringify({ name: 'my.project_v2' }),
    });
    const name = await detectProjectName('/project', fs);
    expect(name).toMatch(/^[a-z][a-z0-9-]*$/);
  });

  it('prefers package.json over Cargo.toml', async () => {
    const fs = new MemoryFileSystem({
      '/project/package.json': JSON.stringify({ name: 'js-project' }),
      '/project/Cargo.toml': '[package]\nname = "rust-project"\nversion = "0.1.0"',
    });
    expect(await detectProjectName('/project', fs)).toBe('js-project');
  });

  it('returns my-project for empty directory name', async () => {
    const fs = new MemoryFileSystem();
    expect(await detectProjectName('/', fs)).toBe('my-project');
  });
});
