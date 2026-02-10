---
type: rationale
scope: meta
name: patterns
version: "3.0"
summary: Common patterns and anti-patterns — progressive disclosure, enforcement loop, code mapping, verification, onboarding, and more
token_estimate: 8800
pattern_count: 21
inherits_from: [meta-organon]
load_priority: medium
required_for:
  - organon_creation
  - organon_review
audience: [llm, human]
---

# Organon Patterns

> Common patterns for human-machine collaborative projects.

---

## Documentation Layers

Three documentation layers serve different consumers:

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 1: CODE                            │
│   Inline comments, docstrings, type signatures              │
│   Consumer: Compilers, IDEs, developers                     │
│   Truth: AUTHORITATIVE                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 LAYER 2: LLM DOCUMENTATION                  │
│   Structured knowledge base (docs/)                         │
│   Consumer: LLMs, agents, tools                             │
│   Truth: DERIVED from code                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                LAYER 3: HUMAN DOCUMENTATION                 │
│   Narratives, tutorials, marketing (website/docs/)          │
│   Consumer: Humans                                          │
│   Truth: INTERPRETED                                        │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Optimization | Key Constraint |
|-------|--------------|----------------|
| Code | Correctness | Must compile/run |
| LLM docs | Progressive disclosure | Frontmatter + sections for layered access |
| Human docs | Understanding | Progressive disclosure, visuals |

**Consistency rule:** When layers conflict, code wins. Fix docs to match code.

---

## Progressive Disclosure Pattern

**The core pattern for token-efficient organons.** Replaces hard line limits with layered access.

### The Problem

LLMs have finite context windows. Loading entire organon files wastes tokens on irrelevant content. But hard line limits (e.g., "max 200 lines") sacrifice content quality for brevity — important invariants get omitted, examples get cut, coherent documents get split artificially.

### The Solution

Structure every file so agents can access it in progressively deeper layers:

```
Layer 0: README-as-Router        ~50 tokens    "What files exist in this directory?"
    ↓
Layer 1: Frontmatter             ~25-50 tokens "What is this file? Should I load it?"
    ↓
Layer 2: Section Headings        ~100 tokens   "What sections does it contain?"
    ↓
Layer 3: Specific Section        variable      "Load just ## Invariants"
    ↓
Layer 4: Full File               full cost     "Load everything"
```

### How it works

**Layer 0 — README-as-Router:** Every directory has a README.md that lists contents with one-line descriptions. An agent reads this first to decide which files to explore. READMEs are the only files with a soft size guideline (~100 lines) because they serve purely as navigation.

**Layer 1 — Frontmatter:** YAML frontmatter at the top of every file provides metadata: `type`, `scope`, `name`, `summary`, `token_estimate`, `relationships`. Costs ~25-50 tokens. An agent can query frontmatter across dozens of files in one pass and select only the relevant ones.

**Layer 2 — Section Headings:** Standardized `## Heading` structure lets agents scan the table of contents without reading content. An agent that sees `## Identity`, `## Invariants`, `## Principles`, `## Decision Heuristics` knows exactly what's available.

**Layer 3 — Specific Section:** Agents load only the section they need. Working on a tool implementation? Load `## Decision Heuristics`. Reviewing a PR? Load `## Invariants`. This is where the real savings happen — a 500-line file costs ~40 lines to get just the invariants.

**Layer 4 — Full File:** Load entire content. Rare — usually only during organon creation, review, or methodology evolution.

### Token savings example

A project with 49 organon files (~112K total tokens):

| Approach | Tokens loaded | Savings |
|----------|---------------|---------|
| Load all files | 112,000 | 0% |
| Frontmatter filter → load 3 relevant files | ~8,000 | 93% |
| Frontmatter filter → section-level load | ~2,000 | 98% |

### Key principle

**Files can be any size.** A 550-line file with good frontmatter and standardized sections is more token-efficient than a 150-line file without either, because the agent loads only what it needs. Quality and completeness of content must never be sacrificed for brevity.

---

## README as Router

Every directory has a `README.md` that serves as navigation:

```markdown
---
type: navigation
scope: [scope]
name: [directory-name]
version: "1.0"
summary: Navigation for [directory-name]
token_estimate: 200
provides: [list of what this directory contains]
parent: [parent-directory]
---

# Directory Name

Brief summary (1-2 sentences).

## Contents

| Path | Description |
|------|-------------|
| [child-a/](./child-a/) | What child-a covers |
| [child-b.md](./child-b.md) | What child-b covers |
```

