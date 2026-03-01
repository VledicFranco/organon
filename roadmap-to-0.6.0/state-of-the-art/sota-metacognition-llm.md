---
type: sota-report
scope: state-of-the-art
name: sota-metacognition-llm
version: 0.1.0
summary: >
  Session 1 SOTA report on metacognition in LLMs. Covers: genuine vs. simulated
  metacognitive capability, conditions for self-correction success/failure (Kamoi et al.
  taxonomy), process reward model generalization beyond math (VersaPRM 14 domains),
  and external metacognitive architectures. Directly informs Organon's enforcement
  layer design. Goal-reaching delta: 0.73 (blocking challenges resolved in session).
token_estimate: 3800
relationships:
  - type: informs
    target: ../metacognition-foundations.md
  - type: informs
    target: ../metacognition-goal-loops.md
  - type: informs
    target: ../metacognitive-quality-gates.md
  - type: sibling
    target: research-plan.md
---

# State of the Art: Metacognition in LLMs

> Research date: 2026-03-01
> Session 1 of estimated 2–3
> Informs: metacognition-foundations.md, metacognition-goal-loops.md, metacognitive-quality-gates.md
> Goal-reaching delta: 0.73 / 1.0

---

## Delta Assessment Against Acceptance Criteria

| Acceptance Criterion | Status | Notes |
|---|---|---|
| 1. Genuine metacognitive capability vs. simulated pattern matching | Partial | Monitoring-control gap documented; genuine/simulated distinction unresolved. arxiv 2505.13763 is the highest-value unread paper for this criterion. |
| 2. Conditions when self-correction works vs. fails | Solid | Kamoi et al. TACL 2024 taxonomy reviewed: structurally verifiable tasks work; reasoning/planning/QA fail. Organon gate mapping complete. |
| 3. State of PRMs for non-mathematical domains | Solid | VersaPRM (ICML 2025 Poster) reviewed: 14 domains, Law +7.93%, Chemistry +7.46%. Oracle requirement documented. Gap: procedure-following vs. knowledge QA. |
| 4. External metacognition architectures and measured effectiveness | Moderate | SOFAI-LM quantified (graph coloring 42% vs. 2%; code debugging 70–73% vs. 37–40%). Decidability boundary confirmed. arxiv 2508.17959 is the same paper. |
| 5. Implications for Organon's external enforcement layer | Solid | Kamoi taxonomy + VersaPRM oracle requirement + SOFAI-LM decidability boundary gives coherent gate design picture. |

Blocking challenges from the Critic were resolved during the Architect re-assessment phase. Remaining gaps are significant but not blocking.

---

## Summary

LLMs exhibit a documented monitoring-control gap: they can express appropriate uncertainty but systematically proceed as if confident anyway. This is not a bug in individual models — it appears to be a structural pattern in how current training produces metacognitive-seeming behavior. Intrinsic self-correction (without external signals) fails on reasoning benchmarks; extrinsic self-correction (with oracle feedback) works. Process reward models show promise for step-level supervision but their generalization outside mathematics is contested. External metacognitive architectures (separating a fast-execution from a deliberative monitor) outperform intrinsic approaches on tasks with decidable correctness criteria — but the boundary condition for "decidable" is precisely where Organon's methodology enforcement work lives. The practical implication for Organon is that its external enforcement layer is architecturally sound relative to the literature, but the mechanism for evaluating non-binary, non-decidable protocol compliance remains an open design problem.

---

## Key Findings

### Finding 1: The Monitoring-Control Gap Is Systematic, Not Random

**Finding:** LRMs (large reasoning models: o1-style, R1-style) appropriately express uncertainty in monitoring — they hedge, flag difficulty, note ambiguity — but then proceed with high-confidence outputs anyway. The monitoring signal is present; the control signal is not triggered by it. This is not occasional inconsistency; it is a systematic pattern across mathematical reasoning tasks.

**Evidence:** OpenReview JGG9EdHyZc, "Towards Understanding Metacognition in Large Reasoning Models" (2024–2025). Tested on GSM8K, MATH, AIME. Early evidence — one paper, controlled mathematical domains only. Evidence quality: preliminary, single-source.

