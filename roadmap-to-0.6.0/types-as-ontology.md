# Types as Ontology: Raising Organon's Formalism Level

> Design exploration for v0.6.0+. How type systems, category theory, and the
> Curry-Howard correspondence can eliminate hallucination, enable automation,
> and make Organon a genuinely formal path to great software.
>
> **Upgraded**: TypeScript as canonical schema language has been superseded.
> The argument for the Curry-Howard isomorphism demands a language where it is
> *fully* realized. That language is Idris 2.

---

## Thesis

Current Organon uses Markdown prose + YAML frontmatter. This is semantically
thin: a YAML file describes *shape* but not *meaning*. An LLM can write
plausible-looking YAML that violates every invariant — the format doesn't
prevent it.

The v0.6.0 YAML-first proposal improves structure, but structure alone is not
enough. **The limiting factor is formalism**, and the right formalism already
exists: type systems — specifically, dependently-typed languages where the
Curry-Howard isomorphism is fully realized, not approximated.

The original version of this document recommended TypeScript as the canonical
schema language. That was inconsistent: the document argues the isomorphism is
fundamental, then recommends a language where the isomorphism is partial.
TypeScript is unsound (escape hatches via `any`, type assertions), has no
dependent types, erases all types at runtime, and leaves proof terms entirely
absent. You cannot fully exploit what you cannot fully express.

**The revised thesis**: Organon's canonical schema language is **Idris 2**. The
Idris compiler becomes the formal verification engine for organon correctness.
TypeScript remains the runtime layer for CLI tooling and the MCP server. The
two layers are distinct and complementary.

---

## Why Formalism Reduces Hallucination

LLM hallucination is not random noise — it has a structure. LLMs are very good
at producing *plausible* outputs. The problem is that "plausible" is not
"correct." Hallucination happens in the gap between plausibility and
correctness. Formalism closes that gap by making correctness *checkable*:

| Formalism Level | What It Catches | What It Misses |
|----------------|-----------------|----------------|
| Prose (Markdown) | Nothing automatically | Everything |
| YAML with schema | Shape violations | Semantic violations |
| TypeScript types | Type mismatches, missing fields | Dependent constraints, proof terms |
| Refinement types | Invariants as predicates | Complex relational properties |
| Dependent types (Idris 2) | Arbitrary propositions, relational invariants | Nothing — complete |

At each level up, more classes of hallucination become *impossible to express*.
The critical difference between TypeScript (Rung 3) and Idris 2 (Rung 5) is
not just degree — it is kind. TypeScript cannot express "this protocol ID exists
in this system" as a type. Idris can. That class of hallucination is not
*detected* by Idris — it is *excluded* from the space of well-typed programs.

**For Organon specifically:** every concept, relationship, and invariant in the
methodology is a finite, closed-world, precisely definable entity. This is
exactly the kind of domain where dependent types are tractable. The closed
world is an asset, not a limitation.

---

## The Curry-Howard-Lambek Correspondence: What It Actually Demands

The key insight is that **logic, type theory, and category theory are the same
structure viewed from three different angles**:

| Logic | Type Theory | Category Theory |
|-------|-------------|-----------------|
| Proposition | Type | Object |
| Proof | Program / term | Morphism |
| Implication (A → B) | Function type | Arrow between objects |
| Conjunction (A ∧ B) | Product type `(A, B)` | Product object |
| Disjunction (A ∨ B) | Sum type `Either A B` | Coproduct object |
| Universal quantifier (∀x:A. P x) | Dependent function `(x : A) -> P x` | Natural transformation |
| Existential quantifier (∃x:A. P x) | Dependent pair `(x : A ** P x)` | Fibration |
| Propositional equality (a = b) | Identity type `Id a b` | Path in groupoid |
| Truth | Unit type `()` | Terminal object |
| Falsehood | Empty type `Void` | Initial object |

**The critical rows are the bottom four.** TypeScript has none of them.
A language that only covers the top five rows of this table implements
a *fragment* of the isomorphism — the simply-typed lambda calculus fragment.
Dependent types, existential quantification, and propositional equality are
where the correspondence becomes powerful enough to express the propositions
Organon actually needs.

