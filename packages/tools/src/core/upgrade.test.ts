/**
 * Tests for organon upgrade core logic.
 *
 * @organon-invariant INV-TOOLS-2 every-command-has-tests
 * @organon-invariant INV-TOOLS-5 idempotent-operations
 */

import { describe, it, expect } from 'vitest';
import { detectVersion, computeUpgradePlan, applyUpgrade } from './upgrade.js';
import { MemoryFileSystem } from './test-helpers.js';
import { METHODOLOGY_VERSION, getSkillTemplates } from '../templates/index.js';

describe('detectVersion', () => {
  it('returns null current when no config exists', async () => {
    const fs = new MemoryFileSystem();
    const version = await detectVersion('/project', fs);

    expect(version.current).toBeNull();
    expect(version.target).toBe(METHODOLOGY_VERSION);
    expect(version.drift).toBe('unknown');
  });

  it('returns null current when config has no methodology_version', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': '{"organonPaths": ["organon"]}',
    });
    const version = await detectVersion('/project', fs);

    expect(version.current).toBeNull();
    expect(version.drift).toBe('unknown');
  });

  it('returns none drift when versions match', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': `{"methodology_version": "${METHODOLOGY_VERSION}"}`,
    });
    const version = await detectVersion('/project', fs);

    expect(version.current).toBe(METHODOLOGY_VERSION);
    expect(version.drift).toBe('none');
  });

  it('returns behind drift when current is older', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': '{"methodology_version": "0.1.0"}',
    });
    const version = await detectVersion('/project', fs);

    expect(version.current).toBe('0.1.0');
    expect(version.drift).toBe('behind');
  });

  it('returns ahead drift when current is newer', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': '{"methodology_version": "99.0.0"}',
    });
    const version = await detectVersion('/project', fs);

    expect(version.drift).toBe('ahead');
  });

  it('returns null current when config contains invalid JSON', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': 'not valid json {{{',
    });
    const version = await detectVersion('/project', fs);

    expect(version.current).toBeNull();
    expect(version.drift).toBe('unknown');
  });

  it('returns null current when methodology_version is not a string', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': '{"methodology_version": 123}',
    });
    const version = await detectVersion('/project', fs);

    expect(version.current).toBeNull();
    expect(version.drift).toBe('unknown');
  });

  it('returns unknown when fs.exists throws', async () => {
    const fs = new MemoryFileSystem();
    fs.throwOn('organon.config.json');
    const version = await detectVersion('/project', fs);

    expect(version.current).toBeNull();
    expect(version.drift).toBe('unknown');
  });
});

describe('computeUpgradePlan', () => {
  it('detects missing skills as new', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': `{"methodology_version": "${METHODOLOGY_VERSION}"}`,
    });
    const version = await detectVersion('/project', fs);
    const plan = await computeUpgradePlan({
      projectRoot: '/project',
      skillsOnly: false,
      fs,
      version,
    });

    const skillChanges = plan.changes.filter((c) => c.type === 'skill');
    expect(skillChanges.length).toBe(getSkillTemplates().size);
    expect(skillChanges.every((c) => c.action === 'create')).toBe(true);
  });

  it('detects outdated skills as update', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': `{"methodology_version": "${METHODOLOGY_VERSION}"}`,
      '/project/.claude/skills/verify-and-health/SKILL.md': '---\nname: verify-and-health\n---\n# Old content',
    });
    const version = await detectVersion('/project', fs);
    const plan = await computeUpgradePlan({
      projectRoot: '/project',
      skillsOnly: false,
      fs,
      version,
    });

    const vhChange = plan.changes.find((c) => c.path.includes('verify-and-health'));
    expect(vhChange).toBeDefined();
    expect(vhChange!.action).toBe('update');
  });

  it('reports no changes when everything is current', async () => {
    // Simulate all skills existing with matching content
    const { getSkillTemplates } = await import('../templates/index.js');
    const skills = getSkillTemplates();
    const files: Record<string, string> = {
      '/project/organon.config.json': `{"methodology_version": "${METHODOLOGY_VERSION}"}`,
    };
    for (const [, { path, content }] of skills) {
      files[`/project/${path}`] = content;
    }

    const fs = new MemoryFileSystem(files);
    const version = await detectVersion('/project', fs);
    const plan = await computeUpgradePlan({
      projectRoot: '/project',
      skillsOnly: false,
      fs,
      version,
    });

    expect(plan.changes.length).toBe(0);
  });

  it('includes config update when version drifts', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': '{"methodology_version": "0.1.0"}',
    });
    const version = await detectVersion('/project', fs);
    const plan = await computeUpgradePlan({
      projectRoot: '/project',
      skillsOnly: false,
      fs,
      version,
    });

    const configChange = plan.changes.find((c) => c.type === 'config');
    expect(configChange).toBeDefined();
    expect(configChange!.action).toBe('update');
  });

  it('does not suggest config downgrade when version is ahead', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': '{"methodology_version": "99.0.0"}',
    });
    const version = await detectVersion('/project', fs);
    expect(version.drift).toBe('ahead');

    const plan = await computeUpgradePlan({
      projectRoot: '/project',
      skillsOnly: false,
      fs,
      version,
    });

    const configChange = plan.changes.find((c) => c.type === 'config');
    expect(configChange).toBeUndefined();
  });

  it('skips config when skillsOnly is true', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': '{"methodology_version": "0.1.0"}',
    });
    const version = await detectVersion('/project', fs);
    const plan = await computeUpgradePlan({
      projectRoot: '/project',
      skillsOnly: true,
      fs,
      version,
    });

    const configChange = plan.changes.find((c) => c.type === 'config');
    expect(configChange).toBeUndefined();
  });
});

