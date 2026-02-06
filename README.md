# The Organon

> A methodology for LLM-human collaboration on complex systems.

---

## What is an Organon?

An **Organon** is the complete guidance system for a project or domain. It consists of three artifacts:

| Artifact | Question | Character | Audience |
|----------|----------|-----------|----------|
| **Philosophy** | Why do we do it this way? | Explanatory | Humans understanding the system |
| **Ethos** | What should we do and not do? | Normative | LLMs (and humans) behaving in the system |
| **Protocol** | How do we accomplish this task? | Procedural | Agents executing specific tasks |

The term comes from Aristotle's *Organon* — his collection of works on logic and reasoning. An organon is an **instrument for correct thinking and acting**.

---

## Why This Matters

When humans collaborate with LLMs on complex systems, behavioral consistency becomes critical. An LLM working on a codebase today should make decisions compatible with the LLM (or human) who worked on it yesterday.

Without an organon, LLMs:
- Make locally reasonable but globally inconsistent decisions
- Reinvent approaches that contradict established patterns
- Drift from the system's intended character over time
- Waste tokens rediscovering context that should be given

An organon encodes the "taste" and "judgment" that would otherwise require human supervision at every decision point.

---

## Contents

| Chapter | Description |
|---------|-------------|
| [01-terminology.md](./01-terminology.md) | Definitions of philosophy, ethos, protocol |
| [02-documentation-layers.md](./02-documentation-layers.md) | The three-layer documentation model |
| [03-artifact-scopes.md](./03-artifact-scopes.md) | How organon artifacts apply at different project levels |

---

## Quick Reference

### Philosophy

**Purpose:** Explain *why* decisions were made.

```markdown
# Feature X Philosophy

## The Problem
What challenge does this feature address?

## The Bet
What approach did we choose and why?

## Trade-offs
What did we sacrifice for what we gained?
```

### Ethos

**Purpose:** Constrain *what* should and shouldn't be done.

```markdown
# Feature X Ethos

## Identity
- **IS:** What this feature is
- **IS NOT:** What this feature is not

## Invariants
1. Rule that must never be violated
2. Another inviolable rule

## Decision Heuristics
- When X, do Y
- When uncertain, prefer Z
```

### Protocol

**Purpose:** Specify *how* to accomplish specific tasks.

```markdown
# Protocol: Task Name

## Goal
What this protocol accomplishes.

## Preconditions
- What must be true before starting

## Steps
1. First step
2. Second step
3. Third step

## Verification
How to confirm success.
```

---

## Applying an Organon

An organon can exist at multiple scopes within a project:

```
Project Organon (repo root)
    ├── Documentation Organon (docs/)
    │   ├── Feature Organon (docs/features/X/)
    │   └── Feature Organon (docs/features/Y/)
    └── Source Organon (src/)
        └── Component Organon (src/components/Z/)
```

Each level inherits from its parent and adds domain-specific guidance.

See [03-artifact-scopes.md](./03-artifact-scopes.md) for details.

---

## This Book

This repository is itself an organon — a methodology for creating organons. It's framework-agnostic and can be applied to any project where LLMs collaborate with humans.

**Not project-specific:** This methodology applies to any codebase, not just one project.

**Portable:** Copy these patterns to your own projects.

**Evolving:** This is a living document, refined through practice.
