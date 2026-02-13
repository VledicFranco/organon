---
type: navigation
scope: domain
name: testing-domain
version: "1.1"
summary: Testing domain — semantic framework for tier-4 invariant verification, published as @organon-methodology/testing
token_estimate: 500
provides: [testing-domain-navigation]
parent: organon-self-governance
audience: [llm, human]
---

# Testing Domain

> Semantic testing framework for tier-4 invariant verification. Bridges the gap between "declare invariant" and "verify invariant in code."

---

## Status

**RFC:** [001-testing-framework](../../../rfcs/001-testing-framework.md) (Draft)

**Implementation:** Initial implementation complete (testInvariant + assertMaxValue, 65 tests, 100% coverage)

---

## Files

| File | Purpose | Status |
|------|---------|--------|
| [ETHOS.md](./ETHOS.md) | Domain identity, invariants, principles | Created |
| [PHILOSOPHY.md](./PHILOSOPHY.md) | Design decisions, trade-offs, reasoning | Created |

---

## Domain Scope

**Published as:** `@organon-methodology/testing` (npm package)

**Code location:** `packages/testing/`

**Concepts:**
- Assertions (core verification primitives)
- Test discovery (mapping invariant IDs to tests)
- Coverage tracking (tested vs declared invariants)
- Framework adapters (Vitest, Jest, Mocha)
- Metadata reporting (JSON output for tooling)

---

## Related Files

| File | Relationship |
|------|--------------|
| [../../ETHOS.md](../../ETHOS.md) | Project-level constraints (testing domain inherits these) |
| [../../../book-llms/invariant-tracking.md](../../../book-llms/invariant-tracking.md) | Tier-4 testing specification (this domain implements it) |
| [../../../packages/testing/](../../../packages/testing/) | Implementation source code |