In Idris 2, all rows are realized. When you write an Idris type, you are
simultaneously writing a proposition in full first-order dependent logic and
defining an object in a cartesian closed category. When the type checker
accepts your program, it has verified a proof of your proposition.
**The compiler is a theorem prover.**

---

## Idris 2 Specifically: Multiple Curry-Howard Instances

Idris 2 is built on **Quantitative Type Theory (QTT)**, which is itself a
further instance of the Curry-Howard correspondence — applied to *linear logic*
rather than intuitionistic logic. Every variable in Idris 2 carries a usage
annotation:

| Usage | Annotation | Meaning | Logic |
|-------|-----------|---------|-------|
| Erased | `0` | Proof term — exists at type-check time, erased at runtime | Proof irrelevance |
| Linear | `1` | Used exactly once — resource tracking | Linear logic |
| Unrestricted | `ω` | Normal value | Intuitionistic logic |

This gives you three Curry-Howard instances simultaneously:

```idris
-- Unrestricted (ω): normal value
name : String

-- Linear (1): must be consumed exactly once — resource tracking
consume : (1 file : FileHandle) -> IO ()

-- Erased (0): proof term, erased at runtime but checked at compile time
validateTier : (0 prf : tier `elem` [Manual, SemiAuto, Auto]) -> Workflow
```

The `0`-usage annotation is especially powerful for Organon: **proof terms
that invariants hold can be required by types but erased from generated
artifacts**. The proof that "this workflow has a valid automation tier" exists
at compile time and is checked rigorously — but it doesn't inflate the
serialized YAML or the runtime representation.

The additional isomorphism instances available via Idris 2:

| Logic | Curry-Howard instance | Status in Idris 2 |
|-------|-----------------------|-------------------|
| Intuitionistic logic | Types as propositions | ✓ Full |
| Linear logic (QTT) | Resources tracked in types | ✓ Built-in |
| Dependent types | Types depending on values | ✓ Full |
| Propositional equality | `a = b` as a type, `Refl` as proof | ✓ |
| Cubical / HoTT direction | Equivalence as equality | Possible via extension |

The cubical/HoTT direction is especially relevant for Organon versioning:
if two domain definitions are *equivalent* (there is a bidirectional
meaning-preserving mapping between them), HoTT's univalence axiom lets
you treat them as *equal*. This is the formal foundation for safe organon
migration across versions.

---

## The Two-Layer Architecture

Adopting Idris 2 as the canonical schema language does not mean rewriting
the CLI or MCP server in Idris. The architecture has two distinct layers
with distinct responsibilities:

```
┌─────────────────────────────────────────────────────────┐
│              Formal Layer (Idris 2)                     │
│  Source of truth for what organon concepts ARE          │
│                                                         │
│  organon-schema/                                        │
│  ├── Core.idr         AutomationTier, Workflow,         │
│  │                    Protocol, Invariant, Definition   │
│  ├── Invariants.idr   invariant types as propositions   │
│  ├── Relationships.idr typed morphisms, composition     │
│  ├── Domain.idr       DomainSchema, proof obligations   │
│  └── Proofs.idr       proof terms satisfying invariants │
│                                                         │
│  Verified by: idris2 check                              │
│  Compiler = theorem prover                              │
└────────────────────┬────────────────────────────────────┘
                     │  generates / validates against
┌────────────────────▼────────────────────────────────────┐
│              Runtime Layer (TypeScript)                 │
│  Tooling execution — CLI, MCP server, YAML I/O          │
│                                                         │
│  packages/tools/src/core/schema.ts  (generated or       │
│                                      hand-derived from  │
│                                      Idris schema)      │
│  packages/tools/src/commands/       CLI commands        │
│  packages/tools/src/mcp/            MCP tools           │
│                                                         │
│  Verified by: tsc + runtime Zod validation              │
└─────────────────────────────────────────────────────────┘
                     │  serializes / deserializes
┌────────────────────▼────────────────────────────────────┐
│              Data Layer (YAML)                          │
│  Human-readable serialization of organon instances      │
│                                                         │
│  .methodology/organon/domains/{domain}/                 │
│  ├── ethos.yaml          definitions.yaml               │
│  ├── philosophy.yaml     relationships.yaml             │
│  └── protocol.yaml       implementations.yaml          │
│                                                         │
│  Validated by: organon verify → idris2 check            │
└─────────────────────────────────────────────────────────┘
```

