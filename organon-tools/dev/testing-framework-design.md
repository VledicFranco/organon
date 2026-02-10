---
type: rationale
scope: product
name: testing-framework-design
version: "0.1"
summary: Design document for @organon/testing - semantic testing framework for tier-4 invariant verification
token_estimate: 3500
related_files:
  - ../ETHOS.md
  - ../PHILOSOPHY.md
  - ../../book-llms/invariant-tracking.md
  - ../../book-llms/three-layer-architecture.md
load_priority: high
audience: [llm, human]
status: draft
---

# @organon/testing: Semantic Testing Framework

> A TypeScript-native testing library that bridges the gap between "declare invariant" and "verify invariant in code."

---

## Context

**Problem:** Projects using Organon must implement tier-4 tests (automated code verification) from scratch. Every team reinvents:
- Common assertion patterns (max values, forbidden imports, structural checks)
- Test discovery (mapping invariant IDs to test coverage)
- Coverage reporting (which invariants lack tests?)
- Boilerplate for common constraints

This is a **major adoption blocker**. Teams declare invariants in ETHOS.md but never automate enforcement.

**Current state:**
- `organon verify` has gates for frontmatter, triplets, etc.
- But no support for "verify that code obeys invariants"
- Projects must write custom tests without guidance
- No standard patterns or reusable assertions

**Goal:** Provide a testing library that:
1. Makes tier-4 testing feel natural (not bolted-on)
2. Provides reusable assertions for common invariant types
3. Integrates with existing test frameworks (Vitest, Jest, Mocha)
4. Tracks coverage (which invariants have tests?)
5. Auto-generates test scaffolds from ETHOS.md

---

## Proposed Solution

A **semantic testing framework** with three components:

1. **Core assertion library** (`@organon/testing/core`)
   - Pre-built assertions: `assertMaxValue`, `assertNoSideEffects`, `assertFileExists`, etc.
   - Custom assertion builder: `assertCustom`
   - Metadata tracking: links tests to invariant IDs

2. **Test framework adapters** (`@organon/testing/adapters`)
   - Vitest integration (Phase 1)
   - Jest integration (Phase 2)
   - Mocha integration (Phase 3)

3. **CLI tooling** (part of `organon-tools`)
   - `organon generate-tests` - Scaffold tests from ETHOS.md
   - `organon coverage` - Enhanced to read test metadata
   - `organon verify --gate=tier4-tests` - Run invariant tests

---

## Key Features

### 1. Semantic Test Declaration

Link tests to invariant IDs using `testInvariant()` wrapper:

```typescript
import { describe } from 'vitest';
import { testInvariant, assertMaxValue } from '@organon/testing';

describe('Product Invariants', () => {
  testInvariant('INV-PROD-1', 'cache TTL max 24h', async () => {
    await assertMaxValue({
      files: ['src/config/*.ts'],
      pattern: /cacheTTL\s*=\s*(\d+)/,
      maxValue: 86400,
      unit: 'seconds',
    });
  });
});
```

### 2. Common Assertions

Pre-built for common invariant patterns:

| Assertion | Use Case | Example |
|-----------|----------|---------|
| `assertMaxValue` | Numeric bounds (TTLs, limits, sizes) | `maxValue: 86400` |
| `assertNoSideEffects` | Pure modules (no I/O, no globals) | `forbiddenImports: ['fs', 'http']` |
| `assertFileExists` | Structural requirements | `requiredFiles: ['ETHOS.md']` |
| `assertBackwardsCompat` | API stability | `compareExports(v1, v2)` |
| `assertNamingConvention` | Consistency (kebab-case, PascalCase) | `pattern: /^[a-z-]+$/` |
| `assertCustom` | User-defined logic | Full control |

### 3. Auto-generated Test Scaffolds

```bash
organon generate-tests
# Reads organon/ETHOS.md
# For each invariant:
#   - Detects pattern (max/limit → assertMaxValue, pure → assertNoSideEffects)
#   - Generates test scaffold with TODO
#   - User fills in file globs and patterns
```

**Example output:**

```typescript
// tests/organon/invariants.test.ts (auto-generated)
import { describe } from 'vitest';
import { testInvariant, assertMaxValue, assertNoSideEffects } from '@organon/testing';

describe('Product Invariants', () => {
  testInvariant('INV-PROD-1', 'cache TTL max 24h', async () => {
    // TODO: Specify files and pattern to search
    await assertMaxValue({
      files: ['src/**/*.ts'], // FIXME: narrow this glob
      pattern: /cacheTTL\s*=\s*(\d+)/, // FIXME: verify this regex
      maxValue: 86400,
      unit: 'seconds',
    });
  });

  testInvariant('INV-PROD-2', 'core modules are pure', async () => {
    // TODO: Specify which modules should be pure
    await assertNoSideEffects({
      files: ['src/core/**/*.ts'], // FIXME: verify path
      forbiddenImports: ['fs', 'http', 'child_process'], // FIXME: add more if needed
    });
  });
});
```

