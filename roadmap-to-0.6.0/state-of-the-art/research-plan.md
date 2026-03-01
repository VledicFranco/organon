---
type: protocol
scope: state-of-the-art
name: research-plan
version: 0.1.0
summary: >
  Structured research plan covering 8 SOTA areas for the v0.6.0 roadmap:
  formal methods, metacognition in LLMs, multi-agent systems, hallucination
  detection, agentic methodology, context retrieval, evaluation, and industry
  landscape. For each area: core questions, specific topics, search terms, and
  output document. Use sota-methodology.md to execute each area.
token_estimate: 2800
relationships:
  - type: sibling
    target: sota-methodology.md
    reason: sota-methodology is the execution protocol for this research plan
---

# State of the Art: Research Plan

> Scope: map the academic and industry landscape for every major idea in the
> v0.6.0 roadmap. Find prior art, related work, converging projects, and the
> directions the major agentic AI companies are taking. Record references.
> Identify what Organon is doing that is novel vs. what it can build on.

---

## Purpose

The v0.6.0 roadmap contains ideas across several distinct research frontiers:
formal type theory, metacognition in LLMs, multi-agent cognitive architectures,
hallucination detection, structured methodology for agents, context retrieval,
and empirical evaluation. Each frontier has a body of academic work and active
industry investment.

This plan organizes the research effort into eight areas, specifies what to
find in each, and maps it to the specific 0.6.0 documents the findings should
inform. Each area produces one output document in this directory.

---

## Output Documents

| Document | Covers | Priority |
|----------|--------|----------|
| `sota-formal-methods.md` | Dependent types, proof assistants, algebra of methodologies | High |
| `sota-metacognition-llm.md` | Metacognition in LLMs, self-regulation, process supervision | High |
| `sota-multi-agent.md` | Multi-agent systems, cognitive architectures, persona effects | High |
| `sota-hallucination.md` | Hallucination detection, constrained generation, verification | High |
| `sota-agentic-methodology.md` | Structured agent systems, protocol standards, config-driven agents | Medium |
| `sota-context-retrieval.md` | RAG, deterministic retrieval, context window management | Medium |
| `sota-evaluation.md` | Agent evaluation frameworks, benchmarks, measurement | Medium |
| `sota-industry-landscape.md` | OpenAI, Anthropic, Google, DeepMind, Meta, Microsoft directions | High |

---

## Area 1: Formal Methods & Type Theory for Knowledge Representation

**Informs:** `types-as-ontology.md`, `algebra-of-methodologies-research.md`,
`rfc-as-structured-data.md`

**Core questions:**
- What is the current state of Idris 2 / Agda / Lean 4 adoption in software
  engineering practice (not just theorem proving)?
- Are there existing projects that use dependent types to model domain knowledge
  or methodology specifications?
- How do ontology languages (OWL, SKOS, RDF) compare to dependent type systems
  in practice for knowledge representation?
- What is the state of the art for formalizing methodologies algebraically?
  Is there prior art for the 5-tuple `(Space, Personas, Measurements, Protocol,
  Invariants)` structure?
- What does the category theory / functional programming community say about
  using types as specifications vs. using them as implementations?

**Specific topics to investigate:**
- **Idris 2 / Quantitative Type Theory**: Brady's QTT paper, Idris 2 design
  rationale, production use cases, the `pack` package ecosystem maturity
- **Lean 4 in software verification**: recent (2024–2026) use of Lean 4 for
  formalizing software properties beyond pure mathematics; DeepMind's AlphaProof
- **Dependent types for schema definition**: any projects using Idris/Agda/Lean
  to define data schemas that are then serialized (the two-layer pattern)
- **Process algebra**: CSP (Hoare), CCS (Milner), π-calculus — do these cover
  the composition operators in the algebra-of-methodologies 5-tuple?
- **Algebraic specification languages**: Z notation, VDM, Alloy — how they
  compare to the methodology algebra; whether Alloy's relational model is
  relevant to Organon's relationship types
- **Category theory applied to programming methodology**: Bartosz Milewski's
  work, the compositionality literature, whether "methodology morphism" is a
  term of art anywhere
