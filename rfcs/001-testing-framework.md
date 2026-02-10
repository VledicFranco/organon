---
type: rationale
scope: product
name: testing-framework
version: "1.0"
summary: Introduce @organon/testing semantic testing framework to bridge the gap between invariant declaration and automated verification
token_estimate: 5200
status: draft
created: 2026-02-10
author: organon-tools-developer
related_files:
  - ../organon-tools/ETHOS.md
  - ../organon-tools/PHILOSOPHY.md
  - ../book-llms/invariant-tracking.md
  - ../book-llms/three-layer-architecture.md
load_priority: high
audience: [llm, human]
---

# RFC 001: @organon/testing - Semantic Testing Framework

> Introduce a TypeScript-native testing library that makes tier-4 invariant verification natural, reusable, and integrated with the Organon ecosystem.

---

## Status

**Current State:** Draft

**Next Milestone:** Review and team approval

| Transition | Date | Notes |
|------------|------|-------|
| → Draft | 2026-02-10 | Initial RFC created |

---

## Problem Statement

**The organon-tools product lacks a domain for tier-4 testing.** Currently, organon-tools provides verification gates (frontmatter, triplets, freshness) but has no defined domain for **automated code verification of invariants** (tier-4 testing).

**Why this domain is needed:**

1. **Gap in the enforcement loop** - Organon methodology defines tier-4 testing in `book-llms/invariant-tracking.md`, but organon-tools provides no implementation or constraints for this tier.

2. **External teams blocked** - Projects adopting Organon must implement tier-4 testing from scratch. No reusable patterns, no coverage tracking, no integration with `organon verify`.

3. **Product incompleteness** - organon-tools claims to enforce organons but can only verify organon files themselves, not the code they govern.

**Current state:** organon-tools has no domain organon that defines "what tier-4 testing should be" or "how testing framework should behave."

**Desired state:** A **testing domain** that defines the identity, constraints, and design principles for semantic tier-4 testing, with code that implements these definitions.

---

## Proposed Solution

**Create a new domain organon** at `organon-tools/organon/domains/testing/` that defines:

### 1. Domain Identity (ETHOS.md)
What the testing domain IS and IS NOT, its invariants, principles, and decision heuristics.

### 2. Domain Rationale (PHILOSOPHY.md)
Why the testing domain is designed this way, the problems it solves, the bet we're making, and trade-offs.

### 3. Implementation (code)
TypeScript code in `organon-tools/src/core/testing/` that implements the constraints defined by the domain organon.

**Key principle:** The organon defines "should be" (constraints), the code implements "what is" (reality). Same PR contains both.

---

## Example Usage

### Declare Invariant in ETHOS.md
```yaml
invariants:
  - id: INV-CACHE-1
    name: ttl-max-24h
    text: "Cache TTL must not exceed 24 hours (86400 seconds)"
```

### Generate Test Scaffold
```bash
organon generate-tests
# ✅ Generated tests/organon/invariants.test.ts with TODO scaffolds
```

### Implement Test
```typescript
import { describe } from 'vitest';
import { testInvariant, assertMaxValue } from '@organon/testing';

describe('Product Invariants', () => {
  testInvariant('INV-CACHE-1', 'cache TTL max 24h', async () => {
    await assertMaxValue({
      files: ['src/config/cache.ts'],
      pattern: /ttl:\s*(\d+)/,
      maxValue: 86400,
      unit: 'seconds',
    });
  });
});
```

### Verify Coverage
```bash
npm test
organon coverage
# Invariant Coverage: 100% (1/1)
# ✅ INV-CACHE-1: cache TTL max 24h (tested)

organon verify --gate=tier4-tests
# ✅ All tier-4 tests passed
# ✅ Coverage: 100%
```

---

## Design Decisions

### Decision 1: Monorepo with npm Workspaces
**Choice:** Keep @organon/testing inside organon-tools monorepo but publish as separate npm package.

**Rationale:**
- Shared code (ETHOS parsing, validation) avoids duplication
- Single CI pipeline ensures version compatibility
- Users can install testing library independently: `npm install @organon/testing`
- Lighter than forcing CLI dependency on test library users

