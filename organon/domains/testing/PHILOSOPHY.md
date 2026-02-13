---
type: rationale
scope: domain
name: testing
version: "1.0"
summary: Why semantic tier-4 testing exists — design decisions, trade-offs, and the bet we're making
token_estimate: 2400
decision_count: 5
inherits_from: [tools]
load_priority: medium
required_for:
  - tier4_testing_evolution
  - testing_domain_maintenance
audience: [llm, human]
---

# Testing Domain Philosophy

> Why we built @organon-methodology/testing this way.

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
