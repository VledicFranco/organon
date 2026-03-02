# State of the Art: Industry Landscape

> Research date: 2026-03-01
> Session 3 of estimated 3–4
> Informs: all roadmap documents (especially mcp-query-api.md)
> Goal-reaching delta: 0.70 / 1.0

---

## Summary

**Session 1 progress preserved.** MCP, A2A, and Semantic Kernel findings stand. The structural architecture conclusions (MCP as transport, SEP-1686 gate-pausing hook, A2A observational states, SK ADR 0070 as problem statement) are unchanged.

**Session 2 resolved and partially resolved.** OpenAI Structured Outputs was deeply investigated: token-level enforcement via CFG is real and mature for structural/syntactic constraints; semantic/behavioral enforcement does not exist at this tier. GaaS (arXiv 2508.18765) was investigated: it is a post-generation behavioral firewall with a novel Trust Factor mechanism, not a methodology layer. LangGraph StateGraph enforcement model was characterized: structural state validation and interrupt-gated routing exist; no behavioral specification language. DSPy was correctly characterized: a partial specification layer (Signatures) plus a retry enforcement mechanism (Assert); the closest examined analog to a methodology layer, but not one.

**Session 3 resolved the two blocking gaps on AC3.** Agent Behavioral Contracts / AgentAssert (arXiv 2602.22302, Feb 2026) was read in full: ABC is YAML-based, separable from agent code, and implements a formal behavioral contract tuple (C = P, I_hard, I_soft, G_hard, G_soft, R) with a Drift Bounds probabilistic guarantee. However, ABC is session-scoped (one execution trace), not project-scoped; AgentAssert is not publicly available (patent pending); the paper is single-author, not peer-reviewed, with a self-designed benchmark. Evidence quality is LOW. ABC partially occupies Tier 4 at session-scope only. MI9 Agent Intelligence Protocol (arXiv 2508.03858) was read in full: MI9 is an FSM-based runtime conformance monitor, framework-coupled (LangChain, CrewAI, AutoGen adapters), with no separable specification files, no versioning, no project scope, and a 99.81% detection rate from LLM-judged synthetic traces only. MI9 belongs in Tier 3b (runtime conformance monitor), NOT Tier 4. Agent Contracts Resource-Bounded (arXiv 2601.08815) was identified and confirmed as resource governance only (token budgets, compute limits, API call quotas) — not behavioral specification, not in the taxonomy.

**AC status after Session 3:**
- AC1 (enforcement taxonomy): Taxonomy now structurally complete with Tier 3/4 sub-tier splits. All investigated frameworks placed. Tier 1 completeness (llguidance) remains uninvestigated. Score: 0.70/1.0
- AC2 (methodology layers): DSPy Signatures remain the closest examined analog. ABC ContractSpec (session-scope, low evidence quality) added as partial analog. No project-scope methodology layer found in any examined framework. SK Process Framework (Q2 2026) uninvestigated. Score: 0.70/1.0
- AC3 (has any framework achieved behavioral specification?): No examined framework achieves project-scope behavioral specification with separable artifacts and methodology-layer enforcement. ABC achieves session-scope (low evidence quality). Gap confirmed within investigated sample; moderate confidence. Score: 0.75/1.0
- AC4 (what gaps exist): Structural-vs-behavioral gap documented. Post-generation enforcement landscape now characterized (Tier 3a output firewall, Tier 3b conformance monitor). ABC ContractSpec tuple (soft/hard distinction) is a novel mechanism. MI9 graduated containment noted. Resource-bounded contracts confirmed out of scope. Score: 0.65/1.0
- Overall: 0.70/1.0 (Architect re-assessment; Synthesizer self-assessed 0.68)

---

## Key Findings

**Finding 1: MCP provides primitives, not workflow enforcement — and the gap is structural, not incidental.**
- **Finding:** MCP's three primitives (Tools, Resources, Prompts) are capability-exposure mechanisms. There is no workflow layer, no phase concept, no enforcement semantics. SEP-1686 (PR #1732, merged Nov 2025) adds async Task tracking for long-running tool calls with 5 states (working, input_required, completed, failed, cancelled), scoped to individual tool calls only — no workflowId, no phaseId, no multi-step orchestration. The `input_required` state can be used to pause a tool call while a gate check runs, but this requires application-layer convention, not protocol enforcement. Governance moved to AAIF/Linux Foundation in late 2025.
- **Evidence:** MCP specification (Anthropic, 2024); SEP-1686 / PR #1732, read directly, merged Nov 2025. Established finding — these are protocol specifications, not claims.
- **Implication for Organon:** The mcp-query-api.md design cannot delegate methodology enforcement to MCP. The routing layer, phase sequencing, gate logic, and constraint evaluation must live in Organon's application code. MCP is the transport; Organon is the methodology. This is not a gap to fill by waiting for MCP to evolve — it is a stable architectural division.

**Finding 2: A2A task states are observational, not prescriptive — compliance is self-declared.**
- **Finding:** A2A Protocol v0.2.5 (Google, read directly) defines 9 task lifecycle states (SUBMITTED, WORKING, COMPLETED, FAILED, CANCELED, INPUT_REQUIRED, REJECTED, AUTH_REQUIRED, UNSPECIFIED). These states describe what happened, not what must happen next. The spec explicitly states: "Compliance is implementation-dependent; servers self-declare capabilities." The AgentCard schema (name, description, url, version, capabilities, skills array) contains no methodology, compliance, or constraint fields. The `context_id` field groups tasks — the closest structural analog to Organon's session concept.
- **Evidence:** A2A Protocol v0.2.5 specification, read directly. Established finding — this is a specification document.
- **Implication for Organon:** A2A provides no enforcement surface for methodology gates. If Organon agents communicate via A2A, the methodology layer must be implemented above the protocol. The REJECTED and AUTH_REQUIRED states warrant investigation: they may gate further execution in ways that could be mapped to methodology constraints (Critic flagged this as uninvestigated — see Open Questions).

**Finding 3: Semantic Kernel's declarative YAML spec conflates agent identity with agent behavior — it is a configuration format, not a methodology artifact.**
- **Finding:** SK ADR 0070 (read directly, status: "proposed") defines a YAML agent spec with fields: type, name, description, instructions, model config, tools array. Both what the agent is and what the agent does live in the `instructions` field as free text. There is no structural separation between constraints (ethos-layer), reasoning principles (philosophy-layer), and operational procedures (protocol-layer). ADR 0070 explicitly excludes multi-agent format and process format from scope. The Process Framework (deterministic workflow + compliance audit trails) is planned for Q2 2026 but not shipped as of this session.
- **Evidence:** SK ADR 0070, read directly. Status is "proposed" — not finalized. Industry claim for Process Framework (Q2 2026 ship date unverified). Early evidence overall.
- **Implication for Organon:** SK's three-layer confusion (identity/constraints/procedures all in `instructions`) is precisely the design problem Organon's ETHOS/PHILOSOPHY/PROTOCOL separation solves. This is not a competing design — it is the problem statement that Organon's design answers. The mcp-query-api.md can cite this gap explicitly. Note: ADR 0070's "proposed" status and explicit exclusion of multi-agent format means SK's most relevant components (multi-agent coordination, process enforcement) are the least defined.

