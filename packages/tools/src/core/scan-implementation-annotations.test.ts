/**
 * @organon-invariant INV-TOOLS-2 every-command-has-tests
 */

import { describe, it, expect } from 'vitest';
import {
  scanImplementationAnnotations,
  buildKnownIds,
} from './scan-implementation-annotations.js';
import { MemoryFileSystem } from './test-helpers.js';
import type { OrganonConfig, ParsedOrganonFile } from './types.js';

function makeConfig(overrides?: Partial<OrganonConfig>): OrganonConfig {
  return {
    projectRoot: '/project',
    organonPaths: ['.'],
    organonGlobs: ['**/*.md'],
    ignorePatterns: [],
    workflowPaths: {},
    freshnessThresholdHours: 24,
    sourceGlobs: ['src/**/*.ts'],
    sourceIgnorePatterns: ['**/node_modules/**'],
    coverage: { invariantImplementation: 0, protocolImplementation: 0 },
    ...overrides,
  };
}

function makeKnownIds(opts?: {
  invariantIds?: string[];
  protocolIds?: string[];
  scopes?: string[];
}) {
  return {
    knownInvariantIds: new Set<string>(opts?.invariantIds ?? []),
    knownProtocolIds: new Set<string>(opts?.protocolIds ?? []),
    knownScopes: new Set<string>(opts?.scopes ?? []),
  };
}