**Implication for Organon:** This is precisely why external metacognitive enforcement is necessary. Relying on the model to use its own uncertainty signals as control signals does not work. Organon's verification gates externalize the control loop — they act on the monitoring signal when the model will not. The monitoring-control gap is the structural justification for Organon's gate-based enforcement.

---

### Finding 2: Intrinsic Self-Correction Fails; Extrinsic Self-Correction Works

**Finding:** LLMs cannot reliably self-correct reasoning errors through intrinsic reflection (prompting the model to review and revise its own output with no external signal). Performance on reasoning benchmarks does not improve — and sometimes degrades — under self-correction. In contrast, extrinsic self-correction (correction with oracle feedback or external tool signals) does work. The key distinction is whether the correction process receives a genuine external signal or only the model's own restatement of its output.

**Evidence:** Huang et al. ICLR 2024, "LLMs Cannot Self-Correct Reasoning Yet." Three reasoning benchmarks, controlled experimental design. Challenges the framing of Self-Refine and Reflexion as intrinsic self-correction methods. Evidence quality: established, widely cited, controlled.

**Conditions taxonomy (Kamoi et al., TACL 2024):** Provides the precise conditions under which self-correction works vs. fails:
- **Works:** Structurally verifiable tasks (format constraints, Game of 24, constrained generation — where correctness is checkable without external information); decomposable response tasks (verifying list items independently); external feedback tasks (code interpreters, search engines, formal verifiers).
- **Fails:** Arithmetic reasoning, knowledge QA, code generation (text-to-code), planning, logic puzzles — all fail with intrinsic self-correction.
- Survey conclusion: "no prior work demonstrates successful self-correction with feedback from prompted LLMs, except for studies in tasks that are exceptionally suited."

**Organon gate mapping:** Schema/frontmatter validation checks fall in the "structurally verifiable" category — extrinsic correction (organon verify) works, and intrinsic might also work for purely structural checks. Semantic compliance checks (does this RFC address the stated problem?) fall in the reasoning/planning failure category — external enforcement is mandatory, not optional.

**Implication for Organon:** `organon verify` gates must be classified by type: structural gates (schema, frontmatter completeness, referential integrity) vs. semantic gates (protocol step quality, RFC adequacy). Structural gates are in the success zone for extrinsic correction. Semantic gates require structural proxies (required-field presence, invariant satisfaction) — LLM-as-judge on semantic quality is in the failure zone.

**Note on SCoRe (ICLR 2025 Oral):** +15.6% on MATH, +9.1% on HumanEval through multi-turn RL. This is training-time, not inference-time — current production models without SCoRe-style fine-tuning still cannot intrinsically self-correct. The Kamoi et al. / Huang et al. inference-time findings stand for current models.

---

### Finding 3: LLM Self-Reports of Confidence Calibrate Magnitude but Misattribute Source

**Finding:** LLMs calibrate the *strength* of their uncertainty reasonably — they express more uncertainty on harder problems — but systematically misattribute the *source* of that uncertainty. They cannot reliably distinguish "I'm uncertain because this domain is underrepresented in my training" from "I'm uncertain because this specific reasoning step is difficult." The introspection is partially functional but structurally incomplete.

**Evidence:** "Feeling the Strength but Not the Source: Partial Introspection in LLMs" (arxiv 2512.12411). Also: Nature Communications MetaMedQA study showing LLMs confidently report competence where they are systematically wrong. Evidence quality: early evidence for the source-misattribution claim; the general finding that self-reports are unreliable is more established.

**Note on Anthropic 20% figure:** The "LLMs accurately introspect 20% of the time" figure circulated from an Anthropic paper refers to concept-injection detection (whether Claude Opus could detect artificially injected activations), not general introspective accuracy. It is not representative of everyday introspection capability. Do not cite it as a general introspection accuracy figure.

**Implication for Organon:** Epistemic status fields in Organon's schema should be set by evidence (test coverage, empirical validation, explicit human review) — not by asking the LLM to self-report confidence. The LLM's expressed confidence is a weak signal for `evidence_basis` assignment. The `epistemic_status` field requires external validation to be meaningful.