**Purpose:** LLMs navigate by reading READMEs to decide which child to explore. This is Layer 0 of progressive disclosure.

**Guideline:** READMEs are routers, not content. Keep them focused on navigation (~100 lines). If a README is growing, the content belongs in a dedicated file.

---

## Frontmatter-First Pattern

Every organon file starts with YAML frontmatter. This is Layer 1 of progressive disclosure.

```yaml
---
type: constraints          # What kind of file
scope: domain              # Where in the hierarchy
name: genesis              # Unique identifier
version: "1.0"             # Semantic version
summary: Invariants...     # One-sentence preview (max 200 chars)
token_estimate: 2800       # Full file token cost
inherits_from: [product]   # Parent scope
load_priority: high        # Triage importance
required_for:              # Task-specific filtering
  - genesis_tool_implementation
audience: [llm, human]     # Who consumes this
---
```

**Purpose:** Agents spend ~25-50 tokens to decide whether to load ~2,500 tokens. 98% token savings on files that aren't needed.

**Required fields:** `type`, `scope`, `name`, `version`, `summary`, `token_estimate`. See `frontmatter-system.md` for the full schema and type-specific fields.

---

## Standardized Section Headings Pattern

Each artifact type uses predictable headings so agents can do section-level loading (Layer 3).

### ETHOS.md headings

```markdown
## Identity          ← IS/IS NOT boundaries
## Invariants        ← Rules that must never be violated
## Principles        ← Prioritized guidelines (lower number = higher priority)
## Decision Heuristics  ← "When X, do Y" tables
```

### PHILOSOPHY.md headings

```markdown
## The Problem       ← What pain exists
## The Bet           ← Core approach chosen
## Design Decisions  ← Numbered decisions with rationale
## Trade-offs        ← What we gained vs sacrificed
```

### PROTOCOL.md headings

```markdown
## Goal              ← What success looks like
## Preconditions     ← What must be true before starting
## Steps             ← Numbered actions
## Verification      ← How to confirm completion
```

**Purpose:** An agent that needs only invariants reads from `## Invariants` to the next `##`. It never pays the token cost of sections it doesn't need, regardless of file size.

**Invariant:** These headings must not be renamed, reordered, or nested differently. They are a contract between file authors and consuming agents.

---

## Component Cross-References

Feature docs link to implementation without duplicating:

```markdown
## Components Involved

| Component | Role | Key Files |
|-----------|------|-----------|
| runtime | Cache execution | `CacheExecutor.scala` |
| compiler | Option validation | `OptionValidator.scala` |
```

**Purpose:** Bridges "what it does" (features) to "where it's implemented" (components).

---

## Ethos-First Development

When starting a new feature or domain:

```
1. Write ETHOS.md first (with frontmatter)
   - Forces clarity about constraints
   - Defines identity boundaries
   - Establishes decision heuristics

2. Implement the feature
   - Ethos guides decisions
   - Violations surface early

3. Write PHILOSOPHY.md (with frontmatter)
   - Explains decisions made during implementation
   - Documents trade-offs discovered

4. Write protocols as patterns emerge
   - Repeatable tasks get protocols
   - One-off tasks stay in ethos heuristics
```

---

## Identity Boundary Pattern

Every ethos starts with explicit boundaries:

```markdown
## Identity

### What [This] IS
- [Positive definition 1]
- [Positive definition 2]

### What [This] IS NOT
- [Exclusion 1]
- [Exclusion 2]
```

**Purpose:** Prevents scope creep. LLMs know what's out of bounds.

**Test:** For any proposed action, can you answer "Does this fit the IS and avoid the IS NOT?" If unclear, boundaries need refinement.

---

## Prioritized Principles Pattern

Principles are numbered by priority:

```markdown
## Principles (Prioritized)

1. **Safety over speed.** Never sacrifice correctness for performance.
2. **Explicit over implicit.** Prefer verbose clarity over clever brevity.
3. **Simple over complete.** Solve the common case well before edge cases.
```

**Conflict resolution:** When principles conflict, lower number wins (higher priority).

**Example conflict:** "Make it fast" vs "Make it safe" → Safety wins (principle 1 beats principle 3).

---

## Decision Heuristic Pattern

