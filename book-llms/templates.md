---
type: rationale
scope: meta
name: templates
version: "1.1"
summary: Copy-paste templates for ETHOS, PHILOSOPHY, PROTOCOL, WORKFLOW, Observation, and RFC files — all with frontmatter and standardized sections
token_estimate: 7200
inherits_from: [meta-organon]
load_priority: medium
required_for:
  - organon_creation
audience: [llm, human]
---

# Organon Templates

> Copy-paste starting points for each artifact type. All templates include YAML frontmatter and standardized section headings.

---

## Ethos Template

```markdown
---
type: constraints
scope: [product|domain|feature|component|meta|methodology]
name: [kebab-case-name]
version: "1.0"
summary: [One-sentence description, max 200 chars]
token_estimate: [number]
invariants_count: [number]
principles_count: [number]
heuristics_count: [number]
invariants:
  - id: INV-[SCOPE]-1
    name: [kebab-case-label]
inherits_from: [parent-scope-names]
related_domains: [domain-names]
related_features: [feature-names]
load_priority: [high|medium|low]
required_for:
  - [task_type_1]
  - [task_type_2]
audience: [llm, human]
---

# [Scope Name] Ethos

> Behavioral constraints for [agents/LLMs/contributors] working on [scope].

---

## Identity

### What [This] IS

- [Core identity statement 1]
- [Core identity statement 2]
- [Core identity statement 3]

### What [This] IS NOT

- [Boundary statement 1]
- [Boundary statement 2]
- [Boundary statement 3]

---

## Invariants

1. **[Rule name].** [Rule that must never be violated.]

2. **[Rule name].** [Another inviolable rule.]

3. **[Rule name].** [Third inviolable rule.]

---

## Principles (Prioritized)

1. **[Highest priority].** [Principle description.]

2. **[Second priority].** [Principle description.]

3. **[Third priority].** [Principle description.]

---

## Decision Heuristics

| Situation | Action |
|-----------|--------|
| When [X] | Do [Y] |
| When uncertain between [A] and [B] | Prefer [A] because [reason] |
| When [constraint] conflicts with [other constraint] | [Higher priority] wins |

---

## Out of Scope

Do not [action] in this [scope]:

- [Thing that belongs elsewhere]
- [Another thing that belongs elsewhere]

---

## Verification Checklist

- [ ] Frontmatter present with all required fields
- [ ] Frontmatter counts match actual content
- [ ] Identity boundaries are specific and testable
- [ ] Principles are numbered by priority
- [ ] No conflicts with parent scope constraints
```

---

## Philosophy Template

PHILOSOPHY.md files use this structure for philosophical/architectural reasoning.

```markdown
---
type: rationale
scope: [product|domain|feature|component|meta|methodology]
name: [kebab-case-name]
version: "1.0"
summary: [One-sentence description, max 200 chars]
token_estimate: [number]
decision_count: [number]
explains_invariants: [invariant-ids]
inherits_from: [parent-scope-names]
audience: [llm, human]
---

# [Scope Name] Philosophy

> Why [this] exists and the thinking behind its design.

---

## The Problem

[Describe the challenge this addresses. What pain exists without this solution?]

| Symptom | Cause |
|---------|-------|
| [Observable problem] | [Root cause] |
| [Another problem] | [Its cause] |

---

## The Bet

[What approach did we choose? What's the core insight? What's the central gamble we're making?]

---

## Design Decisions

### 1. [Decision Name]

[What we decided and why.]

**Rationale:** [The reasoning behind this choice.]

### 2. [Decision Name]

[What we decided and why.]

**Rationale:** [The reasoning behind this choice.]

---

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| [Choice we made] | [What we gained] | [What we sacrificed] |
| [Another choice] | [Its benefit] | [Its cost] |

---

## What This Is Not

- **Not [X]** — [why it's different from X]
- **Not [Y]** — [why it's different from Y]
```

---

