---
type: navigation
scope: meta
name: book-llms
version: "3.0"
summary: Navigation for the Organon technical reference — methodology spec optimized for LLM consumption
token_estimate: 850
provides: [overview, ethos, philosophy, patterns, scopes, templates, frontmatter-system, three-layer-architecture, invariant-tracking, workflow-authoring, protocols]
parent: organon-root
---

# Organon Book for LLMs

Technical reference for the Organon Methodology, optimized for LLM consumption.

## Core Concepts

Organon is a documentation methodology built on five pillars:
1. **LLM-centric design** — organons are written for LLM consumption first; LLMs execute, humans author and review
2. **Enforcement through automation** — protocols bind to workflows that orchestrate tools that verify constraints (Define → Bind → Execute → Verify → Evolve)
3. **Progressive disclosure** — agents access files in 5 layers (README → frontmatter → section headings → specific sections → full file), never paying for content they don't need. See frontmatter-system.md for the complete model.
4. **Three-layer architecture** — protocols (knowledge) → workflows (agent bindings) → tools (operations)
5. **Code as single source of truth** — documentation derives from code, never prescribes it

## Contents

| Path | Type | Description |
|------|------|-------------|
| [overview.md](./overview.md) | rationale | What problems does this methodology solve? **Start here.** |
| [ETHOS.md](./ETHOS.md) | constraints | Core invariants and principles |
| [PHILOSOPHY.md](./PHILOSOPHY.md) | rationale | Design decisions and trade-offs (why the methodology works this way) |
| [patterns.md](./patterns.md) | rationale | Common patterns: progressive disclosure, enforcement loop, RFC-driven evolution, methodology scope, and more |
| [scopes.md](./scopes.md) | rationale | Scope hierarchy (product → domain → feature → component → methodology) |
| [templates.md](./templates.md) | rationale | Copy-paste templates for ETHOS, PHILOSOPHY, PROTOCOL, WORKFLOW (all with frontmatter) |
| [frontmatter-system.md](./frontmatter-system.md) | rationale | YAML frontmatter specification — the mechanism for progressive disclosure |
| [three-layer-architecture.md](./three-layer-architecture.md) | rationale | Protocols → Workflows → Tools enforcement loop — includes tiered testing, verification gates, drift detection |
| [invariant-tracking.md](./invariant-tracking.md) | rationale | Invariant-to-test tracking — stable IDs, test annotations, coverage reports |
| [workflow-authoring.md](./workflow-authoring.md) | rationale | Workflow authoring guidance — quality attributes, archetypes, error handling patterns |
| [protocols/](./protocols/) | procedures | Operational procedures (semantic mapping, etc.) |

## Reading Order for LLMs

When implementing Organon in a new codebase:

0. **overview.md** — What problems does this methodology solve? Start here.
1. **ETHOS.md** — Core rules. Understand invariants, principles, and the progressive disclosure model.
2. **patterns.md** — See how the rules manifest as concrete patterns.
3. **templates.md** — Get copy-paste scaffolds with frontmatter for each artifact type.
4. **frontmatter-system.md** — Deep dive on YAML frontmatter schema and validation.
5. **scopes.md** — Understand the scope hierarchy and inheritance rules.
6. **three-layer-architecture.md** — Bind protocols to executable workflows and tools.
7. **PHILOSOPHY.md** — Optional. Read when you need to understand *why* a decision was made.
8. **protocols/** — When you need specific procedures (e.g., semantic mapping). Load on-demand, not part of initial onboarding.

## Audience

**Primary:** LLMs (Claude, GPT-4) implementing Organon in codebases

**Secondary:** Human developers who want technical depth

**For humans:** See [../book-humans/](../book-humans/) for narrative-focused introduction (planned)

## Reference Implementation

[Agent Tavern](https://github.com/VledicFranco/agent-tavern) is the canonical implementation with 49 organon files, 100% frontmatter coverage, and full three-layer architecture.
