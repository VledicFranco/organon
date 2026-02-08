---
type: constraints
scope: meta
name: meta-organon
version: "2.0"
summary: Core invariants, principles, and heuristics for creating organons — the foundational rules every organon must follow
token_estimate: 3200
invariants_count: 8
principles_count: 5
heuristics_count: 12
inherits_from: []
load_priority: high
required_for:
  - organon_creation
  - organon_review
  - methodology_evolution
audience: [llm, human]
---

# Meta-Organon Ethos

> Constraints for creating organons.

---

## Identity

### What an Organon IS

- A complete guidance system (philosophy + ethos + protocol)
- Behavioral constraints encoded for LLM consumption
- Scoped to a project, domain, feature, or component
- Persistent context, not per-request instructions
- A progressively-disclosable document — navigable by metadata before content

### What an Organon IS NOT

- Not a README or getting-started guide
- Not API documentation or type signatures
- Not a tutorial or learning path
- Not a development methodology (Agile, Scrum)
- Not prompt engineering

---

## Invariants

1. **Ethos is required.** Philosophy and protocol are optional. An organon without an ethos is not an organon.

2. **Identity comes first.** Every ethos begins with IS/IS NOT statements.

3. **Principles are prioritized.** Numbered list, highest priority first. When principles conflict, higher wins.

4. **Child scopes inherit, never contradict.** A feature ethos can add constraints beyond the product ethos, but cannot relax them.

5. **Code is the source of truth.** When an organon conflicts with code, fix one or the other. Never leave conflicts.

6. **Every organon file has YAML frontmatter.** Frontmatter is the first layer of progressive disclosure. It provides metadata (type, scope, summary, token_estimate, relationships) so agents can discover, filter, and budget *before* loading full content. A file without frontmatter forces all-or-nothing loading.

7. **Standardized section headings.** Organon files use predictable, consistent headings so agents can load specific sections without reading the entire file. The heading structure for each artifact type is defined in this file's Structure Templates section.

8. **Progressive disclosure over arbitrary limits.** There are no hard line limits on organon files. Token efficiency is achieved through layered access (frontmatter → section → full file), not by truncating content. Quality and completeness of content must never be sacrificed for brevity.

---

## Principles (Prioritized)

1. **Clarity over completeness.** A short, clear ethos beats a comprehensive but vague one.

2. **Progressive disclosure over monolithic loading.** Structure every file so agents can access it in layers — frontmatter for discovery, sections for targeted loading, full file only when needed. This is how token efficiency is achieved at scale.

3. **Constraints over explanations.** State what to do, not why. Put "why" in philosophy.

4. **Specificity over generality.** "Never force-push to master" beats "Be careful with git."

5. **Actionable over aspirational.** "Run tests before merging" beats "Maintain code quality."

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
| Task requires judgment calls | Don't write protocol; put guidance in ethos. |

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
    skill: [skill-name]        # if automated
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
