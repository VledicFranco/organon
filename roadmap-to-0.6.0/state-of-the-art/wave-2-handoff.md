---
type: session-handoff
scope: state-of-the-art
name: wave-2-handoff
version: 1.0.0
summary: >
  Session handoff for Wave 2 SOTA research (Areas 1, 5, 8). Covers Sessions 1 and 2
  completed, current document state, and exact next steps for resuming. Written 2026-03-01.
token_estimate: 1100
---

# Wave 2 SOTA Research — Session Handoff

> Written: 2026-03-01
> Covers: Area 1 (Formal Methods) + Area 5 (Agentic Methodology) + Area 8 (Industry Landscape)
> Status: Session 2 complete for all three areas. Session 3 pending.

---

## What Was Done (Sessions 1 and 2)

Full cognitive team protocol executed for all 3 areas across 2 sessions:

**Session 1:**
1. Phase 0 — Context loaded from `research-plan.md` + output doc stubs
2. Phase 1 — Architect briefs produced for all 3 areas
3. Phase 2a — 6 Scout agents in parallel (2 per area)
4. Phase 2b — 3 Deep Researcher agents in parallel (one per area)
5. Phase 2c — 3 Critic agents in parallel (one per area)
6. Phase 3 — 3 Synthesizer agents in parallel → output documents written
7. Architect re-assessments — stop/continue decisions + delta corrections
8. Quality gate — all 3 documents pass
   - Area 1: delta corrected 0.45 → 0.30 (Synthesizer overclaimed)
   - Area 5: delta corrected 0.42 → 0.30 (two ACs at 0.0)
   - Area 8: delta confirmed 0.42

**Session 2 (targeted gap-filling — no Scout phase):**
1. Phase 2b — 3 Deep Researchers in parallel (area-specific gaps)
2. Phase 2c — 3 Critics in parallel
3. Phase 3 — 3 Synthesizers in parallel → documents updated
4. Architect re-assessments — delta corrections applied
5. Quality gate — all 3 documents pass

---

## Current Document State

### `sota-formal-methods.md` — Delta: 0.35 / 1.0

**What is resolved:**
- Measurements~Mod mapping definitively wrong; corrected to Organon-instances~Mod
- Satisfaction condition acknowledged as structurally plausible but formally unverified
- Protocol and Personas identified as NOT covered by institution theory (genuine novelty candidates)
- Process institutions confirmed to exist (CSP-as-institution, CoCASL, E↓-logic)
- Novelty claim refined from "institutions are declarative" to "LLM-agent workflow orchestration with automation tiers has no institution-theoretic counterpart"
- Cedar + Lean 4 VGD pattern (from Session 1) remains solid
- OWL framing corrected to SHACL (closed-world constraint validation is the right comparator)

**What is NOT resolved (blocking):**
- AC1: Satisfaction condition formally unverified; Organon analog of signature morphism not identified; contravariant functoriality of Organon-instances not demonstrated
- AC4: SHACL vs. dependent types not researched (only framing corrected)

**What is NOT resolved (significant):**
- BPMN formal verification literature entirely missed (Lam et al. 2019; may subsume Protocol novelty claim)
- Event-B institution (arXiv 2103.10881) not investigated
- Lamport-Paulson sections 4–5 not read; paper may argue AGAINST dependent-type specification

**Session 3 priorities (in order):**
1. **SHACL vs. dependent types** — search "SHACL formal semantics closed world constraint validation 2022-2024"; apply to Organon frontmatter invariants; produce OWL/SHACL/DT comparison table
2. **BPMN formal verification** — read Lam et al. 2019 "Runtime Verification of Business Cloud Workflow Temporal Conformance" + Event-B institution (arXiv 2103.10881)
3. **Lamport-Paulson full read** — sections 4–5 at `cl.cam.ac.uk/~lp15/papers/Reports/lamport-paulson-types.pdf`

Target delta after Session 3: **0.60**

---

### `sota-agentic-methodology.md` — Delta: 0.59 / 1.0

**What is resolved:**
- AC3 FULLY RESOLVED: MCP (2025-11-25) has no behavioral constraints; ToolAnnotations explicitly advisory/untrusted; SEP-1686 provides composable pause primitive only
- AC4 CHARACTERIZED: GaaS = post-generation behavioral firewall; Trust Factor = novel temporal enforcement mechanism; NOT a methodology layer; complementary to Organon
- IaC arc documented: configuration drift ↔ behavioral drift; Organon's enforcement direction = "Pulumi TypeScript direction" (aspirational, not current)
  - CAVEAT: current Organon (YAML + CLI) ≈ Terraform HCL, not Pulumi TypeScript
- ABC ContractSpec (arXiv 2602.22302) = closest published prior art; schema NOT yet publicly located (status unverified, may be released soon)
- PCAS (arXiv 2602.16708) identified as strongest published evidence for AC2 but NOT YET READ

**What is NOT resolved (blocking):**
- AC2: PCAS not read — "policy-compliant by construction" using Datalog-derived language; compliance from 48% to 93%; MUST be read first
- AC1: ABC schema not located — search authors' GitHub before concluding inaccessible; ABC was published ~5 days before Session 2

**What is NOT resolved (significant):**
- Agent Contracts Resource-Bounded (arXiv 2601.08815) not investigated — competing prior art
- Design by Contract adoption failure history not investigated (predicts ABC adoption barriers)
- OpenAI Agents SDK lifecycle hooks not investigated