The key property: **YAML is a serialization of Idris terms**. An
`ethos.yaml` file is not just shape — it is a serialized proof that
the domain satisfies the invariants defined in `Invariants.idr`. The
`organon verify` command translates YAML into Idris terms and invokes
`idris2 check`. If the compiler accepts, the organon is formally correct.
If it rejects, the error message is a precise, located proof obligation
that was not satisfied.

---

## Idris 2 Schema: What Organon Concepts Look Like

### Core types

```idris
module Organon.Core

-- Automation tier: exactly three constructors, no others possible
data AutomationTier = Manual | SemiAuto | Auto

-- ID types: branded to prevent mixing
record InvariantId where
  constructor MkInvariantId
  value : String

record DefinitionId where
  constructor MkDefinitionId
  value : String

-- Test binding: a proof obligation reference
record TestBinding where
  constructor MkTestBinding
  file : String
  test : String

-- An invariant is a proposition + evidence it is testable
record Invariant where
  constructor MkInvariant
  id          : InvariantId
  statement   : String
  testBinding : TestBinding   -- required — no invariant without test binding
```

### Dependent types: encoding relational invariants

```idris
-- A non-empty list: the length n is part of the type
-- Cannot construct an empty NonEmpty — the type forbids it
data NonEmpty : (n : Nat) -> Type -> Type where
  One  : a -> NonEmpty 1 a
  More : a -> NonEmpty n a -> NonEmpty (S n) a

-- A definition MUST have at least one invariant — encoded in the type
record Definition where
  constructor MkDefinition
  id         : DefinitionId
  name       : String
  summary    : String
  invariants : NonEmpty n Invariant   -- n is inferred; always >= 1
```

### The power of dependent types: cross-referential invariants

```idris
-- A system is a collection of definitions and protocols
record OrgSystem where
  constructor MkSystem
  definitions : List Definition
  protocols   : List Protocol

-- A workflow's protocol reference is PROVEN to exist in the system
-- This is not a runtime check — it is a compile-time proof obligation
record Workflow : (system : OrgSystem) -> Type where
  constructor MkWorkflow
  name      : String
  tier      : AutomationTier
  -- For Auto tier: existential proof that protocolRef is in system.protocols
  -- For other tiers: no protocol reference
  protocolRef : case tier of
    Auto => (p : ProtocolId ** p `elem` system.protocols = True)
    _    => ()

-- Attempting to construct an Auto Workflow without a valid protocol
-- in the system is a TYPE ERROR — caught by the compiler, not a test
```

This is the critical capability TypeScript cannot provide. The proposition
"this Auto workflow's protocol exists in this system" is expressed as a
*type*. The existence proof `(p : ProtocolId ** p `elem` system.protocols = True)`
is a **dependent pair**: the first component is the protocol ID, the second
is a proof that it is a member of the system's protocol list. The compiler
verifies this proof. It cannot be faked, forgotten, or skipped.

### Proof terms as verification artifacts

```idris
-- A well-formed domain is one where all invariants are satisfiable
-- The proof that this holds is itself a program
domainWellFormed : (d : DomainSchema) -> Type
domainWellFormed d =
  ( allDefined    : All hasInvariant d.definitions
  , allRelated    : All hasInvariant d.relationships
  , allBound      : All hasTestBinding (allInvariants d)
  , noOrphans     : All (referencedDefinitionExists d) d.relationships
  )

-- A proof of domainWellFormed is a product of four sub-proofs
-- Each sub-proof is a program that the compiler checks
-- The organon is well-formed if and only if this type is inhabited
```

The proof term `domainWellFormed d` is the formal certificate that a
domain's organon satisfies all structural invariants. It exists as a
typed value. It can be inspected, versioned, and composed with proofs
from other domains.

---

## The Compiler as Verifier: How `organon verify` Changes

### Current verification architecture

