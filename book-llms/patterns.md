---
type: rationale
scope: meta
name: patterns
version: "3.0"
summary: Common patterns and anti-patterns — progressive disclosure, enforcement loop, LLM-centric design, identity boundaries, and more
token_estimate: 5500
pattern_count: 15
inherits_from: [meta-organon]
load_priority: medium
required_for:
  - organon_creation
  - organon_review
audience: [llm, human]
---

# Organon Patterns

> Common patterns for human-machine collaborative projects.

---

## Documentation Layers

Three documentation layers serve different consumers:

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 1: CODE                            │
│   Inline comments, docstrings, type signatures              │
│   Consumer: Compilers, IDEs, developers                     │
│   Truth: AUTHORITATIVE                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 LAYER 2: LLM DOCUMENTATION                  │
│   Structured knowledge base (docs/)                         │
│   Consumer: LLMs, agents, tools                             │
│   Truth: DERIVED from code                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                LAYER 3: HUMAN DOCUMENTATION                 │
│   Narratives, tutorials, marketing (website/docs/)          │
│   Consumer: Humans                                          │
│   Truth: INTERPRETED                                        │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Optimization | Key Constraint |
|-------|--------------|----------------|
| Code | Correctness | Must compile/run |
| LLM docs | Progressive disclosure | Frontmatter + sections for layered access |
| Human docs | Understanding | Progressive disclosure, visuals |

**Consistency rule:** When layers conflict, code wins. Fix docs to match code.

---

## Progressive Disclosure Pattern

**The core pattern for token-efficient organons.** Replaces hard line limits with layered access.

### The Problem

LLMs have finite context windows. Loading entire organon files wastes tokens on irrelevant content. But hard line limits (e.g., "max 200 lines") sacrifice content quality for brevity — important invariants get omitted, examples get cut, coherent documents get split artificially.

### The Solution

Structure every file so agents can access it in progressively deeper layers:

```
Layer 0: README-as-Router        ~50 tokens    "What files exist in this directory?"
    ↓
Layer 1: Frontmatter             ~25-50 tokens "What is this file? Should I load it?"
    ↓
Layer 2: Section Headings        ~100 tokens   "What sections does it contain?"
    ↓
Layer 3: Specific Section        variable      "Load just ## Invariants"
    ↓
Layer 4: Full File               full cost     "Load everything"
```

### How it works

**Layer 0 — README-as-Router:** Every directory has a README.md that lists contents with one-line descriptions. An agent reads this first to decide which files to explore. READMEs are the only files with a soft size guideline (~100 lines) because they serve purely as navigation.

**Layer 1 — Frontmatter:** YAML frontmatter at the top of every file provides metadata: `type`, `scope`, `name`, `summary`, `token_estimate`, `relationships`. Costs ~25-50 tokens. An agent can query frontmatter across dozens of files in one pass and select only the relevant ones.

**Layer 2 — Section Headings:** Standardized `## Heading` structure lets agents scan the table of contents without reading content. An agent that sees `## Identity`, `## Invariants`, `## Principles`, `## Decision Heuristics` knows exactly what's available.

**Layer 3 — Specific Section:** Agents load only the section they need. Working on a tool implementation? Load `## Decision Heuristics`. Reviewing a PR? Load `## Invariants`. This is where the real savings happen — a 500-line file costs ~40 lines to get just the invariants.

**Layer 4 — Full File:** Load entire content. Rare — usually only during organon creation, review, or methodology evolution.

### Token savings example

A project with 49 organon files (~112K total tokens):

| Approach | Tokens loaded | Savings |
|----------|---------------|---------|
| Load all files | 112,000 | 0% |
| Frontmatter filter → load 3 relevant files | ~8,000 | 93% |
| Frontmatter filter → section-level load | ~2,000 | 98% |

### Key principle

**Files can be any size.** A 550-line file with good frontmatter and standardized sections is more token-efficient than a 150-line file without either, because the agent loads only what it needs. Quality and completeness of content must never be sacrificed for brevity.

---

## README as Router

Every directory has a `README.md` that serves as navigation:

```markdown
---
type: navigation
scope: [scope]
name: [directory-name]
version: "1.0"
summary: Navigation for [directory-name]
token_estimate: 200
provides: [list of what this directory contains]
parent: [parent-directory]
---

# Directory Name

Brief summary (1-2 sentences).

## Contents

| Path | Description |
|------|-------------|
| [child-a/](./child-a/) | What child-a covers |
| [child-b.md](./child-b.md) | What child-b covers |
```

**Purpose:** LLMs navigate by reading READMEs to decide which child to explore. This is Layer 0 of progressive disclosure.

**Guideline:** READMEs are routers, not content. Keep them focused on navigation (~100 lines). If a README is growing, the content belongs in a dedicated file.

---

## Frontmatter-First Pattern

Every organon file starts with YAML frontmatter. This is Layer 1 of progressive disclosure.