- **Ontology vs. type system comparison literature**: is there academic work
  directly comparing OWL description logics to dependent type systems for
  knowledge representation?

**Search terms:**
- "dependent types domain modeling production"
- "Idris 2 software engineering"
- "Lean 4 formal specification software"
- "algebraic semantics methodology composition"
- "process algebra agent composition"
- "ontology language type system comparison"
- "category theory software specification"

**Output:** `sota-formal-methods.md`

---

## Area 2: Metacognition in LLMs

**Informs:** `metacognition-foundations.md`, `metacognition-goal-loops.md`,
`metacognitive-quality-gates.md`

**Core questions:**
- What does the 2024–2026 research say about whether LLMs have genuine
  metacognitive capacity or simulate it?
- What prompting / architecture approaches induce metacognitive behavior
  most reliably?
- What is the relationship between process supervision (reward models on
  intermediate steps) and metacognitive monitoring?
- Do reasoning models (o1, o3, Gemini 2 thinking) exhibit qualitatively
  different metacognitive patterns than base models?
- Is there research on the "two-phase" generate-then-verify pattern and
  its effect on output quality?

**Specific topics to investigate:**
- **Self-Refine** (Madaan et al., 2023): iterative self-improvement without
  external feedback — how it relates to the Monitor/Evaluator agent split
- **Reflexion** (Shinn et al., 2023): verbal reinforcement learning via
  self-reflection — the episodic memory agent pattern
- **CRITIC** (Gou et al., 2023): tool-augmented self-correction — how external
  tool feedback closes the metacognitive loop
- **Chain-of-Thought as metacognition**: does CoT prompt metacognitive monitoring
  or just sequential reasoning?
- **Process Reward Models (PRMs)**: Lightman et al. "Let's Verify Step by Step"
  — process supervision vs. outcome supervision; maps to per-stage quality gates
- **Metacognitive inconsistency in LRMs**: the paper cited in
  `metacognitive-quality-gates.md` (openreview.net/forum?id=JGG9EdHyZc) and
  surrounding literature
- **Position paper on intrinsic metacognitive learning**: the ICLR paper cited
  in `metacognitive-quality-gates.md` — what does "intrinsic" vs "extrinsic"
  metacognition mean in LLM research?
- **Self-consistency sampling** (Wang et al., 2022): relationship to the
  monitoring signal; does consistency = confidence calibration?
- **Neuroscience-informed LLM architecture**: is there active research
  explicitly mapping neuroscience metacognition frameworks to LLM design?
  The Zimmerman/Nelson & Narens angle seems underexplored.

**Search terms:**
- "metacognition large language models 2024 2025"
- "self-refine LLM iterative improvement"
- "process reward model step supervision"
- "LLM self-correction monitoring"
- "chain of thought metacognitive"
- "LLM confidence calibration uncertainty"
- "two-phase generate verify LLM quality"

**Output:** `sota-metacognition-llm.md`

---

## Area 3: Multi-Agent Systems & Cognitive Architectures

**Informs:** `metacognition-cognitive-team.md`, `mcp-query-api.md`

**Core questions:**
- What is the current state of multi-agent LLM frameworks (MetaGPT, AutoGen,
  CrewAI, LangGraph) — do any assign agents by *cognitive function* rather
  than task role?
- What does the cognitive architecture research (ACT-R, SOAR) offer that the
  LLM community hasn't yet absorbed?
- What does the research say about the effect of persona/role assignment on
  multi-agent LLM performance? Is there empirical evidence that Be-level
  identity outperforms Do-level task assignment?
- Is "Society of Mind" style emergent intelligence being actively researched
  in LLM multi-agent settings?
- What communication topology designs have been studied — fully connected vs.
  hub-and-spoke vs. hierarchical?

**Specific topics to investigate:**
- **MetaGPT** (Hong et al., 2023): role assignment, communication protocols,
  how it differs from Cognitive Team — they use software roles (PM, engineer,
  QA), not cognitive functions
- **AutoGen** (Wu et al., 2023, Microsoft): conversable agents, group chat,
  nested conversations — how it handles the Monitor/Executor separation
- **ChatDev** (Qian et al., 2023): full software development as a multi-agent
  society — role conflicts and how they resolve them