### 4. Coverage Integration

Tests write metadata to `.organon/coverage.json`:

```json
{
  "invariants": {
    "INV-PROD-1": {
      "tested": true,
      "testFile": "tests/organon/invariants.test.ts",
      "lastRun": "2026-02-10T12:00:00Z"
    },
    "INV-PROD-2": {
      "tested": true,
      "testFile": "tests/organon/invariants.test.ts",
      "lastRun": "2026-02-10T12:00:00Z"
    },
    "INV-PROD-3": {
      "tested": false,
      "reason": "No test found"
    }
  },
  "coverage": 0.67
}
```

Then `organon coverage` reads this file:

```bash
organon coverage
# Invariant Coverage: 67% (2/3)
#
# ✅ INV-PROD-1: cache TTL max 24h (tested)
# ✅ INV-PROD-2: core modules are pure (tested)
# ❌ INV-PROD-3: all exports documented (NOT TESTED)
```

---

## Design Details

### Architecture

```
@organon/testing/
├── core/
│   ├── invariant-test.ts          # testInvariant() wrapper
│   ├── assertions/
│   │   ├── max-value.ts           # assertMaxValue()
│   │   ├── no-side-effects.ts     # assertNoSideEffects()
│   │   ├── file-exists.ts         # assertFileExists()
│   │   ├── backwards-compat.ts    # assertBackwardsCompat()
│   │   ├── naming-convention.ts   # assertNamingConvention()
│   │   └── custom.ts              # assertCustom()
│   ├── discovery/
│   │   ├── scan-ethos.ts          # Parse ETHOS.md for invariants
│   │   ├── scan-tests.ts          # Find testInvariant() calls
│   │   └── coverage.ts            # Calculate coverage %
│   └── reporters/
│       ├── json-reporter.ts       # Write .organon/coverage.json
│       └── console-reporter.ts    # Human-readable output
├── adapters/
│   ├── vitest.ts                  # Vitest integration
│   ├── jest.ts                    # Jest integration (future)
│   └── mocha.ts                   # Mocha integration (future)
└── index.ts                       # Public API
```

### Implementation Notes

**Core Principles:**
1. **Pure functions** - All assertions are pure (no side effects, testable)
2. **Fail-fast** - Assertions throw clear errors on violations
3. **Composable** - Assertions can combine (e.g., max value + naming convention)
4. **Framework-agnostic core** - Adapters handle framework-specific details

**Assertion Pattern:**

Each assertion follows this structure:

```typescript
// core/assertions/max-value.ts
export interface MaxValueOptions {
  files: string[];          // Glob patterns
  pattern: RegExp;          // Regex to extract numeric value
  maxValue: number;         // Upper bound
  unit?: string;            // Optional (for error messages)
}

export async function assertMaxValue(options: MaxValueOptions): Promise<void> {
  // 1. Glob files
  const filePaths = await glob(options.files);

  // 2. Search for pattern in each file
  const violations: Violation[] = [];
  for (const filePath of filePaths) {
    const content = await readFile(filePath);
    const matches = content.matchAll(options.pattern);

    for (const match of matches) {
      const value = parseInt(match[1], 10);
      if (value > options.maxValue) {
        violations.push({
          file: filePath,
          line: getLineNumber(content, match.index),
          value,
          maxValue: options.maxValue,
        });
      }
    }
  }

  // 3. Fail-fast if violations found
  if (violations.length > 0) {
    throw new InvariantViolationError({
      message: `Found ${violations.length} value(s) exceeding max ${options.maxValue}${options.unit ? ' ' + options.unit : ''}`,
      violations,
    });
  }
}
```

**Test Metadata:**

`testInvariant()` wrapper registers metadata:

```typescript
// core/invariant-test.ts
export function testInvariant(
  invariantId: string,
  description: string,
  testFn: () => Promise<void>
) {
  // Register this test in global metadata
  registerInvariantTest({
    invariantId,
    description,
    testFile: getCurrentTestFile(),
  });

  // Wrap test function to catch and format errors
  return async () => {
    try {
      await testFn();
      recordTestSuccess(invariantId);
    } catch (error) {
      recordTestFailure(invariantId, error);
      throw error;
    }
  };
}
```

