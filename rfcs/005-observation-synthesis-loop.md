---
type: rationale
scope: meta
name: observation-synthesis-loop
version: "0.1"
summary: Introduce a formal mechanism for accumulating empirical observations from real work and synthesizing them into methodology improvements — the missing artifact between COMPOUND and EVOLVE
token_estimate: 8500
status: draft
created: 2026-02-11
author: Claude Opus 4.6
related_files:
  - ./002-compound-engineering-integration.md
  - ./001-testing-framework.md
  - ../book-llms/ETHOS.md
  - ../book-llms/PHILOSOPHY.md
  - ../book-llms/patterns.md
  - ../book-llms/three-layer-architecture.md
load_priority: high
audience: [llm, human]
---

# RFC 005: Observation-Synthesis Loop

> Introduce a formal mechanism for accumulating empirical observations from practice and synthesizing them into durable methodology improvements. The missing link between noticing something and changing the methodology.

---

## Status

**Current State:** Draft — initial proposal, expect significant refinement

**Next Milestone:** Conceptual alignment on naming, artifact type, and lifecycle

| Transition | Date | Notes |
|------------|------|-------|
| → Draft | 2026-02-11 | Initial proposal from session compounding learnings |

---

## Problem Statement

### The Gap: COMPOUND produces, but nothing accumulates

RFC 002 established the COMPOUND phase and the session-compounding workflow. These work: during the skill family testing (11 observations across 9 steps), session-compounding detected patterns, classified improvements, and executed the highest-priority fix.

**But the observations themselves are ephemeral.**

The session-compounding workflow says: "detect patterns → classify → prioritize → execute the top one → done." What happens to findings #2 through #6? They vanish. Next session starts fresh. The agent has no memory of "last session I noticed X, and the session before that I noticed X too — now it's a pattern."

### Three specific gaps

**1. No accumulation mechanism**

The enforcement loop has six phases but only five have artifacts:

| Phase | Artifact | Status |
|-------|----------|--------|
| DEFINE | ETHOS.md, PHILOSOPHY.md | Exists |
| BIND | Workflows (skills, rules) | Exists |
| EXECUTE | Code, content | Exists |
| VERIFY | Gate results, health scores | Exists |
| COMPOUND | ??? | **Missing** |
| EVOLVE | Updated organon files, RFCs | Exists |

COMPOUND produces ephemeral insights during a session. EVOLVE consumes mature decisions in the form of RFCs. Nothing connects them. There's no artifact that says "here's what we've observed over 5 sessions, and here's what's mature enough to act on."

**2. No maturity model for insights**

Not every observation deserves an RFC. A single friction point might be noise. Three observations of the same friction are a signal. Five observations with the same root cause are a pattern that demands action.

Currently there's no way to express: "this observation has been confirmed N times, across M sessions, and now qualifies for action." The session-compounding workflow treats every finding as equally actionable in the current session, when many need time to mature.

**3. No evidence trail for methodology changes**

When someone creates an RFC to change the methodology, the justification is narrative: "we believe X because of our experience." There's no structured evidence. The Organon methodology — which insists on enforcement, verification, and traceability for everything else — has no traceability for its own evolution decisions.

### What we learned empirically

During the 9-step skill family testing, we created an experimental `learnings/` directory to fill this gap. The results validated the concept:

- 11 observations recorded (O1-O11)
- 3 led to immediate fixes (O3 → TOKEN_TOLERANCE, O10 → workflow `--term` flag, O11 → nested `node_modules/` ignore pattern)
- 4 identified tooling improvements for future work
- 2 confirmed existing methodology guidance was correct
- 2 flagged patterns to watch across future sessions

The directory worked. But it was ad-hoc — no formal structure, no lifecycle, no methodology backing. This RFC formalizes what we discovered.

---

## Proposed Solution

### The Concept: Observation-Synthesis Loop

A formal mechanism with three components:

1. **Observations** — structured empirical records from real work sessions
2. **Synthesis** — the process of reviewing accumulated observations to find patterns
3. **Graduation** — the trigger for converting mature patterns into methodology actions

