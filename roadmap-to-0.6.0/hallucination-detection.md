# Hallucination Detection in Organon Workflows — Research

> Research and design exploration for v0.6.0. State-of-the-art survey on LLM hallucination
> detection, how the Organon closed-world assumption enables tractable static detection,
> and what a new `hallucination-risk` verification gate could look like.
>
> Research date: 2026-02-28.

---

## Thesis

Generic LLM hallucination detection is hard because the ground truth is "all of human knowledge."
**Organon hallucination detection is tractable because the ground truth is a finite, well-defined
artifact graph.** The closed-world assumption — borrowed from type theory, where only explicitly
constructed values exist — makes an entire class of semantic hallucinations statically verifiable
without external knowledge bases or expensive NLI models.

This is a distinct and under-exploited property of the methodology.

---

## Definition

**General ML definition (too broad):** A response that contains false or misleading information
presented as fact, without grounding in training data or provided context.

**Proposed Organon definition:**

> An **Organon hallucination** is any agent output that is syntactically or semantically
> inconsistent with the Organon closed world — the set of verifiable facts derivable from the
> project's organon files, the methodology specification, and the file system state — where the
> output is nonetheless *plausible* enough that a non-verifying agent would accept it.

The *plausibility* criterion is what makes detection necessary. An agent that produces structurally
valid YAML with a `summary` that describes the wrong file, an `invariants_count` that is off by
two, or a `protocol_file` path that doesn't exist is producing an output that *looks* correct — and
downstream agents, tools, and humans will treat it as correct unless something checks it.

### Hallucination vs. Confabulation (terminological note)

The 2024 neuropsychology literature distinguishes:

- **Hallucination**: perceiving something not there (from perceptual psychology — a poor metaphor
  for LLMs)
- **Confabulation**: producing internally coherent content disconnected from external reality,
  without intent to deceive (the neurologically accurate term)

Confabulations have detectable signatures — they cluster in embedding space differently and follow
systematic syntactic patterns (redefined terms, invented cross-references, fabricated mechanisms).
For Organon, this distinction matters: most LLM errors in organon files are *confabulations* —
systematically plausible but wrong — not random noise.

---

## Taxonomy: Organon Hallucinations by Enforcement Loop Phase

Mapping the five agentic hallucination types from research (Reasoning, Execution, Perception,
Memorization, Communication) onto Organon's enforcement loop:

