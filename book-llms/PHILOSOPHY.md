---
type: rationale
scope: meta
name: meta-organon-philosophy
version: "1.0"
summary: Why the Organon methodology exists — LLM-centric design, enforcement through automation, progressive disclosure, and every trade-off
token_estimate: 2972
decision_count: 9
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
| Methodology documented but not followed | No enforcement loop — knowledge is passive |
| Each LLM session starts from scratch | No persistent workflow bindings |

Traditional documentation optimizes for human reading. But in human-LLM collaboration, **LLMs are the primary consumers of methodology** — they read constraints, execute procedures, and verify compliance. Humans author the methodology and review results, but LLMs are the runtime. Documentation must be designed for LLM consumption first.

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

**The enforcement loop makes it real.** Protocols bind to workflows that orchestrate tools that verify constraints. Without enforcement, organons are aspirational. With it, they're a closed feedback loop: Define → Bind → Execute → Verify → Evolve.

**LLMs are the interface.** Humans define intent by writing organons. LLMs execute that intent by reading constraints, following workflows, and running tools. The methodology is designed for this division of labor — structured for LLM parsing, actionable for LLM execution, verifiable by LLM-orchestrated tools.

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

Version 1.0 of this methodology used hard line limits (ETHOS.md max 150 lines, content files max 200 lines) as a proxy for token efficiency. Version 2.0 replaced this with progressive disclosure via YAML frontmatter and standardized section headings.

**Rationale:** Line limits optimized the wrong thing. They forced authors to cut important content and split cohesive documents artificially. The real goal is token efficiency — agents should load only what they need. Progressive disclosure achieves this without sacrificing content quality:
- Frontmatter costs ~50 tokens and tells agents whether to load the file at all
- Standardized headings let agents load specific sections (e.g., just `## Invariants`)
- A 500-line file with good frontmatter costs the same as a 100-line file when an agent only needs one section

**Conditions for reconsideration:** If LLM tooling evolves to make full-file loading negligible (e.g., infinite context windows), the progressive disclosure mechanism becomes less critical. But standardized structure still aids parsing and search, so the headings contract would remain valuable.

### 7. The Enforcement Loop (Protocols → Workflows → Tools → Verify)

Protocols document procedures in organon files. Workflows (agent-specific bindings like Claude Code skills, Cursor rules, or generic workflow docs) implement protocols as executable steps. Tools are atomic operations workflows orchestrate. Verification tools close the loop by checking that organon constraints hold.

**Rationale:** Declarative knowledge (protocols) sitting disconnected from executable code creates a knowledge gap. Agents read protocols and manually translate them to tool invocations — inconsistently. Workflows bridge this gap. Not every protocol needs a workflow; automation tiers (automated, semi-automated, manual) prevent over-engineering. The critical addition is *verification* — tools that check organon compliance make the loop self-reinforcing.

**Technology-agnostic by design:** The protocol layer (PROTOCOLS.md) and tool layer (CLI commands, scripts) are universal. Only the workflow layer varies by agent technology. This means the methodology works with any LLM — Claude, GPT, Gemini, custom agents — as long as the workflow binding follows the universal contract (references protocol, orchestrates tools, provides context loading).

### 8. LLM-Centric Design

Every aspect of organon structure is optimized for LLM consumption: YAML frontmatter for machine-parseable metadata, standardized headings for section-level extraction, decision heuristic tables for deterministic action, identity boundaries for scope enforcement.

**Rationale:** In human-LLM collaboration, LLMs are the agents that execute methodology. They read more organon content than any human ever will. They make hundreds of decisions per session guided by organon constraints. Optimizing for human readability at the expense of LLM parseability wastes the primary consumer's capabilities. Humans interact with the methodology *through* LLMs — by invoking workflows, reviewing tool output, and approving changes.

**Conditions for reconsideration:** If a future where LLMs have perfect natural language understanding eliminates the need for structured formats, the frontmatter and heading contracts become less critical. But explicit constraints and prioritized principles will always aid consistency, regardless of parsing capability.

### 9. Enforcement Over Documentation

A constraint that isn't enforced is a suggestion. Every invariant in an ETHOS.md should ideally have a path to automated verification — either a tool that checks it, a test that proves it, or a workflow gate that blocks violations.

**Rationale:** The history of software documentation is a history of drift. Teams write rules, then stop following them. The only documentation that stays accurate is documentation that's enforced by automation. Organons break this cycle by building enforcement into the methodology itself: protocols bind to workflows, workflows invoke verification tools, verification gates block non-compliant changes. The organon becomes a living system, not a static document.

**Trade-off:** Not every constraint can be automated. Judgment-heavy invariants (e.g., "prefer simple designs") require human review. The automation tier system (automated/semi-automated/manual) acknowledges this — the goal is maximum practical enforcement, not 100% automation.

---

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| Three artifact types | Clear separation of concerns | More files to maintain |
| Scoped organons | Focused, relevant to task | Navigation overhead |
| Ethos-first approach | Behavioral clarity | Philosophy may feel redundant |
| Progressive disclosure | Content quality preserved, token efficiency | Requires frontmatter + tooling discipline |
| No hard line limits | Thorough, complete organons | Risk of bloated, poorly-structured files |
| Enforcement loop | Methodology is executed, not just read | Three artifacts per workflow + verification tooling |
| LLM-centric design | Optimized for primary consumer | Less natural for human-only reading |
| Technology-agnostic workflow layer | Works with any LLM agent | Workflow must be reimplemented per agent technology |
| Standardized headings | Section-level loading | Less flexibility in document structure |
| Enforcement over documentation | Constraints stay accurate over time | Tooling investment required upfront |

---

## What This Is Not

- **Not a development methodology** (Agile, Scrum) — organons are artifacts, not processes
- **Not documentation standards** (JSDoc, Sphinx) — organons guide behavior, not API reference
- **Not prompt engineering** — organons are persistent context, not per-request instructions
- **Not a file-size religion** — there are no hard line limits, only progressive disclosure
- **Not human-first documentation** — organons are LLM-centric, humans interact through LLMs
- **Not passive documentation** — organons are enforced through the Protocol → Workflow → Tool → Verify loop

---

## Related Files

| File | Relationship |
|------|--------------|
| [overview.md](./overview.md) | High-level methodology overview |
| [ETHOS.md](./ETHOS.md) | The constraints this philosophy explains |
| [three-layer-architecture.md](./three-layer-architecture.md) | Enforcement loop mechanism |
