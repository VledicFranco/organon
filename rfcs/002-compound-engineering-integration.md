---
type: rationale
scope: meta
name: compound-engineering-integration
version: "1.0"
summary: Make explicit the recursive, self-improving nature of human+machine collaboration. Compounding improvements emerge from deliberate iteration, self-correction, and progressive automation.
token_estimate: 9500
status: draft
created: 2026-02-10
author: Claude Sonnet 4.5
related_files:
  - ../book-llms/ETHOS.md
  - ../book-llms/PHILOSOPHY.md
  - ../book-llms/three-layer-architecture.md
  - ../book-llms/patterns.md
load_priority: high
audience: [llm, human]
---

# RFC 002: Recursive Collaboration Pattern

> Make explicit the recursive, self-improving nature of Organon methodology. "Compound Engineering" describes the emergent property where systematic human+LLM collaboration produces exponential efficiency gains through recursive iteration, self-correction, and progressive automation. The goal is effective collaboration; compounding is the side effect.

---

## Status

**Current State:** Draft

**Next Milestone:** Review and team approval

| Transition | Date | Notes |
|------------|------|-------|
| → Draft | 2026-02-10 | Initial RFC created |

---

## Problem Statement

**From the methodology's perspective:**

The Organon methodology currently defines a five-step enforcement loop:

```
Define → Bind → Execute → Verify → Evolve
```

This loop describes **what happens**, but says nothing about **how humans and LLMs should collaborate** during execution. Three critical gaps:

### 1. Missing "Compound" Step

The loop includes "Evolve" (update organon based on learnings) but doesn't make compounding explicit as a distinct workflow phase. In practice, effective LLM-human collaboration follows a four-step rhythm:

- **Plan** — Define the approach
- **Work** — Execute with focus
- **Review** — Validate results
- **Compound** — Capture learnings, improve tools/workflow/organon

The current "Evolve" step is conceptually correct but doesn't provide guidance on **when** and **how** to compound. Teams treat it as "someday we'll update the organon" rather than a deliberate phase of every significant work cycle.

### 2. No Time Allocation Guidance

Workflows and protocols specify steps but provide no heuristics for **time allocation**. How much time should be spent on planning vs execution? When should you stop working and start reviewing? Without guidance:

- LLMs over-plan (spend 30% of session on design when 10% would suffice)
- LLMs under-review (rush to completion without validation)
- Compounding never happens (no time budget reserved for improvement)

### 3. No Parallel Verification Pattern

The methodology defines verification gates but presents them as sequential (do work → then verify). This creates two problems:

- Verification becomes a bottleneck (wait for all work to finish before checking anything)
- Late feedback (discover violations after significant investment)

Effective LLM-agent collaboration uses **parallel verification**: run verification tools continuously during work, not just at the end.

**Result:** The methodology is theoretically complete but operationally incomplete. It describes the loop structure but not the collaboration rhythm.

---

**Current state:** Enforcement loop has 5 steps. No time allocation heuristics. Verification described as post-work gate.

**Desired state:** Enforcement loop explicitly includes "Compound" as a distinct step. Time allocation heuristics guide session planning. Parallel verification is a documented pattern.

---

## Why This Enables Compounding

**Core insight:** Compounding improvements are not the PRIMARY goal—they're an emergent property of the methodology's structure.

**Primary goal:** Effective human+machine collaboration through recursive iteration.

**Emergent result:** Exponential efficiency gains over time (compounding).

### The Mechanism

The methodology achieves compounding through three structural properties:

#### 1. Recursive Structure

Each loop iteration feeds learnings into the next:

```
Cycle 1: Define → Bind → Execute → Verify → Compound → Evolve
   ↓ (learnings feed forward)
Cycle 2: Define (informed by Cycle 1) → Bind → Execute → Verify → Compound → Evolve
   ↓ (more learnings)
Cycle 3: Define (informed by Cycles 1+2) → ...
```

**Not linear progression but circular improvement.** Each cycle doesn't just complete work—it generates knowledge that makes the next cycle faster.

#### 2. Self-Correction

The methodology improves itself:
- **Meta-organon:** Methodology documents itself (dogfooding)
- **RFC-driven evolution:** Constraints that prove impractical get evolved
- **Workflows refine:** Unclear steps get clarified based on execution
- **Tools improve:** Repeated manual work gets automated

**The methodology is its own test subject.** When we discover better collaboration patterns, we update the methodology. This self-correction prevents stagnation.

#### 3. Progressive Automation

Work moves through tiers over time:

```
Manual (Tier 1)
  ↓ (recognize pattern)
Semi-automated (Tier 2) — Tools assist, humans orchestrate
  ↓ (automation matures)
Automated (Tier 3) — Tools execute, humans review
```

**Each tier unlocks the next.** Automation creates time → time enables more automation → more automation creates more time. This is the compounding mechanism.

### Example: Compounding in Action

