/**
 * @organon-invariant INV-TOOLS-2 every-command-has-tests
 */

import { describe, it, expect } from 'vitest';
import { protocolCoverageGate } from './verify-protocol-coverage.js';
import { MemoryFileSystem } from './test-helpers.js';
import type { OrganonConfig } from './types.js';

function makeConfig(projectRoot: string, threshold = 0): OrganonConfig {
  return {
    projectRoot,
    organonPaths: ['organon'],
    organonGlobs: ['**/PROTOCOLS.md', '**/ETHOS.md'],
    ignorePatterns: [],
    workflowPaths: {},
    freshnessThresholdHours: 24,
    sourceGlobs: ['src/**/*.ts'],
    sourceIgnorePatterns: [],
    coverage: { invariantImplementation: 0, protocolImplementation: threshold },
  };
}

function makeProtocolsFile(opts: {
  scope?: string;
  status?: string;
  protocols: Array<{
    id: string;
    name: string;
    automation_tier: 'manual' | 'semi-automated' | 'automated';
  }>;
}): string {
  const protoLines = opts.protocols
    .map(
      (p) =>
        `  - id: ${p.id}\n    name: ${p.name}\n    steps: 3\n    automation_tier: ${p.automation_tier}\n    complexity: low`,
    )
    .join('\n');

  return `---
type: procedures
scope: ${opts.scope ?? 'domain'}
name: billing-protocols
version: "1.0"
summary: Billing protocols
token_estimate: 100
${opts.status ? `status: ${opts.status}` : ''}
protocols_count: ${opts.protocols.length}
protocols:
${protoLines}
---
# Protocols`;
}

describe('protocolCoverageGate', () => {
  it('passes when threshold is 0', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/PROTOCOLS.md': makeProtocolsFile({
        protocols: [{ id: 'PROTO-BILLING-1', name: 'charge', automation_tier: 'automated' }],
      }),
    });
    const result = await protocolCoverageGate({
      projectRoot: '/project',
      config: makeConfig('/project', 0),
      fs,
    });
    expect(result.passed).toBe(true);
  });

  it('excludes manual-tier protocols from denominator', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/PROTOCOLS.md': makeProtocolsFile({
        protocols: [
          { id: 'PROTO-BILLING-1', name: 'charge', automation_tier: 'manual' },
          { id: 'PROTO-BILLING-2', name: 'refund', automation_tier: 'manual' },
        ],
      }),
    });
    // All protocols are manual — denominator is 0 — gate always passes
    const result = await protocolCoverageGate({
      projectRoot: '/project',
      config: makeConfig('/project', 100),
      fs,
    });
    expect(result.passed).toBe(true);
  });

  it('excludes product-scope protocols from denominator', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/PROTOCOLS.md': makeProtocolsFile({
        scope: 'product',
        protocols: [{ id: 'PROTO-ORG-1', name: 'release', automation_tier: 'semi-automated' }],
      }),
    });
    const config = { ...makeConfig('/project', 100), organonPaths: ['organon'], organonGlobs: ['PROTOCOLS.md'] };
    const result = await protocolCoverageGate({ projectRoot: '/project', config, fs });
    expect(result.passed).toBe(true);
  });

  it('excludes designing-status domain protocols from denominator', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/PROTOCOLS.md': makeProtocolsFile({
        status: 'designing',
        protocols: [{ id: 'PROTO-BILLING-1', name: 'charge', automation_tier: 'automated' }],
      }),
    });
    const result = await protocolCoverageGate({
      projectRoot: '/project',
      config: makeConfig('/project', 100),
      fs,
    });
    expect(result.passed).toBe(true);
  });

  it('counts protocol as covered when source file has @organon-implements annotation', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/PROTOCOLS.md': makeProtocolsFile({
        protocols: [{ id: 'PROTO-BILLING-1', name: 'charge', automation_tier: 'automated' }],
      }),
      '/project/src/charger.ts': '// @organon-implements PROTO-BILLING-1\nexport {}',
    });
    const result = await protocolCoverageGate({
      projectRoot: '/project',
      config: makeConfig('/project', 100),
      fs,
    });
    expect(result.passed).toBe(true);
    expect(result.errors.filter((e) => e.code === 'PROTO_COVERAGE_BELOW_THRESHOLD')).toHaveLength(0);
  });

  it('fails with PROTO_COVERAGE_BELOW_THRESHOLD when coverage is below threshold', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/PROTOCOLS.md': makeProtocolsFile({
        protocols: [
          { id: 'PROTO-BILLING-1', name: 'charge', automation_tier: 'automated' },
          { id: 'PROTO-BILLING-2', name: 'refund', automation_tier: 'semi-automated' },
        ],
      }),
      // Only PROTO-BILLING-1 covered — 50% < 80%
      '/project/src/charger.ts': '// @organon-implements PROTO-BILLING-1\nexport {}',
    });
    const result = await protocolCoverageGate({
      projectRoot: '/project',
      config: makeConfig('/project', 80),
      fs,
    });
    expect(result.passed).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'PROTO_COVERAGE_BELOW_THRESHOLD' }),
    );
  });

  it('always emits PROTO_PROTOCOL_UNCOVERED warnings even when gate passes', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/PROTOCOLS.md': makeProtocolsFile({
        protocols: [{ id: 'PROTO-BILLING-1', name: 'charge', automation_tier: 'automated' }],
      }),
      // No source files — 0% coverage but threshold is 0 → gate passes
    });
    const result = await protocolCoverageGate({
      projectRoot: '/project',
      config: makeConfig('/project', 0),
      fs,
    });
    expect(result.passed).toBe(true);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'PROTO_PROTOCOL_UNCOVERED' }),
    );
  });
});
