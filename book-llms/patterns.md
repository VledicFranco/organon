---
type: rationale
scope: meta
name: patterns
version: "1.2"
summary: Common patterns and anti-patterns — progressive disclosure, enforcement loop, code mapping, verification, onboarding, and more
token_estimate: 15800
pattern_count: 24
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

### RFC Structure (Required Sections)

**RFCs have dual nature:** They propose both organon mutation AND technical implementation. The RFC document must contain both plans.

```
RFC NNN: [Feature Name]

1. Problem Statement
   - Why does the organon need to evolve?
   - What gap exists in current constraints?

2. Proposed Solution (Overview)
   - High-level approach (both organon + code)

3. Organon Impact ← REQUIRED: What organon files will say
   ├─ Create
   │  └─ Detailed content: exact invariants, principles, identity
   ├─ Update
   │  └─ Specific changes: which invariants added/modified
   └─ Delete

4. Technical Implementation ← REQUIRED: How code will be built
   ├─ Architecture (package structure, abstractions)
   ├─ API Design (interfaces, function signatures)
   ├─ Implementation Plan (phases, deliverables, weeks)
   └─ Design Decisions (technical trade-offs)

5. Success Metrics
6. Risks & Mitigations
7. Open Questions
8. Dependencies
```

**Why both sections are required:**

- **Organon Impact** defines "should be" (constraints the code must follow)
- **Technical Implementation** defines "will be" (how the code implements those constraints)
- The RFC sits between organon and code, proposing evolution of both
- Same-PR principle: both land together, keeping organon and code in sync

**Common mistake:** Writing only technical plan without detailing organon content, or only organon content without implementation strategy. **RFCs must contain both.**

**Organon Impact detail level:** For new domains/features, include the actual invariant text, principles, and identity statements that will appear in ETHOS.md and PHILOSOPHY.md. Don't just say "will add testing domain" — show what that domain organon will contain.

**Technical Implementation detail level:** Include architecture diagrams, API signatures, phase-by-phase plan with deliverables. Enough detail that implementation can begin without additional design work.

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

## Recursive Collaboration Pattern

**The problem:** LLM-human collaboration lacks guidance on time allocation and improvement cycles. Without structure:
- Planning phases run too long (over-design before execution)
- Review phases run too short (incomplete validation)
- Improvement never happens (no time reserved for compounding)

**The solution:** A four-step collaboration rhythm with explicit time allocation heuristics.

### The Four-Step Loop

```
PLAN (10-20% of session)
  ↓
WORK (60-70% of session)
  ↓
REVIEW (10-20% of session)
  ↓
COMPOUND (5-10% of session)
  ↓
(repeat)
```

### Phase Definitions

