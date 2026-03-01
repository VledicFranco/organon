# YAML-First Organons + `.methodology/` Directory Standard

> Design proposal for v0.6.0. Replace the Markdown+frontmatter hybrid with pure YAML organon
> files, consolidated under a `.methodology/` standard directory. The single largest
> architectural change in v0.6.0 — everything else builds on top of this.

---

## Thesis

Current organon files are a hybrid: YAML frontmatter bolted onto Markdown prose. This creates
format mismatch between organon files and RFCs, requires Markdown parsing before any structured
access, and makes programmatic composition awkward. The fix is to make YAML the canonical format
and embed prose as string fields within the YAML structure.

Combined with consolidating all organon artifacts under a standard `.methodology/` directory
(analogous to `.git/`, `.vscode/`, `.venv/`), this gives every project a clean, queryable,
machine-readable organon graph — and keeps the project root uncluttered.

---

## 1. All Organons as YAML-First

Instead of scattered Markdown files with frontmatter, organons become **pure YAML**. Any prose
explanation goes into YAML string fields.

**File structure per domain:**
```
.methodology/organon/domains/tools/
├── ethos.yaml            (domain-level invariants, principles, heuristics)
├── philosophy.yaml       (domain-level reasoning, decisions, bets)
├── protocol.yaml         (domain-level procedures, steps, verification)
├── definitions.yaml      (concept-level definitions)
├── relationships.yaml    (concept-level relationships)
└── implementations.yaml  (code mappings)
```

**YAML structure example (`ethos.yaml`):**
```yaml
type: constraints
scope: domain
name: tools
version: "1.1"

invariants:
  - id: INV-TOOLS-1
    name: schema-fidelity
    statement: "Frontmatter parser must match book-llms/ schema exactly"
    rationale: "Any deviation breaks methodology compatibility"

principles:
  - priority: 1
    name: schema-fidelity-over-convenience
    statement: "When spec conflicts with ease-of-use, spec wins"
    reasoning: "We implement the methodology exactly, not approximations"

heuristics:
  - situation: "Book-llms/ spec unclear"
    action: "File issue in book-llms/, block implementation until clarified"

out_of_scope:
  - "Workflow execution (that's agent-specific)"
  - "Code generation beyond frontmatter"
```

**Benefits over current Markdown+frontmatter hybrid:**
- YAML is the canonical format — no more hybrid parsing
- All prose lives in string fields (`statement:`, `rationale:`, `reasoning:`, `description:`)
- MCP loads pure YAML (no Markdown parsing required)
- Tools can auto-generate Markdown docs from YAML for human review
- LLMs populate YAML fields (structured) rather than writing freeform Markdown prose
- Everything is queryable and composable
- Format consistency across all artifact types (RFC.yaml, ethos.yaml, definitions.yaml)

---

## 2. `.methodology/` as the Standard Directory

A single root for all methodology artifacts in a project — standard location, clean separation
between project-scoped usage and methodology specification.

```
.methodology/
├── organon/                             ← THIS PROJECT's Organon usage (YAML, project-scoped)
│   ├── domains/
│   │   └── {domain-name}/
│   │       ├── ethos.yaml
│   │       ├── philosophy.yaml
│   │       ├── protocol.yaml
│   │       ├── definitions.yaml
│   │       ├── relationships.yaml
│   │       └── implementations.yaml
│   ├── rfcs/
│   │   └── rfc-NNN.yaml
│   └── observations/
│       └── *.yaml
│
├── organon_def/                         ← Organon METHODOLOGY specification (read-only reference)
│   ├── ETHOS.md
│   ├── PHILOSOPHY.md
│   ├── PROTOCOL.md
│   ├── three-layer-architecture.md
│   ├── frontmatter-system.md
│   ├── patterns.md
│   ├── scopes.md
│   └── definitions.md
│
└── {other_methodology}_def/             ← Future: other methodologies
    ├── ETHOS.md
    └── ...
```

**Key separation:** project usage (YAML, mutable) vs methodology specification (Markdown,
read-only). The spec is installed locally via `organon init` and updated via `organon upgrade` —
no external `book-llms/` reference required at runtime.

