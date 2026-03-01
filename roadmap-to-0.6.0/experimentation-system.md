# Idea: Organon Experimentation System

> Status: Brainstorm — internal tool, not intended for external distribution.
> Goal: empirically measure organon's contribution to agent task outcomes.

---

## Core Question

**Does organon actually make agents better?**

Without measurement, the methodology risks becoming fiction — enforced by convention
rather than evidence. This system provides a formal, reproducible way to answer
that question and identify where the methodology has gaps.

---

## The Key Advantage We Already Have

The **verification gates already exist** as objective scorers. For organon file
generation tasks, `organon verify` produces a binary, reproducible pass/fail.
This gives us a free, unambiguous evaluation function for a large class of tasks —
no subjective rubrics, no human judges required.

This is the wedge: start where scoring is already automated, then expand.

---

## Experiment Design

### Controlled Comparison

Same task, same model, two conditions:
- **With organon**: agent receives frontmatter, ETHOS.md, relevant protocols
- **Without organon**: agent receives only the task description (baseline)

Each condition runs N times to measure variance, not just mean performance.

### Task Dataset

Candidate sources:
- **Hand-crafted scenarios**: representative tasks per domain (add command, write protocol, create domain)
- **Git history mining**: past issues and PRs as real task inputs with known correct outputs

Task types map to evaluation difficulty:
| Task Type | Scoring Method |
|-----------|---------------|
| Generate organon file | `organon verify` (automated, objective) |
| CLI command implementation | Schema validation + test pass rate |
| Architectural decision | Rubric-based (requires human judge) |

### Metrics

1. **Task completion rate** — did the output meet the acceptance criteria?
2. **Invariant violation rate** — did the agent break constraints from ETHOS.md?
3. **Consistency score** — variance across N runs of the same task
4. **Token efficiency** — outcome quality per token spent
5. **Correction rate** — how often the agent needed redirecting before success

---

## What It Can Identify

- Which invariants are actually enforced vs. just stated in text
- Which parts of the methodology are consistently followed vs. ignored
- Where agents diverge most from methodology expectations
- Which automation tiers are misclassified (things marked `manual` that could be automated)
- Whether RAG-style context retrieval improves outcomes vs. full-file loading

---

## Open Questions

1. **Baseline definition**: "without organon" could mean (a) no ETHOS.md loaded,
   (b) no organon files at all, or (c) a different methodology. These are different
   baselines with different interpretations.

2. **Model drift**: model capability improves over time — how do you isolate
   organon's contribution from Claude's own improvements across versions?

3. **Task dataset freshness**: hand-crafted tasks go stale as the methodology
   evolves. How do you keep the dataset current without biasing it?

4. **Minimum viable experiment**: what is the smallest experiment that produces
   actionable signal? Recommend starting with a single domain (tools/) and a
   single task type (add a new CLI command).

---

## Research Grounding

- [The Measurement Imbalance in Agentic AI Evaluation](https://arxiv.org/html/2506.02064v2) —
  84-paper review showing 83% of evaluations focus on technical metrics; human-centered
  and safety metrics remain peripheral. Organon experiments should track both.
- [Beyond Task Completion: Assessment Framework for Agentic AI](https://arxiv.org/abs/2512.12791) —
  static analysis (pre-execution risk) + dynamic analysis (runtime judge evaluation).
  Maps to: dry-run verification + live agent observation.
- [Creative Adversarial Testing (CAT) / Goal Achievement Index](https://arxiv.org/html/2509.23006) —
  continuous assessment of alignment between task execution and original goal.
  The GAI concept is directly applicable as a per-step delta metric.

---

## Connection to Other 0.6.0 Ideas

- **RAG context retrieval**: retrieval quality and token efficiency are natural
  experiment variables — does better context injection improve completion rate?
- **Metacognitive quality gates**: experiment results feed back into gate calibration;
  gates that don't correlate with outcome quality should be revised