---

### Finding 4: External S1/S2 Architectures Outperform Standalone LLMs on Decidable Tasks

**Finding:** Architectures that separate fast-pattern execution (S1-equivalent) from deliberative monitoring (S2-equivalent) as distinct external components — with routing logic between them — outperform single-LLM approaches on tasks where correctness is decidable. The SOFAI-LM architecture (AAAI 2026) demonstrated this on graph coloring and code debugging. A more recent study (arxiv 2508.17959, Aug 2025) evaluates external metacognition across multiple domains vs. standalone LRMs with broader scope.

**Evidence:** SOFAI-LM (AAAI 2026 reproducibility lab — not novel results paper). Evidence quality: early, reproducibility format, narrow task scope (decidable correctness only). arxiv 2508.17959 not yet reviewed — Critic flagged as more relevant.

**Implication for Organon:** The external S1/S2 pattern is validated as superior for tasks where the monitor has a ground-truth evaluation function. The design constraint is: Organon's metacognitive gates need an evaluation function for each gate. Where the evaluation function is structural (schema check, frontmatter completeness, referential integrity), Organon already has this. Where evaluation requires semantic judgment (does this RFC actually address the stated problem?), the evaluation function is not yet defined. The architectural pattern is sound; the evaluation function design is the open problem.

**Caveat:** SOFAI-LM's monitor depends on a "domain-specific evaluation module" — the architecture is only as good as the evaluation module. The paper does not provide a general solution; it requires task-specific engineering per domain. This matches Organon's situation exactly: the gates must be domain-specific.

---

### Finding 5: Process-Level Supervision Outperforms Outcome-Only Supervision

**Finding:** Supervising intermediate reasoning steps (process reward models) produces better results than supervising only final outcomes (outcome reward models), particularly on multi-step tasks. PRM generalization beyond mathematics is now confirmed with concrete numbers.

**Evidence — foundational:** Lightman et al. "Let's Verify Step by Step" (OpenAI, 2023/2024) — established, widely cited. Mathematical domains only.

**Evidence — generalization (VersaPRM, ICML 2025 Poster):** Multi-domain process reward model tested on 14 MMLU-Pro domains. Results over majority voting baseline:
- Law: +7.93% (vs. +0.35% for math-specialized Qwen-2.5-Math-PRM)
- Chemistry: +7.46%, Biology: +4.62%, Philosophy: +4.30%

Generalization mechanism: domain-agnostic pipeline — CoT generation with Llama 8B, auto-labeling with Llama 70B using a single unified prompt and ground-truth answers (~500 questions per domain, 16 CoTs per question). **Critical constraint:** requires ground-truth correct answers as the labeling oracle. Not zero-shot transfer — requires per-domain question corpus with known answers.

**Gap:** VersaPRM demonstrates PRM generalization to knowledge QA domains. Whether the same approach applies to procedure-following or protocol compliance tasks remains untested. The gap between "law knowledge QA" and "did the agent follow protocol step 3 correctly?" is significant. A procedure compliance PRM would need a corpus of labeled protocol-execution traces — tractable but non-trivial.

**Implication for Organon:** Per-stage quality gates (one gate per lifecycle stage) are validated by PRM literature. Gate design aligned with research consensus. For semantic gate calibration, VersaPRM's auto-labeling pipeline is a candidate methodology — but requires building a labeled dataset of protocol execution traces first.

---

## Related Work (Annotated)

### Metacognitive Inconsistency in Reasoning Models

**"Towards Understanding Metacognition in Large Reasoning Models"** (2024–2025) — Anonymous (under review) — openreview.net/forum?id=JGG9EdHyZc
Systematic study of monitoring-control dissociation in LRMs. Models hedge appropriately on hard problems but do not use uncertainty to regulate output confidence. Proposed remediations: prompt-driven control and supervised fine-tuning. Core finding holds; generalization beyond mathematical benchmarks unknown.
Tags: #monitoring-control-gap #LRM #metacognition #priority

---