```
Session 1: RFC Implementation (100 units of effort)
├─ Manual: Read RFC, load context manually (15 units)
├─ Manual: Write ETHOS.md from scratch (30 units)
├─ Manual: Verify frontmatter manually (10 units)
├─ Manual: Run tests, check coverage (20 units)
└─ COMPOUND: Notice repeated steps, create tool (5 units)
    └─ Create: rfc:load-context script (saves 10 units next time)

Session 2: Similar RFC Implementation (80 units of effort)
├─ Semi-automated: Use rfc:load-context tool (5 units, was 15)
├─ Manual: Write ETHOS.md (30 units)
├─ Automated: Pre-commit hook validates frontmatter (0 units, was 10)
├─ Manual: Run tests (20 units)
└─ COMPOUND: Notice ETHOS pattern, create template (5 units)
    └─ Create: ethos-template generator (saves 20 units next time)

Session 3: Similar RFC Implementation (50 units of effort)
├─ Semi-automated: Use rfc:load-context (5 units)
├─ Semi-automated: Generate from ethos-template (10 units, was 30)
├─ Automated: Pre-commit validates frontmatter (0 units)
├─ Automated: CI runs tests on push (0 units, was 20)
└─ COMPOUND: Notice verification pattern (5 units)
    └─ Create: verify:all gate (saves 10 units next time)

Session 4: Similar RFC Implementation (30 units of effort)
├─ Automated: Load context via workflow (2 units, was 5)
├─ Semi-automated: Generate + customize ETHOS (8 units, was 10)
├─ Automated: Verification in CI (0 units)
└─ COMPOUND: ... (continues)
```

**Result:** 70% efficiency gain over 4 sessions. This is exponential (not linear) improvement.

**Why it compounds:**
1. **Time saved accumulates** - Each tool saves time in ALL future sessions
2. **Learning persists** - Heuristics prevent repeating mistakes
3. **Automation layers** - Tools build on tools (primitives → compositions)
4. **Capacity grows** - More time → more improvement → even more time

### Hypothesis: Exponential, Not Linear

**Hypothesis:** Teams using recursive improvement methodology will achieve exponential efficiency gains, not linear.

**Validation mechanism:**
- **Metric:** Time to complete similar tasks across sessions
- **Expected pattern:** Exponential decay for repeated work types
- **Example:** RFC implementation: Session 1 (40h) → Session 2 (28h) → Session 3 (20h) → Session 4 (14h)
- **Counter-example:** Novel work stays flat (no compounding for one-off tasks, which is expected)

**Proof of compounding:** If methodology is working, similar tasks get EXPONENTIALLY faster, not just incrementally faster. This RFC makes the recursive structure explicit so compounding happens deliberately, not accidentally.

---

## Proposed Solution

**Make the methodology's recursive, self-improving nature explicit** by updating methodology documentation:

1. **book-llms/ETHOS.md** — Add core principles about recursive improvement, self-correction, and progressive automation (the mechanisms that enable compounding)

2. **book-llms/three-layer-architecture.md** — Update enforcement loop to include explicit "Compound" step and parallel verification pattern (making recursion operational)

3. **book-llms/patterns.md** — Add "Recursive Collaboration Pattern" (formerly "Compound Engineering Pattern") with Four-Step Loop, time allocation heuristics, and collaborative semantic review (HOW to execute recursive improvement)

4. **book-llms/PHILOSOPHY.md** — Add design decisions explaining why compounding is emergent (not goal) and why recursive structure enables it

**Key reframing:** This RFC doesn't just add a "compound" step—it makes explicit the structural properties (recursive, self-correcting, progressively automating) that cause compounding. These properties were always present but never documented.

This is a **methodology refinement**, not a breaking change. All existing organon files remain valid. New guidance makes the recursive nature explicit so compounding happens deliberately instead of accidentally.

---

## Organon Impact

> This RFC updates methodology documentation to integrate Compound Engineering principles.

### Create

None (all changes are updates to existing methodology files).

### Update

**`book-llms/three-layer-architecture.md`** — Update enforcement loop

Add explicit "Compound" step and parallel verification pattern:

```markdown
## The Enforcement Loop (Updated)

The three layers form a closed loop with six phases (Compound Engineering integration):

```
┌──────────────────────────────────────────────────────────────┐
│  1. DEFINE                                                   │
│     Human encodes intent as organon constraints + protocols  │
│     → ETHOS.md, PROTOCOLS.md                                 │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  2. BIND                                                     │
│     Workflow translates protocol into LLM-executable steps   │
│     → Workflow bindings reference protocol + tools           │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  3. EXECUTE                                                  │
│     LLM reads workflow, orchestrates tools in sequence       │
│     → Tool invocations: generate, verify, test               │
│     → PARALLEL VERIFICATION: Verification runs continuously  │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  4. VERIFY                                                   │
│     Tools check organon compliance, invariants hold          │
│     → Verification results: pass/fail per gate               │
│     → Fast feedback: violations caught early via parallel    │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  5. COMPOUND                                                 │
│     Capture learnings, improve methodology itself            │
│     → Update workflows (better tool sequences)               │
│     → Create new tools (automate repeated manual steps)      │
│     → Refine protocols (better verification gates)           │
│     → Update heuristics (better decision guidance)           │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  6. EVOLVE                                                   │
│     Results inform organon updates, new invariants captured  │
│     → Updated ETHOS.md, new protocols, refined principles    │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       └──────────────── back to DEFINE ───────→
```

### Compound vs Evolve: The Distinction

**Compound (Step 5):** Improves the **methodology itself** — workflows, tools, protocols. Makes the system more efficient. Happens frequently (after every major work session).

**Evolve (Step 6):** Updates the **domain organon** — ETHOS.md, PHILOSOPHY.md, invariants. Changes the constraints. Happens less frequently (when constraints change or new ones emerge).

**Example:**
- After implementing an RFC, you notice the RFC workflow has unclear steps → **Compound**: Update the workflow for clarity
- After implementing an RFC, you discover a new invariant that all RFCs should follow → **Evolve**: Add invariant to methodology organon

Both are improvement, but operate at different levels.

### Parallel Verification Pattern

Traditional workflow:
```
Plan → Work → Work → Work → Verify → (violations found, rework needed)
```

Parallel verification:
```
Plan → Work (verify running) → Work (verify running) → Work (verify running) → Final verify → (clean)
```

**Implementation:** During EXECUTE phase, run lightweight verification tools continuously:
- File watchers trigger organon:validate-frontmatter on save
- Pre-commit hooks run reference integrity checks
- CI runs full verification suite

**Benefit:** Violations caught minutes after introduction, not hours. Reduces rework cost by 10x.

See new section "Parallel Verification Pattern" below for detailed implementation guidance.
```

