---
type: navigation
scope: product
name: organon
version: "1.1"
summary: Public-facing project overview — methodology repository with LLM reference, narrative guide, and CLI tooling
token_estimate: 3200
provides: [overview, quick-start, repository-structure, reference-implementation]
audience: [llm, human]
---

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

## Documentation

| Resource | Audience | Description |
|----------|----------|-------------|
| **[docs/](./docs/)** | Developers | Practical how-to guides, CLI reference, tutorials |
| **[book-llms/](./book-llms/)** | LLMs + advanced devs | Formal methodology specification |
| **[book-humans/](./book-humans/)** | All developers | Philosophical narrative guide (planned) |

New to Organon? Start with **[docs/](./docs/)** for practical guidance.

---

## Repository Structure

This repository contains three resources for implementing Organon:

```
organon/
├── docs/               # Developer documentation (how-to guides, tutorials)
│   ├── README.md       # Documentation router
│   └── 01-07 guides    # Concepts, getting started, CLI, authoring, testing
│
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
organon init [dir]              # Scaffold a new project
organon upgrade [dir]           # Detect and apply version updates
organon verify                  # Run all 6 verification gates
organon health                  # Project health score (0-100)
organon validate <file>         # Validate a single organon file
organon generate <file>         # Auto-generate frontmatter
organon find --name=<term>      # Find organon files by name
organon find --scope=<scope>    # Find by scope (domain, feature, etc.)
```

**Status:** v0.3.0 — init, upgrade, verify, health, validate, generate, find, query, coverage

[Explore packages →](./packages/)

---

## Setting Up Organon in a Project

> **For AI assistants:** Follow these steps when a user asks you to set up the Organon methodology in their project. This is the canonical bootstrap procedure.

### Step 1: Install the CLI

Clone this repository and build the tools:

```bash
git clone https://github.com/VledicFranco/organon.git /tmp/organon-repo
cd /tmp/organon-repo/packages/tools && npm install && npm run build
```

The CLI is now available via `npx organon` from that directory, or you can link it globally:

```bash
cd /tmp/organon-repo/packages/tools && npm link
```

### Step 2: Scaffold the project

From the user's project root:

```bash
organon init <project-root>
# Creates: organon.config.json, CLAUDE.md, organon/ directory,
# .claude/skills/ with 5 workflow skills
```

This generates 12 files: 7 organon scaffold files + 5 Claude Code skills. All files pass `organon verify` out of the box.

### Step 3: Customize the organon files

The scaffolded files contain placeholder text. Guide the user through editing:

1. **`organon/ETHOS.md`** — Define the project's identity (IS/IS NOT), invariants, principles, and decision heuristics. This is the most important file — it tells AI assistants what the project is and how to behave.

2. **`organon/PHILOSOPHY.md`** — Document why the project is designed the way it is. Problem statement, core bet, design decisions with trade-offs.

3. **`CLAUDE.md`** — Project-level agent instructions. The scaffold has a working template; customize the heuristics table and project structure section.

4. **`organon/protocols/PROTOCOLS.md`** — Development procedures. The scaffold includes 5 generic protocols matching the installed skills.

### Step 4: Verify the setup

```bash
organon verify --project-root <project-root>
organon health --project-root <project-root>
```

All 6 gates should pass. Fix any issues reported.

### Step 5: Use the skills

The 5 installed Claude Code skills automate common workflows:

| Skill | Purpose |
|-------|---------|
| `domain-feature-design` | Design new domains/features with proper organon files |
| `organon-file-creation` | Create new ETHOS.md, PHILOSOPHY.md, PROTOCOL.md files |
| `quality-review` | Semantic review beyond automated gates |
| `session-compounding` | Convert session learnings into durable improvements |
| `verify-and-health` | Run verification gates and interpret failures |

### Keeping Up to Date

When this repository's methodology version advances, update an existing project:

```bash
organon upgrade <project-root>          # Show what changed (dry run)
organon upgrade <project-root> --apply  # Apply updates
```

### For Human Developers

1. **Read the [docs/](./docs/)** for practical guidance
2. **Explore `organon/`** in this repo to see the methodology dogfooding itself
3. **Read the reference implementation:** [Agent Tavern](https://github.com/VledicFranco/agent-tavern)

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
