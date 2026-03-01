# State of the Art: Structured Agentic Methodology & Protocol Standards

> Research date: 2026-03-01
> Session 2 of estimated 3–4
> Informs: yaml-first-organons.md, rfc-as-structured-data.md, mcp-query-api.md
> Goal-reaching delta: 0.59 / 1.0

---

## Summary

Session 2 resolved AC3 decisively and made partial progress on AC2 and AC4. AC1 remains structurally blocked.

**AC3 (MCP behavioral constraints) — RESOLVED.** The MCP specification (2025-11-25) contains no behavioral constraints. ToolAnnotations are explicitly advisory and untrusted per the spec. inputSchema and outputSchema are structural validation only. MCP SEP-1686 introduces an `input_required` pause primitive that an external orchestrator could compose into gate sequences, but this is composable plumbing, not native behavioral methodology enforcement. MCP is a transport and tool-description protocol; the behavioral layer above it is unspecified and left to the application.

**AC4 (GaaS) — CHARACTERIZED.** GaaS (arXiv 2508.18765) is a post-generation behavioral firewall: it acts after the LLM outputs text but before that output is externalized. Policies are declared before the session (JSON artifact-based), rules are regex/boolean pattern matching on output strings. The Trust Factor mechanism — per-agent compliance scoring with severity-weighted penalties — is a novel temporal enforcement mechanism not found in Session 1 work. GaaS cannot enforce phase sequencing, gate invariants, or behavioral protocols. It is complementary to, not competitive with, Organon. However, the Trust Factor deserves further analysis as a potential signal Organon could consume.

**AC2 (forcing function patterns) — PARTIALLY ADDRESSED.** The IaC arc was documented: Snowflake Server problem → Puppet/Chef → Terraform HCL → CDKTF (deprecated Dec 2025) → Pulumi TypeScript. The correspondence to Organon's enforcement direction is directionally correct. The Critic's caveat is significant: current Organon (YAML + CLI verification) maps to Terraform HCL, not Pulumi TypeScript. The analogy is a *direction*, not a current-state claim. A new, stronger lead has emerged: PCAS (arXiv 2602.16708) proposes a "policy-compliant by construction" approach using a Datalog-derived language, achieving compliance from 48% to 93%. PCAS is the strongest published evidence for AC2 and must be investigated first in Session 3.

**AC1 (YAML-first behavioral specification prior art) — PARTIALLY ADDRESSED, STRUCTURALLY BLOCKED.** ABC ContractSpec remains the closest published prior art for YAML-first behavioral specification, but its IP status was mischaracterized in the Session 2 brief. "Patent pending" does not mean software is proprietary — the schema may be open-sourced independently. "Available subject to intellectual property clearance" means review process, not denial. The paper was published approximately five days before the research session; a GitHub repo may simply not have been linked yet. The schema must be sought via author GitHub profiles, institutional pages, and supplemental materials before claiming it is inaccessible. A competing prior art paper exists: Agent Contracts Resource-Bounded (arXiv 2601.08815), which claims 90% token reduction and 525x lower variance on resource governance. This was missed in Session 1.

---

## Key Findings

**Finding 1: ABC (Agent Behavioral Contracts) is the closest published prior art for runtime enforcement of YAML behavioral specifications.**
- **Finding:** ABC (arXiv 2602.22302, Feb 2026) proposes a ContractSpec DSL that appears to be YAML-based, with four formal components: Preconditions (entry conditions for execution), Invariants (properties that must hold throughout), Governance policies (behavioral constraints during execution), and Recovery mechanisms (responses to violations). Hard violations trigger escalation; soft violations trigger recovery actions. This is a runtime enforcement model, not advisory-only, and the specification format is structured/typed rather than prose. It is the only published work found to date that combines all three of Organon's key requirements: YAML-typed, behavioral specification, and runtime enforcement.
- **Evidence:** arXiv preprint 2602.22302 (Feb 2026). Early evidence — single preprint, not peer-reviewed at publication time.
- **IP status (updated):** The paper states "patent pending" and "data available subject to intellectual property clearance." These phrases do NOT establish that the software is proprietary or inaccessible. Patent pending means an application has been filed, not that the system is locked. Many patent-pending systems are simultaneously open-sourced. The paper was published approximately five days before the research session; a GitHub repo may not have been linked yet. Status as of research date: **not publicly located, status unverified**. Must search author GitHub profiles and institutional pages before any stronger claim.
- **Implication for Organon:** The YAML-first organon design (yaml-first-organons.md) does not lack prior art — ABC has arrived at a structurally similar place. The design question for Organon is the scope gap: ABC governs a single execution session; Organon governs ongoing methodology across many sessions. Whether this scope difference is the primary novelty claim for rfc-as-structured-data.md needs to be investigated before asserting novelty. Read ABC's ContractSpec schema directly and map it to Organon's ethos/protocol/workflow tripartite structure to identify structural divergences.