Add new section after "Verification: The Loop Closer":

```markdown
## Parallel Verification Pattern

**The problem:** Traditional verification runs after work completes. Violations discovered late require significant rework.

**The solution:** Run verification tools continuously during execution, not just at the end.

### Implementation Tiers

| Tier | When | Tools | Latency |
|------|------|-------|---------|
| **Real-time** | On file save | IDE integration, file watchers | <1 second |
| **Pre-commit** | Before git commit | Git hooks | <10 seconds |
| **CI (fast)** | On push | Lightweight gates (frontmatter, references) | <2 minutes |
| **CI (full)** | On PR | All verification gates | <10 minutes |

### What to verify in parallel

**During work (continuous):**
- Frontmatter syntax validity (catches YAML errors immediately)
- Reference existence (file paths, RFC refs)
- Token estimate accuracy (warns if file growing beyond estimate)

**Pre-commit (before snapshot):**
- Frontmatter truthfulness (counts match content)
- Invariant coverage (every invariant has test)
- Code style and formatting

**CI (before merge):**
- Full verification suite (all gates)
- Tier-4 tests (semantic invariant checks)
- Drift detection (auto-generated files fresh)

### Benefits

| Metric | Traditional | Parallel | Improvement |
|--------|-------------|----------|-------------|
| Time to detect violation | End of work session | Minutes after introduction | 10-100x faster |
| Rework cost | High (late detection) | Low (early detection) | 5-10x cheaper |
| Developer confidence | Low (surprises at PR) | High (continuous feedback) | Qualitative |

### Implementation Example

```yaml
# .github/workflows/verify-continuous.yml
name: Parallel Verification
on: [push]

jobs:
  verify-fast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Frontmatter validity
        run: npm run organon:validate-frontmatter
      - name: Reference integrity
        run: npm run organon:verify -- --gate=references
      # Fast gates only (<2 min total)
```

### When NOT to use parallel verification

- Expensive verification (>10 seconds per run) should stay in CI
- Verification requiring external resources (API calls) should be batched
- Non-deterministic checks (flaky tests) should not block work
```

---

**`book-llms/patterns.md`** — Add Compound Engineering Pattern

Add new pattern after "RFC-Driven Evolution Pattern":

```markdown
## Compound Engineering Pattern

**The problem:** LLM-human collaboration lacks guidance on time allocation and improvement cycles. Without structure:
- Planning phases run too long (over-design before execution)
- Review phases run too short (incomplete validation)
- Improvement never happens (no time reserved for compounding)

**The solution:** A four-step collaboration rhythm with explicit time allocation heuristics.

### The Four-Step Loop

```
PLAN (10-20% of session)
  ↓
WORK (60-70% of session)
  ↓
REVIEW (10-20% of session)
  ↓
COMPOUND (5-10% of session)
  ↓
