# State of the Art: Formal Methods & Type Theory for Knowledge Representation

> Research date: 2026-03-01
> Session 2 of estimated 3–4
> Informs: types-as-ontology.md, algebra-of-methodologies-research.md, rfc-as-structured-data.md
> Goal-reaching delta: 0.35 / 1.0

---

## Summary

Session 2 corrected one foundational error, refined one novelty claim, reframed a comparison
axis, and uncovered significant missed literature. The corrected institution theory mapping
replaces Measurements ~ Mod with Organon-instances ~ Mod, which is structurally more defensible
but still unverified. The Protocol novelty claim has been refined from "institutions are purely
declarative" (false) to "LLM-agent procedural workflow orchestration with automation tiers and
judgment-based execution has no counterpart in any institution-theoretic framework" — but this
narrowed claim now requires checking against BPMN formal verification literature that was
entirely missed. The OWL/DL comparison axis was reframed: the correct comparator for Organon's
knowledge layer invariant checking is SHACL (closed-world validation), not OWL (open-world
reasoning) — but SHACL itself has not yet been researched. The Lamport-Paulson 1999 paper was
located but not fully read; its central argument may argue against dependent-type specification,
not for it. Overall delta remains low (0.35) because two blocking gaps from Session 1 were
reframed rather than closed, and one new blocking issue (SHACL) was opened.

---

## Key Findings

**Finding 1: Institution theory mapping corrected — Organon-instances ~ Mod replaces
Measurements ~ Mod; satisfaction condition remains formally unverified**

- Session 1's Measurements ~ Mod mapping is definitively wrong. Measurements
  (verify_pass_rate, goal_delta) are metric observations, not model interpretations. They
  cannot satisfy Mod's requirement as a contravariant functor from Sig to Set.
- Corrected mapping: Organon-instances (concrete deployments of an organon hierarchy —
  specific ETHOS.md + protocols + bound workflows) map to Mod. Each instance is a semantic
  realization of the Signature defined by the organon's type structure.
- Under the corrected mapping, the satisfaction condition M' ⊧ Sen(φ)(ρ) iff Mod(φ)(M') ⊧ ρ
  is structurally plausible but formally unverified.
- Critic's challenge on this finding [SIGNIFICANT]: "Structurally plausible" is not a
  result. For the mapping to be more than metaphorical, the Organon analog of a "signature
  morphism" must be identified — is it ETHOS extension? protocol inheritance? — and
  Organon-instances must be shown to reduce along that morphism contravariantly. Without an
  informal proof sketch or an explicit statement that it remains unverified, the corrected
  mapping inherits the same status as the original: a resemblance claim.
- Coverage gap: Protocol and Personas from Organon's 5-tuple are not covered by institution
  theory's 4-tuple. The gap is now precisely characterized: 5 components vs. 4, with Protocol
  and Personas as the excess.
- Evidence: Session 2 architect brief, Session 2 researcher finding, Session 2 critic challenge.
  Goguen & Burstall (1992) JACM still not directly read.
- Implication for Organon: The corrected mapping is the working hypothesis. The algebra-of-
  methodologies research must either produce an informal proof sketch showing contravariant
  functoriality for Organon-instances, or explicitly state that the institution framing is
  a structural analogy, not a formal embedding.

**Finding 2: Process institutions confirmed to exist — novelty claim refined and now
requires BPMN literature check**

- Session 1 assumed institutions are purely declarative. This is false. Published frameworks
  exist: CSP-as-institution (Mossakowski et al.), CoCASL, E↓-logic (hybrid dynamic logic
  with sequential event composition and institution structure).
- E↓-logic is the closest: covers sequential event composition, hybrid state variables, and
  institution structure. It is the most relevant process institution framework identified to date.
- The Protocol novelty claim is refined to: "LLM-agent procedural workflow orchestration with
  automation tiers and judgment-based execution has no counterpart in any institution-theoretic
  framework."
- Critic's challenge on this finding [SIGNIFICANT]: The refined novelty claim is
  underspecified and unfalsifiable as stated — every specific system is novel against
  sufficiently specific qualifiers. Two significant gaps remain:
  - BPMN formal verification literature was entirely missed: Chareonsuk & Vatanawood;
    Lam et al. "Runtime Verification of Business Cloud Workflow Temporal Conformance" (2019).
    BPMN with formal semantics handles automation tiers (automated vs. manual tasks),
    sequential gates, and compliance checking — which directly overlaps Organon's gate system.
  - Event-B institution (arXiv 2103.10881) was also missed. Event-B covers refinement-based
    development that maps to Organon's ETHOS → protocol → tool layering.
  - Whether BPMN's automation tiers can be modeled in E↓-logic was not examined.