## Rationale Template (General)

For technical rationale files (not PHILOSOPHY.md), use this flexible structure. Required sections: `## The Problem` and `## Trade-offs`. Middle sections (`## The Solution`, `## Design Decisions`, etc.) adapt to content.

```markdown
---
type: rationale
scope: [product|domain|feature|component|meta|methodology]
name: [kebab-case-name]
version: "1.0"
summary: [One-sentence description, max 200 chars]
token_estimate: [number]
inherits_from: [parent-scope-names]
audience: [llm, human]
---

# [Topic Name]

> [One-sentence description of what this explains.]

---

## The Problem

[What challenge or question does this address?]

---

## The Solution

[How does this design/approach solve it? Core technical decisions.]

---

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| [Choice we made] | [What we gained] | [What we sacrificed] |
```

**Note:** Some rationale files may use `## The Bet` instead of `## The Solution` when the approach is more speculative. Use whichever better fits the content's nature.

---

## Protocol Template

**Note:** The `## Recovery` section is recommended for all protocols, especially error-prone or complex ones. For simple protocols, it may be omitted if failure modes are trivial.

```markdown
---
type: procedures
scope: [product|domain|feature|component|meta|methodology]
name: [kebab-case-name]
version: "1.0"
summary: [One-sentence description, max 200 chars]
token_estimate: [number]
protocols_count: [number]
protocols:
  - id: [PROTO-SCOPE-N]
    name: [Protocol Name]
    steps: [number]
    automation_tier: [automated|semi-automated|manual]
    workflow: [workflow-name]   # only if automated
    tools: [tool-list]         # only if automated or semi-automated
    complexity: [high|medium|low]
inherits_from: [parent-scope-names]
audience: [llm, human, tooling]
---

# Protocol: [Task Name]

> [One-sentence description of what this protocol accomplishes.]

---

## Goal

[What successful completion of this protocol achieves.]

---

## Preconditions

Before starting, verify:

- [ ] [Condition that must be true]
- [ ] [Another required condition]
- [ ] [Third required condition]

---

## Steps

1. **[Step name].** [Exact action to take.]

2. **[Step name].** [Exact action to take.]

3. **[Step name].** [Exact action to take.]

   **Decision point:** If [condition], go to step [N]. Otherwise, continue.

4. **[Step name].** [Exact action to take.]

---

## Verification

After completion, confirm:

- [ ] [Observable outcome 1]
- [ ] [Observable outcome 2]
- [ ] [Observable outcome 3]

---

## Recovery

If something goes wrong:

| Failure | Recovery Action |
|---------|-----------------|
| [Failure mode 1] | [How to recover] |
| [Failure mode 2] | [How to recover] |
```

---

## Workflow Template

A workflow binds a protocol to LLM-executable steps. This template follows the universal contract from `three-layer-architecture.md`. Adapt the format to your agent technology (skill file, runbook, system prompt directive, etc.).

```markdown
---
name: [workflow-name]
protocol_id: [PROTO-SCOPE-N]              # ← References protocol (REQUIRED)
protocol_file: [path/to/PROTOCOLS.md]     # ← Protocol source (REQUIRED)
tools: [tool-list]                        # Tools orchestrated by this workflow
loads:                                    # Organon files to load before execution
  - [/ETHOS.md]
  - [path/to/domain/ETHOS.md]
---

# Workflow: [Task Name]

> Implements [PROTO-SCOPE-N] from `[path/to/PROTOCOLS.md]`.

## Context Loading

1. Load product organons:
   - Read `/ETHOS.md`, `/PHILOSOPHY.md`
2. Load domain organons:
   - Read `[domain/ETHOS.md]`
3. Load protocol-specific context:
   - Run `[context-tool]`

## Steps

1. **[Step name].** [What the agent does — which tool to invoke, what to check.]

2. **[Step name].** [Next action.]

   **Decision point:** If [condition], [action A]. Otherwise, [action B].

3. **[Step name].** [Next action.]

## Verification

Run verification tools:
- `[verify-tool]` — check [what it checks]
- `[validate-tool]` — check [what it checks]

If any gate fails, fix the issue and re-run verification.

## Error Recovery

| Failure | Recovery Action |
|---------|-----------------|
| [Tool fails] | [How to recover] |
| [Verification fails] | [How to recover] |
```

