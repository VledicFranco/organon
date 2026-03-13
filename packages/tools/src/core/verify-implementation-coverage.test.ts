/**
 * @organon-invariant INV-TOOLS-2 every-command-has-tests
 */

import { describe, it, expect } from 'vitest';
import { implementationCoverageGate } from './verify-implementation-coverage.js';
import { MemoryFileSystem } from './test-helpers.js';
import type { OrganonConfig } from './types.js';

function makeConfig(projectRoot: string, threshold = 0): OrganonConfig {
  return {
    projectRoot,
    organonPaths: ['organon'],
    organonGlobs: ['**/ETHOS.md'],
    ignorePatterns: [],
    workflowPaths: {},
    freshnessThresholdHours: 24,
    sourceGlobs: ['src/**/*.ts'],
    sourceIgnorePatterns: [],
    coverage: { invariantImplementation: threshold, protocolImplementation: 0 },
  };
}

function makeDomainEthos(opts: {
  name: string;
  status?: string;
  invariants?: Array<{ id: string; name: string; judgment_call?: boolean }>;
}): string {
  const invLines = (opts.invariants ?? [])
    .map((inv) => {
      let line = `  - id: ${inv.id}\n    name: ${inv.name}`;
      if (inv.judgment_call) line += '\n    judgment_call: true';
      return line;
    })
    .join('\n');

  return `---
type: constraints
scope: domain
name: ${opts.name}
version: "1.0"
summary: ${opts.name} domain
token_estimate: 100
${opts.status ? `status: ${opts.status}` : ''}
${opts.invariants ? `invariants:\n${invLines}` : ''}
---
# ${opts.name}`;
}

describe('implementationCoverageGate', () => {
  it('passes when threshold is 0 regardless of coverage', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/ETHOS.md': makeDomainEthos({
        name: 'billing',
        invariants: [
          { id: 'INV-BILLING-1', name: 'charge-idempotency' },
          { id: 'INV-BILLING-2', name: 'no-double-charge' },
        ],
      }),
      // No source files with @organon-implements
    });
    const result = await implementationCoverageGate({
      projectRoot: '/project',
      config: makeConfig('/project', 0),
      fs,
    });
    expect(result.passed).toBe(true);
    expect(result.errors.filter((e) => e.code === 'IMPL_COVERAGE_BELOW_THRESHOLD')).toHaveLength(0);
  });

  it('passes when coverage meets threshold', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/ETHOS.md': makeDomainEthos({
        name: 'billing',
        invariants: [
          { id: 'INV-BILLING-1', name: 'charge-idempotency' },
          { id: 'INV-BILLING-2', name: 'no-double-charge' },
        ],
      }),
      // Both invariants covered
      '/project/src/a.ts': '// @organon-implements INV-BILLING-1\nexport {}',
      '/project/src/b.ts': '// @organon-implements INV-BILLING-2\nexport {}',
    });
    const result = await implementationCoverageGate({
      projectRoot: '/project',
      config: makeConfig('/project', 80),
      fs,
    });
    expect(result.passed).toBe(true);
  });

  it('fails with IMPL_COVERAGE_BELOW_THRESHOLD when coverage is below threshold', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/ETHOS.md': makeDomainEthos({
        name: 'billing',
        invariants: [
          { id: 'INV-BILLING-1', name: 'charge-idempotency' },
          { id: 'INV-BILLING-2', name: 'no-double-charge' },
          { id: 'INV-BILLING-3', name: 'audit-trail' },
          { id: 'INV-BILLING-4', name: 'refund-policy' },
          { id: 'INV-BILLING-5', name: 'currency-safety' },
        ],
      }),
      // Only 3/5 = 60% covered — below threshold of 80
      '/project/src/a.ts': [
        '// @organon-implements INV-BILLING-1',
        '// @organon-implements INV-BILLING-2',
        '// @organon-implements INV-BILLING-3',
        'export {}',
      ].join('\n'),
    });
    const result = await implementationCoverageGate({
      projectRoot: '/project',
      config: makeConfig('/project', 80),
      fs,
    });
    expect(result.passed).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'IMPL_COVERAGE_BELOW_THRESHOLD' }),
    );
  });

  it('excludes judgment_call invariants from denominator', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/ETHOS.md': makeDomainEthos({
        name: 'billing',
        invariants: [
          { id: 'INV-BILLING-1', name: 'charge-idempotency' },
          { id: 'INV-BILLING-2', name: 'ux-quality', judgment_call: true },
        ],
      }),
      // Only INV-BILLING-1 covered, but INV-BILLING-2 is judgment_call
      '/project/src/a.ts': '// @organon-implements INV-BILLING-1\nexport {}',
    });
    // With INV-BILLING-2 excluded, 1/1 = 100% ≥ 80 → passes
    const result = await implementationCoverageGate({
      projectRoot: '/project',
      config: makeConfig('/project', 80),
      fs,
    });
    expect(result.passed).toBe(true);
  });

  it('excludes invariants from designing organons', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/ETHOS.md': makeDomainEthos({
        name: 'billing',
        status: 'designing',
        invariants: [{ id: 'INV-BILLING-1', name: 'charge-idempotency' }],
      }),
      // No source files — but designing domain is excluded from denominator
    });
    const result = await implementationCoverageGate({
      projectRoot: '/project',
      config: makeConfig('/project', 100),
      fs,
    });
    expect(result.passed).toBe(true);
  });

  it('includes feature-scope invariants in denominator', async () => {
    const featureEthos = `---
type: constraints
scope: feature
name: checkout
version: "1.0"
summary: Checkout feature
token_estimate: 100
invariants:
  - id: INV-CHK-1
    name: cart-validation
---
# Checkout`;
    const fs = new MemoryFileSystem({
      '/project/organon/features/checkout/ETHOS.md': featureEthos,
      // No implementation claims — 0% < 80% threshold
    });
    const result = await implementationCoverageGate({
      projectRoot: '/project',
      config: makeConfig('/project', 80),
      fs,
    });
    expect(result.passed).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'IMPL_COVERAGE_BELOW_THRESHOLD' }),
    );
  });

  it('always emits IMPL_INVARIANT_UNCOVERED warnings even when gate passes', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/ETHOS.md': makeDomainEthos({
        name: 'billing',
        invariants: [{ id: 'INV-BILLING-1', name: 'charge-idempotency' }],
      }),
      // No source files — 0% coverage but threshold is 0 → gate passes
    });
    const result = await implementationCoverageGate({
      projectRoot: '/project',
      config: makeConfig('/project', 0),
      fs,
    });
    expect(result.passed).toBe(true);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'IMPL_INVARIANT_UNCOVERED' }),
    );
  });

  it('passes when there are no testable invariants', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/ETHOS.md': makeDomainEthos({
        name: 'billing',
        invariants: [{ id: 'INV-BILLING-1', name: 'ux', judgment_call: true }],
      }),
    });
    const result = await implementationCoverageGate({
      projectRoot: '/project',
      config: makeConfig('/project', 100),
      fs,
    });
    expect(result.passed).toBe(true);
  });
});
