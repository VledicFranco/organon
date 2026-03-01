# Metacognition Research: Grounding Organon in How Intelligence Regulates Itself

> Design exploration for v0.6.0+. How research on human metacognitive processes
> reveals the structural gap Organon fills — and how formalizing that gap
> eliminates hallucination, enables automation, and produces a genuine
> methodology for LLM-driven software development.

---

## Thesis

LLMs have rich object-level processing — they generate, pattern-match, complete,
and reason. What they fundamentally lack is a **meta level**: the capacity to
monitor their own outputs, assess quality, and regulate the process accordingly.

Organon is an attempt to scaffold that meta level from the outside. But without
a model of *what the meta level actually does* in intelligent systems, the
scaffolding is incomplete. Metacognition research gives us that model — and
reveals both what Organon already does right and what structural gaps remain.

---

## Clarifying the Framework: Two Orthogonal Distinctions

### System 1 / System 2 (Kahneman)

Often misread as "execution vs meta-reasoning." The actual distinction is about
**speed and automaticity**:

- **System 1**: Fast, automatic, effortless, parallel, largely unconscious.
  Pattern recognition, intuition, fluency. Not "reasoning" in a deliberate
  sense — closer to reflexes of cognition. Runs constantly in the background.

- **System 2**: Slow, deliberate, effortful, sequential, uses working memory.
  Explicit rule-following, calculation, logical inference. Expensive — the brain
  avoids it when possible.

Critically: **System 2 is not purely metacognitive**. It does hard object-level
work (solving 17×24) *and* meta-level work (reviewing your own reasoning). It is
the "slow" processor, not specifically the "meta" processor.

### Object Level / Meta Level (Nelson & Narens, 1990)

This is the cleaner framework for what Organon is actually doing:

```
┌─────────────────────────────────────────────────────┐
│                     Meta Level                      │
│  (monitors + regulates the object-level process)    │
└──────────────────┬──────────────────────────────────┘
                   │ control (top-down):
                   │ "slow down", "try a different strategy",
                   │ "suppress that response", "stop here"
                   ↓
┌─────────────────────────────────────────────────────┐
│                    Object Level                     │
│      (does the actual cognitive work)               │
└──────────────────┬──────────────────────────────────┘
                   │ monitoring (bottom-up):
                   │ "this is hard", "I'm uncertain here",
                   │ "something feels wrong", "I'm done"
                   ↑
           (signals flow back up)
```

The two flows are equally important:
- **Monitoring** (bottom-up): the object level reports its state — difficulty,
  confidence, errors, gaps — up to the meta level
- **Control** (top-down): the meta level regulates the object level — allocating
  attention, suppressing wrong responses, switching strategies, stopping

A meta level that cannot receive monitoring signals is **blind**.
A meta level that cannot send control signals is **impotent**.
Both flows are required for metacognition to function.

### How They Relate

System 1/System 2 and object/meta level are orthogonal axes:

| | Object Level | Meta Level |
|--|--|--|
| **System 1 (fast)** | Fluent generation, pattern completion | Feeling of knowing, fluency signal, "this feels wrong" |
| **System 2 (slow)** | Deliberate reasoning, following explicit rules | Explicit review, strategy selection, error correction |

Metacognition spans all four quadrants but lives primarily in the meta level.
The fast metacognitive signals (intuitive sense that something is off) are
System 1 *at the meta level*. Deliberate self-review is System 2 *at the meta
level*.

---

## The LLM Gap: What the Meta Level Does That LLMs Don't

Human metacognition (Flavell, 1979) has two components:

**Metacognitive knowledge**: knowing what you know, knowing the limits of your
own cognition, knowing which tasks are hard for you. LLMs lack this — they
produce confident outputs regardless of whether the domain is well-represented
in training data or poorly represented.