**PLAN** — Define the approach before executing
- What's the goal? (Success criteria)
- What's the scope? (What's in/out)
- What's the approach? (High-level strategy)
- What are the risks? (Known unknowns)
- **Output:** Written plan (can be 2-3 paragraphs, doesn't need to be formal)

**WORK** — Execute with focus
- Implement the plan
- Use tools (generate, verify, test)
- Parallel verification running continuously
- Stop when scope complete or time budget exhausted
- **Output:** Working code, passing tests, updated organons

**REVIEW** — Validate results before declaring done
- Does it meet success criteria?
- Do all verification gates pass?
- Are there edge cases we missed?
- Did we violate any invariants?
- **Output:** Confirmation that work is complete, or list of remaining issues

**COMPOUND** — Capture learnings, improve the system
- What was harder than expected? (Add heuristic)
- What steps did we repeat? (Create tool)
- What was unclear? (Update protocol)
- What did we learn? (Update organon if constraint changed)
- **Output:** Updated workflow/protocol/tool/heuristic (optional: updated organon if constraints changed)

### Time Allocation Heuristics

| Session Length | Plan | Work | Review | Compound |
|----------------|------|------|--------|----------|
| **30 min** | 5 min | 20 min | 4 min | 1 min |
| **1 hour** | 8 min | 42 min | 8 min | 2 min |
| **2 hours** | 15 min | 90 min | 20 min | 5 min |
| **4 hours** | 30 min | 180 min | 40 min | 10 min |

**The 80/20 rule:** Spend 80% of time on WORK, 20% on PLAN+REVIEW+COMPOUND. This prevents over-planning and ensures progress.

**The 10% compound rule:** Reserve at least 5-10% of session for compounding. Without explicit reservation, compounding never happens (work expands to fill available time).

**Flexible allocation:** These are starting points, not rigid rules. Adjust based on:
- Complex problem → more PLAN (up to 25%)
- Well-understood problem → less PLAN (down to 5%)
- High-risk change → more REVIEW (up to 25%)
- Routine change → less REVIEW (down to 5%)
- New workflow → more COMPOUND (up to 15%)

### "Trust with Guardrails" Principle

**The principle:** Trust LLMs to execute workflows autonomously, but provide guardrails that catch violations early.

**What this means:**
- **Trust:** LLMs don't need humans to approve every step. Let them work through PLAN → WORK → REVIEW phases autonomously.
- **Guardrails:** Parallel verification, pre-commit hooks, CI gates catch violations before they land. Verification is automated, not manual.
- **Human checkpoint:** Humans review during COMPOUND phase and at final merge. Not every micro-decision.

**Implementation:**
```
┌─────────────────────────────────────────┐
│   LLM Autonomous Zone                   │
│   ┌─────┐   ┌─────┐   ┌─────┐          │
│   │PLAN │ → │WORK │ → │REVIEW│          │
│   └─────┘   └─────┘   └─────┘          │
│   Guardrails running continuously ────► │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Human Checkpoint                      │
│   ┌─────────┐                           │
│   │COMPOUND │ ← Human reviews results   │
│   └─────────┘    + improvement ideas    │
└─────────────────────────────────────────┘
```

**Why this works:**
- LLMs are fast at execution (WORK phase)
- Humans are good at judgment (COMPOUND phase)
- Verification catches rule violations (GUARDRAILS)
- Combines strengths, minimizes weaknesses

### When to Compound

**After every significant work session:**
- Completed an RFC implementation → Compound
- Fixed a complex bug → Compound
- Implemented a new feature → Compound

**Signal that compounding is needed:**
- You repeated the same manual steps 3+ times → Create tool
- Workflow was unclear or had missing steps → Update protocol
- You discovered a new heuristic ("When X, do Y") → Add to ETHOS.md
- Verification caught the same violation twice → Add gate or improve error message

**When NOT to compound:**
- Trivial changes (typo fixes, small edits) → No compound phase needed
- Work didn't reveal new insights → No compound needed (that's fine)
- Time-critical work → Defer compounding to retrospective

### REVIEW Phase: Collaborative Semantic Review

For complex artifacts (RFCs, organons, significant designs), use **collaborative semantic review** — a structured pattern where human and LLM review concepts together.

**The problem:** Traditional review approaches have limitations:
- Pure human review: Slow, might miss semantic inconsistencies
- Pure LLM review: No judgment, might miss context
- Async PR comments: Fragmented, no real-time dialogue

**The solution:** Synchronous, collaborative, concept-by-concept review.

#### The Pattern

```
1. DECOMPOSE
   - Break artifact into conceptual sections (not just headings)
   - Identify logical boundaries (Problem Statement, Proposed Solution, etc.)
   - Create review sequence (usually: foundational concepts first)

2. ANALYZE (LLM-led)
   For each concept:
   - Semantic analysis: Question assumptions, check coherence
   - Identify gaps: What's missing? What's unclear?
   - Check consistency: Does this contradict earlier sections?
   - Present findings as questions, not assertions
   - Output: "Here's what I found, what do you think?"

3. JUDGE (Human-led)
   For each concept:
   - Provide context LLM doesn't have
   - Make decisions: "This makes sense" or "This needs refinement"
   - Add domain knowledge, user perspective, strategic priorities
   - Resolve ambiguities
   - Output: Clear direction ("accept", "refine X", "reject Y")

4. REFINE (Collaborative)
   - LLM updates artifact based on human judgment
   - Human confirms changes or requests iteration
   - Move to next concept when aligned
   - Output: Refined section, ready for next concept

5. REPEAT
   - Continue until all concepts reviewed
   - Final pass: Check cross-concept consistency
   - Output: Artifact ready for approval or implementation
```

#### When to Use

**Use collaborative semantic review for:**
- Complex RFCs (novel domains, significant changes)
- New organon files (ETHOS, PHILOSOPHY for new domains)
- Significant design decisions (architecture changes)
- Methodology evolution (changes to how we work)

