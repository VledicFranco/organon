# State of the Art: Multi-Agent Systems & Cognitive Architectures

> Research date: 2026-03-01
> Session 1 of estimated 3–4
> Informs: metacognition-cognitive-team.md, mcp-query-api.md
> Goal-reaching delta: 0.57 / 1.0

---

## Summary

All major multi-agent LLM frameworks (MetaGPT, AutoGen, ChatDev, CrewAI) assign agents by professional task role — software engineer, QA, PM — not by cognitive function. No existing framework makes the cognitive-function distinction Organon's team architecture proposes. The closest theoretical grounding comes from CoALA (2023), which maps classical cognitive architecture components (ACT-R, SOAR vocabulary) onto single LLM agents, but does not address multi-agent role differentiation. Persona and role prompts appear to have no positive effect on factual accuracy and can actively harm reasoning performance (up to 80% degradation in some configurations), though this finding applies to knowledge-domain personas ("you are an expert in X") — it has not been tested against behavioral-constraint personas ("your cognitive function is inhibitory control"). The communication topology findings from EMNLP 2024 show sparse topologies outperform fully-connected in multi-agent debate settings, but this does not transfer directly to Organon's sequential handoff pipeline; the Critic raised this as a blocking challenge that remains unresolved.

---

## Key Findings

**Finding 1: All major frameworks use professional role assignment, not cognitive function assignment.**
- **Finding:** MetaGPT, AutoGen, ChatDev, and CrewAI all assign agents roles drawn from professional human workflows (product manager, software engineer, QA, designer). None assign roles based on cognitive function (working memory, inhibitory control, episodic retrieval, executive planning). The MetaGPT ablation study demonstrates that removing role specialization degrades performance, but this establishes that role differentiation matters — it does not establish which role type (professional vs. cognitive function) is superior.
- **Evidence:** MetaGPT (Hong et al., 2023), AutoGen (Wu et al., 2023, Microsoft), ChatDev (Qian et al., 2023). Early evidence from ablations; no controlled comparison between role-type paradigms exists.
- **Implication for Organon:** Organon's cognitive-function assignment model has no direct prior art in the multi-agent LLM literature. This is either a genuinely novel architectural direction or an insufficiently explored one. No paper has run a head-to-head comparison. Before claiming superiority, a controlled experiment comparing cognitive-function teams to professional-role teams on the same benchmark is required.

**Finding 2: Persona and role prompts do not reliably improve — and often harm — agent performance.**
- **Finding:** EMNLP 2024 (large-scale evaluation) found persona prompts ("you are an expert in X") show no significant positive effect on factual recall and are sometimes negative. ACL 2024 ("Quantifying the Persona Effect in LLM Simulations") found performance drops in up to 80% of configurations, with some groups experiencing 70%+ degradation on reasoning tasks. This is established, not preliminary.
- **Evidence:** Two independent peer-reviewed papers at top venues (EMNLP 2024, ACL 2024). Established finding, though both papers test knowledge-domain personas. The Critic correctly flags that behavioral-constraint personas ("your cognitive function is inhibitory control — challenge everything") are structurally different and have not been empirically tested. ORPP (EMNLP 2025) explores iterative role-playing prompt optimization, suggesting the community recognizes this gap.
- **Implication for Organon:** Organon's Be-level identity model is not validated by current research. The EMNLP/ACL findings are a threat to the persona-based team design. The design bet is that cognitive-function personas — which constrain behavior rather than claim knowledge — will behave differently than knowledge-domain personas. This must be treated as an open hypothesis, not established principle, until tested. Do not cite the negative persona results as irrelevant without evidence. Design the cognitive team prompts as behavioral constraints, not knowledge claims, and plan an empirical validation.

**Finding 3: CoALA maps cognitive architecture vocabulary to LLM agents — but only for single agents.**
- **Finding:** CoALA (Sumers et al., 2023) provides a principled framework mapping classical cognitive architecture components (episodic memory, semantic memory, procedural memory, working memory, decision procedures) onto single LLM agents. It cites SOAR, ACT-R, ReAct, and Reflexion as prior work. It explicitly addresses single-agent architectures only and does not address how cognitive components should be distributed across multiple agents.
- **Evidence:** CoALA is a survey/framework paper, not an empirical study. No benchmarks test cognitive vs. non-cognitive agent designs. The mapping to multi-agent contexts is theoretical extrapolation, not validated by CoALA itself.
- **Implication for Organon:** CoALA provides vocabulary (episodic/semantic/procedural/working memory) that Organon's architecture can legitimately reference. However, applying CoALA's single-agent component model to a multi-agent role-differentiation design is an architectural leap without CoALA's backing. Organon should cite CoALA for the vocabulary while acknowledging the single-agent scope limitation explicitly.