- Status: novelty claim for AC2 is refined but not confirmed. BPMN check is required before
  the claim can stand.
- Evidence: Session 2 researcher finding (process institutions). Session 2 critic challenge
  (BPMN literature gap). E↓-logic, CoCASL, CSP-as-institution located via brief search.
  None read directly.
- Implication for Organon: The algebra-of-methodologies cannot claim Protocol is novel
  beyond process institutions until BPMN formal verification and Event-B institution are
  explicitly checked and addressed.

**Finding 3: AWS Cedar + Lean 4 VGD pattern remains the strongest production case for
dependent-type verification — closed-world assumption gap still unresolved**

- Session 1 findings on Cedar (VGD pattern, seven proved properties, Lean model / Rust code
  split, differential testing) remain valid and are not updated this session.
- Lamport-Paulson (1999) paper was located at Microsoft Research (Cambridge URL confirmed).
  Abstract and secondary sources confirm a two-layer architecture conclusion. Sections 4–5
  not directly read.
- Critic's challenge on Lamport-Paulson [SIGNIFICANT]: The paper's central argument is that
  untyped set theory is more expressive as a specification language — Lamport argues types
  cause problems when mixing domains and that type systems target programming languages, not
  mathematical specification. If the paper's conclusion is "untyped set theory for specification,
  types only for mechanized proofs," this argues against using dependent types (Idris, Lean 4)
  for Organon's specification layer, not for it. The paper is publicly available at the
  Cambridge URL and must be read directly before citing it in either direction.
- Evidence quality for Lamport-Paulson: medium. Sections 4–5 not read.
- AC3 assessment: Cedar + Lean 4 VGD from Session 1 is the solid foundation. Lamport-Paulson
  remains unread and may cut against dependent-type specification.
- Implication for Organon: Read Lamport-Paulson fully before using it. Cedar VGD remains
  the model for the Idris layer, conditioned on resolving the closed-world assumption.

**Finding 4: OWL/DL comparison axis reframed — SHACL is the correct comparator; neither
OWL nor SHACL has been compared to dependent types yet**

- Session 1's AC4 framing ("OWL/DL vs. dependent types") is wrong. OWL operates under the
  Open World Assumption: in OWL, absence of a constraint does not mean the constraint is
  violated. Organon's knowledge layer needs Closed World semantics — absence of conformance
  evidence means the invariant fails.
- SHACL (W3C Shapes Constraint Language) is closed-world validation of RDF/ontology data.
  It is the correct comparator for Organon invariant checking, not OWL DL.
- Additional OWL limitation: OWL 2 DL conjunctive query answering is undecidable. Since
  Organon's verification queries are naturally conjunctive (check all frontmatter invariants
  simultaneously), this is directly relevant.
- Pavlyshyn (Nov 2025) blog post (not peer-reviewed): encodes both OWL AND SHACL semantics
  in Agda. Technically relevant even if not peer-reviewed — it demonstrates that dependent
  type formalization of SHACL semantics is feasible in practice.
- Critic's challenge on AC4 [BLOCKING]: No peer-reviewed paper directly comparing OWL/DL vs.
  dependent types for knowledge representation was found. The TypeQL SIGMOD 2024 paper
  compares against relational/graph models, not OWL or dependent types. AC4 is unresolved
  and the framing correction (OWL → SHACL) does not constitute progress toward a comparison.
  SHACL itself has not been researched.
- Evidence: none directly read for SHACL. Framing correction sourced from Session 2 critic
  challenge. Pavlyshyn blog post not read.
- Implication for Organon: AC4 remains the largest single gap. The question is now correctly
  framed as "SHACL vs. dependent types for Organon's closed-world invariant checking." This
  must be the first priority in Session 3.

---

## Related Work (Annotated)

### Institution Theory

- **"Institutions: Abstract Model Theory for Specification and Programming"** (1992) —
  Goguen and Burstall — dl.acm.org/doi/10.1145/147508.147524
  The foundational paper. Defines the 4-tuple institution (Sig, Sen, Mod, |=) and the
  satisfaction condition. Institution morphisms preserve satisfaction across logics. The
  most cited framework in algebraic specification. Behind ACM paywall; content accessed via
  secondary sources only.
  Tags: #foundational #institution-theory #prior-art #not-directly-read