**Finding 2: Software constitutions (CSDD, arXiv 2602.02584) demonstrate that structured behavioral specifications reduce security violations — but enforcement is advisory, not runtime.**
- **Finding:** Constitutional Spec-Driven Development (CSDD) introduces CWE-indexed security constraints as a "constitution" injected into the prompt pipeline. Three-artifact hierarchy: spec.md / plan.md / tasks.md. Results: 73% reduction in security vulnerabilities, 4.3x improvement in compliance documentation coverage. RFC-2119 enforcement levels are used as severity classification only — they do not drive a runtime enforcement mechanism. Compliance tracking is a manual precursor (compliance traceability matrix mapping principle ID to CWE to file:line). Enforcement model: pre-generation advisory injection plus human review (reject-and-regenerate).
- **Evidence:** arXiv 2602.02584 (Jan 2026). Early evidence — single preprint. The 73% and 4.3x figures are from the paper's own evaluation; independent replication has not occurred.
- **Implication for Organon:** Two things are confirmed: (1) structured behavioral specifications do measurably affect LLM security output — the CSDD result is direct empirical support for the premise that explicit methodology reduces violations. (2) The CSDD three-artifact hierarchy (spec/plan/tasks) converges in labeling with Organon's three artifacts (ethos/protocol/workflow) but serves different purposes and has different enforcement mechanisms. Do not cite as structural convergence — the similarity is naming-level only. The inverse framing is useful: Organon is essentially "CSDD with runtime enforcement." Establishing this explicitly strengthens the incremental novelty claim.

**Finding 3: MI9 and GaaS are governance frameworks but neither is a declaration-first behavioral specification system.**
- **Finding:** MI9 (arXiv 2508.03858, Aug 2025) provides runtime governance via a six-component system including an FSM-based conformance engine and graduated containment (4 levels). GaaS (arXiv 2508.18765) provides governance as a service with JSON-encoded declarative rules. Both are observe-and-react systems: they monitor execution and respond to violations. Neither requires — or supports — upfront behavioral declaration in the sense that Organon's organon files declare methodology before any execution begins. MI9's ATS taxonomy (cognitive/action/coordination events) is genuinely useful vocabulary for categorizing agent behavior types.
- **Evidence:** MI9: arXiv 2508.03858 (Aug 2025), early evidence. SIGNIFICANT CAVEAT: MI9's 99.81% detection rate is produced by LLM-judged synthetic traces (LLM grades LLM in a closed loop). This is weak evidence quality and cannot be cited as real-world evidence. GaaS: arXiv 2508.18765 (Aug 2025) — INVESTIGATED this session. See Finding 6 for full GaaS characterization.
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
- **Evidence:** arXiv 2508.18765 (Aug 2025) — read this session. Early evidence.
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
- **Evidence:** IaC history research conducted this session. Well-documented public record.
- **Implication for Organon:** The IaC arc is valid framing for the long-term vision. The honest positioning: Organon is currently at the Terraform HCL stage (declarative YAML, CLI verification, drift detection) and is building toward the Pulumi TypeScript stage (behavioral types, pre-execution enforcement, composition patterns). The roadmap should describe this trajectory explicitly rather than implying current capability at the TypeScript stage.

**Finding 8: PCAS (arXiv 2602.16708) — "policy-compliant by construction" — is the strongest published evidence for AC2 forcing functions and was missed in Session 1.**
- **Finding:** PCAS (Policy Compiler for Agentic Systems) proposes a "policy-compliant by construction" approach using a Datalog-derived constraint language. The compliance guarantee is architectural: agents cannot generate non-compliant outputs because compliance is enforced at the generation layer, not the monitoring layer. Reported result: compliance rate from 48% to 93%. This is the strongest published evidence found to date for the AC2 question of "mechanisms that make behavioral drift structurally impossible."
- **Evidence:** arXiv 2602.16708 — NOT YET READ THIS SESSION. Finding sourced from Critic's "what was missed" list. Must be read in Session 3 before any claims about PCAS can be made.
- **Implication for Organon:** If PCAS's claims hold on direct reading, it is a direct competitor or complement to Organon's enforcement direction. The question is whether PCAS operates at the content/output layer (like GaaS) or at the methodology/phase layer (like Organon). This distinction determines whether PCAS is prior art for the same problem or a different enforcement layer. PCAS must be the first investigation in Session 3.

