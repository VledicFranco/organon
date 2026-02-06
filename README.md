# The Organon

> The meta-organon: guidance for creating guidance systems in human-machine collaborative projects.

---

## Definition

An **organon** is a complete guidance system for a project or domain. It encodes taste, judgment, and behavioral constraints that enable any agent (human or LLM) to make decisions aligned with the system's character.

| Artifact | Question | Character | File |
|----------|----------|-----------|------|
| **Philosophy** | Why? | Explanatory | `PHILOSOPHY.md` |
| **Ethos** | What? | Normative | `ETHOS.md` |
| **Protocol** | How? | Procedural | `PROTOCOL.md` or `protocols/*.md` |

**Etymology:** From Aristotle's *Organon* (Greek: ὄργανον, "instrument") — tools for correct reasoning.

---

## When to Create an Organon

| Signal | Action |
|--------|--------|
| Multiple agents (human or LLM) work on the same system | Create organon |
| Decisions require "taste" or "judgment" | Create organon |
| Behavioral consistency matters more than local optimization | Create organon |
| Onboarding should transfer character, not just knowledge | Create organon |
| Single person, simple project, no LLM collaboration | Skip organon |

---

## Contents

| Document | Purpose |
|----------|---------|
| [PHILOSOPHY.md](./PHILOSOPHY.md) | Why this methodology exists |
| [ETHOS.md](./ETHOS.md) | Constraints for creating organons |
| [templates.md](./templates.md) | Copy-paste templates for each artifact |
| [scopes.md](./scopes.md) | Hierarchical organons (product → domain → feature) |
| [patterns.md](./patterns.md) | Documentation layers, inheritance, common structures |
| [protocols/](./protocols/) | Specific procedures for common tasks |

## Protocols

| Protocol | Purpose |
|----------|---------|
| [semantic-mapping.md](./protocols/semantic-mapping.md) | Connect generated catalogs to organon meaning |

---

## Quick Reference

### Creating an Organon

```
1. Identify the scope (product, domain, feature, component)
2. Write ETHOS.md first (most critical for LLM behavior)
3. Write PHILOSOPHY.md (explains reasoning to humans)
4. Write protocols as needed (specific repeatable tasks)
```

### Ethos Structure (Critical)

```markdown
# [Scope] Ethos

## Identity
- **IS:** [what this is]
- **IS NOT:** [what this is not]

## Invariants
1. [rule that must never be violated]
2. [another inviolable rule]

## Principles (Prioritized)
1. [highest priority principle]
2. [second priority principle]

## Decision Heuristics
- When [situation], do [action]
- When uncertain, prefer [default]

## Out of Scope
- [explicitly not our concern]
```

### Philosophy Structure

```markdown
# [Scope] Philosophy

## The Problem
[What challenge does this address?]

## The Bet
[What approach did we choose?]

## Trade-offs
| Decision | Benefit | Cost |
|----------|---------|------|
| [choice] | [gain]  | [loss] |
```

### Protocol Structure

```markdown
# Protocol: [Task Name]

## Goal
[What this accomplishes]

## Preconditions
- [what must be true before starting]

## Steps
1. [first step]
2. [second step]

## Verification
[how to confirm success]
```

---

## For LLMs

**Reading organons:**
1. Always read ETHOS.md first — it constrains your behavior
2. Read PHILOSOPHY.md for context when decisions seem arbitrary
3. Follow protocols literally when they exist

**Creating organons:**
1. See [ETHOS.md](./ETHOS.md) for constraints on writing organons
2. See [templates.md](./templates.md) for copy-paste starting points
3. Prioritize token efficiency — ethos docs are injected repeatedly

**Navigation in projects with organons:**
```
Product ethos (repo root) → Domain ethos (docs/, src/) → Feature ethos (features/X/)
```

Each level inherits from parent. Child scopes add constraints, never contradict.
