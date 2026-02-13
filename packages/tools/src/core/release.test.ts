/**
 * Tests for release plan computation.
 *
 * @organon-invariant INV-TOOLS-2 every-command-has-tests
 */

import { describe, it, expect } from 'vitest';
import { computeReleasePlan, computeNextVersion } from './release.js';
import { MemoryFileSystem } from './test-helpers.js';

describe('computeNextVersion', () => {
  it('computes patch bump', () => {
    expect(computeNextVersion('1.2.3', 'patch')).toBe('1.2.4');
  });

  it('computes minor bump', () => {
    expect(computeNextVersion('1.2.3', 'minor')).toBe('1.3.0');
  });

  it('computes major bump', () => {
    expect(computeNextVersion('1.2.3', 'major')).toBe('2.0.0');
  });

  it('handles 0.x versions', () => {
    expect(computeNextVersion('0.3.0', 'minor')).toBe('0.4.0');
    expect(computeNextVersion('0.3.0', 'patch')).toBe('0.3.1');
  });

  it('throws on invalid version format', () => {
    expect(() => computeNextVersion('invalid', 'patch')).toThrow('Invalid version format');
    expect(() => computeNextVersion('1.2', 'patch')).toThrow('Invalid version format');
  });
});

describe('computeReleasePlan', () => {
  it('reads current version and computes plan', async () => {
    const fs = new MemoryFileSystem({
      '/project/packages/tools/package.json': JSON.stringify({ version: '0.3.0' }),
    });

    const plan = await computeReleasePlan('/project', 'minor', fs);

    expect(plan.currentVersion).toBe('0.3.0');
    expect(plan.nextVersion).toBe('0.4.0');
    expect(plan.bump).toBe('minor');
    expect(plan.filesToUpdate.length).toBeGreaterThan(0);
    expect(plan.filesToUpdate.map(f => f.file)).toContain('packages/tools/package.json');
    expect(plan.filesToUpdate.map(f => f.file)).toContain('packages/testing/package.json');
    expect(plan.filesToUpdate.map(f => f.file)).toContain('organon.config.json');
    expect(plan.filesToUpdate.map(f => f.file)).toContain('CHANGELOG.md');
  });

  it('throws when package.json is missing', async () => {
    const fs = new MemoryFileSystem({});

    await expect(
      computeReleasePlan('/project', 'patch', fs),
    ).rejects.toThrow();
  });

  it('throws when version field is missing', async () => {
    const fs = new MemoryFileSystem({
      '/project/packages/tools/package.json': JSON.stringify({ name: 'no-version' }),
    });

    await expect(
      computeReleasePlan('/project', 'patch', fs),
    ).rejects.toThrow('Could not read current version');
  });
});