**Trade-off:** Slightly larger organon-tools repo, but better developer experience.

---

### Decision 2: Vitest-Only Phase 1
**Choice:** Support only Vitest initially. Add Jest/Mocha adapters in Phase 2 based on demand.

**Rationale:**
- Vitest is modern, fast, TypeScript-native (~80% of TS projects)
- Faster delivery (4-6 weeks vs 8-10 weeks for multi-framework)
- Framework-agnostic core allows adding adapters later without breaking changes
- Early adopters are likely already using Vitest

**Trade-off:** Jest/Mocha users must wait, but we deliver core value faster.

---

### Decision 3: Configurable Coverage Threshold
**Choice:** Default 80% threshold, warns at 90%, configurable per project.

```json
{
  "coverage": {
    "tier4_tests": {
      "threshold": 0.8,
      "enforced": true,
      "warn_below": 0.9
    }
  }
}
```

**Rationale:**
- 100% from day one blocks adoption (teams need ramp-up time)
- Configurable allows gradual path: 50% → 80% → 100%
- Warning at 90% encourages improvement without failing builds
- Teams can override for stricter enforcement when ready

**Trade-off:** Risk of teams setting threshold too low and leaving it there. Mitigated by clear documentation and "90% warn" nudge.

---

### Decision 4: Always Async Assertions
**Choice:** All assertions return `Promise<void>`, always use `await`.

```typescript
await assertMaxValue({ /* ... */ });  // Always async
```

**Rationale:**
- Consistent API (no "when do I use await?" confusion)
- Future-proof (supports file I/O, API calls, database queries)
- TypeScript `async/await` is idiomatic, not verbose
- Fail-fast errors propagate naturally through test runners

**Trade-off:** Slightly more verbose for simple checks, but consistency wins.

---

### Decision 5: Verbose Errors by Default
**Choice:** Show all violation details by default. Add `--quiet` flag for concise output.

```bash
npm test              # Verbose (file paths, line numbers, values)
npm test -- --quiet   # Concise (counts only)
```

**Rationale:**
- Debugging requires exact locations (verbose)
- CI logs benefit from concise output (opt-in)
- Developer experience prioritizes local debugging over CI aesthetics
- Flag makes both audiences happy

**Trade-off:** CI logs may be noisy without `--quiet`, but actionable errors > clean logs.

---

## Architecture

```
@organon/testing/
├── core/
│   ├── invariant-test.ts          # testInvariant() wrapper, metadata tracking
│   ├── assertions/
│   │   ├── max-value.ts           # assertMaxValue() - numeric bounds
│   │   ├── no-side-effects.ts     # assertNoSideEffects() - purity checks
│   │   ├── file-exists.ts         # assertFileExists() - structural requirements
│   │   ├── backwards-compat.ts    # assertBackwardsCompat() - API stability
│   │   ├── naming-convention.ts   # assertNamingConvention() - code style
│   │   └── custom.ts              # assertCustom() - user-defined logic
│   ├── discovery/
│   │   ├── scan-ethos.ts          # Parse ETHOS.md for declared invariants
│   │   ├── scan-tests.ts          # Find testInvariant() calls in test files
│   │   └── coverage.ts            # Calculate coverage % (tested/declared)
│   └── reporters/
│       ├── json-reporter.ts       # Write .organon/coverage.json
│       └── console-reporter.ts    # Human-readable terminal output
├── adapters/
│   ├── vitest.ts                  # Vitest integration (Phase 1)
│   ├── jest.ts                    # Jest integration (Phase 2, future)
│   └── mocha.ts                   # Mocha integration (Phase 3, future)
└── index.ts                       # Public API exports
```

**Core Principles:**
1. **Pure functions** - All assertions are pure, no side effects
2. **Fail-fast** - Violations throw clear errors immediately
3. **Composable** - Assertions can be combined
4. **Framework-agnostic core** - Adapters handle framework specifics

---

## Implementation Plan

### Phase 1: Core + Vitest (Weeks 1-6)

