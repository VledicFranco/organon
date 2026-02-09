import { describe, it, expect } from 'vitest';
import { verifyTriplets } from './verify-triplets.js';
import { MemoryFileSystem } from './test-helpers.js';
import type { OrganonConfig } from './types.js';

function makeConfig(projectRoot: string): OrganonConfig {
  return {
    projectRoot,
    organonPaths: ['.'],
    organonGlobs: ['**/ETHOS.md', '**/PROTOCOL.md', '**/PROTOCOLS.md'],
    ignorePatterns: [],
    workflowPaths: { generic: 'workflows' },
    freshnessThresholdHours: 24,
  };
}

describe('verifyTriplets', () => {
  it('passes when automated protocols have valid workflow bindings', async () => {
    const fs = new MemoryFileSystem({
      '/project/PROTOCOLS.md': `---
type: procedures
scope: methodology
name: test-protocols
version: "1.0"
summary: Test
token_estimate: 300
protocols_count: 1
protocols:
  - id: PROTO-TEST-1
    name: Test Protocol
    steps: 6
    automation_tier: automated
    workflow: test-workflow
    complexity: high
---

## Steps
1. Do thing.`,
      '/project/workflows/test-workflow.md': `---
protocol_id: PROTO-TEST-1
protocol_file: PROTOCOLS.md
---

# Test Workflow`,
    });
    const config = makeConfig('/project');
    const result = await verifyTriplets({ projectRoot: '/project', config, fs });
    expect(result.bindings.length).toBe(1);
    expect(result.bindings[0].valid).toBe(true);
    expect(result.phantomAutomation).toHaveLength(0);
  });

  it('detects phantom automation (protocol automated but no workflow)', async () => {
    const fs = new MemoryFileSystem({
      '/project/PROTOCOLS.md': `---
type: procedures
scope: methodology
name: test-protocols
version: "1.0"
summary: Test
token_estimate: 300
protocols_count: 1
protocols:
  - id: PROTO-TEST-1
    name: Test Protocol
    steps: 6
    automation_tier: automated
    workflow: nonexistent-workflow
    complexity: high
---

## Steps
1. Do thing.`,
    });
    const config = makeConfig('/project');
    const result = await verifyTriplets({ projectRoot: '/project', config, fs });
    expect(result.success).toBe(false);
    expect(result.phantomAutomation).toContain('PROTO-TEST-1');
  });

  it('detects missing workflow field for automated protocol', async () => {
    const fs = new MemoryFileSystem({
      '/project/PROTOCOLS.md': `---
type: procedures
scope: methodology
name: test-protocols
version: "1.0"
summary: Test
token_estimate: 300
protocols_count: 1
protocols:
  - id: PROTO-TEST-1
    name: Test Protocol
    steps: 6
    automation_tier: automated
    complexity: high
---

## Steps
1. Do thing.`,
    });
    const config = makeConfig('/project');
    const result = await verifyTriplets({ projectRoot: '/project', config, fs });
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'TRIPLET_MISSING_WORKFLOW_NAME' }),
    );
  });

  it('passes for manual protocols without workflows', async () => {
    const fs = new MemoryFileSystem({
      '/project/PROTOCOLS.md': `---
type: procedures
scope: methodology
name: test-protocols
version: "1.0"
summary: Test
token_estimate: 300
protocols_count: 1
protocols:
  - id: PROTO-TEST-1
    name: Manual Protocol
    steps: 3
    automation_tier: manual
    complexity: low
---

## Steps
1. Do thing.`,
    });
    const config = makeConfig('/project');
    const result = await verifyTriplets({ projectRoot: '/project', config, fs });
    expect(result.success).toBe(true);
    expect(result.bindings[0].valid).toBe(true);
  });

  it('succeeds when no protocol files exist', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': `---
type: constraints
scope: product
name: test
version: "1.0"
summary: Test
token_estimate: 100
---

# Content`,
    });
    const config = makeConfig('/project');
    const result = await verifyTriplets({ projectRoot: '/project', config, fs });
    expect(result.success).toBe(true);
    expect(result.bindings).toHaveLength(0);
  });
});
