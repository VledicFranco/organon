---
type: navigation
scope: domain
name: testing-domain
version: "1.2"
summary: Testing domain — multi-language semantic framework for tier-4 invariant verification (TypeScript + Scala 3)
token_estimate: 600
provides: [testing-domain-navigation]
parent: organon-self-governance
audience: [llm, human]
---

# Testing Domain

> Semantic testing framework for tier-4 invariant verification. Bridges the gap between "declare invariant" and "verify invariant in code."

---

## Status

**RFCs:**
- [001-testing-framework](../../../rfcs/001-testing-framework.md) (Implemented)
- [008-scala-testing-library](../../../rfcs/008-scala-testing-library.md) (Implemented)

**Implementation:** Multi-language — TypeScript (7 assertions, 285 tests) and Scala 3 (6 assertions, 75 tests)

---

## Files

| File | Purpose | Status |
|------|---------|--------|
| [ETHOS.md](./ETHOS.md) | Domain identity, invariants, principles | Created |
| [PHILOSOPHY.md](./PHILOSOPHY.md) | Design decisions, trade-offs, reasoning | Created |

---

## Domain Scope

**Published as:**
- `@organon-methodology/testing` (npm — TypeScript)
- `io.github.vledicfranco:organon-testing_3` (Maven Central — Scala 3)

**Code locations:** `packages/testing/` (TypeScript), `packages/testing-scala/` (Scala 3)

**Concepts:**
- Assertions (core verification primitives)
- Test discovery (mapping invariant IDs to tests)
- Coverage tracking (tested vs declared invariants)
- Framework adapters (Vitest for TypeScript, MUnit + ScalaTest for Scala)
- Metadata reporting (JSON output for tooling)

---

## Related Files

| File | Relationship |
|------|--------------|
| [../../ETHOS.md](../../ETHOS.md) | Project-level constraints (testing domain inherits these) |
| [../../../book-llms/invariant-tracking.md](../../../book-llms/invariant-tracking.md) | Tier-4 testing specification (this domain implements it) |
| [../../../packages/testing/](../../../packages/testing/) | TypeScript implementation source code |
| [../../../packages/testing-scala/](../../../packages/testing-scala/) | Scala 3 implementation source code |
