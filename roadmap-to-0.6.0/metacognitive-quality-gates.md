# Idea: Metacognitive Quality Gates

> Status: Brainstorm — methodology enhancement, not a separate tool.
> Goal: embed goal-tracking and self-evaluation into every stage of the organon
> RFC lifecycle so agents can detect and correct drift before it compounds.

---

## Core Insight

Human cognition doesn't just execute tasks — it monitors execution against intent
at every step. This is **metacognition**: knowing what you know, detecting when
you're off-track, and adapting before completing a wrong path.

Current organon processes execute well but lack this layer. An agent can follow
every step of a protocol correctly and still deliver something misaligned with the
original goal — because no gate measures *proximity to intent*, only *procedural
correctness*.

**Goal-reaching delta** is the missing signal: at each lifecycle stage, how far
is the current output from the original stated objective?

---

## Mapping: Human Metacognition → Organon Lifecycle

| Metacognitive Process | Organon Stage | Current State | Target State |
|----------------------|---------------|---------------|--------------|
| Goal setting | RFC: Objective | Informal prose | Formal, measurable acceptance criteria |
| Planning self-check | RFC: Design | Manual review | Gate: does plan address all criteria? |
| Execution monitoring | Implementation | Ad-hoc | Gate: does output match plan intent? |
| Error detection | QA / verify | Schema checks only | Gate: invariant alignment + goal delta |
| Strategic adaptation | Refinement | Manual iteration | Structured reflection with delta feedback |
| Learning integration | Enrichment | Optional / informal | Required: what changed and why |

---

## The Goal-Reaching Delta

A scalar (0.0–1.0) computed at each lifecycle stage measuring alignment between
the current output and the original stated objective.

```
delta(stage) = score(current_output, original_objective)
```

Key properties:
- **Monotonic pressure**: delta should increase or hold at each stage. A drop
  signals drift and triggers a review gate.
- **Decomposable**: delta can be broken into sub-dimensions (functional correctness,
  constraint satisfaction, scope alignment)
- **Actionable**: a low delta at planning stage is cheaper to fix than at evaluation

### Scoring Approaches (by task type)

| Task Type | Delta Scoring Method |
|-----------|---------------------|
| Organon file generation | Automated: `organon verify` pass rate + frontmatter completeness |
| RFC planning | Rubric: does the plan address all stated acceptance criteria? |
| Architectural decision | Rubric: do the chosen constraints satisfy the problem statement? |
| Refinement | Diff-based: did the change close the gap identified in evaluation? |

---

## Enhanced Lifecycle with Quality Gates

```
[Objective Setting]
  ↓  Gate 0: Are acceptance criteria measurable and complete?
[Planning / RFC Design]
  ↓  Gate 1: Does the plan address all acceptance criteria? (delta ≥ 0.7)
[Execution]
  ↓  Gate 2: Does output match plan intent? Are invariants preserved?
[Evaluation / QA]
  ↓  Gate 3: Does output satisfy original objective? (delta ≥ 0.9)
[Refinement]
  ↓  Gate 4: Did refinement increase delta? Was the cause of gap identified?
[Enrichment]
  ↓  Gate 5: Has the methodology been updated to prevent recurrence?
```

Gates are **fail-fast**: a failing gate at stage N prevents progression to N+1.
This mirrors the existing `organon verify` philosophy — gates fail, not warn.

---

## Dual-Loop Reflection

Research on LLM self-improvement identifies a dual-loop reflection pattern that
maps naturally onto this lifecycle:

- **Outer loop (extrospection)**: compare current output against reference/objective.
  Produces a critique: "what is wrong and why?"
- **Inner loop (introspection)**: retrieve past critiques of similar tasks to guide
  current execution. Builds a **reflection bank** over time.

In organon terms:
- Outer loop = Gate evaluation at each stage
- Inner loop = `organon/observations/` directory — empirical observations feeding
  back into methodology decisions

---

## What This Changes in Practice

### RFC Phase (Objective Setting)

RFCs currently contain a problem statement and proposed solution. Adding a
**formal acceptance criteria section** makes Gate 0 possible:

```markdown
## Acceptance Criteria
- [ ] `organon verify` passes with 0 warnings
- [ ] All affected files have updated frontmatter
- [ ] No new orphaned references introduced
```

### Execution Phase

Agents periodically check: "does my current output still address the original
objective?" This is not a final review — it's a mid-execution self-check that
catches drift early.

### Enrichment Phase (Currently Optional)

Currently, the enrichment phase updates organon files after a feature ships.
With metacognitive gates, this phase must also record:
- What the delta was at evaluation
- What caused any gap identified
- What methodology gap allowed the drift to occur

This makes enrichment a **learning event**, not just a documentation update.

---

## Open Questions

1. **Delta computation**: for non-automated tasks (architectural decisions, RFC
   design), who or what computes the delta? A rubric evaluated by the agent itself
   risks self-serving scores. An LLM-as-judge is better but adds cost.

2. **Gate calibration**: what threshold constitutes an acceptable delta at each
   stage? Wrong thresholds either block valid work or let bad work through. Needs
   empirical calibration via the experimentation system.

3. **Reflection bank implementation**: where does the reflection bank live? The
   `organon/observations/` directory is the natural home, but needs a formal schema.

4. **Integration with existing gates**: the 9 existing `organon verify` gates are
   structural/schema checks. How do goal-delta gates complement rather than
   duplicate them? Are they a new gate tier, or extensions to existing gates?

---

## Research Grounding

- [Position: Truly Self-Improving Agents Require Intrinsic Metacognitive Learning](https://openreview.net/forum?id=4KhDd0Ozqe) —
  metacognitive knowledge, planning, and evaluation as distinct required components.
  Maps directly to Gate 0 (knowledge), Gate 1 (planning), Gate 3 (evaluation).
- [Towards Understanding Metacognition in Large Reasoning Models](https://openreview.net/forum?id=JGG9EdHyZc) —
  metacognitive ability in LRMs is inconsistent and easily disrupted. This is why
  structural gates matter: they externalize metacognition rather than relying on
  the model to self-regulate without prompting.
- [Evaluation-Driven Development and Operations of LLM Agents (EDDOps)](https://arxiv.org/html/2411.13768v3) —
  evaluation embedded throughout lifecycle, not confined to testing phases.
  The gate-per-stage design is a direct application of EDDOps principles.
- [Enhancing LLM Agents with Automated Process Supervision](https://aclanthology.org/2025.emnlp-main.506.pdf) —
  process-level supervision outperforms outcome-only supervision for complex tasks.
  Validates the per-stage gate approach over end-only QA.

---

## Connection to Other 0.6.0 Ideas

- **Experimentation system**: gate thresholds (delta ≥ 0.7, ≥ 0.9) need empirical
  calibration; experiments provide that data
- **RAG context retrieval**: richer context at planning stage should increase
  Gate 1 delta scores — measurable relationship between retrieval quality and
  planning alignment
