# Artifact Scopes: Hierarchical Philosophy and Ethos

> How philosophy/ethos/protocol artifacts apply at different levels of a project.

---

## The Problem

A single project-level ethos cannot adequately govern all domains. Consider:

- The **codebase** has behavioral constraints (naming conventions, error handling patterns)
- The **documentation** has different constraints (file sizes, cross-referencing rules)
- Individual **features** have domain-specific constraints (resilience must be declarative)
- **Components** have implementation constraints (runtime must not depend on compiler)

A monolithic ethos either becomes too long to be useful, or too abstract to guide specific decisions. Different agents working on different parts of the system need focused guidance.

---

## The Solution: Scoped Artifacts

Philosophy/ethos/protocol artifacts exist at multiple **scopes**. Each scope governs a specific domain, and scopes form a hierarchy:

```
┌─────────────────────────────────────────────────────────────┐
│                     PRODUCT SCOPE                           │
│                                                             │
│   Repo root: PHILOSOPHY.md, ETHOS.md                        │
│   Governs: The entire codebase and project                  │
│   Example: "Constellation is a type-safe pipeline DSL"      │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌───────────────────┐ ┌───────────────┐ ┌───────────────────┐
│ DOCUMENTATION     │ │ SOURCE CODE   │ │ DEPLOYMENT        │
│ SCOPE             │ │ SCOPE         │ │ SCOPE             │
│                   │ │               │ │                   │
│ docs/PHILOSOPHY   │ │ src/ETHOS     │ │ deploy/ETHOS      │
│ docs/ETHOS        │ │ (if needed)   │ │ (if needed)       │
└───────────────────┘ └───────────────┘ └───────────────────┘
            │
            ├─────────────────┬─────────────────┐
            ▼                 ▼                 ▼
┌───────────────────┐ ┌───────────────┐ ┌───────────────────┐
│ FEATURE SCOPE     │ │ FEATURE SCOPE │ │ FEATURE SCOPE     │
│                   │ │               │ │                   │
│ features/X/       │ │ features/Y/   │ │ features/Z/       │
│ PHILOSOPHY.md     │ │ PHILOSOPHY.md │ │ PHILOSOPHY.md     │
│ ETHOS.md          │ │ ETHOS.md      │ │ ETHOS.md          │
└───────────────────┘ └───────────────┘ └───────────────────┘
```

---

## Scope Levels

### Product Scope

**Location:** Repository root (`PHILOSOPHY.md`, `ETHOS.md`)

**Governs:** The entire project—what it is, what it isn't, core invariants that apply everywhere.

**Content:**
- Product identity (IS/IS NOT)
- Fundamental design decisions
- Cross-cutting constraints (error handling philosophy, naming conventions)
- Technology choices and their rationale

**Example statements:**
- "Constellation is a pipeline orchestration framework, not a general-purpose language."
- "Type safety is enforced at compile time. Runtime type errors are bugs."
- "All public APIs must be backwards-compatible within a major version."

**Who reads it:** Any agent working on any part of the codebase.

---

### Domain Scope

**Location:** Top-level directories (`docs/`, `src/`, `deploy/`, `tests/`)

**Governs:** A specific domain within the project with its own concerns.

**Content:**
- Domain-specific identity
- Constraints unique to this domain
- Relationships to other domains
- Domain-specific decision heuristics

**Example domains:**

| Domain | Governed By | Key Constraints |
|--------|-------------|-----------------|
| Documentation | `docs/ETHOS.md` | File size limits, cross-referencing rules, two-surface consistency |
| Source code | `src/ETHOS.md` | Module dependencies, test coverage requirements |
| Deployment | `deploy/ETHOS.md` | Environment parity, secret management |

**Who reads it:** Agents working within that domain.

---

### Feature Scope

**Location:** Feature directories (`docs/features/X/`, `src/features/X/`)

**Governs:** A specific capability or functional area.

**Content:**
- Feature-specific design rationale
- Constraints unique to this feature
- Component cross-references
- Feature-specific protocols

**Example features:**

| Feature | Key Philosophy | Key Ethos Constraint |
|---------|----------------|---------------------|
| Resilience | "Failures are normal, not exceptional" | "All resilience options must validate at compile time" |
| Type Safety | "Types are documentation that the compiler enforces" | "Never use Any or unchecked casts" |
| Parallelization | "Parallelism should be automatic, not manual" | "Module execution must be side-effect free" |

**Who reads it:** Agents working on that specific feature.

---

### Component Scope

**Location:** Component directories (`src/components/X/`, `modules/X/`)

**Governs:** A specific implementation module or technical component.

**Content:**
- Component responsibilities and boundaries
- Internal design decisions
- Integration constraints with other components
- Component-specific protocols (testing, releasing)

**Who reads it:** Agents modifying that component's implementation.

---

## Inheritance and Override

Scopes form an inheritance hierarchy:

```
Product Ethos
    ↓ inherits
Domain Ethos (adds domain-specific constraints)
    ↓ inherits
Feature Ethos (adds feature-specific constraints)
    ↓ inherits
Component Ethos (adds implementation constraints)
```

### Rules

1. **Child scopes inherit parent constraints.** A feature ethos doesn't need to repeat "use conventional commits"—that's in the product ethos.

2. **Child scopes can add constraints.** A feature ethos can add "all resilience options must be compile-time validated" on top of product-level constraints.

3. **Child scopes cannot contradict parents.** If the product ethos says "no runtime type errors," a feature ethos cannot say "runtime type errors are acceptable here."

4. **More specific scope wins for ambiguity.** If the product ethos says "prefer simplicity" and the feature ethos says "prefer exhaustive error handling," the feature-specific guidance applies within that feature.

---

## When to Create Scoped Artifacts

### Create a new scope when:

| Signal | Action |
|--------|--------|
| A domain has unique constraints not applicable elsewhere | Create domain-level ethos |
| A feature requires specialized decision-making guidance | Create feature-level philosophy/ethos |
| Different agents will work on different parts independently | Scope artifacts to their working areas |
| The parent-level ethos is becoming too long | Split into child scopes |

### Don't create a new scope when:

| Signal | Action |
|--------|--------|
| Constraints apply project-wide | Keep in product ethos |
| The domain is small and simple | Inherit from parent |
| Creating scope adds overhead without clarity | Keep it simple |

---

## Navigation Pattern for LLMs

When an LLM starts work on a specific area:

```
1. Read product ethos (always)
       ↓
2. Read domain ethos (if working in that domain)
       ↓
3. Read feature ethos (if working on that feature)
       ↓
4. Read component ethos (if modifying that component)
```

**Each level adds specificity.** The product ethos provides baseline behavior; each child scope adds domain-specific guidance.

### Example Navigation

An agent tasked with "add a new resilience option" would read:

1. `ETHOS.md` (product) — general codebase constraints
2. `docs/ETHOS.md` (domain) — if updating documentation
3. `docs/features/resilience/ETHOS.md` (feature) — resilience-specific rules
4. Component ethos — if modifying runtime or compiler internals

---

## Practical Example: Constellation Engine

Constellation uses three active scopes:

### Product Scope (repo root)

```
PHILOSOPHY.md — Why Constellation exists
- Pipeline composition deserves a DSL
- Type safety must be compile-time
- Modules are black boxes

ETHOS.md — Codebase behavioral constraints
- IS: Type-safe pipeline orchestration framework
- IS NOT: General-purpose language, workflow engine, ETL tool
- Invariants: No runtime type errors, modules are pure, etc.
```

### Documentation Scope (docs/)

```
docs/PHILOSOPHY.md — Why documentation is structured this way
- Two surfaces: LLM-optimized (docs/) and human-optimized (website/docs/)
- Feature-driven organization
- Philosophy/ethos per domain

docs/ETHOS.md — Documentation behavioral constraints
- Code is the source of truth
- README as router (every directory has README.md)
- File size limits (README <100 lines, content <200 lines)
- No duplication (link, don't copy)
```

### Feature Scope (docs/features/X/)

```
docs/features/resilience/PHILOSOPHY.md
- Why resilience is declarative
- Why options compose

docs/features/resilience/ETHOS.md
- All options validate at compile time
- Options must be orthogonal (composable)
- Sensible defaults, explicit overrides
```

---

## File Naming Convention

| Scope | Philosophy | Ethos | Protocol |
|-------|------------|-------|----------|
| Product | `PHILOSOPHY.md` | `ETHOS.md` | `PROTOCOL.md` |
| Domain | `<domain>/PHILOSOPHY.md` | `<domain>/ETHOS.md` | `<domain>/PROTOCOL.md` |
| Feature | `<domain>/features/<feature>/PHILOSOPHY.md` | ... | ... |
| Component | `<domain>/components/<component>/PHILOSOPHY.md` | ... | ... |

All uppercase filenames signal "meta-documentation"—documents about how to work, not what the system does.

---

## Summary

| Concept | Description |
|---------|-------------|
| **Scope** | A level at which philosophy/ethos/protocol artifacts apply |
| **Inheritance** | Child scopes inherit parent constraints |
| **Override** | Child scopes can add (not contradict) constraints |
| **Navigation** | LLMs read from product → domain → feature → component |

**Key insight:** Scoped artifacts let you write focused, actionable guidance at each level without creating a single overwhelming document. An agent working on documentation doesn't need to wade through component implementation constraints, and vice versa.

---

## Next Steps

- [01-terminology.md](./01-terminology.md) — Definitions of philosophy, ethos, protocol
- [02-documentation-layers.md](./02-documentation-layers.md) — The three-layer documentation model
- 04-ethos-patterns.md — Common patterns in well-structured ethos documents (planned)
