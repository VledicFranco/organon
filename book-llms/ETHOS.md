---
type: constraints
scope: meta
name: meta-organon
version: "1.0"
summary: Core invariants, principles, and heuristics for creating organons — the foundational rules every organon must follow
token_estimate: 5450
invariants_count: 10
principles_count: 9
heuristics_count: 25
invariants:
  - id: INV-META-1
    name: ethos-required
  - id: INV-META-2
    name: identity-first
  - id: INV-META-3
    name: principles-prioritized
  - id: INV-META-4
    name: child-inherits-never-contradicts
    judgment_call: true
  - id: INV-META-5
    name: code-is-source-of-truth
    judgment_call: true
  - id: INV-META-6
    name: every-file-has-frontmatter
  - id: INV-META-7
    name: standardized-section-headings
  - id: INV-META-8
    name: progressive-disclosure-over-limits
    judgment_call: true
  - id: INV-META-9
    name: enforcement-loop-closable
  - id: INV-META-10
    name: llms-primary-interface
    judgment_call: true
inherits_from: []
load_priority: high
required_for:
  - organon_creation
  - organon_review
  - methodology_evolution
audience: [llm, human]
related_files:
  - PHILOSOPHY.md
  - patterns.md
  - three-layer-architecture.md
  - frontmatter-system.md
---

# Meta-Organon Ethos

> Constraints for creating organons.

---

## Identity

### What an Organon IS

- A complete guidance system (philosophy + ethos + protocol)
- Behavioral constraints encoded for LLM consumption — LLMs are the primary audience
- Scoped to a project, domain, feature, or component
- Persistent context, not per-request instructions
- A progressively-disclosable document — navigable by metadata before content
- An enforceable system — protocols bind to workflows and tools, creating a closed loop

### What an Organon IS NOT

- Not a README or getting-started guide
- Not API documentation or type signatures
- Not a tutorial or learning path
- Not a development methodology (Agile, Scrum)
- Not prompt engineering
- Not passive documentation — organons are designed to be executed, not just read

---

## Invariants

1. **Ethos is required.** Philosophy and protocol are optional. An organon without an ethos is not an organon.

2. **Identity comes first.** Every ethos begins with IS/IS NOT statements.

3. **Principles are prioritized.** Numbered list, highest priority first. When principles conflict, lower number wins.

4. **Child scopes inherit, never contradict.** A feature ethos can add constraints beyond the product ethos, but cannot relax them.

5. **Code is the source of truth.** When an organon conflicts with code, fix one or the other. Never leave conflicts.

6. **Every organon file has YAML frontmatter.** Frontmatter is the first layer of progressive disclosure. It provides metadata (type, scope, summary, token_estimate, relationships) so agents can discover, filter, and budget *before* loading full content. A file without frontmatter forces all-or-nothing loading.

7. **Standardized section headings.** Organon files use predictable, consistent headings so agents can load specific sections without reading the entire file. The heading structure for each artifact type is defined in this file's Structure Templates section.

8. **Progressive disclosure over arbitrary limits.** There are no hard line limits on organon files. Token efficiency is achieved through layered access (frontmatter → section → full file), not by truncating content. Quality and completeness of content must never be sacrificed for brevity.

9. **The enforcement loop must be closable.** Every protocol with `automation_tier: automated` must have a corresponding workflow binding and tools that can verify compliance. Protocols without enforcement mechanisms are suggestions, not constraints. The loop: Define (organon) → Bind (workflow) → Execute (tools) → Verify (automated checks) → Evolve (update organon). See `three-layer-architecture.md`.

10. **LLMs are the primary interface.** Organons are written for LLM consumption first. LLMs read the organon, execute protocols via workflows, orchestrate tools, and surface results to humans. Humans author and review; LLMs execute and enforce. Every organon design decision must optimize for LLM parsing, LLM action, and LLM-human feedback.

---

## Core Properties

The Organon methodology achieves compounding improvements through three structural properties. These are not aspirations but fundamental characteristics of how the methodology works.

### 1. Recursive Structure

Each loop iteration (Define → Bind → Execute → Verify → Compound → Evolve) feeds learnings into the next. Not linear progression but circular improvement. Work in Cycle N generates knowledge that makes Cycle N+1 faster. This recursion is not accidental—it's the fundamental mechanism of the methodology.

**Example:** Cycle 1 manually loads RFC context. Compound phase creates `rfc:load-context` tool. Cycle 2 uses the tool (faster). Cycle 3 adds automation. Each cycle builds on the previous.