- **CrewAI**: task delegation, agent memory, tool access — production-grade
  implementation of role-based agents
- **LangGraph**: state machine approach to multi-agent coordination — how it
  models the TOTE loop
- **SOAR** (Laird): cognitive architecture with goal hierarchies, impasse
  resolution, chunking — most direct prior art for Cognitive Team; has SOAR
  been applied to LLM agents?
- **ACT-R** (Anderson): module buffers as typed communication channels —
  direct architecture analog; any LLM work building on ACT-R?
- **Cognitive architecture + LLM surveys**: 2024–2026 surveys on integrating
  classical cognitive architectures with LLMs
- **Persona effects in LLMs**: empirical research on whether giving agents
  defined personas improves task performance and consistency
- **Global Workspace Theory in AI**: any computational implementations of
  Baars' GWT beyond the Organon framing?

**Search terms:**
- "multi-agent LLM cognitive function role"
- "MetaGPT AutoGen ChatDev comparison 2024"
- "cognitive architecture LLM integration ACT-R SOAR"
- "persona role assignment LLM performance"
- "global workspace theory computational implementation"
- "multi-agent communication topology LLM"
- "society of mind LLM emergent intelligence"

**Output:** `sota-multi-agent.md`

---

## Area 4: Hallucination Detection & Formal Verification

**Informs:** `hallucination-detection.md`, `types-as-ontology.md`

**Note:** `hallucination-detection.md` already contains a strong research survey
(as of 2026-02-28) with 13 key sources. This area extends that work rather than
duplicating it, focusing on what was missed and what has emerged since.

**Core questions:**
- Beyond what `hallucination-detection.md` covers: is there work on
  hallucination detection *specific to structured/YAML outputs* rather than
  free-form text?
- What is the state of constrained decoding (XGrammar, Outlines, Guidance)
  combined with semantic verification — the hybrid approach?
- Is there formal verification work applied specifically to LLM-generated
  artifacts (not just code)?
- What does the impossibility theorem (Karbasi et al.) imply for Organon's
  approach practically — are there other impossibility results in this space?
- How are the major labs approaching hallucination reduction architecturally
  (RLHF, Constitutional AI, RLAIF, grounding)?

**Specific topics to investigate:**
- **Structured output hallucination**: hallucination patterns specific to
  JSON/YAML generation — is there a taxonomy beyond `hallucination-detection.md`?
- **Constrained decoding + semantic verification hybrid**: combining XGrammar
  structural enforcement with lightweight NLI semantic checks — any papers
  demonstrating this end-to-end?
- **Formal verification of LLM outputs**: papers applying model checking or
  theorem proving to verify LLM-generated code or specifications
- **Knowledge graph hallucination**: GraphEval and successors — triple-level
  verification for structured knowledge — direct analog to Organon's
  relationship graph
- **Negative example training**: the impossibility theorem says you need
  labeled negatives; are there datasets of labeled wrong outputs for
  structured generation tasks?
- **Calibration research**: the gap between expressed confidence and accuracy
  in LLMs — maps directly to the epistemic status system

**Search terms:**
- "structured output hallucination YAML JSON LLM 2025"
- "constrained decoding semantic verification hybrid"
- "formal verification LLM generated artifacts"
- "knowledge graph hallucination detection 2025"
- "LLM calibration confidence accuracy structured"

**Output:** `sota-hallucination.md` (extends existing research in
`hallucination-detection.md`)

---

## Area 5: Structured Agentic Methodology & Protocol Standards

**Informs:** `yaml-first-organons.md`, `rfc-as-structured-data.md`,
`mcp-query-api.md`

**Core questions:**
- Is there prior art for "methodology-as-code" — treating agent methodology
  as a structured artifact rather than prose documentation?
- What is the current state of agent protocol standardization efforts?
  (MCP, ACI, A2A, AgentOps)
- Are any teams using YAML-driven or schema-driven agent configuration at scale?
- How does Infrastructure-as-Code (Terraform, Pulumi) relate to Organon's
  YAML-first approach — are there lessons from the IaC maturation arc?
- What is the state of agent memory and state management — does anyone model
  it as a typed schema?

