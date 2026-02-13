/**
 * Tests for placeholder detection gate.
 *
 * @organon-invariant INV-TOOLS-2 every-command-has-tests
 */

import { describe, it, expect } from 'vitest';
import { verifyPlaceholders } from './verify-placeholders.js';
import { MemoryFileSystem } from './test-helpers.js';
import type { OrganonConfig } from './types.js';

function makeConfig(projectRoot: string): OrganonConfig {
  return {
    projectRoot,
    organonPaths: ['.'],
    organonGlobs: ['**/ETHOS.md', '**/PHILOSOPHY.md'],
    ignorePatterns: [],
    workflowPaths: {},
    freshnessThresholdHours: 24,
  };
}

describe('verifyPlaceholders', () => {
  it('detects template placeholders in organon files', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': `---
type: constraints
scope: product
name: test
version: "1.0"
summary: Test
token_estimate: 200
---

## Identity

### What This Project IS

- [Describe what your project does — be specific]
- [What problem does it solve?]

## Invariants

1. **[Invariant name].** [Describe a hard constraint]
`,
    });
    const config = makeConfig('/project');
    const result = await verifyPlaceholders({ projectRoot: '/project', config, fs });

    expect(result.success).toBe(true); // Advisory
    expect(result.filesWithPlaceholders).toBe(1);
    expect(result.totalPlaceholders).toBeGreaterThan(0);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0].code).toBe('PLACEHOLDER_DETECTED');
  });

  it('passes cleanly when no placeholders exist', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': `---
type: constraints
scope: product
name: test
version: "1.0"
summary: Test
token_estimate: 200
---

## Identity

### What This Project IS

- A real project description
- Solves actual problems

## Invariants

1. **Data integrity.** All writes must be atomic.
`,
    });
    const config = makeConfig('/project');
    const result = await verifyPlaceholders({ projectRoot: '/project', config, fs });

    expect(result.filesWithPlaceholders).toBe(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('detects placeholders across multiple files', async () => {
    const fs = new MemoryFileSystem({
      '/project/ETHOS.md': `---
type: constraints
scope: product
name: test
version: "1.0"
summary: Test
token_estimate: 100
---

- [Describe what your project does]
`,
      '/project/PHILOSOPHY.md': `---
type: rationale
scope: product
name: test
version: "1.0"
summary: Test
token_estimate: 100
---

- [Evidence point 1]
`,
    });
    const config = makeConfig('/project');
    const result = await verifyPlaceholders({ projectRoot: '/project', config, fs });

    expect(result.filesWithPlaceholders).toBe(2);
  });

  it('handles empty projects', async () => {
    const fs = new MemoryFileSystem({});
    const config = makeConfig('/project');
    const result = await verifyPlaceholders({ projectRoot: '/project', config, fs });

    expect(result.success).toBe(true);
    expect(result.filesChecked).toBe(0);
  });
});