**Finding 4: Sparse communication topology beats fully-connected in multi-agent debate — but this does not apply to sequential pipelines.**
- **Finding:** "Improving Multi-Agent Debate with Sparse Communication Topology" (Li et al., EMNLP 2024 Findings) shows sparse agent communication topologies outperform fully-connected ones on multi-agent debate benchmarks. The explanation: deliberate structure reduces noise and prevents low-quality arguments from propagating uniformly.
- **Evidence:** Peer-reviewed, EMNLP 2024. The Critic raised a blocking challenge: this finding is specific to multi-agent debate (simultaneous agents, sparse reading graph). Organon's team is a sequential handoff chain. A separate Google Research study (2026, 180 agent configurations, unverified citation) reportedly found sequential coordination degrades performance on sequential reasoning tasks by 39–70%. The ACL 2025 paper "Understanding the Information Propagation Effects of Communication Topologies in LLM-based Multi-Agent Systems" (arxiv 2505.23352) found moderately sparse topologies optimized for error propagation suppression outperform both dense and fully-sparse — but this was also not specifically about sequential handoff pipelines.
- **Implication for Organon:** The topology findings do not validate Organon's sequential handoff design. The relevant question — what topology works best for sequential cognitive pipelines — is unanswered in the current literature. This is a blocking open question for the cognitive team architecture. Do not use the Li et al. EMNLP result as evidence for Organon's sequential design.

