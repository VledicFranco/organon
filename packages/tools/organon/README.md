---
type: navigation
scope: product
name: organon-tools-organon
version: "1.0"
summary: Organon hierarchy for organon-tools — domains, features, and protocols that govern this product's development
token_estimate: 100
provides: [organon-navigation]
parent: organon-tools
audience: [llm, human]
---

# Organon Tools - Organon Hierarchy

> This directory contains the organon hierarchy for organon-tools itself — the bounded contexts, features, and protocols that govern how this CLI is built.

---

## Structure

```
organon/
├── domains/           ← Bounded contexts within organon-tools
│   └── testing/       ← Testing framework domain (@organon/testing)
├── learnings/         ← Dogfooding observations (experimental)
└── features/          ← Cross-cutting capabilities (future)
```

---

## Current Domains

| Domain | Purpose | Status |
|--------|---------|--------|
| [testing](./domains/testing/) | Semantic testing framework for tier-4 invariant verification | RFC 001 (Draft) |

---

## Navigation

- **Product-level organon:** See [../ETHOS.md](../ETHOS.md) and [../PHILOSOPHY.md](../PHILOSOPHY.md)
- **Testing domain:** See [domains/testing/](./domains/testing/)
- **Learnings:** See [learnings/](./learnings/) (dogfooding observations)

---

## Adding New Domains

When adding a new domain:
1. Create RFC proposing the domain organon
2. Define domain identity, invariants, principles in ETHOS.md
3. Explain design decisions in PHILOSOPHY.md
4. Implement code that follows domain constraints
5. Same PR: organon files + initial implementation