**Benefits:**
- Project root stays clean — `src/`, `tests/`, `docs/`, `package.json` are product code only
- `.methodology/` is a recognizable standard (like `.git/`, `.vscode/`, `.venv/`)
- Extensible: add `{methodology_name}/` and `{methodology_name}_def/` for other methodologies
- MCP server config points to `.methodology/{methodology_name}/` for project-scoped queries
- Project organons are YAML (consistent, queryable, LLM-friendly)
- Methodology reference stays Markdown (human-readable, familiar)

**Migration path:** RFC + `organon init --create-methodology` creates `.methodology/organon/`
structure. `organon upgrade` updates `.methodology/organon_def/` with new methodology versions.

---

## 3. `.methodology/organon/tmp/` for Temporal Files

A gitignored workspace for intermediate agent artifacts:
- LLM reasoning traces, draft plans, context staging areas
- Workspace protocols can dump intermediate files here
- Follows the convention of `.git/`, `.vscode/`, `.venv/` — standard but gitignored
- Created automatically by `organon init`; managed via `.methodology/.gitignore`

---

## Paradigm Shift Summary

| Aspect | Current (≤0.5.x) | v0.6.0 |
|--------|-----------------|--------|
| **Project Organon Format** | `organon/domains/{domain}/ETHOS.md` (Markdown+frontmatter) | `.methodology/organon/domains/{domain}/ethos.yaml` (pure YAML) |
| **RFC Format** | `organon/rfcs/RFC-NNN.md` with frontmatter | `.methodology/organon/rfcs/rfc-NNN.yaml` (pure YAML) |
| **Methodology Spec** | `book-llms/*.md` (external reference only) | `.methodology/organon_def/*.md` (local reference, installed) |
| **Prose Location** | In Markdown sections | In YAML string fields (`statement:`, `rationale:`, `description:`) |
| **Concept Definitions** | Ad-hoc in PHILOSOPHY.md | `.methodology/organon/domains/{domain}/definitions.yaml` (atomic, queryable) |
| **Directory Standard** | Scattered (`organon/`, `.claude/skills/`, `book-llms/`) | `.methodology/` (single standard root) |
| **Data Access** | LLM reads/parses Markdown files | MCP query API (loads YAML, returns JSON) |
| **Automation** | Manual (read → implement) | Automated (validate → generate → test) |
| **Composition** | No (isolated RFCs/organons) | Yes (RFC imports, definition references, relationship links) |
| **Hallucination Risk** | High (prose ambiguous) | Low (YAML schema enforced) |
| **Verification** | Manual (did implementer follow RFC?) | Automated (tools verify RFC→Organon→Code chain) |
| **LLM Workflow** | Generate Markdown prose | Populate YAML fields |

**Breaking change:** v0.6.0 introduces `.methodology/` as the standard root. `organon init`
creates the full structure automatically. Existing projects migrate via `organon upgrade`.

---

## Resolved Design Decisions

**✅ Q1: RFC `organon_mutations` target**
- RFCs ONLY mutate `.methodology/organon/` files (project-scoped organon)
- Never mutate `.methodology/organon_def/` (read-only, updated by CLI only)
- Never mutate `book-llms/` (legacy reference, backwards compat)

**✅ Q2: Methodology specification location**
- `.methodology/organon_def/` is the local reference (installed via `organon init`, upgraded
  via `organon upgrade`)
- `book-llms/` remains unchanged (legacy, external reference)
- No conversion of existing books

---

## Outstanding Design Questions

**Q3: Invariant Inheritance Model**
- How do domain-level invariants (`ethos.yaml`) relate to concept-level invariants
  (`definitions.yaml`)?
- Are domain invariants universal constraints on all concepts in that domain?
- Or are they independent (each concept has its own invariants with no inherited constraints)?

**Q4: Observations File Organization**
- Single `observations.yaml` or multiple `observations/*.yaml` files?
- How does RFC status interact with observations (linked by RFC ID)?
- Should observations be indexed/queryable via MCP?

**Q5: Auto-Generated Documentation**
- When tools generate Markdown from YAML (definitions, relationships), where do they go?
- `.methodology/organon/docs/` (for LLM reference)?
- Git-tracked or `.gitignore`?
- Regenerated on every `organon verify` or on-demand?

**Q6: Methodology Versioning**
- How is `.methodology/organon_def/` versioned?
- Tied to Organon npm version (v0.6.0)?
- Can projects pin to specific versions or always upgrade to latest?
- What does `organon upgrade` do exactly (fetch from npm, git, local)?
