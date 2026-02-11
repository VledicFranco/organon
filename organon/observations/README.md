---
type: navigation
scope: product
name: learnings
version: "1.0"
summary: Observations and learnings from dogfooding the Organon methodology — experimental, may inform future methodology evolution
token_estimate: 200
provides: [learnings-directory]
parent: organon-tools
audience: [llm, human]
---

# Learnings

> Observations from using the Organon methodology on itself. Experimental — patterns that recur here may graduate into methodology guidance via RFCs.

---

## Purpose

This directory captures **what we notice while dogfooding**. Not prescriptive (that's `book-llms/`), not procedural (that's `protocols/`), not constraints (that's `ETHOS.md`). Just observations with enough structure to be useful later.

---

## Files

| Number | Title | Date | Status |
|--------|-------|------|--------|
| [001](./001-skill-family-testing.md) | Skill Family Testing Observations | 2026-02-11 | In progress |

---

## When to Add a Learning

- You noticed a pattern that recurred across ≥2 sessions
- A workflow didn't work as expected and you figured out why
- A methodology concept needs refinement but it's too early for an RFC
- Tooling exposed a gap between spec and practice