**"LLMs Cannot Self-Correct Reasoning Yet"** — Huang et al. — ICLR 2024
Controlled study showing intrinsic self-correction (no external signal) does not improve performance on reasoning benchmarks. Establishes the intrinsic/extrinsic distinction as the key variable. Directly challenges Self-Refine and Reflexion as intrinsic correction methods. Most cited finding in this SOTA area.
Tags: #self-correction #intrinsic #extrinsic #established #priority

---

**"Training Language Models to Self-Correct via Reinforcement Learning" (SCoRe)** — ICLR 2025 Oral
+15.6% on MATH, +9.1% on HumanEval via multi-turn RL with self-generated correction data. Training-time (not inference-time) result. Does not contradict Huang et al. at inference; shows self-correction can be trained in. Implication: future models trained with SCoRe-style RL may have genuine self-correction capability, not pattern-matching. Organon should monitor this.
Tags: #self-correction #training #RL #contested #watch

---

### Process Reward Models

**"Let's Verify Step by Step"** — Lightman et al. — OpenAI, 2023/2024
Seminal PRM paper. Process supervision (step-level reward) outperforms outcome supervision on GSM8K and MATH. Establishes the per-stage supervision rationale. Mathematical domains only.
Tags: #PRM #process-supervision #established

---

**VersaPRM** — ICML 2025 Oral
Multi-domain process reward model. 7.9% improvement on MMLU-Pro Law over majority voting. If the findings hold on review, this directly addresses whether PRMs generalize beyond mathematics. Not yet reviewed — flagged as BLOCKING by Critic.
Tags: #PRM #generalization #non-math #blocking-open-question

---

**"Enhancing LLM Agents with Automated Process Supervision"** — ACL/EMNLP 2025 — aclanthology.org/2025.emnlp-main.506.pdf
Process-level supervision outperforms outcome-only supervision for complex agentic tasks. Extends PRM rationale to agent pipelines. Directly relevant to Organon's per-stage gate design.
Tags: #PRM #agentic #process-supervision #priority

---

### Self-Correction Architectures

**Self-Refine** — Madaan et al., 2023
Iterative self-improvement via self-generated feedback. Claimed improvements, but Huang et al. 2024 analysis suggests gains come from task-specific formatting cues, not genuine reasoning correction. Treat results with caution.
Tags: #self-correction #self-refine #contested

---

**Reflexion** — Shinn et al., 2023
Verbal reinforcement via episodic reflection memory. Stores past failure critiques and retrieves them to guide future attempts. The memory component — not the reflection — is likely the source of improvement. Maps to Organon's observations/ directory pattern.
Tags: #self-correction #reflexion #episodic-memory

---

**CRITIC** — Gou et al., 2023
Self-correction via external tool feedback (code executors, search APIs, calculators). Works because it is genuinely extrinsic — the tool provides ground-truth signal. Supports Huang et al.'s intrinsic/extrinsic distinction.
Tags: #self-correction #extrinsic #tool-feedback #established

---

### LLM Introspection and Calibration

**"Feeling the Strength but Not the Source: Partial Introspection in LLMs"** — arxiv 2512.12411
LLMs calibrate uncertainty magnitude but misattribute its source. Key finding for epistemic status design: expressed confidence level is weakly useful, but expressed reason for uncertainty is not reliable.
Tags: #introspection #calibration #epistemic-status

---

**Nature Communications MetaMedQA study**
LLMs report competence in medical QA where they are systematically wrong. Confidence-accuracy gap is domain-dependent and can be severe. Direct evidence for not relying on self-reported epistemic status.
Tags: #calibration #overconfidence #domain-expertise

---

### External Metacognitive Architectures

**SOFAI-LM** — AAAI 2026 (reproducibility lab)
External S1/S2 monitor-controller architecture. Routing low-confidence cases through deliberative monitor. Tested on graph coloring and code debugging. Results are reproduced from prior work, not novel. The domain-specific evaluation module requirement is the key design constraint.
Tags: #external-metacognition #S1-S2 #SOFAI #early-evidence

---

