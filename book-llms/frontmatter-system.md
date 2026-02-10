---
type: rationale
scope: meta
name: frontmatter-system
version: "3.0"
summary: YAML frontmatter specification for progressive disclosure — the mechanism that makes token-efficient big organons possible
token_estimate: 3717
inherits_from: [meta-organon]
load_priority: high
required_for:
  - organon_creation
  - organon_review
  - frontmatter_tooling
  - methodology_evolution
audience: [llm, human, tooling]
---

# Frontmatter System

> The mechanism that makes progressive disclosure work. Every organon file has YAML frontmatter so agents can discover, filter, and budget before loading full content.

---

## The Problem

Organons can be large (2,000-5,000+ tokens). Without metadata, agents face an all-or-nothing choice: load the entire file or skip it. This wastes tokens on irrelevant content and makes context budget planning impossible.

Hard line limits (e.g., "max 200 lines") were a previous attempt to solve this. They failed because:
- Important content was cut to stay under limits
- Cohesive documents were split artificially
- The proxy (small files) was optimized instead of the goal (token efficiency)

---

## The Solution: Frontmatter as Layer 1

YAML frontmatter provides **25-50 tokens of metadata** per file, enabling the progressive disclosure model:

```
Layer 0: README-as-Router        ~50 tokens    "What files exist?"
Layer 1: Frontmatter ◄────────  ~25-50 tokens  "Should I load this file?" ← THIS SPEC
Layer 2: Section Headings        ~100 tokens   "What sections exist?"
Layer 3: Specific Section        variable      "Load just ## Invariants"
Layer 4: Full File               full cost     "Load everything"
```

Frontmatter is the critical decision point. An agent reads ~50 tokens and decides whether to invest ~2,500+ tokens on the full file. Across a project with 49 organons, this turns 112K tokens of potential loading into a ~2,500-token discovery pass.

---

## Core Schema

Every organon file must include these fields:

```yaml
---
type: string              # File type (see Type Enum below)
scope: string             # Hierarchy level (see Scope Enum below)
name: string              # Unique identifier (kebab-case, matches directory)
version: string           # Semantic version "X.Y"
summary: string           # One-sentence description (max 200 chars)
token_estimate: number    # Approximate full file token count
---
```

### Type Enum

