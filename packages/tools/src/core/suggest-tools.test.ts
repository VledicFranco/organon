import { describe, it, expect } from 'vitest';
import { suggestTools } from './suggest-tools.js';
import { MemoryFileSystem } from './test-helpers.js';
import type { OrganonConfig } from './types.js';

function makeConfig(projectRoot: string): OrganonConfig {
  return {
    projectRoot,
    organonPaths: ['.'],
    organonGlobs: ['**/PROTOCOLS.md'],
    ignorePatterns: [],
    workflowPaths: {},
    freshnessThresholdHours: 24,
  };
}

describe('suggestTools', () => {
  it('suggests upgrading manual protocol with many steps', async () => {
    const fs = new MemoryFileSystem({
      '/project/PROTOCOLS.md': `---
type: procedures
scope: methodology
name: test
version: "1.0"
summary: Test
token_estimate: 500
protocols_count: 1
protocols:
  - id: PROTO-BIG-1
    name: Big Manual Protocol
    steps: 8
    automation_tier: manual
    complexity: high
---

## Steps

You must always ensure every step is done carefully.
This is critical and must never be skipped.
Before each deployment, verify all checks pass.

1. Step one
2. Step two
3. Step three
4. Step four
5. Step five
6. Step six
7. Step seven
8. Step eight`,
    });
    const config = makeConfig('/project');
    const result = await suggestTools({ projectRoot: '/project', config, fs });
    expect(result.suggestions.length).toBeGreaterThanOrEqual(1);
    expect(result.suggestions[0].suggestedTier).toBe('automated');
    expect(result.suggestions[0].currentTier).toBe('manual');
  });

  it('does not suggest changes for already automated protocols', async () => {
    const fs = new MemoryFileSystem({
      '/project/PROTOCOLS.md': `---
type: procedures
scope: methodology
name: test
version: "1.0"
summary: Test
token_estimate: 300
protocols_count: 1
protocols:
  - id: PROTO-AUTO-1
    name: Already Automated
    steps: 6
    automation_tier: automated
    workflow: my-workflow
    complexity: high
---

## Steps
1. Step one`,
    });
    const config = makeConfig('/project');
    const result = await suggestTools({ projectRoot: '/project', config, fs });
    expect(result.suggestions.length).toBe(0);
  });

  it('suggests semi-automated for small manual protocols with error-prone language', async () => {
    const fs = new MemoryFileSystem({
      '/project/PROTOCOLS.md': `---
type: procedures
scope: methodology
name: test
version: "1.0"
summary: Test
token_estimate: 300
protocols_count: 1
protocols:
  - id: PROTO-SMALL-1
    name: Small Protocol
    steps: 3
    automation_tier: manual
    complexity: low
---

## Steps

You must carefully ensure the output is precisely correct.
Always verify before proceeding.

1. Step one
2. Step two
3. Step three`,
    });
    const config = makeConfig('/project');
    const result = await suggestTools({ projectRoot: '/project', config, fs });
    expect(result.suggestions.length).toBeGreaterThanOrEqual(1);
    const suggestion = result.suggestions[0];
    expect(suggestion.currentTier).toBe('manual');
    expect(['semi-automated', 'automated']).toContain(suggestion.suggestedTier);
  });

  it('returns empty suggestions for projects without protocols', async () => {
    const fs = new MemoryFileSystem();
    const config = makeConfig('/project');
    const result = await suggestTools({ projectRoot: '/project', config, fs });
    expect(result.suggestions).toHaveLength(0);
    expect(result.success).toBe(true);
  });
});