**"Language Models Coupled with Metacognition Can Outperform Reasoning Models"** — arxiv 2508.17959 (Aug 2025)
Evaluates external metacognition vs. standalone LRMs across multiple domains. Flagged by Critic as more relevant than SOFAI-LM due to broader domain coverage. Not yet reviewed.
Tags: #external-metacognition #multi-domain #priority-next-session

---

**"Empowering Large Reasoning Models with Metacognition" (Meta-R1)** — arxiv 2508.17291 (Aug 2025)
Attempts to train explicit metacognitive capability into LRMs. Directly addresses whether metacognition can be internalized vs. requiring external scaffolding. Not yet reviewed.
Tags: #metacognition #training #LRM #priority-next-session

---

### Apple "Illusion of Thinking" Paper

**"The Illusion of Thinking"** — Apple, 2025
Shows reasoning model chain-of-thought collapses under complexity — extended thinking does not maintain quality on sufficiently complex problems. CoT faithfulness concerns: the visible reasoning may not reflect actual computation. Supporting evidence for the monitoring-control gap.
Tags: #reasoning-models #CoT-faithfulness #illusion #supporting

---

### Position Papers

**"Position: Truly Self-Improving Agents Require Intrinsic Metacognitive Learning"** — openreview.net/forum?id=4KhDd0Ozqe
Argues that genuine self-improvement requires metacognitive knowledge, planning, and evaluation as distinct internal components. Distinguishes intrinsic from extrinsic. Maps to Organon's Gate 0 (knowledge), Gate 1 (planning), Gate 3 (evaluation) structure.
Tags: #metacognition #position #self-improvement

---

## Similar Projects and Directions

**Reflexion / Self-RAG:** Both attempt to add metacognitive loops at inference time without retraining. The pattern — generate, reflect, retrieve/refine — is architecturally similar to Organon's generate/verify/correct cycle, but applied within a single model rather than via external enforcement. Results are mixed because the reflection is intrinsic.

**EDDOps (Evaluation-Driven Development and Operations):** arxiv 2411.13768v3 — evaluation embedded throughout the development lifecycle, not confined to QA phases. Direct parallel to Organon's per-stage gate structure. Deserves full review in a future session.

**Process reward model training pipelines:** OpenAI, DeepMind, and academic groups building PRMs for RLHF. The infrastructure for step-level supervision is maturing rapidly. Relevant to Organon's experimentation system for calibrating gate thresholds.

**Constitutional AI / RLAIF:** Anthropic's approach uses a document of principles to guide model self-critique. Structurally analogous to Organon's ETHOS-driven verification — the principles are the evaluation criteria. The difference: Constitutional AI bakes the evaluation into model weights; Organon applies it externally at inference time.

---

## Industry Directions

**OpenAI o-series:** Internal chain-of-thought as implicit metacognition. The visible reasoning trace is not guaranteed to reflect actual computation (CoT faithfulness problem). Represents the "internalize everything" bet — metacognition inside the model weights, no external scaffolding required. The Apple "Illusion of Thinking" paper is evidence this bet has limits under complexity.

**Anthropic extended thinking:** Similar internal approach. The introspection paper (concept injection experiment) suggests even Claude Opus cannot reliably access its own activation states. Extended thinking may improve output without providing genuine introspective access.

**Google DeepMind:** AlphaProof and AlphaGeometry combine ML with formal verification — using a proof assistant as the external evaluator. This is the strongest existing instance of the "extrinsic correctness signal" pattern at scale. Domain is mathematics; generalizing the pattern is the research challenge.

**The industry trend:** All major labs are investing in reasoning model capability (o3, R1, Gemini thinking) — internal metacognition. Few are investing in external metacognitive scaffolding for non-research production systems. Organon is working in the opposite direction from the current industry bet, which makes it either ahead or orthogonal rather than redundant.

---

## What Organon Can Build On

**The intrinsic/extrinsic distinction (Huang et al.):** Organon's gate architecture is already correctly positioned as extrinsic. The design implication — gates must always evaluate against an external criterion, never ask the model to evaluate its own output — is actionable now. No additional research needed to act on this.

**Process supervision rationale (Lightman et al., EMNLP 2025):** The per-stage gate design in metacognitive-quality-gates.md is validated. Implement per-stage gates rather than end-only verification. This is actionable without waiting for Session 2.

