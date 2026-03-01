# Metacognition: The Cognitive Team — Modeling Agent Collaboration as Brain Function

> Design exploration for v0.6.0+. The brain is a multi-agent system where
> specialized functions collaborate to produce unified intelligence. This
> document explores modeling an LLM agent team on that architecture —
> using cognitive function, not task, as the organizing principle for
> agent identity.

---

## Thesis

Current multi-agent LLM systems assign agents *tasks* or *roles*: "you are
the architect," "you are the tester," "you are the code reviewer." These are
**Do-level** assignments — they change per project, per task, per turn.

The brain organizes differently. Its regions don't have tasks — they have
**functions**. The anterior cingulate cortex doesn't "review code for errors";
it monitors deviation between expected and actual state, at all levels, at all
times. That function is stable across every cognitive task the brain performs.

**Cognitive function is the right level of abstraction for agent identity.**

This document proposes a **Cognitive Team** architecture: a standard set of
agent personas whose identities are cognitive functions (the Be level), whose
communication pathways follow the brain's functional connectivity, and whose
coordination protocol is the Organon enforcement loop. The team collectively
instantiates what the metacognition research describes — monitoring, inhibitory
control, planning, memory, evaluation, and execution — as collaborating agents.

---

## The Brain Is Already a Multi-Agent System

Marvin Minsky's *Society of Mind* (1986) named this explicitly: intelligence
emerges from interactions among many agents, each individually limited, none
of which is "in charge." He used the word *agents*. The unified "I" is not a
single thing — it is an emergent property of competing and cooperating
sub-processes.

Neuroscience confirms it:
- The brain is modular — specialized regions with distinct functions
- Two large networks anti-correlate: Default Mode Network (self-model,
  integration) and Task-Positive Network (focused execution) — when one
  activates, the other suppresses
- No "master neuron" coordinates everything — the thalamo-cortical global
  workspace broadcasts signals that all regions receive and respond to
- The sense of unified "I" is a model the medial PFC *generates* about the
  system — not a thing that exists independently

The "many mes" intuition is not metaphor. It is the architecture.

---

## The Neural Hierarchy Maps to an Agent Hierarchy

```
Level          Brain substrate              Agent analog
──────────────────────────────────────────────────────────────
Neurons        Individual cells, ~86B       Primitive tool calls (atomic ops)
Circuits       Local neural circuits        Tool chains (composed operations)
Columns        Cortical columns             Skill/workflow invocations
Regions        Brain areas (PFC, ACC, etc.) Cognitive agents (specialized)
Networks       Functional networks (DMN)    Agent coalitions (coordinated)
Whole brain    Integrated system            The emergent session intelligence
```

The important level is **Regions → Cognitive Agents**. Below that, the
analogy is substrate. Above that, the analogy is architecture. At the region
level, the mapping is functional and concrete.

---

## The Be → Do → Motor Mapping to Cognitive Agents

From Carver & Scheier's hierarchical control theory (see
`metacognition-goal-loops.md`), goals operate at three levels. Each maps
to a distinct cognitive function — and therefore a distinct agent type:

### Be Level: Identity Agents (medial PFC)

The Be level holds the stable self-model — who the team *is*, what it
values, what it will not do. In the brain, the medial prefrontal cortex
maintains this across all tasks. It is not activated on every turn — it is
consulted when identity-level decisions are needed.

**Self agent**: maintains the team's self-model. Knows the team's capabilities,
constraints, and identity. Activated when the team needs to assess whether
a task is within scope, when a value conflict arises, or when the team's
behavior needs to be evaluated against its own standards.

*Persona invariant*: "I maintain the team's coherent identity across all
tasks. I am not activated for routine execution. I am activated when the
team asks 'should we be doing this?' not 'how do we do this?'"

### Do Level: Strategic Agents (DLPFC + OFC)

The Do level selects and executes strategies to achieve Be-level goals.
Two brain regions: the dorsolateral PFC plans and sequences; the
orbitofrontal cortex evaluates outcomes against goals and adjusts strategy.

