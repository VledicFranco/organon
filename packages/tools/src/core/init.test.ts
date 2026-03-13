/**
 * Tests for organon init core logic.
 *
 * @organon-invariant INV-TOOLS-2 every-command-has-tests
 * @organon-invariant INV-TOOLS-5 idempotent-operations
 */

import { describe, it, expect } from 'vitest';
import { init, detectProjectName } from './init.js';
import { validateFrontmatter } from './validate-frontmatter.js';
import { MemoryFileSystem } from './test-helpers.js';
import { getSkillTemplates, METHODOLOGY_VERSION } from '../templates/index.js';
import type { OrganonConfig } from './types.js';

describe('init', () => {
  it('generates all organon scaffold files', async () => {
    const fs = new MemoryFileSystem();
    const result = await init({
      projectRoot: '/project',
      installSkills: false,
      force: false,
      fs,
    });

    expect(result.success).toBe(true);
    expect(result.files.size).toBeGreaterThanOrEqual(6);
    expect(result.files.has('organon.config.json')).toBe(true);
    expect(result.files.has('CLAUDE.md')).toBe(true);
    expect(result.files.has('organon/ETHOS.md')).toBe(true);
    expect(result.files.has('organon/PHILOSOPHY.md')).toBe(true);
    expect(result.files.has('organon/README.md')).toBe(true);
    expect(result.files.has('organon/protocols/PROTOCOLS.md')).toBe(true);
  });

  it('generates skill files when installSkills is true', async () => {
    const fs = new MemoryFileSystem();
    const result = await init({
      projectRoot: '/project',
      installSkills: true,
      force: false,
      fs,
    });

    expect(result.success).toBe(true);
    expect(result.files.size).toBe(6 + getSkillTemplates().size);
    expect(result.files.has('.claude/skills/organon-file-creation/SKILL.md')).toBe(true);
    expect(result.files.has('.claude/skills/quality-review/SKILL.md')).toBe(true);
    expect(result.files.has('.claude/skills/verify-and-health/SKILL.md')).toBe(true);
  });

  it('skips existing files without --force', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/ETHOS.md': '# Existing ethos',
      '/project/organon.config.json': '{}',
    });

    const result = await init({
      projectRoot: '/project',
      installSkills: false,
      force: false,
      fs,
    });

    expect(result.success).toBe(true);
    expect(result.skipped).toContain('organon/ETHOS.md');
    expect(result.skipped).toContain('organon.config.json');
    expect(result.files.has('organon/ETHOS.md')).toBe(false);
    expect(result.files.has('organon.config.json')).toBe(false);
    // Other files still generated
    expect(result.files.has('organon/PHILOSOPHY.md')).toBe(true);
  });

  it('overwrites existing files with --force', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/ETHOS.md': '# Existing ethos',
    });

    const result = await init({
      projectRoot: '/project',
      installSkills: false,
      force: true,
      fs,
    });

    expect(result.success).toBe(true);
    expect(result.skipped.length).toBe(0);
    expect(result.files.has('organon/ETHOS.md')).toBe(true);
  });

  it('reports already-initialized when all files exist', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': '{}',
      '/project/CLAUDE.md': '# claude',
      '/project/organon/ETHOS.md': '# ethos',
      '/project/organon/PHILOSOPHY.md': '# phil',
      '/project/organon/README.md': '# readme',
      '/project/organon/protocols/PROTOCOLS.md': '# protocols',
    });

    const result = await init({
      projectRoot: '/project',
      installSkills: false,
      force: false,
      fs,
    });

    expect(result.success).toBe(true);
    expect(result.files.size).toBe(0);
    expect(result.skipped.length).toBe(6);
    const codes = result.diagnostics.map((d) => d.code);
    expect(codes).toContain('INIT_ALREADY_INITIALIZED');
  });

  it('generates files with valid frontmatter', async () => {
    const fs = new MemoryFileSystem();
    const result = await init({
      projectRoot: '/project',
      installSkills: false,
      force: false,
      fs,
    });

    // Check that generated organon files have YAML frontmatter delimiters
    // CLAUDE.md is not an organon file, so it doesn't need frontmatter
    for (const [filePath, content] of result.files) {
      if (filePath.endsWith('.md') && filePath !== 'CLAUDE.md') {
        expect(content.startsWith('---\n'), `${filePath} should start with frontmatter`).toBe(true);
        expect(content.includes('\n---\n'), `${filePath} should have closing frontmatter`).toBe(true);
      }
    }
  });

  it('generated config has methodology_version', async () => {
    const fs = new MemoryFileSystem();
    const result = await init({
      projectRoot: '/project',
      installSkills: false,
      force: false,
      fs,
    });

    const configContent = result.files.get('organon.config.json');
    expect(configContent).toBeDefined();
    const config = JSON.parse(configContent!);
    expect(config.methodology_version).toBe(METHODOLOGY_VERSION);
  });

  it('skill templates have methodology_version in frontmatter', async () => {
    const fs = new MemoryFileSystem();
    const result = await init({
      projectRoot: '/project',
      installSkills: true,
      force: false,
      fs,
    });

    for (const [path, content] of result.files) {
      if (path.includes('.claude/skills/')) {
        expect(content).toContain(`methodology_version: "${METHODOLOGY_VERSION}"`);
        expect(content).toContain('protocol_id:');
        expect(content).toContain('protocol_file:');
      }
    }
  });

  it('is idempotent — second run skips all files created by first', async () => {
    const fs = new MemoryFileSystem();

    // First run: generates all files
    const result1 = await init({
      projectRoot: '/project',
      installSkills: true,
      force: false,
      fs,
    });

    expect(result1.files.size).toBeGreaterThan(0);

    // Simulate writing the files to the FS
    for (const [relativePath, content] of result1.files) {
      fs.addFile(`/project/${relativePath}`, content);
    }

    // Second run: all files already exist, should skip everything
    const result2 = await init({
      projectRoot: '/project',
      installSkills: true,
      force: false,
      fs,
    });

    expect(result2.files.size).toBe(0);
    expect(result2.skipped.length).toBe(result1.files.size);
  });

  it('emits error diagnostic when fs.exists throws for organon files', async () => {
    const fs = new MemoryFileSystem();
    fs.throwOn('ETHOS.md');

    const result = await init({
      projectRoot: '/project',
      installSkills: false,
      force: false,
      fs,
    });

    expect(result.success).toBe(false);
    const errorDiags = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errorDiags.length).toBeGreaterThan(0);
    expect(errorDiags.some((d) => d.code === 'INIT_CHECK_ERROR')).toBe(true);
    // Other files not affected by the throw should still be generated
    expect(result.files.has('organon/PHILOSOPHY.md')).toBe(true);
  });

  it('emits error diagnostic when fs.exists throws for skill files', async () => {
    const fs = new MemoryFileSystem();
    fs.throwOn('verify-and-health');

    const result = await init({
      projectRoot: '/project',
      installSkills: true,
      force: false,
      fs,
    });

    expect(result.success).toBe(false);
    const errorDiags = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errorDiags.some((d) => d.code === 'INIT_CHECK_ERROR' && d.file?.includes('verify-and-health'))).toBe(true);
    // Other skills should still be generated
    expect(result.files.has('.claude/skills/quality-review/SKILL.md')).toBe(true);
  });

  it('infers project name from package.json', async () => {
    const fs = new MemoryFileSystem({
      '/project/package.json': JSON.stringify({ name: '@scope/my-awesome-project' }),
    });

    const result = await init({
      projectRoot: '/project',
      installSkills: false,
      force: false,
      fs,
    });

    const ethosContent = result.files.get('organon/ETHOS.md');
    expect(ethosContent).toContain('name: my-awesome-project');
    expect(ethosContent).toContain('Behavioral constraints for my-awesome-project');
  });

  it('infers project name from Cargo.toml when no package.json', async () => {
    const fs = new MemoryFileSystem({
      '/project/Cargo.toml': '[package]\nname = "rust-tool"\nversion = "0.1.0"',
    });

    const result = await init({
      projectRoot: '/project',
      installSkills: false,
      force: false,
      fs,
    });

    const ethosContent = result.files.get('organon/ETHOS.md');
    expect(ethosContent).toContain('name: rust-tool');
  });

  it('falls back to directory name for project name', async () => {
    const fs = new MemoryFileSystem();

    const result = await init({
      projectRoot: '/repos/cool-project',
      installSkills: false,
      force: false,
      fs,
    });

    const ethosContent = result.files.get('organon/ETHOS.md');
    expect(ethosContent).toContain('name: cool-project');
  });

  it('uses explicit projectName override', async () => {
    const fs = new MemoryFileSystem({
      '/project/package.json': JSON.stringify({ name: 'pkg-name' }),
    });

    const result = await init({
      projectRoot: '/project',
      installSkills: false,
      force: false,
      fs,
      projectName: 'custom-name',
    });

    const ethosContent = result.files.get('organon/ETHOS.md');
    expect(ethosContent).toContain('name: custom-name');
  });

  it('detects pre-existing unbound skills', async () => {
    const fs = new MemoryFileSystem({
      '/project/.claude/skills/my-skill/SKILL.md': `---
name: my-skill
---

# My Skill

No protocol_id here.
`,
    });

    const result = await init({
      projectRoot: '/project',
      installSkills: false,
      force: false,
      fs,
    });

    const unboundDiags = result.diagnostics.filter((d) => d.code === 'INIT_SKILL_NO_BINDING');
    expect(unboundDiags.length).toBe(1);
    expect(unboundDiags[0].message).toContain('protocol_id');
  });

  it('does not flag skills with protocol_id as unbound', async () => {
    const fs = new MemoryFileSystem({
      '/project/.claude/skills/bound-skill/SKILL.md': `---
name: bound-skill
protocol_id: PROTO-TEST-1
protocol_file: organon/protocols/PROTOCOLS.md
tools:
  - organon-verify
loads:
  - organon/ETHOS.md
---

# Bound Skill
`,
    });

    const result = await init({
      projectRoot: '/project',
      installSkills: false,
      force: false,
      fs,
    });

    const unboundDiags = result.diagnostics.filter((d) => d.code === 'INIT_SKILL_NO_BINDING');
    expect(unboundDiags.length).toBe(0);
  });

  it('generated config has testGlobs and testIgnorePatterns', async () => {
    const fs = new MemoryFileSystem();
    const result = await init({
      projectRoot: '/project',
      installSkills: false,
      force: false,
      fs,
    });

    const configContent = result.files.get('organon.config.json');
    expect(configContent).toBeDefined();
    const config = JSON.parse(configContent!);
    expect(config.testGlobs).toBeDefined();
    expect(config.testGlobs).toContain('**/*.test.ts');
    expect(config.testIgnorePatterns).toBeDefined();
  });

  it('init output passes frontmatter validation (no FRONTMATTER_NAME_DIR_MISMATCH)', async () => {
    const fs = new MemoryFileSystem();
    const initResult = await init({
      projectRoot: '/project',
      installSkills: false,
      force: false,
      fs,
    });

    expect(initResult.success).toBe(true);

    // Write generated files to the MemoryFileSystem
    for (const [relativePath, content] of initResult.files) {
      fs.addFile(`/project/${relativePath}`, content);
    }

    // Build config from generated organon.config.json
    const configContent = initResult.files.get('organon.config.json');
    expect(configContent).toBeDefined();
    const parsedConfig = JSON.parse(configContent!);
    const config: OrganonConfig = {
      projectRoot: '/project',
      organonPaths: parsedConfig.organonPaths ?? ['.'],
      organonGlobs: parsedConfig.organonGlobs ?? ['**/ETHOS.md', '**/PHILOSOPHY.md', '**/README.md'],
      ignorePatterns: parsedConfig.ignorePatterns ?? ['node_modules/**'],
      workflowPaths: parsedConfig.workflowPaths ?? {},
      freshnessThresholdHours: parsedConfig.freshnessThresholdHours ?? 24,
    };

    // Collect all generated .md files (excluding CLAUDE.md which has no frontmatter)
    const mdFiles = [...initResult.files.keys()]
      .filter((f) => f.endsWith('.md') && f !== 'CLAUDE.md');

    const validateResult = await validateFrontmatter({
      projectRoot: '/project',
      config,
      fs,
      files: mdFiles,
      stages: [1, 4],
    });

    expect(validateResult.success).toBe(true);
    const mismatchWarnings = validateResult.warnings.filter(
      (w) => w.code === 'FRONTMATTER_NAME_DIR_MISMATCH',
    );
    expect(mismatchWarnings).toHaveLength(0);
  });
});