---

## Related Work (Annotated)

### Runtime Behavioral Specification

- **Agent Behavioral Contracts (ABC)** (Feb 2026) — (authors TBD, arXiv 2602.22302) — https://arxiv.org/abs/2602.22302
  Proposes ContractSpec: a YAML-based DSL where contracts are defined as C = (P, I, G, R) — Preconditions, Invariants, Governance policies, Recovery mechanisms. Hard violations escalate; soft violations trigger recovery actions. Claims runtime enforcement. Single execution session scope. Closest published prior art for Organon's behavioral specification direction.
  IP status: patent pending (does not mean proprietary); schema publication status unverified as of research date — not yet located on GitHub or supplemental materials, but not confirmed absent.
  Tags: #behavioral-contracts #YAML-spec #runtime-enforcement #prior-art #session-scope #IP-status-unverified

- **Agent Contracts Resource-Bounded** (Jan 2026) — (authors TBD, arXiv 2601.08815) — https://arxiv.org/abs/2601.08815
  Formal contracts for resource-bounded agents. Claims: 90% token reduction, 525x lower variance, zero conservation violations. Competing prior art for session-scope resource governance. NOT YET READ — sourced from Critic's missed list. Must be read in Session 3.
  Tags: #behavioral-contracts #resource-governance #formal-contracts #UNINVESTIGATED

- **PCAS: Policy Compiler for Agentic Systems** (2026) — (authors TBD, arXiv 2602.16708) — https://arxiv.org/abs/2602.16708
  "Policy-compliant by construction" using a Datalog-derived constraint language. Compliance enforced at generation layer, not monitoring layer. 48% → 93% compliance rate. Strongest published evidence for AC2 (forcing function mechanisms). NOT YET READ — must be first investigation in Session 3.
  Tags: #policy-compliance #forcing-function #Datalog #construction-time-enforcement #UNINVESTIGATED #HIGHEST-PRIORITY

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
  Exposes `on_llm_start`, `AgentHooks`, `RunHooks` lifecycle events. Closest major-lab pre-generation behavioral gate in a production SDK. NOT YET READ — sourced from Critic's missed list. Session 3 candidate.
  Tags: #production-SDK #lifecycle-hooks #pre-generation-gate #UNINVESTIGATED

### Workflow Orchestration

- **Temporal.io durable execution model** (2020–2025) — Temporal Technologies — https://temporal.io
  Workflow-as-code with explicit phase sequencing, preconditions, and durable execution guarantees. Production prior art for multi-step behavioral enforcement with explicit gate semantics. NOT YET READ — sourced from Critic's missed list. Session 3 candidate.
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
Convergence: YAML-typed behavioral specification, runtime enforcement, structured violation handling. The ContractSpec (P, I, G, R) schema maps loosely to Organon's ethos (invariants/principles) + protocol (procedures + enforcement points).
Divergence: Session scope vs. project methodology scope. ABC governs one execution run; Organon governs the ongoing methodology across all sessions on a project. ABC also appears to govern a single agent, not a multi-agent team under a shared methodology.
What to learn: Read the ContractSpec schema directly. Assess whether ABC's violation categories (hard/soft) map to Organon's enforcement tiers. Determine whether ABC's scope limitation is an inherent design choice or a gap that could be extended.
Blocking item: Schema publication status must be verified before comparative analysis can proceed.

**PCAS (Policy Compiler for Agentic Systems)**
Convergence: Construction-time compliance guarantee — behavioral drift structurally impossible, not just monitored. This is the AC2 forcing function Organon's roadmap is building toward.
Divergence: Unknown until read. The Datalog-derived constraint language may operate at the output content layer (comparable to GaaS) or the methodology/phase layer (comparable to Organon). This distinction is critical.
What to learn: Read arXiv 2602.16708. Determine enforcement layer. Map the Datalog constraint language to Organon's YAML specification format. Assess whether PCAS is prior art for the same problem or a different enforcement scope.

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

