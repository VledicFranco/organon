---
type: rationale
scope: meta
name: observation-synthesis-loop
version: "0.2"
summary: Lightweight convention for accumulating empirical observations across sessions — convention-first, formalize only if evidence warrants
token_estimate: 3200
status: accepted
created: 2026-02-11
author: Claude Opus 4.6
related_files:
  - ./002-compound-engineering-integration.md
  - ./001-testing-framework.md
  - ../book-llms/patterns.md
  - ../book-llms/three-layer-architecture.md
  - ../organon/observations/001-skill-family-testing.md
load_priority: high
audience: [llm, human]
---

# RFC 005: Observation Accumulation Convention

> A lightweight convention for recording empirical observations across sessions. Convention-first: formalize only when evidence warrants.

---

## Status

**Current State:** Accepted — ready to implement

| Transition | Date | Notes |
|------------|------|-------|
| Draft | 2026-02-11 | Initial proposal from session compounding learnings |
| Refined | 2026-02-12 | Rewritten as lightweight convention (was over-engineered) |
| Accepted | 2026-02-12 | Approved for implementation |

---

## Problem Statement

RFC 002 established the COMPOUND phase and the session-compounding workflow. During the skill family testing (11 observations across 9 steps), session-compounding detected patterns, classified improvements, and executed the highest-priority fix.

**But the observations themselves are ephemeral.**

The session-compounding workflow says: "detect patterns, classify, prioritize, execute the top one, done." What happens to findings #2 through #6? They vanish. Next session starts fresh. The agent has no memory of "last session I noticed X, and the session before that I noticed X too — now it's a pattern."

The enforcement loop has a gap:

| Phase | Concrete Output | Status |
|-------|-----------------|--------|
| DEFINE | ETHOS.md, PHILOSOPHY.md | Exists |
| BIND | Workflows (skills, rules) | Exists |
| EXECUTE | Code, content | Exists |
| VERIFY | Gate results, health scores | Exists |
| COMPOUND | ??? | **No persistent artifact** |
| EVOLVE | Updated organon files, RFCs | Exists |

COMPOUND produces ephemeral insights. EVOLVE consumes mature decisions via RFCs. Nothing connects them. Observations are the missing intermediate artifact.

---

## Proposed Solution

### Phase 1: Convention (This RFC's Scope)

No new artifact types, no new frontmatter schema, no new CLI commands. Just a convention that works with what exists.

#### Directory convention

`organon/observations/` at project level. Numbered files: `NNN-descriptive-name.md`.

#### File format

Use `type: rationale` frontmatter — observations are empirical rationale. No new artifact type needed.

```yaml
---
type: rationale
scope: product
name: descriptive-kebab-case
version: "1.0"
summary: One-sentence description of what body of work produced these observations
token_estimate: N
status: active          # active | complete
created: YYYY-MM-DD
author: who recorded them
audience: [llm, human]
---
```

#### Required sections

```markdown
# Observation NNN: Descriptive Title

> One-sentence summary.

## Context
What work was being done, what tools/workflows were used.

## Observations

### O1: Short descriptive title
**Signal:** What was noticed (the raw observation)
**Implication:** What this means for methodology or tooling
**Suggested action:** What should be done (or "watch for recurrence")

### O2: ...

## Patterns to Watch
Early signals — not enough data to generalize yet.
```

Each observation captures: **Signal** (what happened), **Implication** (what it means), **Suggested Action** (what to do about it). That's it — no formal Maturity or Frequency metadata fields.

#### Mental model: Signal, Pattern, Actionable

Authors should think about where an observation sits:

| Stage | Meaning | Author guidance |
|-------|---------|-----------------|
| **Signal** | Noticed once, may be noise | Record it. Don't act yet. |
| **Pattern** | Confirmed across multiple instances or sessions | Investigate root cause. Consider action. |
| **Actionable** | Root cause understood, clear fix identified | Create RFC, add heuristic, fix tool, or update workflow. |