Pre-computed answers for recurring ambiguous situations:

```markdown
## Decision Heuristics

| Situation | Action |
|-----------|--------|
| When cache TTL is unspecified | Use 5 minutes |
| When two approaches seem equal | Choose the simpler one |
| When blocked by external dependency | Document blocker, move to next task |
```

**Format:** "When [situation], [action]"

**Benefit:** Eliminates per-decision reasoning. Saves tokens, ensures consistency.

---

## Protocol Invocation Pattern

Protocols are invoked by name, not embedded:

```markdown
## Heuristics

- When situation X occurs, follow the [Relevant Protocol](./protocols/example.md)
```

<!-- TODO: Document pre-merge and release protocols as concrete examples -->

**Purpose:** Ethos stays focused on constraints. Protocols handle procedures.

---

## Enforcement Loop Pattern

The pattern that makes organons executable, not just readable. Three layers form a closed loop:

```
Protocols (Knowledge)     →  "What must happen" — PROTOCOLS.md in organon hierarchy
    ↓
Workflows (Agent Binding) →  "How to orchestrate" — agent-specific (skills, rules, workflow docs)
    ↓
Tools (Operations)        →  "How to execute" — CLI commands, MCP tools, scripts
    ↓
Verification              →  "Did it work?" — automated checks close the loop
    ↓
    └──────────────────── back to Protocols (evolve)
```

**Technology-agnostic:** Protocols and tools are universal. The workflow layer is the only agent-specific part — it adapts to Claude Code skills, Cursor rules, generic workflow docs, or any LLM's native format.

**Automation tiers:** Not every protocol needs a workflow.

| Tier | Criteria | Has Workflow? |
|------|----------|---------------|
| Automated | ≥5 steps, cross-domain, error-prone, frequent | Yes |
| Semi-Automated | 1-2 steps, single tool, infrequent | No (tool only) |
| Manual | Judgment required, context-dependent | No (docs only) |

**Bidirectional references:** If a protocol declares `automation_tier: automated`, the referenced workflow must exist and reference back via `protocol_id`. See `three-layer-architecture.md` for the full specification, universal contracts, and implementation guidance.

**Why it matters:** Without this loop, organons are documentation. With it, they're enforced constraints. The LLM reads the organon, executes the workflow, invokes tools, and verification catches violations — automatically.

---

## Verification Checklist Pattern

Both ethos and protocols end with verification:

**Ethos verification:**
```markdown
## Verification Checklist

Before publishing changes:
- [ ] Frontmatter present with all required fields
- [ ] Frontmatter counts match actual content
- [ ] Identity boundaries respected
- [ ] Invariants not violated
- [ ] Principles applied in priority order
- [ ] Section headings follow standardized structure
```

**Protocol verification:**
```markdown
## Verification

After completion:
- [ ] Tests pass
- [ ] Branch deleted
- [ ] Issue closed
```

---

## Meta-Organon Pattern

A **meta-organon** documents the organon system itself. It's an organon about organons.

```
organon/
  ├── ETHOS.md        ← Meta-level: "How to write organons"
  ├── PHILOSOPHY.md   ← Meta-level: "Why organons work this way"
  ├── README.md       ← Navigation guide
  └── ...             ← Domain/feature organons
```

**Purpose:**
- Self-documenting methodology
- Teaches new contributors how to extend the organon system
- Prevents organon drift by codifying the rules

**Strong Recommendation:** Every project with organons should have a meta-organon. Without it, the methodology itself becomes tribal knowledge.

---

## Organon Directory Structure

Two primary patterns for organizing organon directories:

### Pattern A: Dedicated `organon/` Directory

```
/ETHOS.md                 ← Product-level (root visibility)
/PHILOSOPHY.md            ← Product-level
/organon/
  ├── ETHOS.md            ← Meta-organon
  ├── README.md           ← Navigation
  ├── domains/            ← Business domains (DDD)
  ├── features/           ← User capabilities
  ├── components/         ← Implementation units
  └── protocols/          ← Operational procedures
```

**Recommended when:**
- Project has both LLM docs and human docs
- Clear separation between constraints and documentation needed
- Multiple documentation surfaces exist

### Pattern B: Embedded in `docs/`

```
/docs/
  ├── ETHOS.md            ← Product-level
  ├── PHILOSOPHY.md       ← Product-level
  ├── features/           ← Feature organons
  ├── components/         ← Component organons
  └── protocols/          ← Protocols
```

