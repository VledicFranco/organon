---
type: navigation
scope: meta
name: book-llms
version: "3.0"
summary: Navigation for the Organon technical reference — methodology spec optimized for LLM consumption
token_estimate: 250
provides: [ethos, philosophy, patterns, scopes, templates, frontmatter-system, three-layer-architecture, protocols]
parent: organon-root
---

# Organon Book for LLMs

Technical reference for the Organon Methodology, optimized for LLM consumption.

## Core Concepts

Organon is a documentation methodology built on three pillars:
1. **Code as single source of truth** — documentation derives from code, never prescribes it
2. **Progressive disclosure** — agents access files in layers (frontmatter → sections → full file), never paying for content they don't need
3. **Three-layer architecture** — protocols (knowledge) → workflows (agent bindings) → tools (operations)

## Contents

| Path | Type | Description |
|------|------|-------------|
| [ETHOS.md](./ETHOS.md) | constraints | Core invariants and principles — **read this first** |
| [PHILOSOPHY.md](./PHILOSOPHY.md) | rationale | Design decisions and trade-offs (why the methodology works this way) |
| [patterns.md](./patterns.md) | rationale | Common patterns: progressive disclosure, identity boundaries, section headings, and more |
| [scopes.md](./scopes.md) | rationale | Scope hierarchy (product → domain → feature → component) |
| [templates.md](./templates.md) | rationale | Copy-paste templates for ETHOS, PHILOSOPHY, PROTOCOL, WORKFLOW (all with frontmatter) |
| [frontmatter-system.md](./frontmatter-system.md) | rationale | YAML frontmatter specification — the mechanism for progressive disclosure |
| [three-layer-architecture.md](./three-layer-architecture.md) | rationale | Protocols → Workflows → Tools enforcement loop |
| [protocols/](./protocols/) | procedures | Operational procedures (semantic mapping, etc.) |

## Reading Order for LLMs

When implementing Organon in a new codebase:

1. **ETHOS.md** — Core rules. Understand invariants, principles, and the progressive disclosure model.
2. **patterns.md** — See how the rules manifest as concrete patterns.
3. **templates.md** — Get copy-paste scaffolds with frontmatter for each artifact type.
4. **frontmatter-system.md** — Deep dive on YAML frontmatter schema and validation.
5. **scopes.md** — Understand the scope hierarchy and inheritance rules.
6. **three-layer-architecture.md** — Bind protocols to executable workflows and tools.
7. **PHILOSOPHY.md** — Optional. Read when you need to understand *why* a decision was made.

## Audience

**Primary:** LLMs (Claude, GPT-4) implementing Organon in codebases

**Secondary:** Human developers who want technical depth

**For humans:** See [../book-humans/](../book-humans/) for narrative-focused introduction (planned)

## Reference Implementation

[Agent Tavern](https://github.com/VledicFranco/agent-tavern) is the canonical implementation with 49 organon files, 100% frontmatter coverage, and full three-layer architecture.
