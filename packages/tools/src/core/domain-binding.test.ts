/**
 * @organon-invariant INV-TOOLS-2 every-command-has-tests
 */

import { describe, it, expect } from 'vitest';
import { domainBindingGate } from './domain-binding.js';
import { MemoryFileSystem } from './test-helpers.js';
import type { OrganonConfig } from './types.js';

function makeConfig(projectRoot: string): OrganonConfig {
  return {
    projectRoot,
    organonPaths: ['organon'],
    organonGlobs: ['**/ETHOS.md'],
    ignorePatterns: [],
    workflowPaths: {},
    freshnessThresholdHours: 24,
    sourceGlobs: ['src/**/*.ts'],
    sourceIgnorePatterns: [],
    coverage: { invariantImplementation: 0, protocolImplementation: 0 },
  };
}

const STABLE_DOMAIN_ETHOS = `---
type: constraints
scope: domain
name: billing
version: "1.0"
summary: Billing domain
token_estimate: 100
status: stable
---
# Billing`;

const DESIGNING_DOMAIN_ETHOS = `---
type: constraints
scope: domain
name: billing
version: "1.0"
summary: Billing domain
token_estimate: 100
status: designing
---
# Billing`;

const IMPLEMENTING_DOMAIN_ETHOS = `---
type: constraints
scope: domain
name: billing
version: "1.0"
summary: Billing domain
token_estimate: 100
status: implementing
---
# Billing`;

const NO_STATUS_DOMAIN_ETHOS = `---
type: constraints
scope: domain
name: billing
version: "1.0"
summary: Billing domain
token_estimate: 100
---
# Billing`;

describe('domainBindingGate', () => {
  it('passes when stable domain has scope claim in source file', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/ETHOS.md': STABLE_DOMAIN_ETHOS,
      '/project/src/billing.ts': '// @organon-implements domains/billing\nexport {}',
    });
    const result = await domainBindingGate({
      projectRoot: '/project',
      config: makeConfig('/project'),
      fs,
    });
    expect(result.passed).toBe(true);
    expect(result.errors.filter((e) => e.code === 'DOMAIN_BINDING_MISSING')).toHaveLength(0);
  });

  it('passes when stable domain has implemented_by in invariant frontmatter', async () => {
    const ethos = `---
type: constraints
scope: domain
name: billing
version: "1.0"
summary: Billing
token_estimate: 100
status: stable
invariants:
  - id: INV-BILLING-1
    name: charge-idempotency
    implemented_by:
      - src/billing/Service.ts
---
# Billing`;
    const fs = new MemoryFileSystem({
      '/project/organon/billing/ETHOS.md': ethos,
      '/project/src/billing/Service.ts': 'export class BillingService {}',
    });
    const result = await domainBindingGate({
      projectRoot: '/project',
      config: makeConfig('/project'),
      fs,
    });
    expect(result.passed).toBe(true);
    expect(result.errors.filter((e) => e.code === 'DOMAIN_BINDING_MISSING')).toHaveLength(0);
  });

  it('fails with DOMAIN_BINDING_MISSING when stable domain has no claims', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/ETHOS.md': STABLE_DOMAIN_ETHOS,
    });
    const result = await domainBindingGate({
      projectRoot: '/project',
      config: makeConfig('/project'),
      fs,
    });
    expect(result.passed).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'DOMAIN_BINDING_MISSING' }),
    );
  });

  it('passes when status is designing (exempt from binding)', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/ETHOS.md': DESIGNING_DOMAIN_ETHOS,
    });
    const result = await domainBindingGate({
      projectRoot: '/project',
      config: makeConfig('/project'),
      fs,
    });
    expect(result.passed).toBe(true);
    expect(result.errors.filter((e) => e.code === 'DOMAIN_BINDING_MISSING')).toHaveLength(0);
  });

  it('passes when status is implementing (exempt from binding)', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/ETHOS.md': IMPLEMENTING_DOMAIN_ETHOS,
    });
    const result = await domainBindingGate({
      projectRoot: '/project',
      config: makeConfig('/project'),
      fs,
    });
    expect(result.passed).toBe(true);
    expect(result.errors.filter((e) => e.code === 'DOMAIN_BINDING_MISSING')).toHaveLength(0);
  });

  it('treats absent status as stable and fires DOMAIN_BINDING_MISSING', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/ETHOS.md': NO_STATUS_DOMAIN_ETHOS,
    });
    const result = await domainBindingGate({
      projectRoot: '/project',
      config: makeConfig('/project'),
      fs,
    });
    expect(result.passed).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'DOMAIN_BINDING_MISSING' }),
    );
  });

  it('reports IMPL_ORPHANED_INVARIANT for annotation pointing to nonexistent invariant', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/ETHOS.md': STABLE_DOMAIN_ETHOS,
      '/project/src/billing.ts': [
        '// @organon-implements domains/billing',
        '// @organon-implements INV-FAKE-99',
        'export {}',
      ].join('\n'),
    });
    const result = await domainBindingGate({
      projectRoot: '/project',
      config: makeConfig('/project'),
      fs,
    });
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'IMPL_ORPHANED_INVARIANT' }),
    );
  });

  it('reports IMPL_ORPHANED_SCOPE warning for annotation pointing to nonexistent scope', async () => {
    const fs = new MemoryFileSystem({
      '/project/organon/billing/ETHOS.md': STABLE_DOMAIN_ETHOS,
      '/project/src/billing.ts': [
        '// @organon-implements domains/billing',
        '// @organon-implements domains/nonexistent',
        'export {}',
      ].join('\n'),
    });
    const result = await domainBindingGate({
      projectRoot: '/project',
      config: makeConfig('/project'),
      fs,
    });
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'IMPL_ORPHANED_SCOPE' }),
    );
  });

  it('only checks type:constraints files — navigation/rationale files are not subject to binding', async () => {
    const philosophy = `---
type: rationale
scope: domain
name: billing
version: "1.0"
summary: Billing philosophy
token_estimate: 100
---
# Philosophy`;
    const fs = new MemoryFileSystem({
      '/project/organon/billing/ETHOS.md': STABLE_DOMAIN_ETHOS,
      '/project/organon/billing/PHILOSOPHY.md': philosophy,
    });
    const config = {
      ...makeConfig('/project'),
      organonGlobs: ['**/ETHOS.md', '**/PHILOSOPHY.md'],
    };
    const result = await domainBindingGate({ projectRoot: '/project', config, fs });
    expect(result.passed).toBe(false);
    // Only the constraints file (ETHOS.md) should generate a binding error
    const bindingErrors = result.errors.filter((e) => e.code === 'DOMAIN_BINDING_MISSING');
    expect(bindingErrors).toHaveLength(1);
  });

  it('passes for product-scope organons (not checked by this gate)', async () => {
    const productEthos = `---
type: constraints
scope: product
name: my-app
version: "1.0"
summary: Product
token_estimate: 100
---
# App`;
    const fs = new MemoryFileSystem({
      '/project/organon/ETHOS.md': productEthos,
    });
    const config = { ...makeConfig('/project'), organonPaths: ['organon'], organonGlobs: ['ETHOS.md'] };
    const result = await domainBindingGate({ projectRoot: '/project', config, fs });
    expect(result.passed).toBe(true);
  });
});