**Specific topics to investigate:**
- **Model Context Protocol (MCP)**: Anthropic's MCP specification, adoption
  status, the server/client model — Organon's MCP server is building on this;
  what does the full MCP ecosystem look like in 2026?
- **Agent-to-Agent (A2A) protocol**: Google's A2A — inter-agent communication
  standard; how it compares to MCP for Organon's routing pattern
- **Agent Communication Infrastructure (ACI)**: any academic or industry
  efforts to standardize agent communication beyond MCP/A2A
- **YAML-driven agent systems**: LangChain LCEL, Dify, Flowise — declarative
  agent workflow systems; what schema decisions did they make?
- **Infrastructure-as-Code maturation arc**: how Terraform moved from ad-hoc
  configs to typed schemas (CDK, Pulumi with TypeScript) — lessons for
  Organon's YAML → Idris schema path
- **Agent memory systems**: MemGPT, Zep, Letta — how they model memory;
  whether typed schemas are used; relates to Working Memory / Episodic Memory
  agent design
- **OpenAI Assistants API & function calling**: structured tool definitions
  as a proto-schema for agents — what schema design decisions did OpenAI make?

**Search terms:**
- "agent protocol standard MCP A2A 2025 2026"
- "YAML driven agent workflow schema"
- "methodology as code agent systems"
- "infrastructure as code lessons agent configuration"
- "typed schema agent memory state"
- "declarative agent orchestration"

**Output:** `sota-agentic-methodology.md`

---

## Area 6: Context Retrieval & Working Memory Management

**Informs:** `rag-context-retrieval.md`, `metacognition-foundations.md`
(progressive disclosure / working memory)

**Core questions:**
- What is the state of RAG in 2026 — have structured/deterministic approaches
  gained traction over pure embedding-based retrieval?
- Are there systems using graph-structured metadata for retrieval rather than
  flat vector indexes?
- What does the research say about optimal context window utilization —
  "lost in the middle" problem, progressive disclosure strategies?
- Is there work on using typed schemas or ontologies to structure retrieval
  (knowledge graph RAG)?
- How do the major labs handle context management in long-horizon agentic tasks?

**Specific topics to investigate:**
- **GraphRAG** (Microsoft, 2024): graph-structured knowledge for retrieval —
  direct analog to Organon's frontmatter graph; how does it compare?
- **"Lost in the middle"** (Liu et al., 2023): LLMs underperform on
  information in the middle of long contexts — implications for progressive
  disclosure ordering
- **Contextual retrieval** (Anthropic, 2024): prepending chunk-level context
  before embedding — does this apply to Organon's frontmatter-as-context approach?
- **HyDE** (Hypothetical Document Embeddings): generate a hypothetical answer,
  embed that — any structured analogs for organon queries?
- **RAPTOR** (Sarthi et al., 2024): recursive abstractive processing for
  tree-organized retrieval — similar to Organon's scope hierarchy
- **Knowledge graph RAG**: combining structured KG traversal with vector
  retrieval — the hybrid approach Organon's RAG document considers
- **Token budget optimization research**: any work on optimal context
  packing strategies for LLM inputs?

**Search terms:**
- "GraphRAG knowledge graph retrieval 2024 2025"
- "deterministic structured retrieval LLM"
- "context window utilization lost middle"
- "knowledge graph RAG hybrid retrieval"
- "progressive context disclosure LLM"
- "token budget optimization context packing"

**Output:** `sota-context-retrieval.md`

---

## Area 7: Agent Evaluation & Empirical Measurement

**Informs:** `experimentation-system.md`, `metacognitive-quality-gates.md`

**Core questions:**
- What are the leading benchmarks for agentic AI in 2026?
- Is there prior work on measuring methodology contribution specifically —
  isolating the effect of process/methodology from model capability?
- How do the major labs evaluate their agents internally — what metrics do
  they care about?
- Is there research on process-level evaluation vs. outcome-level evaluation
  and when each is appropriate?
- What is the state of evaluation infrastructure — LangSmith, W&B Weave,
  Braintrust, etc.?