```
Work Session
    │
    ▼
┌──────────────────────────┐
│  OBSERVE                 │  During/after work: notice friction, patterns, surprises
│  Record structured obs.  │  Output: observation entry in current observation file
└──────────┬───────────────┘
           │ accumulates over sessions
           ▼
┌──────────────────────────┐
│  SYNTHESIZE              │  Periodically: review accumulated observations
│  Find patterns across    │  Output: patterns promoted, noise retired
│  multiple observations   │
└──────────┬───────────────┘
           │ when pattern is mature
           ▼
┌──────────────────────────┐
│  GRADUATE                │  Pattern → concrete action:
│  Convert to methodology  │  → RFC (methodology change)
│  action                  │  → Heuristic (decision guidance)
│                          │  → Tool improvement (automation)
│                          │  → Workflow refinement (process)
└──────────────────────────┘
```

### Naming Proposal

The experimental directory was called `learnings/`. This RFC proposes alternatives — the right name should capture what the artifacts *are* and what they *become*.

| Name | Captures | Feels like | Concern |
|------|----------|------------|---------|
| **observations** | What we record | Scientific, empirical | Passive — doesn't capture the synthesis |
| **fieldwork** | Where they come from | Anthropological, grounded | Slightly odd for software context |
| **dispatches** | Reporting from practice | Journalistic, vivid | Might feel too informal |
| **evidence** | What they provide for decisions | Legal, rigorous | Implies certainty prematurely |
| **practice-notes** | Theory-practice bridge | Academic, clear | Two words, slightly verbose |
| **synthesis** | What they become | Process-focused | Doesn't capture the raw observation phase |
| **praxis** | Theory-in-practice (Greek, matches "organon") | Philosophical, etymologically fitting | Too obscure for most teams |

**Recommendation:** `observations/` as the directory name, **observation** as the artifact type. Clear, universally understood, scientifically grounded. The *synthesis* is the process performed on observations, not a separate artifact.

**Open for discussion.** The name should be settled before implementation.

---

## The Observation Artifact

### A New Artifact Type

Observations are a new type alongside the existing five:

| Type | Artifact | Purpose | Existing? |
|------|----------|---------|-----------|
| `constraints` | ETHOS.md | What must be true | Yes |
| `rationale` | PHILOSOPHY.md | Why we decided this | Yes |
| `procedures` | PROTOCOL.md | How to do it | Yes |
| `navigation` | README.md | Where to find things | Yes |
| `mapping` | components.md | What maps to what | Yes |
| **`observation`** | **numbered .md files** | **What we noticed from practice** | **New** |

### Structure of an Observation File

Each observation file is a **collection of related observations** from a body of work (a testing cycle, a feature implementation, a methodology evolution session). Not one-observation-per-file — that's too granular.

```markdown
---
type: observation
scope: [product|domain|methodology]
name: descriptive-kebab-case
version: "1.0"
summary: One-sentence description of what body of work produced these observations
token_estimate: N
status: [active|synthesized|graduated|retired]
observation_count: N
created: YYYY-MM-DD
author: who recorded them
audience: [llm, human]
---

# Observation NNN: Descriptive Title

> One-sentence summary of the body of work and its key findings.

---

## Context

What work was being done, what was the goal, what tools/workflows were used.

---

## Observations

### O1: Short descriptive title

**Signal:** What was noticed (the raw observation)

**Frequency:** How often this has been observed (once / 2-3 times / recurring)

**Implication:** What this means for the methodology or tooling

**Maturity:** [signal | pattern | actionable]
- signal: noticed once, may be noise
- pattern: confirmed across ≥3 instances or sessions
- actionable: root cause understood, clear fix exists

**Suggested action:** What should be done (tool improvement, heuristic addition, etc.)

### O2: ...

---

## Synthesis

Periodic review section. Added when observations are reviewed across sessions:

| Observation | First seen | Confirmed | Maturity | Action taken |
|-------------|-----------|-----------|----------|--------------|
| O1 | 2026-02-11 | 3 sessions | pattern | RFC 006 created |
| O2 | 2026-02-11 | 1 session | signal | Watching |

---

## Changelog

| Date | Entry | Author |
|------|-------|--------|
| YYYY-MM-DD | Initial observations | ... |
```

### Maturity Model

Observations mature through three stages:

```
SIGNAL ──────→ PATTERN ──────→ ACTIONABLE ──────→ GRADUATED
(noticed once)  (confirmed 3+)  (root cause known)  (action taken)
```