**Finding 5: No existing system implements Society of Mind-style cognitive-function multi-agent teams — with one partial exception.**
- **Finding:** The Sibyl framework implements a multi-agent jury design inspired loosely by Society of Mind, using multiple agents with different "perspectives" to reach consensus. It is the closest existing implementation to a cognitive-architecture-based multi-agent team. However, Sibyl uses perspective-based differentiation (different viewpoints on the same problem) rather than cognitive-function differentiation (different cognitive roles in a pipeline). Dynamic Role Assignment (2025, arxiv 2601.17152) assigns roles dynamically based on task context rather than statically — a distinct but related direction.
- **Evidence:** Sibyl: research paper, evidence quality uncertain (Critic flagged it as in the Scout's "What Was Missed" section). Dynamic Role Assignment: arxiv preprint 2601.17152, early evidence.
- **Implication for Organon:** Sibyl is the most direct prior art for multi-agent cognitive architecture design. It should be read and compared explicitly. The gap between Sibyl's perspective-based design and Organon's cognitive-function design is potentially the most important distinction to articulate.

---

## Related Work (Annotated)

### Multi-Agent Frameworks

- **MetaGPT: Meta Programming for Multi-Agent Collaborative Framework** (2023) — Hong et al. — https://arxiv.org/abs/2308.00352
  Assigns agents professional software development roles (PM, architect, engineer, QA). Ablation study confirms role specialization improves performance on coding benchmarks. Does not explore cognitive function assignment. The ablation is the most useful piece for Organon: role differentiation matters, but the type of role is untested.
  Tags: #multi-agent #role-assignment #professional-roles #ablation

- **AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation** (2023) — Wu et al., Microsoft — https://arxiv.org/abs/2308.08155
  Conversable agent framework with group chat and nested conversations. Role assignment is task-based. Primarily an infrastructure framework, not a cognitive architecture. Useful for understanding what Organon's MCP layer needs to interface with.
  Tags: #multi-agent #framework #microsoft #infrastructure

- **ChatDev: Communicative Agents for Software Development** (2023) — Qian et al. — https://arxiv.org/abs/2307.07924
  Models a software company as a multi-agent society. Agents take professional roles (CEO, CTO, programmer, tester). Most interesting for its role conflict resolution analysis. Professional role conflicts are a documented problem; whether cognitive function assignment avoids them is untested.
  Tags: #multi-agent #role-assignment #software-development #role-conflict

- **CrewAI** (2024) — CrewAI Inc. — https://github.com/joaomdmoura/crewAI
  Production-grade framework for role-based multi-agent tasks. Task delegation, agent memory, tool access. Uses professional/task role assignment. Widely adopted in production contexts.
  Tags: #multi-agent #framework #production #role-based

### Cognitive Architectures

- **CoALA: Cognitive Architectures for Language Agents** (2023) — Sumers et al. — https://arxiv.org/abs/2309.02427
  Comprehensive survey mapping classical cognitive architecture components (memory types, action spaces, decision procedures) onto LLM agents. Covers SOAR, ACT-R, ReAct, Reflexion. Single-agent scope only. Provides the authoritative vocabulary for cognitive architecture thinking in LLM contexts.
  Tags: #cognitive-architecture #single-agent #survey #vocabulary #ACT-R #SOAR

- **Improving Multi-Agent Debate with Sparse Communication Topology** (2024) — Li et al., EMNLP 2024 Findings — https://arxiv.org/abs/2406.11776 (verify URL)
  Demonstrates sparse reading graphs outperform fully-connected topologies in multi-agent debate settings. Key mechanism: structured information restriction prevents low-quality arguments from uniformly influencing all agents. Applies to debate (simultaneous agents, same problem). Does not apply to sequential handoff pipelines.
  Tags: #topology #communication #debate #sparse #EMNLP-2024

- **Sibyl: Simple Yet Effective Agent Framework for Complex Real-World Reasoning** (2024) — (authors TBD) — (URL TBD — Critic flagged provenance as uncertain)
  Multi-agent jury framework implementing Society of Mind-inspired design. Multiple agents with different perspectives collaborate on reasoning tasks. Closest prior art to Organon's multi-agent cognitive architecture. Perspective-based differentiation vs. cognitive-function differentiation is the key gap to investigate.
  Tags: #society-of-mind #multi-agent #jury #perspective #prior-art

- **Dynamic Role Assignment for Multi-Agent LLM Systems** (2025) — arxiv 2601.17152 (verify) — https://arxiv.org/abs/2601.17152
  Assigns roles dynamically to agents based on task context rather than statically at initialization. Contrasts with Organon's fixed cognitive function assignment. Relevant for the question: should cognitive roles be static (Be-level) or dynamic (task-adaptive)?
  Tags: #dynamic-roles #multi-agent #role-assignment #2025

### Persona and Role Prompt Effects

- **Quantifying the Persona Effect in LLM Simulations** (2024) — ACL 2024 — (URL TBD)
  Large-scale empirical study. Performance drops in up to 80% of configurations when using persona prompts; up to 70%+ degradation on reasoning tasks in worst cases. Tests knowledge-domain personas. Does not test behavioral-constraint personas.
  Tags: #persona #role-prompt #empirical #negative-result #ACL-2024

- **EMNLP 2024 (persona null result)** (2024) — EMNLP 2024 — (URL TBD, specific paper title unconfirmed)
  Large-scale evaluation of persona prompts ("you are an expert in X", "you are a [role] agent") on factual QA benchmarks. No significant positive effect; sometimes negative. Corroborates ACL 2024 finding independently.
  Tags: #persona #role-prompt #empirical #null-result #EMNLP-2024

- **ORPP: Optimizing Role-Playing Prompts for LLM Agents** (2025) — EMNLP 2025 — (URL TBD)
  Explores iterative optimization of role-playing prompts. Acknowledges the negative persona effect and attempts to address it systematically. Not yet assessed in depth. Potentially relevant for Organon's cognitive function prompt design.
  Tags: #persona #prompt-optimization #role-playing #EMNLP-2025

### Topology and Coordination

- **Understanding the Information Propagation Effects of Communication Topologies in LLM-based Multi-Agent Systems** (2025) — ACL 2025, arxiv 2505.23352 — https://arxiv.org/abs/2505.23352 (verify)
  Studies how topology affects error propagation in multi-agent systems. Finds moderately sparse topologies (optimized for error suppression) outperform both dense and fully-sparse designs. Not specific to sequential pipelines. More directly relevant than the Li et al. debate paper for Organon's use case.
  Tags: #topology #error-propagation #ACL-2025 #communication

- **Can LLM Agents Really Debate?** (2025) — (full citation TBD, Critic flagged as missed)
  Challenges whether agents actually update their positions based on other agents' arguments, or merely perform surface agreement. Directly relevant to whether Organon's Critic agent actually changes the Synthesizer's output.
  Tags: #debate #agent-updating #skeptical #2025

---

## Similar Projects & Directions

**Sibyl (multi-agent jury)**
Convergence: multiple agents with differentiated roles collaborate on a reasoning task; draws on cognitive architecture inspiration.
Divergence: perspective-based differentiation (different viewpoints) rather than cognitive-function differentiation (different cognitive operations). No sequential handoff pipeline.
What to learn: how they handle disagreement resolution; whether their perspective-differentiation has empirical advantages over single-agent approaches.

**MetaGPT**
Convergence: role specialization matters; agents are assigned stable identities that persist across tasks; structured communication protocols between agents.
Divergence: professional roles drawn from software industry (PM, engineer, QA) rather than cognitive functions. Role assignment is domain-specific, not general-purpose.
What to learn: the ablation evidence that role specialization improves over no-role baselines; communication protocol design for structured handoffs.

**Dynamic Role Assignment (arxiv 2601.17152)**
Convergence: recognizes that role assignment is a meaningful architectural variable; treats it as an active design choice.
Divergence: assigns roles dynamically per task rather than maintaining stable cognitive identities. The core bet is opposite to Organon's Be-level stability assumption.
What to learn: under what task types dynamic assignment outperforms static; whether cognitive function stability has an empirical advantage.

**CoALA (single-agent cognitive architecture)**
Convergence: uses classical cognitive architecture vocabulary (ACT-R, SOAR) to design LLM agents; takes the neuroscience/cognitive science grounding seriously.
Divergence: strictly single-agent; does not address role differentiation or multi-agent coordination.
What to learn: adopt the vocabulary (episodic/semantic/procedural/working memory); use CoALA as the citation anchor for cognitive architecture grounding.

---

## Industry Directions

**No major lab is publicly known to be implementing cognitive-function-based multi-agent teams.** The dominant industry pattern is task/role decomposition (Anthropic's multi-agent documentation, OpenAI Swarm, Microsoft AutoGen) using professional or functional roles drawn from software development workflows.

**Microsoft (AutoGen):** Sequential and group-chat topologies. Role assignment is task-level. AutoGen Studio adds a no-code UI but maintains the same professional-role model. No cognitive function framing observed.

**Anthropic:** Published guidance on multi-agent architectures focuses on orchestrator/subagent patterns and tool use. No publicly known cognitive-function assignment model. The Model Spec provides identity-level constraints for Claude itself, which is the closest analog — but this is a single-model constraint, not a multi-agent team architecture.

**OpenAI (Swarm):** Lightweight multi-agent framework using handoffs and routines. Professional/task role assignment. Focus is on reliability and handoff correctness, not cognitive architecture differentiation.

**Google:** A2A protocol for inter-agent communication. Agent role assignment left to the developer. No prescribed cognitive architecture model.

**Community / open source:** CrewAI, LangGraph, and LangChain all use task/role-based assignment. The most advanced open-source cognitive architecture work is CoALA-influenced single-agent design (Reflexion, ReAct-based loops), not multi-agent cognitive teams.

---

## What Organon Can Build On

**CoALA vocabulary.** The episodic/semantic/procedural/working memory taxonomy is well-established in the LLM cognitive architecture literature. Organon can adopt this vocabulary directly in metacognition-cognitive-team.md without re-deriving it. Citation anchor: Sumers et al. 2023.

**MetaGPT's ablation evidence.** The finding that role specialization outperforms no-role baselines provides a lower bound: differentiated agents do better than undifferentiated ones. Organon's cognitive team must at minimum clear this bar. This is the baseline to beat in any empirical validation.

**Li et al. sparse topology finding (for debate contexts).** If Organon ever implements a debate/jury phase (multiple agents simultaneously evaluating the same artifact), sparse topology is the validated design. Do not use for sequential pipelines.

**ACL 2025 topology paper (arxiv 2505.23352).** Moderately sparse topologies optimized for error propagation suppression outperform both extremes. Relevant for designing how much information flows between Organon's sequential agents. Read before finalizing the cognitive team communication model.

**ORPP (EMNLP 2025) for prompt design.** If behavioral-constraint personas need optimization, ORPP's iterative approach provides a methodology. Read before finalizing the cognitive function persona prompts.

---

## What Appears Novel to Organon

**Cognitive-function role assignment in multi-agent teams.** A systematic search of the current literature (MetaGPT, AutoGen, ChatDev, CrewAI, Sibyl, CoALA, Dynamic Role Assignment) finds no framework that assigns agents cognitive functions (working memory, inhibitory control, executive planning, episodic retrieval) as stable Be-level identities. All existing frameworks use professional roles, task roles, or perspective differentiation.

**Confidence level:** Moderate. The literature search for this session covered the major frameworks but did not exhaustively survey all multi-agent papers from 2024–2026. The specific combination — cognitive-function assignment + Be-level identity stability + sequential handoff pipeline — has not been found. However, this could reflect incomplete search coverage rather than genuine novelty. A second-session targeted search for "cognitive function agent role multi-agent" and review of the AAMAS, NeurIPS, and ICLR 2025–2026 multi-agent tracks is required before a stronger novelty claim can be made.

**Important caveat:** The Critic correctly notes that the 2026 position paper ("Cognitive Models as Templates for Multi-Agent") — which argued this is theoretically correct — cannot be cited because its provenance is unverifiable. The novelty claim is based on absence of evidence in verified sources, not on a position paper.

---

## Open Questions

**Q1: Do behavioral-constraint personas differ empirically from knowledge-domain personas?**
Why it matters: The entire cognitive team architecture rests on the claim that "your cognitive function is inhibitory control — challenge everything" produces different behavior than "you are an expert in X." The EMNLP/ACL negative results apply to knowledge-domain personas. If behavioral-constraint personas also show null or negative effects, the Be-level identity model needs fundamental revision.
What would answer it: A controlled experiment comparing (a) no persona, (b) knowledge-domain persona, (c) behavioral-constraint persona across reasoning and coordination tasks. Look for ORPP (EMNLP 2025) and any 2025–2026 papers on agent behavioral priming.

**Q2: What communication topology is optimal for sequential cognitive pipelines?**
Why it matters: Organon's team is a sequential handoff chain. The two topology papers (Li et al. EMNLP 2024, ACL 2025 arxiv 2505.23352) cover debate and general multi-agent coordination, not sequential pipelines specifically. The alleged Google Research finding about sequential degradation would be highly significant if verified.
What would answer it: (a) Verify and read arxiv 2505.23352 in full. (b) Search for "sequential agent pipeline coordination 2025 2026" and "information propagation sequential LLM agents." (c) If the Google 180-configuration study exists, find its citation.

**Q3: Does cognitive-function assignment outperform professional-role assignment on reasoning/coordination benchmarks?**
Why it matters: The entire architectural bet. MetaGPT's ablation shows role assignment beats no-role assignment. It does not compare role types. No paper has run this comparison.
What would answer it: A controlled experiment. In the short term: look for any multi-agent benchmarking paper that compared different role assignment strategies (not just role vs. no-role) from 2025–2026.

**Q4: Do agents actually update on other agents' outputs, or do they perform surface agreement?**
Why it matters: "Can LLM Agents Really Debate?" (2025) challenges whether agent-to-agent influence is real. If the Critic agent in Organon's team does not genuinely change the Synthesizer's outputs, the team design produces theater, not improved quality.
What would answer it: Read "Can LLM Agents Really Debate?" (2025). Look for empirical work on agent output delta measurement — whether agent B's output measurably changes after seeing agent A's critique. This is also directly testable with Organon's own team.

**Q5: Is Sibyl the closest prior art, and what specifically does it find?**
Why it matters: Sibyl is flagged as the most relevant existing system. If Sibyl has empirical results showing cognitive-architecture-inspired teams outperform professional-role teams, that is supporting evidence. If Sibyl fails, that is a warning signal.
What would answer it: Find and read the Sibyl paper. Assess its benchmark results and compare its role differentiation model to Organon's cognitive function model.

---

## Critic's Unresolved Challenges

**BLOCKING — Topology finding does not apply to sequential pipelines.**
The sparse topology result (Li et al., EMNLP 2024) was raised in the session context as relevant to Organon's communication design. It is not. It applies to multi-agent debate (simultaneous agents, sparse reading graph). Organon's team is a sequential handoff chain with a fundamentally different information flow structure. The Critic raised an alleged Google Research 2026 study (180 agent configurations) finding sequential coordination degrades performance by 39–70% on sequential reasoning tasks. This study was not verified in this session — no URL, no full citation. This is a directly threatening finding for Organon's sequential pipeline design.
Follow-up search: "Google Research multi-agent sequential coordination 2026" and "sequential LLM agent pipeline degradation." Read arxiv 2505.23352 (ACL 2025) in full for the most relevant topology evidence. If the Google study is confirmed, it becomes the highest-priority finding for the next session.

**BLOCKING — The 2026 position paper is unverifiable.**
The "Cognitive Models as Templates for Multi-Agent" 2026 position paper was described in session inputs as providing theoretical justification for cognitive-function assignment. The Critic found no citation trail and flagged it as potentially non-existent. It was not cited in this document. If it is the only theoretical backing for cognitive-function assignment, the theoretical foundation of the cognitive team design is thinner than it appears.
Follow-up search: Search Google Scholar, Semantic Scholar, and arXiv for "cognitive models multi-agent templates 2026" and "cognitive function assignment multi-agent LLM." If no paper is found, document the absence and note that the theoretical justification is Organon's own extrapolation from CoALA, not an independent validation.

**SIGNIFICANT — Persona null result threat is understated in the session findings.**
The session inputs acknowledged the persona null result but hedged it as not applying to behavioral-constraint personas. This hedge is correct but speculative. The ACL 2024 70%+ reasoning degradation finding is serious: if behavioral-constraint personas cause even a fraction of that degradation, the cognitive team design actively harms performance.
Follow-up search: Search for any empirical work on behavioral instruction personas vs. knowledge-domain personas. Check ORPP (EMNLP 2025) for whether it addresses behavioral constraints or only knowledge personas. Look for "agent identity constraint prompt effect" and "system prompt behavioral constraint LLM performance."

**SIGNIFICANT — CoALA single-agent scope is a gap, not a caveat.**
The session treated CoALA's single-agent limitation as a minor caveat. The Critic argued it is central: applying CoALA's component model to multi-agent role differentiation is a theoretical jump with no backing in CoALA itself. SOAR has multi-agent extensions from defense and simulation research — these were not investigated.
Follow-up search: "SOAR multi-agent extension" and "SOAR cognitive architecture multi-agent 2024 2025." Find whether any LLM research has built on SOAR's multi-agent model rather than ACT-R's single-agent model.

**SIGNIFICANT — MetaGPT ablation proves role differentiation matters, not role type.**
The session framing implied MetaGPT's ablation supports Organon's cognitive-function approach. The Critic is correct: it supports role differentiation over no roles. It says nothing about cognitive-function vs. professional-role comparison.
This is not a follow-up search issue — it is a framing correction. The implication in the Key Findings section (Finding 1) has been written to reflect this accurately. No additional search required, but the distinction must be preserved in all future document updates.

---

## Session 2 Scope

**Architect stop/continue decision: Continue.** Re-assessed delta = 0.57 (self-assessment of 0.35 was conservative — AC1 is near-complete). Delta is below 0.85 threshold and two blocking challenges remain unresolved.

Priority tasks for Session 2 (in priority order):

**Priority 1 (BLOCKING):** Read arxiv 2505.23352 ("Understanding the Information Propagation Effects of Communication Topologies in LLM-based Multi-Agent Systems", ACL 2025). Assess: (a) does it study sequential handoff pipelines or general coordination? (b) What topology does it recommend and under what conditions? (c) Does it contain benchmark results applicable to a 5-agent sequential cognitive pipeline? This resolves the topology blocking challenge and will push AC4 from 0.45 toward 0.80.

**Priority 2 (BLOCKING):** Verify or falsify the "Cognitive Models as Templates for Multi-Agent" 2026 position paper. Search Google Scholar, Semantic Scholar, and arXiv for: "cognitive models templates multi-agent LLM 2026", "cognitive function assignment multi-agent agents 2025 2026", "Society of Mind cognitive function multi-agent LLM". If not found after three searches, document the absence explicitly and record that the theoretical justification for cognitive-function assignment is Organon's own extrapolation from CoALA — not independently validated.

**Priority 3 (SIGNIFICANT):** Find and read the Sibyl paper. Search for "Sibyl simple yet effective agent framework complex real-world reasoning" on arXiv and Semantic Scholar. Assess: (a) what specific differentiation model does Sibyl use? (b) What are its benchmark results vs. single-agent baselines? (c) Sequential pipeline or simultaneous jury? This determines whether Sibyl is supporting evidence, a warning signal, or a false alarm for Organon's cognitive team design, and informs both AC2 and AC5.

**Defer to Session 3:** SOAR multi-agent extensions ("SOAR cognitive architecture multi-agent 2024 2025"); behavioral-constraint persona empirical search (ORPP EMNLP 2025); "Can LLM Agents Really Debate?" (2025). These are significant but not blocking.

Target delta after Session 2: **0.80** (topology blocking resolved, position paper verified/falsified, Sibyl assessed).
