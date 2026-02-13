---
type: navigation
scope: product
name: organon
version: "2.0"
summary: Public-facing project overview — the Organon methodology for LLM-enforced project governance
token_estimate: 4200
provides: [overview, quick-start, repository-structure, reference-implementation]
audience: [llm, human]
---

# Organon Methodology

**An LLM-centric system for encoding, enforcing, and evolving project constraints.**

[![npm @organon-methodology/tools](https://img.shields.io/npm/v/@organon-methodology/tools)](https://www.npmjs.com/package/@organon-methodology/tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## What is Organon?

**Organon** (from Greek *organon*, "instrument") is a methodology for governing software projects through structured constraint documents called **organons**. Instead of relying on tribal knowledge, style guides, or conventions that drift over time, Organon encodes project intent into files that LLMs can read, execute, and verify.

The core insight: **LLMs are the execution engine.** Humans define *what* the project should be (constraints, principles, heuristics). LLMs enforce *how* by reading organon files, following workflows, invoking tools, and verifying compliance. This creates a closed loop where constraints are never just documentation — they're enforced.

### The Enforcement Loop

Every project activity follows this cycle:

```
DEFINE  ──>  BIND  ──>  EXECUTE  ──>  VERIFY  ──>  COMPOUND  ──>  EVOLVE
  |                                                                   |
  └───────────────────────────────────────────────────────────────────┘
```

1. **Define** — Humans encode intent as organon files (ETHOS.md, PHILOSOPHY.md, PROTOCOLS.md)
2. **Bind** — Workflows translate protocols into LLM-executable steps (Claude skills, Cursor rules, etc.)
3. **Execute** — LLMs read workflows and orchestrate tools
4. **Verify** — Automated gates check that constraints hold (frontmatter, references, invariant coverage)
5. **Compound** — Session learnings are captured as observations
6. **Evolve** — Observations mature into methodology improvements (new invariants, refined heuristics)

### Three-Layer Architecture

| Layer | Contains | Purpose | Technology |
|-------|----------|---------|------------|
| **Protocols** | PROTOCOLS.md files | *What* must happen (numbered steps, preconditions, verification) | Markdown (universal) |
| **Workflows** | Agent skills, rules, runbooks | *How* to orchestrate (tool sequencing, context loading, error handling) | Agent-specific |
| **Tools** | CLI commands, MCP tools, scripts | *How* to execute (atomic, idempotent operations) | Project-specific |

Protocols are technology-agnostic. Workflows adapt to your agent (Claude Code, Cursor, custom). Tools fit your stack.

---

## Organon Files

An **organon** is a set of structured files that govern a scope (project, domain, feature, or component):

| File | Required | Purpose |
|------|----------|---------|
| **ETHOS.md** | Yes | Behavioral constraints: identity (IS/IS NOT), invariants, prioritized principles, decision heuristics |
| **PHILOSOPHY.md** | No | Design rationale: problem statement, core bet, decisions with trade-offs |
| **PROTOCOLS.md** | No | Procedures: numbered steps, automation tiers, workflow bindings, verification |
| **README.md** | Per directory | Navigation router: lists contents, no substantive content |

Every organon file has **YAML frontmatter** — metadata that enables progressive disclosure:

```yaml
---
type: constraints
scope: domain
name: payments
version: "1.0"
summary: Payment processing invariants and integration boundaries
token_estimate: 1800
invariants_count: 5
principles_count: 4
inherits_from: [product-organon]
---
```

An LLM can read frontmatter (~50 tokens) to decide whether to load the full file (~1800 tokens). This replaces hard line limits — files can be as thorough as needed while remaining token-efficient.

### Scope Hierarchy

Organons inherit constraints downward. A child scope can add constraints but never relax parent constraints.

```
product (project-wide)
  └── domain (bounded context, e.g., payments, auth)
        └── feature (cross-cutting concern, e.g., caching, logging)
              └── component (specific module or service)
```

---

## Getting Started

### Install

```bash
npm install -g @organon-methodology/tools
```

### Scaffold a New Project

```bash
organon init <project-root>
```

This creates 14 files:
- `organon.config.json` — project configuration
- `CLAUDE.md` — agent instructions (loaded by Claude Code automatically)
- `organon/ETHOS.md` — project constraints (placeholder, customize first)
- `organon/PHILOSOPHY.md` — design rationale
- `organon/PRIMER.md` — condensed methodology primer for agent onboarding
- `organon/methodology-reference.md` — detailed methodology reference
- `organon/protocols/PROTOCOLS.md` — development procedures
- `organon/observations/README.md` — observation tracking directory
- `organon/README.md` — navigation
- `.claude/skills/` — 5 workflow skills (verify-and-health, quality-review, session-compounding, domain-feature-design, organon-file-creation)

All files pass `organon verify` out of the box.

### Customize

1. **Edit `organon/ETHOS.md` first** — Define your project's identity, invariants, and principles. This is the most important file.
2. **Edit `organon/PHILOSOPHY.md`** — Document why the project is designed the way it is.
3. **Edit `CLAUDE.md`** — Customize agent instructions, heuristics table, and project structure.
4. **Edit `organon/protocols/PROTOCOLS.md`** — Define your development procedures.

### Verify

```bash
organon verify --project-root <project-root>    # Run 9 verification gates
organon health --project-root <project-root>    # Health score (0-100)
```

### Keep Up to Date

```bash
organon upgrade <project-root>            # Show what changed (dry run)
organon upgrade <project-root> --apply    # Apply methodology updates
```

---

## CLI Commands

```bash
organon init [dir]              # Scaffold a new project
organon upgrade [dir]           # Detect and apply version updates
organon verify                  # Run all 9 verification gates
organon health                  # Project health score (0-100)
organon validate <file>         # Validate a single organon file
organon generate <file>         # Auto-generate frontmatter
organon find --name=<term>      # Find organon files by name
organon find --scope=<scope>    # Find by scope
organon query                   # Query frontmatter across files
organon coverage                # Invariant test coverage report
organon generate-tests          # Scaffold tier-4 invariant tests
organon suggest                 # Suggest automation tier upgrades
organon release <bump>          # Version bump, tag, and release
organon mcp                     # Start MCP server (IDE integration)
```

### Verification Gates

`organon verify` runs 9 gates:

| Gate | What it checks |
|------|----------------|
| **frontmatter** | Every organon file has valid YAML frontmatter with required fields |
| **triplets** | Protocol-workflow-tool bindings are complete and bidirectional |
| **references** | `inherits_from`, `loads:`, `protocol_file` paths resolve correctly |
| **placeholder-detection** | Template placeholders like `[Describe...]` have been replaced |
| **freshness** | Organon files are not stale relative to code changes |
| **invariant-coverage** | Every invariant in ETHOS.md has at least one tier-4 test |
| **workflow-quality** | Workflows reference valid protocols and have proper structure |
| **tier4-tests** | Test files with `@organon-invariant` annotations use `testInvariant()` |
| **version-alignment** | Config methodology version matches CLI version |

---

## Testing Invariants

The `@organon-methodology/testing` package provides assertions for tier-4 (organon) tests — tests that verify your ETHOS.md invariants hold in code:

```bash
npm install --save-dev @organon-methodology/testing
```

```typescript
import { testInvariant } from '@organon-methodology/testing/vitest';
import { assertMaxValue } from '@organon-methodology/testing';

testInvariant('INV-PROJ-1', 'Config files stay under 200 lines', async () => {
  await assertMaxValue({
    pattern: '**/config/*.ts',
    extract: /\n/g,
    max: 200,
    cwd: process.cwd(),
  });
});
```

Available assertions: `assertMaxValue`, `assertFileExists`, `assertNamingConvention`, `assertExportsPresent`, `assertNoSideEffects`, `assertCustom`.

---

## Repository Structure

```
organon/                          # This repository IS the methodology specification
├── book-llms/                    # LLM technical reference (methodology spec)
│   ├── ETHOS.md                  # Meta-organon: rules for writing organons
│   ├── PHILOSOPHY.md             # Why the methodology is designed this way
│   ├── three-layer-architecture.md  # Protocols → Workflows → Tools
│   ├── frontmatter-system.md     # YAML frontmatter specification
│   ├── patterns.md               # Pattern catalog
│   └── protocols/                # Methodology procedures
│
├── docs/                         # Human-readable guides and tutorials
│
├── organon/                      # This project's own organon (dogfooding)
│   ├── ETHOS.md                  # Project-level constraints
│   ├── protocols/PROTOCOLS.md    # 11 development protocols
│   ├── domains/                  # tools/ and testing/ domain organons
│   └── observations/             # Empirical learnings from dogfooding
│
├── packages/
│   ├── tools/                    # @organon-methodology/tools (CLI + MCP)
│   └── testing/                  # @organon-methodology/testing (invariant assertions)
│
└── rfcs/                         # Design proposals for methodology evolution
```

| Resource | Audience | Purpose |
|----------|----------|---------|
| [book-llms/](./book-llms/) | LLMs, advanced devs | Formal methodology specification (~14k tokens core) |
| [docs/](./docs/) | Developers | Practical guides, CLI reference, tutorials |
| [book-humans/](./book-humans/) | All developers | Narrative guide (planned) |

---

## Reference Implementation

**[Agent Tavern](https://github.com/VledicFranco/agent-tavern)** is the canonical Organon implementation — a production codebase with 30+ domain organons, 12+ feature organons, auto-generated component mappings, and CI verification gates.

---

## Key Concepts for LLMs

If you're an LLM setting up or working within an Organon project, here's what matters:

1. **Read ETHOS.md before doing anything.** It defines what the project IS and IS NOT, its invariants, and its prioritized principles. When principles conflict, lower number wins.

2. **Frontmatter is your discovery layer.** Don't load full files — read frontmatter first to decide what's relevant. Use `token_estimate` to budget your context window.

3. **The enforcement loop is real.** After making changes, run `organon verify` and `organon health`. Gates that fail must be fixed, not ignored.

4. **Workflows bind protocols to your actions.** When a skill/workflow exists for a task, use it. It encodes the project's preferred procedure.

5. **Child scopes inherit, never contradict.** A domain ETHOS.md can add constraints beyond the project ETHOS.md, but cannot relax them.

6. **Compound every session.** Reserve time at the end of significant work sessions to capture learnings. Without explicit compounding, improvement never happens.

---

## Contributing

- **book-llms/** — Methodology patterns, templates, specification improvements
- **docs/** — Guides, tutorials, examples
- **packages/** — CLI features, MCP server tools, testing assertions

Fork, branch, PR. Follow conventional commits (`feat:`, `fix:`, `docs:`, `chore:`).

---

## License

MIT
