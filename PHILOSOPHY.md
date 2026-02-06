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

Traditional documentation (READMEs, wikis, comments) optimizes for human reading. LLMs need different structure: navigable, dense, actionable.

---

## The Bet

Three distinct artifact types address different needs:

| Artifact | Need Addressed | Optimized For |
|----------|----------------|---------------|
| Philosophy | Understanding decisions | Humans maintaining the system |
| Ethos | Behavioral consistency | LLMs working in the system |
| Protocol | Reproducible execution | Any agent performing specific tasks |

**The ethos is the critical artifact.** It encodes taste and judgment into a form LLMs can consume and apply.

---

## Design Decisions

### 1. Ethos Before Philosophy

Write ethos first. It forces clarity about constraints. Philosophy explains why constraints exist — useful for humans, optional for LLMs.

**Rationale:** LLMs need to know *what to do*, not *why*. Humans need *why* to maintain and evolve the system. Prioritize by audience.

### 2. Scoped Organons

Organons exist at multiple levels (product, domain, feature). Each scope inherits from parent and adds specificity.

**Rationale:** A single project-level ethos becomes either too long or too abstract. Scoped organons keep each level focused and token-efficient.

### 3. Identity Boundaries

Every ethos starts with "IS / IS NOT" statements.

**Rationale:** Most LLM errors come from scope creep — doing something reasonable but outside the system's intent. Hard boundaries prevent drift.

### 4. Prioritized Principles

Principles in an ethos are numbered by priority.

**Rationale:** When principles conflict, LLMs need to know which wins. Explicit priority eliminates guessing.

### 5. Decision Heuristics

Every ethos includes "When X, do Y" statements.

**Rationale:** LLMs face recurring ambiguous situations. Pre-computed heuristics save tokens and ensure consistency.

---

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| Three artifact types | Clear separation of concerns | More files to maintain |
| Scoped organons | Focused, token-efficient | Navigation overhead |
| Ethos-first approach | Behavioral clarity | Philosophy may feel redundant |
| Strict templates | Consistency, parseable | Less flexibility |

---

## What This Is Not

- **Not a development methodology** (Agile, Scrum) — organons are artifacts, not processes
- **Not documentation standards** (JSDoc, Sphinx) — organons guide behavior, not API reference
- **Not prompt engineering** — organons are persistent context, not per-request instructions