describe('scanImplementationAnnotations', () => {
  it('finds @organon-implements invariant claims', async () => {
    const fs = new MemoryFileSystem({
      '/project/src/billing/Service.ts': `
// @organon-implements INV-BILLING-1
export class BillingService {}
`,
    });
    const result = await scanImplementationAnnotations({
      fileSystem: fs,
      projectRoot: '/project',
      config: makeConfig(),
      ...makeKnownIds({ invariantIds: ['INV-BILLING-1'] }),
    });
    expect(result.claims).toHaveLength(1);
    expect(result.claims[0].type).toBe('invariant');
    expect(result.claims[0].reference).toBe('INV-BILLING-1');
    expect(result.claims[0].line).toBe(2);
    expect(result.byInvariant.get('INV-BILLING-1')).toContain('src/billing/Service.ts');
    expect(result.orphans).toHaveLength(0);
    expect(result.diagnostics).toHaveLength(0);
  });

  it('finds @organon-implements protocol claims', async () => {
    const fs = new MemoryFileSystem({
      '/project/src/billing/charger.ts': `
// @organon-implements PROTO-BILLING-1
export function charge() {}
`,
    });
    const result = await scanImplementationAnnotations({
      fileSystem: fs,
      projectRoot: '/project',
      config: makeConfig(),
      ...makeKnownIds({ protocolIds: ['PROTO-BILLING-1'] }),
    });
    expect(result.claims[0].type).toBe('protocol');
    expect(result.byProtocol.get('PROTO-BILLING-1')).toContain('src/billing/charger.ts');
    expect(result.orphans).toHaveLength(0);
  });

  it('finds @organon-implements scope claims', async () => {
    const fs = new MemoryFileSystem({
      '/project/src/billing/index.ts': `
// @organon-implements domains/billing
export * from './Service';
`,
    });
    const result = await scanImplementationAnnotations({
      fileSystem: fs,
      projectRoot: '/project',
      config: makeConfig(),
      ...makeKnownIds({ scopes: ['domains/billing'] }),
    });
    expect(result.claims[0].type).toBe('scope');
    expect(result.byScope.get('domains/billing')).toContain('src/billing/index.ts');
    expect(result.orphans).toHaveLength(0);
  });

  it('detects orphaned invariant reference', async () => {
    const fs = new MemoryFileSystem({
      '/project/src/foo.ts': '// @organon-implements INV-FAKE-1\nexport {}',
    });
    const result = await scanImplementationAnnotations({
      fileSystem: fs,
      projectRoot: '/project',
      config: makeConfig(),
      ...makeKnownIds({ invariantIds: [] }),
    });
    expect(result.orphans).toHaveLength(1);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'IMPL_ORPHANED_INVARIANT', severity: 'error' }),
    );
  });

  it('detects orphaned protocol reference', async () => {
    const fs = new MemoryFileSystem({
      '/project/src/foo.ts': '// @organon-implements PROTO-FAKE-1\nexport {}',
    });
    const result = await scanImplementationAnnotations({
      fileSystem: fs,
      projectRoot: '/project',
      config: makeConfig(),
      ...makeKnownIds({ protocolIds: [] }),
    });
    expect(result.orphans).toHaveLength(1);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'IMPL_ORPHANED_PROTOCOL', severity: 'error' }),
    );
  });

  it('detects orphaned scope reference as warning', async () => {
    const fs = new MemoryFileSystem({
      '/project/src/foo.ts': '// @organon-implements domains/nonexistent\nexport {}',
    });
    const result = await scanImplementationAnnotations({
      fileSystem: fs,
      projectRoot: '/project',
      config: makeConfig(),
      ...makeKnownIds({ scopes: [] }),
    });
    expect(result.orphans).toHaveLength(1);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'IMPL_ORPHANED_SCOPE', severity: 'warning' }),
    );
  });

  it('classifies unknown reference format as warning', async () => {
    const fs = new MemoryFileSystem({
      '/project/src/foo.ts': '// @organon-implements some-random-thing\nexport {}',
    });
    const result = await scanImplementationAnnotations({
      fileSystem: fs,
      projectRoot: '/project',
      config: makeConfig(),
      ...makeKnownIds(),
    });
    expect(result.claims[0].type).toBe('unknown');
    expect(result.orphans).toHaveLength(0); // unknown claims are not orphans
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'IMPL_UNKNOWN_REFERENCE', severity: 'warning' }),
    );
  });

  it('handles Python # comments', async () => {
    const fs = new MemoryFileSystem({
      '/project/src/billing.py': '# @organon-implements INV-BILLING-1\ndef charge(): pass',
    });
    const config = makeConfig({ sourceGlobs: ['src/**/*.py'] });
    const result = await scanImplementationAnnotations({
      fileSystem: fs,
      projectRoot: '/project',
      config,
      ...makeKnownIds({ invariantIds: ['INV-BILLING-1'] }),
    });
    expect(result.claims).toHaveLength(1);
    expect(result.claims[0].type).toBe('invariant');
    expect(result.byInvariant.get('INV-BILLING-1')).toContain('src/billing.py');
  });

  it('handles SQL -- comments', async () => {
    const fs = new MemoryFileSystem({
      '/project/src/schema.sql': '-- @organon-implements PROTO-DB-1\nCREATE TABLE foo (id INT);',
    });
    const config = makeConfig({ sourceGlobs: ['src/**/*.sql'] });
    const result = await scanImplementationAnnotations({
      fileSystem: fs,
      projectRoot: '/project',
      config,
      ...makeKnownIds({ protocolIds: ['PROTO-DB-1'] }),
    });
    expect(result.claims).toHaveLength(1);
    expect(result.claims[0].type).toBe('protocol');
  });

  it('handles multiple annotations in same file', async () => {
    const fs = new MemoryFileSystem({
      '/project/src/billing/Service.ts': `
// @organon-implements INV-BILLING-1
// @organon-implements INV-BILLING-2
// @organon-implements domains/billing
export class BillingService {}
`,
    });
    const result = await scanImplementationAnnotations({
      fileSystem: fs,
      projectRoot: '/project',
      config: makeConfig(),
      ...makeKnownIds({
        invariantIds: ['INV-BILLING-1', 'INV-BILLING-2'],
        scopes: ['domains/billing'],
      }),
    });
    expect(result.claims).toHaveLength(3);
    expect(result.byInvariant.get('INV-BILLING-1')).toContain('src/billing/Service.ts');
    expect(result.byInvariant.get('INV-BILLING-2')).toContain('src/billing/Service.ts');
    expect(result.byScope.get('domains/billing')).toContain('src/billing/Service.ts');
  });

  it('respects sourceIgnorePatterns', async () => {
    const fs = new MemoryFileSystem({
      '/project/src/billing/Service.ts': '// @organon-implements INV-BILLING-1\nexport {}',
      '/project/src/billing/Service.test.ts': '// @organon-implements INV-BILLING-1\nexport {}',
    });
    const config = makeConfig({ sourceIgnorePatterns: ['**/*.test.ts'] });
    const result = await scanImplementationAnnotations({
      fileSystem: fs,
      projectRoot: '/project',
      config,
      ...makeKnownIds({ invariantIds: ['INV-BILLING-1'] }),
    });
    // Only the non-test file should be scanned
    expect(result.claims).toHaveLength(1);
    expect(result.claims[0].file).toBe('src/billing/Service.ts');
  });

  it('returns empty result when no source files found', async () => {
    const fs = new MemoryFileSystem({});
    const result = await scanImplementationAnnotations({
      fileSystem: fs,
      projectRoot: '/project',
      config: makeConfig(),
      ...makeKnownIds(),
    });
    expect(result.claims).toHaveLength(0);
    expect(result.orphans).toHaveLength(0);
    expect(result.diagnostics).toHaveLength(0);
    expect(result.byInvariant.size).toBe(0);
    expect(result.byProtocol.size).toBe(0);
    expect(result.byScope.size).toBe(0);
  });

  it('is case-insensitive for invariant IDs', async () => {
    const fs = new MemoryFileSystem({
      '/project/src/foo.ts': '// @organon-implements inv-billing-1\nexport {}',
    });
    // Known ID is uppercase, annotation is lowercase
    const result = await scanImplementationAnnotations({
      fileSystem: fs,
      projectRoot: '/project',
      config: makeConfig(),
      ...makeKnownIds({ invariantIds: ['INV-BILLING-1'] }),
    });
    expect(result.orphans).toHaveLength(0);
    expect(result.byInvariant.get('INV-BILLING-1')).toContain('src/foo.ts');
  });

  it('is case-insensitive for protocol IDs', async () => {
    const fs = new MemoryFileSystem({
      '/project/src/foo.ts': '// @organon-implements proto-billing-1\nexport {}',
    });
    const result = await scanImplementationAnnotations({
      fileSystem: fs,
      projectRoot: '/project',
      config: makeConfig(),
      ...makeKnownIds({ protocolIds: ['PROTO-BILLING-1'] }),
    });
    expect(result.orphans).toHaveLength(0);
    expect(result.byProtocol.get('PROTO-BILLING-1')).toContain('src/foo.ts');
  });

  it('records correct line number for annotation', async () => {
    const fs = new MemoryFileSystem({
      '/project/src/foo.ts': `line 1
line 2
// @organon-implements INV-FOO-1
line 4`,
    });
    const result = await scanImplementationAnnotations({
      fileSystem: fs,
      projectRoot: '/project',
      config: makeConfig(),
      ...makeKnownIds({ invariantIds: ['INV-FOO-1'] }),
    });
    expect(result.claims[0].line).toBe(3);
  });

  describe('buildKnownIds', () => {
    it('extracts invariant IDs from parsed files', () => {
      const files: ParsedOrganonFile[] = [
        {
          path: 'organon/domains/billing/ETHOS.md',
          frontmatter: {
            type: 'constraints',
            scope: 'domain',
            name: 'billing',
            version: '1.0',
            summary: 'Billing',
            token_estimate: 100,
            invariants: [
              { id: 'INV-BILLING-1', name: 'charge-idempotency' },
              { id: 'INV-BILLING-2', name: 'no-double-charge' },
            ],
          },
          rawFrontmatter: '',
          body: '',
          content: '',
        },
      ];
      const { invariantIds } = buildKnownIds(files);
      expect(invariantIds.has('INV-BILLING-1')).toBe(true);
      expect(invariantIds.has('INV-BILLING-2')).toBe(true);
    });

    it('extracts protocol IDs from parsed files', () => {
      const files: ParsedOrganonFile[] = [
        {
          path: 'organon/protocols/PROTOCOLS.md',
          frontmatter: {
            type: 'procedures',
            scope: 'domain',
            name: 'protocols',
            version: '1.0',
            summary: 'Protocols',
            token_estimate: 100,
            protocols: [
              { id: 'PROTO-BILLING-1', name: 'charge', steps: 3, automation_tier: 'automated', complexity: 'low' },
            ],
          },
          rawFrontmatter: '',
          body: '',
          content: '',
        },
      ];
      const { protocolIds } = buildKnownIds(files);
      expect(protocolIds.has('PROTO-BILLING-1')).toBe(true);
    });

    it('builds scope strings from domain/feature/component/product organons', () => {
      const files: ParsedOrganonFile[] = [
        {
          path: 'organon/domains/billing/ETHOS.md',
          frontmatter: { type: 'constraints', scope: 'domain', name: 'billing', version: '1.0', summary: 'B', token_estimate: 100 },
          rawFrontmatter: '', body: '', content: '',
        },
        {
          path: 'organon/features/checkout/ETHOS.md',
          frontmatter: { type: 'constraints', scope: 'feature', name: 'checkout', version: '1.0', summary: 'C', token_estimate: 100 },
          rawFrontmatter: '', body: '', content: '',
        },
        {
          path: 'ETHOS.md',
          frontmatter: { type: 'constraints', scope: 'product', name: 'my-app', version: '1.0', summary: 'P', token_estimate: 100 },
          rawFrontmatter: '', body: '', content: '',
        },
      ];
      const { scopes } = buildKnownIds(files);
      expect(scopes.has('domains/billing')).toBe(true);
      expect(scopes.has('features/checkout')).toBe(true);
      expect(scopes.has('product')).toBe(true);
    });

    it('normalizes IDs to uppercase', () => {
      const files: ParsedOrganonFile[] = [
        {
          path: 'ETHOS.md',
          frontmatter: {
            type: 'constraints',
            scope: 'domain',
            name: 'billing',
            version: '1.0',
            summary: 'B',
            token_estimate: 100,
            invariants: [{ id: 'inv-billing-1', name: 'test' }],
          },
          rawFrontmatter: '', body: '', content: '',
        },
      ];
      const { invariantIds } = buildKnownIds(files);
      expect(invariantIds.has('INV-BILLING-1')).toBe(true);
    });
  });
});