**Weeks 1-2: Core Assertions**
- [ ] Monorepo setup (npm workspaces, tsconfig)
- [ ] `testInvariant()` wrapper with metadata tracking
- [ ] `assertMaxValue()` + tests (100% coverage)
- [ ] `assertNoSideEffects()` + tests (100% coverage)
- [ ] `assertFileExists()` + tests (100% coverage)
- [ ] `assertCustom()` + tests (100% coverage)

**Week 3: Discovery + Coverage**
- [ ] `scanEthos()` - parse ETHOS.md invariants array
- [ ] `scanTests()` - find testInvariant() calls via AST
- [ ] `calculateCoverage()` - compute tested/declared ratio
- [ ] JSON reporter (write `.organon/coverage.json`)
- [ ] Console reporter (terminal output)

**Week 4: CLI Integration**
- [ ] `organon generate-tests` command
- [ ] Heuristics (detect assertion type from invariant text)
- [ ] Template generation (scaffolds with TODOs)
- [ ] Enhanced `organon coverage` (read test metadata)
- [ ] New gate: `organon verify --gate=tier4-tests`

**Weeks 5-6: Polish + Documentation**
- [ ] Error message quality (clear, actionable)
- [ ] README with full workflow example
- [ ] API documentation (TSDoc)
- [ ] Migration guide (custom tests → @organon/testing)
- [ ] Publish `@organon/testing@0.1.0-beta`

### Phase 2: More Assertions + Jest (Weeks 7-9)
- [ ] Jest adapter
- [ ] `assertBackwardsCompat()` (API stability)
- [ ] `assertNamingConvention()` (code style)
- [ ] Performance optimization (parallel file scanning)

### Phase 3: Advanced Features (Weeks 10-15)
- [ ] Mocha adapter
- [ ] Watch mode integration
- [ ] Incremental testing (only changed files)
- [ ] LSP integration (inline errors in IDE)

---

## Organon Impact

> This RFC creates a new domain organon that **defines** what the testing framework should be. Code implements these definitions.

### Create

**`organon-tools/organon/README.md`**
- Navigation for organon-tools domain hierarchy

**`organon-tools/organon/domains/testing/README.md`**
- Navigation for testing domain

**`organon-tools/organon/domains/testing/ETHOS.md`** ← **Core: Domain definition**

This file defines the testing domain's identity and constraints:

```markdown
## Identity

### What This Domain IS
- A semantic testing framework for tier-4 invariant verification
- TypeScript-native library published as @organon/testing
- Bridge between "declare invariant" and "verify invariant in code"
- Integration layer connecting ETHOS.md invariants to test frameworks
- Coverage tracker that maps invariant IDs to test implementations

### What This Domain IS NOT
- Not a test runner replacement (integrates with Vitest/Jest/Mocha)
- Not a general-purpose assertion library (focused on organon invariants)
- Not organon file validation (that's organon-tools core)
- Not a mocking or fixture framework

## Invariants

1. **INV-TEST-1: assertions-are-pure**
   - All assertion functions are pure (no side effects, no I/O, deterministic)
   - Enforced by: tier-4 tests scanning for forbidden imports

2. **INV-TEST-2: fail-fast**
   - Assertions throw clear errors immediately on violation (no warnings, no retries)
   - Enforced by: assertion implementation review + tests

3. **INV-TEST-3: invariant-id-required**
   - Every test must link to an invariant ID via testInvariant() wrapper
   - Enforced by: coverage calculator (orphan test detection)

4. **INV-TEST-4: framework-agnostic-core**
   - Core assertion logic has zero test-framework dependencies
   - Enforced by: dependency checks in CI

5. **INV-TEST-5: 100-percent-coverage**
   - Testing domain itself has 100% test coverage (dogfooding)
   - Enforced by: Vitest coverage gate

6. **INV-TEST-6: always-async**
   - All assertions return Promise<void> (consistency over brevity)
   - Enforced by: TypeScript type checks

7. **INV-TEST-7: composable**
   - Assertions can be combined without conflicts (no global state)
   - Enforced by: integration tests combining assertions

## Principles (Prioritized)

1. **Fail-fast over forgiving** - Violations throw immediately, no warnings
2. **Clarity over brevity** - Verbose errors by default, explicit API
3. **Reusability over flexibility** - Pre-built assertions for 80% cases
4. **Testability over performance** - Pure functions, deterministic, parallelizable
5. **Integration over replacement** - Works with existing test frameworks

## Decision Heuristics

| Situation | Action |
|-----------|--------|
| Adding new assertion | Must be pure, async, and solve common pattern (≥5 projects) |
| Assertion throws error | Include file path, line number, expected vs actual |
| Test framework not supported | Check demand (≥10 requests), then build adapter |
| Coverage < 100% | Warn at 90%, fail build at configured threshold (default 80%) |
| Performance issue | Parallelize file scanning, add caching, document patterns |
```

