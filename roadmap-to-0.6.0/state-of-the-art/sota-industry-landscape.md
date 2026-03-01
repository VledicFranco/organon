# State of the Art: Industry Landscape

> Research date: 2026-03-01
> Session 2 of estimated 3–4
> Informs: all roadmap documents (especially mcp-query-api.md)
> Goal-reaching delta: 0.41 / 1.0

---

## Summary

**Session 1 progress preserved.** MCP, A2A, and Semantic Kernel findings stand. The structural architecture conclusions (MCP as transport, SEP-1686 gate-pausing hook, A2A observational states, SK ADR 0070 as problem statement) are unchanged.

**Session 2 resolved and partially resolved.** OpenAI Structured Outputs was deeply investigated: token-level enforcement via CFG is real and mature for structural/syntactic constraints; semantic/behavioral enforcement does not exist at this tier. GaaS (arXiv 2508.18765) was investigated: it is a post-generation behavioral firewall with a novel Trust Factor mechanism, not a methodology layer. LangGraph StateGraph enforcement model was characterized: structural state validation and interrupt-gated routing exist; no behavioral specification language. DSPy was correctly characterized: a partial specification layer (Signatures) plus a retry enforcement mechanism (Assert); the closest examined analog to a methodology layer, but not one.

**Session 2 opened new blocking gaps.** Two works were entirely absent from Session 2: Agent Behavioral Contracts / AgentAssert (arXiv 2602.22302, Feb 2026) — Design-by-Contract primitives with runtime enforcement and empirical validation across 200 scenarios — and MI9 Agent Intelligence Protocol (arXiv 2508.03858) — FSM-based conformance engine for temporal behavioral patterns. These are BLOCKING for AC3 (has any framework achieved behavioral specification at Organon's level?) and partially blocking for AC4. The post-generation enforcement landscape is materially incomplete without them. Additionally, llguidance (Microsoft, open-sourced) was missed as the foundational library underlying OpenAI's structured outputs implementation.

**AC status after Session 2:**
- AC1 (enforcement taxonomy): Structural tier characterized (OpenAI CFG, LangGraph Pydantic). Post-generation tier partially characterized (GaaS firewall, DSPy retry). Behavioral specification tier unknown — ABC and MI9 uninvestigated. Score: 0.40/1.0
- AC2 (methodology layers): DSPy Signatures are the closest examined analog. No other framework has a methodology layer. ABC and MI9 could change this answer. Score: 0.35/1.0
- AC3 (has any framework achieved behavioral specification?): Cannot answer — ABC and MI9 uninvestigated. Score: 0.20/1.0 (blocked)
- AC4 (what gaps exist): Structural-vs-behavioral gap documented. Post-generation enforcement gap documented but landscape incomplete. Score: 0.55/1.0
- Overall: 0.41/1.0 (Architect re-assessment; self-assessment was 0.48)

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

**Finding 4: No examined framework exposes a methodology layer — but the sample remains insufficient for a universal claim.**
- **Finding:** Of the systems deeply investigated (MCP, A2A, SK YAML, LangGraph, DSPy, GaaS), none exposes a methodology layer — a structured, enforceable, versioned representation of behavioral constraints separable from the execution engine. DSPy Signatures are the closest analog examined: a declared, discoverable specification layer at the class level. However, this negative conclusion is still drawn from an incomplete sample. Agent Behavioral Contracts / AgentAssert (arXiv 2602.22302) and MI9 Agent Intelligence Protocol (arXiv 2508.03858) were not investigated in Session 2.
- **Evidence:** MCP spec, A2A v0.2.5, SK ADR 0070 (read directly). LangGraph, DSPy, GaaS (deep investigation Session 2). ABC and MI9 (not read — BLOCKING for AC3).
- **Implication for Organon:** The "no examined framework has a methodology layer" conclusion holds for the investigated sample. The universal negative remains epistemically unjustified until ABC and MI9 are read. All downstream claims must be scoped to "no examined framework."

**Finding 5: SEP-1686's `input_required` state is a concrete, usable integration point for long-running gate checks.**
- **Finding:** SEP-1686 adds an `input_required` state to MCP's async Task primitive. When a tool call reaches a gate condition, the tool call can pause with `input_required`, allowing the Organon routing layer to run its gate evaluation and resume or block the call. This is an application-layer convention, not protocol enforcement, but the mechanism is real, available now (merged Nov 2025), and matches Organon's gate architecture.
- **Evidence:** SEP-1686 / PR #1732, read directly, merged Nov 2025. Established finding.
- **Implication for Organon:** The mcp-query-api.md's `organon_verify_guided` tool should be designed to exploit `input_required` for gate pausing. This is the most direct integration point between MCP's current capabilities and Organon's enforcement layer. It requires no waiting for protocol evolution.

**Finding 6 (Session 2): OpenAI Structured Outputs — token-level structural enforcement is mature; semantic/behavioral enforcement does not exist at this tier.**
- **Finding:** OpenAI Structured Outputs enforces output shape via a context-free grammar (CFG) compiled from JSON Schema, applied at the token-sampling level. With `strict=true`, this applies to BOTH `response_format` and tool definitions. Enforced: required fields, types (string/number/boolean/array/object/null/enum), anyOf. NOT enforced: minLength/maxLength, pattern (regex), minimum/maximum, multipleOf, patternProperties, uniqueItems, recursive schemas (simple recursion only). Safety refusal overrides schema adherence — a `refusal` field is returned instead of a schema-valid response; this is a documented design choice with a programmatic detection path, not an architectural weakness. The open-source analog is Outlines (token-level constrained decoding); llguidance (Microsoft, open-sourced) was identified by the Critic as the foundational library credited by OpenAI, and was not investigated. Anthropic shipped equivalent capability in November 2025. Unsupported constraint surfaces were not compared side-by-side between OpenAI and Anthropic.
- **Evidence:** OpenAI Structured Outputs documentation (deep investigation, Session 2). llguidance: not read — Critic-flagged gap. Safety refusal: documented design choice.
- **Implication for Organon:** Token-level CFG enforcement covers structural/syntactic schema compliance (required fields, types). It cannot enforce semantic constraints: value ranges, pattern matching, cross-field invariants, or behavioral protocols. Organon's gate architecture validates post-generation; generation-time enforcement is a complementary, not replacement, layer for the subset of structural constraints expressible in JSON Schema. The gate architecture design does not need to change, but can leverage structured outputs for a subset of output validation at generation time.

**Finding 7 (Session 2): LangGraph StateGraph — structural state validation and interrupt-gated routing exist; no behavioral specification language.**
- **Finding:** LangGraph uses Pydantic-typed StateGraph schemas — providing compile-time structural validation and runtime Pydantic exceptions on invalid state updates. Conditional edges are routing dispatch (selection of the next node), not rejection of invalid state. Interrupts pause execution and wait for resume input — when the resume input communicates rejection, this is a behavioral constraint enforcement mechanism at the application layer. The plan-and-execute pattern with scoped toolsets provides a form of pre-scoped capability restriction (closest analog to Organon's phase gating). There is no behavioral specification language native to LangGraph — no declared constraint artifact, no versioned behavioral spec, no phase concept. LangGraph is infrastructure Organon could run on top of.
- **Evidence:** LangGraph documentation and StateGraph model (deep investigation, Session 2).
- **Implication for Organon:** LangGraph's Pydantic-backed state validation and interrupt-gated routing are real primitives. They constrain state shape and can gate execution — but only through application-layer code, not through a specification artifact. Organon's methodology layer does not compete with LangGraph; it is a layer above it that provides the behavioral specification LangGraph lacks.

**Finding 8 (Session 2): DSPy — partial specification layer (Signatures) plus retry enforcement (Assert); the closest examined analog to a methodology layer, but not one.**
- **Finding:** DSPy has two distinct mechanisms that were incorrectly collapsed in the initial finding. DSPy Signatures are class-level Python definitions with field names, type annotations, and `desc` constraints — declared, discoverable, and readable without tracing the `forward()` method. This is a partial specification layer. DSPy Assert predicates are inline Python code checked post-generation, triggering a retry-with-backtracking loop (retries with failure message in context up to R times, then halts) — these are implementation-coupled, not discoverable without reading source, and correctly characterized as a retry mechanism. The DSPy optimizer (formerly "teleprompter") compiles Signatures plus training examples into optimized prompts — specification-driven prompt generation, not text injection. DSPy Suggest is the advisory variant of Assert. The system as a whole is not a methodology layer: constraints are embedded in code, not declared as versioned artifacts, and there is no phase, protocol, or ethos concept. But Signatures are the closest thing to a methodology-adjacent specification layer in any examined framework.
- **Evidence:** DSPy documentation and source (deep investigation, Session 2). Critic correction on Signatures vs. Assert conflation.
- **Implication for Organon:** DSPy Signatures demonstrate that a declared specification layer for LLM task interfaces is feasible within a framework. The key gap relative to Organon: Signatures are Python class definitions (implementation-coupled, not separable, not YAML-first, not versioned as standalone artifacts), and there is no ethos/philosophy/protocol separation. Organon's three-layer artifact system is structurally distinct from what DSPy achieves.

**Finding 9 (Session 2): GaaS — post-generation behavioral firewall with novel Trust Factor; post-generation enforcement landscape is incomplete pending ABC and MI9.**
- **Finding:** GaaS (arXiv 2508.18765) operates POST-GENERATION, PRE-EXTERNALIZATION: it intercepts agent outputs before they affect the environment. Policies are declared before session as JSON artifacts. Rules use regex/boolean pattern matching on output strings. The Trust Factor is a novel mechanism: per-agent compliance scoring with severity-weighted penalties, persistent across the session — an adaptive enforcement model with a temporal dimension. GaaS cannot enforce phase sequencing, gate invariants, or behavioral protocols. It is a behavioral firewall, not a methodology layer. However, the post-generation enforcement landscape is materially incomplete: Agent Behavioral Contracts / AgentAssert (arXiv 2602.22302, Feb 2026) and MI9 Agent Intelligence Protocol (arXiv 2508.03858) were not investigated and may substantially change the characterization of what post-generation enforcement can achieve.
- **Evidence:** arXiv 2508.18765, read directly. ABC (arXiv 2602.22302) and MI9 (arXiv 2508.03858): not read — Critic-flagged blocking gap.
- **Implication for Organon:** GaaS's Trust Factor is worth monitoring: session-persistent compliance history is a form of temporal enforcement state that Organon's gate architecture does not currently include. GaaS cannot replace Organon's methodology layer (no phase concept, no behavioral protocol, no versioned artifact) but could be a complementary output-filtering layer. The full picture of post-generation enforcement cannot be drawn until ABC and MI9 are read.

---

## Enforcement Mechanism Taxonomy (AC1 — Partial, Session 2)

A three-tier taxonomy emerges from Sessions 1–2. The behavioral specification tier remains uncharacterized pending ABC and MI9.

**Tier 1: Structural / Generation-Time**
Enforcement at the token-sampling level. Constrains the shape of generated output before it is produced.
- Mechanism: Context-free grammar (CFG) compiled from JSON Schema; applied during token sampling.
- Examples: OpenAI Structured Outputs (strict=true), llguidance (Microsoft, foundational library — not fully investigated), Outlines (open-source).
- What it can enforce: required fields, types, enum values, anyOf.
- What it cannot enforce: value ranges, regex patterns, cross-field invariants, semantic constraints, behavioral protocols.
- Organon relevance: Applicable to structural schema compliance for LLM outputs at generation time. Complementary to, not a replacement for, post-generation gate validation.

**Tier 2: Structural / State-Validation (Framework Runtime)**
Enforcement at framework runtime against declared state schemas. Constrains state shape during execution.
- Mechanism: Pydantic-typed state schemas; compile-time validation + runtime exceptions on invalid updates.
- Examples: LangGraph StateGraph, DSPy Signatures (specification layer; enforcement is weaker — retry, not hard rejection).
- What it can enforce: state field types, required state fields, node routing (via conditional edges).
- What it cannot enforce: behavioral protocols, phase sequencing, semantic invariants, cross-session constraints.
- Organon relevance: LangGraph's Pydantic validation is infrastructure Organon's state machine could leverage. DSPy Signatures are the closest partial-methodology-layer analog examined.

**Tier 3: Post-Generation / Behavioral Firewall**
Enforcement after generation, before externalization. Intercepts and filters outputs against declared policies.
- Mechanism: Regex/boolean pattern matching on output strings; policy artifacts declared pre-session.
- Examples: GaaS (arXiv 2508.18765) with Trust Factor; DSPy Assert (retry-with-backtracking); DSPy Suggest (advisory).
- What it can enforce: output string patterns, presence/absence of content, severity-weighted compliance scoring.
- What it cannot enforce: phase sequencing, gate invariants, behavioral protocols, cross-phase state.
- Organon relevance: Complementary filtering layer. GaaS's Trust Factor (session-persistent compliance history) is a temporal enforcement concept absent from Organon's current gate architecture.

**Tier 4: Behavioral Specification (Unknown — Blocked)**
Enforcement via declared behavioral specifications: Design-by-Contract primitives, FSM-based conformance engines, temporal behavioral patterns.
- Candidates: Agent Behavioral Contracts / AgentAssert (arXiv 2602.22302); MI9 Agent Intelligence Protocol (arXiv 2508.03858).
- Status: Not investigated. Cannot characterize this tier without reading these works.
- Organon relevance: This is the tier Organon operates in. Whether prior art exists here — and what it achieves — is AC3 and is currently blocked.

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
  Post-generation, pre-externalization behavioral firewall. JSON policy artifacts declared pre-session; regex/boolean pattern matching on output strings. Novel Trust Factor mechanism: per-agent compliance scoring with severity-weighted penalties, session-persistent. Cannot enforce phase sequencing or behavioral protocols. Post-generation enforcement landscape incomplete without ABC and MI9. (Deep investigation, Session 2.)
  Tags: #governance #post-generation #firewall #trust-factor #behavioral

### Constrained Decoding Libraries

- **Outlines** (open-source) — https://github.com/dottxt-ai/outlines
  Token-level constrained decoding library. CFG compiled from JSON Schema or regex applied during token sampling. Open-source analog to OpenAI's Structured Outputs. Investigated at reference level.
  Tags: #constrained-decoding #structured-outputs #open-source

- **llguidance** (Microsoft, open-sourced) — https://github.com/microsoft/llguidance
  Foundational constrained decoding library credited by OpenAI as underlying their structured outputs implementation. May have fuller constraint expression capability than Outlines. NOT investigated in Session 2 — Critic-flagged gap. Investigate in Session 3.
  Tags: #constrained-decoding #microsoft #foundational #uninvestigated

### Uninvestigated — Blocking for AC3

- **Agent Behavioral Contracts / AgentAssert** (Feb 2026) — arXiv 2602.22302 — https://arxiv.org/abs/2602.22302
  BLOCKING for AC3. Design-by-Contract primitives (Preconditions, Invariants, Goals, Requirements); runtime enforcement; ~3,000 line Python implementation; empirical validation across 200 scenarios and 7 models; Drift Bounds Theorem. This work directly addresses whether any framework has achieved behavioral specification at the level Organon proposes. Not read. Highest priority for Session 3.
  Tags: #behavioral-contracts #design-by-contract #runtime-enforcement #unread #blocking-ac3

- **MI9 Agent Intelligence Protocol** (Aug 2025) — arXiv 2508.03858 — https://arxiv.org/abs/2508.03858
  BLOCKING for AC3 and AC4. FSM-based conformance engines for temporal behavioral patterns; Agency-Risk Index; continuous authorization monitoring. Directly addresses phase sequencing (the gap GaaS cannot fill). Not read. Second priority for Session 3.
  Tags: #fsm #conformance #temporal #phase-sequencing #unread #blocking-ac3

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

**GaaS (arXiv 2508.18765) — investigated Session 2**
Convergence: separable governance layer concept; session-persistent Trust Factor as temporal enforcement state.
Divergence: behavioral firewall operating on output strings, not a declarative methodology artifact system. No phase concept, no protocol layer, no versioned specification.
What to learn: Trust Factor's adaptive, session-persistent compliance scoring is a temporal enforcement dimension Organon's gate architecture does not currently model. Worth assessing whether Organon's gate history mechanism should incorporate a compliance-score concept.

**DSPy (Stanford NLP) — investigated Session 2**
Convergence: Signatures provide a declared, discoverable specification layer for LLM task interfaces. Optimizer compiles specifications into prompts — specification-driven generation.
Divergence: Signatures are Python class definitions, not standalone versioned artifacts. No ethos/philosophy/protocol separation. Assert predicates are implementation-coupled. The system is not separable from the Python execution environment.
What to learn: Signatures demonstrate that declared specifications for LLM interfaces are feasible and practically useful. The gap is artifact separability, versioning, and the three-layer structure — not the concept of specification.

---

## Industry Directions

**Anthropic**
MCP originator. Governance transferred to AAIF/Linux Foundation — signals intent to make MCP a neutral standard, not a proprietary moat. Structured Outputs shipped GA November 2025 (equivalent capability to OpenAI). Extended thinking / interleaved thinking (Claude 4) implements metacognition internally. No publicly known external methodology layer for agents. The Model Spec is Anthropic's own ETHOS analog for Claude's values — it operates at the model level, not the agent workflow level.

**Google**
A2A protocol is Google's inter-agent communication standard. Positions as horizontal complement to MCP's vertical. Enforcement is self-declared — Google's spec is deliberately non-prescriptive about methodology. AlphaProof / AlphaGeometry (formal verification + ML) is the most relevant Google direction for Organon's formal methods work, but is not directly relevant to methodology enforcement. Gemini tool use / function calling: schema decisions not deeply investigated.

**Microsoft**
AutoGen + Semantic Kernel merged into Microsoft Agent Framework (Oct 2025 — industry claim, unverified in detail). SK ADR 0070 is the best available signal on their declarative agent direction. The Process Framework (Q2 2026) would be the most relevant Microsoft development for Organon if it ships. llguidance (open-sourced) is the foundational constrained decoding library underlying OpenAI's structured outputs — Microsoft's most relevant technical contribution to enforcement infrastructure, not investigated in Session 2. TypeSpec (API description language) is relevant to typed schema for agent interfaces — not investigated.

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

**The three-primitive MCP model as negative constraint.** MCP's absence of a workflow layer is not a design failure — it reflects a deliberate scope decision. Organon should not try to embed methodology enforcement into the MCP protocol layer. The clean architectural lesson: methodology goes above the transport, not in it.

**SK ADR 0070 as the problem statement.** The SK YAML spec's conflation of identity, constraints, and procedures in a single `instructions` field is a documented design gap that Organon's ETHOS/PHILOSOPHY/PROTOCOL separation directly addresses. The mcp-query-api.md can cite ADR 0070 when explaining why Organon's three-layer artifact separation is necessary.

---

## What Appears Novel to Organon

**A structured, versioned methodology layer as a first-class system artifact.** No examined framework (MCP, A2A, SK YAML, LangGraph, DSPy, GaaS) treats methodology — behavioral constraints, procedural rules, invariants — as a structured, queryable, versioned artifact separate from the execution engine. The closest industry direction is SK's planned Process Framework (Q2 2026, not shipped), which proposes compliance audit trails within a monolithic SDK. DSPy Signatures are a partial specification layer but are implementation-coupled Python class definitions, not standalone versioned artifacts.

**Confidence level:** Low-to-moderate. The sample is broader than Session 1 (6 systems investigated vs. 3). However, Agent Behavioral Contracts / AgentAssert (arXiv 2602.22302) and MI9 (arXiv 2508.03858) are uninvestigated and directly relevant. The universal negative claim is epistemically unjustified until these are read. Do not assert novelty in downstream documents until AC3 is resolved.

**The ETHOS/PHILOSOPHY/PROTOCOL three-layer distinction.** No examined framework separates what constrains agent behavior (ethos-layer) from what explains the reasoning (philosophy-layer) from what prescribes procedure (protocol-layer). SK ADR 0070 puts all three in `instructions`. A2A's AgentCard has no methodology fields. MCP has no agent definition layer. LangGraph has no specification language. GaaS has policy artifacts but no ethos/philosophy separation. DSPy has Signatures (closest analog) but no layered structure.

**Confidence level:** Low-to-moderate. Broader sample validates the claim within the investigated set. Blocked by ABC and MI9 for a universal claim.

---

## Open Questions

**Q1: Do Agent Behavioral Contracts / AgentAssert (arXiv 2602.22302) constitute prior art for Organon's behavioral specification approach?**
Why it matters: ABC implements Design-by-Contract primitives (Preconditions, Invariants, Goals, Requirements) with runtime enforcement, ~3,000 lines of Python, and empirical validation across 200 scenarios and 7 models. If ABC achieves behavioral specification at the level Organon proposes, AC3 is answered and novelty claims require revision. This is the highest-priority open question.
What would answer it: Read arXiv 2602.22302. Assess: (a) are constraints declared as separable artifacts or implementation-coupled code? (b) Is there a phase/protocol concept? (c) What does the Drift Bounds Theorem guarantee? (d) How does it compare to Organon's three-layer structure?

**Q2: Does MI9's FSM-based conformance engine address phase sequencing in ways Organon's gate architecture should model?**
Why it matters: MI9 directly addresses temporal behavioral pattern enforcement — the phase sequencing gap that GaaS cannot fill. If MI9 has a working FSM-based conformance engine with continuous authorization monitoring, it is the most directly relevant enforcement mechanism for Organon's gate architecture.
What would answer it: Read arXiv 2508.03858. Assess: (a) FSM expressiveness — what temporal patterns can be declared? (b) Agency-Risk Index — what does it measure and how? (c) Is the conformance engine separable from the execution environment? (d) What does continuous authorization monitoring look like architecturally?

**Q3: What is llguidance's constraint expression capability relative to Outlines?**
Why it matters: llguidance is credited by OpenAI as foundational to their structured outputs implementation. If it has a fuller constraint expression capability than Outlines, it changes the characterization of generation-time enforcement Tier 1.
What would answer it: Read the llguidance repository and documentation. Compare constraint expressiveness to Outlines. Assess whether llguidance can express any semantic constraints that OpenAI's Structured Outputs cannot.

**Q4: Do A2A's REJECTED and AUTH_REQUIRED states gate execution in ways programmable against methodology rules?**
Why it matters: If these states can be triggered by methodology constraint violations — not just authentication failures — they become an enforcement surface that changes the A2A assessment from "purely observational" to "partially programmable."
What would answer it: Read the A2A v0.2.5 spec sections on REJECTED and AUTH_REQUIRED in detail. Check whether the spec defines any hook for application-layer logic to trigger these states.

**Q5: What has SK's `FunctionChoiceBehavior` and `KernelPlugin` abstraction actually achieved in terms of structured methodology guidance?**
Why it matters: ADR 0070 is "proposed" and incomplete. These existing SK abstractions may partially compensate for the missing structural separation identified in ADR 0070.
What would answer it: Read SK's current documentation on `FunctionChoiceBehavior` and `KernelPlugin`. Assess whether they provide any ethos/protocol separation in practice.

**Q6: What is the Anthropic structured outputs unsupported constraint surface, and does it differ from OpenAI's?**
Why it matters: Both providers shipped structured outputs GA November 2025. If their supported constraint surfaces differ, the generation-time enforcement tier is provider-specific and Organon's gate architecture may need provider-specific handling.
What would answer it: Read the Anthropic structured outputs documentation. Compare supported vs. unsupported constraints side-by-side with OpenAI's list.

---

## Critic's Unresolved Challenges

**BLOCKING — ABC and MI9 not investigated; AC3 cannot be answered.**
Agent Behavioral Contracts / AgentAssert (arXiv 2602.22302) and MI9 Agent Intelligence Protocol (arXiv 2508.03858) were entirely absent from Session 2. These are the two works most directly relevant to AC3 (has any major framework achieved behavioral specification at the level Organon proposes?). Until these are read, the "no examined framework has a methodology layer" conclusion cannot be extended to a universal claim, and the novelty assessment for Organon's core contribution is epistemically incomplete.
Follow-up: Session 3, Priority 1 and Priority 2.

**BLOCKING — Post-generation enforcement landscape is materially incomplete.**
The characterization of Tier 3 (post-generation / behavioral firewall) rests entirely on GaaS. ABC and MI9 may demonstrate substantially more sophisticated post-generation enforcement — including phase sequencing (which GaaS cannot do). The current taxonomy's Tier 4 (behavioral specification) is a placeholder, not a finding.
Follow-up: Read ABC and MI9. Revise taxonomy after reading.

**SIGNIFICANT — llguidance not investigated despite Critic flag.**
llguidance (Microsoft, open-sourced) was identified by the Critic as foundational to OpenAI's structured outputs. Its constraint expression capability relative to Outlines is unknown. The Tier 1 (structural / generation-time) characterization may be incomplete.
Follow-up: Session 3, Priority 4. Read the llguidance repository.

**SIGNIFICANT — Safety refusal framing corrected but Anthropic comparison incomplete.**
The initial characterization of safety refusal as an "architectural weakness" was incorrect — it is a documented design choice with a programmatic detection path. This has been corrected. However, the supported constraint surface was not compared side-by-side between OpenAI and Anthropic. Organon's gate architecture may need provider-specific handling if the surfaces differ.
Follow-up: Read Anthropic structured outputs documentation. Compare constraint surfaces.

**DEFERRED — A2A REJECTED and AUTH_REQUIRED states may not be purely observational.**
Characterization as "observational" may be premature. Whether these states can be triggered by application-layer methodology constraint violations was not assessed. This challenge was carried forward from Session 1 and remains open.
Follow-up: Read A2A v0.2.5 spec sections on REJECTED and AUTH_REQUIRED.

**DEFERRED — SK ADR 0070 is proposed, and most relevant SK components were excluded from scope.**
`FunctionChoiceBehavior` and `KernelPlugin` may partially compensate. SK Process Framework (Q2 2026) could materially change the SK picture. Carried forward from Session 1.
Follow-up: Read SK current documentation on these abstractions when SK is next investigated.

---

## Session 3 Scope

**Priority 1 (BLOCKING — AC3): Read Agent Behavioral Contracts / AgentAssert (arXiv 2602.22302).**
This is the highest-priority unread source. Design-by-Contract primitives (P, I, G, R) with runtime enforcement; ~3,000 line Python implementation; 200 scenarios across 7 models; Drift Bounds Theorem. Assess: (a) are constraints declared as separable artifacts or implementation-coupled? (b) Is there a phase/protocol concept? (c) What does the Drift Bounds Theorem guarantee and what does it NOT guarantee? (d) Does this constitute prior art for Organon's behavioral specification approach? If yes, revise Key Finding 4, the novelty claims, and the enforcement taxonomy Tier 4.

**Priority 2 (BLOCKING — AC3, AC4): Read MI9 Agent Intelligence Protocol (arXiv 2508.03858).**
FSM-based conformance engines for temporal behavioral patterns; Agency-Risk Index; continuous authorization monitoring. Directly addresses phase sequencing (the gap GaaS cannot fill). Assess: (a) FSM expressiveness for temporal constraint declaration; (b) whether the conformance engine is separable from the execution environment; (c) how continuous authorization monitoring maps to Organon's gate architecture; (d) whether MI9's approach is prior art for Organon's phase sequencing gates.

**Priority 3 (AC1 — taxonomy completion): Read MCP November 2025 specification.**
MCP was donated to the Linux Foundation (Agentic AI Foundation); November 2025 version includes async Tasks and OAuth scope names; OpenAI, Anthropic, Block as co-founders. Assess whether the November 2025 spec version changes any findings from Session 1 on MCP primitives, and whether OAuth scope names provide any authorization-layer enforcement surface relevant to Organon's gate architecture.

**Priority 4 (AC1 — Tier 1 completion): Investigate llguidance (Microsoft, open-sourced).**
Read the llguidance repository and documentation. Compare constraint expression capability to Outlines. Determine whether it can express any semantic constraints beyond what OpenAI's Structured Outputs exposes. Assess whether it changes the Tier 1 (structural / generation-time) characterization.

Target delta after Session 3: **0.75** (ABC and MI9 resolve AC3, complete AC2, and either close or precisely scope AC4; llguidance and MCP November 2025 spec complete AC1).
