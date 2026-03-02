# State of the Art: Structured Agentic Methodology & Protocol Standards

> Research date: 2026-03-01
> Session 3 of estimated 3–4
> Informs: yaml-first-organons.md, rfc-as-structured-data.md, mcp-query-api.md
> Goal-reaching delta: 0.58 / 1.0

---

## Summary

Session 3 resolved the highest-priority blocking items (PCAS, ABC schema status, Agent Contracts Resource-Bounded) and materially advanced AC1 and AC2. Two ACs are now fully resolved; two remain open.

**AC1 (YAML-first behavioral specification prior art) — ADVANCED. Primary novelty claim now explicit.**
ABC (arXiv 2602.22302) is confirmed as YAML-based: ContractSpec IS a YAML DSL, stored as separable files loaded independently from agent code. The formal tuple is stronger than prior document implied: C = (P, I_hard, I_soft, G_hard, G_soft, R) — Preconditions, Hard Invariants, Soft Invariants, Hard Governance, Soft Governance, Recovery. However, ABC's evidence quality is LOW: single-author preprint, no institutional affiliation, evaluated against a self-designed benchmark, and AgentAssert is not publicly available (patent pending, no GitHub repo found after exhaustive search). The YAML-first format is confirmed as published approach, but the prior art landscape is not fully validated.

The PRIMARY novelty claim for Organon is now explicit: **ABC is session-scoped; Organon is project-scoped.** ABC governs ONE execution session/trace. Organon governs ongoing project methodology that persists across all sessions, all contributors, and all agents. This is a fundamentally different scope — not a minor implementation difference — and constitutes the primary basis for Organon's novelty claim. No reviewed work addresses project-scope behavioral methodology persistence.

**AC2 (forcing function patterns) — ADVANCED.**
PCAS (arXiv 2602.16708) was read this session. PCAS is a pre-execution reference monitor at the action-invocation layer: it enforces which specific tool calls are permitted given causal history, using a Datalog-derived language compiled to native Rust. Reported result: 48% → 93% compliance vs. system-prompt-only baseline. This is architectural enforcement (non-compliant actions literally cannot be taken), not probabilistic monitoring. However, PCAS is NOT a methodology layer: it has no phase concept, no project-scope persistence, and code has not yet been released. PCAS is a viable enforcement substrate that Organon's phase gates COULD be built on top of — it advances AC2 by demonstrating construction-time enforcement is architecturally achievable, but it does not directly solve AC2 at the methodology layer.

**AC3 (MCP behavioral constraints) — RESOLVED.** No change from Session 2. See Finding 5.

**AC4 (GaaS Trust Factor) — CHARACTERIZED.** No change from Session 2. See Finding 6.

**AC scores after Session 3:** AC1: 0.65 | AC2: 0.55 | AC3: 1.0 | AC4: 0.75

**Agent Contracts Resource-Bounded (arXiv 2601.08815) — DEFINITIVELY DISMISSED.** This paper covers resource governance only (token budgets, compute limits, API call quotas). It is NOT behavioral specification, NOT competing prior art for Organon's direction. Explicitly documented to prevent re-investigation.

---

## Key Findings

**Finding 1: ABC (Agent Behavioral Contracts) is the closest published prior art for runtime enforcement of YAML behavioral specifications — but evidence quality is LOW and scope is session-only.**
- **Finding:** ABC (arXiv 2602.22302, Feb 2026) proposes a ContractSpec DSL that is confirmed YAML-based. Contracts are stored as separable YAML files loaded independently from agent code. The formal tuple is C = (P, I_hard, I_soft, G_hard, G_soft, R): Preconditions (entry conditions for execution), Hard Invariants (must hold throughout — violation triggers escalation), Soft Invariants (monitored but recoverable — violation triggers recovery), Hard Governance (behavioral constraints — hard violation), Soft Governance (behavioral constraints — soft violation), and Recovery mechanisms (responses to violations). This hard/soft invariant distinction is meaningful: it provides two-tier enforcement with different consequences per tier. The system includes a probabilistic Drift Bounds Theorem: when enforcement rate γ > violation rate α, expected drift D* = α/γ. This is a probabilistic bound, NOT a formal correctness guarantee.
- **Scope (critical):** ABC is session-scoped. It governs ONE execution session/trace. Traces are bounded by session length T. ABC does not govern ongoing methodology across multiple sessions, contributors, or projects. This is the primary basis for Organon's novelty claim — Organon operates at project scope, not session scope.
- **Evidence quality: LOW.** Single author (Varun Pratap Bhardwaj). No institutional affiliation listed. Not peer-reviewed at publication time. Evaluation uses a benchmark created by the same author (circularity concern). AgentAssert (the enforcement system) is patent pending — GitHub user varun369 has no AgentAssert repository; no supplemental GitHub repo found after exhaustive search. The schema cannot be independently verified.
- **Evidence:** arXiv preprint 2602.22302 (Feb 2026). Early evidence — single preprint, not peer-reviewed. Low provenance quality.
- **IP status (confirmed):** AgentAssert is NOT publicly available. Patent pending. No GitHub repository found. Search exhausted (GitHub profile, Google Scholar supplemental, author name search). Schema and enforcement system cannot be independently verified as of research date.
- **Implication for Organon:** ABC is the closest published prior art but does NOT falsify Organon's novelty claim. The scope difference is fundamental: session-scope contracts vs. project-scope methodology. Organon's YAML-first format has published precedent (ABC), but Organon's project-scope persistence claim is uncontested in the reviewed literature. The full C = (P, I_hard, I_soft, G_hard, G_soft, R) tuple and hard/soft invariant distinction are worth incorporating into Organon's violation categorization design — this structure is the strongest design contribution from ABC even accounting for low evidence quality.