### 2. Self-Correction

The methodology improves itself through:
- **Dogfooding:** Methodology documents itself (meta-organon)
- **RFC-driven evolution:** Constraints that prove impractical get refined
- **Workflow refinement:** Unclear steps get clarified based on execution

When methodology constraints don't work, they evolve. This prevents stagnation and ensures the methodology stays practical, not dogmatic.

### 3. Progressive Automation

Work moves through tiers over time:

```
Manual (Tier 1) → Human does every step
    ↓ (recognize pattern)
Semi-automated (Tier 2) → Tools assist, humans orchestrate
    ↓ (automation matures)
Automated (Tier 3) → Tools execute, humans review
```

Each tier unlocks the next: automation creates time → time enables more automation → more automation creates more time. This is the compounding mechanism—improvements accumulate exponentially, not linearly.

**Result:** Compounding improvements emerge naturally from these three properties. The methodology is DESIGNED to compound, not just ASPIRE to compound. Compounding is an emergent property of the structure, not a separate goal.

---

## Principles (Prioritized)

1. **LLM-centric design.** Organons exist to be consumed and executed by LLMs. Every design decision — frontmatter, standardized sections, decision heuristics, protocol bindings — optimizes for LLM parsing and action. LLMs are the interface between human intent and automated enforcement. Humans define the "what" and "why"; LLMs execute the "how."

2. **Enforcement through automation.** Organons that aren't enforced become fiction. Every constraint should have a path to automated verification. Protocols bind to workflows that orchestrate tools that check invariants. The enforcement loop (Define → Bind → Execute → Verify → Compound → Evolve) is what makes organons real. A constraint without an enforcement path is a suggestion.

3. **Recursive improvement by design.** The methodology improves itself through iteration. Each cycle generates learnings that feed into the next cycle. Improvements compound: better tools → faster execution → more time for improvement → even better tools. This recursive nature is not accidental—it's the mechanism that makes the methodology sustainable at scale. Compounding is an emergent property of recursive collaboration, not a separate goal.