**Coverage Calculation:**

```typescript
// core/discovery/coverage.ts
export async function calculateCoverage(): Promise<CoverageReport> {
  // 1. Scan ETHOS.md for declared invariants
  const declaredInvariants = await scanEthos();

  // 2. Scan tests for testInvariant() calls
  const testedInvariants = await scanTests();

  // 3. Calculate coverage
  const coverage = testedInvariants.size / declaredInvariants.size;

  // 4. Identify untested invariants
  const untested = declaredInvariants.filter(id => !testedInvariants.has(id));

  return {
    declaredCount: declaredInvariants.size,
    testedCount: testedInvariants.size,
    coverage,
    untested,
  };
}
```

---

## Example Usage (Full Workflow)

### Step 1: Declare Invariants in ETHOS.md

```yaml
invariants:
  - id: INV-CACHE-1
    name: ttl-max-24h
    text: "Cache TTL must not exceed 24 hours (86400 seconds)"
  - id: INV-CORE-1
    name: core-pure
    text: "Core modules must be pure (no I/O, no side effects)"
```

### Step 2: Generate Test Scaffolds

```bash
npm install @organon/testing
organon generate-tests
# ✅ Generated tests/organon/invariants.test.ts
# TODO: Review and customize generated tests
```

### Step 3: Customize Tests

```typescript
// tests/organon/invariants.test.ts
import { describe } from 'vitest';
import { testInvariant, assertMaxValue, assertNoSideEffects } from '@organon/testing';

describe('Product Invariants', () => {
  testInvariant('INV-CACHE-1', 'ttl max 24h', async () => {
    await assertMaxValue({
      files: ['src/config/cache.ts'],
      pattern: /ttl:\s*(\d+)/,
      maxValue: 86400,
      unit: 'seconds',
    });
  });

  testInvariant('INV-CORE-1', 'core pure', async () => {
    await assertNoSideEffects({
      files: ['src/core/**/*.ts'],
      forbiddenImports: ['fs', 'http', 'child_process', 'process'],
      forbiddenGlobals: ['window', 'document'],
    });
  });
});
```

### Step 4: Run Tests

```bash
npm test
# All tests pass ✅

organon coverage
# Invariant Coverage: 100% (2/2)
# ✅ INV-CACHE-1: ttl max 24h
# ✅ INV-CORE-1: core pure
```

### Step 5: Add Verification Gate

```bash
organon verify --gate=tier4-tests
# Running invariant tests...
# ✅ All invariant tests passed
# ✅ Coverage: 100% (2/2 invariants tested)
```

---

## Open Questions

### 1. Package Structure: Monorepo vs Separate?

**Option A: Monorepo (inside organon-tools)**
- **Pros:** Shared code, easier versioning, single CI pipeline
- **Cons:** Larger dependency footprint for CLI users

**Option B: Separate repo (organon-testing)**
- **Pros:** Lighter dependencies, independent versioning
- **Cons:** Duplication (ETHOS parsing logic), harder to coordinate releases

**Recommendation:** Monorepo with separate npm package (`@organon/testing`). Use workspace setup to share code without forcing dependency bloat.

---

### 2. Test Framework: Vitest-only or Multi-framework?

**Option A: Vitest-only (Phase 1)**
- **Pros:** Faster delivery, modern ecosystem, TypeScript-native
- **Cons:** Excludes Jest/Mocha users

**Option B: Framework-agnostic from start**
- **Pros:** Wider adoption
- **Cons:** More complex, slower initial release

**Recommendation:** Start Vitest-only (80% of TypeScript projects). Add Jest/Mocha adapters in Phase 2 based on demand.

---

### 3. Coverage Enforcement: Fail Build or Warn?

**Option A: Fail build if coverage < 100%**
- **Pros:** Forces discipline
- **Cons:** Too strict for adoption phase (teams need time to add tests)

**Option B: Warn on low coverage, configurable threshold**
- **Pros:** Gradual adoption (warn → 50% → 80% → 100%)
- **Cons:** Easy to ignore warnings

**Recommendation:** Configurable threshold with default 80%. Gate fails if below threshold:

```json
{
  "coverage": {
    "tier4_tests": {
      "threshold": 0.8,
      "enforced": true
    }
  }
}
```

---

### 4. Assertion Execution: Sync or Async?

**Option A: Always async**
- **Pros:** Supports file I/O, API calls, future extensibility
- **Cons:** Slightly verbose (`await` everywhere)

**Option B: Sync where possible, async when needed**
- **Pros:** Cleaner API for simple checks
- **Cons:** Mixed API (confusing for users)