**Adapting to your agent technology:**

| Mechanism | How to adapt |
|-----------|--------------|
| Claude Code skill | Add `invocation:` and `user-invocable:` to frontmatter, place in `.claude/skills/<name>/skill.md` |
| System prompt directive | Embed key steps directly in `CLAUDE.md` or `.cursorrules`, reference protocol by link |
| Runbook | Place in `organon/workflows/`, agent reads as context when the protocol is triggered |
| CI/CD pipeline | Translate steps to pipeline stages, tools become job commands |
| Git hook | Translate verification steps to hook script, triggered automatically |

---

## README Router Template

```markdown
---
type: navigation
scope: [scope]
name: [directory-name]
version: "1.0"
summary: Navigation for [directory-name] — [brief description]
token_estimate: [number]
provides: [list of what this directory contains]
parent: [parent-directory-name]
---

# [Directory Name]

[One-sentence purpose of this directory.]

## Contents

| Path | Type | Description |
|------|------|-------------|
| [ETHOS.md](./ETHOS.md) | constraints | [What it constrains] |
| [PHILOSOPHY.md](./PHILOSOPHY.md) | rationale | [What it explains] |
| [child-dir/](./child-dir/) | [scope] | [What it covers] |
```

---

## Mapping Template (Code-to-Organon)

For projects with code modules, create a `components.md` file that maps code locations to organon directories. See patterns.md (Code Mapping Pattern) for full details.

```markdown
---
type: mapping
scope: [product]
name: components
version: "1.0"
summary: Maps codebase modules to organon components — bidirectional navigation between code and constraints
token_estimate: [number]
file_count: [number of code modules]
last_generated: [YYYY-MM-DD]
inherits_from: []
audience: [llm, human, tooling]
---

# Component Mapping

> Maps codebase modules to their organon documentation.

## By Code Module

| Code Path | Organon Path | Purpose |
|-----------|--------------|---------|
| `src/core/` | [organon/components/core/](./organon/components/core/) | Type system and core abstractions |
| `src/runtime/` | [organon/components/runtime/](./organon/components/runtime/) | Execution engine |
| `src/compiler/` | [organon/components/compiler/](./organon/components/compiler/) | DSL parser and compiler |

## By Organon Component

| Organon Path | Code Paths | Key Files |
|--------------|------------|-----------|
| [organon/components/core/](./organon/components/core/) | `src/core/**/*` | `Type.scala`, `Value.scala` |
| [organon/components/runtime/](./organon/components/runtime/) | `src/runtime/**/*` | `Runtime.scala`, `Executor.scala` |
```

---

## Minimal Ethos (Smallest Valid Organon)

The absolute minimum for a valid organon. Use when bootstrapping — expand as the scope matures.

```markdown
---
type: constraints
scope: [scope]
name: [kebab-case-name]
version: "1.0"
summary: [One-sentence, max 200 chars]
token_estimate: 300
invariants_count: 1
principles_count: 1
heuristics_count: 1
inherits_from: [parent]
load_priority: [priority]
audience: [llm]
---

# [Scope] Ethos

## Identity

- **IS:** [one-line description]
- **IS NOT:** [one-line boundary]

## Invariants

1. **[Most critical rule].** [Description.]

## Principles

1. **[Most important principle].** [Description.]

## Decision Heuristics

| Situation | Action |
|-----------|--------|
| When uncertain | [default action] |
```

---

## Feature Organon Example

A concrete example showing all patterns applied — frontmatter, standardized sections, identity boundaries, prioritized principles, and heuristics.