**Finding 2: Software constitutions (CSDD, arXiv 2602.02584) demonstrate that structured behavioral specifications reduce security violations — but enforcement is advisory, not runtime.**
- **Finding:** Constitutional Spec-Driven Development (CSDD) introduces CWE-indexed security constraints as a "constitution" injected into the prompt pipeline. Three-artifact hierarchy: spec.md / plan.md / tasks.md. Results: 73% reduction in security vulnerabilities, 4.3x improvement in compliance documentation coverage. RFC-2119 enforcement levels are used as severity classification only — they do not drive a runtime enforcement mechanism. Compliance tracking is a manual precursor (compliance traceability matrix mapping principle ID to CWE to file:line). Enforcement model: pre-generation advisory injection plus human review (reject-and-regenerate).
- **Evidence:** arXiv 2602.02584 (Jan 2026). Early evidence — single preprint. The 73% and 4.3x figures are from the paper's own evaluation; independent replication has not occurred.
- **Implication for Organon:** Two things are confirmed: (1) structured behavioral specifications do measurably affect LLM security output — the CSDD result is direct empirical support for the premise that explicit methodology reduces violations. (2) The CSDD three-artifact hierarchy (spec/plan/tasks) converges in labeling with Organon's three artifacts (ethos/protocol/workflow) but serves different purposes and has different enforcement mechanisms. Do not cite as structural convergence — the similarity is naming-level only. The inverse framing is useful: Organon is essentially "CSDD with runtime enforcement." Establishing this explicitly strengthens the incremental novelty claim.

**Finding 3: MI9 and GaaS are governance frameworks but neither is a declaration-first behavioral specification system.**
- **Finding:** MI9 (arXiv 2508.03858, Aug 2025) provides runtime governance via a six-component system including an FSM-based conformance engine and graduated containment (4 levels). GaaS (arXiv 2508.18765) provides governance as a service with JSON-encoded declarative rules. Both are observe-and-react systems: they monitor execution and respond to violations. Neither requires — or supports — upfront behavioral declaration in the sense that Organon's organon files declare methodology before any execution begins. MI9's ATS taxonomy (cognitive/action/coordination events) is genuinely useful vocabulary for categorizing agent behavior types.
- **Evidence:** MI9: arXiv 2508.03858 (Aug 2025), early evidence. SIGNIFICANT CAVEAT: MI9's 99.81% detection rate is produced by LLM-judged synthetic traces (LLM grades LLM in a closed loop). This is weak evidence quality and cannot be cited as real-world evidence. GaaS: arXiv 2508.18765 (Aug 2025) — investigated Session 2. See Finding 6 for full GaaS characterization.
- **Implication for Organon:** Organon's enforce-upfront model (behavioral constraints declared before execution begins, enforced via tooling) is architecturally distinct from MI9/GaaS's observe-then-react model. This is a potential novelty. GaaS's Trust Factor (see Finding 6) is a novel temporal mechanism worth tracking.

**Finding 4: Letta's .af file format serializes agent state including tool rules — but it is state-first, not specification-first.**
- **Finding:** Letta's .af (agent file) format serializes: system prompt, memory blocks, tool schemas, tool rules, model config, and message history. Tool rules (InitToolRule, TerminalToolRule, ToolRule) are runtime-enforced via structured outputs — they constrain which tools are available at which points in execution. Git versioning is used for state management. The enforcement model is option restriction (presenting a constrained tool choice set), not behavioral invariant enforcement. Enforcement degrades on models that do not support structured outputs.
- **Evidence:** Letta documentation and GitHub (read directly). Industry implementation, not peer-reviewed research. Enforcement degradation on non-structured-output models is a documented limitation.
- **Implication for Organon:** Letta demonstrates that typed tool rules with runtime enforcement is technically feasible and in production. The MCP protocol-guided routing proposal (mcp-query-api.md) can treat Letta's tool rule model as a precedent for "here is how you constrain available tools at the protocol level." The key design gap to avoid: Organon's methodology invariants are not tool-option restrictions — they are behavioral claims about what agents should and should not do. These are different enforcement targets.

