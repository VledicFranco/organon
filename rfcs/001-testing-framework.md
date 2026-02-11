---
type: rationale
scope: product
name: testing-framework
version: "1.0"
summary: Introduce @organon/testing semantic testing framework to bridge the gap between invariant declaration and automated verification
token_estimate: 11100
status: draft
created: 2026-02-10
author: organon-tools-developer
related_files:
  - ../organon/domains/tools/ETHOS.md
  - ../organon/domains/tools/PHILOSOPHY.md
  - ../book-llms/invariant-tracking.md
  - ../book-llms/three-layer-architecture.md
  - ./002-compound-engineering-integration.md
  - ./003-explore-before-ethos.md
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

**Three interconnected gaps block tier-4 testing adoption:**

### 1. Product Incompleteness (organon-tools)
organon-tools provides verification gates for organon files (frontmatter, triplets, freshness) but has **no domain for tier-4 testing** — the highest tier of invariant enforcement where code is automatically verified against invariants through executable tests.

### 2. Methodology Gap (enforcement loop incomplete)
The Organon methodology defines tier-4 testing in `book-llms/invariant-tracking.md`, but provides **no implementation, no constraints, no patterns** for how testing frameworks should behave. The enforcement loop (Define → Bind → Execute → Verify → Compound → Evolve) breaks at "Verify" when invariants can't be automatically tested.

### 3. External Adoption Blocked (teams lack reusable patterns)
Projects adopting Organon must implement tier-4 testing from scratch. No semantic assertions, no coverage tracking, no integration with `organon verify`. Teams declare invariants but never automate enforcement — organons become aspirational fiction.

---

**This RFC: First Language-Specific Solution**

This RFC addresses all three gaps **for TypeScript projects** by creating:
1. A testing domain within organon-tools (closes product gap)
2. Reference implementation of tier-4 testing patterns (closes methodology gap)
3. Reusable @organon/testing library (closes adoption gap)

**Language scope:** TypeScript-first by necessity (organon-tools is TypeScript, fastest path to validating approach). Future RFCs will address other languages:
- Scala 3 (planned)
- Python (planned)
- Rust (planned)

**Design principle:** Language-specific implementations, language-agnostic methodology. The testing domain ETHOS.md defines universal constraints (assertions must be pure, coverage must be tracked). TypeScript implementation follows those constraints.

---

**Current state:** organon-tools has no testing domain organon. No language has tier-4 testing support.

**Desired state:** A testing domain that defines universal tier-4 testing constraints, with TypeScript as first implementation proving the pattern.

---

## Proposed Solution

**Create a new domain organon** at `organon/domains/testing/` that defines:

### 1. Domain Identity (ETHOS.md)
What the testing domain IS and IS NOT, its invariants, principles, and decision heuristics.

### 2. Domain Rationale (PHILOSOPHY.md)
Why the testing domain is designed this way, the problems it solves, the bet we're making, and trade-offs.

### 3. Implementation (code)
TypeScript code in `packages/testing/src/core/` that implements the constraints defined by the domain organon.

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

## Organon Impact

> This RFC creates a new domain organon that **defines** what the testing framework should be. Code implements these definitions.

### Create

**`packages/tools/organon/README.md`**
- Navigation for packages/tools domain hierarchy

**`organon/domains/testing/README.md`**
- Navigation for testing domain

**`organon/domains/testing/ETHOS.md`** ← **Core: Domain definition**

This is the complete content that will be created:

```markdown
---
type: constraints
scope: domain
name: testing
version: "1.0"
summary: Tier-4 invariant verification framework — semantic testing library for TypeScript projects
token_estimate: 1500
invariants_count: 7
principles_count: 5
heuristics_count: 10
invariants:
  - id: INV-TEST-1
    name: assertion-logic-pure
  - id: INV-TEST-2
    name: fail-fast
  - id: INV-TEST-3
    name: invariant-id-required
  - id: INV-TEST-4
    name: framework-agnostic-core
  - id: INV-TEST-5
    name: 100-percent-line-coverage
  - id: INV-TEST-6
    name: always-async
  - id: INV-TEST-7
    name: composable
inherits_from: [organon-tools]
load_priority: high
required_for:
  - tier4_testing
  - invariant_verification
audience: [llm, human, tooling]
---

# Testing Domain Ethos

> Semantic testing framework for automated tier-4 invariant verification.

---

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

1. **INV-TEST-1: assertion-logic-pure**
   - Core assertion validation logic is pure (no side effects, deterministic). File reading and I/O are handled by a separate resolver layer (`core/resolvers/`) that feeds data into pure validators. Assertion functions in `core/assertions/` import no I/O modules.
   - Enforced by: dependency analysis (core/assertions/ imports no fs, http, or process modules), tier-4 tests

2. **INV-TEST-2: fail-fast**
   - Assertions throw clear errors immediately on violation (no warnings, no retries)
   - Enforced by: assertion implementation review + tests

3. **INV-TEST-3: invariant-id-required**
   - Every test must link to an invariant ID via testInvariant() wrapper
   - Enforced by: coverage calculator (orphan test detection)

4. **INV-TEST-4: framework-agnostic-core**
   - Core assertion logic has zero test-framework dependencies
   - Enforced by: dependency checks in CI

5. **INV-TEST-5: 100-percent-line-coverage**
   - Testing domain itself has 100% line coverage (dogfooding, c8 provider)
   - Enforced by: Vitest coverage gate (`--coverage.lines 100`)

6. **INV-TEST-6: always-async**
   - All public assertion functions have return type `Promise<void>` (consistency over brevity)
   - Enforced by: TypeScript type checks (return type enforcement)

7. **INV-TEST-7: composable**
   - Assertion functions read no module-level mutable variables and write no shared state. Each assertion call is independent of previous calls — output is identical regardless of execution order.
   - Enforced by: static analysis for module-level `let`/`var` in core/assertions/, integration tests verifying assertion output is identical regardless of execution order

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
| Invariant can't be tested with existing assertions | Use assertCustom() and document the pattern. If pattern recurs (≥3 uses), propose new assertion via issue |
| Two assertions conflict when composed | File bug — composability violation (INV-TEST-7). Assertions must not have hidden coupling |
| Tier-4 test has false positive/negative | Fix test immediately. Add regression test for the fix. Document the scenario in test comments |
| Codebase too large (>10K files) | Use incremental testing (only changed files). Add `organon:test-changed` command in Phase 3 |
| Invariant is untestable (design constraint) | Mark with `judgment_call: true` in ETHOS.md. Do NOT create tier-4 test. Document in PHILOSOPHY.md why it's untestable |

## Out of Scope

Do not do the following in this domain:

- Build a test runner (integrate with Vitest/Jest/Mocha instead)
- Validate organon file structure (that's organon-tools core: `organon validate`)
- Provide mocking, fixture, or snapshot utilities
- Support non-TypeScript languages (future RFCs will address other languages)
- Auto-generate invariants from code (discovery is a separate concern)

## Verification Checklist

- [ ] Frontmatter present with all required fields
- [ ] Frontmatter counts match actual content (7 invariants, 5 principles, 10 decision heuristic rows)
- [ ] Identity boundaries are specific and testable
- [ ] Principles are numbered by priority
- [ ] No conflicts with parent scope constraints (organon/domains/tools/ETHOS.md)
- [ ] All 6 inherited organon-tools invariants are compatible (verified: schema fidelity, every command has tests, gates fail not warn, machine-parsable output via json-reporter, idempotent operations, no breaking changes without version bump)
```

**`organon/domains/testing/PHILOSOPHY.md`** ← **Core: Design rationale**

This is the complete content that will be created:

```markdown
---
type: rationale
scope: domain
name: testing-philosophy
version: "1.0"
summary: Why semantic tier-4 testing exists — design decisions, trade-offs, and the bet we're making
token_estimate: 2400
decision_count: 5
inherits_from: [organon-tools-philosophy]
load_priority: medium
required_for:
  - tier4_testing_evolution
  - testing_domain_maintenance
audience: [llm, human]
---

# Testing Domain Philosophy

> Why we built @organon/testing this way.

---

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
- `packages/testing/src/core/` - Implements domain constraints
- `packages/tools/src/cli/commands/generate-tests.ts` - CLI integration
- `packages/testing/` - Published npm package

### Update

**`organon/domains/tools/ETHOS.md`** (product-level organon)
- Add reference: testing domain inherits product invariants
- Add decision heuristic: "Testing domain work? Read organon/domains/testing/ETHOS.md"

**`packages/tools/README.md`**
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
packages/
├── testing/                        ← Published as @organon/testing
│   ├── src/
│   │   ├── core/
│   │   │   ├── invariant-test.ts          # testInvariant() wrapper, metadata
│   │   │   ├── assertions/                # Pure validation logic (no I/O imports)
│   │   │   │   ├── max-value.ts           # assertMaxValue()
│   │   │   │   ├── no-side-effects.ts     # assertNoSideEffects()
│   │   │   │   ├── file-exists.ts         # assertFileExists()
│   │   │   │   ├── backwards-compat.ts    # assertBackwardsCompat()
│   │   │   │   ├── naming-convention.ts   # assertNamingConvention()
│   │   │   │   └── custom.ts              # assertCustom()
│   │   │   ├── resolvers/                 # I/O layer (file reading, glob expansion)
│   │   │   │   ├── file-resolver.ts       # Read files, expand globs → feed to assertions
│   │   │   │   └── types.ts               # FileSystem interface (mockable)
│   │   │   ├── discovery/
│   │   │   │   ├── scan-ethos.ts          # Parse ETHOS.md
│   │   │   │   ├── scan-tests.ts          # Find testInvariant() calls
│   │   │   │   └── coverage.ts            # Calculate coverage %
│   │   │   └── reporters/
│   │   │       ├── json-reporter.ts       # Write coverage.json
│   │   │       └── console-reporter.ts    # Human-readable output
│   │   ├── adapters/
│   │   │   ├── vitest.ts                  # Vitest integration (Phase 1)
│   │   │   ├── jest.ts                    # Jest (Phase 2)
│   │   │   └── mocha.ts                   # Mocha (Phase 3)
│   │   └── index.ts                       # Public API exports
│   ├── tests/                             # Dogfooding (100% coverage)
│   └── package.json
└── tools/
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
- Pure assertion logic (INV-TEST-1): `core/assertions/` imports no I/O modules; `core/resolvers/` handles file reading and feeds data into pure validators
- Fail-fast (INV-TEST-2): Throw on violation (collects all before throwing for diagnostics)
- Invariant ID required (INV-TEST-3): `testInvariant()` wrapper enforces ID linkage
- Framework-agnostic core (INV-TEST-4): Zero test-framework deps in core/
- 100% line coverage (INV-TEST-5): Dogfooded via Vitest coverage gate
- Always async (INV-TEST-6): All assertions return Promise<void>
- Composable (INV-TEST-7): No module-level mutable state, execution-order independent

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

### Milestone Checkpoints

**Week 2 Checkpoint: Core Assertions Functional**
- **Validation:** Demo `assertMaxValue`, `assertNoSideEffects`, `assertFileExists`, `assertCustom` on 5 real invariants from organon-tools
- **Success criteria:**
  - All 5 invariants testable with pre-built assertions
  - Tests pass on first run
  - 100% code coverage of assertion implementations
  - No false positives or false negatives
- **Go/No-Go Decision:** If >3 invariants can't be expressed with current assertions, revisit API design before Week 3
- **Output:** Demo recording + coverage report

**Week 4 Checkpoint: CLI Integration Works End-to-End**
- **Validation:** Run complete workflow on organon-tools:
  1. `organon generate-tests` (scaffolds created)
  2. Implement tests using scaffolds
  3. `organon coverage` (accurate report)
  4. `organon verify --gate=tier4-tests` (passes)
- **Success criteria:**
  - All commands work without errors
  - Coverage report matches manual count
  - Workflow takes <15 steps total (including manual test writing)
  - No manual file editing needed beyond test implementation
- **Go/No-Go Decision:** If workflow requires >20 manual steps, simplify before continuing. If this adds >1 week, defer Phase 2 features.
- **Output:** Workflow documentation + screen recording

**Week 6 Checkpoint: Phase 1 Complete, Ready for Beta**
- **Validation:** Full dogfooding on organon-tools
  - Write ≥10 tier-4 tests for organon-tools invariants
  - Achieve ≥80% tier-4 coverage
  - Run in CI successfully
- **Success criteria:**
  - Documentation complete (README, API docs, migration guide)
  - Zero critical bugs in backlog
  - All Phase 1 checklist items completed
  - Package ready for npm publish
- **Go/No-Go Decision:** If <70% coverage achieved, extend Phase 1 by 1 week before starting Phase 2
- **Output:** Beta release `@organon/testing@0.1.0-beta`

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

**Decision 5: Pure Assertion Logic with I/O Separation (INV-TEST-1)**
- **Implements:** Principle 4 (Testability over performance)
- **Technical benefit:** Deterministic, parallelizable, easier to test. `core/assertions/` contains pure validation; `core/resolvers/` handles file I/O via mockable `FileSystem` interface.
- **Enforcement:** Dependency analysis (assertions/ imports no fs, http, process modules)

**Decision 6: Fail-Fast (INV-TEST-2)**
- **Implements:** Principle 1 (Fail-fast over forgiving)
- **Technical benefit:** Clear errors, no ambiguity, fast feedback
- **Implementation:** Assertions collect all violations and throw once with complete diagnostics (better UX than stopping at the first violation)

**Decision 7: Configurable Coverage Threshold**
- **Implements:** Principle 5 (Integration over replacement) — gradual adoption path
- **Technical benefit:** Default 80%, warn at 90%, configurable per project via `organon.config.json`
- **Trade-off:** Risk of "good enough at 80%" complacency. Mitigated by 90% warning nudge and documentation emphasizing path to 100%.

**Decision 8: Verbose Errors by Default**
- **Implements:** Principle 2 (Clarity over brevity)
- **Technical benefit:** File paths, line numbers, expected vs actual values shown by default. `--quiet` flag for CI.
- **Trade-off:** CI logs may be noisy without `--quiet`, but actionable errors > clean logs.

---

## Success Metrics

- [ ] **Time-to-first-test** < 5 minutes (from `organon init` to passing test)
- [ ] **Assertion reuse** ≥ 70% of invariants use pre-built assertions (not `assertCustom`)
- [ ] **Coverage adoption** ≥ 50% of pilot projects reach 80% tier-4 coverage within 4 weeks
- [ ] **Developer satisfaction** NPS ≥ 8 ("Would you recommend this library?")
- [ ] **Integration speed** < 30 minutes from install to CI integration

### Measurement Methodology

**Time-to-first-test:**
- **Method:** Instrumented `organon generate-tests` command logs timestamps (start → test file created → test passing)
- **Sample:** First 20 users of @organon/testing beta
- **Target:** 90th percentile < 5 minutes
- **Data collection:** Optional telemetry (opt-in), local logs

**Assertion reuse:**
- **Method:** Parse generated `.organon/coverage.json` files from pilot projects
- **Formula:** `(count of invariants using pre-built assertions) / (total invariants tested) × 100%`
- **Sample:** All pilot projects (minimum 5 projects, 50+ invariants total)
- **Target:** ≥70% across all projects

**Coverage adoption:**
- **Method:** Weekly snapshots of tier-4 coverage % from pilot projects
- **Sample:** 5 pilot projects (organon-tools itself + 4 external early adopters TBD)
- **Timeline:** Measure at weeks 0, 1, 2, 4 post-adoption
- **Target:** ≥50% of projects reach 80% coverage by week 4
- **Data collection:** `organon coverage` output captured in CI logs

**Developer satisfaction:**
- **Method:** Post-implementation survey sent to pilot project teams (after 4 weeks of use)
- **Survey:** 5-point Likert scale ("Would you recommend?") mapped to NPS scale
  - Strongly agree (+2) → Score 10
  - Agree (+1) → Score 8
  - Neutral (0) → Score 5
  - Disagree (-1) → Score 3
  - Strongly disagree (-2) → Score 0
- **Target:** Mean score ≥8 across all respondents
- **Sample size:** Minimum 10 developers (at least 2 per pilot project)

**Integration speed:**
- **Method:** Measure from `npm install @organon/testing` to first successful `organon verify --gate=tier4-tests` in CI
- **Tracking:** Combination of telemetry (opt-in) and manual timing for pilot projects
- **Target:** 90th percentile < 30 minutes
- **Includes:** Package install, test file creation, first test written, CI configuration, first passing build

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

### Resolved (During RFC Review)
6. ✅ **Naming:** `@organon/testing` (matches `@testing-library/*` convention)
7. ✅ **Assertion API:** Options object (`assertMaxValue({ files, pattern, maxValue })`) — clearer, extensible, optional params without breaking changes
8. ✅ **Test metadata storage:** `.organon/coverage.json` (already referenced throughout docs and architecture)

### Still Open

None — all design questions resolved. Ready for implementation.

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

## Backward Compatibility

**Impact:** None. This RFC is fully backward compatible.

**Rationale:**
- Testing domain is new (doesn't modify existing domains)
- No changes to core organon structure (ETHOS, PHILOSOPHY, PROTOCOL templates remain unchanged)
- New frontmatter fields are domain-specific (only in testing domain organon files)
- Existing projects can adopt incrementally (opt-in, not breaking change)
- `organon-tools` CLI gains new commands (`generate-tests`, enhanced `coverage`, `verify --gate=tier4-tests`) but existing commands unchanged
- @organon/testing is a new package (no version to break compatibility with)

**Migration:** None required. Projects not using @organon/testing are completely unaffected. Projects adopting @organon/testing add it as a new dependency without changing existing code.

**Versioning:**
- @organon/testing will start at `0.1.0-beta` (Phase 1 delivery)
- SemVer followed: breaking changes require major version bump
- organon-tools CLI remains on separate versioning (no coupling)

---

## Related Files

| File | Relationship |
|------|--------------|
| [organon/domains/tools/ETHOS.md](../organon/domains/tools/ETHOS.md) | Testing library must follow organon-tools invariants (schema fidelity, 100% coverage, idempotent operations) |
| [organon/domains/tools/PHILOSOPHY.md](../organon/domains/tools/PHILOSOPHY.md) | Design principles (fail-fast, testability, clarity) guide assertion API design |
| [book-llms/invariant-tracking.md](../book-llms/invariant-tracking.md) | Defines tier-4 testing specification (this RFC implements it) |
| [book-llms/three-layer-architecture.md](../book-llms/three-layer-architecture.md) | Testing library is Layer 3 (Tools) that executes tier-4 verification |
| [packages/tools/dev/testing-framework-design.md](../packages/tools/dev/testing-framework-design.md) | Detailed design document (basis for this RFC) |
| [rfcs/002-compound-engineering-integration.md](./002-compound-engineering-integration.md) | Defines 6-step enforcement loop (Define → Bind → Execute → Verify → Compound → Evolve) used in this RFC |
| [rfcs/003-explore-before-ethos.md](./003-explore-before-ethos.md) | Uses testing framework as example of Explore-Before-Ethos pattern for novel domains |

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
2. **Acceptance vote** - All design questions resolved; team approval required to proceed
3. **Begin implementation** - Phase 1 Week 1 (monorepo setup + core assertions)
4. **Update organon files** - Same PR as Phase 1 completion (organon/domains/tools/ETHOS.md, methodology/testing/PROTOCOL.md)

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-02-10 | Initial draft | organon-tools-developer |
| 2026-02-11 | Quality review pass 1: fix INV-TEST-1 purity contradiction (add resolver layer), consolidate duplicate sections, add Out of Scope/Verification Checklist, resolve open questions, specify coverage metric | Claude Opus 4.6 |
| 2026-02-11 | Quality review pass 2: sharpen INV-TEST-7 composable (concrete enforcement), fix heuristics_count 5→10, update proposed ETHOS token_estimate, clean stale Next Steps | Claude Opus 4.6 |