**Specific topics to investigate:**
- **SWE-bench** (Jimenez et al., 2023 / 2024 variants): software engineering
  tasks as agent evaluation — the closest existing benchmark to Organon-type
  tasks; what does the leaderboard look like in 2026?
- **AgentBench** (Liu et al., 2023): multi-environment agent evaluation;
  what dimensions does it measure and what's missing?
- **HELM** (Liang et al.): holistic evaluation framework; is there an agent
  variant?
- **τ-bench** (Yao et al.): tool-augmented agent benchmark — how it handles
  multi-step tasks with verification
- **Process reward models vs. outcome reward models**: the Lightman et al.
  "Let's Verify Step by Step" finding that process supervision outperforms
  outcome; implications for per-stage quality gates
- **Goal Achievement Index / Creative Adversarial Testing (CAT)**: the paper
  cited in `experimentation-system.md` — continuous alignment tracking;
  direct implementation of goal-reaching delta
- **Evaluation-Driven Development (EDDOps)**: the paper cited in
  `metacognitive-quality-gates.md` — what does this framework propose and
  what has adoption looked like?
- **Controlled experiments on LLM methodology**: is there any published work
  measuring the effect of structured prompting methodology (chain-of-thought,
  ReAct, Reflexion) with controlled baselines? This is the closest prior art
  to the Organon experimentation system.

**Search terms:**
- "SWE-bench 2025 2026 agentic evaluation"
- "agent benchmark methodology measurement"
- "process reward model outcome evaluation comparison"
- "goal achievement continuous evaluation LLM"
- "controlled experiment prompting methodology effect"
- "evaluation driven development LLM agents"

**Output:** `sota-evaluation.md`

---

## Area 8: Industry Landscape

**Informs:** all roadmap documents — situates Organon relative to where
major organizations are heading.

**Core questions for each organization:**
- What is their stated direction for agentic AI?
- What methodology, protocol, or framework decisions are they making?
- Where do they converge with Organon's ideas? Where do they diverge?
- What can Organon learn from or build on?

### OpenAI
- **o-series reasoning models** (o1, o3, o4-mini): internal chain-of-thought
  as metacognition — how does this relate to Organon's externalized metacognitive
  loop? Does internal CoT replace the need for external methodology?
- **Structured Outputs**: JSON Schema-constrained generation — their path up
  the formalism ladder; how far have they gone?
- **Function calling evolution**: from loose JSON to typed schemas — the
  infrastructure that Organon's MCP tools build on
- **Swarm / multi-agent**: OpenAI's published multi-agent patterns; agent
  handoff protocols
- **Operator / system prompt best practices**: how OpenAI guides developers
  to structure agent instructions — overlaps with Organon's ETHOS/PROTOCOL

### Anthropic
- **Extended thinking / interleaved thinking**: how their metacognitive
  architecture works in Claude 4 — the relationship to Organon's two-phase
  generate/verify pattern
- **Computer Use**: their approach to agentic tool use; what protocol
  decisions underlie it
- **Model Spec / Constitutional AI**: Anthropic's explicit values document as
  an ETHOS analog — how does their approach to identity-level constraints
  compare to Organon's ETHOS.md?
- **MCP ecosystem**: Anthropic originated MCP; what is their vision for
  where it goes? What tools are they building internally?
- **Multi-agent research**: any published work on Anthropic's approach to
  agent collaboration

### Google DeepMind
- **Gemini 2.x thinking**: their chain-of-thought / extended reasoning
  approach; how it compares to Claude and o-series
- **AlphaProof / AlphaGeometry**: formal verification meets ML — DeepMind's
  work connecting machine learning to proof assistants; most direct industry
  analog to the types-as-ontology direction
- **Agent-to-Agent (A2A) protocol**: Google's inter-agent communication
  standard; how it positions relative to Anthropic's MCP
- **Gemini tool use / function calling**: schema decisions, how they've
  evolved
- **NotebookLM / Workspace AI**: how they think about AI interacting with
  structured documents — relevant to the YAML-first / MCP query angle

### Meta
- **LLaMA 3 / 4 agentic use**: how the open-source community is building
  agentic systems on open models; what methodology conventions have emerged
- **Research on multi-agent systems**: any published Meta research on
  agent collaboration