**Metacognitive regulation**: monitoring the current process + actively
controlling it. Subdivided into:
- *Planning*: selecting strategies before beginning
- *Monitoring*: tracking progress and quality during execution
- *Evaluation*: assessing the outcome
- *Error detection*: noticing when something has gone wrong
- *Inhibitory control*: suppressing automatic but wrong responses

LLMs have weak versions of some of these (chain-of-thought prompting gets
some monitoring, structured prompts get some planning) but they are all
**externally imposed**, not intrinsic. The LLM itself has no meta level.

**This is precisely what Organon provides.** It is an externally imposed meta
level for LLM cognition. The question is whether it provides the *full*
structure of a functioning meta level or only parts of it.

---

## What Organon Already Implements (Meta-Level Mapping)

| Metacognitive Function | Current Organon Mechanism | Quality |
|----------------------|--------------------------|---------|
| Planning | ETHOS-first protocol, RFC before implementation | Partial — no strategy selection |
| Monitoring | Verification gates, health score | Present but one-directional |
| Evaluation | `organon health` | Aggregate, post-hoc |
| Error detection | Failing verification gates | Present |
| Inhibitory control | Invariants, Out of Scope sections | Present but prose-level |
| Metacognitive knowledge | ETHOS.md, PHILOSOPHY.md | Present but static |
| Confidence calibration | **Missing** | — |
| Working memory management | Progressive disclosure, frontmatter | Partial |
| Monitoring → Control feedback loop | **Missing** | — |

The gaps are structural, not just missing features:
1. **Monitoring is not bidirectional** — verification gates report failures but
   there is no mechanism for the object level to signal uncertainty *during*
   generation (only after)
2. **No confidence calibration** — all definitions and relationships are treated
   as equally certain
3. **No monitoring → control feedback loop** — a failed gate stops the process
   but does not feed back into *how* the next attempt should differ

---

## Key Research Insights and Their Organon Implications

### 1. Predictive Processing (Friston, Clark)

The brain is not a passive receiver of information — it is a **prediction
machine**. It continuously generates predictions about what it will perceive
and updates based on prediction errors. Perception itself is inference.

The hierarchy is:
```
Higher cortex   → generates prediction ("I expect to see a face")
                ← receives prediction error ("actually a hand")
Lower cortex    → generates prediction ("I expect edge at position X")
                ← receives prediction error ("no edge there")
Sensory surface → raw signal
```

Each level predicts the level below it and updates on error. The brain
minimizes *prediction error* across all levels simultaneously.

**Organon mapping:**

The RFC/implement/verify cycle *is* a predictive processing loop:
- **RFC = prediction** — "I predict this design will satisfy these invariants
  and produce correct behavior"
- **Implementation = instantiating the prediction** — making it concrete enough
  to test
- **Verification gates = prediction error signals** — "your prediction was
  wrong in these specific ways"
- **Health score = cumulative prediction accuracy** — how well the system's
  predictions (organon definitions, invariants) match reality (passing tests)

This reframes the methodology from "follow a process" to "run a cognitive
inference loop." The LLM is not just generating — it is forming hypotheses and
testing them against a formal error signal.

**Design implication:** Prediction errors should be **precise and localized**.
In the brain, a vague error signal ("something is wrong") is less useful than
a precise one ("edge expected at position X, found at position X+3"). Organon's
verification gates should return structured error objects — not pass/fail
binaries — so the prediction-error signal can guide correction effectively.

### 2. Inhibitory Control as the Primary Function of Invariants

One of the most critical and surprising findings in cognitive neuroscience:
the dominant function of the prefrontal cortex is not generation — it is
**suppression**. The PFC inhibits responses that are automatic, habitual,
or contextually wrong. Patients with PFC damage can state a rule perfectly
and then immediately violate it, because they cannot suppress the automatic
response.

Current Organon framing: invariants are *rules to follow*.
Reframing: invariants are **inhibitory control circuits** — they suppress
classes of wrong outputs before they are emitted.

This is more than semantic. Inhibitory control research shows:

- **Specificity matters**: a vague inhibitory signal ("be careful") is nearly
  useless. A precise inhibitory signal ("do not X in context Y") is effective.
  Vague invariants produce the cognitive equivalent of anxiety — they create
  hesitation without clear direction. Precise invariants produce clean refusals.

- **Suppression must be early**: inhibitory control is most effective when
  applied *before* the response is fully formed, not after. This maps to
  having invariants in the LLM's context *before* generation begins, not
  checked after the fact.

- **Inhibition has a cost**: in the brain, sustained inhibitory control is
  effortful and degrades under load. An LLM with too many invariants in context
  will suppress some effectively and miss others. This suggests **domain-scoped
  invariants loaded only when relevant** are more effective than a global list.

**Design implication:** Invariants should be written as precise suppression
targets, not general guidance. The more specific the inhibitory signal, the
less hallucination penetrates it.

### 3. Epistemic Markers and Confidence Calibration

The brain tags beliefs with confidence levels — the metacognitive feeling of
knowing. This is not a post-hoc judgment; it is a signal generated *during*
retrieval and inference that influences how the belief is used downstream.

LLMs produce all outputs with uniform surface confidence. This is the deepest
source of hallucination: a false claim is indistinguishable from a true claim
in the output stream.

**Organon as epistemic marking system:**

Every definition, relationship, and implementation claim in an organon has an
implicit epistemic status. Making it explicit gives both humans and LLMs
better-calibrated material to work with:

```yaml
definition:
  id: DEF-TOOLS-001
  name: Workflow
  epistemic_status: established    # established | provisional | hypothesized | contested
  evidence_basis: test_coverage    # test_coverage | review | empirical | derived
  confidence: high                 # high | medium | low
  last_challenged: 2026-01-15      # when was this last seriously examined?
```

`epistemic_status: provisional` signals to the LLM: "treat this carefully,
it may be wrong, prefer to verify before building on it."

`epistemic_status: established` with `evidence_basis: test_coverage` signals:
"this is load-bearing, tests back it, build on it confidently."

This is the monitoring signal flowing *up* from the object level: the
definitions themselves reporting their own reliability to whoever reads them.

**Connection to the observations system (RFC 005):** Observations are empirical
monitoring signals. They should reference the definitions they bear on and update
those definitions' epistemic status. The organon is a living epistemic model,
not a static specification.

### 4. Global Workspace Theory (Baars) and the MCP Architecture

Global Workspace Theory proposes that consciousness functions as a **broadcast
medium** — a shared workspace that makes information available simultaneously
to many specialized processors that otherwise operate independently:

```
Specialized processors:   Visual  Language  Motor  Memory  Emotional
                             ↑        ↑       ↑       ↑       ↑
                          ┌──────────────────────────────────┐
                          │         Global Workspace         │ ← broadcast medium
                          └──────────────────────────────────┘
                                Competition for access
```

Information enters the global workspace through attention. Once broadcast,
all processors receive it and can respond. The subjective feeling of "being
aware" of something is this broadcast happening.

The v0.6.0 MCP server architecture is **structurally identical**:

```
Specialized agents:   Planner  Implementer  Verifier  Reviewer  RFC-writer
                         ↑           ↑           ↑          ↑        ↑
                    ┌──────────────────────────────────────────────────┐
                    │              MCP Server / Organon Store          │
                    │    (broadcasts definitions, invariants, health)  │
                    └──────────────────────────────────────────────────┘
                              Query API as attention mechanism
```

The MCP query API is the **attention mechanism** — agents request what they
need, the workspace broadcasts it. The organon store is the global workspace
for project knowledge.

**Design implication:** The global workspace works because:
1. Information in the workspace is consistent — all processors see the same
   state (no divergent local copies)
2. Competition for the workspace is managed — only relevant information is
   broadcast at any time (not everything at once)
3. Processors are specialized — each does one thing well, uses workspace for
   coordination