**OpenAI Agents SDK:** The `on_llm_start` / `AgentHooks` / `RunHooks` lifecycle event system represents the closest major-lab implementation of pre-generation behavioral gating in a production SDK. Must be investigated as industry prior art for the gate mechanism Organon is specifying.

**Broader governance research (2025–2026):** The MI9, GaaS, PCAS, and ABC papers collectively signal that the academic community has identified governance as a first-class problem for agentic systems. The field is converging on: (1) behavioral specification, (2) runtime monitoring or construction-time enforcement, (3) escalation/recovery mechanisms. The key divergence emerging across papers is enforcement layer: output content (GaaS, regex/boolean) vs. methodology phase (Organon, gate invariants) vs. construction-time (PCAS, Datalog). These are distinct enforcement targets, not competing solutions to the same problem.

**No major lab has published a methodology-as-code standard.** OpenAI Operator guidelines, Anthropic's Model Spec, and Google's A2A are all either single-model constraints, communication protocols, or prose guidelines — not typed, versioned, runtime-enforced behavioral methodology artifacts. This gap persists after Session 2.

---

## What Organon Can Build On

**MCP SEP-1686 `input_required` primitive:** Now confirmed as the composable gate-pausing hook Organon can orchestrate into multi-step phase sequences. mcp-query-api.md should explicitly reference this as the MCP-native building block Organon composes, not competes with.

**GaaS Trust Factor:** Per-agent compliance scoring with severity-weighted penalties. If Organon's verification gates incorporate a trust signal, GaaS's adaptive enforcement model provides a published design precedent for how trust-modulated enforcement behaves in practice.

**ABC ContractSpec schema** (pending direct verification): If the schema is confirmed as published and accessible, Organon's yaml-first organon design can incorporate ABC's (P, I, G, R) four-component structure as a reference. The violation categorization (hard/soft) maps directly to Organon's enforcement tier concept.

**CSDD compliance traceability matrix**: The principle ID → CWE → file:line mapping is a manual precursor to Organon's automated invariant binding. The structure is directly applicable to rfc-as-structured-data.md's traceability chain design. Organon automates what CSDD does manually.

**Letta tool rules**: The InitToolRule/TerminalToolRule pattern is directly adoptable for mcp-query-api.md's protocol-guided routing. Tool availability constraints at workflow stage boundaries are technically feasible and in production.

**MI9's ATS taxonomy** (cognitive/action/coordination event categories): Useful vocabulary for describing what types of behavioral events Organon's verification gates should monitor. Does not require adopting MI9's architecture.

**IaC arc as positioning frame**: The Snowflake Server → Puppet/Chef → Terraform HCL → Pulumi TypeScript arc gives Organon a precise vocabulary for its current position (HCL stage: declarative, drift-detectable) and its target direction (TypeScript stage: behavioral types, construction-time enforcement). This arc should be explicit in yaml-first-organons.md positioning — with the caveat that the analogy describes a direction, not a current-state equivalence.

---

## What Appears Novel to Organon

**Project-scope methodology persistence (vs. session-scope behavioral contracts).**
ABC governs a single execution session. Organon governs ongoing project methodology that persists across all sessions, all agents, and all contributors. No published work reviewed to date treats methodology itself as a versioned, typed artifact with project-level scope. This is the strongest novelty candidate found to date.
Confidence: Low-moderate. The absence of prior art in the works investigated (ABC, CSDD, MI9, GaaS, Letta, PCAS-pending) is suggestive but not conclusive. PCAS and Agent Contracts Resource-Bounded (arXiv 2601.08815) have not been read and may contain project-scope work. The claim cannot be strengthened until those are read and the Temporal.io model is assessed.

**Bidirectional reference enforcement across the organon graph.**
Organon's requirement that protocols and workflows bidirectionally reference each other (no orphans in either direction) as an automated invariant is not found in any reviewed work. CSDD has a compliance traceability matrix, but it is manual. ABC ContractSpec does not describe cross-artifact reference integrity.
Confidence: Low. This specific invariant was not the focus of prior art search. Cannot claim novelty without a targeted search for "cross-artifact reference enforcement" in agent methodology systems.