```
organon verify
  → parse YAML files
  → run 9 custom TypeScript gate functions
  → each gate implements its own logic
  → accumulate pass/fail results
  → report
```

Each gate is custom code. Each gate has its own bugs, edge cases, and
incomplete coverage. The 9 gates collectively check a fraction of what
a type checker checks.

### Idris-augmented verification architecture

```
organon verify
  → parse YAML files into Idris term representations
  → invoke: idris2 check organon-schema/Domain.idr [project-terms]
  → Idris compiler type-checks every term against every type
  → compiler either accepts (= formal proof of correctness)
         or rejects (= precise proof obligation that was not met)
  → existing CLI gates handle execution-level checks (file existence,
    gate result consistency) that are outside the type system's scope
```

The Idris compiler checks everything the type system can express —
exhaustively, soundly, automatically. The existing CLI gates handle what
remains: execution claims, file existence, test passage. These are
orthogonal concerns: the type system checks *what things are*; the
execution gates check *what things do*.

This is not replacing the CLI — it is replacing the *type-level portion*
of each gate with something formally stronger.

---

## The Formalism Ladder: Revised

The ladder is reordered to reflect that Idris 2 is the *target*, not the
aspiration. TypeScript moves from canonical to derived.

```
Rung 5: Homotopy Type Theory / Cubical Types
  - Equivalence as equality: two definitions equal if there is an
    equivalence between them (relevant for organon migration/versioning)
  - Verifier: cubical type checker (extension to Idris 2 / Agda)
  - Status: research frontier, not for v0.6.0

Rung 4: Dependent Types + QTT (Idris 2) ← CANONICAL SCHEMA LAYER
  - Full Curry-Howard: dependent types, linear resources, erased proofs
  - Can express: cross-referential invariants, non-empty collections,
    existence proofs, resource-tracked operations
  - Verifier: idris2 check (the compiler IS the theorem prover)
  - LLM suitability: good for structured schemas; proof search often
    automatic via %auto; hard proofs correspond to judgment_call situations
  - Status: TARGET for organon schema definition

Rung 3: Rich Type Systems (TypeScript, Haskell) ← RUNTIME LAYER
  - ADTs, intersection/union types, conditional types, branded types
  - Can express: exhaustive enums, required relationships, shape constraints
  - Verifier: tsc + Zod/io-ts for runtime validation
  - Status: DERIVED from Idris schema; used in CLI and MCP server

Rung 2: JSON Schema / YAML Schema ← DATA LAYER
  - Shape validation: required fields, enum values, string patterns
  - Verifier: schema validator (ajv, etc.)
  - Status: generated from TypeScript types; lowest layer of defense

Rung 1: YAML without schema (current state in book-llms/)
  - No formal constraints; anything goes
  - Status: current state, being superseded
```

**Current Organon**: Between Rung 1 and Rung 2.
**v0.6.0 YAML-first proposal**: Rung 2.
**With Idris schema**: Rung 4 for the schema definition; Rung 3 for the
runtime layer; Rung 2 for the data format. All three rungs active
simultaneously — each layer is validated by the layer above it.

---

## Addressing the "High Cost" Concern

The previous version of this document marked dependent types as "high proof
engineering effort." For Organon's closed-world finite schemas, this concern
is overstated. The cost is proportional to the complexity of the proposition
being proved:

| Organon invariant | Proof complexity | Method |
|-------------------|-----------------|--------|
| AutomationTier has exactly 3 values | Trivial — falls out of ADT definition | Automatic |
| Every definition has ≥1 invariant | Structural — NonEmpty type encodes it | Type definition |
| Every invariant has a testBinding | Structural — required record field | Type definition |
| DefinitionId ≠ InvariantId | Trivial — distinct types | Type system |
| No orphaned references | Finite list membership | `%auto` tactic or `decide` |
| Auto workflow → protocol exists | Dependent pair construction | Explicit, ~2 lines |
| Protocol exists → test passes | Execution claim — outside type system | CLI gate |
| Semantically correct summary | Semantic — outside type system | `judgment_call: true` |