**`organon-tools/organon/domains/testing/PHILOSOPHY.md`** ← **Core: Design rationale**

This file explains WHY the testing domain is designed this way:

```markdown
## The Problem

Projects declare invariants in ETHOS.md but never automate enforcement. Why?

1. **High activation energy** - Writing tier-4 tests requires understanding AST parsing, globs, file I/O
2. **No reusable patterns** - Every team reinvents "max value check" and "purity check"
3. **Coverage blind spots** - No way to know which invariants lack tests
4. **Traceability gap** - Tests don't link back to invariant IDs

**Result:** Organons become aspirational fiction, not verified constraints.

## The Bet

**Bet:** If we provide semantic assertions that match common invariant patterns, teams will actually write tier-4 tests.

**Why this works:**
- Reduces cognitive load (no AST knowledge required)
- Declarative API mirrors ETHOS.md structure
- Coverage tracking makes gaps visible
- Test generation provides scaffolds

**What must be true:**
- Assertions cover ≥70% of real-world invariants (not just toy examples)
- API is discoverable (clear names, good TypeScript IntelliSense)
- Integration is < 30 minutes (no complex setup)

## Trade-offs

### 1. Always Async (Consistency > Brevity)
**Choice:** All assertions return Promise<void>

**Benefit:** Consistent API (no "when do I use await?" confusion), future-proof

**Cost:** Slightly verbose for simple checks

**Why we chose consistency:** Mixed sync/async creates cognitive overhead. TypeScript async/await is idiomatic. Consistency compounds over time.

### 2. Vitest-First (Speed > Completeness)
**Choice:** Support only Vitest in Phase 1

**Benefit:** Ship faster (4-6 weeks vs 8-10), focus on core value

**Cost:** Jest/Mocha users wait

**Why we chose speed:** Framework-agnostic core makes adapters easy to add. Early adopters likely use Vitest (modern TS projects). Better to deliver value fast than wait for completeness.

### 3. Configurable Coverage Threshold (Adoption > Perfection)
**Choice:** Default 80%, warn 90%, fail build on violation

**Benefit:** Teams can ramp up gradually (50% → 80% → 100%)

**Cost:** Risk of "good enough at 80%" complacency

**Why we chose adoption:** 100% from day one blocks legacy projects. Gradual path allows incremental improvement. Warning at 90% nudges toward excellence.

### 4. Options Object API (Clarity > Conciseness)
**Choice:** `assertMaxValue({ files, pattern, maxValue })` not `assertMaxValue('*.ts', /x/, 100)`

**Benefit:** Self-documenting, extensible (optional params), clear at call-site

**Cost:** More verbose

**Why we chose clarity:** Assertions are read more than written. Named parameters prevent arg-order bugs. Future optional params don't break existing calls.

### 5. Verbose Errors Default (Debugging > Aesthetics)
**Choice:** Show all violations by default, `--quiet` flag available

**Benefit:** Actionable feedback (exact file, line, value)

**Cost:** Noisy CI logs

**Why we chose debugging:** Developer experience > CI aesthetics. Local debugging requires specifics. CI can opt-in to concise output.

## Alternatives Considered

### Alt 1: Generic assertion library (not invariant-specific)
**Rejected because:** Doesn't solve organon-specific problems (coverage tracking, invariant ID linking, ETHOS.md integration)

### Alt 2: Test runner replacement (full framework)
**Rejected because:** Too much scope, forces migration, loses existing test infrastructure investment

### Alt 3: LLM-generates-all-tests (no library)
**Rejected because:** Non-deterministic, no coverage guarantee, no reusable patterns, debugging harder

## Success Criteria

This bet succeeds if:
- [ ] ≥50% of pilot projects reach 80% tier-4 coverage within 4 weeks
- [ ] ≥70% of invariants use pre-built assertions (not assertCustom)
- [ ] Time-to-first-test < 5 minutes
- [ ] Developer NPS ≥ 8 ("would you recommend this?")
```

