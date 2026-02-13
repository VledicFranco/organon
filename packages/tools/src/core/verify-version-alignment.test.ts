/**
 * Tests for version alignment gate.
 *
 * @organon-invariant INV-TOOLS-2 every-command-has-tests
 */

import { describe, it, expect } from 'vitest';
import { verifyVersionAlignment } from './verify-version-alignment.js';
import { MemoryFileSystem } from './test-helpers.js';
import { METHODOLOGY_VERSION } from '../templates/config.js';
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

describe('verifyVersionAlignment', () => {
  it('passes when methodology_version matches CLI', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': JSON.stringify({ methodology_version: METHODOLOGY_VERSION }),
    });
    const config = makeConfig('/project');
    const result = await verifyVersionAlignment({ projectRoot: '/project', config, fs });
    expect(result.success).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('warns when methodology_version drifts from CLI', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': JSON.stringify({ methodology_version: '0.1.0' }),
    });
    const config = makeConfig('/project');
    const result = await verifyVersionAlignment({ projectRoot: '/project', config, fs });
    expect(result.success).toBe(true); // Advisory
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'VERSION_METHODOLOGY_DRIFT' }),
    );
  });

  it('warns when package versions mismatch in monorepo', async () => {
    const fs = new MemoryFileSystem({
      '/project/packages/tools/package.json': JSON.stringify({ version: '1.0.0' }),
      '/project/packages/testing/package.json': JSON.stringify({ version: '0.9.0' }),
    });
    const config = makeConfig('/project');
    const result = await verifyVersionAlignment({ projectRoot: '/project', config, fs });
    expect(result.success).toBe(true); // Advisory
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'VERSION_PACKAGE_MISMATCH' }),
    );
  });

  it('passes when no config file exists', async () => {
    const fs = new MemoryFileSystem({});
    const config = makeConfig('/project');
    const result = await verifyVersionAlignment({ projectRoot: '/project', config, fs });
    expect(result.success).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('passes when packages match', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon.config.json': JSON.stringify({ methodology_version: METHODOLOGY_VERSION }),
      '/project/packages/tools/package.json': JSON.stringify({ version: '1.0.0' }),
      '/project/packages/testing/package.json': JSON.stringify({ version: '1.0.0' }),
    });
    const config = makeConfig('/project');
    const result = await verifyVersionAlignment({ projectRoot: '/project', config, fs });
    expect(result.warnings).toHaveLength(0);
  });
});
