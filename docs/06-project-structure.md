# Project Structure

This page documents the repository layout, key relationships between directories, development setup, and how to contribute.

---

## Table of Contents

- [Repository Layout](#repository-layout)
- [Key Relationships](#key-relationships)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Health Baseline](#health-baseline)
- [Contributing by Area](#contributing-by-area)

---

## Repository Layout

```
organon/
├── CLAUDE.md                         ← Agent behavioral constraints for this repo
├── README.md                         ← Public-facing project overview
├── organon.config.json               ← CLI configuration
├── LICENSE                           ← MIT license
│
├── docs/                             ← Developer documentation (you are here)
│   ├── README.md                     ← Documentation router
│   ├── 01-what-is-organon.md         ← Concept introduction
│   ├── 02-getting-started.md         ← Install + first run tutorial
│   ├── 03-cli-reference.md           ← All CLI commands
│   ├── 04-writing-organon-files.md   ← Authoring guide
│   ├── 05-testing-invariants.md      ← @organon-methodology/testing usage
│   ├── 06-project-structure.md       ← This file
│   └── 07-glossary.md               ← Term definitions
│
├── book-llms/                        ← Formal methodology specification (LLM-optimized)
│   ├── ETHOS.md                      ← Meta-organon: rules for writing organons
│   ├── PHILOSOPHY.md                 ← Meta-organon: reasoning behind the rules
│   ├── overview.md                   ← High-level methodology overview
│   ├── patterns.md                   ← 21 documented patterns
│   ├── scopes.md                     ← Scope hierarchy specification
│   ├── templates.md                  ← Copy-paste scaffolds for all artifact types
│   ├── frontmatter-system.md         ← YAML frontmatter specification
│   ├── three-layer-architecture.md   ← Protocols → workflows → tools
│   ├── invariant-tracking.md         ← Invariant-to-test binding spec
│   └── protocols/                    ← Step-by-step methodology procedures
│
├── book-humans/                      ← Narrative guide (planned, outline only)
│   └── README.md                     ← Table of contents and timeline
│
├── organon/                          ← This project's own organon hierarchy
│   ├── ETHOS.md                      ← Meta-organon for the organon system
│   ├── README.md                     ← Navigation
│   ├── domains/
│   │   ├── tools/                    ← CLI domain (ETHOS.md, PHILOSOPHY.md) — status: stable
│   │   ├── testing/                  ← Testing domain (ETHOS.md, PHILOSOPHY.md) — status: stable
│   │   └── book-humans/              ← Book-humans domain (ETHOS.md, PHILOSOPHY.md) — status: implementing
│   └── protocols/                    ← Development procedures
│
├── packages/
│   ├── tools/                        ← @organon-methodology/tools CLI (TypeScript, yargs)
│   │   ├── src/
│   │   │   ├── core/                 ← Pure logic (no I/O)
│   │   │   ├── cli/commands/         ← CLI commands
│   │   │   ├── mcp/                  ← MCP server (8 tools, 4 resources, 4 prompts)
│   │   │   └── index.ts             ← Public API
│   │   ├── package.json
│   │   └── vitest.config.ts
│   │
│   └── testing/                      ← @organon-methodology/testing library
│       ├── src/
│       │   ├── core/                 ← Assertions (6) + testInvariant wrapper
│       │   └── adapters/vitest.ts    ← Vitest adapter
│       ├── package.json
│       └── vitest.config.ts
│
└── .claude/
    └── skills/                       ← Claude Code workflow bindings
```

---

## Key Relationships

| Source | Target | Relationship |
|--------|--------|--------------|
| `book-llms/ETHOS.md` | `book-llms/templates.md` | ETHOS defines structure requirements; templates provides scaffolds |
| `book-llms/ETHOS.md` | `book-llms/frontmatter-system.md` | ETHOS requires frontmatter; frontmatter-system details the schema |
| `book-llms/three-layer-architecture.md` | `.claude/skills/` | Three-layer arch defines workflows; skills are the implementation |
| `organon/domains/tools/ETHOS.md` | `packages/tools/` | Domain ETHOS constrains how the CLI is built |
| `organon/domains/testing/ETHOS.md` | `packages/testing/` | Domain ETHOS constrains how the testing library is built |
| `CLAUDE.md` | Everything | Product-level agent constraints for all work in this repo |

---

## Development Setup

```bash
# Clone
git clone https://github.com/VledicFranco/organon.git
cd organon

# Install all workspace dependencies
npm install

# Build packages (order matters!)
cd packages/testing && npm run build && cd ../..
cd packages/tools && npm run build && cd ../..

# Verify everything works
cd packages/testing && npm test && cd ../..
cd packages/tools && npm test && cd ../..
```

**Build order:** `packages/testing` must build before `packages/tools` because the tools package imports `@organon-methodology/testing` for its meta-invariant tests.

**After editing TypeScript** in `packages/tools/src/`, you must `npm run build` before `organon verify` picks up changes (the CLI runs from `dist/`).

---

## Development Workflow

1. **Read the organon first.** Before working in any area, read its ETHOS.md (if one exists) plus `CLAUDE.md`.

2. **Ethos-first for new work.** When creating a new domain, feature, or component — write the ETHOS.md before implementing.

3. **Frontmatter on every organon file.** Add frontmatter when creating, update when modifying (especially counts and `token_estimate`).

4. **Verify after changes.** Run `organon verify --project-root ../..` from `packages/tools/` (or use `--project-root .` from repo root).

5. **Commit style.** Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`.

6. **No force-push to master.** Branch and PR for non-trivial changes.

---

## Health Baseline

The project maintains a health score of **100/100**. This is verified by `organon health --project-root .` from the repo root.

The score is composed of:
- **Frontmatter coverage** — all organon files have valid frontmatter
- **Validation** — all files pass 4-stage validation
- **Token analysis** — estimates are reasonable
- **Freshness** — files are within the staleness threshold

If your changes drop the health score, diagnose with:

```bash
organon health --detailed --fix-suggestions --project-root .
```

---

## Contributing by Area

### book-llms/ (Methodology Specification)

The highest-risk area. Changes here affect the formal methodology definition.

- Read `book-llms/ETHOS.md` before editing anything
- Cross-reference changes: terminology must be consistent across all files
- Version numbers in frontmatter must be bumped across all affected files
- After major refactors, grep for stale terminology across ALL files including `CLAUDE.md`

### packages/tools/ (CLI)

- Read `organon/domains/tools/ETHOS.md` for CLI-specific invariants
- TypeScript only, yargs for CLI
- Every command needs tests
- Gates fail, not warn (INV-TOOLS-3)
- Run `npm test` in `packages/tools/` before committing

### packages/testing/ (Test Library)

- Read `organon/domains/testing/ETHOS.md` for testing-specific invariants
- Framework-agnostic core — vitest is the adapter, not the dependency
- Subpath export: `@organon-methodology/testing/vitest` is separate from main entry
- After adding new core files, update file arrays in `testing-invariants.test.ts`

### organon/ (This Project's Own Organon)

- This is the dogfood — the project uses Organon to govern itself
- Changes here should follow the same rigor as `book-llms/` changes
- Bidirectional references: if a protocol declares `automated`, the workflow must exist

### docs/ (Developer Documentation)

- No frontmatter on docs files — these are developer docs, not organon files
- Keep docs practical and example-driven
- Cross-reference within docs using relative links
- Verify that code examples match actual CLI behavior

---

## Next Steps

- [Getting Started](./02-getting-started.md) — Set up Organon in a new project
- [CLI Reference](./03-cli-reference.md) — Full command documentation
- [Glossary](./07-glossary.md) — Term definitions
