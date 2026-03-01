# Roadmap to v0.6.0

> Research and design exploration for the next minor version (0.5.2 → 0.6.0).
> Brainstorm-stage — no commitments yet.

---

## Vision / Theme

Raise the formalism level of the Organon methodology to reduce hallucination,
increase automation, and produce a genuinely formal path to great software
design, planning, implementation, and verification when using LLMs.

Three convergent directions drive this: structured data over prose (YAML-first),
types as ontology (Idris 2 as formal schema), and metacognition as architecture
(cognitive team modeled on brain function).

---

## Architectural Foundation

Core structural changes that v0.6.0 builds on.

### [YAML-First Organons + `.methodology/` Directory Standard](./yaml-first-organons.md)
Replace the Markdown+frontmatter hybrid with pure YAML organon files,
consolidated under a standard `.methodology/` directory. The foundational
change — everything else builds on top of this. Includes paradigm shift
summary table, resolved design decisions Q1-Q2, and outstanding questions Q3-Q6.

### [MCP Query API + Protocol-Guided Routing](./mcp-query-api.md)
Two coupled ideas: (1) a programmatic MCP query API giving LLMs structured
access to YAML organon data instead of raw file reading, and (2) replacing
skills-based guidance with MCP protocol-guided tool chains. Includes phased
skill deprecation and migration strategy (phases 1–3, targeting v0.7.0 for
full skill removal).

### [RFC as Structured Data](./rfc-as-structured-data.md)
Replace Markdown prose RFCs with machine-readable `rfc-NNN.yaml` files.
Introduces three new first-class artifact types (definitions, relationships,
implementations), full RFC→organon→code traceability, and auto-generation
from structured fields. Major breaking change to the RFC format.

---

## Formalism & Verification

Raising the ceiling: what formal verification gives us that YAML schemas cannot.

### [Types as Ontology — Idris 2 as Canonical Schema](./types-as-ontology.md)
How the Curry-Howard-Lambek correspondence (types = propositions = categorical
objects) makes type systems the right formalism for organon definitions.
**Recommends Idris 2** as the canonical schema language — the language where
the isomorphism is fully realized, not approximated. Covers Quantitative Type
Theory (linear types, erased proofs), the two-layer architecture (Idris formal
schema + TypeScript runtime), `idris2 check` as the verification engine, and
the path from YAML to formally proven organon correctness.

### [Hallucination Detection](./hallucination-detection.md)
State-of-the-art survey on LLM hallucination detection. The key thesis:
generic detection is hard; Organon detection is tractable because the
closed-world assumption makes an entire class of semantic hallucinations
statically verifiable without external knowledge bases. Proposes a
`hallucination-risk` verification gate, taxonomy of Organon hallucinations
by enforcement loop phase, theoretical limits (impossibility theorem,
inevitability result), and 6 outstanding design questions for an RFC.

---

## Metacognition Research

A growing family of research documents grounding Organon in how intelligent
systems regulate themselves. Each document is a distinct lens on the same
core insight: Organon is an externally imposed meta level for LLM cognition.

### [Metacognition: Foundations](./metacognition-foundations.md)
The foundational framework. Clarifies System 1/2 vs the Nelson & Narens
object/meta level distinction (the more precise framework for Organon).
Documents what the meta level does that LLMs lack: monitoring, inhibitory
control, epistemic calibration, working memory management. Identifies the
core structural gap: monitoring is top-down only — the bottom-up monitoring
→ control feedback loop is missing.

### [Metacognition: Goal-Directed Loops](./metacognition-goal-loops.md)
The cognitive science of the objective → plan → execute → validate → refine
loop. Covers TOTE (the recursive foundational structure), Zimmerman
self-regulation phases, Carver & Scheier hierarchical control (Be/Do/Motor
levels), Argyris single-loop vs double-loop learning, Norman & Shallice
Supervisory Attentional System, and Gollwitzer's deliberation-implementation
mind-set shift. Key finding: the loop is hierarchical and concurrent, not
sequential — and refinement has two qualitatively different modes.

### [Metacognition: The Cognitive Team](./metacognition-cognitive-team.md)
The synthesis: model a team of agents as a brain, mapping cognitive function
to each agent. **Cognitive function — not task — is the right level of
abstraction for agent identity.** Defines 10 cognitive agents (Self, Planner,
Executor, Monitor, Inhibitor, Evaluator, Synthesizer, Working Memory, Episodic
Memory, Semantic Memory) grounded in brain region equivalents. Documents the
Be/Do/Motor agent hierarchy, MCP server as global workspace (thalamo-cortical
relay), the organon as connectome, and the full cognitive cycle mapped to the
Organon enforcement loop.

### [Metacognition: Quality Gates](./metacognitive-quality-gates.md)
Embeds goal-tracking and self-evaluation into every stage of the RFC lifecycle.
Introduces the **goal-reaching delta** — a scalar measuring alignment between
current output and original objective, increasing monotonically through the
lifecycle. Proposes 6 lifecycle gates (Gate 0–5), dual-loop reflection (outer
extrospection + inner introspection via a reflection bank), and formal
acceptance criteria in RFCs to make Gate 0 checkable.

---

## Research & Exploration

External research, technical investigations, and empirical tooling.

### [Algebra of Methodologies](./algebra-of-methodologies-research.md)
External research import (from `../agentic-research/`). Defines methodologies
as formal 5-tuples `(Space, Personas, Measurements, Protocol, Invariants)` with
composition operators (Sequential, Parallel, Conditional, Iterative, Nested,
Merge, Substitution) closed under the structure. Establishes monoidal algebraic
properties. If completed, provides the theoretical foundation that formally
unifies multiple 0.6.0 ideas. Tracked here — not an Organon deliverable yet.

### [RAG Context Retrieval](./rag-context-retrieval.md)
Organon already has what RAG systems build from scratch: a structured metadata
graph (frontmatter), typed relationships, scope hierarchy, and token budgets.
Proposes **deterministic structured retrieval** via the frontmatter graph
instead of probabilistic embedding-based retrieval. New CLI command / MCP tool
that takes a task description and returns a ranked, budget-aware file set for
prompt injection.

### [Experimentation System](./experimentation-system.md)
Empirical measurement of whether Organon actually makes agents better. Core
insight: `organon verify` is already an unambiguous, reproducible scorer for
organon file generation tasks — a free evaluation function requiring no
subjective rubrics. Proposes a structured experiment design using this wedge,
expanding to more task types as scoring is automated. Validates the methodology
through evidence rather than convention.

### [Advanced Claude Prompting Techniques](./advanced-prompting.md)
Research on prompting techniques relevant to organon tooling and agent
workflows: adaptive thinking, interleaved tool use, structured contract-style
prompts, chain-of-thought via XML tags, explicit uncertainty permission, and
token budget management.

---

## Dependencies / Blockers

- **Q3–Q6** from `yaml-first-organons.md` — schema design decisions that
  must be resolved before implementation begins
- **Idris 2 as CLI dependency** (Q-T6 from `types-as-ontology.md`) — the
  adoption strategy (required / optional / WASM bundled) affects the release plan
- **Algebra of Methodologies** research — theoretical dependency for formally
  grounding the Cognitive Team and RFC composition; tracked but not blocking

---

## Related Files

- `organon/observations/005-epistemic-export-gaps.md` — RFC 009 implementation insights
- `book-llms/three-layer-architecture.md` — current protocol/workflow/tool model
- `book-llms/frontmatter-system.md` — current RFC section structure (to be replaced)
- `packages/tools/src/core/export.ts` — current epistemic export implementation