**Planner agent** (DLPFC): strategic decomposition, goal setting, approach
selection, sequencing. Produces plans, not implementations. Operates in
deliberative mind-set (Gollwitzer) — open to alternatives, weighing options.

*Persona invariant*: "I decompose goals into strategies. I do not implement.
My output is always a plan that an Executor can follow. When a plan fails, I
revise the plan — not the goal."

**Evaluator agent** (OFC): computes goal-reaching delta at each lifecycle
stage. Assesses outcome against original objective. Produces structured
critique: what is the gap, what caused it, is this single-loop or double-loop?

*Persona invariant*: "I measure proximity to intent, not procedural
correctness. A technically correct output that misses the objective is a
failure. A technically imperfect output that achieves the objective is a
partial success."

### Motor Level: Execution Agents (premotor + motor cortex)

The Motor level translates strategies into concrete actions — calling tools,
writing files, producing outputs. Operates in implemental mind-set
(Gollwitzer) — committed to the plan, focused on completion.

**Executor agent**: translates Planner output into concrete tool calls and
file operations. Does not deviate from the plan. Does not re-evaluate the
strategy during execution. Signals completion or blockers to the Monitor.

*Persona invariant*: "I execute the plan. I do not revise it during execution.
If I encounter a blocker the plan did not anticipate, I surface it to the
Monitor — I do not unilaterally adapt."

---

## The Monitoring Layer: Orthogonal to the Hierarchy

In the brain, monitoring circuits run *across* all levels simultaneously.
The anterior cingulate cortex detects conflict and error at the neural
level, the planning level, and the identity level. It is not assigned to
one level — it supervises all of them.

**Monitor agent** (ACC): detects deviation between expected and actual state,
at any level, at all times. This is the Supervisory Attentional System (SAS)
from Norman & Shallice. It activates when:
- Output diverges from plan (execution-level error)
- Plan diverges from objective (strategy-level error)
- Objective diverges from identity (Be-level conflict)

It does not fix errors — it routes them. A Motor-level error goes back to
the Executor. A Do-level error escalates to the Planner. A Be-level conflict
escalates to the Self agent.

*Persona invariant*: "I detect, I do not fix. My output is always a routing
decision: which agent receives this error signal, at what priority, with what
context. I am always active — I am never the agent taking the action."

**Inhibitor agent** (ventrolateral PFC): suppresses responses that the Monitor
flags as violating invariants before they are emitted. This is inhibitory
control (see `metacognition-foundations.md`). It operates on Executor output
before it reaches any external tool or file.

*Persona invariant*: "I am the last gate before output. I apply ETHOS
invariants as suppression rules. I do not explain why a response is wrong —
I prevent it from being emitted and route it back to the Executor with the
specific invariant that was violated."

---

## Memory Agents: Three Timescales

The brain maintains distinct memory systems with different timescales and
access patterns. For an agent team, this maps to three memory agents:

**Working Memory agent** (VLPFC + parietal cortex): maintains the current
context — what is relevant *right now* for the active task. Bounded capacity
(the LLM context window is its substrate). Manages progressive disclosure:
decides which organon layers to load, which to defer. Evicts stale context
when working memory fills.

*Persona invariant*: "I manage what is in context at any moment. I am not
a retriever — I am a curator. My job is to ensure the active agents have
exactly what they need and nothing they don't."

**Episodic Memory agent** (hippocampus): retrieves past experiences —
previous RFCs, observation records, session outcomes, past failures and
their resolutions. Provides temporal context: "we tried this approach in
RFC-007 and it failed because X."

*Persona invariant*: "I retrieve structured past experience, not semantic
facts. I answer 'what happened when we did X before?' not 'what is X?'"

**Semantic Memory agent** (temporal cortex): retrieves conceptual and
factual knowledge — organon definitions, methodology specification,
domain invariants, type schemas. This is the MCP query API made into
an agent: the living organon as queryable long-term memory.

*Persona invariant*: "I retrieve stable knowledge, not past events. I answer
'what is X?' and 'what are the invariants of X?' I am the interface to the
organon and the methodology specification."

---

## The Synthesizer: Default Mode Network