**Implementation code** (consequence of domain definition):
- `organon-tools/src/core/testing/` - Implements domain constraints
- `organon-tools/src/cli/commands/generate-tests.ts` - CLI integration
- `organon-tools/packages/testing/` - Published npm package

### Update

**`organon-tools/ETHOS.md`** (product-level organon)
- Add reference: testing domain inherits product invariants
- Add decision heuristic: "Testing domain work? Read organon/domains/testing/ETHOS.md"

**`organon-tools/README.md`**
- Add link to testing domain in "Domains" section

**`book-llms/invariant-tracking.md`**
- Add @organon/testing as reference implementation for tier-4 testing

**`book-llms/three-layer-architecture.md`**
- Add @organon/testing as example of Layer 3 (Tools)

### Delete

None

---

## Implementation Follows Organon

Once the domain organon is created, implementation builds what the organon defines:

**Phase 1** implements invariants INV-TEST-1 through INV-TEST-7:
- Pure assertion functions (INV-TEST-1, INV-TEST-4)
- Fail-fast error handling (INV-TEST-2)
- testInvariant() wrapper (INV-TEST-3)
- Async API (INV-TEST-6)
- 100% test coverage (INV-TEST-5)
- Composable design (INV-TEST-7)

**Same PR:** Domain organon files + initial implementation + tier-4 tests for the testing domain itself

---

## Technical Implementation

> This section describes how code will implement the domain constraints defined above.

### Architecture

**Package Structure:**
```
organon-tools/
├── packages/
│   └── testing/                    ← Published as @organon/testing
│       ├── src/
│       │   ├── core/
│       │   │   ├── invariant-test.ts          # testInvariant() wrapper, metadata
│       │   │   ├── assertions/
│       │   │   │   ├── max-value.ts           # assertMaxValue()
│       │   │   │   ├── no-side-effects.ts     # assertNoSideEffects()
│       │   │   │   ├── file-exists.ts         # assertFileExists()
│       │   │   │   ├── backwards-compat.ts    # assertBackwardsCompat()
│       │   │   │   ├── naming-convention.ts   # assertNamingConvention()
│       │   │   │   └── custom.ts              # assertCustom()
│       │   │   ├── discovery/
│       │   │   │   ├── scan-ethos.ts          # Parse ETHOS.md
│       │   │   │   ├── scan-tests.ts          # Find testInvariant() calls
│       │   │   │   └── coverage.ts            # Calculate coverage %
│       │   │   └── reporters/
│       │   │       ├── json-reporter.ts       # Write coverage.json
│       │   │       └── console-reporter.ts    # Human-readable output
│       │   ├── adapters/
│       │   │   ├── vitest.ts                  # Vitest integration (Phase 1)
│       │   │   ├── jest.ts                    # Jest (Phase 2)
│       │   │   └── mocha.ts                   # Mocha (Phase 3)
│       │   └── index.ts                       # Public API exports
│       ├── tests/                             # Dogfooding (100% coverage)
│       └── package.json
└── src/
    └── cli/
        └── commands/
            └── generate-tests.ts               # CLI integration
```

**Core Abstractions:**

1. **Assertion** - Pure function that verifies a constraint
   ```typescript
   type Assertion<T = unknown> = (options: T) => Promise<void>;
   ```

2. **InvariantTest** - Links test to invariant ID
   ```typescript
   interface InvariantTest {
     invariantId: string;
     description: string;
     testFn: () => Promise<void>;
   }
   ```

3. **CoverageReport** - Tracks tested vs declared invariants
   ```typescript
   interface CoverageReport {
     declaredCount: number;
     testedCount: number;
     coverage: number;
     untested: string[];
   }
   ```