**Acceptable when:**
- No separate human documentation
- Simpler project structure preferred
- Single documentation surface

**Strong Recommendation:** Place product-level `ETHOS.md` and `PHILOSOPHY.md` at **repository root** for maximum visibility. The first thing any agent (human or LLM) sees should be the constraints.

---

## RFC-Driven Evolution Pattern

Organons must evolve as the system evolves. Without a formal evolution mechanism, organon changes are ad-hoc — constraints drift, rationale is lost, and the gap between "should be" and "what is" widens silently.

### The three-way relationship

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   ORGANON   │         │     RFC     │         │    CODE     │
│ "should be" │ ◄─────► │ "will be"   │ ────────► │  "what is"  │
│             │  cites  │             │ implements│             │
│ Constraints │         │ Proposals   │           │ Reality     │
└─────────────┘         └─────────────┘           └─────────────┘
       ↑                                                │
       └────────────────────────────────────────────────┘
              (implementation updates organon)
```

**Organons** define current constraints. **RFCs** (Request for Comments) propose changes. **Code** implements reality. The loop closes when implementation updates the organon to reflect new constraints.

### RFC lifecycle

RFCs transition through defined states:

| State | Meaning |
|-------|---------|
| **Draft** | RFC is being written |
| **Review** | Complete, awaiting team approval |
| **Accepted** | Team approved design, ready to implement |
| **Implementing** | Code is being written |
| **Implemented** | Code merged, tests passing, organon updated |
| **Superseded** | Replaced by newer RFC |
| **Withdrawn** | Abandoned (with explanation) |

| Transition | Criteria |
|------------|----------|
| Draft → Review | Author declares RFC complete |
| Review → Accepted | Team approves design, organon impact validated |
| Accepted → Implementing | Implementation begins |
| Implementing → Implemented | Code merged + tests passing + organon updated + RFC status updated |

### Organon Impact Declaration

Every RFC declares its organon impact upfront — what organon files it will **Create**, **Update**, or **Delete**:

```markdown
## Organon Impact

### Create
- `organon/domains/new-domain/ETHOS.md` — New domain for X capability
  - Invariant: Y constraint (enforced by Z)

### Update
- `organon/domains/existing/ETHOS.md` — Add invariant N: description