**Finding 5: MCP specification (2025-11-25) has no behavioral constraints — ToolAnnotations are explicitly advisory and untrusted. AC3 RESOLVED.**
- **Finding:** MCP defines three structural schema types:
  - `inputSchema` (required JSON Schema): structural input validation only
  - `outputSchema` (optional, new in 2025-11-25): structural output validation only
  - `ToolAnnotations` (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`): ALL explicitly marked as "untrusted" for security decisions per the spec itself — these are advisory hints, not enforceable behavioral constraints
  - No behavioral constraints, no invocation ordering, no preconditions, no tool versioning in the spec
  - MCP SEP-1686 introduces async task tracking per tool call; the `input_required` state is a gate-pausing hook; however, there is no `workflowId` or `phaseId` — this is not native multi-step orchestration
- **Composability nuance (from Critic):** SEP-1686's `input_required` is a pause primitive that an external orchestrator (such as Organon) could compose into multi-step gate sequences. The task-orchestrator GitHub project demonstrates gating transitions built on top of MCP Tasks with composable notes. The distinction is critical: MCP provides no *native* behavioral methodology enforcement, but it provides *composable building blocks* that an external enforcer can orchestrate. "Zero behavioral methodology enforcement" would be an overstatement; the accurate characterization is "advisory coordination only, with composable primitives available for external orchestrators."
- **Evidence:** MCP specification 2025-11-25 (read directly). SEP-1686 (read). Authoritative source.
- **Implication for Organon:** The mcp-query-api.md proposal is additive, not conflicting. MCP explicitly does not provide a behavioral methodology layer. Organon's proposal builds on top of MCP's composable primitives (notably `input_required` from SEP-1686) to provide the gate sequencing and behavioral enforcement that MCP does not supply natively. The proposal should cite the ToolAnnotations untrusted-advisory characterization as the gap Organon fills.

**Finding 6: GaaS is a post-generation behavioral firewall with a novel Trust Factor mechanism — complementary to Organon, not a methodology layer. AC4 RESOLVED.**
- **Finding:** GaaS (arXiv 2508.18765) operates as a post-generation, pre-externalization enforcement layer: it intercepts LLM output after generation but before the output is acted upon. Key architectural properties:
  - Policies declared before the session as JSON artifacts (not inline instructions) — this is the "as a service" aspect
  - Rule format: regex/boolean pattern matching on output strings
  - **Trust Factor (novel):** per-agent compliance scoring with severity-weighted penalties. Compliance history is tracked across actions and used to modulate future enforcement intensity. This is a temporal, session-persistent behavioral mechanism not found in any Session 1 work.
  - Adaptive interventions: enforcement intensity adjusts based on accumulated trust score; policy update mechanism allows evolution during a session
  - Cannot enforce phase sequencing, gate invariants, or behavioral protocols — it operates on output content, not execution structure
- **Relationship to Organon:** GaaS and Organon are complementary, not competitive. GaaS enforces output content rules (what the agent says); Organon enforces methodology adherence (how the agent proceeds through phases and what gates it must pass). The Critic's challenge stands: "complementary" is an assertion, not a demonstration. The specific integration point would be: Organon's verification gates could consume the GaaS Trust Factor as a behavioral signal — when an agent's trust score falls below a threshold, Organon's gates could require additional verification or human escalation. This would make the complementary claim concrete.
- **Evidence:** arXiv 2508.18765 (Aug 2025) — read Session 2. Early evidence.
- **Implication for Organon:** Trust Factor is worth tracking as a session-persistent behavioral signal. The adaptive enforcement model (compliance history affects future enforcement) is a design pattern Organon does not currently have. Whether Organon's project-scope methodology governance should incorporate session-level trust scoring is an open design question.

**Finding 7: IaC arc documented — directionally correct correspondence to Organon, but current Organon maps to HCL stage, not TypeScript stage.**
- **Finding:** The IaC adoption arc was documented:
  - Snowflake Server problem (manual, undocumented, non-reproducible) → Puppet/Chef (imperative, corrects after drift) → Terraform HCL (declarative, describes desired state, drift detection via plan/apply) → CDKTF (deprecated Dec 2025) → Pulumi TypeScript (native language types, composition patterns)
  - Correspondence to agent methodology:
    - Configuration drift ↔ Behavioral drift (agent behavior departs from intended methodology)
    - Puppet/Chef ↔ LLM monitoring/RLHF (detects and corrects after the fact)
    - Terraform HCL ↔ System prompt instructions (declarative text, processed by the runtime, no compile-time enforcement)
    - CDKTF ↔ Guardrails AI/NeMo (post-hoc type checking, doesn't prevent generation)
    - Pulumi TypeScript ↔ Organon target state (behavioral types cause pre-execution errors; methodology violations are caught before the agent acts)
- **Critical Critic caveat:** The analogy overstates Pulumi TypeScript's compile-time guarantees. Pulumi's `Output<T>` wraps values resolved at deployment time, not compile time — ARN type correctness is NOT statically guaranteed unless using branded types manually. CDKTF was deprecated for product-market fit failure, not technical type system failure. More importantly: **current Organon (YAML + CLI verification) maps to Terraform HCL**, not Pulumi TypeScript. The analogy is correct as a *direction* Organon is heading, not as a description of current capabilities. The yaml-first-organons.md and rfc-as-structured-data.md documents must not present current Organon as having arrived at the Pulumi TypeScript stage.
- **Evidence:** IaC history research conducted Session 2. Well-documented public record.
- **Implication for Organon:** The IaC arc is valid framing for the long-term vision. The honest positioning: Organon is currently at the Terraform HCL stage (declarative YAML, CLI verification, drift detection) and is building toward the Pulumi TypeScript stage (behavioral types, pre-execution enforcement, composition patterns). The roadmap should describe this trajectory explicitly rather than implying current capability at the TypeScript stage.

**Finding 8: PCAS (arXiv 2602.16708) is a pre-execution reference monitor at the action-invocation layer — advances AC2 architecturally, but is NOT a methodology layer and code is unreleased.**
- **Finding:** PCAS (Policy Compiler for Agentic Systems) enforces behavioral policies at the action-invocation layer, not the methodology layer. Architectural properties:
  - **Language:** Policies written in a Datalog-derived language with stratified negation, compiled through Differential Datalog to a native Rust enforcement module
  - **Enforcement stage:** Pre-execution reference monitor. Enforcement module is interposed between the agent and the action execution layer — intercepting tool calls, API invocations, and cross-agent messages BEFORE execution. Non-compliant actions literally cannot be taken (architectural guarantee, not probabilistic monitoring)
  - **What it governs:** Individual tool calls, API invocations, cross-agent messages — action by action. PCAS has no first-class concept of phases or stages
  - **Sequencing:** Implicit only — "action B can only follow action A" expressed via causal dependency predicates. No explicit phase declaration or phase-gate semantics
  - **Empirical result:** 48% → 93% compliance vs. system-prompt-only enforcement baseline. Strongest published empirical result for construction-time enforcement
  - **"Policy-compliant by construction"** — this guarantee applies to Datalog-encoded action policies. It does NOT extend to project-scope behavioral methodology without establishing the same architecture at the methodology layer
- **Evidence quality:** arXiv 2602.16708 (2026). Code not yet released — paper footnote states "will be released soon." The 48%→93% compliance claim cannot be independently verified against code as of research date.
- **Implication for Organon (AC2):** PCAS advances AC2 materially: it demonstrates that pre-execution enforcement of behavioral constraints is architecturally achievable (action-layer architectural guarantee). The gap between action-layer enforcement (PCAS) and methodology-layer enforcement (Organon's phase gates) remains open. A plausible synthesis: Organon's phase gates COULD be built on top of PCAS by encoding phase state in the Datalog dependency graph — a phase gate becomes a causal predecessor predicate that all actions in the next phase depend on. This synthesis is speculative until PCAS code is released and the Datalog expressiveness is verified. **Do not import PCAS's "policy-compliant by construction" guarantee into claims about Organon without establishing the same pre-execution enforcement architecture at the methodology layer.**

**Finding 9: Agent Contracts Resource-Bounded (arXiv 2601.08815) covers resource governance only — not behavioral specification, not competing prior art.**
- **Finding:** This paper defines formal contracts for resource-bounded agents using mathematical tuple C = (I, O, S, R, T, Φ, Ψ). The contracts govern: token budgets, compute limits, API call quotas, and similar resource constraints. The contract format is programmatic (mathematical/code), NOT YAML file-based. Scope is per-task resource constraints. The paper's empirical claims (90% token reduction, 525x lower variance, zero conservation violations) pertain to resource efficiency, not behavioral methodology compliance.
- **Evidence:** arXiv 2601.08815 (Jan 2026). Early evidence — single preprint.
- **Implication for Organon:** This paper is NOT competing prior art for Organon's behavioral specification direction. It addresses a fundamentally different problem: resource governance vs. behavioral methodology. Explicitly documented as a negative result to prevent re-investigation in future sessions. The resource contract tuple (I, O, S, R, T, Φ, Ψ) may be useful as a reference for how formal contract structures are specified, but it does not overlap with Organon's domain.

---

## Related Work (Annotated)

### Runtime Behavioral Specification

- **Agent Behavioral Contracts (ABC)** (Feb 2026) — Varun Pratap Bhardwaj (single author, no institutional affiliation), arXiv 2602.22302 — https://arxiv.org/abs/2602.22302
  Proposes ContractSpec: a confirmed YAML-based DSL where contracts are defined as C = (P, I_hard, I_soft, G_hard, G_soft, R) — Preconditions, Hard Invariants, Soft Invariants, Hard Governance, Soft Governance, Recovery. Hard violations escalate; soft violations trigger recovery actions. Claims runtime enforcement with probabilistic Drift Bounds Theorem (γ > α → D* = α/γ in expectation — probabilistic bound, NOT formal correctness guarantee). Contracts stored as separable YAML files, loaded independently from agent code. Session-scoped: governs ONE execution session/trace. Does not address project-scope methodology persistence.
  **Evidence quality: LOW.** Single author, no institutional affiliation, not peer-reviewed, self-designed benchmark (circularity concern). AgentAssert NOT publicly available — patent pending, no GitHub repo found after exhaustive search. Schema cannot be independently verified.
  Closest published prior art for Organon's behavioral specification direction. Primary scope difference: session scope vs. project scope.
  Tags: #behavioral-contracts #YAML-spec #runtime-enforcement #prior-art #session-scope #low-evidence-quality #AgentAssert-unavailable

- **Agent Contracts Resource-Bounded** (Jan 2026) — (authors TBD, arXiv 2601.08815) — https://arxiv.org/abs/2601.08815
  Formal contracts for resource-bounded agents. Mathematical tuple C = (I, O, S, R, T, Φ, Ψ). Governs token budgets, compute limits, API call quotas. Claims: 90% token reduction, 525x lower variance, zero conservation violations — all pertaining to resource efficiency. Per-task scope. Programmatic contract format, NOT YAML file-based.
  **NEGATIVE RESULT:** Resource governance only. NOT behavioral specification. NOT competing prior art for Organon's direction. Explicitly documented to prevent re-investigation.
  Tags: #resource-governance #formal-contracts #negative-result #not-competing-prior-art

- **PCAS: Policy Compiler for Agentic Systems** (2026) — (authors TBD, arXiv 2602.16708) — https://arxiv.org/abs/2602.16708
  Pre-execution reference monitor at the action-invocation layer. Policies written in Datalog with stratified negation, compiled through Differential Datalog to native Rust enforcement module. Intercepts tool calls, API invocations, and cross-agent messages BEFORE execution — architectural enforcement guarantee (non-compliant actions cannot be taken). No first-class phase concept; sequencing via causal dependency predicates only. 48% → 93% compliance vs. system-prompt-only baseline. "Policy-compliant by construction" guarantee applies to Datalog-encoded action policies at the action layer — NOT to project-scope behavioral methodology.
  Code not yet released ("will be released soon" per paper footnote) — claims unverified against code. Viable enforcement substrate for Organon phase gates but not a direct AC2 solution at the methodology layer.
  Tags: #policy-compliance #forcing-function #Datalog #pre-execution-enforcement #action-invocation-layer #not-methodology-layer #code-unreleased

- **Constitutional Spec-Driven Development (CSDD)** (Jan 2026) — (authors TBD, arXiv 2602.02584) — https://arxiv.org/abs/2602.02584
  CWE-indexed security constraints as a versioned "constitution" injected into the prompt pipeline. Three-artifact hierarchy (spec/plan/tasks). 73% reduction in security vulnerabilities (self-reported). RFC-2119 levels used for severity classification only — not runtime enforcement. Compliance traceability matrix is manual. Advisory-only enforcement model.
  Tags: #constitution #security-constraints #advisory-enforcement #three-artifact #RFC-2119

- **MI9: Multi-level Intelligent Governance for Agentic Systems** (Aug 2025) — (authors TBD, arXiv 2508.03858) — https://arxiv.org/abs/2508.03858
  Six-component runtime governance system with FSM-based conformance engine and graduated containment (4 levels). Retroactive monitoring model — observe and react, not declare and enforce. 99.81% detection rate on LLM-judged synthetic traces (weak evidence). ATS taxonomy (cognitive/action/coordination events) is a useful vocabulary contribution.
  Tags: #runtime-governance #FSM-conformance #ATS-taxonomy #monitoring #weak-evidence

- **Governance as a Service (GaaS)** (Aug 2025) — (authors TBD, arXiv 2508.18765) — https://arxiv.org/abs/2508.18765
  Post-generation, pre-externalization behavioral firewall. JSON-encoded declarative governance policies declared before session. Rule format: regex/boolean pattern matching on output strings. Trust Factor: per-agent compliance scoring with severity-weighted penalties — novel temporal enforcement mechanism. Cannot enforce phase sequencing or gate invariants. Complementary to Organon (output content enforcement vs. methodology adherence enforcement).
  Tags: #governance-as-service #post-generation #Trust-Factor #adaptive-enforcement #output-content-rules

### Agent State Serialization

- **Letta .af (Agent File) Format** (2024–2025) — Letta Inc. — https://github.com/letta-ai/letta
  Serializes agent state: system prompt, memory blocks, tool schemas, tool rules, model config, message history. InitToolRule/TerminalToolRule/ToolRule provide runtime-enforced tool option restriction. Git-backed versioning. State-first (snapshot of specific instance), not specification-first (behavioral declaration before execution). Enforcement degrades on models without structured output support.
  Tags: #agent-state #tool-rules #state-serialization #letta #runtime-enforcement

- **Zep Typed Entity Schemas** (2024–2025) — Zep AI — https://www.getzep.com
  Uses Pydantic BaseModel for typed entity definitions in agent memory. Typed schemas for agent knowledge representation. Scout-level finding — not investigated deeply.
  Tags: #typed-schema #agent-memory #pydantic #Scout-level

### Protocol Standards

- **Model Context Protocol (MCP)** (2024–2025, spec 2025-11-25) — Anthropic — https://modelcontextprotocol.io
  Tool-typing standard with 97M+ monthly SDK downloads and 5800+ community servers. inputSchema (required JSON Schema) and outputSchema (optional) provide structural validation only. ToolAnnotations are explicitly advisory and untrusted per the spec. No behavioral constraints, no invocation ordering, no preconditions. SEP-1686 adds async task tracking with `input_required` pause primitive — composable by external orchestrators but not native multi-step orchestration. AC3 RESOLVED: MCP provides no native behavioral methodology enforcement.
  Tags: #MCP #tool-typing #adoption #no-behavioral-constraints #AC3-resolved #composable-primitives

### Production Agent SDKs

- **OpenAI Agents SDK lifecycle hooks** (2025) — OpenAI — https://platform.openai.com/docs/agents
  Exposes `on_llm_start`, `AgentHooks`, `RunHooks` lifecycle events. Closest major-lab pre-generation behavioral gate in a production SDK. NOT YET READ — sourced from Critic's missed list. Session 4 candidate.
  Tags: #production-SDK #lifecycle-hooks #pre-generation-gate #UNINVESTIGATED

### Workflow Orchestration

- **Temporal.io durable execution model** (2020–2025) — Temporal Technologies — https://temporal.io
  Workflow-as-code with explicit phase sequencing, preconditions, and durable execution guarantees. Production prior art for multi-step behavioral enforcement with explicit gate semantics. NOT YET READ — sourced from Critic's missed list. Session 4 candidate.
  Tags: #durable-execution #phase-sequencing #workflow-as-code #production-prior-art #UNINVESTIGATED

### IaC / Methodology-as-Code History

- **Terraform / HCL** (2014–present) — HashiCorp — https://www.terraform.io
  Declarative IaC. Describes desired state; drift detection via plan/apply cycle. Corresponds to current Organon stage: declarative YAML, CLI verification, drift detection. No compile-time behavioral enforcement.
  Tags: #IaC #declarative #drift-detection #current-Organon-analog

- **Pulumi TypeScript** (2018–present) — Pulumi Corp — https://www.pulumi.com
  Native language types for IaC. `Output<T>` wraps deployment-time resolved values (NOT compile-time guarantees unless using branded types). Corresponds to Organon's target direction: behavioral types, composition patterns. CDKTF was deprecated Dec 2025 for product-market fit failure, not type system failure.
  Tags: #IaC #native-language-types #Organon-target-direction #Output-T-caveat

---

## Similar Projects & Directions

**Agent Behavioral Contracts (ABC)**
Convergence: YAML-typed behavioral specification (confirmed), runtime enforcement, structured violation handling. The full ContractSpec C = (P, I_hard, I_soft, G_hard, G_soft, R) maps partially to Organon's ethos (invariants/principles) + protocol (procedures + enforcement points). The hard/soft invariant distinction aligns with Organon's enforcement tier concept.
Divergence: Session scope vs. project methodology scope. ABC governs one execution run; Organon governs the ongoing methodology across all sessions on a project. ABC also appears to govern a single agent, not a multi-agent team under a shared methodology. Evidence quality is LOW — the schema and enforcement system cannot be independently verified.
What to learn: The hard/soft invariant distinction and full six-component tuple are worth incorporating into Organon's violation categorization design. The Drift Bounds Theorem provides vocabulary for probabilistic enforcement guarantees.
Blocking item: AgentAssert not publicly available. Schema cannot be independently verified. Low evidence quality means ABC should be cited with explicit caveats about provenance.

**PCAS (Policy Compiler for Agentic Systems)**
Convergence: Pre-execution enforcement of behavioral constraints — action-layer architectural guarantee (non-compliant actions cannot be taken). This is the AC2 forcing function pattern Organon's roadmap is building toward, demonstrated at the action layer.
Divergence: PCAS is an action-invocation enforcement layer, not a methodology layer. No phase concept. No project-scope persistence. Causal dependency predicates provide implicit sequencing only. Code unreleased — claims unverified.
What to learn: PCAS demonstrates the enforcement architecture Organon needs at the methodology layer. A plausible synthesis: Organon phase gates encoded as Datalog causal dependency predicates — a phase gate becomes a predecessor that all next-phase actions depend on. This synthesis is speculative pending code release and Datalog expressiveness verification.

**GaaS (Governance as a Service)**
Convergence: Pre-session policy declaration (JSON artifact, not inline instructions). Session-persistent enforcement state (Trust Factor).
Divergence: Operates on output content (regex/boolean matching), not execution structure. Cannot enforce phase gates, ordering invariants, or methodology protocols.
What to learn: The Trust Factor's adaptive enforcement model (compliance history modulates future enforcement intensity) is a design pattern Organon does not have. Evaluate whether project-scope methodology governance should incorporate session-level trust scoring as a complement to gate-based enforcement.

**CSDD (Constitutional Spec-Driven Development)**
Convergence: Versioned behavioral specification injected into agent context before execution. Compliance traceability from principle to artifact. RFC-2119 severity levels.
Divergence: Advisory-only enforcement. Human-in-the-loop reject-and-regenerate. The "constitution" is prompt injection, not a runtime enforcement mechanism. Spec/plan/tasks hierarchy serves different purposes than ethos/protocol/workflow.
What to learn: The empirical result (73% security violation reduction) is evidence that upfront specification injection works even without runtime enforcement. Organon can cite this as a baseline: advisory specification alone produces measurable improvement; runtime enforcement should be expected to produce more. Organon is "CSDD with runtime enforcement" — establishing this explicitly clarifies incremental novelty.

**Letta**
Convergence: Typed tool rules with runtime enforcement. Git-backed versioning of agent configuration.
Divergence: State-first not specification-first. Git versioning captures agent state snapshots, not methodology evolution. Tool rules constrain tool choice set, not behavioral invariants.
What to learn: The tool rule mechanism (InitToolRule, TerminalToolRule, ToolRule) is a direct implementation model for how Organon's protocol steps could constrain which tools are available at which workflow stages. This is the technical mechanism, not the methodology layer.

---

## Industry Directions

**Anthropic (MCP):** The dominant industry move is tool-typing standardization, not behavioral specification. MCP defines how tools are described and invoked in typed format — not what agents should or should not do. ToolAnnotations are explicitly advisory and untrusted. The methodology layer above MCP (what the agent's behavioral constraints are) is left entirely to the application developer. SEP-1686's `input_required` provides a composable pause primitive that an external orchestrator can build gate sequences on top of. This gap is precisely where Organon operates.

**Letta / MemGPT lineage:** The agent memory and state management direction is toward typed schemas (Pydantic, TypeScript) for agent knowledge representation. The Letta tool rule system is the closest industry implementation of constrained execution. Widely used in production agentic workflows.

**OpenAI Agents SDK:** The `on_llm_start` / `AgentHooks` / `RunHooks` lifecycle event system represents the closest major-lab implementation of pre-generation behavioral gating in a production SDK. Must be investigated as industry prior art for the gate mechanism Organon is specifying. Session 4 candidate.

**Broader governance research (2025–2026):** The MI9, GaaS, PCAS, and ABC papers collectively signal that the academic community has identified governance as a first-class problem for agentic systems. The field is converging on: (1) behavioral specification, (2) runtime monitoring or construction-time enforcement, (3) escalation/recovery mechanisms. The key divergence emerging across papers is enforcement layer: output content (GaaS, regex/boolean) vs. action invocation (PCAS, Datalog pre-execution) vs. methodology phase (Organon, gate invariants). These are distinct enforcement targets at different layers of the stack. The methodology-phase layer remains unoccupied by any published work.

**No major lab has published a methodology-as-code standard.** OpenAI Operator guidelines, Anthropic's Model Spec, and Google's A2A are all either single-model constraints, communication protocols, or prose guidelines — not typed, versioned, runtime-enforced behavioral methodology artifacts. This gap persists after Session 3.

---

## What Organon Can Build On

**MCP SEP-1686 `input_required` primitive:** Now confirmed as the composable gate-pausing hook Organon can orchestrate into multi-step phase sequences. mcp-query-api.md should explicitly reference this as the MCP-native building block Organon composes, not competes with.

**GaaS Trust Factor:** Per-agent compliance scoring with severity-weighted penalties. If Organon's verification gates incorporate a trust signal, GaaS's adaptive enforcement model provides a published design precedent for how trust-modulated enforcement behaves in practice. Concrete integration scenario: when an agent's Trust Factor falls below a project-configured threshold, Organon's next gate escalates from automated verification to human review.

**ABC ContractSpec hard/soft invariant distinction:** Even accounting for ABC's low evidence quality, the C = (P, I_hard, I_soft, G_hard, G_soft, R) tuple's two-tier invariant structure (hard = escalate, soft = recover) is a design contribution worth incorporating into Organon's violation categorization. The schema itself cannot be verified (AgentAssert unavailable), but the tuple structure is fully described in the paper abstract.

**PCAS pre-execution reference monitor architecture:** PCAS demonstrates that interposing an enforcement module between agent and actions is architecturally feasible and produces strong empirical compliance results (48%→93%). Organon's phase gate mechanism could adopt this architecture: a phase-gate enforcement module between agent and tool/workflow execution, with phase state encoded in Datalog-style dependency predicates. This is the synthesis path from PCAS to Organon — speculative until PCAS code is released.

**CSDD compliance traceability matrix:** The principle ID → CWE → file:line mapping is a manual precursor to Organon's automated invariant binding. The structure is directly applicable to rfc-as-structured-data.md's traceability chain design. Organon automates what CSDD does manually.

**Letta tool rules:** The InitToolRule/TerminalToolRule pattern is directly adoptable for mcp-query-api.md's protocol-guided routing. Tool availability constraints at workflow stage boundaries are technically feasible and in production.

**MI9's ATS taxonomy** (cognitive/action/coordination event categories): Useful vocabulary for describing what types of behavioral events Organon's verification gates should monitor. Does not require adopting MI9's architecture.

**IaC arc as positioning frame:** The Snowflake Server → Puppet/Chef → Terraform HCL → Pulumi TypeScript arc gives Organon a precise vocabulary for its current position (HCL stage: declarative, drift-detectable) and its target direction (TypeScript stage: behavioral types, construction-time enforcement). This arc should be explicit in yaml-first-organons.md positioning — with the caveat that the analogy describes a direction, not a current-state equivalence.

---

## What Appears Novel to Organon

**Project-scope methodology persistence (vs. session-scope behavioral contracts).**
This is now the PRIMARY NOVELTY CLAIM. ABC governs a single execution session. PCAS governs individual action invocations. GaaS governs output content per session. Organon governs ongoing project methodology that persists across all sessions, all agents, and all contributors. No published work reviewed to date treats methodology itself as a versioned, typed artifact with project-level scope — binding all agents working on a project across all sessions to a common behavioral specification. This is the strongest and most defensible novelty claim.
Confidence: Moderate. The absence of project-scope prior art is confirmed across all Session 1–3 reviewed works (ABC, CSDD, MI9, GaaS, Letta, PCAS, Agent Contracts Resource-Bounded). Gaps remain: OpenAI Agents SDK, Temporal.io, and DbC adoption history have not been investigated. The claim cannot be elevated to high confidence until those are checked.

**Bidirectional reference enforcement across the organon graph.**
Organon's requirement that protocols and workflows bidirectionally reference each other (no orphans in either direction) as an automated invariant is not found in any reviewed work. CSDD has a compliance traceability matrix, but it is manual. ABC ContractSpec does not describe cross-artifact reference integrity. PCAS operates at the action layer with no artifact graph concept.
Confidence: Low. This specific invariant was not the focus of prior art search. Cannot claim novelty without a targeted search for "cross-artifact reference enforcement" in agent methodology systems.

**Methodology as the enforcement layer above MCP.**
MCP explicitly provides no behavioral methodology enforcement. The ToolAnnotations are advisory. The behavioral layer above MCP is unspecified by the protocol. Organon's position as the methodology layer that composes MCP's composable primitives (including SEP-1686's `input_required`) into gate sequences is not occupied by any published work or major lab product.
Confidence: Moderate. AC3 is resolved and this gap is confirmed. Confidence increases compared to Session 1 because the MCP specification was read directly.

---

## Open Questions

**Q1: Does OpenAI Agents SDK's lifecycle hook model (on_llm_start, AgentHooks, RunHooks) represent a competing gate specification approach?**
Why it matters: This is the closest major-lab implementation of pre-generation behavioral gating. Understanding its architecture determines whether Organon's gate mechanism is novel or redundant with what major labs are shipping.
What would answer it: Read the OpenAI Agents SDK documentation on lifecycle hooks. Extract: what events are hookable, what enforcement can hooks provide, whether the hook model supports ordering invariants or preconditions.

**Q2: Does Temporal.io's durable execution model provide a production prior art for multi-step phase enforcement with explicit gate semantics?**
Why it matters: Temporal.io is production prior art for workflow-as-code with phase sequencing and preconditions. If Organon's gate model converges with Temporal's workflow model, this is a useful framing (and an adoption path argument). If it diverges, the divergence should be explicit.
What would answer it: Read Temporal.io's workflow model documentation. Extract: how workflows declare phase ordering, what preconditions are supported, how violation handling works.

**Q3: Does Design by Contract adoption history predict Organon's adoption barriers?**
Why it matters: DbC (Bertrand Meyer, 1992) is the direct ancestor of ABC-style contracts. Eiffel, JML, and Spec# all failed to achieve mainstream adoption despite decades of tooling. If the failure reasons apply to agent behavioral specifications, Organon faces a structural adoption barrier regardless of technical merit.
What would answer it: Research DbC adoption barriers: runtime overhead, tooling cost, developer friction, language lock-in, partial specification problem. Map each barrier to the agent methodology context. Assess which barriers Organon inherits and which are structurally different in the LLM context.

**Q4: Can PCAS's Datalog dependency predicates express Organon-style phase gates, and does this constitute a viable enforcement substrate?**
Why it matters: The synthesis (Organon phase gates built on top of PCAS) is the most concrete path to AC2 resolution at the methodology layer. But it is speculative until PCAS code is released and the Datalog expressiveness is confirmed.
What would answer it: When PCAS code is released — verify that phase-state predicates can be expressed in the Datalog language, and prototype a phase gate as a causal dependency predicate. This is a future engineering task, not a research task.

**Q5: Does the GaaS Trust Factor integration scenario hold up under concrete specification?**
Why it matters: The "complementary" characterization of GaaS requires a concrete integration scenario to be demonstrated rather than asserted.
What would answer it: Write a one-paragraph integration scenario: when Organon's gate consumes the Trust Factor, at what threshold does behavior change, and what does "additional verification" mean concretely? This is an analytical task, not a new research task.

---

## Critic's Unresolved Challenges

**RESOLVED: MCP behavioral semantics.**
The MCP specification was read Session 2. AC3 is fully resolved. MCP provides no native behavioral methodology enforcement. ToolAnnotations are advisory and untrusted. SEP-1686 provides composable primitives, not native multi-step orchestration. See Finding 5 for full characterization.

**RESOLVED: GaaS investigated.**
GaaS (arXiv 2508.18765) was read Session 2. AC4 is resolved. GaaS is a post-generation behavioral firewall with a novel Trust Factor mechanism. See Finding 6 for full characterization. The "complementary" claim still needs a concrete integration point — see Open Question Q5.

**RESOLVED: IaC arc documented.**
The IaC arc was researched Session 2. The correspondence is directionally correct. The critical caveat (current Organon is at the HCL stage, not the TypeScript stage) has been incorporated. Resolved as framing; not yet used in any output document.

**RESOLVED: PCAS investigated.**
PCAS (arXiv 2602.16708) was read Session 3. Full findings in Finding 8. PCAS is a pre-execution reference monitor at the action-invocation layer — not a methodology layer. 48%→93% compliance result is the strongest published empirical evidence for AC2 direction. Code not yet released. AC2 advances to 0.65. PCAS does not directly resolve AC2 — it demonstrates feasibility of the enforcement architecture Organon needs to build at the methodology layer.

**RESOLVED: PCAS scope characterization.**
PCAS's "policy-compliant by construction" guarantee is now precisely scoped: it applies to Datalog-encoded action policies at the action-invocation layer. The document does not import this guarantee into claims about Organon. See Finding 8 and the "Do not import" instruction.

**RESOLVED: ABC evidence quality now disclosed.**
ABC is now explicitly characterized as LOW evidence quality (single author, no institutional affiliation, self-designed benchmark, AgentAssert unavailable). The prior art citation includes this caveat. See Finding 1.

**RESOLVED: Project-scope vs. session-scope now the explicit primary novelty claim.**
The distinction between ABC's session scope and Organon's project scope is now central — stated in the Summary, Finding 1, and the "What Appears Novel to Organon" section. This is not a minor implementation difference; it is a fundamentally different scope.

**RESOLVED: Agent Contracts Resource-Bounded investigated and explicitly dismissed.**
arXiv 2601.08815 was assessed Session 3. Resource governance only. Not behavioral specification. Not competing prior art. Documented as negative result in Related Work to prevent re-investigation. See Finding 9.

**SIGNIFICANT: PCAS code unavailability.**
Code not released yet ("will be released soon"). 48%→93% compliance claim cannot be independently verified. Noted in Finding 8 and Related Work entry. Remains open until code is released.

**SIGNIFICANT: GaaS Trust Factor — "complementary" asserted, not demonstrated.**
The claim that GaaS and Organon are complementary needs a concrete integration point. A scenario was outlined (Finding 6 and "What Organon Can Build On") but not formally written. See Open Question Q5. This is an analytical task that does not require new research.

**OPEN: Design by Contract adoption history not analyzed.**
DbC background research (Bertrand Meyer / Eiffel / JML / Spec#) has not been investigated in Sessions 1–3. The documented failure of DbC to achieve mainstream adoption in software engineering is directly relevant to predicting Organon's adoption trajectory. Session 4 candidate. See Open Question Q3.

**OPEN: OpenAI Agents SDK lifecycle hooks not investigated.**
This is the closest major-lab production implementation of pre-generation behavioral gating. Not read in Sessions 1–3. Session 4 candidate. See Open Question Q1.

**OPEN: Temporal.io durable execution not investigated.**
Production prior art for multi-step behavioral enforcement with explicit phase sequencing and preconditions. Not read in Sessions 1–3. Session 4 candidate. See Open Question Q2.

---

## Session 4 Scope

Session 3 closed the highest-priority blocking items (PCAS, ABC status, Agent Contracts). Remaining open questions are significant but lower urgency — the primary novelty claim is now established and well-supported. Session 4 targets production prior art and adoption trajectory.

**Priority 1 (SIGNIFICANT): Read OpenAI Agents SDK lifecycle hooks.**
The `on_llm_start` / `AgentHooks` / `RunHooks` system is the closest major-lab production implementation of pre-generation behavioral gating. Until read, the industry prior art characterization is incomplete. Extract: what behavioral events are hookable, whether hooks enforce ordering invariants or preconditions, whether this is competing or complementary. This is the most important remaining industry gap.

**Priority 2 (SIGNIFICANT): Read Temporal.io durable execution model.**
Production prior art for workflow-as-code with phase sequencing and preconditions. If Organon's gate model converges with Temporal's workflow model, this is a useful adoption framing and an argument that the problem is solved at the workflow layer (requiring Organon to differentiate on the methodology-specification layer above it). If it diverges, the divergence should be explicit. Can be parallelized with Priority 1.

**Priority 3 (SIGNIFICANT): Research Design by Contract adoption barriers.**
Searches: "Design by Contract adoption barriers mainstream", "Bertrand Meyer Eiffel contract programming failure", "JML Spec# adoption why failed". Goal: identify the 3–5 documented adoption barriers and map each to the agent methodology context. Determines whether Organon faces structural adoption headwinds from the same forces that constrained DbC in software engineering. This is foundational context for the project's long-term trajectory.

**Priority 4 (ANALYTICAL): Write GaaS Trust Factor integration scenario.**
No new research required. Write one paragraph: when Organon's gate consumes the Trust Factor, at what threshold does behavior change, what does "additional verification" mean, and how does this interact with project-scope methodology persistence? This converts the "complementary" assertion into a demonstrated integration point.

**Priority 5 (MONITORING): Track PCAS code release.**
When PCAS code is released, verify that phase-state predicates can be expressed in the Datalog language. This would advance AC2 from 0.65 toward resolution. Not actionable until code is released — add to future monitoring, not active research.

Target delta after Session 4: **0.82** (OpenAI SDK and Temporal.io characterize production prior art, DbC history establishes adoption trajectory context, GaaS integration scenario makes AC4 fully demonstrated).

---

## Sources Consulted

Sources read directly (Sessions 1–3):
- MCP specification 2025-11-25 — modelcontextprotocol.io (Session 2)
- MCP SEP-1686 — async task tracking + input_required pause primitive (Session 2)
- GaaS (Governance as a Service) — arXiv 2508.18765 (Session 2)
- Letta .af format + tool rules — github.com/letta-ai/letta (Session 1)
- ABC (Agent Behavioral Contracts) — arXiv 2602.22302 — abstract and body confirmed YAML-based, session-scoped (Session 3)
- PCAS (Policy Compiler for Agentic Systems) — arXiv 2602.16708 (Session 3)
- Agent Contracts Resource-Bounded — arXiv 2601.08815 (Session 3)

Sources accessed via secondary sources or partially read (Sessions 1–3):
- CSDD (Constitutional Spec-Driven Development) — arXiv 2602.02584 — abstract and paper structure (Session 1)
- MI9 — arXiv 2508.03858 — partial read (Session 1); author GitHub search (Session 3)
- IaC adoption arc (Terraform, CDKTF, Pulumi) — well-documented public record (Session 2)
- ABC author GitHub (varun369) — searched; no AgentAssert repo found (Session 3)

Sources not investigated (carried to Session 4):
- OpenAI Agents SDK lifecycle hooks — platform.openai.com/docs/agents
- Temporal.io durable execution model — temporal.io
- Design by Contract adoption barriers — Bertrand Meyer / Eiffel / JML / Spec# literature
- PCAS code — not released as of research date ("will be released soon" per paper)