**Implements domain invariants:**
- Pure functions (INV-TEST-1): No imports of fs, http, process
- Fail-fast (INV-TEST-2): Throw on first violation
- Framework-agnostic core (INV-TEST-4): Zero test-framework deps in core/
- Always async (INV-TEST-6): All assertions return Promise<void>
- Composable (INV-TEST-7): No global state, no side effects

---

### API Design

**Core API (implements domain principles):**

```typescript
// 1. Semantic test declaration (INV-TEST-3: invariant-id-required)
import { testInvariant } from '@organon/testing';

testInvariant('INV-CACHE-1', 'cache TTL max 24h', async () => {
  await assertMaxValue({
    files: ['src/config/*.ts'],
    pattern: /ttl:\s*(\d+)/,
    maxValue: 86400,
    unit: 'seconds',
  });
});

// 2. Pre-built assertions (Principle 3: Reusability)
assertMaxValue(options: MaxValueOptions): Promise<void>
assertNoSideEffects(options: NoSideEffectsOptions): Promise<void>
assertFileExists(options: FileExistsOptions): Promise<void>
assertBackwardsCompat(options: BackwardsCompatOptions): Promise<void>
assertNamingConvention(options: NamingConventionOptions): Promise<void>
assertCustom(testFn: () => Promise<boolean>): Promise<void>

// 3. Discovery & Coverage
scanEthos(ethosPath: string): Promise<Invariant[]>
scanTests(testGlob: string): Promise<InvariantTest[]>
calculateCoverage(declared: Invariant[], tested: InvariantTest[]): CoverageReport

// 4. Reporters
writeJsonReport(report: CoverageReport, outPath: string): Promise<void>
printConsoleReport(report: CoverageReport): void
```

**Options object pattern (Principle 2: Clarity over brevity):**
```typescript
interface MaxValueOptions {
  files: string[];          // Glob patterns
  pattern: RegExp;          // Regex to extract value
  maxValue: number;         // Upper bound
  unit?: string;            // Optional (for error messages)
}
```

---

### Implementation Plan

**Phase 1: Core + Vitest (Weeks 1-6)**

**Week 1-2: Foundation + Core Assertions**
- [ ] Monorepo setup (npm workspaces, tsconfig, vitest config)
- [ ] Create `packages/testing/` structure
- [ ] Implement `testInvariant()` wrapper with metadata tracking
- [ ] Implement `assertMaxValue()` (INV-TEST-1, INV-TEST-6)
  - Pure function, always async
  - 100% test coverage (INV-TEST-5)
- [ ] Implement `assertNoSideEffects()`
  - Scans for forbidden imports/globals
  - 100% test coverage
- [ ] Implement `assertFileExists()`
  - Structural checks (required files exist)
  - 100% test coverage
- [ ] Implement `assertCustom()`
  - User-defined logic wrapper
  - 100% test coverage

**Week 3: Discovery + Coverage**
- [ ] Implement `scanEthos()` - parse ETHOS.md invariants array
  - Support YAML frontmatter parsing
  - Extract invariant IDs, names, text
- [ ] Implement `scanTests()` - find testInvariant() calls
  - AST parsing to find all testInvariant() calls
  - Extract invariant IDs from test files
- [ ] Implement `calculateCoverage()`
  - Match declared vs tested invariants
  - Identify untested invariants
- [ ] JSON reporter (write `.organon/coverage.json`)
  - Machine-parsable format
- [ ] Console reporter (human-readable terminal output)
  - Color-coded (green = tested, red = untested)

**Week 4: CLI Integration**
- [ ] Implement `organon generate-tests` command
  - Reads ETHOS.md
  - Generates test scaffolds with TODOs
  - Heuristics: detect assertion type from invariant text
    - "max" / "limit" → assertMaxValue template
    - "pure" / "no side effects" → assertNoSideEffects template
    - Generic → assertCustom placeholder
- [ ] Enhance `organon coverage` command
  - Read `.organon/coverage.json`
  - Display tested/untested invariants
  - Fail if coverage < threshold