This is guidance for the observation author, not system-tracked metadata. The author's judgment about where an observation sits goes in the prose — in the Signal/Implication/Suggested Action fields.

#### When to record (and when not to)

| When | Who | What to Record |
|------|-----|----------------|
| A workflow didn't work as expected | The executing agent | What happened, expected vs actual, root cause |
| A methodology concept needed ad-hoc interpretation | Agent or human making the call | The ambiguity, decision, reasoning |
| Same friction appeared for the second+ time | Agent that noticed recurrence | Both instances, common root cause |
| Tooling exposed gap between spec and practice | Developer or agent using tool | Spec expectation, actual behavior, the gap |
| A pattern emerged not captured anywhere | Anyone who notices | The pattern, where it appears, why it matters |

| When NOT to Record |
|---------------------|
| Single-occurrence friction you already fixed (just a bug fix) |
| Opinions without evidence ("I think X would be better") |
| Observations already captured in existing methodology guidance |
| Session-specific context that won't generalize |

#### Enforcement mechanism

The session-compounding workflow is the enforcement mechanism — not hard gates. It loads prior observations, asks "anything new worth recording?", and records if yes. This is a structured nudge, not a verification gate.

---

### Phase 2: Conditional Formalization (Deferred)

**Trigger:** >10 observation files AND evidence of synthesis actually happening (observations graduate into RFCs, heuristics, or tool fixes).

**What Phase 2 would add:**
- `type: observation` as a formal artifact type (new frontmatter schema, templates, ETHOS.md entry)
- CLI tooling (`organon observe` for quick-add, `organon synthesize` for periodic review)
- Formal synthesis cadence protocol (every N sessions or at milestones)
- Verification gate for observation freshness (warn on stale active observations)

**Explicitly deferred.** Phase 1 proves the concept with zero methodology overhead. If the convention produces value, Phase 2 formalizes it. If not, we haven't polluted the methodology with unused machinery.

---

## Implementation Plan

1. **Rewrite this RFC** — convention-first approach (done)
2. **Add Observation Accumulation Pattern** to `book-llms/patterns.md` — Pattern #23
3. **Update enforcement loop** in `book-llms/three-layer-architecture.md` — add COMPOUND step with observations as output
4. **Update session-compounding workflow** — load prior observations, add recording step
5. **Validate existing observation file** — confirm `organon/observations/001-skill-family-testing.md` already fits the convention (it does)

---

## Resolved Questions

The original draft had 8 open questions. All resolved for Phase 1:

| # | Question | Resolution |
|---|----------|------------|
| 1 | What should the directory be called? | `observations/` — already in use, clear, scientific |
| 2 | What should individual entries be called? | Observations (O1, O2...) — already in use |
| 3 | Should every scope have `observations/`? | Project-level only for now. Add per-scope if needed. |
| 4 | Enumerated or named files? | Enumerated (`NNN-name.md`) — already in use |
| 5 | What's the right synthesis cadence? | No formal cadence. Session-compounding loads recent observations naturally. |
| 6 | Should synthesis be a separate workflow? | No. Part of session-compounding. |
| 7 | 90-day expiry? | No formal expiry. Mark files `status: complete` when a body of work is done. |
| 8 | Relationship to `organon compound`? | No `organon compound` command. Workflow is the enforcement mechanism. |

---

## Dependencies

**Blocks:** Phase 2 formalization (if ever triggered)

**Blocked by:** Nothing (convention can be adopted immediately)

**Related:**
- RFC 002 (Recursive Collaboration) — established COMPOUND phase; this fills the accumulation gap
- RFC 001 (Testing Framework) — testing observations drove this RFC's creation

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-02-11 | Initial draft — over-engineered proposal with new artifact type | Claude Opus 4.6 |
| 2026-02-12 | Rewritten as lightweight convention — convention-first, formalize-if-warranted | Claude Opus 4.6 |
