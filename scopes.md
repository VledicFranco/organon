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
│ docs/           │  │ src/            │  │ deploy/         │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │
         ├─────────────────────┬─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ FEATURE ORGANON │  │ FEATURE ORGANON │  │ FEATURE ORGANON │
│ features/auth/  │  │ features/cache/ │  │ features/api/   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Scope Definitions

| Scope | Location | Governs | Example Content |
|-------|----------|---------|-----------------|
| **Product** | Repo root | Entire project | "This is a type-safe pipeline framework" |
| **Domain** | `docs/`, `src/`, `deploy/` | A major area | "Documentation uses two surfaces" |
| **Feature** | `features/X/`, `docs/features/X/` | A capability | "Caching has max 24h TTL" |
| **Component** | `src/components/X/` | An implementation | "Parser must not depend on runtime" |

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

---

## When to Create Scopes

| Signal | Action |
|--------|--------|
| Domain has unique constraints not applicable elsewhere | Create domain organon |
| Feature requires specialized decision guidance | Create feature organon |
| Different agents work on different parts independently | Scope organons to their areas |
| Parent ethos exceeds 150 lines | Split into child scopes |
| Constraints apply project-wide | Keep in product organon (don't split) |

---

## File Locations

| Scope | Files |
|-------|-------|
| Product | `/PHILOSOPHY.md`, `/ETHOS.md` |
| Domain | `/docs/PHILOSOPHY.md`, `/docs/ETHOS.md` |
| Feature | `/docs/features/X/PHILOSOPHY.md`, `/docs/features/X/ETHOS.md` |
| Component | `/src/components/X/ETHOS.md` (philosophy usually unnecessary) |

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

**Documentation Organon (`/docs/ETHOS.md`):**
```markdown
## Identity
- IS: LLM-optimized documentation
- IS NOT: Tutorials, marketing, API reference

## Invariants
1. Code is source of truth
2. README as router (every directory has README.md)
3. File size limits (content < 200 lines)

(Inherits: no runtime type errors, modules are pure, API compatibility)
```

**Feature Organon (`/docs/features/caching/ETHOS.md`):**
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

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Repeating parent constraints in child | Maintenance burden, divergence risk | Delete duplicates, rely on inheritance |
| Child contradicting parent | Violates inheritance model | Remove contradiction or update parent |
| Too many scope levels | Navigation overhead | Flatten to max 3 levels (product → domain → feature) |
| Organon at wrong scope | Constraints don't match scope | Move to appropriate level |
