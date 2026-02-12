# What is Organon?

Organon is a documentation methodology that keeps architectural documentation synchronized with code. It's designed for LLM consumption first and human authoring second — LLMs read, execute, and enforce the documentation, while humans define constraints and review results.

This page covers the core concepts. For hands-on setup, see [Getting Started](./02-getting-started.md).

---

## Table of Contents

- [The Problem: Documentation Drift](#the-problem-documentation-drift)
- [Three Artifacts](#three-artifacts)
- [The Enforcement Loop](#the-enforcement-loop)
- [Progressive Disclosure](#progressive-disclosure)
- [Three-Layer Architecture](#three-layer-architecture)
- [Scope Hierarchy](#scope-hierarchy)
- [Key Terminology](#key-terminology)

---

## The Problem: Documentation Drift

Traditional documentation fails because it's disconnected from code:

- Developers change code but forget to update docs
- No automated checks catch stale documentation
- Over time, docs describe what the system *should* be, not what it *is*
- New team members read docs that mislead them about actual system behavior

The cost compounds: each outdated document erodes trust in all documentation, until teams stop reading docs entirely.

Organon solves this with three mechanisms: **structured artifacts** (not free-form prose), **automated verification** (not manual reviews), and an **enforcement loop** (not one-time documentation efforts).

---

## Three Artifacts

Every organon consists of up to three artifact types, each with a distinct purpose:

```
ETHOS.md          →  Constraints     "What must be true"
PHILOSOPHY.md     →  Rationale       "Why we chose this"
PROTOCOL.md       →  Procedures      "How to do it"
```

### ETHOS.md (Required)

The only required artifact. Defines behavioral constraints through four standardized sections:

| Section | Purpose | Example |
|---------|---------|---------|
| **Identity** (IS / IS NOT) | Boundary definitions | "IS a resilience option. IS NOT a distributed cache." |
| **Invariants** | Rules that must never be violated | "Cache TTL max 24 hours" |
| **Principles** (Prioritized) | Guidelines where lower number wins | "1. Safety over speed. 2. Explicit over implicit." |
| **Decision Heuristics** | Pre-computed answers for recurring situations | "When TTL unspecified, use 5 minutes" |

An organon without an ETHOS.md is not an organon.

### PHILOSOPHY.md (Optional)

Explains *why* decisions were made. Write one when trade-offs need documented reasoning.

| Section | Purpose |
|---------|---------|
| **The Problem** | What pain exists without this solution |
| **The Bet** | The core approach chosen |
| **Design Decisions** | Numbered decisions with rationale |
| **Trade-offs** | What was gained vs. sacrificed |

### PROTOCOL.md (Optional)

Step-by-step procedures for tasks that must be done the same way every time.

| Section | Purpose |
|---------|---------|
| **Goal** | What success looks like |
| **Preconditions** | What must be true before starting |
| **Steps** | Numbered actions |
| **Verification** | How to confirm completion |

---

## The Enforcement Loop

Documentation that isn't enforced becomes fiction. The enforcement loop makes organons real:

```
Define    →  Human encodes intent as organon constraints
    ↓
Bind      →  Workflow translates protocol into agent-executable steps
    ↓
Execute   →  LLM reads workflow, orchestrates tools
    ↓
Verify    →  Tools check organon compliance automatically
    ↓
Evolve    →  Results inform organon updates
    ↓
    └──── back to Define
```

**Without the loop:** organons are documentation. LLMs might follow them, might not.

**With the loop:** organons are enforced constraints. Violations are caught by tools, flagged by verification, and fed back. The methodology gets stronger each cycle.

---

## Progressive Disclosure

Organon files can be large (2,000-5,000+ tokens), but agents rarely need the whole file. Progressive disclosure lets agents access files in layers, paying only for what they need:

```
Layer 0: README-as-Router        ~50 tokens    "What files exist here?"
    ↓
Layer 1: Frontmatter             ~25-50 tokens "Should I load this file?"
    ↓
Layer 2: Section Headings        ~100 tokens   "What sections does it have?"
    ↓
Layer 3: Specific Section        variable      "Give me just ## Invariants"
    ↓
Layer 4: Full File               full cost     "Load everything"
```

**The key insight:** a project with 49 organon files (~112K total tokens) costs only ~2,500 tokens to discover via frontmatter scanning. An agent that needs only invariants from 3 files loads ~2,000 tokens instead of 112,000 — a 98% savings.

Every organon file starts with YAML frontmatter that enables this:

```yaml
---
type: constraints
scope: domain
name: caching
version: "1.0"
summary: Behavioral constraints for the caching feature
token_estimate: 800
---
```

This replaces hard line limits. Files can be any size — token efficiency comes from not loading what you don't need, not from keeping files small.

---

## Three-Layer Architecture

The enforcement loop works through three layers:

```
Layer 1: PROTOCOLS         "What must happen"      PROTOCOLS.md (universal)
    ↓
Layer 2: WORKFLOWS         "How to orchestrate"    Agent-specific bindings
    ↓
Layer 3: TOOLS             "How to execute"        CLI commands, scripts
```

**Protocols** are technology-agnostic procedures documented in PROTOCOLS.md files. They describe *what* must happen, not *which tool to run*.

**Workflows** are the binding layer — they translate protocols into agent-executable steps. Workflows are the only agent-specific layer. They can be Claude Code skills, Cursor rules, system prompt directives, runbooks, CI/CD pipelines, or any other discoverable mechanism.

**Tools** are atomic, idempotent operations. Each tool does one thing. Workflows compose tools into procedures.

Not every protocol needs a workflow:

| Tier | Criteria | Has Workflow? |
|------|----------|---------------|
| Automated | 5+ steps, cross-domain, error-prone, frequent | Yes |
| Semi-automated | 1-2 steps, single tool | No (tool only) |
| Manual | Requires human judgment | No |

---

## Scope Hierarchy

Organons apply at different levels. Constraints cascade downward — child scopes inherit from parents and can add (but never contradict) constraints:

```
Product (repo-wide)
    ↓
Domain (business bounded context)    or    Feature (cross-cutting capability)
    ↓
Component (implementation unit)
```

| Scope | Location | Example |
|-------|----------|---------|
| Product | Repo root | "Use conventional commits" |
| Domain | `organon/domains/billing/` | "Invoice amounts are never negative" |
| Feature | `organon/features/caching/` | "Cache TTL max 24 hours" |
| Component | `organon/components/parser/` | "Parser must not depend on runtime" |
| Methodology | `organon/methodology/rfcs/` | "RFCs require organon impact declaration" |

When an LLM starts work, it loads constraints in order: product first, then domain, then feature. By the time it begins, it has the full constraint hierarchy.

---

## Key Terminology

A few terms used throughout this documentation:

| Term | Meaning |
|------|---------|
| **Organon** | A guidance system (ETHOS + optional PHILOSOPHY + PROTOCOL) for a scope |
| **Invariant** | A rule in ETHOS.md that must never be violated |
| **Frontmatter** | YAML metadata at the top of every organon file |
| **Workflow** | The generic term for the agent binding layer (Layer 2) |
| **Gate** | An automated verification check (e.g., frontmatter truthfulness) |
| **Enforcement loop** | Define -> Bind -> Execute -> Verify -> Evolve |
| **Progressive disclosure** | Layered access to files (frontmatter -> sections -> full file) |

For a complete list, see the [Glossary](./07-glossary.md).

---

## Next Steps

- [Getting Started](./02-getting-started.md) — Install the CLI and create your first organon
- [Writing Organon Files](./04-writing-organon-files.md) — Detailed authoring guide
- [CLI Reference](./03-cli-reference.md) — All commands and options
