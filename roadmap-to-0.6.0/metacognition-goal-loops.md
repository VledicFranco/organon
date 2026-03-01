# Metacognition: Goal-Directed Loops and Self-Regulation

> Research exploration for v0.6.0+. How cognitive science models the
> objective → plan → execute → validate → refine loop — and what that
> reveals about Organon's current gaps and how to close them.

---

## The Question

Is there theory about meta processes of the brain to run structured loops of:
objective setting → planning → execution → validation → refinement?

Yes — this is one of the most studied areas in cognitive science. Several
frameworks address it at different levels of analysis. They are not competing
theories; they describe the same loop from different angles.

---

## TOTE: The Foundational Structure (Miller, Galanter & Pribram, 1960)

The earliest formal model of goal-directed behavior in cognitive science.
Published in *Plans and the Structure of Behavior*, it proposed that all
intentional action reduces to a single recursive unit:

```
┌─────────────────────────────────────┐
│  Test: current state == goal state? │
│         YES → Exit                  │
│         NO  ↓                       │
│  Operate: take action to close gap  │
│         ↓                           │
│  (loop back to Test)                │
└─────────────────────────────────────┘
```

**Test → Operate → Test → Exit**

The critical insight: **TOTE units nest inside TOTE units**. The "Operate"
step is itself a TOTE. Planning is a TOTE. Execution is a TOTE. Refinement
is a TOTE. The loop is fractal — the same structure runs at every level of
abstraction simultaneously.

This is the computational skeleton of all goal-directed cognition. Every
framework below is an elaboration of this basic structure.

---

## Self-Regulation Theory (Zimmerman)

The most direct match to the objective → plan → execute → validate → refine
sequence. Three phases, each with distinct sub-processes:

```
Phase 1: FORETHOUGHT (before execution)
  ├── Goal setting       — what am I trying to achieve, specifically?
  ├── Strategic planning — what sequence of steps will achieve it?
  └── Self-efficacy      — do I have the capacity to execute this plan?

Phase 2: PERFORMANCE (during execution)
  ├── Self-control       — executing the chosen strategy
  └── Self-monitoring    — tracking quality and progress during execution

Phase 3: SELF-REFLECTION (after execution)
  ├── Self-evaluation    — how does outcome compare to goal?
  ├── Causal attribution — why did it succeed or fail?
  └── Self-reaction      — adapt the strategy, or revise the goal itself?
```

**Self-reaction** in Phase 3 is the pivot point. It determines where the loop
re-enters:

- If the strategy was wrong → feed back into Phase 1 strategic planning
- If the goal itself was wrong → feed back into Phase 1 goal setting
- If the execution was weak → feed back into Phase 2 self-control

The loop is not simply Refine → Execute again. Refinement can escalate all
the way back to the objective. Most system designs only implement the shallow
re-entry (redo the execution). Zimmerman's model makes explicit that deep
re-entry (revise the goal) is equally valid and often more correct.

---

## Hierarchical Control Theory (Carver & Scheier, 1982)

Extends the loop into a **hierarchy of concurrent feedback loops**, grounded
in cybernetics and control theory. Goals are not flat — they are organized
in levels, and each level regulates the level below it:

```
Level 3: Be goals     — identity-level goals ("be a rigorous engineer")
    ↕  error signal flows both directions
Level 2: Do goals     — strategy-level goals ("implement this RFC correctly")
    ↕  error signal flows both directions
Level 1: Motor goals  — action-level goals ("write this specific function")
```

At each level: compare current state to the reference value (goal) → error
drives the level below → the level below acts → state changes → compare again.

**The loop runs at all levels simultaneously.** While you are executing at
Level 1, you are also monitoring at Level 2, and a persistent error at Level 2
can revise the reference value at Level 1 without escalating all the way to
Level 3.

Refinement is level-sensitive:

| Where the error is detected | Where refinement happens |
|----------------------------|--------------------------|
| Action fails (Level 1) | Adjust the action — stay at Level 1 |
| Strategy is failing (Level 2) | Revise the Do goal — escalate to Level 2 |
| Pattern of strategy failures | Revise the Be goal — escalate to Level 3 |

**The key insight for Organon:** the RFC/implement/verify sequence runs at
Level 2 (strategy). But the organon's domain definitions and invariants run at
Level 3 (be goals). A persistent pattern of verification failures at Level 2
should trigger revision of the domain model at Level 3 — not just more
iterations at Level 2.

---

## Single-Loop vs Double-Loop Learning (Argyris, 1977)

The sharpest framework for understanding the **refinement** step specifically.
Two qualitatively different kinds of learning from error:

