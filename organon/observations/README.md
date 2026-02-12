---
type: navigation
scope: product
name: observations
version: "1.1"
summary: Empirical observations from dogfooding — structured records that accumulate across sessions and graduate into methodology improvements
token_estimate: 200
provides: [observations-directory]
parent: organon-self-governance
audience: [llm, human]
---

# Observations

> Empirical observations from using the Organon methodology on itself. Patterns that recur here graduate into methodology improvements via RFCs, heuristic additions, or tool fixes.

---

## Purpose

This directory captures **what we notice while dogfooding**. Not prescriptive (that's `book-llms/`), not procedural (that's `protocols/`), not constraints (that's `ETHOS.md`). Structured observations with enough detail to synthesize across sessions.

See [RFC 005](../../rfcs/005-observation-synthesis-loop.md) for the convention specification and [Observation Accumulation Pattern](../../book-llms/patterns.md#observation-accumulation-pattern) for the methodology pattern.

---

## Files

| Number | Title | Date | Status |
|--------|-------|------|--------|
| [001](./001-skill-family-testing.md) | Skill Family Testing Observations | 2026-02-11 | Complete |
| [002](./002-rfc-005-implementation.md) | RFC 005 Implementation Observations | 2026-02-12 | Complete |

---

## When to Add an Observation

- You noticed a pattern that recurred across ≥2 sessions
- A workflow didn't work as expected and you figured out why
- A methodology concept needs refinement but it's too early for an RFC
- Tooling exposed a gap between spec and practice