- **"Institution Theory"** (Internet Encyclopedia of Philosophy) — iep.utm.edu/insti-th/
  The most accessible secondary survey. Full technical definitions of institution, institution
  morphism, institution comorphism, theoroidal comorphisms. Discusses applications including
  ontology formalization. Mentions OMSII (OWL integration with institution theory). Read directly.
  Tags: #survey #institution-theory #morphisms

- **"Foundations of Algebraic Specification and Formal Software Development"** (2012) —
  Sannella and Tarlecki — Springer Monograph
  Definitive treatment of CASL on institution-theoretic foundations. Signature morphisms as
  notation translations, theory morphisms as specification-level translations. Not accessible;
  confirmed via Semantic Scholar metadata only.
  Tags: #foundational #CASL #algebraic-specification #not-directly-read

- **"General Logics"** (1989) — Meseguer — Proceedings of Logic Colloquium 1987
  A weaker structure than institutions. The Critic flagged this as potentially more accurate
  prior art characterization than institutions for Organon's 5-tuple. Not investigated.
  Tags: #foundational #prior-art #not-investigated

### Process Institutions and Dynamic Logics (Session 2)

- **CSP-as-institution** — Mossakowski et al.
  CSP (Communicating Sequential Processes) formalized as an institution. Establishes that
  institution theory can accommodate process calculi — falsifying Session 1's claim that
  institutions are purely declarative. Not directly read; located via Session 2 research.
  Tags: #process-institution #CSP #Mossakowski #not-directly-read

- **CoCASL**
  Coalgebra extension of CASL. Adds dynamic, behavioral specification to institution-theoretic
  foundations. Not directly read.
  Tags: #coalgebra #dynamic-specification #CASL-extension #not-directly-read

- **E↓-logic (hybrid dynamic logic with sequential event composition)**
  Currently the closest existing framework to Organon's Protocol component. Covers sequential
  event composition, hybrid state variables, and institution structure. Whether it covers
  automation tiers (automated vs. judgment-based execution) has not been examined. Not directly
  read.
  Tags: #process-institution #dynamic-logic #sequential-events #not-directly-read

- **Event-B institution** — arXiv 2103.10881
  Refinement-based development with institution-theoretic semantics. Covers ETHOS →
  protocol → tool layering-style refinement. Missed in Session 2; flagged for Session 3.
  Tags: #event-B #refinement #institution-theory #not-investigated

### BPMN Formal Verification (Session 2 — missed, flagged for Session 3)

- **Lam et al. "Runtime Verification of Business Cloud Workflow Temporal Conformance"** (2019)
  BPMN with formal semantics handling automation tiers, sequential gates, and compliance
  checking. Directly relevant to AC2. Not investigated.
  Tags: #BPMN #workflow-verification #automation-tiers #not-investigated

- **Chareonsuk & Vatanawood** — BPMN formal verification
  BPMN formalization with process algebra or formal semantics. Not investigated.
  Tags: #BPMN #formal-semantics #not-investigated

### Lamport-Paulson Debate

- **"Should Your Specification Language Be Typed?"** (1999) — Lamport and Paulson —
  ACM TOPLAS 21:502-526 — lamport.azurewebsites.net/pubs/lamport-types.pdf
  Located at Microsoft Research (Cambridge URL). Abstract confirmed. Sections 4–5 not read.
  Central argument: Lamport argues untyped set theory is more expressive as specification
  language; Paulson argues types help mechanized proofs. If the paper's conclusion favors
  untyped specification, it may argue against dependent-type specification for Organon.
  Must be read in full before citing.
  Tags: #specification-languages #typed-vs-untyped #foundational-debate #partially-read

### AWS Cedar

- **"How We Built Cedar: A Verification-Guided Approach"** (2024) — Disselkoen et al. —
  FSE 2024 — arxiv.org/html/2407.01688v1
  Primary technical reference for VGD. Lists all seven proved properties. Documents Lean
  model / Rust production code split. Documents differential testing methodology, bugs found,
  and 3.4:1 proof-to-model ratio. Explicitly states the Rust code is not formally verified.
  Read directly.
  Tags: #production-case #lean4 #dependent-types #non-mathematical-domain

### OWL / SHACL / Knowledge Representation (Session 2 — reframed)