(repeat)
```

### Phase Definitions

**PLAN** — Define the approach before executing
- What's the goal? (Success criteria)
- What's the scope? (What's in/out)
- What's the approach? (High-level strategy)
- What are the risks? (Known unknowns)
- **Output:** Written plan (can be 2-3 paragraphs, doesn't need to be formal)

**WORK** — Execute with focus
- Implement the plan
- Use tools (generate, verify, test)
- Parallel verification running continuously
- Stop when scope complete or time budget exhausted
- **Output:** Working code, passing tests, updated organons

**REVIEW** — Validate results before declaring done
- Does it meet success criteria?
- Do all verification gates pass?
- Are there edge cases we missed?
- Did we violate any invariants?
- **Output:** Confirmation that work is complete, or list of remaining issues

**COMPOUND** — Capture learnings, improve the system
- What was harder than expected? (Add heuristic)
- What steps did we repeat? (Create tool)
- What was unclear? (Update protocol)
- What did we learn? (Update organon if constraint changed)
- **Output:** Updated workflow/protocol/tool/heuristic (optional: updated organon if constraints changed)

### Time Allocation Heuristics

| Session Length | Plan | Work | Review | Compound |
|----------------|------|------|--------|----------|
| **30 min** | 5 min | 20 min | 4 min | 1 min |
| **1 hour** | 8 min | 42 min | 8 min | 2 min |
| **2 hours** | 15 min | 90 min | 20 min | 5 min |
| **4 hours** | 30 min | 180 min | 40 min | 10 min |

**The 80/20 rule:** Spend 80% of time on WORK, 20% on PLAN+REVIEW+COMPOUND. This prevents over-planning and ensures progress.

**The 10% compound rule:** Reserve at least 5-10% of session for compounding. Without explicit reservation, compounding never happens (work expands to fill available time).

**Flexible allocation:** These are starting points, not rigid rules. Adjust based on:
- Complex problem → more PLAN (up to 25%)
- Well-understood problem → less PLAN (down to 5%)
- High-risk change → more REVIEW (up to 25%)
- Routine change → less REVIEW (down to 5%)
- New workflow → more COMPOUND (up to 15%)

### "Trust with Guardrails" Principle

**The principle:** Trust LLMs to execute workflows autonomously, but provide guardrails that catch violations early.

**What this means:**
- **Trust:** LLMs don't need humans to approve every step. Let them work through PLAN → WORK → REVIEW phases autonomously.
- **Guardrails:** Parallel verification, pre-commit hooks, CI gates catch violations before they land. Verification is automated, not manual.
- **Human checkpoint:** Humans review during COMPOUND phase and at final merge. Not every micro-decision.

**Implementation:**
```
┌─────────────────────────────────────────┐
│   LLM Autonomous Zone                   │
│   ┌─────┐   ┌─────┐   ┌─────┐          │
│   │PLAN │ → │WORK │ → │REVIEW│          │
│   └─────┘   └─────┘   └─────┘          │
│   Guardrails running continuously ────► │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Human Checkpoint                      │
│   ┌─────────┐                           │
│   │COMPOUND │ ← Human reviews results   │
│   └─────────┘    + improvement ideas    │
└─────────────────────────────────────────┘
```

**Why this works:**
- LLMs are fast at execution (WORK phase)
- Humans are good at judgment (COMPOUND phase)
- Verification catches rule violations (GUARDRAILS)
- Combines strengths, minimizes weaknesses

### When to Compound

**After every significant work session:**
- Completed an RFC implementation → Compound
- Fixed a complex bug → Compound
- Implemented a new feature → Compound

**Signal that compounding is needed:**
- You repeated the same manual steps 3+ times → Create tool
- Workflow was unclear or had missing steps → Update protocol
- You discovered a new heuristic ("When X, do Y") → Add to ETHOS.md
- Verification caught the same violation twice → Add gate or improve error message

**When NOT to compound:**
- Trivial changes (typo fixes, small edits) → No compound phase needed
- Work didn't reveal new insights → No compound needed (that's fine)
- Time-critical work → Defer compounding to retrospective

### REVIEW Phase: Collaborative Semantic Review

For complex artifacts (RFCs, organons, significant designs), use **collaborative semantic review** — a structured pattern where human and LLM review concepts together.

**The problem:** Traditional review approaches have limitations:
- Pure human review: Slow, might miss semantic inconsistencies
- Pure LLM review: No judgment, might miss context
- Async PR comments: Fragmented, no real-time dialogue

**The solution:** Synchronous, collaborative, concept-by-concept review.

#### The Pattern

```
1. DECOMPOSE
   - Break artifact into conceptual sections (not just headings)
   - Identify logical boundaries (Problem Statement, Proposed Solution, etc.)
   - Create review sequence (usually: foundational concepts first)

2. ANALYZE (LLM-led)
   For each concept:
   - Semantic analysis: Question assumptions, check coherence
   - Identify gaps: What's missing? What's unclear?
   - Check consistency: Does this contradict earlier sections?
   - Present findings as questions, not assertions
   - Output: "Here's what I found, what do you think?"

3. JUDGE (Human-led)
   For each concept:
   - Provide context LLM doesn't have
   - Make decisions: "This makes sense" or "This needs refinement"
   - Add domain knowledge, user perspective, strategic priorities
   - Resolve ambiguities
   - Output: Clear direction ("accept", "refine X", "reject Y")

4. REFINE (Collaborative)
   - LLM updates artifact based on human judgment
   - Human confirms changes or requests iteration
   - Move to next concept when aligned
   - Output: Refined section, ready for next concept

5. REPEAT
   - Continue until all concepts reviewed
   - Final pass: Check cross-concept consistency
   - Output: Artifact ready for approval or implementation
```

#### When to Use

**Use collaborative semantic review for:**
- Complex RFCs (novel domains, significant changes)
- New organon files (ETHOS, PHILOSOPHY for new domains)
- Significant design decisions (architecture changes)
- Methodology evolution (changes to how we work)

**Don't use for:**
- Simple changes (typo fixes, small edits)
- Low-stakes reviews (internal docs, temporary notes)
- Time-critical work (async review is faster)

**Time allocation:** 40-60% of REVIEW phase time (for complex artifacts)

#### Example: RFC Review Session

```
2-hour session, 20 min allocated to REVIEW:

├─ DECOMPOSE (2 min)
│  └─ Break RFC into: Problem Statement, Proposed Solution,
│     Organon Impact, Success Metrics
│
├─ ANALYZE + JUDGE + REFINE (15 min, iterative)
│  ├─ Concept 1: Problem Statement
│  │  └─ LLM: "Three gaps identified. Are they distinct? Is Gap 2 really
│  │     a gap or just missing documentation?"
│  │  └─ Human: "Gap 2 is real. Gap 1 and 3 might overlap. Let's combine."
│  │  └─ LLM: Refines Problem Statement
│  │  └─ Human: "Good, move on."
│  │
│  ├─ Concept 2: Proposed Solution
│  │  └─ [same pattern]
│  │
│  └─ ... (continue through concepts)
│
└─ FINAL CONSISTENCY CHECK (3 min)
   └─ Does solution actually solve all stated problems?
   └─ Any contradictions between sections?