**Methodology as the enforcement layer above MCP.**
MCP explicitly provides no behavioral methodology enforcement. The ToolAnnotations are advisory. The behavioral layer above MCP is unspecified by the protocol. Organon's position as the methodology layer that composes MCP's composable primitives (including SEP-1686's `input_required`) into gate sequences is not occupied by any published work or major lab product.
Confidence: Moderate. AC3 is now resolved and this gap is confirmed. Confidence increases compared to Session 1 because the MCP specification was actually read.

---

## Open Questions

**Q1: What does PCAS (arXiv 2602.16708) actually enforce, and at what layer?**
Why it matters: PCAS claims "policy-compliant by construction" — the strongest published evidence for AC2 forcing functions. If PCAS enforces compliance at the methodology/phase layer, it is direct prior art for Organon. If it enforces at the output content layer (like GaaS), it is complementary. The enforcement layer determines whether PCAS competes with or complements Organon.
What would answer it: Read arXiv 2602.16708. Extract: (a) What does the Datalog-derived constraint language express? (b) At what point in the execution pipeline is compliance enforced? (c) What types of violations does it prevent vs. detect? This is the highest-priority Session 3 investigation.

**Q2: Is ABC's ContractSpec schema published and accessible?**
Why it matters: The "closest prior art" claim for ABC rests on the paper's description of ContractSpec, not on a verified, accessible schema artifact. "Patent pending" does not mean software is proprietary. "Available subject to intellectual property clearance" means review process, not denial. The paper was published approximately five days before the research session.
What would answer it: Search the ABC authors' GitHub profiles, institutional pages, and paper supplemental materials for a published ContractSpec schema. If not found after three targeted searches (GitHub, institutional, Google Scholar supplemental), document as "schema not publicly located as of [date]" rather than "not available."

**Q3: What does Agent Contracts Resource-Bounded (arXiv 2601.08815) specify, and does it compete with ABC for the "closest prior art" position?**
Why it matters: 90% token reduction and 525x lower variance suggest a resource governance contract system with strong empirical results. If it covers behavioral contracts (not just resource contracts), it may be stronger prior art than ABC for Organon's direction.
What would answer it: Read arXiv 2601.08815. Extract the contract schema format and assess whether it covers behavioral methodology or only resource limits (tokens, compute).

**Q4: Does Design by Contract adoption history predict Organon's adoption barriers?**
Why it matters: DbC (Bertrand Meyer, 1992) is the direct ancestor of ABC-style contracts. Eiffel, JML, and Spec# all failed to achieve mainstream adoption despite decades of tooling. If the failure reasons apply to agent behavioral specifications, Organon faces a structural adoption barrier regardless of technical merit.
What would answer it: Research DbC adoption barriers: runtime overhead, tooling cost, developer friction, language lock-in, partial specification problem. Map each barrier to the agent methodology context. Assess which barriers Organon inherits and which are structurally different in the LLM context.

**Q5: Does OpenAI Agents SDK's lifecycle hook model (on_llm_start, AgentHooks, RunHooks) represent a competing gate specification approach?**
Why it matters: This is the closest major-lab implementation of pre-generation behavioral gating. Understanding its architecture determines whether Organon's gate mechanism is novel or redundant with what major labs are shipping.
What would answer it: Read the OpenAI Agents SDK documentation on lifecycle hooks. Extract: what events are hookable, what enforcement can hooks provide, whether the hook model supports ordering invariants or preconditions.

**Q6: Does Temporal.io's durable execution model provide a production prior art for multi-step phase enforcement with explicit gate semantics?**
Why it matters: Temporal.io is production prior art for workflow-as-code with phase sequencing and preconditions. If Organon's gate model converges with Temporal's workflow model, this is a useful framing (and an adoption path argument). If it diverges, the divergence should be explicit.
What would answer it: Read Temporal.io's workflow model documentation. Extract: how workflows declare phase ordering, what preconditions are supported, how violations are handled.

---

## Critic's Unresolved Challenges

**RESOLVED: MCP behavioral semantics.**
The MCP specification was read this session. AC3 is fully resolved. MCP provides no native behavioral methodology enforcement. ToolAnnotations are advisory and untrusted. SEP-1686 provides composable primitives, not native multi-step orchestration. See Finding 5 for full characterization.

**RESOLVED: GaaS investigated.**
GaaS (arXiv 2508.18765) was read this session. AC4 is resolved. GaaS is a post-generation behavioral firewall with a novel Trust Factor mechanism. See Finding 6 for full characterization. The "complementary" claim still needs a concrete integration point to be demonstrated rather than asserted — that is an analytical task for Session 3.

**RESOLVED (with caveat): IaC arc documented.**
The IaC arc was researched. The correspondence is directionally correct. The critical caveat (current Organon is at the HCL stage, not the TypeScript stage) has been incorporated. The analogy should not be used to claim capabilities Organon does not yet have. Resolved as framing; not yet used in any output document.

**BLOCKING: PCAS not investigated.**
PCAS (arXiv 2602.16708) was identified by the Critic as the strongest published evidence for AC2 forcing functions. It was not investigated this session. Until PCAS is read, AC2 cannot be scored above 0.25. This is the single highest-priority item for Session 3.

**SIGNIFICANT: ABC schema status — requires active search, not passive documentation.**
The statement "not publicly available as of research date, status unverified" is the correct current characterization. But verifying the status requires active search (author GitHub, institutional pages, supplemental materials) — this is an open task, not a closed finding. It must be pursued in Session 3 before the "closest prior art" claim can be confirmed or revised.

**SIGNIFICANT: Agent Contracts Resource-Bounded (arXiv 2601.08815) not investigated.**
This paper was identified in the Critic's missed list. It may be competing prior art for session-scope behavioral contracts. Must be read in Session 3.

**SIGNIFICANT: Design by Contract adoption history not analyzed.**
DbC background research (Bertrand Meyer / Eiffel / JML / Spec#) is foundational context for predicting Organon's adoption trajectory. The documented failure of DbC to achieve mainstream adoption in software engineering is directly relevant. This was not investigated in Sessions 1 or 2. Session 3 should include this as background research.

**SIGNIFICANT: OpenAI Agents SDK lifecycle hooks not investigated.**
This is the closest major-lab production implementation of pre-generation behavioral gating. Not read in Sessions 1 or 2. Session 3 candidate.

**SIGNIFICANT: Temporal.io durable execution not investigated.**
Production prior art for multi-step behavioral enforcement with explicit phase sequencing and preconditions. Not read in Sessions 1 or 2. Session 3 candidate.

**SIGNIFICANT: GaaS Trust Factor — "complementary" asserted, not demonstrated.**
The claim that GaaS and Organon are complementary needs a concrete integration point: when would Organon consume the Trust Factor signal, and what would it do differently? This is an analytical task that does not require new research — it requires a one-paragraph integration scenario in the "What Organon Can Build On" section.

---

## Session 3 Scope

**Priority 1 (BLOCKING): Read PCAS (arXiv 2602.16708).**
PCAS claims "policy-compliant by construction" using a Datalog-derived constraint language — compliance from 48% to 93%. This is the strongest published evidence for AC2 (forcing function mechanisms that make behavioral drift structurally impossible). Until PCAS is read, AC2 cannot be resolved. Extract: enforcement layer (content vs. methodology), constraint language expressiveness, comparison to Organon's YAML specification format. This is the single highest-value investigation for Session 3.

**Priority 2 (BLOCKING): Verify ABC schema status via active search.**
Search: (a) authors' GitHub profiles, (b) institutional pages of the authors, (c) Google Scholar supplemental materials link. If found: pull the schema and compare directly to Organon's frontmatter format and organon file structure. If not found after three targeted searches: document as "not publicly located as of [date]" with search record.

**Priority 3 (SIGNIFICANT): Read Agent Contracts Resource-Bounded (arXiv 2601.08815).**
Assess whether this is competing prior art for Organon's behavioral specification direction. Extract: contract schema format, enforcement mechanism, scope (session vs. project). If it covers behavioral methodology contracts, update the "closest prior art" assessment.

**Priority 4 (SIGNIFICANT): Research Design by Contract adoption barriers.**
Searches: "Design by Contract adoption barriers mainstream", "Bertrand Meyer Eiffel contract programming failure", "JML Spec# adoption why failed". Goal: identify the 3–5 documented adoption barriers and map each to the agent methodology context. Determines whether Organon faces structural adoption headwinds from the same forces that constrained DbC.

**Priority 5 (SIGNIFICANT): Read OpenAI Agents SDK lifecycle hooks and Temporal.io workflow model.**
These can be parallelized. Extract from OpenAI SDK: what behavioral events are hookable, whether hooks enforce ordering invariants. Extract from Temporal.io: phase sequencing model, precondition support, violation handling. Map both to Organon's gate specification design.

Target delta after Session 3: **0.75** (AC2 resolved via PCAS, AC1 advanced via ABC schema status, DbC history incorporated, production prior art characterized).
