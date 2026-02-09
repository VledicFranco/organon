import { describe, it, expect } from 'vitest';
import { verify, registerGate, getRegisteredGates } from './verify.js';
import { MemoryFileSystem, makeEthos } from './test-helpers.js';
import type { OrganonConfig, VerifyGateFn } from './types.js';

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

describe('verify', () => {
  it('runs all built-in gates', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthos({ name: 'test', scope: 'product' }),
    });
    const config = makeConfig('/project');
    const result = await verify({ projectRoot: '/project', config, fs });
    // Should have at least the 3 built-in gates
    expect(result.gates.length).toBeGreaterThanOrEqual(3);
    const gateNames = result.gates.map((g) => g.gate);
    expect(gateNames).toContain('frontmatter');
    expect(gateNames).toContain('triplets');
    expect(gateNames).toContain('freshness');
  });

  it('runs a specific gate subset', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthos({ name: 'test', scope: 'product' }),
    });
    const config = makeConfig('/project');
    const result = await verify({
      projectRoot: '/project',
      config,
      fs,
      gates: ['frontmatter'],
    });
    expect(result.gates.length).toBe(1);
    expect(result.gates[0].gate).toBe('frontmatter');
  });

  it('reports error for unknown gate', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthos({ name: 'test', scope: 'product' }),
    });
    const config = makeConfig('/project');
    const result = await verify({
      projectRoot: '/project',
      config,
      fs,
      gates: ['nonexistent-gate'],
    });
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'UNKNOWN_GATE' }),
    );
  });

  it('supports custom gate registration', async () => {
    const customGate: VerifyGateFn = async () => ({
      gate: 'custom',
      passed: true,
      errors: [],
      warnings: [],
    });
    registerGate('custom-test', customGate);

    expect(getRegisteredGates()).toContain('custom-test');

    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthos({ name: 'test', scope: 'product' }),
    });
    const config = makeConfig('/project');
    const result = await verify({
      projectRoot: '/project',
      config,
      fs,
      gates: ['custom-test'],
    });
    expect(result.gates.length).toBe(1);
    expect(result.gates[0].gate).toBe('custom');
    expect(result.gates[0].passed).toBe(true);
  });

  it('handles gate execution errors gracefully', async () => {
    const failingGate: VerifyGateFn = async () => {
      throw new Error('Gate crashed');
    };
    registerGate('failing-test', failingGate);

    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthos({ name: 'test', scope: 'product' }),
    });
    const config = makeConfig('/project');
    const result = await verify({
      projectRoot: '/project',
      config,
      fs,
      gates: ['failing-test'],
    });
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'GATE_EXECUTION_ERROR' }),
    );
  });

  it('success is true only when all gates pass', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': makeEthos({ name: 'test', scope: 'product' }),
    });
    const config = makeConfig('/project');
    // Frontmatter should pass on a valid file, triplets pass (no protocols), freshness is advisory
    const result = await verify({
      projectRoot: '/project',
      config,
      fs,
      gates: ['frontmatter', 'triplets'],
    });
    expect(result.success).toBe(true);
  });
});