```

#### Why This Works

**LLM strengths:**
- Tireless analysis (can question every assumption)
- Pattern recognition (spot inconsistencies across sections)
- Thoroughness (won't skip hard questions out of politeness)

**Human strengths:**
- Context (knows unstated constraints, history, politics)
- Judgment (can make calls when multiple options are valid)
- Prioritization (knows what matters most)

**Combined:** Fast, thorough, contextual review.

#### Anti-Pattern: Async-Only Review

**Bad pattern:**
```
Write RFC → Post for review → Wait for comments → Address comments → Repeat
Timeline: 1-2 weeks of wall-clock time
```

**Good pattern (collaborative):**
```
Write RFC → Schedule 2-hour review session → Review concept-by-concept
→ Refine in real-time → Done
Timeline: 2 hours of focused time
```

**When async is better:** Multiple stakeholders need to review (can't all be in session).

**When collaborative is better:** Complex artifact, need deep semantic analysis, single decision-maker available.

#### Integration with Four-Step Loop

Collaborative semantic review is a **specific technique for the REVIEW phase**, used when reviewing complex artifacts:

```
PLAN → WORK → REVIEW (use collaborative semantic review for complex artifacts) → COMPOUND
```

Not every REVIEW needs collaborative semantic review (simple changes use standard checks). But for RFCs, organons, and complex designs, this pattern ensures thorough validation before moving to COMPOUND.

### Compound vs Evolve

**Compound** improves methodology (workflows, tools, protocols). Happens frequently.

**Evolve** updates constraints (ETHOS.md, PHILOSOPHY.md). Happens when learning changes what "should be."

| Scenario | Compound or Evolve? | Example |
|----------|-------------------|---------|
| Workflow step was unclear | **Compound** | Update protocol.md for clarity |
| Repeated manual step 3x | **Compound** | Create automation tool |
| Verification caught same issue twice | **Compound** | Improve gate or error message |
| Discovered new architectural constraint | **Evolve** | Add invariant to ETHOS.md |
| Trade-off reasoning changed | **Evolve** | Update PHILOSOPHY.md |

Both are valuable. Compound happens more often (every session). Evolve happens less often (when constraints change).

### Example: RFC Implementation with Compound

```
SESSION 1 (2 hours)
├─ PLAN (15 min)
│  └─ Read RFC, load organon context, plan implementation phases
├─ WORK (90 min)
│  └─ Implement Phase 1 (domain layer + tests)
├─ REVIEW (20 min)
│  └─ Run verification, check coverage, validate tests
└─ COMPOUND (5 min)
   └─ Notice: RFC context loading takes 5 manual steps
   └─ Create: `rfc:load-context` tool to automate it
   └─ Update: RFC workflow to use new tool

SESSION 2 (2 hours)
├─ PLAN (15 min)
│  └─ Plan Phase 2 (organon updates)
├─ WORK (90 min)
│  └─ Create ETHOS.md, PHILOSOPHY.md per RFC spec
│  └─ Use `rfc:load-context` tool (faster than Session 1!)
├─ REVIEW (20 min)
│  └─ Run verification, all gates pass
└─ COMPOUND (5 min)
   └─ Notice: Discovered new invariant (all RFCs need "Organon Impact" section)
   └─ Evolve: Add INV-RFC-3 to methodology/rfcs/ETHOS.md
```

Notice: Compound in Session 1 made Session 2 faster. That's the point.

### Anti-Pattern: No Compound

**Bad pattern:**
```
Session 1: Plan → Work → Review → Done (no compound)
Session 2: Plan → Work → Review → Done (no compound)
Session 3: Plan → Work → Review → Done (no compound)
Result: Repeating same manual steps, never improving efficiency
```

**Good pattern:**
```
Session 1: Plan → Work → Review → Compound (create tool)
Session 2: Plan → Work (faster!) → Review → Compound (update workflow)
Session 3: Plan → Work (even faster!) → Review → Compound (add heuristic)
Result: Each session builds on previous, efficiency compounds
```

### Integration with Enforcement Loop

The Four-Step Loop (Plan → Work → Review → Compound) happens **within** the EXECUTE phase of the Enforcement Loop:

```
Enforcement Loop (macro):
  Define → Bind → [EXECUTE: Four-Step Loop] → Verify → Compound → Evolve

Four-Step Loop (micro):
  Plan → Work → Review → Compound (repeats within EXECUTE phase)
```

The Four-Step Loop is the **operational rhythm**. The Enforcement Loop is the **architectural structure**.
```

---

**`book-llms/PHILOSOPHY.md`** — Add design decisions

Add new design decisions after existing decisions:

```markdown
### N. Compounding as Emergent Property

**Choice:** Frame compounding as emergent result of recursive structure, not as primary goal

**The realization:** Early drafts positioned "compounding" as the goal ("Compound Engineering Integration"). But compounding is actually a SIDE EFFECT—the emergent property of three structural characteristics: recursive iteration, self-correction, and progressive automation.

**Why this matters:**
- **Primary goal:** Effective human+machine collaboration
- **Mechanism:** Recursive, self-correcting structure with progressive automation
- **Result:** Exponential efficiency gains (compounding)

**The shift:** From "here's how to compound" to "here's how to collaborate effectively, which naturally compounds." This reframing is more accurate and more powerful—it explains WHY compounding happens (structural properties) rather than just prescribing THAT it should happen.

**Trade-off:** More conceptual complexity (three properties vs one goal). But the complexity is essential—it's the actual mechanism. Simplifying to "just compound" obscures how the methodology works.

### N+1. Compound as Explicit Step

**Choice:** Make "Compound" a distinct phase in the enforcement loop, separate from "Evolve"

**Benefit:** Forces explicit improvement cycles. Prevents "we'll improve it later" (which means never).

**Why we chose explicit compounding:** Generic "continuous improvement" fails because it has no time budget and no trigger. By making Compound a distinct step (5-10% of session time), improvement becomes scheduled, not aspirational. The distinction from Evolve (compound = improve methodology, evolve = update constraints) clarifies WHAT to improve and WHEN.

**Trade-off:** Adds cognitive overhead (another step to remember). But the alternative (ad-hoc improvement) leads to methodology stagnation. Better to spend 5% of time deliberately improving than 0% accidentally never improving.

### 11. Time Allocation Heuristics

**Choice:** Provide explicit time allocation guidance (80/20 rule, 10% compound budget) instead of leaving it implicit

**Benefit:** Prevents common failure modes (over-planning, under-reviewing, never compounding)

**Why we chose explicit heuristics:** LLM-human collaboration is still a new domain. Without guidance, LLMs optimize for "finish fast" (skip review) or "be thorough" (over-plan). Humans don't know when to intervene. Explicit percentages create shared expectations. The 80/20 rule (80% work, 20% overhead) is proven in project management. Adapting it to LLM sessions makes collaboration predictable.

**Trade-off:** Heuristics can be misinterpreted as rigid rules. Documentation emphasizes they're starting points, not mandates. Flexibility is preserved via "adjust based on" guidance.

### 12. Trust with Guardrails

**Choice:** Trust LLMs to execute autonomously during Plan → Work → Review, with parallel verification as guardrails

**Benefit:** Fast execution (LLMs work uninterrupted) + safety (violations caught early via automation)

**Why we chose trust + guardrails:** Pure manual oversight (human approves every step) is too slow. Pure trust (no verification) is too risky. The middle ground: LLMs work autonomously, automated verification runs continuously, humans review results and handle compounding. This division leverages each agent's strengths (LLM = fast execution, verification = rule checking, human = judgment).

**Trade-off:** Requires investment in verification tooling upfront. But the alternative (manual review of everything) doesn't scale. Automated guardrails pay for themselves after ~10 sessions.
```

---

**`book-llms/ETHOS.md`** — Add core principles and properties

Add new section after Invariants, before existing Principles:

```markdown
## Core Properties

The Organon methodology achieves compounding through three structural properties:

### 1. Recursive Structure

Each loop iteration (Define → Bind → Execute → Verify → Compound → Evolve) feeds learnings into the next. Not linear progression but circular improvement. Work in Cycle N generates knowledge that makes Cycle N+1 faster. This recursion is not accidental—it's the fundamental mechanism of the methodology.

### 2. Self-Correction

The methodology improves itself through dogfooding (meta-organon), RFC-driven evolution (constraints that prove impractical get refined), and workflow refinement (unclear steps get clarified). When methodology constraints don't work, they evolve. This prevents stagnation and ensures the methodology stays practical.

### 3. Progressive Automation

Work moves through tiers: Manual (human does it) → Semi-automated (tools assist) → Automated (tools execute, humans review). Each tier unlocks the next: automation creates time, time enables more automation. This is the compounding mechanism—improvements accumulate exponentially, not linearly.

**Result:** Compounding improvements emerge naturally from these properties. The methodology is DESIGNED to compound, not just ASPIRE to compound.
```

Update Principles section (renumber existing principles):

```markdown
## Principles (Prioritized)

1. **LLM-centric design.** Organons exist to be consumed and executed by LLMs. Every design decision — frontmatter, standardized sections, decision heuristics, protocol bindings — optimizes for LLM parsing and action. LLMs are the interface between human intent and automated enforcement. Humans define the "what" and "why"; LLMs execute the "how."

2. **Enforcement through automation.** Organons that aren't enforced become fiction. Every constraint should have a path to automated verification. Protocols bind to workflows that orchestrate tools that check invariants. The enforcement loop (Define → Bind → Execute → Verify → Compound → Evolve) is what makes organons real. A constraint without an enforcement path is a suggestion.

3. **Recursive improvement by design.** The methodology improves itself through iteration. Each cycle generates learnings that feed into the next cycle. Improvements compound: better tools → faster execution → more time for improvement → even better tools. This recursive nature is not accidental—it's the mechanism that makes the methodology sustainable at scale. Compounding is an emergent property of recursive collaboration, not a separate goal.

4. **Compound deliberately.** Reserve 5-10% of every significant work session for improving the system itself (tools, workflows, protocols). Without explicit time allocation, improvement never happens. Compounding is distinct from evolution: compound improves methodology (how we work), evolve updates constraints (what we're building).

5. **Clarity over completeness.** A short, clear ethos beats a comprehensive but vague one.

6. **Progressive disclosure over monolithic loading.** Structure every file so agents can access it in layers — frontmatter for discovery, sections for targeted loading, full file only when needed. This is how token efficiency is achieved at scale.

7. **Constraints over explanations.** State what to do, not why. Put "why" in philosophy.

8. **Specificity over generality.** "Never force-push to master" beats "Be careful with git."

9. **Actionable over aspirational.** "Run tests before merging" beats "Maintain code quality."
```

