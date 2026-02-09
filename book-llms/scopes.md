---
type: rationale
scope: meta
name: scopes
version: "3.0"
summary: How organons apply at different levels — product, domain, feature, component — with inheritance rules and navigation patterns
token_estimate: 2900
inherits_from: [meta-organon]
load_priority: medium
required_for:
  - organon_creation
  - scope_decisions
audience: [llm, human]
---

# Organon Scopes

> How organons apply at different levels of a project.

---

## Scope Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCT ORGANON                        │
│   Location: repo root (PHILOSOPHY.md, ETHOS.md)             │
│   Governs: entire codebase                                  │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ DOMAIN ORGANON  │  │ DOMAIN ORGANON  │  │ DOMAIN ORGANON  │
│ organon/domains │  │ organon/domains │  │ organon/domains │
│ /billing/       │  │ /agents/        │  │ /tenants/       │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │
         ├─────────────────────┬─────────────────────┐
         ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ FEATURE ORGANON  │  │ FEATURE ORGANON  │  │ FEATURE ORGANON  │
│ organon/features │  │ organon/features │  │ organon/features │
│ /auth/           │  │ /cache/          │  │ /api/            │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Scope Definitions

| Scope | Location | Governs | Example Content |
|-------|----------|---------|-----------------|
| **Product** | Repo root | Entire project | "This is a type-safe pipeline framework" |
| **Domain** | `organon/domains/X/` | A business bounded context | "Agents emit events, quests track work" |
| **Feature** | `organon/features/X/` | A user capability | "Caching has max 24h TTL" |
| **Component** | `organon/components/X/` | An implementation unit | "Parser must not depend on runtime" |
| **Methodology** | `organon/methodology/X/` | A development process | "RFCs require organon impact declaration" |

---

## Domains vs Components vs Features

Three distinct scope types serve different purposes:

| Scope Type | Question Answered | Mental Model | Best For |
|------------|-------------------|--------------|----------|
| **Domain** | "What business concepts exist?" | DDD bounded contexts | Business applications |
| **Component** | "Where is the code?" | Code modules | Frameworks, libraries |
| **Feature** | "What can users do?" | User capabilities | Both |

### When to Use Domains

Use **domains** when your project has rich business logic with distinct bounded contexts:

```
organon/domains/
  ├── agents/      ← "What agents are and how they behave"
  ├── quests/      ← "What work items are and their lifecycle"
  ├── billing/     ← "How billing and subscriptions work"
  └── tenants/     ← "Multi-tenancy concepts"
```

**Signals for domains:**
- Project has distinct business entities (users, orders, agents)
- Entities have lifecycle states and events
- Different teams own different domains
- DDD terminology is already in use

### When to Use Components

Use **components** when your project is a framework/library where code structure matters:

```
organon/components/
  ├── core/        ← "modules/core/ - type system"
  ├── runtime/     ← "modules/runtime/ - execution"
  ├── compiler/    ← "modules/lang-compiler/ - parsing"
  └── http-api/    ← "modules/http-api/ - REST server"
```

**Signals for components:**
- Users think in code terms ("the compiler", "the runtime")
- Clear module boundaries exist in codebase
- Components have dependency relationships
- LLMs need direct organon → code navigation

### Using Both

Some projects need both:

```
organon/
  ├── domains/        ← Business concepts
  │   ├── tenants/
  │   └── billing/
  ├── components/     ← Code modules
  │   ├── api/
  │   └── database/
  └── features/       ← User capabilities
      ├── auth/
      └── caching/
```

### When to Use Methodology

Use **methodology** when your project governs its own development process with organons:

```
organon/methodology/
  ├── rfcs/           ← "How we propose and implement changes"
  ├── testing/        ← "How we ensure quality"
  ├── architecture/   ← "How we structure code"
  ├── operations/     ← "How we handle emergencies"
  └── maintenance/    ← "How we keep organons fresh"
```

**Signals for methodology:**
- Team has repeatable development processes worth documenting
- Quality gates or verification procedures exist
- RFC or design-proposal workflow is in use
- The organon system itself needs governance (meta-organon)

**Key distinction:** Product scopes (domains, features, components) document **what the system does**. Methodology documents **how the team builds it**. See `patterns.md` (Methodology Scope Pattern) for the full pattern.

### Decision guide

| Project Type | Primary Structure |
|--------------|-------------------|
| Business application (SaaS, platform) | Domains + Features |
| Framework or library | Components + Features |
| Complex business + technical depth | Domains + Components + Features |
| Team with formal processes | Add Methodology to any of the above |
| Simple project | Features only |