4. **Compound deliberately.** Reserve 5-10% of every significant work session for improving the system itself (tools, workflows, protocols). Without explicit time allocation, improvement never happens. Compounding is distinct from evolution: compound improves methodology (how we work), evolve updates constraints (what we're building). The Compound step in the enforcement loop makes this explicit.

5. **Clarity over completeness.** A short, clear ethos beats a comprehensive but vague one.

6. **Progressive disclosure over monolithic loading.** Structure every file so agents can access it in layers — frontmatter for discovery, sections for targeted loading, full file only when needed. This is how token efficiency is achieved at scale.

7. **Constraints over explanations.** State what to do, not why. Put "why" in philosophy.

8. **Specificity over generality.** "Never force-push to master" beats "Be careful with git."

9. **Actionable over aspirational.** "Run tests before merging" beats "Maintain code quality."

---

## Progressive Disclosure Model

The core mechanism for token-efficient organons. Every file supports layered access:

```
Layer 0: README-as-Router        ~50 tokens    Directory listing — "What files exist here?"
    ↓
Layer 1: Frontmatter             ~25-50 tokens File metadata — "What is this? Should I load it?"
    ↓
Layer 2: Section Headings        ~100 tokens   Structure scan — "What sections does it contain?"
    ↓
Layer 3: Specific Section        variable      Targeted read — "Give me just ## Invariants"
    ↓
Layer 4: Full File               full cost     Complete content — "Load everything"
```

### How agents use this

1. **Discovery:** Read README-as-router or query frontmatter across files to find relevant organons
2. **Filtering:** Use frontmatter fields (`scope`, `required_for`, `load_priority`) to narrow candidates
3. **Budgeting:** Check `token_estimate` against available context budget
4. **Targeted loading:** Load only the sections needed (e.g., `## Invariants` for constraint checking, `## Decision Heuristics` for ambiguous situations)
5. **Full loading:** Only when the entire file is needed (rare — usually during organon creation or review)

### Why this replaces line limits

Hard line limits (e.g., "max 200 lines") were a proxy for token efficiency. They worked by forcing content to stay small. But they had costs:
- Important content was omitted to stay under limits
- Files were split artificially, breaking coherence
- The real goal (token efficiency) was achieved by sacrificing content quality

Progressive disclosure achieves the same goal (token efficiency) without sacrificing quality:
- A 500-line file with good frontmatter and sections costs ~50 tokens to discover
- An agent that needs only invariants loads ~40 lines regardless of file size
- Content quality is never sacrificed — files can be as thorough as needed

---

## Decision Heuristics

### When writing an ethos

| Situation | Action |
|-----------|--------|
| Starting new domain with uncertain feasibility | Consider Explore-Before-Ethos pattern (1-2 day time-boxed exploration, see patterns.md) |
| Starting new domain with proven patterns | Use Ethos-First Development (standard) |
| Unsure if a constraint belongs | Ask: "Would violating this cause real harm?" If yes, include it. |
| Constraint feels obvious | Include it anyway. LLMs have no "obvious." |
| Two constraints might conflict | Add priority numbers or explicit "X trumps Y" statement. |
| File is growing large | Ensure frontmatter `token_estimate` is accurate. Ensure sections use standardized headings. Do NOT split just for size — split only when content serves different scopes or audiences. |

### When writing philosophy

| Situation | Action |
|-----------|--------|
| Decision seems arbitrary | Write philosophy explaining trade-offs. |
| Multiple valid approaches exist | Document why you chose this one. |
| You might reconsider later | Note the conditions under which you'd change. |

### When writing protocols

| Situation | Action |
|-----------|--------|
| Task must be done the same way every time | Write protocol. |
| Errors in execution have significant consequences | Write protocol with verification steps. |
| Task requires human discretion/judgment at each execution | Don't write protocol; put guidance in ethos. (Note: different from invariant `judgment_call` flag which means "invariant verification requires human review") |

### When enforcing methodology

| Situation | Action |
|-----------|--------|
| New invariant added to ETHOS.md | Ask: "Can this be verified by a tool?" If yes, create or update a verification tool. If not, document how humans should review it. |
| Protocol has ≥5 steps and is used frequently | Promote to `automation_tier: automated`, create a workflow binding. |
| Protocol is used rarely or requires judgment | Keep at `manual` tier. Not everything needs automation. |

### When evolving organons

| Situation | Action |
|-----------|--------|
| New product-level invariant | RFC required — high bar, team consensus needed. |
| New domain or feature organon | RFC for the capability; organon created in same PR as implementation. |
| Constraint modified or removed | RFC required — document rationale for change and impact. |
| Clarification, typo, or reference fix | Direct commit, no RFC needed. |
| File paths changed after refactor | Direct commit, no RFC needed. |
| Unsure whether RFC is needed | If the change introduces or modifies constraints, use an RFC. If it's maintenance, commit directly. |

### When to split a file

| Situation | Action |
|-----------|--------|
| Content serves different scopes | Split into separate scope-level organons. |
| Content serves different audiences | Split into separate artifact types (ethos vs philosophy vs protocol). |
| File covers multiple unrelated domains | Split into domain-specific organons. |
| File is just long but cohesive | Do NOT split. Ensure frontmatter + sections are solid. |

---

## File Conventions

| File | Required | Content | Frontmatter Required |
|------|----------|---------|---------------------|
| `ETHOS.md` | Yes | Behavioral constraints | Yes |
| `PHILOSOPHY.md` | No | Reasoning and trade-offs | Yes |
| `PROTOCOL.md` | No | Single protocol | Yes |
| `protocols/*.md` | No | Multiple protocols | Yes |
| `README.md` | Per directory | Router (navigation only) | Yes (`type: navigation`) |

**Naming:** All uppercase for organon files. This signals "meta-documentation."

**Location:** Organon files live at the root of their scope (repo root, `organon/domains/X/`, `organon/features/X/`).

**Frontmatter:** Required on every file. Minimum fields: `type`, `scope`, `name`, `version`, `summary`, `token_estimate`. See `frontmatter-system.md` for full schema.

---

## Structure Templates

### Ethos (Required Sections)

These headings are **standardized** — agents rely on them for section-level loading.

```
---
type: constraints
scope: [product|domain|feature|component|meta|methodology]
name: [kebab-case-name]
version: "1.0"
summary: [one-sentence, max 200 chars]
token_estimate: [number]
invariants_count: [number]
principles_count: [number]
heuristics_count: [number]
invariants:
  - id: INV-[SCOPE]-1
    name: [kebab-case-label]
inherits_from: [parent-scope-names]
load_priority: [high|medium|low]
required_for: [task-types]
audience: [llm, human]
---

# [Scope] Ethos
## Identity (IS / IS NOT)
## Invariants
## Principles (Prioritized)
## Decision Heuristics
```

### Ethos (Optional Sections)

```
## Progressive Disclosure Model   ← if this scope has unique disclosure patterns
## Out of Scope
## Failure Modes
## Anti-Patterns
```

### Philosophy (Required Sections)

```
---
type: rationale
scope: [scope]
name: [kebab-case-name]
version: "1.0"
summary: [one-sentence, max 200 chars]
token_estimate: [number]
decision_count: [number]
inherits_from: [parent-scope-names]
audience: [llm, human]
---

# [Scope] Philosophy
## The Problem
## The Bet (or "The Solution")
## Design Decisions
## Trade-offs
```

### Protocol (Required Sections)

```
---
type: procedures
scope: [scope]
name: [kebab-case-name]
version: "1.0"
summary: [one-sentence, max 200 chars]
token_estimate: [number]
protocols_count: [number]
protocols:
  - id: [PROTO-SCOPE-N]
    name: [protocol-name]
    steps: [number]
    automation_tier: [automated|semi-automated|manual]
    workflow: [workflow-name]   # if automated
    tools: [tool-list]
    complexity: [high|medium|low]
inherits_from: [parent-scope-names]
audience: [llm, human, tooling]
---

# Protocol: [Name]
## Goal
## Preconditions
## Steps
## Verification
```

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Ethos with no IS/IS NOT | LLM doesn't know boundaries | Add identity section first |
| Unprioritized principles | LLM can't resolve conflicts | Number by priority |
| Philosophy without trade-offs | Decisions seem arbitrary | Document what you sacrificed |
| Protocol with judgment calls | Can't be followed literally | Move judgment to ethos |
| Missing frontmatter | Forces all-or-nothing loading, kills progressive disclosure | Add frontmatter with at minimum: type, scope, name, version, summary, token_estimate |
| Splitting files just for size | Breaks coherence, creates navigation overhead | Keep cohesive content together. Use frontmatter + sections for efficiency. |
| Non-standard section headings | Agents can't do section-level loading | Use the standardized headings from Structure Templates |
| Duplicating constraints across scopes | Maintenance burden, divergence | Child inherits from parent |
| Open enforcement loop | Protocol exists but no workflow or tool verifies it | Close the loop: add workflow binding + verification tool |
| Human-optimized organon | Prose-heavy, no structured sections, no frontmatter | Restructure for LLM consumption: frontmatter, standardized headings, decision heuristic tables |
| Orphaned workflow | Workflow exists without protocol reference | Add `protocol_id` and `protocol_file`, or delete the orphan |
| Phantom automation | Protocol claims `automated` but workflow doesn't exist | Create workflow or change tier to `manual` |
| Ad-hoc organon evolution | Constraints added without RFC or review | Use RFC process for constraint changes; direct commits only for maintenance |
| Deferred organon update | Code lands but organon update is "done later" | Same-PR principle: organon changes in the same PR as implementation |
| Mixed methodology and product | Process docs in product scopes, product docs in methodology | Methodology for how-we-build; domains/features for what-it-does |
| Untested invariant | Invariant in ETHOS.md but no tier-4 test verifies it | Add organon test with `@organon-invariant` annotation referencing the invariant |
| Stale code mapping | components.md doesn't match current code | Regenerate via idempotent tool and enforce freshness in CI |

---

## Related Files

| File | Relationship |
|------|--------------|
| [overview.md](./overview.md) | High-level methodology overview |
| [PHILOSOPHY.md](./PHILOSOPHY.md) | Explains the reasoning behind these constraints |
| [patterns.md](./patterns.md) | Concrete patterns that implement these invariants |
| [three-layer-architecture.md](./three-layer-architecture.md) | Enforcement loop architecture |
| [invariant-tracking.md](./invariant-tracking.md) | How invariants bind to tests |
| [workflow-authoring.md](./workflow-authoring.md) | Workflow quality attributes |
| [frontmatter-system.md](./frontmatter-system.md) | Progressive disclosure mechanism |

---

## Verification Checklist

Before publishing an organon:

- [ ] YAML frontmatter present with all required fields
- [ ] `token_estimate` is within 30% of actual token count
- [ ] Frontmatter counts (`invariants_count`, etc.) match actual content
- [ ] Ethos has IS/IS NOT identity section
- [ ] Principles are numbered by priority
- [ ] Section headings follow standardized structure for artifact type
- [ ] No conflicts between parent and child scope
- [ ] Cross-references are valid (bidirectional where applicable)
- [ ] Code and organon are consistent