**The monitoring-control gap (JGG9EdHyZc):** Justifies building verification gates that act on uncertainty signals the model produces but ignores. When the LLM flags uncertainty, Organon's routing can act on that signal explicitly (route to deliberative mode, require RFC before proceeding). This is the SAS activation pattern from metacognition-goal-loops.md.

**CRITIC pattern:** External tool feedback as the correction signal. Organon's `organon verify` tool is already this pattern. The design implication is to make the tool output richly structured (structured error objects, not just pass/fail) so the correction step receives a precise signal — as designed in metacognition-foundations.md's GateResult type.

**Reflexion's observation memory:** The episodic reflection memory pattern maps to Organon's `organon/observations/` directory. The pattern works; the schema needs formalization. RFC 005 is the right direction.

---

## What Appears Novel to Organon

**Conservative assessment — novelty claims require more prior art search.**

The following aspects have not been found in the surveyed literature; they may be novel or may appear in unsearched papers:

1. **Epistemic status as a first-class schema field on individual definitions.** The pattern of tagging individual protocol steps, definitions, and invariants with `epistemic_status` / `evidence_basis` / `confidence` and routing based on those tags does not appear in the surveyed PRM, SOFAI-LM, or self-correction literature. The closest analog is calibration research (arxiv 2512.12411), which measures but does not prescribe the schema. This may be genuinely novel to Organon, but prior art search in knowledge base and ontology literature is required before claiming it.

2. **Double-loop escalation logic in verification tooling.** The Argyris double-loop pattern (from metacognition-goal-loops.md) implemented as explicit routing in an MCP server — where repeated single-loop failures trigger RFC revision rather than re-execution — has no direct prior art found. This is a methodological design, not a model architecture, so the comparison space is different from most surveyed literature.

3. **Decidability-aware gate design.** The explicit taxonomy of gates by whether their evaluation function is decidable vs. requires judgment — and designing different enforcement mechanisms accordingly — has not been found in the surveyed literature. It may exist in formal methods literature (not yet surveyed in this area).

**Do not claim novelty on:** External S1/S2 architectures (SOFAI-LM, arxiv 2508.17959), process-level supervision (Lightman et al.), observation/reflection memory (Reflexion), per-stage lifecycle gates (EDDOps). These have direct prior art.

---

## Open Questions

### Q1: Does trained self-correction (SCoRe-style) change the intrinsic/extrinsic distinction for future models?

**Why it matters:** If SCoRe-style RL produces models with genuine self-correction capability (not pattern-matching), then the Huang et al. finding becomes historically true but not permanently true. Organon should know whether it is building infrastructure for a permanent architectural gap or a transitional one.

**What would answer it:** Review SCoRe (ICLR 2025) in detail. Test whether trained self-correction works on non-mathematical tasks (code quality, protocol conformance) or is narrow to mathematical domains.

---

### Q2: Can PRMs generalize to protocol compliance evaluation?

**Why it matters:** If VersaPRM (ICML 2025 Oral) shows meaningful PRM generalization to MMLU-Pro Law, the question is whether the same approach can produce a PRM for "protocol step completion" — evaluating whether an LLM followed a methodology step correctly. This would be the evaluation function needed for Organon's semantic gates.

**What would answer it:** Read VersaPRM in Session 2. Then assess: does the generalization mechanism require labeled training data per domain? If so, what would a labeled dataset for protocol compliance look like?

---

### Q3: At what decidability threshold does external metacognition benefit degrade?

**Why it matters:** SOFAI-LM and similar architectures are validated on decidable tasks. Organon's gates span a spectrum from fully decidable (frontmatter schema check) to judgment-intensive (does this RFC address the stated problem?). Knowing where the benefit degrades would let Organon invest in the right gate types.

**What would answer it:** Review arxiv 2508.17959 with this specific question: do the multi-domain results include tasks without clear ground truth? What evidence quality is reported for semantic vs. structural evaluation?

---

### Q4: Is there prior art for epistemic status tagging at the individual definition level?