**Recommendation:** Always async. Consistency > brevity. TypeScript native `async/await` is idiomatic.

---

### 5. Error Messages: Verbose or Concise?

**Option A: Verbose (show all violations, file paths, line numbers)**
- **Pros:** Easier debugging
- **Cons:** Noisy in CI logs

**Option B: Concise (count only, "3 violations found")**
- **Pros:** Clean CI output
- **Cons:** Hard to debug without details

**Recommendation:** Verbose by default, with `--quiet` flag for CI:

```bash
npm test              # Show all violations
npm test -- --quiet   # Show counts only
```

---

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| TypeScript-only Phase 1 | Faster delivery, focus on core audience | Python/Rust users wait |
| Vitest-first | Modern, fast, TypeScript-native | Jest/Mocha users need adapter |
| Always async assertions | Consistent API, future-proof | Slightly verbose |
| Monorepo structure | Shared code, easier CI | Larger organon-tools footprint |
| Configurable coverage threshold | Gradual adoption, flexible | Teams might set threshold too low |

---

## Success Metrics

- [ ] **Time-to-first-test** < 5 minutes (from `organon init` to first passing test)
- [ ] **Assertion reuse** ≥ 70% of invariants use pre-built assertions (not `assertCustom`)
- [ ] **Coverage adoption** ≥ 50% of projects reach 80% tier-4 coverage within 4 weeks
- [ ] **Developer satisfaction** NPS ≥ 8 ("Would you recommend this library?")
- [ ] **Integration speed** < 30 minutes from install to CI integration

---

## Dependencies

**Blocks:**
- `organon coverage` enhancements (needs test metadata integration)
- `organon verify --gate=tier4-tests` (new gate)

**Blocked by:**
- None (can start immediately)

**Related work:**
- `organon init` (generates test scaffolds)
- `organon discover` (suggests invariants → can auto-generate tests)

---

## Implementation Plan

### Phase 1: Core + Vitest (4-6 weeks)

**Week 1-2: Core Assertions**
- [ ] Project setup (monorepo, tsconfig, vitest)
- [ ] `testInvariant()` wrapper
- [ ] `assertMaxValue()` implementation + tests
- [ ] `assertNoSideEffects()` implementation + tests
- [ ] `assertFileExists()` implementation + tests
- [ ] `assertCustom()` implementation + tests

**Week 3: Discovery + Coverage**
- [ ] `scanEthos()` - parse ETHOS.md invariants
- [ ] `scanTests()` - find testInvariant() calls
- [ ] `calculateCoverage()` - compute coverage %
- [ ] JSON reporter (write `.organon/coverage.json`)
- [ ] Console reporter (human-readable)

**Week 4: CLI Integration**
- [ ] `organon generate-tests` command
- [ ] Heuristics (detect assertion type from invariant text)
- [ ] Template generation (scaffold with TODOs)
- [ ] `organon coverage` integration (read test metadata)

**Week 5-6: Polish + Documentation**
- [ ] Error message quality (clear, actionable)
- [ ] README with examples
- [ ] API documentation
- [ ] Migration guide (from custom tests → @organon/testing)
- [ ] Publish `@organon/testing@0.1.0` (beta)

---

### Phase 2: Jest Adapter + More Assertions (2-3 weeks)

- [ ] Jest adapter implementation
- [ ] `assertBackwardsCompat()` (API stability)
- [ ] `assertNamingConvention()` (style consistency)
- [ ] Performance optimization (parallel file scanning)

---

### Phase 3: Advanced Features (4-6 weeks)

- [ ] Mocha adapter
- [ ] Watch mode integration
- [ ] Incremental testing (only test changed files)
- [ ] LSP integration (inline errors in IDE)

---

## Related Files

| File | Relationship |
|------|--------------|
| [../ETHOS.md](../ETHOS.md) | Testing library must follow organon-tools invariants (schema fidelity, 100% test coverage, idempotent) |
| [../PHILOSOPHY.md](../PHILOSOPHY.md) | Design principles (fail-fast, testability, clarity) guide assertion API |
| [../../book-llms/invariant-tracking.md](../../book-llms/invariant-tracking.md) | Defines tier-4 testing specification (this implements it) |
| [../../book-llms/three-layer-architecture.md](../../book-llms/three-layer-architecture.md) | Testing library is Layer 3 (tools) for tier-4 protocols |

---

## Status

**Current:** Draft

**Last Updated:** 2026-02-10

**Next Action:** Review design with stakeholders → Create RFC → Begin Phase 1 implementation