describe('applyUpgrade', () => {
  it('produces files for all changes', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': '{"methodology_version": "0.1.0"}',
    });
    const version = await detectVersion('/project', fs);
    const plan = await computeUpgradePlan({
      projectRoot: '/project',
      skillsOnly: false,
      fs,
      version,
    });

    const result = await applyUpgrade(plan, '/project', fs);
    const filesToWrite = result.filesToWrite;

    expect(result.success).toBe(true);
    expect(result.applied.length).toBeGreaterThan(0);
    expect(filesToWrite.size).toBeGreaterThan(0);
  });

  it('updates methodology_version in config', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': '{"methodology_version": "0.1.0", "organonPaths": ["organon"]}',
    });
    const version = await detectVersion('/project', fs);
    const plan = await computeUpgradePlan({
      projectRoot: '/project',
      skillsOnly: false,
      fs,
      version,
    });

    const result = await applyUpgrade(plan, '/project', fs);
    const filesToWrite = result.filesToWrite;

    const configContent = filesToWrite.get('organon.config.json');
    expect(configContent).toBeDefined();
    const config = JSON.parse(configContent!);
    expect(config.methodology_version).toBe(METHODOLOGY_VERSION);
    // Preserves existing fields
    expect(config.organonPaths).toEqual(['organon']);
  });

  it('emits warning when skill template not found', async () => {
    // Craft a plan with a skill change pointing to a non-existent template path
    const fs = new MemoryFileSystem();
    const plan = {
      version: { current: '0.1.0', target: METHODOLOGY_VERSION, drift: 'behind' as const },
      changes: [
        {
          type: 'skill' as const,
          action: 'update' as const,
          path: '.claude/skills/nonexistent-skill/SKILL.md',
          description: 'Updated: nonexistent-skill',
        },
      ],
    };

    const result = await applyUpgrade(plan, '/project', fs);

    const warning = result.diagnostics.find((d) => d.code === 'UPGRADE_SKILL_TEMPLATE_NOT_FOUND');
    expect(warning).toBeDefined();
    expect(result.applied).not.toContain('.claude/skills/nonexistent-skill/SKILL.md');
  });

  it('emits warning for structure change type', async () => {
    const fs = new MemoryFileSystem();
    const plan = {
      version: { current: '0.1.0', target: METHODOLOGY_VERSION, drift: 'behind' as const },
      changes: [
        {
          type: 'structure' as const,
          action: 'create' as const,
          path: 'organon/new-dir/README.md',
          description: 'New structural file',
        },
      ],
    };

    const result = await applyUpgrade(plan, '/project', fs);

    const warning = result.diagnostics.find((d) => d.code === 'UPGRADE_STRUCTURE_NOT_SUPPORTED');
    expect(warning).toBeDefined();
    expect(result.filesToWrite.size).toBe(0);
  });

  it('creates config from template when action is create', async () => {
    const fs = new MemoryFileSystem();
    const plan = {
      version: { current: null, target: METHODOLOGY_VERSION, drift: 'unknown' as const },
      changes: [
        {
          type: 'config' as const,
          action: 'create' as const,
          path: 'organon.config.json',
          description: 'Create organon.config.json',
        },
      ],
    };

    const result = await applyUpgrade(plan, '/project', fs);

    expect(result.success).toBe(true);
    expect(result.applied).toContain('organon.config.json');
    const configContent = result.filesToWrite.get('organon.config.json');
    expect(configContent).toBeDefined();
    const config = JSON.parse(configContent!);
    expect(config.methodology_version).toBe(METHODOLOGY_VERSION);
  });

  it('emits error when config cannot be read during update', async () => {
    const fs = new MemoryFileSystem();
    fs.throwOn('organon.config.json');
    const plan = {
      version: { current: '0.1.0', target: METHODOLOGY_VERSION, drift: 'behind' as const },
      changes: [
        {
          type: 'config' as const,
          action: 'update' as const,
          path: 'organon.config.json',
          description: 'Update methodology_version',
        },
      ],
    };

    const result = await applyUpgrade(plan, '/project', fs);

    expect(result.success).toBe(false);
    const error = result.diagnostics.find((d) => d.code === 'UPGRADE_CONFIG_READ_ERROR');
    expect(error).toBeDefined();
  });

  it('emits error when config contains invalid JSON during update', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': 'not valid json {{{',
    });
    const plan = {
      version: { current: '0.1.0', target: METHODOLOGY_VERSION, drift: 'behind' as const },
      changes: [
        {
          type: 'config' as const,
          action: 'update' as const,
          path: 'organon.config.json',
          description: 'Update methodology_version',
        },
      ],
    };

    const result = await applyUpgrade(plan, '/project', fs);

    expect(result.success).toBe(false);
    const error = result.diagnostics.find((d) => d.code === 'UPGRADE_CONFIG_READ_ERROR');
    expect(error).toBeDefined();
  });

  it('returns empty plan when no changes needed', async () => {
    const fs = new MemoryFileSystem();
    const plan = {
      version: { current: METHODOLOGY_VERSION, target: METHODOLOGY_VERSION, drift: 'none' as const },
      changes: [],
    };

    const result = await applyUpgrade(plan, '/project', fs);

    expect(result.success).toBe(true);
    expect(result.applied.length).toBe(0);
    expect(result.filesToWrite.size).toBe(0);
    expect(result.diagnostics.length).toBe(0);
  });
});