```markdown
---
type: constraints
scope: feature
name: caching
version: "1.0"
summary: Behavioral constraints for the caching feature — resilience option that stores module results for reuse
token_estimate: 800
invariants_count: 3
principles_count: 2
heuristics_count: 3
inherits_from: [product]
related_domains: [runtime, compiler]
related_features: [resilience, performance]
load_priority: medium
required_for:
  - cache_implementation
  - cache_configuration
audience: [llm, human]
---

# Caching Ethos

> Behavioral constraints for the caching feature.

---

## Identity

- **IS:** A resilience option that stores module results for reuse
- **IS NOT:** A distributed cache, persistence layer, or session store

---

## Invariants

1. **Cache keys include all inputs.** Two calls with different inputs must not share a cache entry.

2. **TTL is required.** No infinite caching. Maximum TTL is 24 hours.

3. **Cache misses execute normally.** Caching is optimization, not correctness.

---

## Principles (Prioritized)

1. **Correctness over performance.** Never serve stale data that could cause incorrect behavior.

2. **Explicit over implicit.** Cache behavior must be declared in pipeline, never automatic.

---

## Decision Heuristics

| Situation | Action |
|-----------|--------|
| When unsure about TTL | Use 5 minutes |
| When cache backend is unspecified | Use in-memory |
| When cache fails | Execute without cache (don't fail the request) |

---

## Verification Checklist

Structural checks (always required):
- [ ] Frontmatter present with all required fields
- [ ] Frontmatter counts match actual content (3 invariants, 2 principles, 3 heuristics)
- [ ] Identity boundaries are specific and testable
- [ ] Principles are numbered by priority
- [ ] No conflicts with parent scope constraints

Feature-specific checks (caching invariants):
- [ ] Cache keys are deterministic and include all inputs
- [ ] TTL is set and ≤ 24 hours
- [ ] Cache miss path works identically to non-cached path
```

---

## Observation Template

Observations capture empirical learnings from work sessions. They live in `organon/observations/` and use `type: rationale` (no new artifact type — observations are empirical rationale). The `status` field tracks lifecycle maturity: signal → pattern → actionable → resolved.

```markdown
---
type: rationale
scope: [product|domain|feature|methodology]
name: [descriptive-name]
version: "1.0"
summary: [One-sentence description of what was observed]
token_estimate: [estimate]
status: signal
created: [YYYY-MM-DD]
author: [author-name]
audience: [llm, human]
---

# Observation NNN: [Descriptive Title]

> [One-sentence summary of the key learning]

---

## Context

[What work was being done when this was observed? What prompted the observation?]

## Observations

### O1: [First observation title]

- **Signal:** [What was noticed]
- **Implication:** [Why it matters]
- **Suggested Action:** [What could be done about it]

### O2: [Second observation title]

- **Signal:** [What was noticed]
- **Implication:** [Why it matters]
- **Suggested Action:** [What could be done about it]

## Patterns to Watch

- [Pattern that may emerge if this recurs]
- [Related area to monitor]
```

**Status lifecycle:**

| Status | Meaning | Next step |
|--------|---------|-----------|
| `signal` | Noticed once, may not recur | Watch for recurrence |
| `pattern` | Confirmed across multiple sessions | Investigate root cause |
| `actionable` | Root cause understood, clear fix | Create RFC or heuristic |
| `resolved` | Graduated into methodology | Link to resulting change |

---

## RFC Template

RFCs support progressive disclosure for two audiences: **reviewers** read end-to-end during the review phase; **implementer agents** load targeted sections during implementation. The `status` frontmatter field is the first filter — agents skip `implemented` or `withdrawn` RFCs without loading content.

**Implementer reading path:** Frontmatter → Status → Proposed Solution → Organon Impact → Technical Implementation → Open Questions (still open only).

See `frontmatter-system.md` for the full RFC section contract.