| Stage | Criteria | What happens |
|-------|----------|--------------|
| **Signal** | Noticed once during work | Record it. Don't act yet. |
| **Pattern** | Confirmed across ≥3 instances or ≥2 sessions | Investigate root cause. Add to synthesis table. |
| **Actionable** | Root cause understood, clear fix identified | Create action: RFC, heuristic, tool improvement, or workflow fix. |
| **Graduated** | Action has been taken (RFC merged, tool built, etc.) | Update observation status. Link to the action artifact. |

**Key principle: Don't act on signals.** A single observation might be noise. Wait for confirmation. This prevents reactive methodology churn.

**Exception:** If a signal is blocking work or causing errors *right now*, act immediately (like the nested `node_modules/` bug — O11 was a signal but also a bug, so we fixed it immediately).

### Where Observations Live

**Directory convention:** `observations/` at the scope level where the work happened.

```
organon/
  observations/               ← project-level observations
    001-skill-family-testing.md
    002-rfc-implementation-patterns.md
packages/tools/
  organon/
    observations/             ← packages/tools-specific observations
      001-validator-edge-cases.md
```

**Decision:** Should every scope have `observations/`? Or only project-level?

| Option | Pro | Con |
|--------|-----|-----|
| **Project-level only** | Simple, one place to look | Mixes domain-specific and cross-cutting observations |
| **Per-scope** | Observations live near the work they came from | Fragmentation, harder to synthesize across scopes |
| **Both** (recommended) | Scope-specific observations stay local, cross-cutting go to project | Requires clear guidance on which level |

**Recommendation:** Both, with a heuristic: *If the observation is about a specific domain or component, put it in that scope's `observations/`. If it's about the methodology, process, or cross-cutting concern, put it at project level.*

---

## Integration with the Enforcement Loop

### How observations flow through the loop

```
DEFINE ── constraints, protocols
  │
BIND ─── workflows
  │
EXECUTE ── work happens
  │
VERIFY ── gates check compliance
  │
COMPOUND ── session-compounding creates/updates observations ◄── NEW CONNECTION
  │
EVOLVE ── mature observations graduate into RFCs, heuristics ◄── NEW CONNECTION
  │
└──→ back to DEFINE
```

**COMPOUND produces observations.** The session-compounding workflow now has a concrete output artifact, not just ephemeral insights.

**EVOLVE consumes mature observations.** When creating an RFC or updating methodology, the author can reference specific observation IDs as evidence.

### Updated workflows

**`session-compounding` workflow additions:**
- Step 2 (Detect Patterns): Also review existing observations from previous sessions
- Step 6 (Execute Improvement): If not executing now, record as observation in the active observation file
- New step: Update the synthesis table if observations have matured

**`methodology-spec-evolution` workflow additions:**
- Step 0 (new): Check observations directory for mature patterns related to the change
- Reference specific observation IDs in commit messages or RFC links

---

## Proposed Ethos (Constraints for Observations)

If observations become a formal artifact type, they need constraints:

### Invariants

1. **Evidence-based, not speculative.** Every observation must reference a specific work session or concrete event. No hypothetical observations.
   - *Enforced by:* required `## Context` section linking to commits, sessions, or specific work

2. **Maturity before action.** Signals do not trigger methodology changes. Only patterns (≥3 confirmations) or actionable observations (root cause understood) graduate to RFCs or heuristic updates.
   - *Enforced by:* synthesis table tracks maturity; graduated observations must link to action artifact
   - *Exception:* Blocking bugs or errors can be fixed immediately regardless of maturity

3. **Accumulate, don't duplicate.** New observations of an existing pattern update the existing observation's frequency count and maturity. They don't create a new observation entry.
   - *Enforced by:* synthesis table review during COMPOUND phase

4. **Observations have expiry.** Signals that haven't been confirmed within 90 days (or 5 sessions, whichever comes first) are retired, not acted upon. Stale signals are noise.
   - *Enforced by:* periodic synthesis review; retired observations marked in synthesis table

5. **Traceability both directions.** When an observation graduates (triggers an RFC, heuristic, tool fix), the observation links to the action, and the action links back to the observation evidence.
   - *Enforced by:* graduated status requires `action_ref` field; RFCs should reference observation IDs in justification