| Value | Used for | Description |
|-------|----------|-------------|
| `navigation` | README.md | Directory router |
| `constraints` | ETHOS.md | Behavioral constraints (IS/IS NOT, invariants, principles, heuristics) |
| `rationale` | PHILOSOPHY.md | Reasoning, trade-offs, design decisions |
| `procedures` | PROTOCOL.md, protocols/*.md | Step-by-step procedures with verification |
| `mapping` | components.md | Auto-generated code-to-domain mapping |

### Scope Enum

| Value | Description |
|-------|-------------|
| `product` | Repo-wide constraints |
| `domain` | Business bounded context |
| `feature` | Cross-cutting user capability |
| `component` | Implementation unit |
| `meta` | Meta-organon (organon about organons) |
| `methodology` | How-we-build guidance |

---

## Type-Specific Fields

Beyond the core schema, each type has additional fields:

### ETHOS.md (`type: constraints`)

```yaml
invariants_count: number      # Number of ## Invariants entries
principles_count: number      # Number of ## Principles entries
heuristics_count: number      # Number of decision heuristic rows
invariants:                   # Stable invariant registry (see invariant-tracking.md)
  - id: string                # Stable ID: INV-{SCOPE}-{N} (never reused)
    name: string              # Short kebab-case label
    judgment_call: boolean    # true = requires human review, not automated testing
```

These counts let agents estimate section sizes without loading the file. An agent can calculate: "This ethos has 20 invariants — the `## Invariants` section is probably ~60 lines." The `invariants` array provides stable IDs for test-to-invariant tracking (see [invariant-tracking.md](./invariant-tracking.md)).

### PHILOSOPHY.md (`type: rationale`)

```yaml
decision_count: number        # Number of design decisions
explains_invariants: string[] # Invariant IDs explained (e.g., [GEN-1, GEN-2])
pattern_count: number          # For pattern catalogs (e.g., patterns.md) — number of documented patterns
```

**Note:** Custom `*_count` fields are allowed for catalog-style rationale files. Examples: `pattern_count`, `antipattern_count`, `example_count`. Use when the file enumerates a collection of items that agents may need to count without loading the full content.

### PROTOCOL.md (`type: procedures`)

```yaml
protocols_count: number       # Number of protocols in the file
protocols:                    # Protocol metadata array
  - id: string               # Protocol ID (e.g., PROTO-RFC-1)
    name: string              # Human-readable name
    steps: number             # Number of steps
    automation_tier: string   # automated | semi-automated | manual
    workflow: string           # Workflow binding name (if automation_tier == automated)
    tools: string[]           # Required tools/scripts
    complexity: string        # high | medium | low
```

### README.md (`type: navigation`)

```yaml
provides: string[]            # What this directory contains
parent: string                # Parent directory name
```

### components.md (`type: mapping`)

```yaml
file_count: number            # Number of files mapped
last_generated: string        # ISO 8601 timestamp
```

---

## Relationship Fields

Enable smart navigation and dependency resolution. These are optional but strongly recommended:

```yaml
# Inheritance hierarchy
inherits_from: string[]       # Parent organon names (e.g., [product], [meta-organon])

# Cross-references
related_domains: string[]     # Related domain names
related_features: string[]    # Related feature names
primary_rfcs: number[]        # RFCs that created/shaped this organon
secondary_rfcs: number[]      # Supporting RFCs

# Context management
load_priority: high | medium | low
required_for: string[]        # Task types that need this organon
audience: [llm, human, tooling]

# Freshness tracking
last_reviewed: string          # ISO 8601 date when a human last confirmed organon accuracy
methodology_version: string    # Organon methodology version this project follows (e.g., "3.0")
```

### How agents use relationship fields

**Task-based filtering:** An agent working on `genesis_tool_implementation` queries all frontmatter for `required_for` containing that task. Returns 3 files instead of 49.

**Context budget planning:**
```
Budget: 20,000 tokens
Query: required_for == "genesis_tool_implementation" AND load_priority in [high, medium]
Results:
  - /ETHOS.md (2,500 tokens, high priority)
  - genesis/ETHOS.md (2,800 tokens, high priority)
  - tool-registry/ETHOS.md (1,500 tokens, medium priority)
Total: 6,800 tokens (34% of budget) — leaves room for implementation
```

**Dependency resolution:** `inherits_from` tells agents which parent organons provide base constraints. Loading a domain organon without its parent means missing inherited invariants.

---

## Standardized Section Headings

Frontmatter enables file-level discovery (Layer 1). Standardized headings enable section-level loading (Layer 3). Together they make progressive disclosure work end-to-end.

### The contract

Each artifact type has fixed `##`-level headings. These headings must not be renamed, reordered, or nested differently. Agents rely on them to extract specific sections without parsing the entire file.

### ETHOS.md sections

| Heading | Content | Typical size |
|---------|---------|-------------|
| `## Identity` | IS/IS NOT statements | 10-20 lines |
| `## Invariants` | Numbered rules | 20-80 lines |
| `## Principles` | Prioritized guidelines | 10-30 lines |
| `## Decision Heuristics` | "When X, do Y" tables | 15-40 lines |

Optional: `## Progressive Disclosure Model`, `## Out of Scope`, `## Failure Modes`, `## Anti-Patterns`, `## Verification Checklist`

### PHILOSOPHY.md sections

| Heading | Content | Typical size |
|---------|---------|-------------|
| `## The Problem` | Pain description | 10-30 lines |
| `## The Bet` | Core approach | 10-20 lines |
| `## Design Decisions` | Numbered decisions | 30-100 lines |
| `## Trade-offs` | Benefit/cost table | 10-20 lines |

Optional: `## What This Is Not`

### PROTOCOL.md sections

| Heading | Content | Typical size |
|---------|---------|-------------|
| `## Goal` | Success criteria | 3-5 lines |
| `## Preconditions` | Requirements checklist | 5-10 lines |
| `## Steps` | Numbered procedure | 20-100 lines |
| `## Verification` | Completion checklist | 5-10 lines |

Optional: `## Recovery`

### Section-level loading in practice

An agent reviewing a PR against genesis domain constraints:
1. Reads frontmatter of `genesis/ETHOS.md` — confirms it's relevant (~50 tokens)
2. Loads only `## Invariants` section — gets the 20 rules to check (~60 lines)
3. Never loads Identity, Principles, or Heuristics — saves ~100 lines

An agent resolving an ambiguous decision:
1. Reads frontmatter — confirms scope is correct
2. Loads only `## Decision Heuristics` — gets the lookup table
3. Never loads Invariants or Principles

---

## Validation Rules

Frontmatter must be **truthful** — automated tests enforce accuracy.

### Schema Validation

- All required fields present (`type`, `scope`, `name`, `version`, `summary`, `token_estimate`)
- Types match enums (`type` ∈ {navigation, constraints, rationale, procedures, mapping})
- Scope matches enums (`scope` ∈ {product, domain, feature, component, meta, methodology})
- `name` is kebab-case
- `version` is semver format "X.Y"
- `summary` ≤ 200 characters

### Reference Validation

- `inherits_from` organons exist
- `related_domains` reference existing domains
- `related_features` reference existing features
- `primary_rfcs` reference existing RFC files

### Truthfulness Validation

- `invariants_count` matches actual `## Invariants` entries
- `principles_count` matches actual `## Principles` entries
- `protocols_count` matches actual protocol count
- `token_estimate` within 30% of actual (~3.5 chars ≈ 1 token for markdown, or ~12 tokens per line as quick estimate)
- `invariants` array length matches `invariants_count`
- Each invariant `id` follows `INV-{SCOPE}-{N}` format
- No duplicate invariant IDs

### Consistency Validation

- `name` matches parent directory name
- `scope` matches directory structure (`domains/` → `scope: domain`)
- Related references are bidirectional (if A references B, B references A)
- If `automation_tier == "automated"`, workflow binding exists and references back

---

## Tooling

### Generate Frontmatter

```bash
organon frontmatter:generate <file> --update
```

Auto-extracts: counts (invariants, principles, heuristics, protocols), token estimate, summary, scope from directory structure. Handles multiple invariant formats: `### 1.`, `1. **`, `### Invariant 1:`.

### Validate Frontmatter

```bash
organon frontmatter:validate
```

Runs all validation rules (schema, references, truthfulness, consistency).

### Query Frontmatter

```bash
organon frontmatter:query --list                    # All organons with metadata
organon frontmatter:query --scope=domain --verbose   # Filter by scope
organon frontmatter:query --budget=20000             # Plan context loading
organon frontmatter:query --related=genesis          # Find related organons
organon frontmatter:query --task=genesis_tool_impl   # Find organons for task
```

### Health Check

```bash
organon frontmatter:health --detailed --fix-suggestions
```

Reports coverage, validation status, token analysis, freshness, and actionable suggestions.

---

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| Frontmatter on every file | 98% token savings for discovery | Initial setup + maintenance |
| Truthfulness validation | Metadata never lies | Requires tooling to enforce |
| Standardized section headings | Section-level loading works | Less flexibility in file structure |
| No hard line limits | Content quality preserved | Requires discipline in frontmatter + sections |

**Mitigation:** Auto-generation minimizes manual work. Validation in CI catches drift early. The cost of maintaining frontmatter is far less than the cost of loading irrelevant content across thousands of agent interactions.

---

## Reference Implementation

**Agent Tavern** (100% frontmatter coverage across 49 organon files):

- Generator: `scripts/organon/generate-frontmatter.ts`
- Validator: `scripts/organon/validate-frontmatter.ts`
- Query tool: `scripts/organon/query-frontmatter.ts`
- Health dashboard: `scripts/organon/health.ts`
- Tests: 19 comprehensive tests covering all validation rules
- Results: ~112K total tokens, ~2,283 average per file, 100% validation passing

---

## Related Files

| File | Relationship |
|------|--------------|
| [overview.md](./overview.md) | High-level methodology overview |
| [ETHOS.md](./ETHOS.md) | Frontmatter requirement (INV-META-6) |
| [patterns.md](./patterns.md) | Progressive disclosure pattern |
| [templates.md](./templates.md) | Template examples with frontmatter |
| [invariant-tracking.md](./invariant-tracking.md) | Invariants array specification |