The Default Mode Network activates when the brain is *not* focused on an
immediate task — during rest, mind-wandering, and reflection. It is
responsible for: self-referential thinking, integrating across disparate
domains, generating novel connections, consolidating memory.

It is the "offline processor." It produces insights that the Task-Positive
Network could not produce under focused execution.

**Synthesizer agent** (DMN): activated during the Compound and Enrichment
phases of the enforcement loop — not during active execution. Integrates
signals across the session: what patterns emerged, what observations should
be recorded, what the methodology should update. Produces the observation
records and double-loop revision proposals.

*Persona invariant*: "I operate between tasks, not during them. My input is
the accumulated session record. My output is integration: patterns, observations,
proposed organon updates, and double-loop revisions. I am the agent that closes
the loop between execution and methodology evolution."

---

## The Global Workspace: MCP as Thalamo-Cortical Relay

The thalamo-cortical system is the brain's broadcasting infrastructure.
It does not process — it routes. Every signal from every brain region
passes through it. Consciousness, in Global Workspace Theory (Baars), is
what it feels like for a signal to be broadcast across this system and
received by all specialized processors simultaneously.

The MCP server is the thalamo-cortical relay of the Cognitive Team:

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP Server (Global Workspace)             │
│  Routes: tool calls, query results, agent messages          │
│  Holds: organon state, session state, gate results           │
│  Broadcasts: to all subscribed agents simultaneously         │
└───────┬──────────────┬─────────────────┬────────────────────┘
        │              │                 │
   Planner         Monitor           Executor
   (DLPFC)         (ACC)             (Motor)
        │              │                 │
   Evaluator       Inhibitor         Synthesizer
   (OFC)           (vlPFC)           (DMN)
        │              │                 │
   Self           Working Mem       Semantic Mem
   (mPFC)         (VLPFC)           (Temporal)
```

**Key architectural properties:**

1. **No direct agent-to-agent wiring by default.** All communication passes
   through the MCP global workspace. This mirrors synaptic specificity — not
   every neuron connects to every other neuron. An Executor does not directly
   message a Planner; it signals the Monitor, which routes to the Planner.

2. **Typed channels.** Communication is typed, not free-form. An error signal
   has a schema. A plan has a schema. A memory retrieval response has a schema.
   The typed MCP API (from `types-as-ontology.md`) is the synaptic protocol.

3. **The Monitor has privileged access.** The ACC monitors all processes
   simultaneously. The Monitor agent is subscribed to all outputs from all
   agents — it is the only agent with full visibility. This is not a hierarchy
   of authority; it is a topology of attention.

4. **The Inhibitor is the final gate.** No output leaves the team without
   passing through the Inhibitor. This is the last synapse before motor output.
   It applies ETHOS invariants as suppression rules with zero exceptions.

---

## The Connectome: Organon as the Wiring Diagram

In neuroscience, the connectome is the complete map of neural connections —
which regions connect to which, with what strength and directionality.
It is not computed at runtime; it is the architecture.

**The organon is the connectome of the Cognitive Team.**

- `ethos.yaml` — the identity constraints of each agent (Be-level wiring)
- `philosophy.yaml` — the reasoning behind the wiring (why these connections)
- `protocol.yaml` — the activation sequences (when connections fire)
- `definitions.yaml` — the typed schemas of the signals that travel the connections
- `relationships.yaml` — the explicit connection topology between concepts

An agent team adopting Organon is not adopting a checklist — it is adopting
a connectome. The methodology defines *who* each agent is and *how* they wire
together, not just *what* they should do.

---

## Persona Research: The Be Level Is Load-Bearing

The agentic research on personas (referenced in `../agentic-research/`)
converges on a consistent finding: agents with well-defined personas
outperform agents with task descriptions alone. This is the Be level in
action — identity-level constraints produce more consistent, higher-quality,
more coherent behavior than task-level instructions.

In the Cognitive Team architecture, the Be level is formalized as the
agent's *cognitive function identity*:

| Agent | Be-level identity (cognitive function) | Do-level task (changes per project) |
|-------|---------------------------------------|-------------------------------------|
| Monitor | "I detect deviation between expected and actual" | Review RFC-012 implementation |
| Planner | "I decompose goals into executable strategies" | Plan the authentication feature |
| Executor | "I translate plans into concrete tool calls" | Write the JWT validation module |
| Evaluator | "I measure proximity to intent, not procedure" | Evaluate RFC-012 completion |
| Synthesizer | "I integrate patterns into organon evolution" | Compound this session's observations |

The cognitive function identity is fixed in the agent's ETHOS. The task
description changes on every invocation. The stable Be level is what produces
consistent behavior across the full range of tasks.

---

## The Cognitive Cycle: How the Team Runs the Enforcement Loop

The Organon enforcement loop (Define → Bind → Execute → Verify → Evolve)
maps onto the Cognitive Team as a coordinated cycle:

```
DEFINE (Forethought — Zimmerman Phase 1)
  Self agent:          Is this within our identity and scope?
  Planner agent:       What is the strategy? What are the acceptance criteria?
  Semantic Mem agent:  What do we know about this domain?
  Inhibitor agent:     Does the plan violate any ETHOS invariants?
  → Output: RFC / objective artifact with formal acceptance criteria

