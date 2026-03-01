---
type: session-handoff
scope: state-of-the-art
name: wave-1-handoff
version: 1.0.0
summary: >
  Session handoff for Wave 1 SOTA research (Areas 2 and 3). Covers what was done,
  current document state, and exact next steps for resuming. Written 2026-03-01.
token_estimate: 900
---

# Wave 1 SOTA Research — Session Handoff

> Written: 2026-03-01
> Covers: Area 2 (Metacognition in LLMs) + Area 3 (Multi-Agent Systems & Cognitive Architectures)
> Status: Session 1 complete for both areas. Sessions 2+ pending.

---

## What Was Done

Full cognitive team protocol executed for both areas simultaneously (Wave 1 per research-plan.md):

1. **Phase 0** — Context loaded from `research-plan.md` + both output doc stubs
2. **Phase 1** — Architect briefs produced for both areas (acceptance criteria, priority questions, scope)
3. **Phase 2a** — 4 Scout agents in parallel (2 per area, each on independent sub-questions)
4. **Phase 2b** — 2 Deep Researcher agents in parallel (one per area)
5. **Phase 2c** — 2 Critic agents in parallel (one per area)
6. **Phase 3** — 2 Synthesizer agents in parallel → output documents written
7. **Architect re-assessments** — stop/continue decisions + next session scope
8. **Quality gate** — both documents pass

Both output documents now exist and are populated.

---

## Current Document State

### `sota-metacognition-llm.md` — Delta: 0.73 / 1.0

**What is resolved:**
- Monitoring-control gap: systematic, documented (JGG9EdHyZc)
- Self-correction conditions: Kamoi et al. TACL 2024 taxonomy integrated — works for structurally verifiable tasks; fails for reasoning/planning/QA. Organon gate types mapped.
- PRMs for non-math domains: VersaPRM (ICML 2025) confirmed — 14 domains, Law +7.93%. Oracle (ground-truth answers) required for auto-labeling.
- External metacognition architectures: SOFAI-LM quantified (graph coloring 42% vs. 2%; code debugging 70-73% vs. 37-40%). Decidability boundary confirmed.
- Organon implications: structural gates = success zone; semantic gates = require external enforcement. Gate classification taxonomy ready to use.

**What is NOT resolved:**
- AC1 (genuine vs. simulated metacognition) — arxiv 2505.13763 is the key unread paper
- VersaPRM gap: knowledge QA ≠ procedure-following. Does PRM apply to protocol compliance?
- Decidability boundary for partially-decidable tasks (neither SOFAI-LM nor Kamoi tested mixed-criteria tasks)

**Session 2 priorities (in order):**
1. Read **arxiv 2505.13763** — "Language Models Are Capable of Metacognitive Monitoring and Control of Their Internal Activations"
2. **VersaPRM procedure-following gap** — search "process reward model instruction following agentic task 2025"; assess whether auto-labeling can use a policy doc instead of ground-truth answers
3. **Decidability boundary** — search "EDDOps arxiv 2411.13768", "constitutional AI self-critique effectiveness", "LLM evaluation mixed criteria structural semantic"

Target delta after Session 2: **0.85–0.88**

---

### `sota-multi-agent.md` — Delta: 0.57 / 1.0

**What is resolved:**
- Framework taxonomy: MetaGPT, AutoGen, ChatDev, CrewAI all use professional role assignment. No cognitive-function framework exists.
- MetaGPT ablation: role differentiation outperforms no roles. Does NOT prove cognitive-function > professional-role.
- Persona effects: EMNLP 2024 null result + ACL 2024 70%+ degradation for knowledge-domain personas. Behavioral-constraint personas untested.
- CoALA: maps cognitive architecture to single LLM agents only. Vocabulary is usable; multi-agent extrapolation is Organon's own.
- Sparse topology (Li et al. EMNLP 2024): validated for debate. Does NOT apply to Organon's sequential handoff pipeline.
- Cognitive-function assignment: no prior art found in the current literature.

**What is NOT resolved (blocking):**
- Topology for sequential pipelines: read arxiv 2505.23352 (ACL 2025) — what topology works for sequential coordination?
- 2026 position paper: "Cognitive Models as Templates for Multi-Agent" — unverifiable provenance, excluded from document. Needs targeted search.

**What is NOT resolved (significant):**
- Behavioral-constraint vs. knowledge-domain persona: empirically untested. Organon's Be-level identity model is a design hypothesis, not validated.
- SOAR multi-agent extensions: not investigated. May provide theoretical backing.
- Sibyl multi-agent framework: flagged as closest prior art, not yet read.

**Session 2 priorities (in order):**
1. Read **arxiv 2505.23352** — topology effects on sequential pipelines (blocking)
2. **Verify/falsify 2026 position paper** — search "cognitive models templates multi-agent LLM 2026" on Google Scholar, Semantic Scholar, arXiv. Document presence or absence.
3. Find and read **Sibyl paper** — "Sibyl simple yet effective agent framework complex real-world reasoning"

Target delta after Session 2: **0.80**

---

## How to Resume (Phase 0 Checklist)

When starting the next session for either area:

- [ ] Read `research-plan.md` fresh
- [ ] Read the current output document (sota-metacognition-llm.md or sota-multi-agent.md) to load existing findings
- [ ] Read the Session N Scope section at the bottom of the output document for exact priorities
- [ ] Read this handoff file if starting cold
- [ ] Compress into a 200–400 token context block before invoking the Architect

**Do NOT skip Phase 0.** The Architect without prior context will re-scope work already done.

---

## Wave 1 vs. Research Plan

Per `research-plan.md`, Wave 1 = Areas 2 and 3 (both foundational for Organon's metacognition work).

| Area | Output Doc | Session 1 Delta | Next Target |
|------|-----------|-----------------|-------------|
| Area 2: Metacognition in LLMs | sota-metacognition-llm.md | 0.73 | 0.85 (Session 2) |
| Area 3: Multi-Agent Systems | sota-multi-agent.md | 0.57 | 0.80 (Session 2) |

Wave 2 (Areas 1, 4, 5, 6, 7, 8) has not been started. See `research-plan.md` for scope.

---

## Methodology Notes (Meta-Observations)

For the agent resuming this work — observations about what worked and what to watch:

**Scout parallelism works well.** Running 4 Scouts simultaneously on independent sub-questions produced no coordination issues and significantly increased territory coverage. Use this.

**Deep Researcher scope:** Keep to 2–4 papers per session. The Researchers who tried to cover more produced thinner analysis.

**Critic quality:** Both Critics produced substantive challenges, not vague skepticism. The "you are structurally required to challenge" invariant appears to work.

**Architect re-assessment scope creep:** The Metacognition Architect conducted additional web research during the re-assessment phase (resolved 2 blocking challenges inline). This was outside its intended role but the findings were valid. For future sessions: if the Architect finds new evidence during re-assessment, integrate it but note it was collected during re-assessment, not the planned Deep Researcher phase.

**arxiv 2508.17959 and SOFAI-LM are the same paper.** The Critic and session context treated them as separate. Confirmed they are the same work. This caused the "SIGNIFICANT 2" Critic challenge to collapse rather than resolve positively.