describe('computeUpgradePlan — error paths', () => {
  it('treats skill with unreadable fs.exists as needing create', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': `{"methodology_version": "${METHODOLOGY_VERSION}"}`,
    });
    fs.throwOn('verify-and-health');
    const version = await detectVersion('/project', fs);
    const plan = await computeUpgradePlan({
      projectRoot: '/project',
      skillsOnly: false,
      fs,
      version,
    });

    const vhChange = plan.changes.find((c) => c.path.includes('verify-and-health'));
    expect(vhChange).toBeDefined();
    expect(vhChange!.action).toBe('create');
    expect(vhChange!.description).toContain('could not check');
  });

  it('treats unreadable existing skill as needing update', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': `{"methodology_version": "${METHODOLOGY_VERSION}"}`,
      '/project/.claude/skills/verify-and-health/SKILL.md': 'content',
    });
    // Make only readFile throw (exists() still returns true)
    fs.throwOnRead('verify-and-health');
    const version = await detectVersion('/project', fs);
    const plan = await computeUpgradePlan({
      projectRoot: '/project',
      skillsOnly: false,
      fs,
      version,
    });

    const vhChange = plan.changes.find((c) => c.path.includes('verify-and-health'));
    expect(vhChange).toBeDefined();
    expect(vhChange!.action).toBe('update');
    expect(vhChange!.description).toContain('could not read');
  });

  it('suggests config create when config does not exist', async () => {
    const fs = new MemoryFileSystem();
    const version = { current: null, target: METHODOLOGY_VERSION, drift: 'unknown' as const };
    const plan = await computeUpgradePlan({
      projectRoot: '/project',
      skillsOnly: false,
      fs,
      version,
    });

    const configChange = plan.changes.find((c) => c.type === 'config');
    expect(configChange).toBeDefined();
    expect(configChange!.action).toBe('create');
  });
});