### Principles

1. **Patience over reactivity.** Wait for patterns before acting. One friction point is noise; three is a signal; five with the same root cause is a pattern. Methodology churn from acting on noise is worse than tolerating temporary friction.

2. **Concrete over abstract.** "The validator failed on nested node_modules paths" is an observation. "The tools could be better" is not. Observations must be specific enough that someone else could reproduce or verify them.

3. **Accumulation over perfection.** A rough observation recorded today is more valuable than a perfect analysis never written. The synthesis process handles refinement — the initial recording should be fast and low-friction.

4. **Synthesis is periodic, not continuous.** Don't synthesize after every session. Let observations accumulate, then review the batch. Suggested rhythm: synthesize every 5 sessions or at natural project milestones.

---

## Proposed Philosophy (Rationale)

### The Problem

The Organon methodology talks about "compound wins" and "recursive improvement" but has a structural gap: the COMPOUND phase produces insights with no place to put them, and the EVOLVE phase consumes decisions with no evidence trail. The methodology that insists on traceability for code has no traceability for its own evolution.

### The Bet

**Hypothesis:** If observations accumulate across sessions with explicit maturity tracking, methodology changes will be higher quality (fewer reactive changes, more evidence-backed decisions) and the COMPOUND→EVOLVE pipeline will be more productive (more improvements will actually happen instead of being forgotten).

**Falsifiable:** If after 10 sessions of using the observation system, fewer than 30% of recorded observations reach "pattern" or "actionable" maturity, the system is capturing noise, not signal. If methodology changes don't reference observation evidence, the traceability goal has failed.

### Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| New artifact type (not subtype of rationale) | Clean semantics: observations ≠ design reasoning | One more type in the taxonomy, more frontmatter schema |
| Maturity gates before action | Prevents reactive methodology churn from noise | Delays fixing real problems if they're classified as "signal" |
| 90-day expiry on signals | Keeps observation files from growing unbounded | Might retire slow-burning observations that are real but rare |
| Per-scope + project-level observations | Observations stay near their context | Requires judgment about which level to use |
| Numbered files (001-, 002-) | Clear ordering, easy to reference | Not as discoverable as named files |

### Alternatives Considered

**1. Use PHILOSOPHY.md for observations**
- Rejected: PHILOSOPHY explains *why we decided*, not *what we noticed*. Mixing empirical observations with design reasoning muddies both.

**2. Use git commit messages / PR descriptions**
- Rejected: Not structured, not searchable, not accumulative. An observation buried in a PR description from 3 months ago is effectively lost.

**3. Use the session-compounding workflow as-is (no new artifact)**
- Rejected: This is the current state. It produces ephemeral insights. We've empirically confirmed it's insufficient — findings #2-6 from any session vanish.

**4. Use a database or issue tracker instead of markdown files**
- Rejected: Violates the methodology's "everything is a file with frontmatter" principle. Also adds tooling dependency.

---

## Technical Implementation

### Organon Impact

**New artifact type:** `observation` added to the type taxonomy in:
- `book-llms/ETHOS.md` — structure template for observation files
- `book-llms/frontmatter-system.md` — frontmatter schema for observation type
- `book-llms/templates.md` — copy-paste scaffold for observation files
- `book-llms/scopes.md` — where observations fit in the scope hierarchy

**New directory convention:** `observations/` documented in:
- `book-llms/ETHOS.md` — directory structure patterns
- `book-llms/templates.md` — README template for observations directory

**Updated patterns:** `book-llms/patterns.md`:
- New pattern: "Observation-Synthesis Loop" — how observations flow through the enforcement loop
- Updated: "Recursive Collaboration Pattern" — add observations as the accumulation mechanism

**Updated architecture:** `book-llms/three-layer-architecture.md`:
- COMPOUND phase now produces observations
- EVOLVE phase now consumes mature observations
- Observation-Synthesis Loop diagram added

**Updated workflows:**
- `session-compounding` — record observations as output, review existing observations as input
- `methodology-spec-evolution` — check observations for evidence before making changes

### Frontmatter Schema

New fields for `type: observation`:

```yaml
type: observation
scope: [product|domain|feature|component|methodology]
name: string                    # kebab-case identifier
version: string
summary: string                 # ≤200 chars
token_estimate: number
status: [active|synthesized|graduated|retired]
  # active: still accumulating observations
  # synthesized: all observations reviewed, patterns identified
  # graduated: primary pattern has triggered an action (RFC, fix, etc.)
  # retired: observations expired or no longer relevant
observation_count: number       # count of O-entries
created: date
author: string
audience: [llm, human]
```

### Tooling (Optional / V2)

Not required for initial implementation, but natural extensions:

| Tool | Purpose | Priority |
|------|---------|----------|
| `organon observe` | Quick-add an observation to the active file | Medium |
| `organon synthesize` | Review observations, prompt maturity assessment | Low |
| `organon observations --mature` | List all pattern/actionable observations | Medium |
| Verification gate: `observation-freshness` | Warn when active observation files haven't been reviewed in 90 days | Low |

### Implementation Steps

**Phase 1: Methodology updates (this RFC)**
1. Add `observation` type to `book-llms/ETHOS.md` structure templates
2. Add frontmatter schema to `book-llms/frontmatter-system.md`
3. Add template scaffold to `book-llms/templates.md`
4. Add Observation-Synthesis Loop pattern to `book-llms/patterns.md`
5. Update `book-llms/three-layer-architecture.md` COMPOUND/EVOLVE descriptions
6. Update `session-compounding` workflow to produce/consume observations
7. Update `methodology-spec-evolution` workflow to reference observations

**Phase 2: Migrate experimental learnings**
8. Rename `learnings/` → `observations/` (or chosen name) in PR #1
9. Update `001-skill-family-testing.md` frontmatter to use new schema
10. Validate with `organon validate`

**Phase 3: Tooling (optional, future)**
11. `organon observe` command for quick observation recording
12. Verification gate for observation freshness

---

## Success Metrics

- [ ] **Coverage:** ≥80% of sessions using session-compounding produce at least one recorded observation
- [ ] **Signal-to-noise:** ≥30% of recorded observations reach "pattern" maturity within 10 sessions
- [ ] **Graduation rate:** ≥50% of "actionable" observations result in a concrete action (RFC, fix, heuristic) within 30 days
- [ ] **Traceability:** ≥80% of methodology RFCs reference specific observation evidence
- [ ] **Decay:** <20% of observations are retired without ever reaching "pattern" (too much noise capture)

---

## Open Questions

### Naming

1. **What should the directory be called?** `observations/`, `fieldwork/`, `dispatches/`, `evidence/`, `practice/`, `praxis/`? See naming table in Proposed Solution.

2. **What should individual entries be called?** "Observations" (O1, O2...), "findings," "notes," "signals"?

### Scope

3. **Should every scope have an `observations/` directory?** Or only project-level? The RFC recommends both with a heuristic, but this adds complexity.

4. **Should observation files be enumerated (001-, 002-) or named?** Enumeration is clear but less discoverable. Named files (e.g., `validator-edge-cases.md`) are more scannable.

### Process

5. **What's the right synthesis cadence?** The RFC proposes every 5 sessions or at milestones. Is this too frequent? Too infrequent?

6. **Should synthesis be a separate workflow?** Currently proposed as part of session-compounding. Could be its own skill for deeper periodic review.

7. **90-day expiry — is this right?** Some patterns emerge slowly over months. Should the expiry be longer (180 days)? Or should there be a "slow-burn" flag that extends it?

### Integration

8. **How does this relate to RFC 002's "compound checklist" open question?** RFC 002 asked whether `organon compound` should exist. If observations become formal, `organon compound` could mean "record observation + check maturity of existing observations."

---

## Dependencies

**Blocks:**
- Tooling for `organon observe` (if built)
- Observation-based verification gates (if built)

**Blocked by:**
- None (can implement immediately with just documentation + workflow updates)

**Related:**
- RFC 002 (Recursive Collaboration) — established COMPOUND phase; this RFC fills the accumulation gap
- RFC 001 (Testing Framework) — testing observations drove this RFC's creation
- PR #1 (`feat/testing-domain-organon`) — contains experimental `learnings/` that would migrate to new convention

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-02-11 | Initial draft — proposal from skill family testing experience | Claude Opus 4.6 |
