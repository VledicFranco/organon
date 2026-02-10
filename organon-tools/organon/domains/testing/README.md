---
type: navigation
scope: domain
name: testing-domain
version: "1.0"
summary: Testing domain — semantic framework for tier-4 invariant verification, published as @organon/testing
token_estimate: 80
provides: [testing-domain-navigation]
parent: organon-tools
audience: [llm, human]
---

# Testing Domain

> Semantic testing framework for tier-4 invariant verification. Bridges the gap between "declare invariant" and "verify invariant in code."

---

## Status

**RFC:** [001-testing-framework](../../../rfcs/001-testing-framework.md) (Draft)

**Implementation:** Not started

---

## Files

| File | Purpose | Status |
|------|---------|--------|
| ETHOS.md | Domain identity, invariants, principles | Pending (RFC 001) |
| PHILOSOPHY.md | Design decisions, trade-offs, reasoning | Pending (RFC 001) |

---

## Domain Scope

**Published as:** `@organon/testing` (npm package)

**Code location:** `organon-tools/src/core/testing/`, `organon-tools/packages/testing/`

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
| [../../ETHOS.md](../../ETHOS.md) | Product-level constraints (testing domain inherits these) |
| [../../PHILOSOPHY.md](../../PHILOSOPHY.md) | Product-level design principles |
| [../../../book-llms/invariant-tracking.md](../../../book-llms/invariant-tracking.md) | Tier-4 testing specification (this domain implements it) |