```yaml
---
type: constraints          # What kind of file
scope: domain              # Where in the hierarchy
name: genesis              # Unique identifier
version: "1.0"             # Semantic version
summary: Invariants...     # One-sentence preview (max 200 chars)
token_estimate: 2800       # Full file token cost
inherits_from: [product]   # Parent scope
load_priority: high        # Triage importance
required_for:              # Task-specific filtering
  - genesis_tool_implementation
audience: [llm, human]     # Who consumes this
---
```

**Purpose:** Agents spend ~25-50 tokens to decide whether to load ~2,500 tokens. 98% token savings on files that aren't needed.

**Required fields:** `type`, `scope`, `name`, `version`, `summary`, `token_estimate`. See `frontmatter-system.md` for the full schema and type-specific fields.

---

## Standardized Section Headings Pattern

Each artifact type uses predictable headings so agents can do section-level loading (Layer 3).

### ETHOS.md headings

```markdown
## Identity          ← IS/IS NOT boundaries
## Invariants        ← Rules that must never be violated
## Principles        ← Prioritized guidelines (lower number = higher priority)
## Decision Heuristics  ← "When X, do Y" tables
```

### PHILOSOPHY.md headings

```markdown
## The Problem       ← What pain exists
## The Bet           ← Core approach chosen
## Design Decisions  ← Numbered decisions with rationale
## Trade-offs        ← What we gained vs sacrificed
```

### PROTOCOL.md headings

```markdown
## Goal              ← What success looks like
## Preconditions     ← What must be true before starting
## Steps             ← Numbered actions
## Verification      ← How to confirm completion
```

**Purpose:** An agent that needs only invariants reads from `## Invariants` to the next `##`. It never pays the token cost of sections it doesn't need, regardless of file size.

**Invariant:** These headings must not be renamed, reordered, or nested differently. They are a contract between file authors and consuming agents.

---

## Component Cross-References

Feature docs link to implementation without duplicating:

```markdown
## Components Involved

| Component | Role | Key Files |
|-----------|------|-----------|
| runtime | Cache execution | `CacheExecutor.scala` |
| compiler | Option validation | `OptionValidator.scala` |
```

**Purpose:** Bridges "what it does" (features) to "where it's implemented" (components).

---

## Ethos-First Development

When starting a new feature or domain:

```
1. Write ETHOS.md first (with frontmatter)
   - Forces clarity about constraints
   - Defines identity boundaries
   - Establishes decision heuristics

2. Implement the feature
   - Ethos guides decisions
   - Violations surface early

3. Write PHILOSOPHY.md (with frontmatter)
   - Explains decisions made during implementation
   - Documents trade-offs discovered

4. Write protocols as patterns emerge
   - Repeatable tasks get protocols
   - One-off tasks stay in ethos heuristics
```

---

## Identity Boundary Pattern

Every ethos starts with explicit boundaries:

```markdown
## Identity

### What [This] IS
- [Positive definition 1]
- [Positive definition 2]

### What [This] IS NOT
- [Exclusion 1]
- [Exclusion 2]
```

**Purpose:** Prevents scope creep. LLMs know what's out of bounds.

**Test:** For any proposed action, can you answer "Does this fit the IS and avoid the IS NOT?" If unclear, boundaries need refinement.

---

## Prioritized Principles Pattern

Principles are numbered by priority:

```markdown
## Principles (Prioritized)

1. **Safety over speed.** Never sacrifice correctness for performance.
2. **Explicit over implicit.** Prefer verbose clarity over clever brevity.
3. **Simple over complete.** Solve the common case well before edge cases.
```

**Conflict resolution:** When principles conflict, lower number wins (higher priority).

**Example conflict:** "Make it fast" vs "Make it safe" → Safety wins (principle 1 beats principle 3).

---

## Decision Heuristic Pattern

Pre-computed answers for recurring ambiguous situations:

```markdown
## Decision Heuristics

| Situation | Action |
|-----------|--------|
| When cache TTL is unspecified | Use 5 minutes |
| When two approaches seem equal | Choose the simpler one |
| When blocked by external dependency | Document blocker, move to next task |
```

**Format:** "When [situation], [action]"

**Benefit:** Eliminates per-decision reasoning. Saves tokens, ensures consistency.

---

## Protocol Invocation Pattern

Protocols are invoked by name, not embedded:

```markdown
## Heuristics

- Before merging, follow the [Pre-Merge Protocol](./protocols/pre-merge.md)
- When releasing, follow the [Release Protocol](./protocols/release.md)
```

**Purpose:** Ethos stays focused on constraints. Protocols handle procedures.

---

## Enforcement Loop Pattern

The pattern that makes organons executable, not just readable. Three layers form a closed loop:

```
Protocols (Knowledge)     →  "What must happen" — PROTOCOLS.md in organon hierarchy
    ↓
Workflows (Agent Binding) →  "How to orchestrate" — agent-specific (skills, rules, workflow docs)
    ↓
Tools (Operations)        →  "How to execute" — CLI commands, MCP tools, scripts
    ↓
Verification              →  "Did it work?" — automated checks close the loop
    ↓
    └──────────────────── back to Protocols (evolve)
```

**Technology-agnostic:** Protocols and tools are universal. The workflow layer is the only agent-specific part — it adapts to Claude Code skills, Cursor rules, generic workflow docs, or any LLM's native format.

**Automation tiers:** Not every protocol needs a workflow.

| Tier | Criteria | Has Workflow? |
|------|----------|---------------|
| Automated | ≥5 steps, cross-domain, error-prone, frequent | Yes |
| Semi-Automated | 1-2 steps, single tool, infrequent | No (tool only) |
| Manual | Judgment required, context-dependent | No (docs only) |

**Bidirectional references:** If a protocol declares `automation_tier: automated`, the referenced workflow must exist and reference back via `protocol_id`. See `three-layer-architecture.md` for the full specification, universal contracts, and implementation guidance.

**Why it matters:** Without this loop, organons are documentation. With it, they're enforced constraints. The LLM reads the organon, executes the workflow, invokes tools, and verification catches violations — automatically.

---

## Verification Checklist Pattern

Both ethos and protocols end with verification:

**Ethos verification:**
```markdown
## Verification Checklist

Before publishing changes:
- [ ] Frontmatter present with all required fields
- [ ] Frontmatter counts match actual content
- [ ] Identity boundaries respected
- [ ] Invariants not violated
- [ ] Principles applied in priority order
- [ ] Section headings follow standardized structure
```

**Protocol verification:**
```markdown
## Verification

After completion:
- [ ] Tests pass
- [ ] Branch deleted
- [ ] Issue closed
```

---

## Meta-Organon Pattern

A **meta-organon** documents the organon system itself. It's an organon about organons.

```
organon/
  ├── ETHOS.md        ← Meta-level: "How to write organons"
  ├── PHILOSOPHY.md   ← Meta-level: "Why organons work this way"
  ├── README.md       ← Navigation guide
  └── ...             ← Domain/feature organons
```

**Purpose:**
- Self-documenting methodology
- Teaches new contributors how to extend the organon system
- Prevents organon drift by codifying the rules

**Strong Recommendation:** Every project with organons should have a meta-organon. Without it, the methodology itself becomes tribal knowledge.

---

## Organon Directory Structure

Two primary patterns for organizing organon directories:

### Pattern A: Dedicated `organon/` Directory

```
/ETHOS.md                 ← Product-level (root visibility)
/PHILOSOPHY.md            ← Product-level
/organon/
  ├── ETHOS.md            ← Meta-organon
  ├── README.md           ← Navigation
  ├── domains/            ← Business domains (DDD)
  ├── features/           ← User capabilities
  ├── components/         ← Implementation units
  └── protocols/          ← Operational procedures
```

**Recommended when:**
- Project has both LLM docs and human docs
- Clear separation between constraints and documentation needed
- Multiple documentation surfaces exist

### Pattern B: Embedded in `docs/`

```
/docs/
  ├── ETHOS.md            ← Product-level
  ├── PHILOSOPHY.md       ← Product-level
  ├── features/           ← Feature organons
  ├── components/         ← Component organons
  └── protocols/          ← Protocols
```

**Acceptable when:**
- No separate human documentation
- Simpler project structure preferred
- Single documentation surface

**Strong Recommendation:** Place product-level `ETHOS.md` and `PHILOSOPHY.md` at **repository root** for maximum visibility. The first thing any agent (human or LLM) sees should be the constraints.

---

## Anti-Pattern Reference

| Anti-Pattern | Description | Fix |
|--------------|-------------|-----|
| Missing frontmatter | Forces all-or-nothing loading | Add YAML frontmatter with required fields |
| Non-standard headings | Breaks section-level loading | Use standardized headings from ETHOS.md |
| Splitting for size alone | Breaks coherence, adds navigation cost | Keep cohesive content together. Use frontmatter + sections. |
| Philosophy without ethos | Explains but doesn't constrain | Write ethos first |
| Ethos with explanations | "Do X because Y" everywhere | Move "because Y" to philosophy |
| Vague boundaries | "Be reasonable" | Specify concrete actions |
| Duplicate content | Same constraint in multiple places | Single source, link elsewhere |
| Stale organon | Contradicts current code | Update organon or code |
| Missing meta-organon | Organon methodology is undocumented | Create `organon/ETHOS.md` for the system itself |
| Buried product ethos | ETHOS.md hidden in subdirectory | Move to repository root |
| Orphaned workflow | Workflow exists without protocol reference | Add `protocol_id` and `protocol_file` to workflow |
| Phantom automation | Protocol claims `automated` but workflow doesn't exist | Create workflow or change tier to `manual` |