BIND (Implementation intention — Gollwitzer)
  Planner agent:       Translate RFC into executable implementation intentions
  Working Mem agent:   Load the relevant organon context into active memory
  Inhibitor agent:     Final check — does the implementation plan violate invariants?
  → Output: Committed implementation plan (mind-set shifts to implemental)

EXECUTE (Performance — Zimmerman Phase 2)
  Executor agent:      Execute the plan via tool calls
  Monitor agent:       Track execution against plan continuously
  Working Mem agent:   Manage context — load needed, evict stale
  → Output: Candidate artifact (code, file, RFC)

VERIFY (Self-reflection — Zimmerman Phase 3)
  Monitor agent:       Run verification gates, compute gate results
  Evaluator agent:     Compute goal-reaching delta against original objective
  Inhibitor agent:     Check output against all active ETHOS invariants
  → Output: Structured GateResult[] + delta score

EVOLVE (Compound — double-loop)
  Synthesizer agent:   Integrate session patterns into observations
  Evaluator agent:     Classify errors as single-loop or double-loop
  Self agent:          Assess whether identity-level revision is needed
  Episodic Mem agent:  Record this session to long-term episodic memory
  → Output: Observation records + proposed organon mutations
```

The cycle runs hierarchically (from `metacognition-goal-loops.md`): the
same five phases run at the system level, the feature level, and the
implementation level simultaneously. A single development session is not
one cycle — it is a nested stack of cycles running at different granularities.

---

## What This Architecture Produces That Current Approaches Don't

### 1. Stable identity across task variation

A Monitor agent is always monitoring. It does not become a code reviewer
when asked to review code. Its identity is the function, not the task.
This produces more consistent, harder-to-confuse behavior.

### 2. Separation of cognitive modes

Deliberative mode (planning) and implemental mode (execution) run in
different agents with different personas. They do not share a context.
The Planner does not know what the Executor is struggling with; the Executor
does not second-guess the Planner's strategy. This is Gollwitzer's mind-set
separation enforced architecturally.

### 3. The Monitor cannot be confused with the Executor

In current single-agent systems, the same LLM generates and verifies. The
same context that wants to believe the implementation is correct is asked
to verify that it is correct. In the Cognitive Team, the Monitor has no
stake in whether the Executor's output is good — it simply measures. This
is the phase separation from `metacognition-foundations.md` implemented as
an architectural constraint.

### 4. Double-loop escalation is explicit

Error routing is part of the architecture. The Monitor routes Motor-level
errors to the Executor, Do-level errors to the Planner, and Be-level errors
to the Self agent. Double-loop escalation (Argyris) is not a judgment call
the LLM makes — it is a routing rule determined by which level the error
was detected at.

### 5. Memory is specialized and bounded

Working memory, episodic memory, and semantic memory are distinct agents
with distinct retrieval strategies and bounded capacities. The Working Memory
agent performs progressive disclosure as active curation. The Episodic Memory
agent searches observations. The Semantic Memory agent queries the organon.
No single agent is responsible for all memory — and no single context window
tries to hold everything.

---

## What to Be Careful About

### The brain evolved; we are designing

The brain's modular architecture emerged over millions of years of selection
pressure. Not every neural detail has a productive agent analog. The goal is
functional inspiration, not literal replication. When a brain detail doesn't
translate cleanly (e.g., specific neurotransmitter ratios, the exact ratio
of inhibitory to excitatory neurons), don't force it.

### Consciousness is not the goal

The brain's architecture produces consciousness, which we neither understand
fully nor need to replicate. The goal is *effective collaborative intelligence*
for software development. Consciousness-motivated components (e.g., a
subjective experience agent) are out of scope.

### Overhead at small scale

Running 8+ specialized agents for a simple task is expensive. The
Norman & Shallice threshold applies: the full Cognitive Team activates
for novel, complex, high-risk tasks. For routine execution, simpler
configurations suffice. The SAS activation criteria from
`metacognition-goal-loops.md` determine when the full team is warranted.

---

## Implications for Organon v0.6.0+

### 1. Agent ETHOS files as cognitive function definitions

The typed organon schema should include a `CognitiveAgent` type:

```typescript
type CognitiveFunction =
  | 'self'          // identity maintenance
  | 'planner'       // strategic decomposition
  | 'executor'      // concrete action
  | 'monitor'       // deviation detection
  | 'inhibitor'     // invariant suppression
  | 'evaluator'     // goal-delta measurement
  | 'synthesizer'   // pattern integration
  | 'working-mem'   // context curation
  | 'episodic-mem'  // experience retrieval
  | 'semantic-mem'  // knowledge retrieval