```markdown
---
type: rationale
scope: product
name: [feature-name]
version: "1.0"
summary: [One-sentence description of what this RFC proposes]
token_estimate: [estimate]
status: draft
created: [YYYY-MM-DD]
author: [author-name]
related_files:
  - ../organon/domains/tools/ETHOS.md
  - ../book-llms/[relevant-file].md
load_priority: high
audience: [llm, human]
---

# RFC NNN: [Feature Name]

> [One-sentence pitch — what problem does this solve?]

---

## Status

**Current State:** Draft

**Next Milestone:** Review and team approval

| Transition | Date | Notes |
|------------|------|-------|
| → Draft | [YYYY-MM-DD] | Initial RFC created |

---

## Problem Statement

**[Describe the problem from the organon's perspective]**

Why does the organon need to evolve? What gap exists in current constraints?

**Current state:** [What organon structure exists today?]

**Desired state:** [What organon structure is needed?]

---

## Proposed Solution

**High-level approach** (both organon + code):

1. Create/update domain organon that defines [X]
2. Implement code following those constraints
3. [Additional steps]

---

## Organon Impact

> This RFC proposes specific changes to organon files. Details what those files will contain.

### Create

**`[path/to/new/ETHOS.md]`** ← Core domain/feature definition

This file defines [domain/feature] identity and constraints:

```markdown
## Identity

### What This [Domain/Feature] IS
- [Identity statement 1]
- [Identity statement 2]

### What This [Domain/Feature] IS NOT
- [Boundary 1]
- [Boundary 2]

## Invariants

1. **INV-[SCOPE]-1: [name]**
   - [Invariant text]
   - Enforced by: [mechanism]

2. **INV-[SCOPE]-2: [name]**
   - [Invariant text]
   - Enforced by: [mechanism]

## Principles (Prioritized)

1. **[Principle 1]** - [Description]
2. **[Principle 2]** - [Description]

## Decision Heuristics

| Situation | Action |
|-----------|--------|
| [Scenario 1] | [Response 1] |
| [Scenario 2] | [Response 2] |
\```

**`[path/to/new/PHILOSOPHY.md]`** ← Design rationale

This file explains WHY the [domain/feature] is designed this way:

```markdown
## The Problem

[Detailed problem description]

## The Bet

**Bet:** [What assumption are we making?]

**Why this works:** [Evidence/reasoning]

**What must be true:** [Prerequisites for success]

## Trade-offs

### [Trade-off 1]
**Choice:** [Decision made]
**Benefit:** [Upside]
**Cost:** [Downside]
**Why we chose [X]:** [Rationale]

### [Trade-off 2]
...
\```

**Implementation code** (consequence of domain definition):
- `[path/to/implementation/]` - [Brief description]

### Update

**`[path/to/existing/file.md]`**
- [Specific change 1: e.g., "Add invariant INV-X-N: description"]
- [Specific change 2]

### Delete

[List files to delete, or "None"]

---

## Technical Implementation

> This section describes how code will implement the domain constraints defined above.

### Architecture

**Package Structure:**
```
[Show directory tree with key files]
```

**Core Abstractions:**
```typescript
// Show key types/interfaces
```

**Implements domain invariants:**
- [INV-X-1]: [How code enforces this]
- [INV-X-2]: [How code enforces this]

---

### API Design

```typescript
// Show public API signatures
function exampleFunction(options: Options): Promise<Result>