**Finding 4: No examined framework exposes a project-scope methodology layer — confirmed within the investigated sample.**
- **Finding:** Of the systems deeply investigated (MCP, A2A, SK YAML, LangGraph, DSPy, GaaS, ABC, MI9), none exposes a project-scope methodology layer — a structured, enforceable, versioned representation of behavioral constraints separable from the execution engine and applicable across contributors and sessions. DSPy Signatures are the closest analog examined: a declared, discoverable specification layer at the class level. ABC ContractSpec is the only examined system with separable YAML behavioral specification files, but it is session-scoped (one execution trace) and carries low evidence quality. The negative conclusion is now confirmed within the investigated sample; a universal claim remains epistemically bounded by the sample. Moderate confidence — gray literature and uninvestigated works may exist.
- **Evidence:** MCP spec, A2A v0.2.5, SK ADR 0070 (read directly). LangGraph, DSPy, GaaS (deep investigation Session 2). ABC arXiv 2602.22302, MI9 arXiv 2508.03858 (read Session 3). Agent Contracts Resource-Bounded arXiv 2601.08815 (confirmed out of scope Session 3).
- **Implication for Organon:** The "no examined framework has a project-scope methodology layer" conclusion is confirmed for the investigated sample with moderate confidence. The ABC partial prior art (session-scope, low evidence quality) does not challenge Organon's project-scope contribution. Downstream novelty claims may be scoped to "no examined framework achieves project-scope behavioral specification with separable artifacts and methodology-layer enforcement."

**Finding 5: SEP-1686's `input_required` state is a concrete, usable integration point for long-running gate checks.**
- **Finding:** SEP-1686 adds an `input_required` state to MCP's async Task primitive. When a tool call reaches a gate condition, the tool call can pause with `input_required`, allowing the Organon routing layer to run its gate evaluation and resume or block the call. This is an application-layer convention, not protocol enforcement, but the mechanism is real, available now (merged Nov 2025), and matches Organon's gate architecture.
- **Evidence:** SEP-1686 / PR #1732, read directly, merged Nov 2025. Established finding.
- **Implication for Organon:** The mcp-query-api.md's `organon_verify_guided` tool should be designed to exploit `input_required` for gate pausing. This is the most direct integration point between MCP's current capabilities and Organon's enforcement layer. It requires no waiting for protocol evolution.

**Finding 6 (Session 2): OpenAI Structured Outputs — token-level structural enforcement is mature; semantic/behavioral enforcement does not exist at this tier.**
- **Finding:** OpenAI Structured Outputs enforces output shape via a context-free grammar (CFG) compiled from JSON Schema, applied at the token-sampling level. With `strict=true`, this applies to BOTH `response_format` and tool definitions. Enforced: required fields, types (string/number/boolean/array/object/null/enum), anyOf. NOT enforced: minLength/maxLength, pattern (regex), minimum/maximum, multipleOf, patternProperties, uniqueItems, recursive schemas (simple recursion only). Safety refusal overrides schema adherence — a `refusal` field is returned instead of a schema-valid response; this is a documented design choice with a programmatic detection path, not an architectural weakness. The open-source analog is Outlines (token-level constrained decoding); llguidance (Microsoft, open-sourced) was identified by the Critic as the foundational library credited by OpenAI, and was not investigated. Anthropic shipped equivalent capability in November 2025. Unsupported constraint surfaces were not compared side-by-side between OpenAI and Anthropic.
- **Evidence:** OpenAI Structured Outputs documentation (deep investigation, Session 2). llguidance: not read — Critic-flagged gap remains open. Safety refusal: documented design choice.
- **Implication for Organon:** Token-level CFG enforcement covers structural/syntactic schema compliance (required fields, types). It cannot enforce semantic constraints: value ranges, pattern matching, cross-field invariants, or behavioral protocols. Organon's gate architecture validates post-generation; generation-time enforcement is a complementary, not replacement, layer for the subset of structural constraints expressible in JSON Schema. The gate architecture design does not need to change, but can leverage structured outputs for a subset of output validation at generation time.