```
Single-loop learning:
  Error detected
      ↓
  Adjust action to fix the error
      ↓
  Retry within the same goal/assumption
  (the governing variable is never questioned)

Double-loop learning:
  Error detected
      ↓
  Question the governing variable (goal, assumption, value)
      ↓
  Revise the governing variable
      ↓
  New action from a different premise
```

**Examples in software development:**

| Error | Single-loop response | Double-loop response |
|-------|---------------------|---------------------|
| Test fails | Fix the code | Reconsider the spec |
| Verification gate fails | Fix the implementation | Revise the RFC |
| Pattern of RFC failures | Write better RFCs | Revise the domain model |
| Methodology not working | Follow it more carefully | Revise the methodology |

Most systems only implement single-loop refinement because double-loop
requires questioning the goal — which feels like admitting the original
thinking was wrong. It is cognitively and organizationally expensive.
But it is precisely where genuine learning happens.

**Argyris also identified a pathology:** *defensive routines* — behaviors
that protect the governing variable from examination. An LLM that has been
told to follow an organon can develop a kind of defensive routine, faithfully
executing single-loop corrections while never questioning whether the organon
itself is wrong. The health check is a double-loop trigger only if it can
question the definitions, not just measure compliance with them.

---

## The Supervisory Attentional System (Norman & Shallice, 1986)

Addresses **when** the meta-loop activates. Two systems running in parallel:

**Contention Scheduling**: automatic, habit-based execution. Schemas run in
sequence without deliberate oversight. No meta-loop activation needed — the
routine handles it.

**Supervisory Attentional System (SAS)**: activates when automatic execution
is insufficient. The SAS is the meta-level controller that monitors contention
scheduling and overrides it when needed.

The five conditions that activate the SAS:

1. Novel situation — no existing schema applies
2. Error or near-miss detected — automatic execution produced wrong output
3. Strong competing responses — inhibitory control required
4. Planning required — the next step is not determined by the current schema
5. Overcoming a habitual response — the right action conflicts with the
   automatic one

**For LLMs:** the SAS equivalent is what Organon should be. The LLM's
pattern-completion runs automatically (contention scheduling). Organon
activates when the task is novel, error-prone, complex, or requires planning
— exactly the conditions where automatic generation is insufficient and
metacognitive supervision is needed.

This is also why Organon should not be applied to trivial tasks. Forcing SAS
activation when contention scheduling would suffice is expensive and
counterproductive. The methodology should have explicit thresholds for when
it activates.

---

## Gollwitzer's Deliberation-Implementation Model

Describes the **transition between planning and execution** as a qualitative
shift in cognitive mode — not just a sequential step:

**Deliberative mind-set** (pre-decisional, during planning):
- Open to information
- Weighs pros and cons
- Considers alternatives
- Reality-checking mode
- Accurate self-assessment

**Implemental mind-set** (post-decisional, during execution):
- Closed to alternatives — the decision is made
- Focused entirely on execution
- Optimistic — obstacles are minimized
- Filters out contradictory information
- Biased toward completion

The shift between these mind-sets is not automatic or costless. Staying in
deliberative mode during execution degrades performance (constant second-guessing).
Staying in implemental mode during planning degrades decision quality
(premature commitment, motivated reasoning).

**Gollwitzer's practical invention: implementation intentions.**
Pre-committing the execution response during planning dramatically improves
follow-through:

> "When situation X occurs, I will do response Y."

This bridges the planning-execution transition by making the action pre-decided.
The implemental mind-set doesn't have to figure out what to do — the plan
already specified it.

**For Organon:** protocols are implementation intentions — they pre-specify
the response to anticipated situations so the LLM can execute without
re-entering deliberative mode. The more precisely a protocol specifies
"when X, do Y," the more effectively it supports the implemental mind-set
during execution.

---

## The Complete Picture: How the Frameworks Compose

Each framework is a lens on a different aspect of the same loop:

| Framework | Primary Contribution |
|-----------|---------------------|
| TOTE | The basic recursive structure: test-operate-test-exit, fractally nested |
| Carver & Scheier | The loop runs hierarchically and concurrently at multiple levels |
| Zimmerman | The three phases and what each phase contains |
| Argyris | Refinement is either single-loop (fix action) or double-loop (revise goal) |
| Norman & Shallice | The meta-loop activates only under specific conditions — not always |
| Gollwitzer | Planning and execution require different cognitive modes; protocols bridge them |

