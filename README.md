# Organon Methodology

**A documentation system that treats code as the single source of truth and uses auto-generation to prevent drift.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

---

## What is Organon?

**Organon** (from Greek ὄργανον, "tool" or "instrument") is a methodology for keeping architectural documentation synchronized with code through:

### Core Principles

1. **Code as Single Source of Truth**
   - Code structure IS the metadata
   - Documentation DESCRIBES code, never prescribes it
   - When code changes, regenerate docs (not vice versa)

2. **Auto-Generation Over Manual Maintenance**
   - Components are generated from code structure
   - Eliminates drift (docs always match reality)
   - Scales to large codebases (100+ domains)

3. **Dual Mapping for Flexible Navigation**
   - Navigate by **layer** (domain → application → transport)
   - Navigate by **feature** (cross-cutting concerns)
   - Both views generated automatically

4. **Verification Gates Ensure Freshness**
   - Automated checks: file refs, RFC refs, event refs, staleness
   - CI fails if docs >24 hours stale after code changes
   - Fail visible: red warnings, blocked PRs

### The Problem It Solves

Traditional documentation fails because:
- ❌ Manual updates lag behind code changes
- ❌ Developers forget to update docs
- ❌ Documentation becomes aspirational fiction
- ❌ No automated freshness checks
- ❌ Single navigation paradigm (layer OR feature, not both)

Organon fixes this by:
- ✅ Auto-generating docs from code structure
- ✅ Making staleness a CI failure
- ✅ Treating code as ground truth
- ✅ Providing dual mapping (layer + feature)
- ✅ Fast cross-domain discovery (<1s searches)

---

## Repository Structure

This repository contains three resources for implementing Organon:

```
ethos/
├── book-llms/          # Technical reference for LLMs and developers
│   ├── ETHOS.md        # Immutable invariants
│   ├── PHILOSOPHY.md   # Design decisions and trade-offs
│   ├── patterns.md     # Common patterns and anti-patterns
│   ├── scopes.md       # Scope hierarchy (product → domain → feature)
│   ├── templates.md    # Templates for ETHOS/PHILOSOPHY/PROTOCOLS
│   └── protocols/      # Operational procedures
│
├── book-humans/        # Narrative guide (planned)
│   └── README.md       # Coming soon
│
└── packages/           # Publishable npm packages
    ├── tools/          # @organon/tools — CLI + MCP server
    │   ├── src/
    │   └── README.md
    └── testing/        # @organon/testing — invariant test library
        ├── src/
        └── README.md
```

### 1. book-llms/ — Technical Reference

**Audience:** LLMs (Claude, GPT-4) and developers who want technical depth

**Content:**
- Invariants: Immutable constraints that must hold
- Patterns: Common implementation patterns
- Templates: Copy-paste-modify templates for new organons
- Protocols: Step-by-step operational procedures

**Use Case:** Load into LLM context when implementing Organon in a new codebase

**Token Budget:** ~14,000 tokens (core content)

[Read the LLM book →](./book-llms/)

### 2. book-humans/ — Narrative Guide (Planned)

**Audience:** All developers, especially those new to Organon

**Content (Planned):**
- **Chapter 1:** The documentation drift problem
- **Chapter 2:** The Organon solution
- **Chapter 3:** Getting started tutorial
- **Chapter 4:** Advanced patterns
- **Chapter 5:** Case study (Agent Tavern)

**Status:** 🚧 Outline phase, Q1 2026

[Learn more →](./book-humans/)

### 3. packages/ — CLI Tools & Libraries

**Audience:** Developers using Organon in their codebase

**Commands:**
```bash
# Auto-generate components.md from codebase
organon generate --all

# Verify organon integrity (4 gates)
organon verify

# Cross-domain discovery
organon find --file=MyFile.ts
organon find --feature=auth
organon find --domain=api
```

**Status:** 🚧 Scaffolding complete, migrating from Agent Tavern

**Future:** MCP server for IDE integration (LSP-like features)

[Explore packages →](./packages/)

---

## Quick Start

### For LLMs Implementing Organon

Load the technical reference into context:

```bash
# Read core methodology
cat book-llms/ETHOS.md        # Invariants
cat book-llms/patterns.md     # Common patterns
cat book-llms/templates.md    # Templates

# Use tools to bootstrap
cd your-project
npx @organon/tools generate --all
npx @organon/tools verify
```

### For Human Developers

1. **Read the reference implementation:** [Agent Tavern](https://github.com/VledicFranco/agent-tavern)
2. **Explore the organon hierarchy:** `agent-tavern/organon/`
3. **Install tools:** `npm install @organon/tools`
4. **Generate your first organon:** `organon generate --all`

---

## Reference Implementation

**[Agent Tavern](https://github.com/VledicFranco/agent-tavern)** is the canonical Organon implementation.

### Organon Hierarchy

```
agent-tavern/organon/
├── README.md                # Navigation guide
├── ETHOS.md                # Product-level invariants
├── PHILOSOPHY.md           # Product-level design decisions
│
├── domains/                # Business domains
│   ├── genesis/           # AI orchestrator
│   │   ├── ETHOS.md
│   │   ├── PHILOSOPHY.md
│   │   └── components.md  # Auto-generated (dual mapping)
│   ├── agents/            # Agent lifecycle
│   ├── quests/            # Work item state machines
│   └── ...
│
├── features/              # Cross-cutting concerns
│   ├── tool-registry/     # Genesis tools with trust tiers
│   ├── context-management/ # Token budgets, summarization
│   ├── agent-communication/ # Reports, signals
│   └── ...
│
└── methodology/           # Meta-level (how we build)
    ├── architecture/      # Domain structure patterns
    ├── coding/            # Generic development workflow
    ├── discoverability/   # Cross-domain search
    ├── maintenance/       # Auto-generation, drift detection
    ├── rfcs/              # RFC lifecycle
    └── testing/           # 4-tier testing strategy
```

### Key Features

- **30+ domain organons** (genesis, agents, quests, epics, protocols, containers, etc.)
- **12+ feature organons** (tool-registry, context-management, agent-communication, etc.)
- **8 methodology organons** (architecture, coding, discoverability, maintenance, etc.)
- **Auto-generated components.md** for all domains (dual mapping)
- **CI verification** (4 gates, fails on staleness >24 hours)
- **YAML frontmatter** for metadata (token estimates, load priority, audience)

---

## Contributing

We welcome contributions to:
- **book-llms/** — Patterns, templates, examples
- **book-humans/** — Narrative chapters, tutorials
- **packages/** — CLI features, MCP server, testing library

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/new-pattern`)
3. **Make your changes** (follow existing patterns)
4. **Test locally** (if changing packages/)
5. **Submit a PR** with clear description

---

## License

MIT © Organon Methodology Contributors

---

## See Also

- **[Agent Tavern](https://github.com/VledicFranco/agent-tavern)** — Reference implementation
- **[RFC 027](https://github.com/VledicFranco/agent-tavern/blob/master/rfcs/027-organon-maintenance-tooling.md)** — Tooling design
- **[RFC 028](https://github.com/VledicFranco/agent-tavern/blob/master/rfcs/028-comprehensive-testing-strategy.md)** — Testing strategy
- **[RFC 029](https://github.com/VledicFranco/agent-tavern/blob/master/rfcs/029-path-to-self-improvement.md)** — Methodology evolution

---

**⚙️ Built with code as truth, documented with Organon.**