### Delete
- None
```

**Why this matters:** Forces upfront thinking about architectural constraints. Makes organon evolution explicit and auditable. Prevents drift — if code changes but no RFC declared impact, something is missing.

### Same-PR principle

**Organon changes happen in the same PR as implementation, never deferred.** When an RFC lands, the implementing PR includes both code changes and organon updates. This prevents:
- Organon lag (constraints behind code)
- "I'll update the docs later" (which means never)
- Drift between what the organon says and what the code does

### When to RFC vs direct edit

| Change Type | Mechanism |
|-------------|-----------|
| New product-level invariant | RFC required (high bar, team consensus) |
| New domain or feature organon | RFC for the capability |
| Constraint evolution (same identity) | RFC for the capability |
| Clarifications, typos, reference updates | Direct commit (no RFC) |
| File path updates after refactor | Direct commit (no RFC) |

**Rule of thumb:** If the change introduces new constraints or modifies existing ones, use an RFC. If it's maintenance, commit directly.

### Why RFCs close the "Evolve" step

The enforcement loop (Define → Bind → Execute → Verify → **Evolve**) requires a mechanism for the final step. RFCs are that mechanism:
- **Define:** Human writes organon constraints
- **Bind:** Workflow translates protocol to agent steps
- **Execute:** LLM invokes tools
- **Verify:** Tools check compliance
- **Evolve:** RFC proposes new constraints based on what was learned → loop restarts

Without RFCs (or an equivalent), "Evolve" is informal — someone edits an organon file ad-hoc. With RFCs, evolution is deliberate, reviewed, and traceable.

---

## Methodology Scope Pattern

Projects that use organons to govern their own development process need a separate scope for **methodology** — process documentation distinct from product domains and features.

### The distinction

| Scope | Location | Documents | Example |
|-------|----------|-----------|---------|
| Product domains | `organon/domains/` | What the system does | Billing, agents, tenants |
| Product features | `organon/features/` | Cross-domain capabilities | Auth, caching, API |
| Methodology | `organon/methodology/` | How we build the system | RFC process, testing, quality |

**Product organons** describe the system. **Methodology organons** describe the development process. Both use the same artifact types (ETHOS, PHILOSOPHY, PROTOCOL) but serve different scopes.

### Why separate?

Without separation, process documentation mixes with product documentation:

```
organon/domains/rfcs/       ← Is this about RFCs in the product or our RFC process?
organon/domains/testing/    ← Does this govern the product's test features or our testing strategy?
```

With separation:

```
organon/methodology/rfcs/          ← Our internal RFC process
organon/features/rfc-lifecycle/    ← RFC as a product feature (if applicable)
```

### Common methodology domains

| Domain | Purpose |
|--------|---------|
| Architecture | Domain structure patterns, new domain procedures |
| Coding | Generic development guidance for non-RFC work |
| Testing | Testing strategy, coverage thresholds, test tiers |
| Quality | Invariant violation handling, release verification |
| Operations | Emergency procedures, hotfix workflows |
| Maintenance | Organon freshness, auto-generation, drift detection |
| Onboarding | New contributor ramp-up |
| RFCs | Design proposal lifecycle and governance |
| Discoverability | Codebase navigation and search tools |

Not all projects need all of these. Start with the domains that reflect your team's actual processes.

### When to use methodology scope

**Create methodology organon when:**
- Defining a repeatable development process
- Establishing quality gates or verification procedures
- Documenting tooling philosophy
- Making meta-decisions about organon itself

**Don't create methodology organon for:**
- Product features (use `organon/features/`)
- Domain logic (use `organon/domains/`)
- User-facing capabilities (use product organons)

**Rule of thumb:** If it affects how developers work on the project (not what users get), it's methodology.

---

## Code-to-Organon Mapping Pattern

Auto-generated mapping files that connect source code to their owning organon. The mapping is derived from code — never manually edited.

### The problem

In a codebase governed by organons, two navigation questions arise constantly:
- **Code → Organon:** "Which domain owns this file? What constraints govern it?"
- **Organon → Code:** "What files implement this invariant? What code does this domain contain?"

Without a mapping, these questions require manual exploration every time.

### The solution

A `components.md` file per domain, auto-generated from code, providing dual navigation:

```markdown
# Domain: [Name] — Component Map

