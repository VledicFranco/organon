---
type: rationale
scope: meta
name: meta-organon-philosophy
version: "2.0"
summary: Why the Organon methodology exists, how progressive disclosure replaced line limits, and the trade-offs behind every design decision
token_estimate: 3000
decision_count: 7
inherits_from: [meta-organon]
load_priority: low
required_for:
  - methodology_evolution
audience: [llm, human]
---

# Meta-Organon Philosophy

> Why this methodology exists.

---

## The Problem

When humans collaborate with LLMs on complex systems, behavioral consistency becomes critical. Without explicit guidance:

| Symptom | Cause |
|---------|-------|
| Locally reasonable but globally inconsistent decisions | No shared principles |
| Reinventing approaches that contradict established patterns | No institutional memory |
| Drift from the system's intended character over time | No identity boundaries |
| Wasting tokens rediscovering context | No structured knowledge |
| Loading entire files to find one relevant section | No progressive disclosure |

Traditional documentation (READMEs, wikis, comments) optimizes for human reading. LLMs need different structure: navigable, dense, actionable, and accessible in layers.

---

## The Bet

Three distinct artifact types address different needs:

| Artifact | Need Addressed | Optimized For |
|----------|----------------|---------------|
| Philosophy | Understanding decisions | Humans maintaining the system |
| Ethos | Behavioral consistency | LLMs working in the system |
| Protocol | Reproducible execution | Any agent performing specific tasks |

**The ethos is the critical artifact.** It encodes taste and judgment into a form LLMs can consume and apply.

**Progressive disclosure is the delivery mechanism.** Files can be rich and thorough because agents never pay for content they don't need. Frontmatter enables discovery, standardized sections enable targeted loading, and full-file loading is the exception, not the rule.

---

## Design Decisions

### 1. Ethos Before Philosophy

Write ethos first. It forces clarity about constraints. Philosophy explains why constraints exist — useful for humans, optional for LLMs.

**Rationale:** LLMs need to know *what to do*, not *why*. Humans need *why* to maintain and evolve the system. Prioritize by audience.

### 2. Scoped Organons

Organons exist at multiple levels (product, domain, feature). Each scope inherits from parent and adds specificity.

**Rationale:** A single project-level ethos becomes either too long or too abstract. Scoped organons keep each level focused and relevant to the task at hand.

### 3. Identity Boundaries

Every ethos starts with "IS / IS NOT" statements.

**Rationale:** Most LLM errors come from scope creep — doing something reasonable but outside the system's intent. Hard boundaries prevent drift.

### 4. Prioritized Principles

Principles in an ethos are numbered by priority.

**Rationale:** When principles conflict, LLMs need to know which wins. Explicit priority eliminates guessing.

### 5. Decision Heuristics

Every ethos includes "When X, do Y" statements.

**Rationale:** LLMs face recurring ambiguous situations. Pre-computed heuristics save tokens and ensure consistency.

### 6. Progressive Disclosure Over Line Limits

Version 1.0 of this methodology used hard line limits (ETHOS.md max 150 lines, content files max 200 lines) as a proxy for token efficiency. Version 2.0 replaces this with progressive disclosure via YAML frontmatter and standardized section headings.

**Rationale:** Line limits optimized the wrong thing. They forced authors to cut important content and split cohesive documents artificially. The real goal is token efficiency — agents should load only what they need. Progressive disclosure achieves this without sacrificing content quality:
- Frontmatter costs ~50 tokens and tells agents whether to load the file at all
- Standardized headings let agents load specific sections (e.g., just `## Invariants`)
- A 500-line file with good frontmatter costs the same as a 100-line file when an agent only needs one section

**Conditions for reconsideration:** If LLM tooling evolves to make full-file loading negligible (e.g., infinite context windows), the progressive disclosure mechanism becomes less critical. But standardized structure still aids parsing and search, so the headings contract would remain valuable.

### 7. Three-Layer Architecture (Protocols → Skills → Tools)

Protocols document procedures in organon files. Skills implement protocols as executable Claude Code workflows. Tools are atomic operations skills orchestrate.

**Rationale:** Declarative knowledge (protocols) sitting disconnected from executable code creates a knowledge gap. Developers read protocols and manually translate them to tool invocations — inconsistently. Skills bridge this gap by binding protocols to tools. Not every protocol needs a skill; automation tiers (automated, semi-automated, manual) prevent over-engineering.

---

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| Three artifact types | Clear separation of concerns | More files to maintain |
| Scoped organons | Focused, relevant to task | Navigation overhead |
| Ethos-first approach | Behavioral clarity | Philosophy may feel redundant |
| Progressive disclosure | Content quality preserved, token efficiency | Requires frontmatter + tooling discipline |
| No hard line limits | Thorough, complete organons | Risk of bloated, poorly-structured files |
| Three-layer architecture | Consistent execution, discoverability | Three files to synchronize per workflow |
| Standardized headings | Section-level loading | Less flexibility in document structure |

---

## What This Is Not

- **Not a development methodology** (Agile, Scrum) — organons are artifacts, not processes
- **Not documentation standards** (JSDoc, Sphinx) — organons guide behavior, not API reference
- **Not prompt engineering** — organons are persistent context, not per-request instructions
- **Not a file-size religion** — there are no hard line limits, only progressive disclosure
