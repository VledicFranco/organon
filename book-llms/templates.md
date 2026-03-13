---
type: rationale
scope: meta
name: templates
version: "1.1"
summary: Copy-paste templates for ETHOS, PHILOSOPHY, PROTOCOL, README, and Mapping files — all with frontmatter and standardized sections
token_estimate: 3800
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
| [invariant-tracking.md](./invariant-tracking.md) | Invariant reference format |