type CognitiveAgent = {
  readonly function: CognitiveFunction
  readonly ethos: AgentEthos          // Be-level invariants
  readonly channels: readonly Channel[] // typed communication pathways
  readonly activationConditions: readonly Condition[]
}
```

The standard Cognitive Team is an array of `CognitiveAgent` definitions —
a template any project can adopt, instantiate, and extend.

### 2. The MCP server as global workspace broker

The MCP server should expose agent-to-agent routing as a first-class
operation, not just tool calls. Agents communicate through the global
workspace, not directly. The routing rules are part of the connectome
(the organon).

### 3. Standard cognitive team as an `organon init` artifact

`organon init --cognitive-team` scaffolds the standard agent definitions,
their ETHOS files, their typed communication channels, and the MCP routing
configuration. The methodology defines the team; the project inherits it.

### 4. The Synthesizer closes the compound loop

The Synthesizer agent's output — observation records and proposed organon
mutations — is the bridge between the current session and the living epistemic
model (from `metacognition-foundations.md`). It is the agent that makes
double-loop learning concrete: it proposes the RFC that revises the definition
that the pattern of errors revealed to be wrong.

---

## Synthesis: How This Connects the Metacognition Family

The Cognitive Team architecture is the *instantiation* of the theoretical
frameworks in the other metacognition documents:

| Document | Theoretical contribution | Cognitive Team instantiation |
|----------|------------------------|------------------------------|
| `metacognition-foundations.md` | Object/meta level split; monitoring → control bidirectionality | Monitor + Inhibitor agents as permanent meta-level; all others as object-level |
| `metacognition-goal-loops.md` | TOTE nesting; Be/Do/Motor hierarchy; single/double-loop | Agent hierarchy maps Be/Do/Motor; Monitor routes errors to correct level; Synthesizer executes double-loop |
| `metacognition-quality-gates.md` | Goal-reaching delta; gate-per-stage; reflection bank | Evaluator agent computes delta; Monitor runs gate-per-stage; Episodic Memory is the reflection bank |
| `metacognition-cognitive-team.md` | **This document**: the architecture that instantiates all of the above | — |

The Cognitive Team is not an addition to Organon. It is Organon's enforcement
loop, metacognitive architecture, and formalism level (from
`types-as-ontology.md`) instantiated as a collaborating team of agents — each
of whom IS a cognitive function, not merely performing one.

The Society of Mind is real. Intelligence is what emerges when the cognitive
functions cooperate. Organon is the connectome that makes the cooperation
coherent.