- [ ] Add verification gate: `organon verify --gate=tier4-tests`
  - Runs tier-4 tests
  - Checks coverage threshold
  - Reports violations

**Week 5-6: Polish + Documentation**
- [ ] Error message quality (Principle 2: Clarity)
  - File paths, line numbers, expected vs actual
  - Actionable suggestions ("Did you mean X?")
- [ ] README.md with complete workflow example
- [ ] API documentation (TSDoc on all public functions)
- [ ] Migration guide (custom tests → @organon/testing)
- [ ] Testing domain dogfooding
  - Write tier-4 tests for testing domain itself (INV-TEST-5)
  - Verify 100% coverage
- [ ] Publish `@organon/testing@0.1.0-beta`

**Deliverable:** Working testing framework (Vitest-only) with coverage tracking and CLI integration

---

**Phase 2: More Assertions + Jest (Weeks 7-9)**
- [ ] Jest adapter implementation
  - Reuse core assertion logic (INV-TEST-4)
  - Jest-specific wrapper for testInvariant()
- [ ] Implement `assertBackwardsCompat()`
  - Compare exports between versions
  - Detect breaking changes
- [ ] Implement `assertNamingConvention()`
  - Verify kebab-case, PascalCase, etc.
  - Configurable patterns
- [ ] Performance optimization
  - Parallel file scanning (worker threads)
  - Cache AST parsing results
  - Incremental mode (only changed files)

**Deliverable:** Jest support + 2 new assertions + performance improvements

---

**Phase 3: Advanced Features (Weeks 10-15)**
- [ ] Mocha adapter
- [ ] Watch mode integration (re-run tests on file change)
- [ ] Incremental testing (only test changed files)
- [ ] LSP integration (inline errors in IDE)
- [ ] Publish `@organon/testing@1.0.0` (stable)

**Deliverable:** Full multi-framework support + advanced features

---

### Design Decisions (Technical)

These decisions implement the domain principles defined in testing/PHILOSOPHY.md:

**Decision 1: Monorepo with npm Workspaces**
- **Implements:** Principle 5 (Integration over replacement)
- **Technical benefit:** Shared tsconfig, shared CI, coordinated releases
- **User benefit:** Can install `@organon/testing` independently or use with full `organon-tools`

**Decision 2: Vitest-First (Phase 1)**
- **Implements:** Principle 2 (Clarity over brevity - focus > completeness)
- **Technical benefit:** Simpler initial implementation, faster delivery
- **Trade-off:** Jest/Mocha users wait, but framework-agnostic core (INV-TEST-4) makes adapters easy

**Decision 3: Always Async (INV-TEST-6)**
- **Implements:** Principle 2 (Clarity over brevity)
- **Technical benefit:** Consistent API, supports file I/O, future-proof
- **Trade-off:** Slightly verbose (`await` always required), but no confusion

**Decision 4: Options Object API**
- **Implements:** Principle 2 (Clarity over brevity)
- **Technical benefit:** Self-documenting, extensible, TypeScript autocomplete
- **Example:** `assertMaxValue({ files, pattern, maxValue })` not `assertMaxValue('*.ts', /x/, 100)`

**Decision 5: Pure Functions (INV-TEST-1)**
- **Implements:** Principle 4 (Testability over performance)
- **Technical benefit:** Deterministic, parallelizable, easier to test
- **Enforcement:** CI checks for forbidden imports (fs, http, process)

**Decision 6: Fail-Fast (INV-TEST-2)**
- **Implements:** Principle 1 (Fail-fast over forgiving)
- **Technical benefit:** Clear errors, no ambiguity, fast feedback
- **Implementation:** Assertions throw on first violation (no collect-all-errors mode)

---

## Success Metrics

