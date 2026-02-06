# Terminology: Ethos, Philosophy, and Protocol

> Foundational vocabulary for LLM-guided system development.

---

## The Problem

When humans collaborate with LLMs on complex systems, behavioral consistency becomes critical. An LLM working on a codebase today should make decisions compatible with the LLM (or human) who worked on it yesterday. Without explicit guidance artifacts, LLMs:

- Make locally reasonable but globally inconsistent decisions
- Reinvent approaches that contradict established patterns
- Drift from the system's intended character over time
- Waste tokens rediscovering context that should be given

Three distinct artifact types address this problem at different levels of abstraction.

---

## The Three Artifacts

```
┌─────────────────────────────────────────────────────────────────┐
│                         PHILOSOPHY                               │
│                                                                  │
│   "Why we do things this way"                                   │
│                                                                  │
│   Explanatory · Retrospective · Reasoning                       │
│   Answers: What is our thinking? What trade-offs did we make?   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                           ETHOS                                  │
│                                                                  │
│   "What we are and are not"                                     │
│                                                                  │
│   Normative · Prospective · Constraining                        │
│   Answers: What should we do? What is out of bounds?            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          PROTOCOL                                │
│                                                                  │
│   "How to accomplish specific tasks"                            │
│                                                                  │
│   Procedural · Operational · Step-by-step                       │
│   Answers: What are the exact steps? What is the sequence?      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Philosophy

**Definition:** A document that explains the reasoning, principles, and trade-offs behind a system's design. It answers *why* decisions were made.

**Purpose:** Understanding. A philosophy helps readers (human or LLM) comprehend the thinking that shaped the system. It provides intellectual context for decisions that might otherwise seem arbitrary.

**Characteristics:**
- Explanatory, not prescriptive
- Discusses alternatives considered and rejected
- Articulates values and priorities
- May include historical context
- Tolerates ambiguity ("it depends")

**Example statements:**
- "We chose eventual consistency over strong consistency because our read-to-write ratio is 1000:1 and users tolerate stale data for up to 5 seconds."
- "Documentation exists at three layers because each serves different consumers with different needs."
- "We prioritize developer experience over raw performance because iteration speed compounds."

**When to write philosophy:**
- When onboarding humans who need to understand *why*
- When decisions are non-obvious and require justification
- When trade-offs should be explicit for future reconsideration

**LLM consumption pattern:** Philosophy documents help LLMs understand context but don't directly constrain behavior. An LLM might read a philosophy to understand *why* a pattern exists, then consult the ethos to know *what* to do.

---

## Ethos

**Definition:** A normative document that establishes behavioral boundaries, identity constraints, and decision-making principles for a domain. It answers *what* should and should not be done.

**Purpose:** Behavioral consistency. An ethos ensures that any agent (human or LLM) working within a domain makes decisions aligned with the system's character. It is an operating contract.

**Characteristics:**
- Prescriptive, not explanatory
- Declares what IS and IS NOT (identity boundaries)
- States invariants that cannot be violated
- Provides decision heuristics for ambiguous situations
- Prioritizes when principles conflict
- Concrete enough to be actionable

**Example statements:**
- "Genesis delegates, never executes. It has no repository access."
- "When uncertain between two valid approaches, prefer the simpler one."
- "Never auto-approve destructive operations. Always require explicit confirmation."
- "Code is the source of truth. When documentation conflicts with code, fix one or the other—never leave the conflict unresolved."

**Structure of a strong ethos:**

| Section | Purpose |
|---------|---------|
| Identity (IS/IS NOT) | Hard boundaries on what the system is |
| Core Invariants | Non-negotiable rules that cannot be overridden |
| Design Principles | Numbered, prioritized behavioral guidance |
| Decision Heuristics | What to do when facing specific ambiguities |
| Failure Philosophy | How to behave when things go wrong |
| Domain Boundaries | What is in scope vs. explicitly out of scope |

**When to write an ethos:**
- When multiple agents (human or LLM) will work on a system
- When behavioral consistency matters more than local optimization
- When you want to encode "taste" or "judgment" into a system
- When onboarding should transfer *character*, not just knowledge

**LLM consumption pattern:** Ethos documents are injected into LLM context as behavioral constraints. They should be token-efficient, unambiguous, and actionable. An LLM reads an ethos to know *what to do* without needing to reason from first principles.

---

## Protocol

**Definition:** A procedural document that specifies exact steps to accomplish a specific task. It answers *how* to do something.

**Purpose:** Reproducibility. A protocol ensures that a task is performed the same way every time, by any agent, with predictable outcomes.

**Characteristics:**
- Step-by-step, ordered instructions
- Specific to a task or workflow
- Includes preconditions and postconditions
- May include decision points with explicit branches
- Verifiable—you can check if it was followed
- Often includes examples of correct execution

**Example statements:**
- "1. Read the issue description. 2. Create a feature branch named `agent-N/issue-M-description`. 3. Run `make compile` to verify the build. 4. ..."
- "Before merging: run tests, rebase on master, re-run tests, self-review all changes."
- "When creating a commit: stage specific files (not `git add -A`), write message in conventional format, include `Closes #N`."

**Structure of a strong protocol:**

| Section | Purpose |
|---------|---------|
| Goal | What this protocol accomplishes |
| Preconditions | What must be true before starting |
| Steps | Numbered, ordered instructions |
| Decision Points | Branches based on conditions |
| Postconditions | What must be true after completion |
| Verification | How to confirm the protocol was followed correctly |
| Recovery | What to do if something goes wrong mid-protocol |

**When to write a protocol:**
- When a task must be performed consistently
- When errors in execution have significant consequences
- When onboarding should transfer *procedure*, not judgment
- When you want to automate or semi-automate a workflow