Update Decision Heuristics section:

```markdown
## Decision Heuristics

### When allocating time in work sessions

| Situation | Action |
|-----------|--------|
| Starting new work session | Reserve 80% for WORK, 10-20% for PLAN+REVIEW, 5-10% for COMPOUND |
| Complex/novel problem | Increase PLAN to 20-25%, decrease WORK proportionally |
| Well-understood routine task | Reduce PLAN to 5-10%, increase WORK proportionally |
| High-risk change (production, security) | Increase REVIEW to 20-25%, decrease WORK proportionally |
| Low-risk change (docs, tests) | Reduce REVIEW to 5%, increase WORK proportionally |
| Discovered repeated manual work | Increase COMPOUND to 15%, create automation tool |
| Trivial change (typo, small edit) | Skip COMPOUND phase entirely |

### When to compound vs evolve

| Situation | Action |
|-----------|--------|
| Workflow step unclear or missing | **Compound:** Update PROTOCOLS.md for clarity |
| Repeated same manual steps 3+ times | **Compound:** Create automation tool |
| Verification caught same violation twice | **Compound:** Improve gate or error message |
| Discovered new architectural invariant | **Evolve:** Add to ETHOS.md via RFC if needed |
| Trade-off reasoning changed | **Evolve:** Update PHILOSOPHY.md |
| Heuristic emerged from experience | **Compound first** (add to workflow), **Evolve later** if it becomes pattern |

[... existing heuristics continue ...]
```

---

**`book-llms/PROTOCOL.md`** (if one exists for methodology work)

If there's a protocol for "How to execute a complex task," update it to reference Four-Step Loop. If not, no new file needed (guidance in patterns.md is sufficient).

---

### Delete

None

---

## Technical Implementation

> This RFC updates documentation only. No code changes required.

### Implementation Plan

**Week 1: Core Updates (Enforcement Loop)**

**Day 1-2: Update three-layer-architecture.md**
- [ ] Revise enforcement loop diagram (5 steps → 6 steps: add Compound)
- [ ] Add section: "Compound vs Evolve: The Distinction"
- [ ] Add section: "Parallel Verification Pattern" with implementation tiers
- [ ] Add table: Benefits of parallel verification
- [ ] Update related examples to reference new step

**Day 3: Update ETHOS.md**
- [ ] Add Principle 3: "Compound deliberately"
- [ ] Renumber subsequent principles (shift by 1)
- [ ] Add decision heuristics for time allocation
- [ ] Add decision heuristics for compound vs evolve

**Day 4: Update PHILOSOPHY.md**
- [ ] Add Decision 10: "Compound as Explicit Step"
- [ ] Add Decision 11: "Time Allocation Heuristics"
- [ ] Add Decision 12: "Trust with Guardrails"
- [ ] Update trade-offs table

**Day 5: Update patterns.md**
- [ ] Add "Compound Engineering Pattern" after RFC-Driven Evolution
- [ ] Four-Step Loop definition
- [ ] Time allocation heuristics table
- [ ] "Trust with Guardrails" principle
- [ ] When to Compound guidance
- [ ] Example: RFC Implementation with Compound
- [ ] Anti-pattern: No Compound
- [ ] Integration with Enforcement Loop

**Deliverable:** Methodology documentation updated with Compound Engineering principles

---

**Week 2: Review and Refinement**

**Day 1: Cross-reference validation**
- [ ] Check all internal links work
- [ ] Verify no contradictions with existing patterns
- [ ] Update frontmatter token_estimate fields
- [ ] Run organon:validate-frontmatter

**Day 2: Example refinement**
- [ ] Ensure examples are concrete and actionable
- [ ] Add more anti-pattern examples if needed
- [ ] Verify time allocation heuristics are clear

**Day 3-4: Stakeholder review**
- [ ] Share with methodology reviewers
- [ ] Address feedback
- [ ] Iterate on wording/clarity

**Day 5: Finalize and merge**
- [ ] Update RFC status: Draft → Implementing → Implemented
- [ ] Merge PR with all updates
- [ ] Update changelog

**Deliverable:** RFC completed, methodology updated, stakeholders aligned

---

### Design Decisions (Technical)

**Decision 1: Documentation-only change**
- **Rationale:** These concepts integrate naturally into existing methodology structure. No code changes needed.
- **Benefit:** Fast implementation (documentation edits, not refactoring)
- **Trade-off:** Depends on humans/LLMs reading and applying guidance (no automated enforcement of "did you compound?")

**Decision 2: Parallel verification as pattern, not invariant**
- **Rationale:** Parallel verification is a "should" (best practice), not a "must" (invariant). Different projects have different tooling capabilities.
- **Benefit:** Flexibility — projects can adopt incrementally (start with pre-commit, add CI later, add real-time last)
- **Trade-off:** Some projects may skip it entirely. But making it mandatory would be too rigid.