- [ ] **Time-to-first-test** < 5 minutes (from `organon init` to passing test)
- [ ] **Assertion reuse** ≥ 70% of invariants use pre-built assertions (not `assertCustom`)
- [ ] **Coverage adoption** ≥ 50% of pilot projects reach 80% tier-4 coverage within 4 weeks
- [ ] **Developer satisfaction** NPS ≥ 8 ("Would you recommend this library?")
- [ ] **Integration speed** < 30 minutes from install to CI integration

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Vitest-only excludes Jest users | Medium | Fast Phase 2 delivery (2-3 weeks), clear roadmap communication |
| Teams set coverage threshold too low | High | Default 80%, warn at 90%, documentation emphasizes gradual path to 100% |
| Assertion patterns don't cover real-world invariants | High | Start with 5 common patterns, make `assertCustom` first-class, gather feedback |
| Performance issues on large codebases | Medium | Parallel file scanning, caching, incremental mode (Phase 3) |
| Complexity in multi-repo monorepos | Low | Document patterns, provide examples, support globs across workspaces |

---

## Open Questions

### Resolved (Pre-RFC)
1. ✅ **Monorepo vs separate?** → Monorepo with workspaces
2. ✅ **Vitest-only or multi-framework?** → Vitest Phase 1, others later
3. ✅ **Coverage threshold?** → Configurable, default 80%
4. ✅ **Async or sync assertions?** → Always async
5. ✅ **Error verbosity?** → Verbose default, `--quiet` flag

### Still Open
1. **Naming:** Is `@organon/testing` the right package name, or `@organon/test`?
   - Leaning: `@organon/testing` (matches convention: `@testing-library/*`)

2. **Assertion API:** Should assertions take options object or positional arguments?
   - Current: `assertMaxValue({ files, pattern, maxValue })` (options object)
   - Alternative: `assertMaxValue('src/**/*.ts', /pattern/, 100)` (positional)
   - **Recommendation:** Options object (clearer, extensible, optional params)

3. **Test metadata storage:** `.organon/coverage.json` or `.organon/test-metadata.json`?
   - **Recommendation:** `.organon/coverage.json` (already referenced in docs)

---

## Dependencies

**Blocks:**
- Enhanced `organon coverage` command (needs test metadata)
- New verification gate: `organon verify --gate=tier4-tests`
- Methodology protocol: "How to write tier-4 tests"

**Blocked by:**
- None (can start immediately)

**Related work:**
- `organon init` (future: generate test scaffolds during project setup)
- `organon discover` (future: suggest invariants → auto-generate tests)

---

## Related Files

| File | Relationship |
|------|--------------|
| [organon-tools/ETHOS.md](../organon-tools/ETHOS.md) | Testing library must follow organon-tools invariants (schema fidelity, 100% coverage, idempotent operations) |
| [organon-tools/PHILOSOPHY.md](../organon-tools/PHILOSOPHY.md) | Design principles (fail-fast, testability, clarity) guide assertion API design |
| [book-llms/invariant-tracking.md](../book-llms/invariant-tracking.md) | Defines tier-4 testing specification (this RFC implements it) |
| [book-llms/three-layer-architecture.md](../book-llms/three-layer-architecture.md) | Testing library is Layer 3 (Tools) that executes tier-4 verification |
| [organon-tools/dev/testing-framework-design.md](../organon-tools/dev/testing-framework-design.md) | Detailed design document (basis for this RFC) |

---

## Approval Process

**Review criteria:**
- [ ] Organon impact is clear and complete
- [ ] Design decisions are justified with trade-offs
- [ ] Implementation plan is realistic and phased
- [ ] Success metrics are measurable
- [ ] Risks have mitigations

**Reviewers:**
- [ ] @organon-methodology (methodology alignment)
- [ ] @organon-tools-maintainers (implementation feasibility)
- [ ] @early-adopters (user perspective)

**Timeline:**
- Draft complete: 2026-02-10
- Review period: 1 week
- Target acceptance: 2026-02-17
- Implementation start: 2026-02-17
- Phase 1 delivery: 2026-03-31

---

## Next Steps

1. **Request review** - Share RFC with stakeholders for feedback
2. **Iterate on open questions** - Finalize naming, API style, metadata location
3. **Acceptance vote** - Team approval required to proceed
4. **Begin implementation** - Phase 1 Week 1 (monorepo setup + core assertions)
5. **Update organon files** - Same PR as Phase 1 completion (organon-tools/ETHOS.md, methodology/testing/PROTOCOL.md)

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-02-10 | Initial draft | organon-tools-developer |