**Session 3 priorities (in order):**
1. **Read PCAS (arXiv 2602.16708)** — extract: constraint language type (Datalog), enforcement stage (pre/post/construction), what violations it covers, whether it's methodology-layer or content-layer
2. **Active search for ABC schema** — search authors' GitHub profiles, institutional pages, supplemental materials; three targeted searches then conclude with search record
3. **Read Agent Contracts Resource-Bounded (arXiv 2601.08815)** — extract scope, schema format, enforcement mechanism

Target delta after Session 3: **0.80**

---

### `sota-industry-landscape.md` — Delta: 0.41 / 1.0

**What is resolved:**
- Enforcement taxonomy: 4-tier structure documented (Structural/Generation-Time, Structural/State-Validation, Post-Generation/Behavioral-Firewall, Behavioral-Specification [blocked])
- OpenAI Structured Outputs: token-level CFG; strict=true; unsupported constraints listed (minLength, pattern, min/max, recursive schemas); Anthropic equivalent GA Nov 2025
- LangGraph: Pydantic-backed structural state validation + interrupt-gated routing; NO behavioral specification language; infrastructure only
- DSPy: Signatures = partial specification layer (class-level, declared, discoverable); Assert = retry enforcement (implementation-coupled); closest examined analog to methodology layer
- GaaS: post-generation behavioral firewall; Trust Factor = novel temporal enforcement; NOT methodology layer
- SK ADR 0070: conflates identity + behavior + procedure; most precise framing of the problem Organon solves

**What is NOT resolved (blocking):**
- AC3: ABC (arXiv 2602.22302) not read — cannot answer "has any framework achieved behavioral specification at Organon's level?"
- AC3: MI9 (arXiv 2508.03858) not read — FSM-based conformance engines for temporal behavioral patterns
- Post-generation enforcement landscape incomplete without ABC and MI9

**What is NOT resolved (significant):**
- llguidance (Microsoft, open-source) not investigated — foundational library underlying OpenAI structured outputs
- MCP November 2025 spec's OAuth scope names not assessed for enforcement relevance

**Session 3 priorities (in order):**
1. **Read ABC (arXiv 2602.22302)** — are constraints separable artifacts (YAML/JSON files) or Python code? Is there a phase concept? Does Drift Bounds Theorem provide formal guarantees? Is AgentAssert framework-agnostic?
2. **Read MI9 (arXiv 2508.03858)** — what is the FSM's expressiveness? Can it declare phase-scoped constraints? Is the conformance engine separable from a specific runtime?
3. **MCP Nov 2025 targeted read** — OAuth scope names: do they have capability-restriction or phase-gating semantics?

Target delta after Session 3: **0.75**

---

## How to Resume (Phase 0 Checklist)

When starting Session 3 for any area:

- [ ] Read `research-plan.md` fresh
- [ ] Read the current output document for the area
- [ ] Read the Session 3 Scope section at the bottom of the output document
- [ ] Read this handoff file if starting cold
- [ ] Compress into a 200–400 token context block before invoking the Architect

**Do NOT skip Phase 0.** The Architect without prior context will re-scope work already done.

**Session 3 can skip Scouts** — targeted gap-filling; territory is already mapped. Run directly: Architect brief (updated) → Deep Researcher → Critic → Synthesizer.

---

## Wave 2 vs. Research Plan

| Area | Output Doc | Session 1 Delta | Session 2 Delta | Session 3 Target |
|------|-----------|-----------------|-----------------|-----------------|
| Area 1: Formal Methods | sota-formal-methods.md | 0.30 | 0.35 | 0.60 |
| Area 5: Agentic Methodology | sota-agentic-methodology.md | 0.30 | 0.59 | 0.80 |
| Area 8: Industry Landscape | sota-industry-landscape.md | 0.42 | 0.41 | 0.75 |

Wave 3 (Areas 4, 7) has not been started. Wave 1 Session 2 (Areas 2, 3) also pending — see `wave-1-handoff.md`.

---

## Methodology Notes (Meta-Observations)

**Scout phase can be safely dropped for Session 2+.** Session 2 ran Deep Researchers directly on targeted gaps (no Scouts). No quality loss. Use this for any session that is gap-filling rather than territory-mapping.

**Critic blocking challenge [BLOCKING] vs. [SIGNIFICANT] distinction holds up.** In Wave 2 Session 2, blocking challenges forced AC-level score ceilings that materially affected the Architect re-assessments. The SIGNIFICANT flags surfaced real gaps without artificially suppressing the overall delta.

**Synthesizer delta self-assessments diverged from Architect re-assessments.** Area 5: Synthesizer said 0.52, Architect scored 0.59 (Synthesizer was conservative on AC3 and AC4). Area 8: Synthesizer said 0.48, Architect scored 0.41 (Synthesizer was too generous on AC3). The Architect re-assessment is still required — Synthesizers do not have a consistent directional bias.

**ABC (arXiv 2602.22302) appears in multiple areas independently.** Area 5's primary prior art candidate and Area 8's AC3 blocking dependency are the same paper. When resuming for Session 3, coordinate: reading ABC once should satisfy blocking dependencies in both Area 5 (AC1) and Area 8 (AC3/AC4). Consider running the ABC Deep Researcher as a shared agent and passing its output to both area synthesizers.

**GaaS (arXiv 2508.18765) was independently discovered by Area 5 and Area 8 researchers.** The finding is consistent across both: post-generation behavioral firewall, Trust Factor mechanism, not a methodology layer, complementary to Organon. Both documents reflect this. No inconsistency to resolve.