- **Pavlyshyn (Nov 2025)** — Agda formalization of OWL and SHACL semantics
  Blog post (not peer-reviewed). Demonstrates that dependent type formalization of both OWL
  and SHACL semantics is feasible. Encodes open-world (OWL) and closed-world (SHACL)
  semantics in Agda. Technically relevant despite source quality. Not read directly.
  Tags: #OWL #SHACL #dependent-types #agda #blog-post #not-directly-read

- **TypeQL / TypeDB** — SIGMOD 2024
  Paper compares against relational/graph models, not OWL or dependent types. TypeDB
  positions as a type-theoretic alternative to OWL ontologies. Does not constitute a direct
  OWL vs. dependent types comparison. Not directly read.
  Tags: #knowledge-representation #type-theory #OWL-alternative #SIGMOD-2024 #not-directly-read

### LLM Agents and Formal Methods (Session 2 — flagged for Session 3)

- **"LLM agents + formal methods integration roadmap"** — arXiv 2412.06512 (Dec 2024)
  Flagged by Session 2 critic as missed. Likely relevant to Finding 3's novelty sub-claim
  about LLMs as constructors of formally verified schema instances. Not investigated.
  Tags: #LLM-agents #formal-methods #not-investigated

---

## Similar Projects & Directions

**CASL / Hets (Heterogeneous Tool Set)**
CASL implements institution theory as a multi-logic specification language. Hets provides
tool support for combining specifications across logics via comorphisms. Convergence with
Organon: CASL's structured specification features (parameterization, implementation,
refinement) are what the algebra-of-methodologies is attempting to formalize. Divergence:
CASL targets software specification of computational systems; Organon's domain is
non-computational (methodology, behavior, knowledge). CASL has no Protocol component.
Lesson: CASL solved multi-logic combination via institution morphisms. Organon would need
a process algebra extension for the procedural component.
Note (Session 2): Hets is now also identified as a tooling infrastructure for heterogeneous
institution-theoretic specifications. Relevant if Organon implements institution morphisms
as a mechanized artifact.

**CafeOBJ**
The other major institution-based specification language. Industrial verification contexts,
Japanese origins. Mentioned as a reference implementation of heterogeneous institution-theoretic
specifications. Not investigated in depth.

**BPMN Formal Verification Community**
Business Process Model and Notation (BPMN) with formal semantics covers workflow orchestration,
automation tiers, sequential gates, and compliance checking. This community may have already
solved AC2 for a narrower domain (business workflows) than Organon's (LLM agent orchestration).
Not investigated. Session 3 priority.

---

## Industry Directions

**AWS (Cedar / Amazon Verified Permissions)**
Most relevant industry actor. Lean 4 in production for authorization policy verification.
Methodology: formal model (Lean) + production code (Rust) + differential testing bridge.
No other major cloud provider has a comparable published formal verification methodology for
a non-mathematical domain at this scale. Key constraint: Cedar's correctness is grounded in
a closed-world, decidable domain. This constraint is structural to why VGD works for Cedar.

**Lean FRO**
Lean 4 is the proof assistant AWS used. The Lean FRO case study page (lean-lang.org) curates
production use cases. Cedar is their flagship non-mathematical example. The Aeneas project
bridges Rust to Lean for direct formal verification of Rust code — relevant if Organon ever
wants to formally verify the TypeScript CLI layer directly.

---

## What Organon Can Build On

1. **Institution theory vocabulary** for the algebra-of-methodologies — using the corrected
   Organon-instances ~ Mod mapping. The vocabulary is applicable, but the formal embedding
   (contravariant functoriality of Organon-instances along methodology morphisms) must be
   sketched informally or explicitly disclaimed. The OMSII connection (institution theory
   underpins OWL integration) remains a potential bridge to ontology tooling.

2. **Verification-guided development as a methodology pattern.** Cedar's VGD pattern is
   applicable: write a formal model of schema concepts in a proof assistant, prove structural
   properties, implement in TypeScript, use differential testing. Conditioned on resolving
   the closed-world assumption for Organon's domain.

3. **E↓-logic and process institutions as vocabulary.** Even if E↓-logic does not cover
   Organon's specific workflow tier structure, its vocabulary (sequential event composition,
   hybrid state variables, institution structure) provides a starting vocabulary for formalizing
   the Protocol component.

4. **SHACL as the closed-world comparator target.** If Organon's knowledge layer uses
   dependent types for invariant checking, the comparison must be made against SHACL — not
   OWL. Pavlyshyn's Agda formalization of SHACL semantics provides a concrete data point
   on feasibility.

---

## What Appears Novel to Organon