**Finding 7 (Session 2): LangGraph StateGraph — structural state validation and interrupt-gated routing exist; no behavioral specification language.**
- **Finding:** LangGraph uses Pydantic-typed StateGraph schemas — providing compile-time structural validation and runtime Pydantic exceptions on invalid state updates. Conditional edges are routing dispatch (selection of the next node), not rejection of invalid state. Interrupts pause execution and wait for resume input — when the resume input communicates rejection, this is a behavioral constraint enforcement mechanism at the application layer. The plan-and-execute pattern with scoped toolsets provides a form of pre-scoped capability restriction (closest analog to Organon's phase gating). There is no behavioral specification language native to LangGraph — no declared constraint artifact, no versioned behavioral spec, no phase concept. LangGraph is infrastructure Organon could run on top of.
- **Evidence:** LangGraph documentation and StateGraph model (deep investigation, Session 2).
- **Implication for Organon:** LangGraph's Pydantic-backed state validation and interrupt-gated routing are real primitives. They constrain state shape and can gate execution — but only through application-layer code, not through a specification artifact. Organon's methodology layer does not compete with LangGraph; it is a layer above it that provides the behavioral specification LangGraph lacks.

**Finding 8 (Session 2): DSPy — partial specification layer (Signatures) plus retry enforcement (Assert); the closest examined analog to a methodology layer, but not one.**
- **Finding:** DSPy has two distinct mechanisms that were incorrectly collapsed in the initial finding. DSPy Signatures are class-level Python definitions with field names, type annotations, and `desc` constraints — declared, discoverable, and readable without tracing the `forward()` method. This is a partial specification layer. DSPy Assert predicates are inline Python code checked post-generation, triggering a retry-with-backtracking loop (retries with failure message in context up to R times, then halts) — these are implementation-coupled, not discoverable without reading source, and correctly characterized as a retry mechanism. The DSPy optimizer (formerly "teleprompter") compiles Signatures plus training examples into optimized prompts — specification-driven prompt generation, not text injection. DSPy Suggest is the advisory variant of Assert. The system as a whole is not a methodology layer: constraints are embedded in code, not declared as versioned artifacts, and there is no phase, protocol, or ethos concept. But Signatures are the closest thing to a methodology-adjacent specification layer in any examined framework.
- **Evidence:** DSPy documentation and source (deep investigation, Session 2). Critic correction on Signatures vs. Assert conflation.
- **Implication for Organon:** DSPy Signatures demonstrate that a declared specification layer for LLM task interfaces is feasible within a framework. The key gap relative to Organon: Signatures are Python class definitions (implementation-coupled, not separable, not YAML-first, not versioned as standalone artifacts), and there is no ethos/philosophy/protocol separation. Organon's three-layer artifact system is structurally distinct from what DSPy achieves.

**Finding 9 (Session 2): GaaS — post-generation behavioral firewall with novel Trust Factor; now classified as Tier 3a.**
- **Finding:** GaaS (arXiv 2508.18765) operates POST-GENERATION, PRE-EXTERNALIZATION: it intercepts agent outputs before they affect the environment. Policies are declared before session as JSON artifacts. Rules use regex/boolean pattern matching on output strings. The Trust Factor is a novel mechanism: per-agent compliance scoring with severity-weighted penalties, persistent across the session — an adaptive enforcement model with a temporal dimension. GaaS cannot enforce phase sequencing, gate invariants, or behavioral protocols. It is a behavioral firewall (Tier 3a — Post-Generation Output Firewall), not a methodology layer. With Session 3 findings incorporated, GaaS is correctly distinguished from MI9 (Tier 3b — Runtime Conformance Monitor): GaaS operates on output string content, MI9 operates on execution trace temporal patterns.
- **Evidence:** arXiv 2508.18765, read directly.
- **Implication for Organon:** GaaS's Trust Factor is worth monitoring: session-persistent compliance history is a form of temporal enforcement state that Organon's gate architecture does not currently include. GaaS cannot replace Organon's methodology layer (no phase concept, no behavioral protocol, no versioned artifact) but could be a complementary output-filtering layer.

**Finding 10 (Session 3): ABC (Agent Behavioral Contracts) — session-scope YAML behavioral specification with formal tuple; evidence quality LOW.**
- **Finding:** ABC (arXiv 2602.22302, Feb 2026) defines a formal behavioral contract tuple C = (P, I_hard, I_soft, G_hard, G_soft, R) — Preconditions, Hard Invariants, Soft Invariants, Hard Governance, Soft Governance, Recovery. ContractSpec IS YAML-based and stored as separable files (separate from agent code) — this is the key structural similarity to Organon's artifact system. The Drift Bounds Theorem provides a probabilistic bound (γ > α → D* = α/γ in expectation), NOT a formal correctness guarantee. Critical constraints: (a) ABC is SESSION-SCOPED — it governs ONE execution trace bounded by session length T, not an ongoing project across contributors and sessions; (b) AgentAssert is NOT publicly available — patent pending; the GitHub user varun369 has no AgentAssert repo; no supplemental implementation found; (c) The paper is single-author (Varun Pratap Bhardwaj), carries no institutional affiliation, and is not peer-reviewed; (d) The evaluation uses a self-designed benchmark — evaluation circularity is present. The soft/hard invariant distinction (I_hard vs. I_soft, G_hard vs. G_soft) is a novel mechanism relative to binary pass/fail enforcement.
- **Evidence:** arXiv 2602.22302, read Session 3. Evidence quality: LOW (single author, no institutional affiliation, not peer-reviewed, AgentAssert not publicly available, self-designed benchmark, evaluation circularity).
- **Taxonomy placement:** Tier 4a — Session-Scope Behavioral Specification. ABC partially occupies Tier 4a. It does NOT occupy the project-scope position (Tier 4b). The separable YAML artifact is structurally similar to Organon; the session scope and evidence quality are disqualifying for the project-scope position.
- **Implication for Organon:** ABC is partial prior art at session-scope with low evidence quality. The ContractSpec tuple's soft/hard distinction (graduated enforcement rather than binary) is a novel mechanism Organon's invariant model should note. The project-scope gap (Tier 4b) remains unoccupied by any examined framework. ABC does not challenge Organon's project-scope contribution but does establish that session-scope YAML behavioral contracts have been proposed in the literature.

**Finding 11 (Session 3): MI9 (Multi-level Intelligent Governance) — FSM-based runtime conformance monitor; belongs in Tier 3b, NOT Tier 4.**
- **Finding:** MI9 (arXiv 2508.03858) is an FSM-based conformance engine that declares states and transitions before execution and monitors agent execution traces against declared behavioral patterns. ARI (Autonomy/Responsibility/Impact) classification is PER-AGENT, not per-phase — MI9 assigns risk levels to agents, not to execution phases. Graduated containment operates at 4 levels: observation → warning → restriction → isolation. Critical constraints: (a) MI9 is NOT separable from specific runtimes — it is tightly coupled to framework adapters (LangChain, CrewAI, AutoGen); (b) No versioning — no version control model for governance artifacts; (c) No project scope — governs one agent execution, not ongoing project methodology; (d) Pattern expressiveness is limited to fewer than 10 events in the evaluation; (e) The 99.81% detection rate is generated from LLM-judged synthetic traces only — no ground truth, closed-loop evaluation (LLM grades LLM). This statistic carries weak evidence status.
- **Evidence:** arXiv 2508.03858, read Session 3. Evidence quality: WEAK for the detection rate claim (LLM-judged synthetic traces, no ground truth, closed loop). The FSM architecture itself is independently verifiable.
- **Taxonomy placement:** Tier 3b — Runtime Conformance Monitor. MI9 operates on execution trace temporal patterns (not output string content, which distinguishes it from GaaS/Tier 3a). It is NOT Tier 4: no separable specification files, no versioning, framework-coupled, no project scope.
- **Implication for Organon:** MI9's graduated containment (4 levels) is a more nuanced enforcement response model than binary block/allow. MI9's per-agent ARI classification is not a phase concept and does not address phase sequencing in the sense Organon requires. The framework coupling disqualifies MI9 as an architecture Organon should emulate for the specification layer.

**Finding 12 (Session 3): Agent Contracts Resource-Bounded — resource governance only; explicitly out of scope for the behavioral enforcement taxonomy.**
- **Finding:** Agent Contracts Resource-Bounded (arXiv 2601.08815) defines a contract tuple C = (I, O, S, R, T, Φ, Ψ) governing token budgets, compute limits, and API call quotas. This is resource governance, not behavioral specification. The contract is programmatic (not YAML file-based). Scope is per-task resource constraints. It does not govern behavioral methodology, phase adherence, invariants, or procedural compliance.
- **Evidence:** arXiv 2601.08815, identified and assessed Session 3.
- **Taxonomy placement:** NOT IN THE BEHAVIORAL ENFORCEMENT TAXONOMY. This work is explicitly out of scope.
- **Implication for Organon:** No implication — this is a negative result that sharpens the taxonomy boundary. Resource governance and behavioral specification are categorically distinct problem spaces. The arXiv 2601.08815 work is not competing prior art for Organon's behavioral specification direction.

---

## Enforcement Mechanism Taxonomy (AC1 — Session 3 Update)

A four-tier taxonomy with sub-tier splits. Tier 3 and Tier 4 are now sub-categorized based on Session 3 findings.

**Tier 1: Structural / Generation-Time**
Enforcement at the token-sampling level. Constrains the shape of generated output before it is produced.
- Mechanism: Context-free grammar (CFG) compiled from JSON Schema; applied during token sampling.
- Examples: OpenAI Structured Outputs (strict=true), llguidance (Microsoft, foundational library — not fully investigated), Outlines (open-source).
- What it can enforce: required fields, types, enum values, anyOf.
- What it cannot enforce: value ranges, regex patterns, cross-field invariants, semantic constraints, behavioral protocols.
- Organon relevance: Applicable to structural schema compliance for LLM outputs at generation time. Complementary to, not a replacement for, post-generation gate validation.
- Gap: llguidance constraint expression capability uninvestigated.

**Tier 2: Structural / State-Validation (Framework Runtime)**
Enforcement at framework runtime against declared state schemas. Constrains state shape during execution.
- Mechanism: Pydantic-typed state schemas; compile-time validation + runtime exceptions on invalid updates.
- Examples: LangGraph StateGraph, DSPy Signatures (specification layer; enforcement is weaker — retry, not hard rejection).
- What it can enforce: state field types, required state fields, node routing (via conditional edges).
- What it cannot enforce: behavioral protocols, phase sequencing, semantic invariants, cross-session constraints.
- Organon relevance: LangGraph's Pydantic validation is infrastructure Organon's state machine could leverage. DSPy Signatures are the closest partial-methodology-layer analog examined.

**Tier 3a: Post-Generation / Output Firewall**
Enforcement after generation, before externalization. Intercepts and filters outputs against declared policies based on output string content.
- Mechanism: Regex/boolean pattern matching on output strings; policy artifacts declared pre-session.
- Examples: GaaS (arXiv 2508.18765) with Trust Factor; DSPy Assert (retry-with-backtracking); DSPy Suggest (advisory).
- What it can enforce: output string patterns, presence/absence of content, severity-weighted compliance scoring (GaaS Trust Factor).
- What it cannot enforce: phase sequencing, gate invariants, behavioral protocols, cross-phase state.
- Organon relevance: Complementary filtering layer. GaaS's Trust Factor (session-persistent compliance history) is a temporal enforcement concept absent from Organon's current gate architecture.

**Tier 3b: Runtime Conformance Monitor**
Enforcement via FSM-based pattern matching on execution traces. Monitors temporal behavioral patterns during execution.
- Mechanism: FSM with declared states and transitions; per-agent risk classification; graduated containment responses.
- Examples: MI9 Agent Intelligence Protocol (arXiv 2508.03858) — graduated containment (observation → warning → restriction → isolation). NOTE: MI9's 99.81% detection rate is from LLM-judged synthetic traces only; weak evidence.
- What it can enforce: temporal execution patterns, agent-level risk classification, graduated containment.
- What it cannot enforce: cross-session methodology, versioned behavioral specs, project-scope constraints, phase sequencing at the methodology layer.
- Distinguishing feature vs. Tier 3a: Tier 3b operates on execution trace temporal patterns; Tier 3a operates on output string content.
- Organon relevance: MI9's graduated containment model (4 levels) is a more nuanced enforcement response than binary block/allow. MI9 is framework-coupled and not separable — not an architecture Organon should emulate for its specification layer.

**Tier 4a: Session-Scope Behavioral Specification**
Enforcement via declared behavioral specification artifacts, scoped to one execution session/trace.
- Mechanism: YAML-based contract files separable from agent code; formal contract tuple with hard/soft invariant distinction; probabilistic drift bounds.
- Examples: ABC / AgentAssert (arXiv 2602.22302) — C = (P, I_hard, I_soft, G_hard, G_soft, R). CAVEAT: AgentAssert not publicly available (patent pending); single author, no institutional affiliation, not peer-reviewed, self-designed benchmark. Evidence quality: LOW.
- What it can enforce: session-bounded preconditions, hard and soft invariants, hard and soft governance rules, recovery procedures.
- What it cannot enforce: project-scope behavioral methodology, cross-session versioning, multi-contributor behavioral spec evolution.
- Organon relevance: ABC is partial prior art at session-scope (low evidence quality). The YAML separability and soft/hard invariant distinction are structurally relevant. The session scope is the key differentiator from Organon's project scope.

**Tier 4b: Project-Scope Behavioral Specification — UNOCCUPIED**
Enforcement via structured, versioned behavioral specification artifacts governing agent behavior across an entire project, across contributors and sessions.
- Mechanism: Would require: separable versioned artifact files (ETHOS/PHILOSOPHY/PROTOCOL or equivalent), project-scope enforcement, methodology-layer gate architecture, contributor-facing specification tooling.
- Examples: NONE FOUND in investigated sample.
- What it would enforce: project-scope behavioral constraints, phase sequencing, gate invariants, cross-session methodology compliance, contributor behavioral alignment.
- Organon relevance: This is the tier Organon operates in. No examined framework occupies this tier. The gap is confirmed within the investigated sample. Moderate confidence — gray literature may exist.

---

## Related Work (Annotated)

### Protocol Standards

- **Model Context Protocol (MCP)** (2024) — Anthropic — https://modelcontextprotocol.io/
  Three-primitive protocol (Tools, Resources, Prompts) for LLM-server communication. Governance transferred to AAIF/Linux Foundation late 2025; OpenAI, Anthropic, and Block are co-founders of the Agentic AI Foundation. Widely adopted across major IDE integrations and tool providers. No workflow layer; no enforcement semantics; no phase concept. The foundational transport for Organon's MCP server.
  Tags: #mcp #protocol #anthropic #transport

- **MCP SEP-1686: Async Tasks** (Nov 2025) — Anthropic / community — https://github.com/modelcontextprotocol/mcp/pull/1732
  "Call-now, fetch-later" extension for long-running tool calls. Adds 5 task states (working, input_required, completed, failed, cancelled) scoped to individual tool calls. No workflowId, no phaseId. `input_required` is the gate-pausing hook for Organon's enforcement layer. Merged Nov 2025. MCP specification donated to Linux Foundation (Agentic AI Foundation); November 2025 version includes async Tasks and OAuth scope names.
  Tags: #mcp #sep-1686 #async #gate-pause #integration-point

- **Agent-to-Agent Protocol (A2A) v0.2.5** (2025) — Google — https://google.github.io/A2A/
  Inter-agent communication standard. AgentCard for capability discovery; 9-state task lifecycle (SUBMITTED → COMPLETED / FAILED / REJECTED / AUTH_REQUIRED etc.). Horizontal agent-to-agent vs. MCP's vertical model-to-server. Compliance is self-declared; zero enforcement semantics in the spec. `context_id` groups related tasks. Positioned as complement to, not replacement for, MCP.
  Tags: #a2a #google #protocol #inter-agent #task-states

### Framework Specs

- **Semantic Kernel ADR 0070: YAML Agent Declarative Spec** (status: proposed) — Microsoft — https://github.com/microsoft/semantic-kernel/blob/main/docs/decisions/0070-agents.md
  YAML schema for declarative agent definition: type, name, description, instructions (free text), model config, tools array. Identity and behavior conflated in `instructions`. Explicitly excludes multi-agent format and process format from scope. Not finalized. SK's `FunctionChoiceBehavior` and `KernelPlugin` may partially compensate for the missing structure — not investigated.
  Tags: #semantic-kernel #microsoft #yaml #declarative #adr-0070

- **Semantic Kernel Process Framework** (planned Q2 2026, not shipped) — Microsoft
  Described as deterministic workflow + compliance audit trails. Would be SK's closest analog to Organon's enforcement layer. Not available as of 2026-03-01. Industry claim — unverified ship date.
  Tags: #semantic-kernel #process-framework #planned #unverified

- **LangGraph 1.0** (2025) — LangChain — https://github.com/langchain-ai/langgraph
  StateGraph-based multi-agent coordination. Pydantic-typed StateGraph schemas provide compile-time structural validation and runtime exceptions on invalid state updates. Conditional edges are routing dispatch, not behavioral rejection. Interrupt-gated routing enables application-layer enforcement. No behavioral specification language; no native methodology layer. Infrastructure Organon could run on top of. (Deep investigation, Session 2.)
  Tags: #langgraph #stategraph #orchestration #pydantic #interrupt-gated

- **DSPy** (2024–2025) — Stanford NLP — https://github.com/stanfordnlp/dspy
  Two-mechanism system: (a) Signatures — class-level declared specifications with field names, type annotations, desc constraints; discoverable without reading forward(); closest analog to a methodology-adjacent specification layer in any examined framework. (b) Assert/Suggest — post-generation predicate checks triggering retry-with-backtracking (up to R retries); implementation-coupled; not a methodology layer. DSPy optimizer compiles Signatures + training examples into optimized prompts. (Deep investigation, Session 2; Critic correction applied.)
  Tags: #dspy #signatures #assert #retry #partial-spec-layer

- **GaaS: Governance as a Service** (2025) — arXiv 2508.18765 — https://arxiv.org/abs/2508.18765
  Post-generation, pre-externalization behavioral firewall (Tier 3a). JSON policy artifacts declared pre-session; regex/boolean pattern matching on output strings. Novel Trust Factor mechanism: per-agent compliance scoring with severity-weighted penalties, session-persistent. Cannot enforce phase sequencing or behavioral protocols. Correctly classified as Tier 3a (Output Firewall) after Session 3 taxonomy refinement. (Deep investigation, Session 2.)
  Tags: #governance #post-generation #firewall #trust-factor #behavioral #tier-3a

### Behavioral Specification Works

- **Agent Behavioral Contracts (ABC) / AgentAssert** (Feb 2026) — arXiv 2602.22302 — https://arxiv.org/abs/2602.22302
  Session-scope YAML behavioral specification. Formal contract tuple C = (P, I_hard, I_soft, G_hard, G_soft, R). ContractSpec files are YAML and separable from agent code. Drift Bounds Theorem: probabilistic bound (γ > α → D* = α/γ in expectation), NOT formal correctness guarantee. Soft/hard invariant distinction is a novel enforcement mechanism. CRITICAL CAVEATS: (1) session-scoped only — not project-scoped; (2) AgentAssert not publicly available — patent pending; (3) single author (Varun Pratap Bhardwaj), no institutional affiliation, not peer-reviewed; (4) self-designed benchmark — evaluation circularity. Placed in Tier 4a (Session-Scope Behavioral Specification). Does NOT occupy Tier 4b (project-scope). Evidence quality: LOW. (Investigated Session 3.)
  Tags: #behavioral-contracts #design-by-contract #yaml #session-scope #tier-4a #low-evidence-quality

- **MI9 Agent Intelligence Protocol** (Aug 2025) — arXiv 2508.03858 — https://arxiv.org/abs/2508.03858
  FSM-based runtime conformance monitor (Tier 3b). Per-agent ARI (Autonomy/Responsibility/Impact) classification — NOT per-phase. Graduated containment: observation → warning → restriction → isolation. Framework-coupled (LangChain, CrewAI, AutoGen adapters) — not separable. No versioning, no project scope. Pattern expressiveness: fewer than 10 events in evaluation. Detection rate: 99.81% — WEAK EVIDENCE (LLM-judged synthetic traces only, no ground truth, closed-loop evaluation). NOT Tier 4: does not have separable specification files, no versioning, framework-coupled. Corrects prior framing that had MI9 as potentially relevant to phase sequencing at the methodology layer. (Investigated Session 3.)
  Tags: #fsm #conformance #monitoring #runtime #tier-3b #framework-coupled #weak-evidence

### Negative Results

- **Agent Contracts Resource-Bounded** (2026) — arXiv 2601.08815 — https://arxiv.org/abs/2601.08815
  EXPLICIT NEGATIVE RESULT — out of scope for the behavioral enforcement taxonomy. Governs resource constraints only: token budgets, compute limits, API call quotas. Contract tuple C = (I, O, S, R, T, Φ, Ψ) is programmatic, not YAML file-based. Scope is per-task resource constraints, not behavioral methodology. Does not govern behavioral methodology, phase adherence, invariants, or procedural compliance. Identified and dismissed in Session 3.
  Tags: #resource-governance #out-of-scope #negative-result #not-behavioral-specification

### Constrained Decoding Libraries

- **Outlines** (open-source) — https://github.com/dottxt-ai/outlines
  Token-level constrained decoding library. CFG compiled from JSON Schema or regex applied during token sampling. Open-source analog to OpenAI's Structured Outputs. Investigated at reference level.
  Tags: #constrained-decoding #structured-outputs #open-source

- **llguidance** (Microsoft, open-sourced) — https://github.com/microsoft/llguidance
  Foundational constrained decoding library credited by OpenAI as underlying their structured outputs implementation. May have fuller constraint expression capability than Outlines. NOT investigated — Critic-flagged gap carried forward from Session 2. Investigate in Session 4.
  Tags: #constrained-decoding #microsoft #foundational #uninvestigated

---

## Similar Projects & Directions

**Semantic Kernel Process Framework (Microsoft, planned Q2 2026)**
Convergence: deterministic workflow + compliance audit trails — conceptually close to Organon's enforcement loop.
Divergence: not shipped; status unknown; lives inside SK's monolithic SDK rather than as a separable methodology layer. If shipped, it would represent the closest industry analog to Organon's gate architecture — but as a component of a large SDK, not a standalone methodology system.
What to learn: monitor the Q2 2026 ship. If it materializes, assess the audit trail schema — it may provide prior art for Organon's verification record format.

**A2A + MCP composition (Google + Anthropic ecosystem)**
Convergence: MCP handles vertical (model ↔ server) communication; A2A handles horizontal (agent ↔ agent) communication. Together they cover the transport layer Organon's MCP server builds on.
Divergence: neither protocol addresses methodology. The composition creates a complete transport stack with a conspicuous methodology-shaped hole above it.
What to learn: Organon sits above both protocols. The mcp-query-api.md design should be explicit about which protocol layer each operation uses.

**GaaS (arXiv 2508.18765) — investigated Session 2, classified Tier 3a Session 3**
Convergence: separable governance layer concept; session-persistent Trust Factor as temporal enforcement state.
Divergence: behavioral firewall operating on output strings (Tier 3a), not a declarative methodology artifact system. No phase concept, no protocol layer, no versioned specification.
What to learn: Trust Factor's adaptive, session-persistent compliance scoring is a temporal enforcement dimension Organon's gate architecture does not currently model. Worth assessing whether Organon's gate history mechanism should incorporate a compliance-score concept.

**DSPy (Stanford NLP) — investigated Session 2**
Convergence: Signatures provide a declared, discoverable specification layer for LLM task interfaces. Optimizer compiles specifications into prompts — specification-driven generation.
Divergence: Signatures are Python class definitions, not standalone versioned artifacts. No ethos/philosophy/protocol separation. Assert predicates are implementation-coupled. The system is not separable from the Python execution environment.
What to learn: Signatures demonstrate that declared specifications for LLM interfaces are feasible and practically useful. The gap is artifact separability, versioning, and the three-layer structure — not the concept of specification.

**ABC (arXiv 2602.22302) — investigated Session 3, Tier 4a**
Convergence: YAML-based separable contract files; formal tuple with preconditions, invariants, governance, recovery; behavioral specification as a first-class artifact.
Divergence: session-scoped (one execution trace only); AgentAssert not publicly available; single author, not peer-reviewed, self-designed benchmark; no project scope, no versioning across contributors.
What to learn: The soft/hard invariant distinction (I_hard vs. I_soft, G_hard vs. G_soft) is a graduated enforcement mechanism Organon's current binary-enforcement model could consider adopting. The YAML separability confirms that YAML-based behavioral spec files are a viable artifact format. Low evidence quality limits how heavily this can be cited.

---

## Industry Directions

**Anthropic**
MCP originator. Governance transferred to AAIF/Linux Foundation — signals intent to make MCP a neutral standard, not a proprietary moat. Structured Outputs shipped GA November 2025 (equivalent capability to OpenAI). Extended thinking / interleaved thinking (Claude 4) implements metacognition internally. No publicly known external methodology layer for agents. The Model Spec is Anthropic's own ETHOS analog for Claude's values — it operates at the model level, not the agent workflow level.

**Google**
A2A protocol is Google's inter-agent communication standard. Positions as horizontal complement to MCP's vertical. Enforcement is self-declared — Google's spec is deliberately non-prescriptive about methodology. AlphaProof / AlphaGeometry (formal verification + ML) is the most relevant Google direction for Organon's formal methods work, but is not directly relevant to methodology enforcement. Gemini tool use / function calling: schema decisions not deeply investigated.

**Microsoft**
AutoGen + Semantic Kernel merged into Microsoft Agent Framework (Oct 2025 — industry claim, unverified in detail). SK ADR 0070 is the best available signal on their declarative agent direction. The Process Framework (Q2 2026) would be the most relevant Microsoft development for Organon if it ships. llguidance (open-sourced) is the foundational constrained decoding library underlying OpenAI's structured outputs — Microsoft's most relevant technical contribution to enforcement infrastructure, not investigated. TypeSpec (API description language) is relevant to typed schema for agent interfaces — not investigated.

**OpenAI**
Structured Outputs characterized in depth: token-level CFG enforcement is mature for structural constraints; semantic/behavioral enforcement does not exist at this tier. Safety refusal is a documented design choice (programmatic detection via `refusal` field), not an architectural limitation. The unsupported constraint surface (minLength, pattern, minimum/maximum, etc.) establishes a ceiling on what generation-time enforcement can achieve without post-generation validation. Function calling evolution and the o-series internal chain-of-thought as metacognition were not investigated.

**LangChain / LangGraph**
De facto orchestration layer for the broader community. StateGraph provides Pydantic-backed structural state validation; interrupt-gated routing enables application-layer enforcement. No behavioral specification language. The community convergence on LangGraph represents the infrastructure baseline above which Organon's methodology layer operates. LangGraph is not a competitor — it is the platform layer.

---

## What Organon Can Build On

**MCP as transport.** The full MCP ecosystem (Tools, Resources, Prompts primitives; AAIF governance; broad IDE integration) is a stable, production-grade transport for the Organon MCP server. Organon does not need to reinvent or compete with this layer. Design the mcp-query-api.md as an MCP server that exposes methodology artifacts as queryable Resources and methodology operations as Tools.

**SEP-1686 `input_required` for gate-pausing.** The async Task primitive's `input_required` state (merged Nov 2025) is a concrete integration point for Organon's gate architecture. When a multi-step operation reaches a methodology gate, the tool call pauses with `input_required`, Organon's routing layer evaluates the gate, and execution resumes or blocks. This requires application-layer implementation but no protocol extension. The mcp-query-api.md's `organon_verify_guided` tool should be designed around this hook.

**A2A `context_id` as session analog.** If Organon agents communicate via A2A, `context_id` groups related tasks — a structural analog to Organon's session concept. This is a natural mapping point, not an enforcement surface.

**OpenAI Structured Outputs for structural schema validation at generation time.** CFG enforcement covers required fields and types — a complementary layer to Organon's post-generation gate validation for structural constraints expressible in JSON Schema. Organon's gate architecture validates semantics and behavioral protocols post-generation; generation-time enforcement handles a subset of structural checks earlier in the pipeline.

**LangGraph as execution infrastructure.** LangGraph's Pydantic-backed StateGraph and interrupt-gated routing are real enforcement primitives at the framework level. Organon's methodology layer sits above LangGraph, providing the behavioral specification and protocol artifact layer that LangGraph lacks. These are complementary, not competing.

**DSPy Signatures as a prior art reference.** The Signatures pattern (declared, discoverable, class-level specification for LLM task interfaces) demonstrates feasibility. Organon's three-layer artifact system is structurally distinct but can cite Signatures as validation that declared specifications improve LLM output predictability.

**ABC ContractSpec YAML separability as validation.** ABC's YAML-based contract files separate from agent code confirm that YAML-first behavioral specification artifacts are a viable pattern, even at session-scope. The soft/hard invariant distinction is a graduated enforcement concept Organon's binary enforcement model could consider. Note evidence quality caveat: ABC is single-author, not peer-reviewed, with AgentAssert unavailable.

**GaaS Trust Factor as temporal enforcement reference.** GaaS's session-persistent compliance scoring is a temporal enforcement dimension absent from Organon's current gate architecture. Assess whether Organon's gate history mechanism should incorporate a compliance-score concept.

**The three-primitive MCP model as negative constraint.** MCP's absence of a workflow layer is not a design failure — it reflects a deliberate scope decision. Organon should not try to embed methodology enforcement into the MCP protocol layer. The clean architectural lesson: methodology goes above the transport, not in it.

**SK ADR 0070 as the problem statement.** The SK YAML spec's conflation of identity, constraints, and procedures in a single `instructions` field is a documented design gap that Organon's ETHOS/PHILOSOPHY/PROTOCOL separation directly addresses. The mcp-query-api.md can cite ADR 0070 when explaining why Organon's three-layer artifact separation is necessary.

---

## What Appears Novel to Organon

**A structured, versioned, project-scope methodology layer as a first-class system artifact.** No examined framework (MCP, A2A, SK YAML, LangGraph, DSPy, GaaS, ABC, MI9) treats methodology — behavioral constraints, procedural rules, invariants — as a structured, queryable, versioned artifact governing agent behavior at project scope, across contributors and sessions, separate from the execution engine. The closest industry direction is SK's planned Process Framework (Q2 2026, not shipped). ABC (arXiv 2602.22302) achieves session-scope YAML behavioral specification (Tier 4a) with low evidence quality — it is partial prior art at session-scope only. The project-scope position (Tier 4b) is unoccupied in the investigated sample.

**Confidence level:** Moderate — not high. The sample now includes all major enforcement-relevant works identified through three sessions. However, "moderate" is appropriate because: (1) the ABC evidence quality is low; (2) gray literature and uninvestigated works may exist; (3) SK Process Framework (Q2 2026) is the most plausible source of competing prior art and is not yet available. The prior hedge ("ABC and MI9 uninvestigated") is now resolved: ABC is partial prior art at session-scope (low evidence quality); MI9 is Tier 3b (not Tier 4); the project-scope gap is confirmed within the investigated sample.

**The ETHOS/PHILOSOPHY/PROTOCOL three-layer distinction.** No examined framework separates what constrains agent behavior (ethos-layer) from what explains the reasoning (philosophy-layer) from what prescribes procedure (protocol-layer). SK ADR 0070 puts all three in `instructions`. A2A's AgentCard has no methodology fields. MCP has no agent definition layer. LangGraph has no specification language. GaaS has policy artifacts but no ethos/philosophy separation. DSPy has Signatures (closest analog) but no layered structure. ABC has a contract tuple (P, I, G, R) that is structurally closer than any other examined system, but still conflates concerns that Organon separates (preconditions vs. invariants vs. goals, without a philosophy layer).

**Confidence level:** Moderate. The three-layer distinction is validated by absence across all investigated frameworks. The ABC ContractSpec tuple provides evidence that the field is moving toward more structured specification, but not toward the three-layer separation Organon defines.

---

## Open Questions

**Q1: CLOSED — ABC (arXiv 2602.22302) characterized.**
ABC is session-scoped YAML behavioral specification (Tier 4a), low evidence quality. Does NOT constitute project-scope prior art for Organon. The soft/hard invariant tuple is a novel mechanism of interest. AgentAssert unavailable. See Finding 10.

**Q2: CLOSED — MI9 (arXiv 2508.03858) characterized.**
MI9 is a Tier 3b Runtime Conformance Monitor. NOT Tier 4. Framework-coupled, no separable spec files, no versioning, no project scope. Does not address phase sequencing at the methodology layer. See Finding 11.

**Q3: How confident is the project-scope gap claim, and what would falsify it?**
Why it matters: AC3 is now at 0.75 (confirmed gap within investigated sample) rather than 0.20 (blocked). But "within investigated sample" is a meaningful epistemic hedge. The gap claim rests on approximately 8 deeply investigated systems plus reference-level coverage of several more. SK Process Framework (Q2 2026) is the most plausible source of gap-filling prior art — it is explicitly described as deterministic workflow + compliance audit trails.
What would answer it: SK Process Framework ships in Q2 2026 — read it when available. Additionally: search gray literature (practitioner blogs, conference workshop papers, industry whitepapers on agent governance) for project-scope behavioral specification systems not captured in arXiv. The gap would be falsified by any system that provides: (a) separable, versioned behavioral specification files, (b) project-scope enforcement across contributors and sessions, (c) a methodology layer distinct from the execution engine.

**Q4: What are the design implications of the ABC ContractSpec soft/hard invariant distinction for Organon's gate architecture?**
Why it matters: ABC's distinction between I_hard (must never be violated) and I_soft (should not be violated, with recovery) is more nuanced than Organon's current binary gate pass/fail model. The GaaS Trust Factor is a similar graduated enforcement concept. If graduated enforcement is demonstrably more effective, Organon's gate model should evolve.
What would answer it: Assess whether Organon's gate architecture already supports soft/advisory constraints vs. hard/blocking constraints. If not, this is a design gap to address in the 0.6.0 roadmap.

**Q5: What is llguidance's constraint expression capability relative to Outlines?**
Why it matters: llguidance is credited by OpenAI as foundational to their structured outputs implementation. If it has a fuller constraint expression capability than Outlines, it changes the characterization of generation-time enforcement Tier 1.
What would answer it: Read the llguidance repository and documentation. Compare constraint expressiveness to Outlines. Assess whether llguidance can express any semantic constraints that OpenAI's Structured Outputs cannot.

**Q6: Do A2A's REJECTED and AUTH_REQUIRED states gate execution in ways programmable against methodology rules?**
Why it matters: If these states can be triggered by methodology constraint violations — not just authentication failures — they become an enforcement surface that changes the A2A assessment from "purely observational" to "partially programmable."
What would answer it: Read the A2A v0.2.5 spec sections on REJECTED and AUTH_REQUIRED in detail. Check whether the spec defines any hook for application-layer logic to trigger these states.

**Q7: What has SK's `FunctionChoiceBehavior` and `KernelPlugin` abstraction actually achieved in terms of structured methodology guidance?**
Why it matters: ADR 0070 is "proposed" and incomplete. These existing SK abstractions may partially compensate for the missing structural separation identified in ADR 0070.
What would answer it: Read SK's current documentation on `FunctionChoiceBehavior` and `KernelPlugin`. Assess whether they provide any ethos/protocol separation in practice.

**Q8: What is the Anthropic structured outputs unsupported constraint surface, and does it differ from OpenAI's?**
Why it matters: Both providers shipped structured outputs GA November 2025. If their supported constraint surfaces differ, the generation-time enforcement tier is provider-specific and Organon's gate architecture may need provider-specific handling.
What would answer it: Read the Anthropic structured outputs documentation. Compare supported vs. unsupported constraints side-by-side with OpenAI's list.

---

## Critic's Unresolved Challenges

**RESOLVED — ABC and MI9 investigated; AC3 now answerable.**
Agent Behavioral Contracts / AgentAssert (arXiv 2602.22302) and MI9 Agent Intelligence Protocol (arXiv 2508.03858) were fully read and characterized in Session 3. ABC is Tier 4a (session-scope, low evidence quality). MI9 is Tier 3b (not Tier 4). The project-scope gap is confirmed within the investigated sample. AC3 moves from blocked (0.20) to confirmed-with-moderate-confidence (0.75). See Findings 10 and 11.

**RESOLVED — Tier 4 taxonomy split: session-scope vs. project-scope are now categorically separated.**
Tier 4 is split into 4a (session-scope behavioral specification — ABC) and 4b (project-scope behavioral specification — UNOCCUPIED). The taxonomy no longer implies the project-scope gap is filled. The document correctly represents ABC as partial prior art at session-scope only.

**RESOLVED — Post-generation enforcement landscape now complete for the investigated sample.**
Tier 3 is split into 3a (Output Firewall — GaaS, DSPy Assert) and 3b (Runtime Conformance Monitor — MI9). The taxonomy is structurally complete. MI9 is correctly placed in Tier 3b with the evidence quality caveat on its 99.81% detection rate.

**RESOLVED — Novelty confidence hedge updated.**
The prior "ABC and MI9 uninvestigated" hedge is replaced with: ABC = partial prior art at session-scope (low evidence quality); MI9 = Tier 3b (not Tier 4); project-scope gap confirmed within investigated sample; moderate confidence (gray literature may exist).

**SIGNIFICANT (NEW) — ABC evidence quality LOW; all citations must carry explicit caveats.**
ABC (arXiv 2602.22302) is single-author (Varun Pratap Bhardwaj), carries no institutional affiliation, is not peer-reviewed, and AgentAssert is not publicly available (patent pending). The evaluation uses a self-designed benchmark — evaluation circularity is present. Any citation of ABC in downstream documents must note these caveats. Do NOT cite ABC as established prior art; cite it as "a proposed session-scope behavioral contract system with low evidence quality."

**SIGNIFICANT (NEW) — MI9 99.81% detection rate must carry explicit weak-evidence caveat.**
The 99.81% detection rate is generated from LLM-judged synthetic traces only — no ground truth, closed-loop evaluation (LLM grades LLM). This statistic must carry "weak evidence" qualification wherever it appears. The FSM architecture itself is independently verifiable from the paper, but the empirical performance claims are not trustworthy without external evaluation.

**SIGNIFICANT (CARRIED) — llguidance not investigated.**
llguidance (Microsoft, open-sourced) was identified by the Critic as foundational to OpenAI's structured outputs. Its constraint expression capability relative to Outlines is unknown. The Tier 1 (structural / generation-time) characterization may be incomplete. Carried forward to Session 4.

**SIGNIFICANT (CARRIED) — Safety refusal framing corrected but Anthropic comparison incomplete.**
The initial characterization of safety refusal as an "architectural weakness" was corrected in Session 2. The supported constraint surface was not compared side-by-side between OpenAI and Anthropic. Organon's gate architecture may need provider-specific handling if the surfaces differ. Carried forward.

**DEFERRED (CARRIED) — A2A REJECTED and AUTH_REQUIRED states may not be purely observational.**
Characterization as "observational" may be premature. Whether these states can be triggered by application-layer methodology constraint violations was not assessed. Carried forward.

**DEFERRED (CARRIED) — SK ADR 0070 is proposed, and most relevant SK components were excluded from scope.**
`FunctionChoiceBehavior` and `KernelPlugin` may partially compensate. SK Process Framework (Q2 2026) could materially change the SK picture and is the most plausible source of project-scope competing prior art. Carried forward.

---

## Session 4 Scope

Session 3 resolved the two blocking AC3 gaps (ABC and MI9). The remaining open questions are lower-urgency. Session 4 is focused on closing the taxonomy completeness gap (Tier 1) and the most plausible remaining source of competing prior art (SK Process Framework, when available).

**Priority 1 (AC1 — Tier 1 completeness): Investigate llguidance (Microsoft, open-sourced).**
Read the llguidance repository and documentation. Compare constraint expression capability to Outlines. Determine whether it can express any semantic constraints beyond what OpenAI's Structured Outputs exposes. Assess whether it changes the Tier 1 (structural / generation-time) characterization. This has been carried forward from Sessions 2 and 3 without being addressed.

**Priority 2 (AC3 — most plausible competing prior art): Monitor SK Process Framework (Q2 2026).**
SK Process Framework is explicitly described as deterministic workflow + compliance audit trails — the closest industry description of a project-scope enforcement layer. If it ships in Q2 2026, it is the highest-priority work for falsifying the project-scope gap claim. Read it immediately upon availability. Assess: (a) Are compliance artifacts separable from the SDK? (b) Is there a phase/protocol concept? (c) Does it support versioning across contributors? (d) Does it constitute prior art for Tier 4b?

**Priority 3 (AC2 — completeness): Read Anthropic Structured Outputs documentation.**
Compare unsupported constraint surface side-by-side with OpenAI. Assess whether provider-specific handling is needed in Organon's gate architecture. Low urgency — unlikely to change core findings.

**Priority 4 (AC1 — completeness): Assess A2A REJECTED and AUTH_REQUIRED states.**
Determine whether these states can be triggered by application-layer methodology constraint violations. This is a minor clarification to the A2A "observational" characterization. Low urgency.

**Priority 5 (AC4 — gate architecture design): Assess soft/hard invariant distinction implications.**
Evaluate whether Organon's gate architecture should adopt a graduated enforcement model (soft/advisory vs. hard/blocking) analogous to ABC's I_soft/I_hard distinction and GaaS's Trust Factor. This is an internal design question, not external research. Can be addressed in roadmap documents directly.

Target delta after Session 4: **0.85** (llguidance completes Tier 1; SK Process Framework assessment either closes or precisely scopes the project-scope prior art question; Anthropic constraint surface comparison closes Q8).

---

## Sources Consulted

Sources read directly (Sessions 1–3):
- MCP specification 2025-11-25 — modelcontextprotocol.io (Session 2; confirmed via Area 5 research)
- GaaS (Governance as a Service) — arXiv 2508.18765 (Session 2)
- LangGraph documentation — python.langchain.com/docs/langgraph (Session 1)
- DSPy documentation and source — dspy.ai / github.com/stanfordnlp/dspy (Session 1)
- SK ADR 0070 — microsoft/semantic-kernel/docs/decisions/0070 (Session 1)
- A2A spec v0.2.5 — google.github.io/A2A (Session 1)
- OpenAI Structured Outputs documentation — platform.openai.com (Session 1)
- ABC (Agent Behavioral Contracts) — arXiv 2602.22302 — abstract and body confirmed (Session 3)
- MI9 (Multi-level Intelligent Governance) — arXiv 2508.03858 (Session 3)
- Agent Contracts Resource-Bounded — arXiv 2601.08815 (Session 3)

Sources accessed via secondary sources or partially read (Sessions 1–3):
- PCAS — arXiv 2602.16708 — findings shared from Area 5 Session 3 research
- Anthropic structured outputs — GA Nov 2025, documentation read partially (Session 1)
- SK Process Framework — roadmap description read; implementation not available (Q2 2026)
- IaC arc (Terraform, CDKTF, Pulumi) — public record (Session 2, via Area 5)

Sources not investigated (carried to Session 4):
- llguidance — Microsoft open-source library underlying OpenAI structured outputs
- OpenAI Agents SDK lifecycle hooks — platform.openai.com/docs/agents
- MCP Nov 2025 OAuth scope names — enforcement relevance assessment pending
- A2A REJECTED/AUTH_REQUIRED states — enforcement semantics not assessed
- SK FunctionChoiceBehavior / KernelPlugin abstractions — not yet assessed