## By Architectural Layer
| Layer | Files | Exports |
|-------|-------|---------|
| Domain | src/domain/billing/*.ts | BillingService, Invoice |
| Infrastructure | src/infra/billing/*.ts | BillingRepository |

## By Feature
| Feature | Key Files | Events |
|---------|-----------|--------|
| Invoice Generation | src/domain/billing/invoice.ts | InvoiceCreated |
```

**Key properties:**
- **Generated from code** — idempotent regeneration tool (e.g., `organon:generate`)
- **Co-located** — lives alongside the domain's `ETHOS.md`
- **Dual mapping** — navigate by architectural layer OR by feature
- **Bidirectional** — code→organon ("who owns this file?") and organon→code ("what implements this?")
- **Freshness-enforced** — drift detection in CI ensures the mapping matches current code (see [drift detection](./three-layer-architecture.md#drift-detection))

**Frontmatter schema:** Mapping files use `type: mapping` with `file_count` and `last_generated` fields. See [frontmatter-system.md](./frontmatter-system.md#componentsmd-type-mapping) for the full schema.

### When to use

Create a mapping file when a domain has ≥5 source files. Smaller domains don't need the indirection.

---

## Context Loading Strategy Pattern

Token-budget-aware organon loading for LLMs entering a work session.

### The problem

An LLM starting a task doesn't know which organon files to load. Loading all of them wastes context budget. Loading none risks violating constraints.

### The strategy

```
1. ALWAYS load:     Product ETHOS.md              (~400 tokens)
                    Constraints are non-negotiable. Load first.

2. ON-DEMAND load:  Domain organon                 (~300-500 tokens)
                    When entering a specific domain for implementation.

                    Feature organon                (~200-400 tokens)
                    When implementing a cross-cutting feature.

3. FRONTMATTER-FIRST: Query frontmatter before loading
                    Use token_estimate to budget. Use required_for to filter.
                    Use load_priority to triage when budget is tight.
```

**Budget guideline:** Reserve 8-15K tokens for organon context, leaving the majority of the context window for code and conversation. This fits comfortably even in smaller context windows.

**Progressive disclosure in action:** An agent working on billing doesn't load the auth domain organon. It queries frontmatter, finds `scope: billing`, and loads only relevant files.

---

## Structured Onboarding Pattern

A phased ramp-up pattern for both human contributors and LLM sessions entering a project.

### For human contributors

| Phase | Focus | Duration | What to Read |
|-------|-------|----------|-------------|
| **Phase 1: Identity** | Understand project constraints | ~1 week | Product ETHOS.md, PHILOSOPHY.md |
| **Phase 2: Domain** | Understand assigned area | ~1 week | Domain ETHOS.md, components.md |
| **Phase 3: Execution** | First real task with organon guidance | ~1 week | Relevant protocols, decision heuristics |

### For LLM sessions

The same pattern compressed to context loading:

```
1. Load product ETHOS.md           → Understand identity and constraints
2. Load domain organon             → Understand specific constraints for task area
3. Load relevant protocols         → Follow procedures for the task type
4. Begin work                      → Heuristics guide ambiguous decisions
```

**Why it works:** Onboarding is scoped by the organon hierarchy. New contributors don't need to read everything — they read product organon first, then progressively deeper scopes as they take on more specialized work.

---

## Methodology Version Pinning Pattern

Projects that adopt Organon should declare which version of the methodology they follow.

### The problem

The Organon methodology evolves (v1.0 → v2.0 → v3.0). Projects adopt it at a point in time and may not track upstream changes. Without a version declaration, there's no way to know whether a project's organon structure follows current methodology or an older version — drift is invisible.

### The mechanism

Declare `methodology_version` in the project's root organon frontmatter:

```yaml
# In /ETHOS.md or /organon/ETHOS.md
methodology_version: "3.0"
```

**That's it.** No sync tooling, no automatic migration. Version pinning makes drift *visible* — when the methodology advances to v4.0, a project pinned to v3.0 knows it's behind. The decision to upgrade is deliberate, not accidental.

### When to upgrade

| Signal | Action |
|--------|--------|
| New methodology version introduces features you need | Upgrade, follow migration guide |
| New version changes invariants your project relies on | Evaluate impact via RFC before upgrading |
| Project is working fine on current version | No urgency — version pinning is not version pressure |

**Methodology versions follow the same evolution rules as organon changes:** upgrades that modify constraints should go through the project's RFC process. Maintenance-level updates (new optional patterns, clarifications) can be adopted directly.

---

## Anti-Pattern Reference

| Anti-Pattern | Description | Fix |
|--------------|-------------|-----|
| Missing frontmatter | Forces all-or-nothing loading | Add YAML frontmatter with required fields |
| Non-standard headings | Breaks section-level loading | Use standardized headings from ETHOS.md |
| Splitting for size alone | Breaks coherence, adds navigation cost | Keep cohesive content together. Use frontmatter + sections. |
| Philosophy without ethos | Explains but doesn't constrain | Write ethos first |
| Ethos with explanations | "Do X because Y" everywhere | Move "because Y" to philosophy |
| Vague boundaries | "Be reasonable" | Specify concrete actions |
| Duplicate content | Same constraint in multiple places | Single source, link elsewhere |
| Stale organon | Contradicts current code | Update organon or code |
| Missing meta-organon | Organon methodology is undocumented | Create `organon/ETHOS.md` for the system itself |
| Buried product ethos | ETHOS.md hidden in subdirectory | Move to repository root |
| Orphaned workflow | Workflow exists without protocol reference | Add `protocol_id` and `protocol_file` to workflow |
| Phantom automation | Protocol claims `automated` but workflow doesn't exist | Create workflow or change tier to `manual` |
| Ad-hoc organon evolution | Constraints added/changed without RFC or review | Use RFC process for constraint changes; direct commits only for maintenance |
| Deferred organon update | "I'll update the organon later" after code lands | Same-PR principle: organon changes in the same PR as implementation |
| Mixed methodology and product | Process docs in `organon/domains/`, product docs in `organon/methodology/` | Separate: methodology for how-we-build, domains/features for what-it-does |
| Untested invariant | Invariant in ETHOS.md but no tier-4 test verifies it | Add organon test with `@organon-invariant` annotation referencing the invariant |
| Stale code mapping | components.md doesn't match current code | Regenerate via idempotent tool and enforce freshness in CI |
