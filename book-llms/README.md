---
type: navigation
scope: meta
name: book-llms
version: "1.1"
summary: Navigation for the Organon technical reference — methodology spec optimized for LLM consumption
token_estimate: 850
provides: [overview, ethos, philosophy, patterns, scopes, templates, frontmatter-system, three-layer-architecture, invariant-tracking, workflow-authoring, protocols]
parent: organon-root
---

# Organon Book for LLMs

Technical reference for the Organon Methodology, optimized for LLM consumption.

## Core Concepts

Organon is a documentation methodology built on six pillars:
1. **LLM-centric design** — organons are written for LLM consumption first; LLMs execute, humans author and review
2. **Enforcement through automation** — protocols bind to workflows that orchestrate tools that verify constraints (Define → Bind → Execute → Verify → Compound → Evolve)
3. **Recursive improvement by design** — the methodology improves itself through iteration. Each cycle generates learnings that feed into the next cycle. Improvements compound exponentially. Compounding is an emergent property of recursive structure, not a separate goal.
4. **Progressive disclosure** — agents access files in 5 layers (README → frontmatter → section headings → specific sections → full file), never paying for content they don't need. See frontmatter-system.md for the complete model.
5. **Three-layer architecture** — protocols (knowledge) → workflows (agent bindings) → tools (operations)
6. **Code as single source of truth** — documentation derives from code, never prescribes it

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
| [three-layer-architecture.md](./three-layer-architecture.md) | rationale | Protocols → Workflows → Tools enforcement loop — includes tiered testing, verification gates, drift detection, and epistemic categories for knowledge interoperability |
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