interface Options {
  // ...
}
```

---

### Implementation Plan

**Phase 1: [Name] (Weeks X-Y)**

**Week X: [Milestone]**
- [ ] [Task 1]
- [ ] [Task 2]

**Week Y: [Milestone]**
- [ ] [Task 3]
- [ ] [Task 4]

**Deliverable:** [What ships in Phase 1]

---

**Phase 2: [Name] (Weeks A-B)**
- [ ] [Task 5]
- [ ] [Task 6]

**Deliverable:** [What ships in Phase 2]

---

### Design Decisions (Technical)

These decisions implement the domain principles:

**Decision 1: [Name]**
- **Implements:** [Which principle/invariant]
- **Technical benefit:** [Why this is good technically]
- **Trade-off:** [What we're giving up]
- **Why we chose [X]:** [Rationale]

**Decision 2: [Name]**
...

---

## Success Metrics

- [ ] **[Metric 1]** - [Measurable outcome]
- [ ] **[Metric 2]** - [Measurable outcome]
- [ ] **[Metric 3]** - [Measurable outcome]

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk 1] | [High/Med/Low] | [How to address] |
| [Risk 2] | [High/Med/Low] | [How to address] |

---

## Open Questions

### Resolved (Pre-RFC)
1. ✅ **[Question 1]** → [Decision]
2. ✅ **[Question 2]** → [Decision]

### Still Open
1. **[Question 3]** - [Description]
   - **Recommendation:** [Suggestion]

---

## Dependencies

**Blocks:**
- [What can't happen until this is done?]

**Blocked by:**
- [What must happen first?]

**Related work:**
- [Parallel efforts]

---

## Related Files

| File | Relationship |
|------|--------------|
| [[path/to/file.md](path/to/file.md)] | [How this RFC relates to that file] |

---

## Approval Process

**Review criteria:**
- [ ] Organon impact is clear and complete
- [ ] Technical implementation is detailed and feasible
- [ ] Success metrics are measurable
- [ ] Risks have mitigations

**Reviewers:**
- [ ] @[role-1]
- [ ] @[role-2]

**Timeline:**
- Draft complete: [YYYY-MM-DD]
- Review period: [duration]
- Target acceptance: [YYYY-MM-DD]
- Implementation start: [YYYY-MM-DD]
- Delivery: [YYYY-MM-DD]

---

## Next Steps

1. [First action]
2. [Second action]
3. [Third action]

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| [YYYY-MM-DD] | Initial draft | [author] |
```

**Key requirements:**
- **Organon Impact:** Show exact content of new/updated organon files (invariants, principles, identity)
- **Technical Implementation:** Include architecture, API, and phased plan. Decompose work into phases that can be independently verified — each phase should end with a verification step (run gates, check health). Leave planning tool choice to the implementer (GitHub issues, task lists, plain checklists — the methodology doesn't prescribe project management tooling).
- **Both sections required:** RFCs propose evolution of both organon and code

See [patterns.md (RFC-Driven Evolution Pattern)](./patterns.md#rfc-driven-evolution-pattern) for lifecycle and principles.

---

## Frontmatter Quick Reference

Required fields for every organon file:

| Field | Type | Description |
|-------|------|-------------|
| `type` | enum | `navigation`, `constraints`, `rationale`, `procedures`, `mapping` |
| `scope` | enum | `product`, `domain`, `feature`, `component`, `meta`, `methodology` |
| `name` | string | Kebab-case identifier matching directory name |
| `version` | string | Semantic version `"X.Y"` |
| `summary` | string | One-sentence description, max 200 chars |
| `token_estimate` | number | Approximate full file token count — accuracy matters for the load-or-skip decision (use ~12 tokens/line or ~3.5 chars/token as heuristic; update when estimate would mislead budget planning) |

See `frontmatter-system.md` for the complete schema including type-specific and relationship fields.

---

## Related Files

| File | Relationship |
|------|--------------|
| [overview.md](./overview.md) | High-level methodology overview |
| [ETHOS.md](./ETHOS.md) | Template structure requirements |
| [patterns.md](./patterns.md) | Patterns these templates implement |
| [frontmatter-system.md](./frontmatter-system.md) | Complete frontmatter schema |
| [three-layer-architecture.md](./three-layer-architecture.md) | Workflow template architecture |
| [invariant-tracking.md](./invariant-tracking.md) | Invariant reference format |