| Phase | Hallucination Type | Example | Detectable? |
|-------|-------------------|---------|-------------|
| **DEFINE** | **Constraint hallucination** | RFC declares invariant contradicting existing parent-scope invariant | Semantic (scope graph traversal) |
| **BIND** | **Reference hallucination** | `protocol_file: organon/protocols/MISSING.md` (file doesn't exist) | Static (file existence) |
| **BIND** | **Structural hallucination** | Missing required YAML field; invalid enum value | Static (schema validation) |
| **BIND** | **Count hallucination** | `invariants_count: 3` when file has 5 invariants | Static (parse + count) |
| **BIND** | **Estimate hallucination** | `token_estimate: 200` on a 1,800-token file | Static (compute + compare) |
| **BIND** | **Semantic drift hallucination** | `summary: "Constraints for the CLI"` on a PHILOSOPHY file about testing | Semantic (NLI/embedding) |
| **EXECUTE** | **Inheritance hallucination** | Feature scope adds constraint relaxing a parent constraint | Semantic (scope DAG check) |
| **EXECUTE** | **Execution hallucination** | Agent says "I ran `organon verify` — all gates pass" without running it | Execution (re-run and compare) |
| **VERIFY** | **Verification hallucination** | Agent reports a gate passed that would actually fail | Execution (re-run) |
| **COMPOUND** | **Observation hallucination** | Observation claims a pattern from sessions that never occurred | No ground truth (judgment_call) |
| **EVOLVE** | **Propagation hallucination** | RFC claims `organon_mutations: []` but requires upstream changes | Semantic (impact analysis) |

**The most dangerous type is execution hallucination.** Research confirms this: in agentic
workflows, execution hallucinations produce concrete downstream failures that cascade through
subsequent steps. A hallucinated "verify passed" blocks a legitimate failure from surfacing.
An agent claiming it updated a file it did not update corrupts the next agent's context.

---

## What the Research Says

### State of the Art (early 2026)

A comprehensive survey of hallucination research reveals four families of detection approach,
each with a different precision/recall/cost profile:

**1. Structural (schema + constrained decoding):**
- Constrained decoding (XGrammar, Outlines, OpenAI Structured Outputs): mathematically enforces
  format conformance at token-sampling time. Zero structural errors — but zero semantic protection.
- JSONSchemaBench (2025): evaluated 6 frameworks on 10K real schemas. High conformance on simple
  schemas; degrades on deep nesting, conditional constraints, cross-references.
- **Critical finding:** In zero-shot settings, Outlines and XGrammar show hallucination rates of
  100% and 99.3% — valid JSON containing hallucinated values. Structural conformance does not
  prevent semantic hallucination.

**2. Self-consistency sampling:**
- SelfCheckGPT: generates N samples, scores consistency of base response against samples. Zero
  external knowledge required. Weakness: fails when model is *consistently wrong* — consistent
  confabulations score as "known."
- Semantic Entropy (Nature 2024): clusters answers by semantic equivalence class before computing
  entropy. Separates "many ways to say the same thing" from "many different things to say."
- **Cost:** 5-10x forward passes. Not suitable for real-time gate use.

**3. NLI and factual verification:**
- FactScore: decomposes output into atomic claims, retrieves evidence, verifies each. Highly
  interpretable but expensive (GPT-4 per claim).
- GraphEval: extracts knowledge graph triples from output, verifies each triple against source
  context via NLI. More tractable than FactScore for structured content.
- **Key limitation:** BERTScore and standard entailment models miss fine-grained errors (wrong
  number, wrong year, subtly wrong attribute).

**4. Code generation hallucination (AST-based):**
- Deterministic AST analysis ([arXiv:2601.19106](https://arxiv.org/html/2601.19106v1)): extracts
  imports, call sites, function arguments; validates against knowledge base of actual library API.
  Results: Precision 100%, Recall 87.6%, F1 0.934. Runs in < 0.2 seconds.
- **Direct Organon parallel:** The methodology specification IS the knowledge base. API misuse
  detection for code = methodology deviation detection for organon files.

### Theoretical Limits

**The Impossibility Theorem (Karbasi et al., arXiv:2504.17004, 2025):**
- Hallucination detection is *impossible for most language collections* when the detector is
  trained only on correct examples.
- When detectors receive *both positive and negative examples* (explicitly labeled hallucinations),
  reliable detection becomes universally achievable.
- **Implication:** Positive examples alone (what correct organon files look like) are insufficient.
  Negative examples (labeled wrong organon files) are theoretically necessary for reliable
  semantic detection.

**The Coverage Gap (geometric taxonomy, arXiv:2602.13224, 2026):**
- Type III hallucinations — queries outside the model's training distribution — show AUROC ~0.478
  (chance level). No embedding-based detector can distinguish these from correct outputs.
- **Organon mapping:** Generating ETHOS for a genuinely novel domain with no prior examples;
  inventing invariants for concepts not yet formalized. These require human review — which the
  existing `judgment_call: true` mechanism already formalizes.

**The Inevitability Result (arXiv:2401.11817, ICLR 2024):**
- Any computable LLM will hallucinate when used as a general problem solver. Hallucination cannot
  reach zero for open-domain general use.
- **Practical implication:** The engineering task is managing residual hallucination risk, not
  eliminating it. The `judgment_call` flag is the right formalization of this limit.

---

## The Organon Advantage: Closed-World Detection

The key insight is that Organon's closed world makes a class of semantic hallucinations
**statically verifiable** that would require expensive NLI or external knowledge bases in
open-domain systems:

### 1. The organon file graph is a knowledge graph

Every file, every reference, every claim about relationships is encoded in a finite artifact graph.
GraphEval-style triple verification applies *without any external knowledge base* — the KB is the
organon itself.

Example verifiable triples:
- `(ETHOS.md, inherits_from, /ETHOS.md)` → parent file exists and is an ETHOS
- `(PROTO-ORG-1, automation_tier, automated)` → workflow binding exists and references PROTO-ORG-1
- `(workflow.md, protocol_id, PROTO-ORG-1)` → protocol file exists and declares this workflow

### 2. Execution claims are ground-truth verifiable

"I ran `organon verify` and it passed" can be verified by running `organon verify` and comparing.
This is the cleanest possible hallucination check: **re-execution**. The enforcement loop already
mandates re-verification; the framing as hallucination prevention makes the *why* explicit.

### 3. Schema enforcement at generation time

The 0.6.0 MCP query API returning typed templates is the structural intervention with the highest
payoff. The constrained decoding research shows: 97% success with few-shot template filling,
vs near-zero zero-shot. MCP provides the typed template; the LLM fills values. This maps
directly to `types-as-ontology.md`'s Option (c).

### 4. Count and estimate fields are self-verifiable

`invariants_count`, `token_estimate`, `principles_count` can all be computed from file contents
deterministically and compared to declared values. Zero-cost hallucination check, 100% precision.
Already implemented as part of frontmatter validation — the hallucination framing just makes
explicit that these are detecting agent confabulation, not arbitrary schema enforcement.

### 5. Inheritance chains are finitely checkable

The scope hierarchy is a DAG. Checking that a child scope doesn't contradict any ancestor scope
is a finite graph traversal problem — pure formal verification, not statistical detection.
The theoretical impossibility results don't apply here.

---

## The Formalism Ladder Maps to Detectability

The formalism ladder from `types-as-ontology.md` maps precisely onto hallucination detectability:

| Rung | Formalism | What It Catches | Hallucination Class Eliminated |
|------|-----------|-----------------|-------------------------------|
| **1** | YAML without schema (current) | Nothing automatically | None |
| **2** | JSON Schema / YAML Schema | Shape violations, enum validity, required fields | Structural hallucinations |
| **3** | TypeScript types (target for 0.6.0) | Type mismatches, branded IDs, non-empty arrays, cross-references | Reference hallucinations |
| **4** | Refinement types (Liquid Haskell / Zod predicates) | Invariants as predicates (token_estimate in [0, ∞), count matches actual) | Estimate/count hallucinations |
| **5** | Dependent types | Arbitrary propositions ("this protocol exists in this system") | Complex relational hallucinations |

**Each rung up makes a class of hallucinations impossible to generate, not just detectable
after the fact.** This is structurally superior to post-hoc detection.

---

## Proposed New Verification Gate: `hallucination-risk`

A concrete 0.6.0 addition: a gate that explicitly flags high-risk hallucination points.

```
Gate: hallucination-risk

Static checks (deterministic, zero false positives):
  Count field drift       invariants_count vs actual parsed count           FAIL
  Estimate drift          token_estimate within 20% of actual               WARN
  Reference existence     all file paths in frontmatter exist on disk       FAIL
  Bidirectional links     both protocol→workflow and workflow→protocol       FAIL
  Enum validity           scope, type, automation_tier are valid values      FAIL
  ID format               INV-/DEF-/REL- IDs match declared pattern         FAIL

Semantic checks (heuristic, some false positives):
  Summary faithfulness    cosine similarity(summary, content[:500])         WARN
  Vague invariant         invariant text matches abstraction patterns        WARN
  Inheritance conflict     child invariant contradicts ancestor invariant    FAIL (graph check)

Execution checks (requires re-run capability):
  Gate result consistency  re-run verify; compare to agent-reported result  FAIL
```

The static checks are pure computation — no model required. The semantic checks use embedding
similarity, which requires a lightweight embedding model (a new dependency decision). The
execution checks require the CLI to be able to re-invoke itself, which it already can.

---

## The Negative Example Problem

The impossibility theorem establishes that reliable semantic detection requires *labeled negative
examples* — explicitly wrong organon files. This is important:

**The quality-review workflow already generates negative examples.** Every `error:` and `warning:`
finding from a quality-review session is a labeled hallucination. These are currently thrown away
after the session.

**The session-compounding loop already produces the data needed for future semantic detector
training — it's just not being persisted for that purpose.**

A future direction (not 0.6.0, but architecturally worth knowing): capture quality-review
findings as a negative-example corpus in `organon/observations/` or `.methodology/organon/tmp/`.
This corpus becomes the training data for a fine-tuned semantic hallucination detector for
Organon-specific outputs.

---

## Relationship to Other 0.6.0 Ideas

**YAML-first organons:** The schema enforcement foundation. Moving from "YAML + prose" to "pure
YAML with typed fields" is Rung 1→2 on the formalism ladder. Each field the schema defines is
a class of structural hallucination eliminated.

**MCP query API / typed templates:** The generation-time intervention. Instead of asking an LLM
to generate freeform YAML, MCP returns a typed template that the LLM fills. This is the
highest-leverage single intervention for structural hallucination prevention.

**RFC as structured YAML data:** Directly addresses the "RFC prose allows hallucination and drift"
problem noted in `index.md`. Structured RFC fields (`definitions:`, `organon_mutations:`) are
schema-validated — the LLM cannot omit required fields or use invalid IDs.

**Types as ontology:** This research is the empirical grounding for the types-as-ontology thesis.
Each level up the formalism ladder maps directly onto a removed class of hallucination.

---

## Outstanding Questions for RFC

**Q-H1: Definition scope**
Should "Organon hallucination" be defined formally in `book-llms/` as a first-class concept,
or is it derivable from the existing invariant/enforcement framework without a new definition?

**Q-H2: The negative example corpus**
Should the quality-review workflow be modified to persist findings as structured negative examples?
Where would this live — `organon/observations/`, `.methodology/organon/tmp/`, or a dedicated
`organon/negative-examples/` directory?

**Q-H3: judgment_call inversion**
The current `judgment_call: true` flag marks what *cannot* be automated. Should we instead (or
additionally) explicitly flag invariants that *should* be checked by the hallucination-risk gate?
I.e., `hallucination_risk: high` on specific frontmatter fields?

**Q-H4: Embedding dependency**
The semantic checks (summary faithfulness, vague invariant detection) require a lightweight
embedding model. Is this acceptable as a new CLI dependency? Or should these be `--experimental`
flags until the dependency story is resolved?

**Q-H5: Execution claim verification as explicit protocol**
The enforcement loop mandates re-verification, but the *reason* is not formalized as hallucination
prevention. Should this become an explicit principle: "Never trust agent-reported gate results;
always re-run"?

**Q-H6: Relationship to types-as-ontology RFC**
These two ideas (formalism ladder as hallucination prevention, hallucination-risk gate) are deeply
connected. Should they be unified in a single RFC or kept separate?

---

## Key Sources

| Source | Key Finding | Relevance |
|--------|-------------|-----------|
| [Huang et al., ACM TOIS 2024](https://dl.acm.org/doi/10.1145/3703155) | Foundational taxonomy: factuality vs faithfulness, intrinsic vs extrinsic | Taxonomy basis |
| [arXiv:2510.06265](https://arxiv.org/html/2510.06265v1) | Comprehensive 2025 survey | Broad coverage |
| [arXiv:2509.18970](https://arxiv.org/html/2509.18970v1) | 5 agentic hallucination types; execution hallucinations most dangerous | Taxonomy for enforcement loop |
| [arXiv:2504.17004](https://arxiv.org/abs/2504.17004) | Impossibility theorem: negative examples are theoretically necessary | Limits of positive-only verification |
| [arXiv:2401.11817](https://arxiv.org/abs/2401.11817) | Hallucination is inevitable; manage risk, don't eliminate | Justification for judgment_call |
| [arXiv:2602.13224](https://arxiv.org/abs/2602.13224) | Geometric taxonomy; Type III (coverage gap) undetectable by embeddings | Theoretical limit |
| [Nature 2024](https://www.nature.com/articles/s41586-024-07421-0) | Semantic entropy: cluster by meaning before computing entropy | Self-consistency approach |
| [arXiv:2601.19106](https://arxiv.org/html/2601.19106v1) | AST-based code hallucination detection: 100% precision, 87.6% recall | Direct template for organon check |
| [arXiv:2411.15100](https://arxiv.org/pdf/2411.15100) | XGrammar constrained decoding; near-zero overhead | MCP template filling approach |
| [arXiv:2501.10868](https://arxiv.org/html/2501.10868v1) | JSONSchemaBench: 97% success with few-shot, ~0% zero-shot | Schema enforcement alone insufficient |
| [ACL 2024](https://aclanthology.org/2024.findings-acl.212/) | Chain-of-Verification: hallucinations reduced from 2.95 to 0.68 per response | CoVe as verification pattern |
| [arXiv:2407.10793](https://arxiv.org/abs/2407.10793) | GraphEval: KG triple extraction + NLI for structured content verification | Graph-based organon file verification |
