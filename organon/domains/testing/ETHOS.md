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
inherits_from: [organon-self-governance]
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
- TypeScript-native library published as @organon-methodology/testing
- Bridge between "declare invariant" and "verify invariant in code"
- Integration layer connecting ETHOS.md invariants to test frameworks
- Coverage tracker that maps invariant IDs to test implementations

### What This Domain IS NOT
- Not a test runner replacement (integrates with Vitest/Jest/Mocha)
- Not a general-purpose assertion library (focused on organon invariants)
- Not organon file validation (that's organon-tools core: `organon validate`)
- Not a mocking or fixture framework

---

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

---

## Principles (Prioritized)

1. **Fail-fast over forgiving** - Violations throw immediately, no warnings
2. **Clarity over brevity** - Verbose errors by default, explicit API
3. **Reusability over flexibility** - Pre-built assertions for 80% cases
4. **Testability over performance** - Pure functions, deterministic, parallelizable
5. **Integration over replacement** - Works with existing test frameworks

---

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

---

## Out of Scope

Do not do the following in this domain:

- Build a test runner (integrate with Vitest/Jest/Mocha instead)
- Validate organon file structure (that's organon-tools core: `organon validate`)
- Provide mocking, fixture, or snapshot utilities
- Support non-TypeScript languages (future RFCs will address other languages)
- Auto-generate invariants from code (discovery is a separate concern)

---

## Verification Checklist

- [ ] Frontmatter present with all required fields
- [ ] Frontmatter counts match actual content (7 invariants, 5 principles, 10 decision heuristic rows)
- [ ] Identity boundaries are specific and testable
- [ ] Principles are numbered by priority
- [ ] No conflicts with parent scope constraints (organon/domains/tools/ETHOS.md)
- [ ] All 6 inherited organon-tools invariants are compatible (verified: schema fidelity, every command has tests, gates fail not warn, machine-parsable output via json-reporter, idempotent operations, no breaking changes without version bump)