**LLM consumption pattern:** Protocols are followed literally. An LLM executing a protocol should not improvise or optimize—it should follow the steps. Protocols are often invoked by name ("follow the release protocol") rather than injected wholesale into context.

---

## Relationships

### Philosophy → Ethos

Philosophy *explains* the reasoning; ethos *encodes* the conclusions.

A philosophy might say: "We value user sovereignty because autonomous systems that act without consent erode trust, and trust is the foundation of human-AI collaboration."

The derived ethos says: "Every mutation requires explicit user confirmation. No irreversible action happens without consent."

The ethos is what an LLM needs to behave correctly. The philosophy is what a human needs to understand why the ethos exists—and to update it intelligently when circumstances change.

### Ethos → Protocol

Ethos *constrains* behavior; protocols *specify* behavior.

An ethos might say: "Always run tests before merging to master."

The derived protocol specifies: "1. Run `make test`. 2. If tests fail, do not proceed. 3. If tests pass, run `git checkout master && git pull origin master`. 4. ..."

The ethos sets the invariant; the protocol implements it. Multiple protocols might satisfy the same ethos constraint.

### Hierarchy

```
Philosophy (abstract, explanatory)
    │
    ├── informs
    ▼
Ethos (normative, constraining)
    │
    ├── constrains
    ▼
Protocol (concrete, procedural)
```

An agent should:
1. Understand the philosophy (optional, for context)
2. Internalize the ethos (required, for behavioral alignment)
3. Follow protocols when they apply (required, for task execution)

---

## Generating These Artifacts

### Writing Philosophy

**Process:**
1. Identify decisions that require justification
2. Articulate the alternatives you considered
3. Explain the trade-offs and why you chose as you did
4. State the values or priorities that drove the decision
5. Acknowledge limitations or conditions under which you'd reconsider

**Questions to answer:**
- Why did we choose X over Y?
- What are we optimizing for?
- What would make us change this decision?
- What assumptions does this depend on?

**Audience:** Humans who need to understand, critique, or update the system's foundations.

### Writing Ethos

**Process:**
1. Define identity boundaries (what the system IS and IS NOT)
2. Extract invariants (rules that must never be violated)
3. Articulate principles (prioritized behavioral guidance)
4. Enumerate decision heuristics (what to do in common ambiguous situations)
5. Define failure philosophy (how to behave when things go wrong)
6. Mark domain boundaries (what is in scope and out of scope)

**Questions to answer:**
- If an LLM is unsure, what should it do?
- What actions are always forbidden?
- What actions are always required?
- When principles conflict, which wins?
- What is explicitly not our concern?

**Audience:** LLMs (and humans) who need to behave consistently without constant supervision.

**Token efficiency matters:** Ethos documents are injected into LLM context repeatedly. Every unnecessary word costs tokens across thousands of interactions. Be precise and concise.

### Writing Protocols

**Process:**
1. Identify the task and its goal
2. List preconditions (what must be true before starting)
3. Enumerate steps in order
4. Identify decision points and specify branches
5. Define postconditions (what must be true after completion)
6. Add verification steps (how to confirm success)
7. Include recovery procedures (what to do if something fails)

**Questions to answer:**
- What is the exact sequence of actions?
- What could go wrong at each step?
- How do we know if it worked?
- What do we do if it fails?

**Audience:** Agents (human or LLM) who need to execute a task correctly.

---

## Example: A Complete Set

### Domain: Multi-Agent Git Workflow

**Philosophy (excerpt):**
> We use git worktrees and branch naming conventions because multiple agents work on the same repository concurrently. Without isolation, agents would create merge conflicts, overwrite each other's work, and produce an inconsistent commit history. The overhead of worktrees is justified by the coordination cost it eliminates.

**Ethos (excerpt):**
> - Agents NEVER work in the main repository clone. Always work in a worktree.
> - Branches follow the pattern `agent-N/issue-M-description`.
> - Never merge to master with failing tests.
> - Never force-push to master.
> - When uncertain, ask the user rather than guessing.

**Protocol (excerpt):**
> **Pre-merge checklist:**
> 1. Run `make compile` — must succeed
> 2. Run `make test` — must pass
> 3. Run `git fetch origin && git rebase origin/master`
> 4. If conflicts, resolve them, then return to step 2
> 5. Run `git checkout master && git pull origin master`
> 6. Run `git merge agent-N/issue-M-description`
> 7. Run `git push origin master`
> 8. Delete the feature branch

---

## Summary

| Artifact | Question Answered | Character | Audience |
|----------|-------------------|-----------|----------|
| Philosophy | Why do we do it this way? | Explanatory | Humans understanding the system |
| Ethos | What should we do and not do? | Normative | LLMs (and humans) behaving in the system |
| Protocol | How do we accomplish this task? | Procedural | Agents executing specific tasks |

**For LLM-guided development:**
- Write **philosophy** for humans who will maintain and evolve the system
- Write **ethos** for LLMs who will work within the system
- Write **protocols** for any agent who must execute specific tasks reliably

The ethos is the critical artifact for LLM behavioral consistency. It encodes the "taste" and "judgment" that would otherwise require human supervision at every decision point.

---

## Next Steps

- [02-documentation-layers.md](./02-documentation-layers.md) — The three-layer documentation model (code, LLM docs, human docs)
- [03-artifact-scopes.md](./03-artifact-scopes.md) — How philosophy/ethos apply at different project levels
- 04-ethos-patterns.md — Common patterns in well-structured ethos documents (planned)
- 05-philosophy-to-ethos.md — Extracting ethos from existing philosophy (planned)
- 06-protocol-design.md — Designing protocols that LLMs can follow (planned)
