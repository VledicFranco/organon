---
type: rationale
scope: meta
name: templates
version: "3.0"
summary: Copy-paste templates for ETHOS, PHILOSOPHY, PROTOCOL, and WORKFLOW files — all with frontmatter and standardized sections
token_estimate: 3381
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

[What approach did we choose? What's the core insight?]

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

## Protocol Template

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
context:                                  # Organon files to load before execution
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

- [ ] Frontmatter counts match (3 invariants, 2 principles, 3 heuristics)
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
| `token_estimate` | number | Approximate full file token count |

See `frontmatter-system.md` for the complete schema including type-specific and relationship fields.