Together they describe a loop that is:
- **Recursive**: the same structure at every level of abstraction (TOTE)
- **Hierarchical**: multiple loops running concurrently, each regulating the level below (Carver & Scheier)
- **Phased**: forethought, performance, and reflection are distinct modes (Zimmerman)
- **Bifurcated at refinement**: errors can trigger shallow or deep correction (Argyris)
- **Conditional at the meta level**: supervision activates only when needed (Norman & Shallice)
- **Mode-sensitive at the transition**: planning and execution require different mind-sets (Gollwitzer)

---

## Gaps This Reveals in Current Organon

### Gap 1: The loop is modeled as sequential, not hierarchical

Current Organon treats the loop as: RFC → implement → verify → done.
The brain runs the same loop at multiple levels simultaneously. A single
development session involves:

- System-level loop: is the architecture right?
- Feature-level loop: is this RFC right?
- Implementation loop: is this function right?
- Line-level loop: is this expression right?

All four are active concurrently. Organon's vertical structure (ETHOS →
PHILOSOPHY → PROTOCOL) maps to this hierarchy — but the enforcement mechanism
is horizontal (one RFC at a time, one gate at a time). The loops at different
levels should be able to trigger each other.

### Gap 2: No double-loop infrastructure

Current verification gates catch single-loop errors: the implementation
violated an invariant → fix the implementation. There is no mechanism for:
- A pattern of single-loop failures to escalate to double-loop revision of
  the RFC
- A pattern of RFC revisions to escalate to revision of the domain model
- A pattern of domain model failures to escalate to revision of the ETHOS

Double-loop learning requires the system to track *patterns across cycles*,
not just the outcome of the current cycle. The observations system (RFC 005)
is a step toward this — but it does not close the loop back into the organon.

### Gap 3: No explicit mind-set transitions

The current methodology does not distinguish between deliberative mode (RFC
design, planning) and implemental mode (execution, coding). The same LLM
session does both, often in the same context. This is cognitively expensive
and risks deliberative second-guessing during execution.

An explicit transition between RFC approval (end of deliberative mode) and
implementation start (beginning of implemental mode) — enforced by the MCP
routing — would improve both the quality of planning and the speed of
execution.

### Gap 4: SAS activation thresholds are undefined

Organon currently applies the same methodology to all tasks regardless of
complexity, novelty, or error risk. The Norman & Shallice model says the
SAS (meta-level supervision) should activate only when needed — for novel,
complex, error-prone, or planning-intensive situations.

A tiered activation model would make Organon less onerous for simple tasks
and more rigorous for complex ones:

| Task Complexity | Activation Level | Organon Scope |
|----------------|-----------------|---------------|
| Routine, low-risk | Contention scheduling | No gates — just execute |
| Moderately novel | Partial SAS | Light verification |
| Novel, complex, high-risk | Full SAS | Full RFC → implement → verify loop |

---

## Implications for v0.6.0+ Design

### 1. Pattern tracking across cycles (double-loop enabler)

The health system should track not just the current state but trends across
cycles. If the same invariant fails repeatedly across multiple RFCs, that is
a double-loop signal — the invariant or its scope may be wrong. If the same
domain definition requires repeated RFC revisions, that is a double-loop
signal about the definition itself.

### 2. Explicit phase gates in MCP routing

The MCP workflow should enforce the deliberative → implemental mind-set
transition explicitly:

```
organon_rfc_review    → deliberative mode: weighs alternatives, open to revision
organon_rfc_approve   → mind-set transition: plan is committed
organon_implement     → implemental mode: executes the committed plan
organon_verify        → reflection mode: evaluates outcome
organon_refine        → routes to: single-loop (re-implement) or double-loop (revise RFC)
```

`organon_refine` is the key routing decision: did the error occur at the
implementation level or the specification level? The answer determines which
mode to re-enter.

### 3. Hierarchical loop activation in the schema

The typed organon schema (see types-as-ontology document) should encode the
loop level of each artifact:

- `ethos.yaml` — Level 3 (Be goals): identity-level constraints
- `philosophy.yaml` — Level 3 supporting: reasoning about Be goals
- RFCs — Level 2 (Do goals): strategy-level plans
- Implementations — Level 1 (Motor goals): action-level code

A verification failure at Level 1 triggers refinement at Level 1.
A pattern of Level 1 failures escalates to Level 2.
A pattern of Level 2 failures escalates to Level 3.

This escalation logic should be explicit in the verification tooling, not
left to the LLM's judgment.

### 4. SAS activation criteria in PROTOCOL.md

Add explicit criteria for when the full Organon loop activates vs when
lighter-weight execution suffices. Tied to novelty, complexity, risk, and
whether planning is required. This reduces methodology overhead on simple
tasks while preserving rigor on complex ones.