---

## Inheritance Rules

1. **Child inherits all parent constraints.** A feature ethos doesn't repeat "use conventional commits" — that's in product ethos.

2. **Child can add constraints.** Feature ethos can require "cache TTL < 24h" beyond product-level rules.

3. **Child cannot contradict parent.** If product says "no runtime type errors," feature cannot say "type errors acceptable here."

4. **More specific scope wins for ambiguity.** Product says "prefer simplicity," feature says "prefer exhaustive validation" — feature wins within that feature.

---

## Navigation Pattern

When an LLM starts work:

```
1. Read product ethos (always)
       ↓
2. Read domain ethos (if entering that domain)
       ↓
3. Read feature ethos (if working on that feature)
       ↓
4. Begin work with full constraint context
```

**Accumulative:** Each level adds constraints. By step 4, the LLM has internalized product + domain + feature constraints.

**For token-budget-aware loading** (frontmatter-first filtering, budget guidelines): see the [Context Loading Strategy](./patterns.md#context-loading-strategy-pattern) pattern.

---

## When to Create Scopes

| Signal | Action |
|--------|--------|
| Domain has unique constraints not applicable elsewhere | Create domain organon |
| Feature requires specialized decision guidance | Create feature organon |
| Different agents work on different parts independently | Scope organons to their areas |
| Parent ethos covers multiple distinct domains | Split into child scopes |
| Constraints apply project-wide | Keep in product organon (don't split) |

---

## File Locations

| Scope | Files |
|-------|-------|
| Product | `/ETHOS.md`, `/PHILOSOPHY.md` |
| Domain | `/organon/domains/X/ETHOS.md`, `/organon/domains/X/PHILOSOPHY.md` |
| Feature | `/organon/features/X/ETHOS.md`, `/organon/features/X/PHILOSOPHY.md` |
| Component | `/organon/components/X/ETHOS.md` (philosophy usually unnecessary) |
| Methodology | `/organon/methodology/X/ETHOS.md`, `/organon/methodology/X/PROTOCOLS.md` |

**All files require YAML frontmatter.** See `frontmatter-system.md` for the schema.

---

## Example: Three-Scope Project

**Product Organon (`/ETHOS.md`):**
```markdown
## Identity
- IS: Type-safe pipeline orchestration framework
- IS NOT: General-purpose language, workflow engine

## Invariants
1. No runtime type errors
2. Modules are pure functions
3. All public APIs are backwards-compatible within major version
```

**Documentation Organon (`/organon/domains/docs/ETHOS.md`):**
```markdown
## Identity
- IS: LLM-optimized documentation with progressive disclosure
- IS NOT: Tutorials, marketing, API reference

## Invariants
1. Code is source of truth
2. README as router (every directory has README.md)
3. Every file has YAML frontmatter for progressive disclosure

(Inherits: no runtime type errors, modules are pure, API compatibility)
```

**Feature Organon (`/organon/features/caching/ETHOS.md`):**
```markdown
## Identity
- IS: Resilience option for result reuse
- IS NOT: Distributed cache, persistence layer

## Invariants
1. Cache keys include all inputs
2. TTL required, max 24 hours
3. Cache miss executes normally

(Inherits: all product + documentation constraints)
```

---

## Scopes and the Enforcement Loop

Each scope level can have its own protocols, workflows, and tools. The enforcement loop operates at every scope:

- **Product scope:** Project-wide protocols (e.g., pre-merge verification) bind to workflows that enforce product-level invariants
- **Domain scope:** Domain-specific protocols (e.g., event schema validation) bind to workflows that enforce domain invariants
- **Feature scope:** Feature-specific protocols (e.g., cache TTL validation) bind to tools that verify feature constraints

**Progressive disclosure applies to scope navigation.** An LLM uses frontmatter fields (`scope`, `required_for`, `load_priority`) to filter organons by scope before loading. This means a 50-organon project costs ~2,500 tokens to discover — the LLM loads only the scopes relevant to the current task.

**LLM-centric scope loading order:** The LLM reads product organon first (always), then domain (if entering that domain), then feature (if working on that feature). Each level adds constraints. By the time the LLM begins work, it has internalized the full constraint hierarchy without loading irrelevant scopes.

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Repeating parent constraints in child | Maintenance burden, divergence risk | Delete duplicates, rely on inheritance |
| Child contradicting parent | Violates inheritance model | Remove contradiction or update parent |
| Too many scope levels | Navigation overhead | Flatten to max 3 levels (product → domain → feature) |
| Organon at wrong scope | Constraints don't match scope | Move to appropriate level |