**Why it matters:** If knowledge representation literature (OWL, RDF named graphs, provenance ontologies) already has established patterns for this, Organon should adopt them rather than invent a parallel system.

**What would answer it:** Cross-reference with Area 1 (Formal Methods) when that SOTA is complete. Specifically: OWL-Prov, nanopublications, and RDF named graph provenance patterns.

---

## Critic's Unresolved Challenges

### RESOLVED: Kamoi et al. TACL 2024 — Conditions taxonomy for self-correction

Reviewed during Architect re-assessment phase. Taxonomy integrated into Finding 2. Acceptance Criterion 2 substantially resolved (score: 0.80). See Finding 2 for full taxonomy and Organon gate mapping.

---

### RESOLVED: VersaPRM (ICML 2025 Poster) — Non-math PRM generalization

Reviewed during Architect re-assessment phase. Results integrated into Finding 5. Acceptance Criterion 3 substantially resolved (score: 0.75). Key finding: oracle requirement (ground-truth answers needed for auto-labeling). See Finding 5 for full results and the procedure-following gap.

**Correction:** VersaPRM is ICML 2025 Poster, not Oral as previously noted.

---

### SIGNIFICANT — SCoRe (ICLR 2025 Oral) — Training self-correction into models

+15.6% on MATH via multi-turn RL. Training-time result, math and code domains only. No evidence of generalization to non-mathematical tasks. The training/inference distinction is maintained in Finding 2. Organon's inference-time external gates remain necessary for current production models.

**Follow-up search:** Does SCoRe-style RL generalize to non-mathematical tasks (procedure-following, protocol compliance)? If yes, future models may internalize some portion of what Organon currently externalizes. Search: "SCoRe self-correction generalization non-math domain 2025 2026".

---

### SIGNIFICANT — SOFAI-LM / arxiv 2508.17959 scope

Confirmed that arxiv 2508.17959 and SOFAI-LM refer to the same paper. The Critic's concern that 2508.17959 was a separate broader study was not confirmed. SOFAI-LM's decidability limitation stands — both tested domains (graph coloring, code debugging) have decidable ground truth. All external metacognition architectures tested to date require decidable evaluation functions.

**Open question:** Is there any external metacognition research evaluating on partially-decidable tasks? Search: "external metacognition evaluation non-verifiable tasks judgment-intensive LLM" and "EDDOps arxiv 2411.13768 evaluation driven development".

---

### SIGNIFICANT — AC1: Genuine vs. simulated metacognition

No progress in this session. arxiv 2505.13763 ("Language Models Are Capable of Metacognitive Monitoring and Control of Their Internal Activations") is the highest-value unread paper for AC1 — it tests whether LLMs can monitor and control their own activations (mechanistic, not behavioral proxy). Key question: does activation-level monitoring integrate with behavioral control, or does it reproduce the monitoring-control gap at a lower abstraction level?

---

## Session 2 Scope

**Architect stop/continue decision: Continue.** Delta = 0.73. Below 0.85 threshold. No blocking challenges remain, but three significant questions require resolution for the document to be complete.

Priority reads for Session 2 (in order):

1. **arxiv 2505.13763** — "Language Models Are Capable of Metacognitive Monitoring and Control of Their Internal Activations" — directly addresses AC1 (genuine vs. simulated). Key question: does demonstrated activation-level monitoring integrate with behavioral control, or reproduce the monitoring-control gap at lower abstraction?

2. **VersaPRM procedure-following gap** — Does PRM generalization extend to procedure-following / protocol compliance tasks (not just knowledge QA)? Search: "process reward model instruction following agentic task 2025" and assess whether VersaPRM's auto-labeling mechanism could work with a policy document as the labeling criterion instead of ground-truth answers.

3. **Decidability boundary for partially-decidable tasks** — Neither SOFAI-LM nor Kamoi et al. addresses tasks mixing structural + semantic criteria. Search: "constitutional AI self-critique effectiveness evaluation 2025", "EDDOps arxiv 2411.13768", "LLM evaluation mixed criteria structural semantic judgment".

Target delta after Session 2: **0.85–0.88** (AC1 resolved, procedure-following gap addressed, decidability boundary documented).
