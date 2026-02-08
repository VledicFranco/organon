# Frontmatter System

> **Version:** 1.0
> **Status:** Implemented in [Agent Tavern](https://github.com/VledicFranco/agent-tavern)
> **Purpose:** Enable progressive disclosure and context budget management for LLM consumption

---

## Problem

Organon files can be large (2,000-3,500 tokens). LLMs need to:
1. **Discover** what organons exist without loading full content
2. **Filter** organons by relevance (scope, domain, task)
3. **Plan** context budget before loading (avoid exceeding limits)
4. **Navigate** relationships between organons

Without metadata, LLMs must load every file to understand structure, wasting tokens on irrelevant content.

---

## Solution: YAML Frontmatter

Add **YAML frontmatter** to every organon file, providing:
- **25-50 tokens** of metadata (vs 2,000-3,500 for full file)
- **Smart filtering** (scope, priority, task requirements)
- **Token estimates** for budget planning
- **Relationship graph** (inherits_from, related_domains, related_features)

### Progressive Disclosure Pattern

```
┌─────────────────────────┐
│ 1. Load Frontmatter     │  25-50 tokens (metadata only)
│    - Scope, type, name  │
│    - Token estimate     │
│    - Relationships      │
└─────────────────────────┘
         ↓ (decide)
┌─────────────────────────┐
│ 2. Load Summary         │  200 chars (one-sentence)
│    - Quick preview      │
└─────────────────────────┘
         ↓ (decide)
┌─────────────────────────┐
│ 3. Load Full Content    │  2,000-3,500 tokens (full file)
│    - Invariants         │
│    - Principles         │
│    - Heuristics         │
└─────────────────────────┘
```

**Token Savings:** 80-97% (50 tokens vs 2,500 tokens average)

---

## Core Frontmatter Schema

Every organon file must include:

```yaml
---
type: string              # File type: navigation | constraints | rationale | procedures | mapping
scope: string             # Hierarchy level: product | domain | feature | meta | methodology
name: string              # Unique identifier (kebab-case, matches directory)
version: string           # Semantic version "X.Y"
summary: string           # One-sentence description (max 200 chars)
token_estimate: number    # Approximate full file token count
---
```

### Example (Genesis Domain ETHOS)

```yaml
---
type: constraints
scope: domain
name: genesis
version: "1.0"
summary: Invariants, principles, and decision heuristics for Genesis domain - AI orchestrator with trust tiers
token_estimate: 2800

# Structure counts (ETHOS-specific)
invariants_count: 20
principles_count: 3
heuristics_count: 6

# Relationships
inherits_from: [product]
related_features: [tool-registry, context-management, user-control]
primary_rfcs: [5, 12, 14, 16, 19]

# Context management
load_priority: high
required_for:
  - genesis_tool_implementation
  - trust_tier_assignment
  - context_budget_decisions
audience: [llm, human]
---
```

---

## Type-Specific Fields

### ETHOS.md (Constraints)

```yaml
invariants_count: number      # Number of invariants
principles_count: number      # Number of principles
heuristics_count: number      # Number of decision heuristics
protocols_count: number       # Number of protocols (optional)
```

**Validation:** Counts must match actual content (automated tests enforce this)

### PHILOSOPHY.md (Rationale)

```yaml
decision_count: number        # Number of design decisions
explains_invariants: string[] # Invariant IDs explained (e.g., [GEN-1, GEN-2])
```

### PROTOCOLS.md (Procedures)

```yaml
protocols_count: number       # Number of protocols
protocols:                    # Protocol metadata (see Three-Layer Architecture)
  - id: string                # Protocol ID (e.g., PROTO-RFC-1)
    name: string              # Protocol name
    steps: number             # Number of steps
    automation_tier: string   # automated | semi-automated | manual
    skill: string             # Skill name (if automated)
    tools: string[]           # Required tools
    complexity: string        # high | medium | low
```

### README.md (Navigation)

```yaml
type: navigation
provides: string[]            # What this README provides
parent: string               # Parent directory
```

### components.md (Mapping)

```yaml
type: mapping
file_count: number           # Number of files mapped
last_generated: string       # ISO 8601 timestamp
```

---

## Relationship Fields

Enable smart navigation and dependency resolution:

```yaml
# Inheritance hierarchy
inherits_from: string[]       # Parent organons (e.g., [product], [organon])

# Cross-references
related_domains: string[]     # Related domain names
related_features: string[]    # Related feature names
primary_rfcs: number[]        # RFCs that created this organon
secondary_rfcs: number[]      # Supporting RFCs

# Context management
load_priority: high | medium | low
required_for: string[]        # Task types requiring this organon
audience: [llm, human, tooling]
```

### Example: Context Budget Planning

```typescript
// LLM decides what to load based on task and budget

// Task: Implement genesis tool
const task = "genesis_tool_implementation";
const budget = 20000; // tokens

// Query frontmatter only (fast, <100 tokens)
const relevantOrganons = query({
  required_for: task,
  load_priority: ["high", "medium"],
});

// Plan context loading
const plan = planBudget(relevantOrganons, budget);
// → Recommends: /ETHOS.md (2500t), genesis/ETHOS.md (2800t), tool-registry/ETHOS.md (1500t)
// → Total: 6800t (34% of budget), leaves room for implementation

// Load selected organons
for (const organon of plan.recommended) {
  load(organon.file);
}
```

---

## Validation Rules

Frontmatter must be **truthful** (automated tests enforce):

### Schema Validation
- All required fields present
- Types match enums (type, scope, load_priority)
- Strings match patterns (kebab-case names, semver versions)
- Summary ≤ 200 characters

### Reference Validation
- `inherits_from` organons exist
- `related_domains` reference existing domains
- `related_features` reference existing features
- `primary_rfcs` reference existing RFC files

### Truthfulness Validation
- `invariants_count` matches actual count in file
- `principles_count` matches actual count
- `protocols_count` matches actual count
- `token_estimate` within 30% of actual

### Consistency Validation
- `name` matches parent directory name
- `scope` matches directory structure (domains/ → scope: domain)
- Version increments follow semver rules
- Related references are bidirectional

---

## Tooling

### Generate Frontmatter

```bash
organon frontmatter:generate organon/domains/genesis/ETHOS.md --update
```

**Features:**
- Auto-extracts counts (invariants, principles, heuristics, protocols)
- Estimates tokens (4 chars per token heuristic)
- Extracts summary from content (Purpose section, blockquotes, first paragraph)
- Detects scope from directory structure
- Handles 3 invariant formats: `### 1.`, `1. **`, `### Invariant 1:`

### Validate Frontmatter

```bash
organon frontmatter:validate
```

**Checks:**
- Schema validation (required fields, types, patterns)
- Reference validation (files exist, RFCs exist)
- Truthfulness validation (counts match actual)
- Consistency validation (name/scope match structure)

### Query Frontmatter

```bash
# List all organons with metadata
organon frontmatter:query --list

# Filter by scope
organon frontmatter:query --scope=domain --verbose

# Plan context loading within budget
organon frontmatter:query --budget=20000

# Find related organons
organon frontmatter:query --related=genesis

# Find organons for specific task
organon frontmatter:query --task=genesis_tool_implementation
```

### Health Check

```bash
organon frontmatter:health --detailed --fix-suggestions
```

**Reports:**
- Coverage (% of files with frontmatter)
- Validation status (errors, warnings)
- Token analysis (total, average, by scope)
- Freshness (components.md staleness)
- Actionable suggestions

---

## Benefits

### For LLMs

1. **Token Efficiency:** Load 50 tokens of metadata before 2,500 tokens of content (98% savings)
2. **Smart Navigation:** Discover relationships without loading files
3. **Context Planning:** Estimate token usage before loading
4. **Task Filtering:** Load only organons required for specific tasks

### For Humans

1. **Quick Overview:** Understand organon structure at a glance
2. **Discovery:** Find related organons via frontmatter
3. **Maintenance:** Automated validation prevents drift

### For Tooling

1. **Validation:** Automated tests enforce truthfulness
2. **CI/CD:** Block PRs with invalid frontmatter
3. **Metrics:** Track coverage, token distribution, validation health

---

## Implementation Checklist

- [ ] Add frontmatter to existing organon files (use generator)
- [ ] Write validation tests (19 tests covering all rules)
- [ ] Add CI workflow to enforce validation
- [ ] Update organon creation workflow to include frontmatter
- [ ] Document frontmatter schema (this file!)

---

## Reference Implementation

**Agent Tavern** (100% frontmatter coverage across 49 organon files):
- Schema: `docs/organon-frontmatter-schema.md`
- Generator: `scripts/organon/generate-frontmatter.ts`
- Validator: `scripts/organon/validate-frontmatter.ts`
- Query tool: `scripts/organon/query-frontmatter.ts`
- Health dashboard: `scripts/organon/health.ts`
- Tests: `packages/server/src/__tests__/organon/frontmatter.test.ts`
- CI: `.github/workflows/organon-frontmatter.yml`

**Results:**
- 49/49 files with valid frontmatter (100% coverage)
- ~112K total tokens across all organons
- Average ~2283 tokens per file
- All validation tests passing (19/19)

---

## Trade-offs

**Pros:**
- ✅ Massive token savings (98% for discovery)
- ✅ Automated validation prevents drift
- ✅ LLM-friendly navigation
- ✅ Context budget planning

**Cons:**
- ❌ Initial setup cost (add frontmatter to existing files)
- ❌ Maintenance overhead (keep frontmatter current)
- ❌ Tooling dependency (generator, validator)

**Mitigation:**
- Auto-generation minimizes manual work
- Validation in CI catches drift early
- Tools are simple TypeScript (easy to maintain)

---

## Related Patterns

- **Progressive Disclosure** — Load metadata → summary → full content
- **Bidirectional References** — Organons cite each other mutually
- **Auto-Generation** — Frontmatter generated from file content
- **Truthfulness Validation** — Metadata must match reality

---

## Changelog

- **v1.0** (2026-02-08): Initial implementation in Agent Tavern
  - Complete schema design
  - 4 tools (generate, validate, query, health)
  - 100% coverage across 49 files
  - 19 comprehensive tests
  - CI enforcement
