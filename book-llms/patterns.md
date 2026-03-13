---
type: rationale
scope: meta
name: patterns
version: "1.3"
summary: Common patterns and anti-patterns — progressive disclosure, enforcement loop, code mapping, verification, onboarding, and more
token_estimate: 9600
pattern_count: 21
inherits_from: [meta-organon]
load_priority: medium
required_for:
  - organon_creation
  - organon_review
audience: [llm, human]
related_files:
  - ETHOS.md
  - three-layer-architecture.md
  - frontmatter-system.md
  - templates.md
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

## Explore-Before-Ethos Pattern

**When to use:** Technical feasibility unknown, novel domain, high technical risk.

**When NOT to use:** Well-understood domain, proven patterns, adding to existing system.

### The Problem

Ethos-First Development assumes you can articulate invariants from first principles. But in novel domains, you don't know what's possible until you try. Writing ETHOS prematurely risks:

- **Impossible invariants** — Discovered during implementation, requiring ETHOS rewrites
- **Over-constraining** — Overly strict invariants block valid solutions
- **Under-constraining** — Missing critical constraints because risks aren't obvious
- **Rework cost** — Rewriting ETHOS mid-implementation wastes design effort

### The Solution

Time-boxed exploration before committing to constraints:

```
1. EXPLORE (time-boxed: 1-2 days max)
   - Build throwaway spike/prototype
   - Answer: What's possible? What's not? What's expensive?
   - Test competing approaches
   - Goal: Discover technical constraints, not production code

2. DOCUMENT CONSTRAINTS
   - Capture learnings: "X is possible," "Y is impossible," "Z requires trade-off"
   - Identify which constraints are real (tech limits) vs preferences (design choices)
   - Write findings in tmp/ or similar (throwaway documentation)

3. WRITE ETHOS
   - Codify real constraints as invariants
   - Document design choices as principles
   - Decision heuristics based on real scenarios encountered
   - Now grounded in reality, not speculation

4. IMPLEMENT PROPERLY
   - Follow ETHOS (now validated)
   - Standard Ethos-First Development from here
   - ETHOS can still evolve (Same-PR principle)
   - But major constraints already validated (less rework)
```

### Decision Heuristic: Which Pattern to Use?

| Situation | Pattern | Rationale |
|-----------|---------|-----------|
| Adding to existing system, proven patterns | **Ethos-First** | Constraints knowable upfront |
| Novel architecture, unfamiliar tech | **Explore-Before-Ethos** | Technical feasibility unknown |
| First-of-its-kind feature | **Explore-Before-Ethos** | No prior art, high uncertainty |
| Multiple approaches with unclear trade-offs | **Explore-Before-Ethos** | Exploration evaluates options |
| High confidence in constraints | **Ethos-First** | Don't over-optimize for uncertainty |
| Uncertain which applies | **Lightweight Ethos-First** | Write 2-3 invariants, expand as you learn |

**Default:** Ethos-First Development (bias toward action, not analysis paralysis)

**Exception:** Explore-Before-Ethos only when uncertainty is HIGH

### Example: Testing Framework

For a full walkthrough comparing Ethos-First vs Explore-Before-Ethos for novel domains (including the testing framework example), see [RFC 003](../rfcs/003-explore-before-ethos.md).

**Key difference:**
- Ethos-First: Write ETHOS → Implement → Discover constraints invalid → Rewrite ETHOS
- Explore-Before-Ethos: Explore → Validate constraints → Write ETHOS → Implement

**Time saved:** 1-3 days (avoid ETHOS rewrites)

**When it's worth it:** Novel domains (>50% of constraints uncertain). Not worth it for routine work.

### Anti-Pattern: Permanent Prototyping

**Bad:** Prototype indefinitely without committing to constraints
- No ETHOS ever written (exploration becomes implementation)
- Ad-hoc decisions without guiding principles
- Time-box violations (2 days becomes 2 weeks)
- Analysis paralysis (never confident enough to define constraints)

**Good:** Time-boxed exploration → ETHOS → implementation
- Exploration has clear goal (discover constraints)
- Time-box enforced (1-2 days max)
- ETHOS codifies learnings (captures knowledge)
- Implementation follows validated constraints

**Mitigation:** Strict time-boxing (1-2 days). After time-box, must write ETHOS even if some uncertainty remains. Perfect knowledge is impossible; "good enough" knowledge is the goal.

### Integration with Same-PR Principle

Explore-Before-Ethos still follows Same-PR principle:

- **Exploration code:** THROWAWAY (not committed to any branch)
- **Final PR:** ETHOS + PHILOSOPHY + implementation (all together)
- **ETHOS evolution:** Can still evolve during implementation (based on further learning)

**The difference:** Exploration happens BEFORE the PR branch is created, not during implementation on the branch.

**Timeline:**
```
Traditional Ethos-First:
  Create branch → Write ETHOS → Implement → Open PR (ETHOS + code)

Explore-Before-Ethos:
  Explore (no branch) → Create branch → Write ETHOS → Implement → Open PR (ETHOS + code)
```

Exploration is "pre-work" (like RFC writing), not implementation work.

### When This Pattern Adds Value

**High value (use it):**
- Novel architecture (no prior art in this codebase)
- Unfamiliar technology (team learning new framework/paradigm)
- Multiple competing approaches (unclear which is best)
- High-risk constraints (performance, security, correctness concerns)

**Low value (skip it):**
- Routine feature addition (patterns proven)
- Experienced team in familiar domain
- Constraints are obvious (no technical uncertainty)
- Time pressure (ship fast, refine later)

**Cost-benefit:**
- **Cost:** 1-2 days exploration + overhead of managing throwaway code
- **Benefit:** Avoid 1-5 days of ETHOS rewrites + implementation rework
- **Break-even:** If >30% of constraints uncertain, exploration likely pays for itself

### Related Patterns

**Complements:**
- **Ethos-First Development** — Standard pattern, Explore-Before-Ethos is exception
- **Same-PR Principle** — Both patterns follow this (organon + code land together)
- **RFC-Driven Evolution** — RFCs proposing novel domains should declare which pattern used

**Conflicts with:**
- None (this is additive, not replacing existing patterns)

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
| Orphaned binding | Binding exists without protocol reference | Add `protocol_id` and `protocol_file` to the binding |
| Phantom automation | Protocol claims `automated` but binding doesn't exist | Create binding or change tier to `manual` |
| Ad-hoc organon evolution | Constraints added/changed without review | Use same-PR principle; review constraint changes in PRs |
| Deferred organon update | "I'll update the organon later" after code lands | Same-PR principle: organon changes in the same PR as implementation |
| Mixed methodology and product | Process docs in `organon/domains/`, product docs in `organon/methodology/` | Separate: methodology for how-we-build, domains/features for what-it-does |
| Untested invariant | Invariant in ETHOS.md but no tier-4 test verifies it | Add organon test with `@organon-invariant` annotation referencing the invariant |
| Stale code mapping | components.md doesn't match current code | Regenerate via idempotent tool and enforce freshness in CI |

---

## Related Files

| File | Relationship |
|------|--------------|
| [overview.md](./overview.md) | High-level methodology overview |
| [ETHOS.md](./ETHOS.md) | Core invariants these patterns implement |
| [three-layer-architecture.md](./three-layer-architecture.md) | Enforcement loop architecture |
| [frontmatter-system.md](./frontmatter-system.md) | Progressive disclosure pattern |
| [templates.md](./templates.md) | Pattern scaffolds |