The expensive proofs correspond precisely to cases where human judgment was
already required. The cheap proofs — which are the vast majority of Organon's
structural invariants — are trivial in Idris 2 and often found automatically
by the elaborator.

**LLMs and Idris**: LLMs generate well-typed Idris reliably for structured
schemas because the dependent type tells you the exact shape of the required
proof term. There is less ambiguity, not more. The type is a specification
of what the proof must look like — which is exactly the kind of precise
template that reduces LLM hallucination.

---

## LLM + Idris Types: Why This Interaction Is Powerful

The reasoning from the original document applies with greater force:

1. **The schema primes generation more precisely.** An Idris type is more
   specific than a TypeScript type. `NonEmpty n Invariant` communicates
   "at least one, and the count is tracked" in a way that
   `readonly [Invariant, ...Invariant[]]` approximates but doesn't prove.

2. **Errors are proof obligations, not shape mismatches.** An Idris type
   error says "you failed to provide a proof of P" — a precise, located,
   actionable statement. An LLM can fix a proof obligation mechanically when
   the obligation is simple (structural invariants). When it cannot (semantic
   judgment), the system correctly surfaces it as `judgment_call: true`.

3. **The compiler does the verification.** Not a custom gate. Not a hand-
   written test. The compiler — a battle-tested theorem prover — verifies
   every term against every type. The feedback loop: generate Idris term →
   compiler checks → error is a proof obligation → LLM corrects. This loop
   is tight, precise, and externalized.

4. **Erased proofs keep artifacts clean.** QTT's `0`-usage annotation means
   proof terms that invariants hold are required at compile time but erased
   from the serialized YAML. The proof exists, is checked, and disappears
   from the data format. No inflation of the artifact.

5. **Composition is categorical.** Every Idris function is a morphism. The
   compiler guarantees composition laws. When you define a mapping from one
   organon version to another, the compiler verifies it is a valid morphism
   — meaning it preserves all the structure the types define.

---

## Organon as a Type System for Projects

The deepest framing: **Organon is a type system for project design**.

A project's organon defines:
- `Domain` — the bounded contexts (objects in a category)
- `Definition` — the concepts within each domain (types)
- `Relationship` — how concepts relate (morphisms)
- `Invariant` — the laws that must hold (propositions)
- `Implementation` — how concepts map to code (proof terms)

When a developer (human or LLM) implements something, they are constructing
a *term* of a *type* defined by the organon. In Idris 2, this is literal:
the implementation IS a proof term. The Idris compiler verifies it. The
health score is proof coverage.

This reframes what "good design" means:

- **Good design = well-typed in Idris** — every concept has a dependent type,
  every relationship has a typed morphism signature
- **Good planning = type-first** — write the Idris types before implementing
  (the organon IS the type spec, the Idris schema IS the organon)
- **Good implementation = proof term** — code satisfies the types; the
  compiler verifies the proof; tests handle what types can't express
- **Good verification = type checking** — `idris2 check` is the primary
  verifier; CLI gates handle execution-level claims

---

## Implications for v0.6.0+ Design

### 1. Idris 2 as canonical schema language (resolves Q-T1)

The canonical definition of `Definition`, `Relationship`, `Invariant`,
`Workflow`, `Protocol` lives in `organon-schema/*.idr`. This is the source
of truth. TypeScript types in `packages/tools/src/core/schema.ts` are
derived from the Idris schema — either generated or hand-derived to match.

### 2. `organon verify` invokes `idris2 check`

A new verification phase: after YAML parsing and before CLI gates, translate
YAML terms into Idris representations and invoke `idris2 check`. This is the
formal verification step. Existing CLI gates remain for execution-level checks.

`idris2` becomes a CLI dependency — lightweight (the Idris 2 compiler is
self-hosted and distributable) and justified by the formal guarantees it
provides.

### 3. RFC YAML terms are Idris-typed

RFC YAML files are validated against the Idris `RFC` type. `definitions`,
`relationships`, `organon_mutations` are dependently typed — an LLM cannot
omit required fields, reference non-existent definitions, or use the wrong
ID type. The compiler catches it.

### 4. Health score carries a proof

