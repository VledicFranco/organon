# Research Import: Algebra of Methodologies

> Status: External research in progress — not an organon deliverable yet.
> Source: `../agentic-research/experiments/002x-research/algebra-of-methodologies.md`
>
> Framing: this research, if completed to a sufficient level of formal coherence,
> provides the theoretical foundation that unifies and validates multiple 0.6.0 ideas.
> Organon does not need to wait for it — but should track it and integrate when ready.

---

## What the Research Is

A formal algebraic structure for methodologies, defining them as 5-tuples:

```
Methodology = (Space, Personas, Measurements, Protocol, Invariants)
```

With composition operators (Sequential, Parallel, Conditional, Iterative, Nested,
Merge, Substitution) that are closed under the structure — composed methodologies
are still valid methodologies.

It also defines **higher-order methodologies**: methodologies whose Space contains
other methodologies, enabling meta-selection, self-refinement, and adaptive switching.

The research establishes monoidal algebraic properties (associativity, identity
element) and poses open questions around type safety, termination, and measurement
propagation across nesting levels.

---

## Why This Matters for Organon

**Organon itself is an instance of this algebra:**

```
Organon = (
  Space:        {files, frontmatter, scopes, refs},
  Personas:     {agent, reviewer, methodology-author},
  Measurements: {verify_pass_rate, invariant_violations, goal_delta},
  Protocol:     RFC → Review → Execute → QA → Refine → Enrich,
  Invariants:   {frontmatter_required, no_orphans, ethos_first, ...}
)
```

This is not metaphorical — organon satisfies the formal definition. That means
the algebra's theorems apply to organon directly, and its composition operators
describe how organon can be extended, nested, or combined with other methodologies.

### Connections to 0.6.0 Ideas

| 0.6.0 Idea | Algebraic Interpretation |
|------------|--------------------------|
| Metacognitive quality gates | Invariants distinguishing hard (abort) vs. soft (pressure) types; goal-delta is a soft invariant on Measurements |
| Experimentation system | Comparison of two methodologies with the same Space but different Protocols — a formal morphism |
| RAG context retrieval | A higher-order methodology whose Space contains organon files and whose Protocol selects and injects them |
| Advanced prompting | A Substitution operator: replace one Protocol step with a richer prompt methodology |

If the algebra reaches formal coherence, these ideas gain:
- **Precise definitions** instead of prose descriptions
- **Verifiable composition rules** instead of intuitive compatibility checks
- **A shared vocabulary** across all four ideas

---

## What "Sufficient Congruence" Means

The research is not yet ready to import directly. The following issues need
resolution before the algebra can ground organon design decisions:

### Blocking Issues (must resolve before applying to organon)

**1. State/Space ambiguity**
The current definition allows Protocol to transform Space itself
(`State = (Space, Personas, Measurements)`, `Protocol: State₀ → Stateₙ`).
If Space can change mid-execution, closure verification becomes intractable.
Resolution needed: distinguish fixed domain (Space) from mutable point in that
domain (WorldState). Protocol should transform WorldState, not Space.

**2. No precondition/postcondition structure per Protocol step**
Protocol steps currently have no formal interface — you cannot ask whether step k's
output satisfies step k+1's precondition. Without this, the algebra cannot verify
protocol validity compositionally.
Resolution needed: Hoare-style annotations per step: `{P_k} transform_k {Q_k}`
where `Q_k ⊆ P_{k+1}`.

### Important Issues (needed to apply to specific 0.6.0 ideas)

**3. Hard vs. soft invariants unspecified**
Current algebra treats all invariants as hard (abort on violation). Metacognitive
quality gates require soft invariants (pressure toward goal without aborting).
The goal-reaching delta is a soft invariant on Measurements.
Resolution needed: typed invariant system — at minimum `{hard, soft}` distinction.

**4. Parallel (||) and Merge (⊗) relationship underspecified**
Both operators exist but their relationship is informal. `||` requires disjoint
spaces; `⊗` allows shared spaces. Is `||` a special case of `⊗`?
Resolution needed: define `||` in terms of `⊗` with empty coordination constraints,
or prove they are irreducible.

### Open Questions from the Research (for the algebra to answer internally)

From the source document:
1. Does `M₁ || M₂ = M₂ || M₁`? (Commutativity of Parallel)
2. Does Sequential distribute over Parallel? `M₁ ; (M₂ || M₃) = ?`
3. Does every Methodology have an inverse?
4. Can methodologies nest arbitrarily deep without non-termination?
5. What type system governs valid higher-order methodologies?
6. When does iterative methodology refinement converge? Is convergence guaranteed?
7. How do Measurements at level n relate to Measurements at level n+1?
8. Is `M_composed` equivalent to selecting `M_result` from pre-composed candidates?

---

## Integration Triggers

Organon should revisit this research and consider active integration when:

- [ ] The State/Space ambiguity is resolved with a clean definition
- [ ] At least one composition operator has a formal closure proof
- [ ] Hard/soft invariant distinction is defined
- [ ] The algebra has been applied to at least one non-trivial external example
  (to validate it generalizes beyond the motivating cases)

Until then: track passively, do not block 0.6.0 work on it, reference where relevant.

---

## Suggested Collaboration Points

If the research progresses, the most immediately useful deliverables for organon would be:

1. **Morphism definition** between methodologies — this formalizes what the
   experimentation system measures (is organon-methodology "better than" no-methodology
   as a partial order on the algebra?)

2. **Distributivity proof or counterexample** for `M₁ ; (M₂ || M₃)` — directly
   relevant to whether agentic organon pipelines can be safely parallelized

3. **Higher-order Measurement propagation** — formalizes how goal-delta at the
   RFC stage propagates into measurements at the meta-methodology level
   (the metacognitive quality gates idea in algebraic terms)