**Don't use for:**
- Simple changes (typo fixes, small edits)
- Low-stakes reviews (internal docs, temporary notes)
- Time-critical work (async review is faster)

**Time allocation:** 40-60% of REVIEW phase time (for complex artifacts)

#### Example: RFC Review Session

```
2-hour session, 20 min allocated to REVIEW:

├─ DECOMPOSE (2 min)
│  └─ Break RFC into: Problem Statement, Proposed Solution,
│     Organon Impact, Success Metrics
│
├─ ANALYZE + JUDGE + REFINE (15 min, iterative)
│  ├─ Concept 1: Problem Statement
│  │  └─ LLM: "Three gaps identified. Are they distinct? Is Gap 2 really
│  │     a gap or just missing documentation?"
│  │  └─ Human: "Gap 2 is real. Gap 1 and 3 might overlap. Let's combine."
│  │  └─ LLM: Refines Problem Statement
│  │  └─ Human: "Good, move on."
│  │
│  ├─ Concept 2: Proposed Solution
│  │  └─ [same pattern]
│  │
│  └─ ... (continue through concepts)
│
└─ FINAL CONSISTENCY CHECK (3 min)
   └─ Does solution actually solve all stated problems?
   └─ Any contradictions between sections?
```

#### Why This Works

**LLM strengths:**
- Tireless analysis (can question every assumption)
- Pattern recognition (spot inconsistencies across sections)
- Thoroughness (won't skip hard questions out of politeness)

**Human strengths:**
- Context (knows unstated constraints, history, politics)
- Judgment (can make calls when multiple options are valid)
- Prioritization (knows what matters most)

**Combined:** Fast, thorough, contextual review.

#### Anti-Pattern: Async-Only Review

**Bad pattern:**
```
Write RFC → Post for review → Wait for comments → Address comments → Repeat
Timeline: 1-2 weeks of wall-clock time
```

**Good pattern (collaborative):**
```
Write RFC → Schedule 2-hour review session → Review concept-by-concept
→ Refine in real-time → Done
Timeline: 2 hours of focused time
```

**When async is better:** Multiple stakeholders need to review (can't all be in session).

**When collaborative is better:** Complex artifact, need deep semantic analysis, single decision-maker available.

#### Integration with Four-Step Loop

Collaborative semantic review is a **specific technique for the REVIEW phase**, used when reviewing complex artifacts:

```
PLAN → WORK → REVIEW (use collaborative semantic review for complex artifacts) → COMPOUND
```

Not every REVIEW needs collaborative semantic review (simple changes use standard checks). But for RFCs, organons, and complex designs, this pattern ensures thorough validation before moving to COMPOUND.

### Compound vs Evolve

**Compound** improves methodology (workflows, tools, protocols). Happens frequently.

**Evolve** updates constraints (ETHOS.md, PHILOSOPHY.md). Happens when learning changes what "should be."

| Scenario | Compound or Evolve? | Example |
|----------|-------------------|---------|
| Workflow step was unclear | **Compound** | Update protocol.md for clarity |
| Repeated manual step 3x | **Compound** | Create automation tool |
| Verification caught same issue twice | **Compound** | Improve gate or error message |
| Discovered new architectural constraint | **Evolve** | Add invariant to ETHOS.md |
| Trade-off reasoning changed | **Evolve** | Update PHILOSOPHY.md |

Both are valuable. Compound happens more often (every session). Evolve happens less often (when constraints change).

### Example: RFC Implementation with Compound

```
SESSION 1 (2 hours)
├─ PLAN (15 min)
│  └─ Read RFC, load organon context, plan implementation phases
├─ WORK (90 min)
│  └─ Implement Phase 1 (domain layer + tests)
├─ REVIEW (20 min)
│  └─ Run verification, check coverage, validate tests
└─ COMPOUND (5 min)
   └─ Notice: RFC context loading takes 5 manual steps
   └─ Create: `rfc:load-context` tool to automate it
   └─ Update: RFC workflow to use new tool

SESSION 2 (2 hours)
├─ PLAN (15 min)
│  └─ Plan Phase 2 (organon updates)
├─ WORK (90 min)
│  └─ Create ETHOS.md, PHILOSOPHY.md per RFC spec
│  └─ Use `rfc:load-context` tool (faster than Session 1!)
├─ REVIEW (20 min)
│  └─ Run verification, all gates pass
└─ COMPOUND (5 min)
   └─ Notice: Discovered new invariant (all RFCs need "Organon Impact" section)
   └─ Evolve: Add INV-RFC-3 to methodology/rfcs/ETHOS.md
```

Notice: Compound in Session 1 made Session 2 faster. That's the point.

### Anti-Pattern: No Compound

**Bad pattern:**
```
Session 1: Plan → Work → Review → Done (no compound)
Session 2: Plan → Work → Review → Done (no compound)
Session 3: Plan → Work → Review → Done (no compound)
Result: Repeating same manual steps, never improving efficiency
```

**Good pattern:**
```
Session 1: Plan → Work → Review → Compound (create tool)
Session 2: Plan → Work (faster!) → Review → Compound (update workflow)
Session 3: Plan → Work (even faster!) → Review → Compound (add heuristic)
Result: Each session builds on previous, efficiency compounds
```

### Integration with Enforcement Loop

The Four-Step Loop (Plan → Work → Review → Compound) happens **within** the EXECUTE phase of the Enforcement Loop:

```
Enforcement Loop (macro):
  Define → Bind → [EXECUTE: Four-Step Loop] → Verify → Compound → Evolve

Four-Step Loop (micro):
  Plan → Work → Review → Compound (repeats within EXECUTE phase)
```

The Four-Step Loop is the **operational rhythm**. The Enforcement Loop is the **architectural structure**.

---

## Observation Accumulation Pattern

**The problem:** The COMPOUND phase produces ephemeral insights during a session. Lower-priority observations (findings #2 through #6) vanish between sessions. The agent has no memory of "last session I noticed X, and the session before that I noticed X too — now it's a pattern." There's no intermediate artifact between COMPOUND (single-session) and EVOLVE (formal RFC).

**The solution:** Record observations in structured files that persist across sessions. Load prior observations during future COMPOUND phases so patterns can accumulate over time.

### Convention

- **Directory:** `organon/observations/NNN-descriptive-name.md` at project level
- **Frontmatter:** `type: rationale` (no new artifact type — observations are empirical rationale)
- **Required sections:** Context, Observations (O1..ON with Signal/Implication/Suggested Action), Patterns to Watch
- **Mental model:** Signal (noticed once) → Pattern (confirmed across sessions) → Actionable (root cause understood, clear fix) → Resolved (graduated into methodology)
- **Frontmatter status field:** `status: signal | pattern | actionable | resolved` tracks this lifecycle

### When to record

| When | Who | What to Record |
|------|-----|----------------|
| A workflow didn't work as expected | The executing agent | What happened, expected vs actual, root cause |
| A methodology concept needed ad-hoc interpretation | Agent or human | The ambiguity, decision, reasoning |
| Same friction appeared for the second+ time | Agent that noticed recurrence | Both instances, common root cause |
| Tooling exposed gap between spec and practice | Developer or agent | Spec expectation, actual behavior, the gap |
| A pattern emerged not captured anywhere | Anyone who notices | The pattern, where it appears, why it matters |

**When NOT to record:** Single-occurrence friction you already fixed, opinions without evidence, observations already in methodology guidance, session-specific context that won't generalize.

### Enforcement

The session-compounding workflow is the enforcement mechanism — a structured nudge, not a hard gate. It loads prior observations, asks "anything new worth recording?", and records if the session produced insights worth preserving.

### Relationship to other patterns

Observations fill the gap between **Recursive Collaboration** (COMPOUND phase captures insights in a single session) and **RFC-Driven Evolution** (EVOLVE phase formalizes mature decisions). Observations are the intermediate artifact — they accumulate across sessions until a pattern is clear enough to act on.

See [RFC 005](../rfcs/005-observation-synthesis-loop.md) for the full convention specification.

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

---

## Related Files

| File | Relationship |
|------|--------------|
| [overview.md](./overview.md) | High-level methodology overview |
| [ETHOS.md](./ETHOS.md) | Core invariants these patterns implement |
| [three-layer-architecture.md](./three-layer-architecture.md) | Enforcement loop architecture |
| [workflow-authoring.md](./workflow-authoring.md) | Workflow-specific patterns |
| [frontmatter-system.md](./frontmatter-system.md) | Progressive disclosure pattern |
| [templates.md](./templates.md) | Pattern scaffolds |