- **LLM evaluation / HELM contributions**: Meta's approach to evaluation

### Microsoft
- **AutoGen evolution**: where AutoGen / AutoGen Studio has gone in 2025–2026;
  their approach to multi-agent cognitive function assignment
- **Copilot / GitHub Copilot**: structured agent methodology in their
  development assistant; what formal structure (if any) governs Copilot agents
- **Semantic Kernel**: Microsoft's agent SDK; typed tool definitions; how it
  approaches schema and methodology
- **TypeSpec**: Microsoft's API description language — relevant to typed schema
  for agent interfaces

### Startups & Research Labs
- **Cognition AI / Devin**: long-horizon autonomous software engineering;
  what methodology governs multi-step execution?
- **Cursor / Windsurf**: IDE-integrated agentic coding; how they handle
  context, verification, and methodology
- **LangChain / LangGraph**: the de facto orchestration layer; what schema
  decisions have they converged on?
- **Pydantic AI**: Python-native typed agent framework; their approach to
  type safety in agent definitions — the Python analog to types-as-ontology

**Output:** `sota-industry-landscape.md`

---

## Research Execution Strategy

### Phase 1: High-priority areas (execute first)

1. `sota-formal-methods.md` — foundational for types-as-ontology upgrade
2. `sota-metacognition-llm.md` — foundational for the metacognition family
3. `sota-multi-agent.md` — foundational for cognitive-team design
4. `sota-industry-landscape.md` — situates everything; informs priorities

### Phase 2: Medium-priority areas

5. `sota-hallucination.md` — extends existing research in
   `hallucination-detection.md`; less urgent since that doc is already thorough
6. `sota-agentic-methodology.md` — important for validating YAML-first and
   MCP directions; medium urgency
7. `sota-evaluation.md` — needed before implementing the experimentation
   system; medium urgency

### Phase 3: Lower-priority areas

8. `sota-context-retrieval.md` — RAG is well-understood; Organon's
   deterministic angle is genuinely novel; research is confirmatory rather
   than directional

### For each output document

Use the output format defined in `sota-methodology.md` (§ Output Document Format).
The Synthesizer agent writes and maintains these documents using the standard
template. Do not create a different structure — all 8 output documents must follow
the same format to be comparable and composable.

The authoritative section order is: Summary → Key Findings → Related Work
(Annotated) → Similar Projects & Directions → Industry Directions → What Organon
Can Build On → What Appears Novel to Organon → Open Questions → Critic's
Unresolved Challenges. The document header includes: Research date, Session N of
estimated M, Informs (links to 0.6.0 roadmap documents), Goal-reaching delta.

---

## Cross-Cutting Themes to Watch

These themes cut across multiple research areas and warrant specific attention:

**1. The formalism vs. pragmatism tradeoff**
The industry is converging toward more structure (typed schemas, constrained
decoding, structured outputs) without going full dependent types. Where is the
inflection point? Is Idris 2 ahead of its time for mainstream adoption, or is
there a path to making it accessible?

**2. Internal vs. external metacognition**
OpenAI's o-series and Anthropic's extended thinking both implement metacognition
*internally* (the model reasons about its own reasoning without external
scaffolding). Organon implements it *externally* (via methodology, gates, and
constraints). What does research say about the relative effectiveness of
these approaches? Are they complementary?

**3. Cognitive function vs. task role assignment**
Almost all multi-agent systems (MetaGPT, AutoGen, ChatDev) assign agents
*tasks*. Organon's cognitive team assigns agents *cognitive functions*. Is
there any prior work making this distinction explicitly? This may be a
genuinely novel framing worth publishing.

**4. Methodology as a formal artifact**
The algebra-of-methodologies research treats methodology as a formal algebraic
structure. Is this being done anywhere else? The closest analogs might be
process algebra and formal methods — but those are applied to systems, not to
the methodologies for building systems.

**5. The compiler as verifier pattern**
Using a dependent type checker (idris2 check) as the verification engine for
non-code artifacts is unusual. Are there other projects doing this? The closest
might be using Coq/Lean to verify specifications that are then used as code
contracts, but for YAML-serialized domain knowledge it seems novel.
