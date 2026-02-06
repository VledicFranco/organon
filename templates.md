# Organon Templates

> Copy-paste starting points for each artifact.

---

## Ethos Template

```markdown
# [Project/Domain/Feature] Ethos

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

4. **[Fourth priority].** [Principle description.]

5. **[Fifth priority].** [Principle description.]

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
```

---

## Philosophy Template

```markdown
# [Project/Domain/Feature] Philosophy

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

[Optional: diagram or key concept illustration]

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

5. **[Step name].** [Exact action to take.]

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

## Minimal Ethos (Smallest Valid Organon)

```markdown
# [Scope] Ethos

## Identity

- **IS:** [one-line description]
- **IS NOT:** [one-line boundary]

## Invariants

1. [Most critical rule]

## Principles

1. [Most important principle]

## Heuristics

- When uncertain, [default action]
```

---

## Feature Organon Example

```markdown
# Caching Ethos

## Identity

- **IS:** A resilience option that stores module results for reuse
- **IS NOT:** A distributed cache, persistence layer, or session store

## Invariants

1. **Cache keys include all inputs.** Two calls with different inputs must not share a cache entry.

2. **TTL is required.** No infinite caching. Maximum TTL is 24 hours.

3. **Cache misses execute normally.** Caching is optimization, not correctness.

## Principles

1. **Correctness over performance.** Never serve stale data that could cause incorrect behavior.

2. **Explicit over implicit.** Cache behavior must be declared in pipeline, never automatic.

## Heuristics

- When unsure about TTL, use 5 minutes
- When cache backend is unspecified, use in-memory
- When cache fails, execute without cache (don't fail the request)
```
