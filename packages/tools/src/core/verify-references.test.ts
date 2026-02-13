/**
 * Tests for references verification gate.
 *
 * @organon-invariant INV-TOOLS-2 every-command-has-tests
 */

import { describe, it, expect } from 'vitest';
import { verifyReferences } from './verify-references.js';
import { MemoryFileSystem, makeEthos, makeWorkflow } from './test-helpers.js';
import type { OrganonConfig } from './types.js';

function makeConfig(projectRoot: string): OrganonConfig {
  return {
    projectRoot,
    organonPaths: ['.'],
    organonGlobs: ['**/ETHOS.md', '**/PHILOSOPHY.md', '**/README.md'],
    ignorePatterns: [],
    workflowPaths: { generic: 'workflows' },
    freshnessThresholdHours: 24,
  };
}

describe('verifyReferences', () => {
  it('passes when all references resolve', async () => {
    const parentEthos = makeEthos({ name: 'parent', scope: 'product' });
    const childEthos = makeEthos({ name: 'child', scope: 'domain', extra: { inherits_from: '["parent"]' } });
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': parentEthos,
      '/project/domains/child/ETHOS.md': childEthos,
    });
    const config = makeConfig('/project');
    const result = await verifyReferences({ projectRoot: '/project', config, fs });
    expect(result.success).toBe(true);
  });

  it('reports broken inherits_from reference', async () => {
    const ethos = makeEthos({ name: 'child', scope: 'domain', extra: { inherits_from: '["nonexistent-parent"]' } });
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': ethos,
    });
    const config = makeConfig('/project');
    const result = await verifyReferences({ projectRoot: '/project', config, fs });
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'REFERENCE_BROKEN_INHERIT' }),
    );
  });

  it('reports broken related_domains reference', async () => {
    const ethos = makeEthos({ name: 'test', scope: 'domain', extra: { related_domains: '["ghost-domain"]' } });
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': ethos,
    });
    const config = makeConfig('/project');
    const result = await verifyReferences({ projectRoot: '/project', config, fs });
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'REFERENCE_BROKEN_DOMAIN' }),
    );
  });

  it('reports broken related_features reference', async () => {
    const ethos = makeEthos({ name: 'test', scope: 'domain', extra: { related_features: '["ghost-feature"]' } });
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': ethos,
    });
    const config = makeConfig('/project');
    const result = await verifyReferences({ projectRoot: '/project', config, fs });
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'REFERENCE_BROKEN_FEATURE' }),
    );
  });

  it('reports broken workflow loads path', async () => {
    const fs = new MemoryFileSystem({
      '/project/workflows/test.md': makeWorkflow({ loads: ['/nonexistent.md'] }),
    });
    const config = makeConfig('/project');
    const result = await verifyReferences({ projectRoot: '/project', config, fs });
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'REFERENCE_BROKEN_LOADS' }),
    );
  });

  it('reports broken workflow protocol_file path', async () => {
    const workflow = makeWorkflow({ protocolFile: 'nonexistent/PROTOCOLS.md' });
    const fs = new MemoryFileSystem({
      '/project/workflows/test.md': workflow,
      '/project/ETHOS.md': '# ethos',
    });
    const config = makeConfig('/project');
    const result = await verifyReferences({ projectRoot: '/project', config, fs });
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'REFERENCE_BROKEN_PROTOCOL_FILE' }),
    );
  });

  it('passes when no organon files or workflows exist', async () => {
    const fs = new MemoryFileSystem({});
    const config = makeConfig('/project');
    const result = await verifyReferences({ projectRoot: '/project', config, fs });
    expect(result.success).toBe(true);
  });
});