This validates the MCP-driven routing direction and adds nuance: the routing
mechanism is not just UX convenience, it is the **attention mechanism** of the
global workspace. What gets routed to an agent determines what that agent "knows"
for that turn. Routing IS metacognitive control.

### 5. Working Memory and Progressive Disclosure

Human working memory holds approximately 4 meaningful chunks simultaneously
(Cowan, 2001 — a downward revision from Miller's "7±2"). This is a hard
constraint on object-level processing, not a design choice.

The brain's solution: **chunking** — binding multiple items into a single
meaningful unit that occupies one working memory slot. A skilled chess player
"sees" a board position as a few meaningful configurations, not 32 individual
pieces.

The LLM context window is the computational analog of working memory. The
organon's **progressive disclosure model** is a chunking strategy:

```
Layer 0: README-as-Router        ~50 tokens    (one chunk: "what exists here")
Layer 1: Frontmatter             ~25-50 tokens (one chunk: "what is this file")
Layer 2: Section headings        ~100 tokens   (one chunk: "what sections exist")
Layer 3: Specific section        variable      (one chunk: "invariants for X")
Layer 4: Full file               full cost     (multiple chunks)
```

Each layer is designed to fit in minimal working memory while enabling decisions
about whether to load the next layer.

**Design implication — chunking in the typed schema:** The TypeScript schema
exploration (types-as-ontology document) should encode domain knowledge as
meaningful chunks. A `DomainSchema` type with `definitions`, `relationships`,
`implementations` is a chunk — one slot in working memory — that expands into
detail on demand. The schema hierarchy IS the chunking strategy for LLM working
memory.

---

## The Structural Gap: The Monitoring → Control Feedback Loop

The single most important structural insight from metacognition research for
Organon is the **bidirectionality of the meta level**.

Current Organon is predominantly **top-down control**:
- ETHOS defines constraints (meta → object)
- Protocols define procedures (meta → object)
- Invariants suppress wrong behaviors (meta → object)

What is largely absent is **bottom-up monitoring**:
- The object level (LLM doing work) has no channel to signal its uncertainty
  to the meta level
- Definitions don't report their own epistemic status
- The LLM has no way to say "I'm in a domain I know poorly" or "this
  invariant is ambiguous in this context"
- Verification gates report binary pass/fail, not graduated confidence

A complete metacognitive system needs both flows. Without monitoring flowing
up, the meta level operates blindly — issuing control signals without feedback
on whether they're working.

**The feedback loop Organon needs:**

```
Meta Level (Organon)
  ├── Control signals down:
  │   ├── Invariants (suppress wrong behaviors)
  │   ├── Protocols (direct the process)
  │   ├── Routing (focus attention)
  │   └── Stopping conditions (verification gates)
  │
  └── Monitoring signals up:
      ├── Epistemic status of definitions (how certain are we?)
      ├── Health score (how well is the system working overall?)
      ├── Verification gate results (structured, not binary)
      ├── Coverage gaps (what's unverified?)
      └── LLM uncertainty signals (what did the LLM flag as unsure?)
```

The bottom half of this diagram is what needs to be built.

---

## Two-Phase Workflow: Generate and Verify as Distinct Cognitive Modes

In the brain, object-level processing and meta-level monitoring are handled by
distinct neural circuits. The prefrontal cortex (meta level) is activated
*after* prefrontal regions (generation) produce candidate outputs. The
separation is not just functional — it is architectural.

Conflating generation and verification in the same cognitive turn produces
worse outcomes than separating them. This is a well-established finding in
metacognition research: concurrent monitoring degrades the quality of
generation; retrospective monitoring is more effective.

**Current Organon**: the same LLM session generates and verifies. The same
prompt writes code and checks it.

**Target**: explicit phase separation.

```
Phase 1: GENERATE (object-level mode)
  - LLM generates without self-censoring
  - Uses organon definitions as input constraints (control signals)
  - Does NOT attempt self-verification during generation
  - Output: a candidate artifact (code, RFC, definition)

Phase 2: VERIFY (meta-level mode)
  - Separate invocation, explicitly metacognitive
  - Inputs: candidate artifact + organon invariants + epistemic status
  - Runs verification gates
  - Produces structured prediction-error signals
  - Output: pass + epistemic update, OR fail + specific error objects

Phase 3: CORRECT (object-level mode with error context)
  - LLM receives precise error objects from Phase 2
  - Corrects specific violations, not a full re-generation
  - Loop repeats until Phase 2 passes
```

This mirrors how the brain runs the prediction-error loop. The key property:
**Phase 2 must not know what Phase 1 intended** — it evaluates the artifact
on its own merits against the invariants, not against the LLM's stated intent.
This prevents motivated reasoning where the verifier rationalizes the generator's
choices.

---

## Implications for v0.6.0+ Design

### 1. Epistemic status as a first-class field

Every definition, relationship, and implementation in `.methodology/organon/`
should carry `epistemic_status`, `evidence_basis`, and `confidence`. The MCP
query API should expose these. LLMs querying the organon receive calibrated
material, not uniform-confidence assertions.

### 2. Verification gates return structured error objects

Binary pass/fail is a weak prediction-error signal. Gates should return:

```typescript
type GateResult = {
  gate: string
  passed: boolean
  errors: Array<{
    location: string    // which file, which definition
    invariant: string   // which invariant was violated
    expected: string    // what was expected
    actual: string      // what was found
    severity: 'blocking' | 'warning'
  }>
  confidence: number    // 0–1: how certain is the gate about its result?
}
```

This is a structured prediction-error signal. The LLM receiving it can perform
targeted correction, not full regeneration.

### 3. Explicit monitoring → control update cycle

The health check should not only measure the current state — it should update
the epistemic status of definitions based on what it finds. A definition with
100% test coverage and passing tests for 6 months upgrades from `provisional`
to `established`. An invariant that is frequently violated in practice downgrades
from `established` to `contested`.

The organon is a **living epistemic model** that updates as evidence accumulates.

### 4. Domain-scoped invariants loaded at generation time

Following the inhibitory control insight: invariants should be scoped and loaded
at the start of a generation turn, not appended for post-hoc checking. The MCP
routing mechanism should, as its first action, inject the relevant invariants
into the LLM context.

### 5. Phase-separated workflows in MCP routing

The MCP routing should implement explicit generate/verify phases:
- `organon_generate` returns a structured artifact template
- `organon_verify` takes the artifact and returns `GateResult[]`
- `organon_correct` takes errors and returns targeted correction prompts

These are three distinct tool calls with distinct cognitive modes, not one
continuous generation.

---

## Summary

Metacognition research gives Organon a precise model of what it is and what
it is missing:

**What Organon IS:** An externally imposed meta level for LLM cognition. It
provides the monitoring and control signals that LLMs cannot generate for
themselves. It is the prefrontal cortex to the LLM's generative cortex.

**What it currently does well:** Top-down control (invariants, protocols,
procedures). Bottom-up error detection (verification gates). Working memory
management (progressive disclosure).

**What is missing:**
1. **Bottom-up monitoring signals** — epistemic status, confidence calibration,
   uncertainty propagation from object level to meta level
2. **Structured prediction errors** — gates return binary, not localized errors
3. **Phase separation** — generate and verify run in the same cognitive turn
4. **Living epistemic model** — the organon does not update its own confidence
   based on accumulated evidence

Fixing these gaps closes the metacognitive loop. When the loop is closed,
Organon becomes not just a constraint system but a genuine intelligence
scaffold — one where the LLM's outputs continuously sharpen the organon's
model of itself, and the organon's model continuously sharpens the LLM's
outputs.

The methodology of the brain is: predict → act → observe error → update model
→ predict better. Organon should run the same loop.