**Decision 3: Time percentages as heuristics, not rules**
- **Rationale:** Different tasks need different allocations. Rigid rules create friction.
- **Benefit:** Clear starting point (80/20, 10% compound) + flexibility ("adjust based on...")
- **Trade-off:** Some LLMs may misinterpret heuristics as strict rules. Documentation emphasizes flexibility.

**Decision 4: Compound separate from Evolve**
- **Rationale:** Conflating them leads to neither happening (too vague). Separation clarifies intent.
- **Benefit:** Compound (methodology improvement) happens frequently. Evolve (constraint changes) happens when needed. Both get explicit attention.
- **Trade-off:** More concepts to learn. But the distinction maps to real behavior (improving tools ≠ changing rules).

---

## Success Metrics

- [ ] **Adoption rate** — ≥50% of pilot projects report using Four-Step Loop within 4 weeks
- [ ] **Compound frequency** — Pilot projects report compounding after ≥50% of significant work sessions
- [ ] **Time allocation** — Pilot projects report spending ~80% of time on WORK (not over-planning or skipping review)
- [ ] **Parallel verification** — ≥30% of pilot projects implement at least 1 parallel verification tier (pre-commit or CI-fast)
- [ ] **Compounding validation** (CORE METRIC) — Pilot projects demonstrate exponential (not linear) efficiency gains for repeated work types over 3+ sessions. Example: Similar RFC implementations take 40h → 28h → 20h → 14h (exponential decay pattern). This validates the hypothesis that recursive structure enables compounding.
- [ ] **Qualitative feedback** — LLM developers report "clearer collaboration rhythm" and "less uncertainty about when to improve"

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Heuristics misinterpreted as rigid rules | Medium | Documentation emphasizes "starting points" and "adjust based on context" |
| "Compound" seen as optional overhead | High | Make explicit: 5-10% time reservation, show compounding examples with clear ROI |
| Parallel verification too complex to adopt | Medium | Provide incremental path (pre-commit → CI-fast → real-time), not all-or-nothing |
| LLMs struggle with time allocation math | Low | Provide reference table (session length → exact minutes per phase) |
| Confusion between Compound and Evolve | Medium | Clear distinction in docs: Compound = methodology, Evolve = constraints. Decision heuristics table. |

---

## Open Questions

### Resolved (Pre-RFC)

1. ✅ **Should Compound be in the enforcement loop or separate?** → In the loop, between Verify and Evolve
2. ✅ **Are time percentages too prescriptive?** → Frame as heuristics with flexibility guidance
3. ✅ **Is parallel verification a pattern or invariant?** → Pattern (best practice, not mandate)

### Still Open

1. **Should organon-tools provide a "compound checklist" tool?**
   - **Options:**
     - (A) Add `organon compound` command that prompts: "What repeated steps? What unclear workflows?"
     - (B) Leave as human judgment, no tool
   - **Recommendation:** (A) for V2, after seeing how teams use Compound phase in practice

2. **Should time allocation be configurable in organon frontmatter?**
   - **Example:** `time_allocation: { plan: 15, work: 75, review: 8, compound: 2 }`
   - **Recommendation:** No. Heuristics in documentation are sufficient. Configuration adds complexity without clear benefit.

---

## Dependencies

**Blocks:**
- Future RFC on "Compound Engineering Workflow" (if we create automated tooling for compounding)
- Future updates to workflow templates (include time allocation guidance)

**Blocked by:**
- None (can implement immediately)

**Related work:**
- RFC 001 (Testing Framework) — Tier-4 tests are an example of parallel verification (run during development)
- Any future "workflow quality" work should reference Four-Step Loop

---

## Related Files

| File | Relationship |
|------|--------------|
| [book-llms/three-layer-architecture.md](../book-llms/three-layer-architecture.md) | Updated to include Compound step and parallel verification |
| [book-llms/patterns.md](../book-llms/patterns.md) | Updated to include Compound Engineering Pattern |
| [book-llms/ETHOS.md](../book-llms/ETHOS.md) | Updated principles and heuristics for time allocation |
| [book-llms/PHILOSOPHY.md](../book-llms/PHILOSOPHY.md) | Updated with design decisions for Compound, time allocation, trust with guardrails |

---

## Approval Process

**Review criteria:**
- [ ] Methodology updates are clear and internally consistent
- [ ] No contradictions with existing methodology
- [ ] Examples are concrete and actionable
- [ ] Heuristics provide clear guidance without being rigid
- [ ] Changes are backwards-compatible (existing organons remain valid)

**Reviewers:**
- [ ] @organon-methodology (methodology coherence)
- [ ] @llm-collaboration-experts (time allocation heuristics)
- [ ] @early-adopters (practitioner perspective)

**Timeline:**
- Draft complete: 2026-02-10
- Review period: 1 week
- Target acceptance: 2026-02-17
- Implementation start: 2026-02-18
- Delivery: 2026-02-21 (1 week implementation)

---

## Next Steps

1. **Request review** — Share RFC with stakeholders for feedback
2. **Iterate on open questions** — Decide on compound checklist tool, time allocation config
3. **Acceptance vote** — Methodology team approval required to proceed
4. **Begin implementation** — Week 1: Core updates (enforcement loop, patterns, ethos, philosophy)
5. **Validate consistency** — Cross-reference checks, frontmatter validation
6. **Merge and close** — Update RFC status to Implemented, merge PR

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-02-10 | Initial draft | Claude Sonnet 4.5 |