`HealthScore` is not just a number in [0, 100] — it is a dependent type
`HealthScore n` where `n` is the actual score and the type carries the
proof that `0 <= n` and `n <= 100`. The CLI that computes it constructs
the proof. The QTT `0`-usage annotation erases the proof from the report
output while preserving the guarantee.

### 5. The MCP query API returns Idris-typed objects

The query functions return typed values whose types are defined in the Idris
schema. The MCP serializes to/from YAML but the in-memory representation
is provably well-typed. Downstream agents receive formally verified organon
data.

### 6. organon-schema/ as a first-class package

The Idris schema lives in a dedicated package (`organon-schema/`) versioned
independently. Projects depend on it via the Idris package manager (pack).
The schema version constrains which organon structures are valid — schema
migrations are versioned, formal, and checked by the compiler.

---

## Outstanding Questions (Revised)

**Q-T1: Canonical schema language** — **RESOLVED**: Idris 2.

**Q-T2: YAML ↔ Idris roundtrip**
YAML → parse → Idris term → `idris2 check` → pass or proof error.
The translation step needs to be total. What is the right representation
for partially-constructed terms (e.g., an RFC in draft state where some
proofs are not yet written)? Idris holes (`?hole_name`) may be the right
mechanism — they type-check as "proof to be filled," which maps naturally
to draft RFCs.

**Q-T3: Refinement types** — **SUBSUMED**: Idris 2 dependent types are
strictly more expressive than refinement types. Liquid Haskell predicates
are a special case of Idris propositions. No separate refinement layer needed.

**Q-T4: LLM interaction with Idris schema**
Option (c) from the original — MCP provides typed template, LLM fills values
— remains best. In Idris context: MCP returns a partially-elaborated Idris
term with holes (`?field_name`). LLM fills the holes. Idris checks the
completed term. Holes make the expected type of each field explicit.

**Q-T5: OWL/SKOS interoperability**
Potentially derivable: Idris types can be exported to Description Logic
representations. An Idris ADT with no cross-referential invariants maps
cleanly to OWL classes. Worth exploring as an export format, not a primary
concern for v0.6.0.

**Q-T6: Idris as CLI dependency**
`idris2` must be installed to run `organon verify` with formal checking.
Options: (a) required dependency, (b) optional with graceful degradation
to Rung 3 checking when absent, (c) bundled as a WASM module. Option (b)
is pragmatic for v0.6.0 adoption; (c) is the long-term goal.

**Q-T7: Proof automation ceiling**
What is the highest-complexity proof that the Idris elaborator (`%auto`,
`decide`, `search`) can find without human guidance? Empirical answer
needed — run the schema through the elaborator and observe where it
fails. Failures define the boundary of `judgment_call: true`.

---

## Summary

The connection between type systems, category theory, and ontologies is not
metaphorical — it is the Curry-Howard-Lambek correspondence, a proven
mathematical equivalence. Types *are* propositions *are* categorical objects.

Exploiting this correspondence fully requires a language where it is fully
realized. Idris 2, built on Quantitative Type Theory, provides:
- Full dependent types (∀, ∃, identity types)
- Linear resource tracking (QTT — Curry-Howard for linear logic)
- Erased proofs (compile-time guarantees without runtime cost)
- The compiler as theorem prover

For Organon, this means:
- The methodology's concepts are **Idris types** — not prose, not YAML shape
- The methodology's invariants are **Idris propositions** — proved by terms,
  checked by the compiler
- The methodology's relationships are **typed morphisms** — composition laws
  guaranteed by the type system
- Verification is **`idris2 check`** — not custom gate logic, not tests,
  but a battle-tested theorem prover running against a formal schema

The practical architecture is two layers: Idris 2 as the formal source of
truth, TypeScript as the runtime execution layer. YAML is serialization.
The `organon verify` command bridges them: parse YAML, construct Idris
terms, invoke the compiler, report proof obligations that were not met.

The long-term vision: **an Organon project is a formally verified
specification of its own domain**. An LLM building within that specification
is constructing proof terms — not interpreting prose, not guessing structure,
but completing a typed program in a language where the compiler verifies
every claim. The methodology becomes a proof system. The health score is
proof coverage. A passing `organon verify` is a theorem.
