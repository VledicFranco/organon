# Getting Started

This guide walks you through installing the Organon CLI, creating your first organon files, and running verification. By the end, you'll have a working organon with validated frontmatter and passing health checks.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Create Your First ETHOS.md](#create-your-first-ethosmd)
- [Configuration](#configuration)
- [Run Your First Commands](#run-your-first-commands)
- [Add a PHILOSOPHY.md](#add-a-philosophymd)
- [Set Up the Directory Structure](#set-up-the-directory-structure)
- [MCP Server Setup (Optional)](#mcp-server-setup-optional)
- [Next Steps](#next-steps)

---

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** (comes with Node.js)

---

## Installation

The CLI is not yet published to npm. Install from source:

```bash
# Clone the repository
git clone https://github.com/VledicFranco/organon.git
cd organon

# Install dependencies (workspace-aware)
npm install

# Build the tools package
cd packages/tools
npm run build

# Verify the CLI works
npx tsx src/cli/index.ts --help
```

For convenience during development, you can create an alias:

```bash
# In the organon repo root
alias organon="npx tsx packages/tools/src/cli/index.ts"
```

---

## Create Your First ETHOS.md

Create an `organon/` directory in your project root, then write your first ETHOS.md:

```bash
mkdir -p organon
```

Create `organon/ETHOS.md` with this content:

```markdown
---
type: constraints
scope: product
name: my-project
version: "1.0"
summary: Product-level constraints for my project
token_estimate: 400
invariants_count: 3
principles_count: 2
heuristics_count: 2
invariants:
  - id: INV-PRODUCT-1
    name: tests-before-merge
  - id: INV-PRODUCT-2
    name: no-runtime-type-errors
  - id: INV-PRODUCT-3
    name: conventional-commits
inherits_from: []
load_priority: high
audience: [llm, human]
---

# My Project Ethos

> Behavioral constraints for all contributors.

---

## Identity

### What This Project IS

- A web application for managing team workflows
- A TypeScript monorepo with React frontend and Node.js backend

### What This Project IS NOT

- Not a library for external consumers
- Not a mobile application
- Not a real-time collaboration tool

---

## Invariants

1. **Tests before merge.** All PRs must have passing tests. No exceptions.

2. **No runtime type errors.** TypeScript strict mode enabled. No `any` types in production code.

3. **Conventional commits.** All commits follow the conventional commits format.

---

## Principles (Prioritized)

1. **Safety over speed.** Never sacrifice correctness for faster delivery.

2. **Explicit over implicit.** Prefer verbose clarity over clever brevity.

---

## Decision Heuristics

| Situation | Action |
|-----------|--------|
| Unsure about a type | Use the more restrictive type |
| Two approaches seem equal | Choose the simpler one |
```

The key parts:
- **Frontmatter** provides metadata for discovery and filtering
- **Identity** defines clear boundaries (IS / IS NOT)
- **Invariants** are numbered rules that must never be violated
- **Principles** are prioritized (lower number = higher priority)
- **Heuristics** are pre-computed answers for recurring decisions

---

## Configuration

Create `organon.config.json` at your project root:

```json
{
  "organonPaths": ["organon"],
  "ignorePatterns": ["node_modules/**", "dist/**"]
}
```

This tells the CLI where to find organon files and what to ignore during scanning.

For more configuration options, see the [CLI Reference](./03-cli-reference.md#configuration).

---

## Run Your First Commands

Run these commands from the Organon CLI repo, pointing `--project-root` at your project:

```bash
# Validate frontmatter (schema, truthfulness, consistency)
organon validate --project-root /path/to/your/project

# Check overall health
organon health --project-root /path/to/your/project

# Run all verification gates
organon verify --project-root /path/to/your/project
```

If you're running from within your project and have the CLI on your PATH:

```bash
organon validate
organon health
organon verify
```

**Expected output for `organon health`:**

```
Organon Health Dashboard

  Score: 100/100

  Coverage:
    1/1 files have frontmatter (100%)
  Validation:
    1 passing
  Tokens:
    Total: 400 | Average: 400
  Freshness:
    1 fresh
```

If you see validation errors, read the error messages — they include diagnostic codes and fix suggestions. Common issues:
- `invariants_count` doesn't match the actual number of invariants
- `name` doesn't match the parent directory name
- Missing required frontmatter fields

---

## Add a PHILOSOPHY.md

Once you've made some design decisions, document the reasoning:

Create `organon/PHILOSOPHY.md`:

```markdown
---
type: rationale
scope: product
name: my-project
version: "1.0"
summary: Design decisions and trade-offs for my project
token_estimate: 500
decision_count: 2
inherits_from: []
audience: [llm, human]
---

# My Project Philosophy

> Why this project is built the way it is.

---

## The Problem

Our team wastes hours debugging type errors in production and resolving
merge conflicts from inconsistent commit messages. Code reviews catch
issues too late in the process.

---

## The Bet

By enforcing strict TypeScript, conventional commits, and pre-merge tests,
we prevent entire categories of bugs from reaching production.

---

## Design Decisions

### 1. TypeScript Strict Mode Everywhere

We use `strict: true` in all tsconfig files, including test files.

**Rationale:** Catching type errors at compile time is cheaper than catching
them in production. The upfront cost of stricter types pays for itself
within the first month.

### 2. Conventional Commits

All commits follow `type: description` format (feat, fix, docs, chore, refactor).

**Rationale:** Enables automated changelog generation and makes git history
searchable. Small daily cost, large long-term benefit.

---

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| Strict TypeScript | Fewer runtime errors | Slower initial development |
| Conventional commits | Searchable history, auto-changelog | Learning curve for new devs |
```

Run `organon validate` again to verify both files pass.

---

## Set Up the Directory Structure

As your project grows, you'll want domain and feature organons. A typical structure:

```
your-project/
├── organon.config.json
├── organon/
│   ├── ETHOS.md           ← Product-level constraints
│   ├── PHILOSOPHY.md      ← Product-level rationale
│   ├── README.md          ← Navigation router
│   ├── domains/
│   │   └── billing/
│   │       └── ETHOS.md   ← Billing-specific constraints
│   └── features/
│       └── auth/
│           └── ETHOS.md   ← Auth-specific constraints
└── src/
    └── ...
```

Each new directory should have a `README.md` with `type: navigation` frontmatter to serve as a router. See [Writing Organon Files](./04-writing-organon-files.md) for detailed guidance.

---

## MCP Server Setup (Optional)

If your IDE supports MCP (Model Context Protocol), you can get organon tools directly in your editor.

For Claude Code, add to your project's `.claude/settings.json`:

```json
{
  "mcpServers": {
    "organon": {
      "command": "npx",
      "args": ["tsx", "packages/tools/src/cli/index.ts", "mcp", "--project-root", "."]
    }
  }
}
```

This gives your IDE access to 8 tools (validate, verify, health, find, query, etc.), 4 resources, and 4 prompts — all through the MCP protocol.

---

## Next Steps

- [CLI Reference](./03-cli-reference.md) — Full command documentation
- [Writing Organon Files](./04-writing-organon-files.md) — Detailed authoring guide with templates
- [Testing Invariants](./05-testing-invariants.md) — Write tier-4 tests for your invariants
- [Glossary](./07-glossary.md) — Look up unfamiliar terms