1. **LLM-agent procedural workflow orchestration with automation tiers and judgment-based
   execution.** The refined novelty claim (from Session 2): no institution-theoretic framework
   found that covers this specific combination. But this claim requires checking BPMN formal
   verification literature and Event-B institution before it can stand.
   Status: **(refined, not confirmed)** — requires BPMN + Event-B check in Session 3.

2. **LLM agents as the primary constructors of formally verified schema instances.** Cedar's
   VGD is a human engineering workflow. Organon's proposed use case involves LLMs generating
   Idris terms from YAML and the Idris compiler verifying them. arXiv 2412.06512 (Dec 2024)
   on LLM agents + formal methods integration is flagged but not yet checked.
   Status: **(unverified)** — arXiv 2412.06512 must be read in Session 3.

3. **Personas as a 5-tuple component with no institution-theoretic counterpart.** Personas
   remain unanalyzed against any formal framework. No candidate prior art identified.
   Status: **(not researched)** — lowest priority given other open gaps.

---

## Open Questions

**Q1: Does the satisfaction condition hold for the corrected Organon 5-tuple mapping?**
Why it matters: correcting Measurements ~ Mod to Organon-instances ~ Mod makes the mapping
structurally more defensible, but the satisfaction coherence condition M' ⊧ Sen(φ)(ρ) iff
Mod(φ)(M') ⊧ ρ has still not been checked under the new mapping.
What research would answer it: identify the Organon analog of a signature morphism (ETHOS
extension? protocol inheritance?), sketch whether Organon-instances reduce contravariantly
along it, and check whether the satisfaction condition holds under that reduction.

**Q2: Does BPMN formal verification cover Organon's gate system?**
Why it matters: the Protocol novelty claim cannot stand if BPMN + formal semantics already
handles automation tiers, sequential gates, and compliance checking in a formally verified
framework.
What research would answer it: read Lam et al. (2019) on cloud workflow temporal conformance
and Chareonsuk & Vatanawood on BPMN formalization. Check whether BPMN's automation tiers
can be modeled in E↓-logic.

**Q3: How does SHACL compare to dependent types for Organon's invariant checking?**
Why it matters: AC4 is now correctly framed as SHACL vs. dependent types (not OWL vs. DT).
SHACL is closed-world; OWL is not. The comparison has not been made.
What research would answer it: read Pavlyshyn (Nov 2025) for the Agda formalization of SHACL
semantics. Find peer-reviewed literature on SHACL vs. constraint solving in type systems.
Determine whether SHACL's expressiveness covers Organon's frontmatter invariants.

**Q4: What does Lamport-Paulson (1999) actually argue?**
Why it matters: the paper may argue against dependent-type specification (not for it). If
Lamport's position is that untyped set theory is more expressive for specification purposes,
this cuts against using Idris for Organon's specification layer.
What research would answer it: read the full paper at the Cambridge URL.

**Q5: Is Organon's domain closed-world and decidable?**
Why it matters: Cedar's VGD works because Cedar is provably closed-world. Organon's protocols
reference external file system state and dynamic runtime properties. The closed-world assumption
must be demonstrated before applying Cedar's VGD pattern.
What research would answer it: analyze each of the seven Cedar properties against Organon's
schema domain. Identify which frontmatter invariants are closed-world and which require
open-world assumptions.

**Q6: Does Event-B institution (arXiv 2103.10881) cover Organon's layering?**
Why it matters: Event-B's refinement-based specification maps to ETHOS → protocol → tool
layering. If Event-B institution covers this, it narrows the novelty space further.
What research would answer it: read arXiv 2103.10881.

---

## Critic's Unresolved Challenges

**BLOCKING: Satisfaction condition not formally checked for corrected mapping**
The Organon-instances ~ Mod mapping is more defensible than Measurements ~ Mod, but
contravariant functoriality has not been demonstrated. Without identifying the Organon analog
of a signature morphism and sketching that Organon-instances reduce along it, the mapping
remains a metaphor.
Follow-up: informal proof sketch or explicit disclaimer in algebra-of-methodologies-research.md.

**BLOCKING: SHACL vs. dependent types comparison not done (AC4 reframed but unresolved)**
The framing correction (OWL → SHACL) is progress in diagnosis, not in research coverage.
SHACL has not been investigated. AC4 remains unmet.
Follow-up: read Pavlyshyn (Nov 2025) and find peer-reviewed SHACL literature in Session 3.

**SIGNIFICANT: BPMN formal verification literature entirely missed**
Lam et al. (2019) and Chareonsuk & Vatanawood were not investigated. The Protocol novelty
claim may already be falsified by BPMN + formal semantics.
Follow-up: BPMN check is Session 3 Priority 1.

**SIGNIFICANT: Event-B institution (arXiv 2103.10881) not investigated**
Refinement-based specification with institution semantics — directly relevant to Organon's
layering. Missed in Session 2.
Follow-up: read in Session 3.

**SIGNIFICANT: Lamport-Paulson paper still not fully read**
Abstract and secondary sources confirm location. Sections 4–5 unread. The paper's central
argument may argue against, not for, dependent-type specification.
Follow-up: read in full in Session 3.

**SIGNIFICANT: Cedar closed-world assumption not verified for Organon's scope**
Organon's protocols reference open-world properties (file system state, runtime behavior).
The closed-world assumption must be demonstrated before applying Cedar's VGD pattern.
Follow-up: identify which components of Organon's schema are closed-world. Restrict formal
verification scope accordingly.

**OPEN: LLM agents + formal methods (arXiv 2412.06512) not investigated**
Directly relevant to the novelty sub-claim about LLMs as constructors of formally verified
schema instances.
Follow-up: read in Session 3.

---

## Session 3 Scope

Ordered by priority:

**Priority 1: SHACL vs. dependent types — close AC4 (correctly framed)**
Specific tasks: read Pavlyshyn (Nov 2025) Agda formalization of OWL/SHACL semantics. Find
peer-reviewed literature on SHACL expressiveness and constraint checking. Determine whether
SHACL covers Organon's frontmatter invariants or whether dependent types are required. This
is the blocking AC.

**Priority 2: BPMN formal verification — resolve Protocol novelty claim**
Specific tasks: read Lam et al. (2019) "Runtime Verification of Business Cloud Workflow
Temporal Conformance." Read Chareonsuk & Vatanawood BPMN formalization. Determine whether
BPMN + formal semantics subsumes Organon's gate system and automation tiers. Read Event-B
institution (arXiv 2103.10881). Check whether E↓-logic can model BPMN automation tiers.

**Priority 3: Read Lamport-Paulson in full — determine AC3 implication**
Specific tasks: obtain full text at Cambridge URL. Read sections 4–5 specifically. Determine
whether the paper supports or cuts against dependent-type specification for Organon.

**Priority 4: LLM agents + formal methods (arXiv 2412.06512)**
Specific tasks: read Dec 2024 roadmap paper. Determine whether Organon's LLM-as-verifier
sub-claim has been addressed in the literature.

**Priority 5: Satisfaction condition sketch for corrected mapping**
Specific tasks: identify the Organon analog of a signature morphism. Sketch whether
Organon-instances satisfy contravariant functoriality. If not, downgrade the institution
framing to structural analogy in algebra-of-methodologies-research.md.

---

## Sources Consulted

Sources read directly (Sessions 1–2):
- Disselkoen et al. (2024) "How We Built Cedar" — arxiv.org/html/2407.01688v1 (FSE 2024)
- IEP "Institution Theory" — iep.utm.edu/insti-th/
- Goguen project page — cseweb.ucsd.edu/~goguen/projs/inst.html
- lean-lang.org/use-cases/cedar/
- Cedar language paper — arxiv.org/abs/2403.04651
- nLab institution page

Sources accessed via secondary sources or partially read (not directly read in full):
- Goguen & Burstall (1992) "Institutions" JACM — behind paywall
- Lamport & Paulson (1999) "Should Your Specification Language Be Typed?" — located at
  Microsoft Research (Cambridge URL); abstract confirmed; sections 4–5 not read
- Sannella & Tarlecki (2012) — Springer monograph, not accessible
- E↓-logic — located, not directly read
- CSP-as-institution (Mossakowski et al.) — located, not directly read
- TypeQL SIGMOD 2024 — located, not directly read

Sources not investigated (flagged for Session 3):
- Pavlyshyn (Nov 2025) — Agda formalization of OWL/SHACL
- Meseguer (1989) "General Logics"
- Lam et al. (2019) "Runtime Verification of Business Cloud Workflow Temporal Conformance"
- Chareonsuk & Vatanawood — BPMN formalization
- Event-B institution — arXiv 2103.10881
- arXiv 2412.06512 — LLM agents + formal methods integration roadmap (Dec 2024)
- Idris 2 production deployment cases
- Hets (Heterogeneous Tool Set) — institution theory tooling
