# State of the Art: Formal Methods & Type Theory for Knowledge Representation

> Research date: 2026-03-02
> Session 3 of estimated 3–4
> Informs: types-as-ontology.md, algebra-of-methodologies-research.md, rfc-as-structured-data.md
> Goal-reaching delta: 0.40 / 1.0

---

## Summary

Session 3 delivered decisive progress on two of four acceptance criteria and opened one new
challenge. AC4 (SHACL vs. dependent types) is now substantively resolved: SHACL's limitations
are fully documented (RDF-only format, no native cross-file reference integrity, recursion
undefined, no temporal reasoning), the Pavlyshyn Agda encoding was read directly and confirms
that dependent types are the metalanguage within which SHACL is the object language, and a
comparison table against Organon's specific invariants shows SHACL-SPARQL reaching for but
not closing the gap dependent types cover natively. The remaining AC4 gap is whether
Organon's TypeScript CLI validator is equivalent to any fragment of dependent type theory and
whether its correctness can be formally verified by Lean 4.

AC2 (Protocol novelty claim) survives BPMN scrutiny on the conditional automation semantics
axis. Lam et al. (2019) targets parallel temporal conformance in cloud workflows, not
automation tier semantics. The Event-B institution (arXiv 2103.10881) covers data refinement,
not procedural human-LLM gate structure. arXiv 2412.05958 (2024) proposes an informal
AgentTask BPMN extension with no formal execution semantics — it narrows the informal novelty
window but not the formal one. The Protocol novelty claim now requires a positive formal
institution-theoretic encoding for its final confirmation.

AC3 (Lamport-Paulson) is now resolved in direction: Lamport's expressiveness arguments target
formal mathematical specification (TLA+, Z, B), not structured behavioral document validation.
Organon's use case is bounded, finite, and closed-world — exactly the domain where Paulson's
pro-type arguments apply and Lamport's do not. The domain distinction remains asserted rather
than formally proved, and a positive argument for Lean 4 as the specific tool for Organon's
validation semantics is still needed.

AC1 (institution theory signature morphism) received no relief in Session 3. The Event-B
near-miss — its three-layer decomposition is structurally analogous to Organon's layering and
institution theory's signature morphisms allow translation between formalisms — was identified
but not followed through. AC1 remains the blocking challenge.

Overall delta advances to 0.40 (from 0.35) on the strength of AC4 and AC2 progress (Architect re-assessment; Synthesizer self-assessed 0.47).

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
- Session 3 note: the Event-B institution finding (Finding 6) identifies a structural near-miss
  for AC1, but the near-miss was not followed through to a signature morphism construction.
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
- Session 3 update: BPMN check completed (see Finding 6). Protocol novelty claim survives on
  conditional automation semantics axis. Formal encoding still not produced.
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
- Session 3 update: Lamport-Paulson central arguments now analyzed via secondary synthesis
  (see Finding 7). Domain distinction resolves direction of cut. Cedar VGD + Lean 4 pattern
  strengthened. Cedar closed-world assumption for Organon's scope still not directly verified.
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
- Critic's challenge on AC4 [BLOCKING — Session 2]: No peer-reviewed paper directly comparing
  OWL/DL vs. dependent types for knowledge representation was found. The TypeQL SIGMOD 2024
  paper compares against relational/graph models, not OWL or dependent types. AC4 is unresolved
  and the framing correction (OWL → SHACL) does not constitute progress toward a comparison.
  SHACL itself has not been researched.
- Evidence: none directly read for SHACL. Framing correction sourced from Session 2 critic
  challenge. Pavlyshyn blog post not read.
- Session 3 update: SHACL fully investigated (see Finding 5). Pavlyshyn read directly. AC4
  significantly advanced. Blocking challenge downgraded to SIGNIFICANT (TypeScript CLI
  vs. dependent types comparison incomplete).
- Implication for Organon: AC4 framing was the correct prior art — Session 3 research
  confirms SHACL vs. dependent types as the right comparison axis and resolves it substantially.

**Finding 5: SHACL capabilities, limitations, and dependent type subsumption — AC4
substantially resolved**

- SHACL is a W3C standard for closed-world constraint validation of RDF graph data.
- SHACL capabilities: cardinality constraints, value type constraints, property pair
  constraints, pattern matching, `sh:closed` (closed shapes), logical combinations
  (and/or/not), qualified value shapes. SHACL-SPARQL adds arbitrary SPARQL queries as
  validators. Dagstuhl ICDT 2022 establishes four primitive features: zero-or-one path
  expressions, equality, disjointness, closure — all primitive.
- SHACL critical limitations for Organon:
  - **RDF-only.** No mechanism for validating YAML natively; requires full YAML→RDF
    transformation pipeline. Organon's canonical format is YAML frontmatter.
  - **No native cross-file referential integrity.** W3C spec explicitly states "no native
    mechanism for constraining relationships across distinct RDF datasets." Organon's
    bidirectional protocol↔workflow reference check falls exactly in this gap.
  - **Recursion undefined.** W3C spec explicitly states "validation with recursive shapes
    is not defined in SHACL." Dependency graph acyclicity — a reachability property and
    a specific Organon invariant — is outside SHACL Core's scope entirely.
  - **No temporal reasoning.** No time-ordered or versioned invariants.
- SHACL-SPARQL partial mitigation: cross-file reference integrity and acyclicity are
  theoretically reachable with SHACL-SPARQL + named graph SPARQL queries, but this requires
  a SPARQL endpoint and full YAML→RDF transformation pipeline. SHACL-SPARQL does not resolve
  the format barrier.
- Pavlyshyn (Nov 2025) Agda encoding (read directly at Substack):
  - Encodes OWL semantics as `OWAValue` (known-true/known-false/unknown) and SHACL as
    `CWAValue` with `Dec` (decidable proposition) types.
  - Key conclusion: dependent types are the metalanguage; SHACL is the object language
    being formalized within them.
  - **Dependent types strictly subsume SHACL at the metalevel.** SHACL is not a replacement;
    dependent type systems can encode SHACL semantics and go further.
- Comparison table for Organon invariants:

  | Invariant | SHACL Core | SHACL-SPARQL | Lean 4/Idris 2 |
  |---|---|---|---|
  | Simple field presence/type constraints | Yes | Yes | Yes |
  | Bidirectional cross-file reference integrity | NO | Possible (YAML→RDF + named graph SPARQL) | Yes |
  | Dependency graph acyclicity (recursive) | NO | Possible (SPARQL path traversal) | Yes |
  | Conditional automation tier (satisfaction-state-conditional) | NO | NO | Yes |
  | Data format | RDF only | RDF only | Any parsed data structure |
  | CLI integration | Requires triple store | Requires SPARQL endpoint | Embeds directly |
  | Formal correctness of validator | No | No | Yes (validator provably correct) |

- Organon's current TypeScript CLI: implements CWA-style validation in a practical middle
  ground — not as expressive as dependent types, not as standardized as SHACL, but directly
  applicable to YAML without transformation.
- Critic's challenge on this finding [SIGNIFICANT]: The SHACL vs. DT comparison is
  well-resolved on the framing axis, but the TypeScript CLI vs. dependent types comparison
  is incomplete. Is the CLI's validation semantics equivalent to any specific fragment of
  dependent type theory? Can its correctness be formally verified by Lean 4? These questions
  remain open and constitute the remaining AC4 ceiling.
- Evidence: Pavlyshyn (Nov 2025) read directly. Dagstuhl ICDT 2022 (SHACL expressiveness
  primitives) accessed via secondary sources. W3C SHACL spec consulted for limitation claims.
- Implication for Organon: SHACL is insufficient for Organon's invariant checking without
  a YAML→RDF transformation pipeline, and even with that pipeline, SHACL-SPARQL still
  cannot express conditional automation tier semantics. Dependent types (Lean 4/Idris 2)
  cover the full invariant space natively. The TypeScript CLI's position relative to both
  options is the open question for AC4 completion.

**Finding 6: BPMN formal verification and Event-B institution scrutiny — Protocol novelty
claim survives on conditional automation semantics; formal encoding not yet produced**

- Lam et al. (2019) "Runtime Verification of Business Cloud Workflow Temporal Conformance"
  (IEEE TSC):
  - Addresses temporal conformance of PARALLEL cloud workflows: time-delay propagation,
    throughput metrics. Uses timed Petri nets.
  - Does NOT address automation tier semantics, sequential human judgment gates, or
    compliance against invariant declarations.
  - NOT a threat to AC2. Different problem domain.
- Event-B institution (arXiv 2103.10881):
  - Formalizes Event-B using institution theory; three-layer decomposition: mathematical
    language, infrastructure (machine internals), superstructure (specification-building
    operators).
  - Covers: refinement, parameterization, modularization.
  - Does NOT cover: protocol layering with automation tiers, workflow binding, human
    judgment gates.
  - Event-B refinement = DATA refinement (abstract state space → concrete implementation),
    NOT procedural refinement of human-executable protocols.
  - Structurally analogous to Organon's ETHOS→protocol→tool layering but semantically
    disjoint. The structural analogy is relevant to AC1 (signature morphism near-miss)
    but does not close AC2.
- BPMN automation tier structure:
  - Service Task (automated), User Task (human-in-the-loop), Manual Task (fully
    manual/outside BPMS). This is STATIC task type annotation on process graph nodes.
  - Organon's model is different: automation tier is a CONSTRAINT PROPERTY on behavioral
    invariant declarations — conditional automation based on satisfaction condition status.
  - BPMN: "This node is a User Task → route to human assignee" (static).
  - Organon: "This step has automation_tier: semi-automated → execute autonomously UNLESS
    satisfaction condition fails, in which case require human judgment" (conditional).
- arXiv 2412.05958 (BPMN human-agentic extension, 2024):
  - Proposes `AgentTask` with `human-reflection` mode.
  - Explicitly acknowledges lack of formal execution semantics and verification methods.
  - Informal metamodeling — narrows the informal novelty window but not the formal one.
- AC1 near-miss: Event-B institution's three-layer decomposition and institution theory's
  signature morphisms (which allow translation between formalisms with different signature
  vocabularies) could potentially be adapted to Organon's layer transitions. If Event-B
  institution defines signature morphisms for its three-layer decomposition, that
  construction might be adaptable to Organon's ETHOS→protocol→tool transitions. This
  connection was identified but not followed through.
- Critic's challenge on this finding [SIGNIFICANT]: arXiv 2412.05958 narrows the informal
  novelty window for the Protocol claim. Until a formal institution-theoretic encoding of
  Organon's Protocol component is produced and compared against E↓-logic and CoCASL, the
  novelty claim rests on a semantics argument (conditional vs. static automation tier) that
  has not been formalized. The argument is credible but not proven.
- Evidence: Lam et al. (2019) accessed via secondary synthesis (IEEE TSC). arXiv 2103.10881
  and arXiv 2412.05958 accessed directly.
- Implication for Organon: The conditional automation semantics argument is the load-bearing
  novelty claim for AC2. To confirm it, a formal institution-theoretic encoding of Organon's
  Protocol (even a sketch) must be produced showing that the conditional automation tier
  structure has no counterpart in E↓-logic, BPMN formal semantics, or Event-B. The path
  forward is construction, not further literature search.

**Finding 7: Lamport-Paulson (1999) central arguments — domain distinction resolves cut
direction for Organon; positive argument for Lean 4 still needed**

- Lamport's central argument (secondary synthesis, direct read not completed):
  - Untyped set theory (ZF-style, TLA+) is strictly more expressive than typed formalisms
    for formal mathematical specification.
  - Types impose false constraints on mathematical notation.
  - Dependent types (Coq/Lean) are "not meant for ordinary engineers" — complexity barrier.
- Paulson's central argument:
  - Types help mechanized proofs (automated theorem prover guidance).
  - Type checking catches specification errors early and cheaply.
  - "Best of both worlds" achievable.
- Key domain distinction:
  - The paper addresses: "what language should a systems engineer use to write a formal spec
    of a concurrent algorithm?" (TLA+, Z, B, Alloy domain).
  - Organon's use case: structured behavioral declarations (YAML frontmatter field values,
    file references, bidirectional references) — structured data validation, NOT formal
    mathematical theorem proving.
  - Lamport's expressiveness arguments do NOT apply: Organon's invariants are bounded
    (finite field values, file existence). The mixing-domains problem Lamport identifies
    does not arise in a closed, finite validation domain.
  - Paulson's pro-type arguments DO apply: type checking catches spec errors; types help
    the CLI validator; the complexity barrier is lower for tooling authors than for
    systems engineers writing distributed algorithm specs.
- Net assessment: Lamport-Paulson does NOT cut against using dependent types for Organon.
  The paper's critique targets typed specification languages in the domain of formal
  mathematical specification. Organon operates in structured behavioral document
  validation — a different domain where type systems provide practical benefits without the
  expressiveness tradeoffs Lamport identifies.
- Critic's challenge on this finding [SIGNIFICANT]: The domain distinction is asserted but
  not rigorously proved. The boundary "Organon is structured data validation, not
  mathematical theorem proving, therefore Lamport's arguments don't apply" is conceptually
  plausible but needs a positive argument: why is Lean 4 specifically the right tool for
  Organon's validation semantics, not just "not the wrong tool for the reasons Lamport
  identifies"? The absence of a positive argument means AC3 cannot be scored above 0.5
  without direct reading of the Lamport-Paulson text.
- Evidence quality: medium. Secondary synthesis; Lamport-Paulson sections 4–5 still not
  directly read in full.
- Implication for Organon: The domain distinction is the correct framing for deflecting
  Lamport's critique. The positive case for Lean 4 (or Idris 2) as the specific tool
  for Organon's validation layer needs to be constructed — drawing on Cedar VGD as
  the strongest analogical case.

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

- **"Event-B Institution"** — arXiv 2103.10881
  Formalizes Event-B using institution theory. Three-layer decomposition: mathematical language,
  infrastructure (machine internals), superstructure (specification-building operators). Covers
  refinement, parameterization, modularization. Data refinement (abstract→concrete state space),
  NOT procedural human-protocol refinement. Structurally analogous to Organon's ETHOS→protocol→
  tool layering but semantically disjoint. Potential near-miss for AC1 signature morphism
  construction. Accessed directly (Session 3).
  Tags: #event-B #refinement #institution-theory #AC1-near-miss #session-3

### BPMN Formal Verification (Sessions 2–3)

- **Lam et al. "Runtime Verification of Business Cloud Workflow Temporal Conformance"** (2019)
  — IEEE TSC
  Addresses temporal conformance of parallel cloud workflows: time-delay propagation, throughput
  metrics, timed Petri nets. Does NOT address automation tier semantics, sequential human
  judgment gates, or compliance against invariant declarations. Not a threat to AC2. Accessed
  via secondary synthesis (Session 3).
  Tags: #BPMN #workflow-verification #temporal-conformance #not-threat-to-AC2 #session-3

- **"Extending BPMN for Human-Agentic Processes"** — arXiv 2412.05958 (2024)
  Proposes AgentTask with human-reflection mode. Explicitly acknowledges lack of formal
  execution semantics and verification methods. Informal metamodeling. Narrows the informal
  novelty window for Organon's Protocol claim but not the formal novelty window. Accessed
  directly (Session 3).
  Tags: #BPMN #human-agentic #informal-novelty-window #session-3

- **Chareonsuk & Vatanawood** — BPMN formal verification
  BPMN formalization with process algebra or formal semantics. Not investigated.
  Tags: #BPMN #formal-semantics #not-investigated

### Lamport-Paulson Debate

- **"Should Your Specification Language Be Typed?"** (1999) — Lamport and Paulson —
  ACM TOPLAS 21:502-526 — lamport.azurewebsites.net/pubs/lamport-types.pdf
  Located at Microsoft Research (Cambridge URL). Lamport: untyped set theory (TLA+, ZF) is
  strictly more expressive for formal mathematical specification; types impose false constraints;
  dependent types are too complex for ordinary engineers. Paulson: types help mechanized proofs;
  type checking catches spec errors early. Domain of debate: concurrent algorithm specification
  (TLA+, Z, B domain), NOT structured data validation. Organon operates in structured data
  validation — Lamport's expressiveness arguments do not apply; Paulson's pro-type arguments
  do. Sections 4–5 still not directly read in full; central arguments reconstructed via
  secondary synthesis (Session 3).
  Tags: #specification-languages #typed-vs-untyped #foundational-debate #partially-read #session-3

### AWS Cedar

- **"How We Built Cedar: A Verification-Guided Approach"** (2024) — Disselkoen et al. —
  FSE 2024 — arxiv.org/html/2407.01688v1
  Primary technical reference for VGD. Lists all seven proved properties. Documents Lean
  model / Rust production code split. Documents differential testing methodology, bugs found,
  and 3.4:1 proof-to-model ratio. Explicitly states the Rust code is not formally verified.
  Read directly.
  Tags: #production-case #lean4 #dependent-types #non-mathematical-domain

### OWL / SHACL / Knowledge Representation (Sessions 2–3)

- **Pavlyshyn (Nov 2025)** — "Formalizing OWL and SHACL Semantics in Agda" — Substack
  Blog post (not peer-reviewed). Encodes OWL semantics as OWAValue (known-true/known-false/
  unknown) and SHACL as CWAValue with Dec (decidable proposition) types. Central conclusion:
  dependent types are the metalanguage; SHACL is the object language. Dependent types strictly
  subsume SHACL at the metalevel. Read directly (Session 3).
  Tags: #OWL #SHACL #dependent-types #agda #blog-post #read-directly #session-3

- **SHACL Expressiveness Primitives** — Dagstuhl ICDT 2022
  Establishes four primitive features of SHACL: zero-or-one path expressions, equality,
  disjointness, closure — all primitive. Informs the formal expressiveness ceiling of SHACL
  Core. Accessed via secondary sources (Session 3).
  Tags: #SHACL #expressiveness #formal-semantics #session-3

- **TypeQL / TypeDB** — SIGMOD 2024
  Paper compares against relational/graph models, not OWL or dependent types. TypeDB
  positions as a type-theoretic alternative to OWL ontologies. Does not constitute a direct
  OWL vs. dependent types comparison. Not directly read.
  Tags: #knowledge-representation #type-theory #OWL-alternative #SIGMOD-2024 #not-directly-read

### LLM Agents and Formal Methods (Sessions 2–3 — flagged, not investigated)

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
automation tiers, sequential gates, and compliance checking. Session 3 determined this
community has NOT pre-empted Organon's conditional automation semantics: BPMN automation
tiers are static task type annotations, not conditional properties driven by satisfaction
condition status. The informal novelty window is narrowed by arXiv 2412.05958 but the formal
novelty window remains.

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
   underpins OWL integration) remains a potential bridge to ontology tooling. The Event-B
   institution's three-layer decomposition provides a structural template for investigating
   signature morphisms at Organon's layer transitions (AC1 near-miss path forward).

2. **Verification-guided development as a methodology pattern.** Cedar's VGD pattern is
   applicable: write a formal model of schema concepts in a proof assistant, prove structural
   properties, implement in TypeScript, use differential testing. Conditioned on resolving
   the closed-world assumption for Organon's domain.

3. **E↓-logic and process institutions as vocabulary.** Even if E↓-logic does not cover
   Organon's specific workflow tier structure, its vocabulary (sequential event composition,
   hybrid state variables, institution structure) provides a starting vocabulary for formalizing
   the Protocol component.

4. **Dependent types subsume SHACL.** Confirmed by Pavlyshyn's Agda encoding. If Organon's
   knowledge layer uses dependent types for invariant checking, it surpasses SHACL's expressive
   ceiling in three specific ways: cross-file referential integrity, dependency graph acyclicity,
   and conditional automation tier semantics. The comparison is no longer hypothetical.

5. **Conditional automation semantics as the load-bearing novelty claim for AC2.** The
   distinction between BPMN static task type annotation and Organon's conditional automation
   tier (driven by satisfaction condition status) is the specific formal claim that has survived
   BPMN scrutiny. This claim needs to be formalized — a sketch in institution-theoretic or
   process-algebraic terms — to confirm rather than assert novelty.

---

## What Appears Novel to Organon

1. **Conditional automation tier semantics.** The specific form: automation_tier is a
   CONSTRAINT PROPERTY on behavioral invariant declarations, conditional on satisfaction
   condition status — not a static task type annotation (BPMN) and not a data refinement
   step (Event-B). No existing BPMN formal verification literature or process institution
   framework covers this combination.
   Status: **(survives scrutiny, not formally confirmed)** — formal encoding still needed.

2. **LLM-agent procedural workflow orchestration with automation tiers and judgment-based
   execution.** The refined novelty claim (from Session 2): no institution-theoretic framework
   found that covers this specific combination. BPMN scrutiny passed. arXiv 2412.05958
   narrows informal window.
   Status: **(refined, informally survives, formal encoding needed)**.

3. **LLM agents as the primary constructors of formally verified schema instances.** Cedar's
   VGD is a human engineering workflow. Organon's proposed use case involves LLMs generating
   Idris terms from YAML and the Idris compiler verifying them. arXiv 2412.06512 (Dec 2024)
   on LLM agents + formal methods integration is flagged but not yet checked.
   Status: **(unverified)** — arXiv 2412.06512 must be read in Session 4.

4. **Personas as a 5-tuple component with no institution-theoretic counterpart.** Personas
   remain unanalyzed against any formal framework. No candidate prior art identified.
   Status: **(not researched)** — lowest priority given other open gaps.

---

## Open Questions

**Q1: Does the satisfaction condition hold for the corrected Organon 5-tuple mapping?**
Why it matters: correcting Measurements ~ Mod to Organon-instances ~ Mod makes the mapping
structurally more defensible, but the satisfaction coherence condition M' ⊧ Sen(φ)(ρ) iff
Mod(φ)(M') ⊧ ρ has still not been checked under the new mapping.
What research would answer it: identify the Organon analog of a signature morphism — the
Event-B institution's construction for its three-layer decomposition may be adaptable here.
Sketch whether Organon-instances reduce contravariantly along ETHOS-extension or protocol-
inheritance morphisms.

**Q2: Is Organon's Protocol formally distinct from BPMN automation tier semantics?**
Why it matters: the conditional automation semantics claim is the load-bearing novelty
argument for AC2. arXiv 2412.05958 narrows the informal window.
What research would answer it: produce a formal (or informal sketch of a formal) institution-
theoretic or process-algebraic encoding of Organon's Protocol component. Compare against
E↓-logic and CoCASL. Demonstrate that conditional automation tier is not expressible in
existing frameworks.

**Q3 (resolved): How does SHACL compare to dependent types for Organon's invariant checking?**
Resolution (Session 3): SHACL cannot express: cross-file referential integrity, dependency
graph acyclicity, conditional automation tier semantics. SHACL-SPARQL can approximate the
first two at the cost of a YAML→RDF pipeline and SPARQL endpoint, but cannot express the
third. Dependent types (Lean 4/Idris 2) cover all three natively. Pavlyshyn confirms DTs
subsume SHACL at the metalevel.

**Q4 (resolved in direction): What does Lamport-Paulson (1999) actually argue?**
Resolution (Session 3): Lamport's expressiveness arguments target the domain of formal
mathematical specification (concurrent algorithms, TLA+). Organon operates in structured
behavioral data validation — a different, bounded, closed-world domain. Paulson's pro-type
arguments (early error catching, mechanized proof guidance) apply directly. The paper does
not cut against Lean 4 for Organon. Still needs positive argument for Lean 4 specifically.

**Q5: Is Organon's domain closed-world and decidable?**
Why it matters: Cedar's VGD works because Cedar is provably closed-world. Organon's protocols
reference external file system state and dynamic runtime properties. The closed-world assumption
must be demonstrated before applying Cedar's VGD pattern.
What research would answer it: analyze each of the seven Cedar properties against Organon's
schema domain. Identify which frontmatter invariants are closed-world and which require
open-world assumptions. Restrict formal verification scope accordingly.

**Q6: Can Event-B institution's signature morphism construction be adapted to Organon's
layer transitions?**
Why it matters: AC1 blocking challenge. Event-B institution's three-layer decomposition is
structurally analogous to Organon's ETHOS→protocol→tool layering, and institution theory's
signature morphisms allow translation between formalisms with different signature vocabularies.
What research would answer it: read arXiv 2103.10881 in full. Identify the specific signature
morphism definition for Event-B's layer decomposition. Attempt to construct an Organon analog.

**Q7: Is Organon's TypeScript CLI validator equivalent to any fragment of dependent type
theory, and can its correctness be formally verified by Lean 4?**
Why it matters: AC4 ceiling. The CLI implements CWA-style validation in practice, but its
formal semantics have not been characterized.
What research would answer it: analyze the CLI's validation logic against the four SHACL
primitive features (Dagstuhl ICDT 2022). Identify which invariants the CLI checks and which
it misses. Determine whether a Lean 4 model of the CLI's validation semantics is feasible.

---

## Critic's Unresolved Challenges

**[BLOCKING]: AC1 satisfaction condition and signature morphism gap — no relief from
Session 3**
The Organon-instances ~ Mod mapping is more defensible than Measurements ~ Mod, but
contravariant functoriality has not been demonstrated. Without identifying the Organon analog
of a signature morphism and sketching that Organon-instances reduce along it, the mapping
remains a metaphor. Session 3 identified an Event-B near-miss (arXiv 2103.10881's three-layer
decomposition with institution-theoretic signature morphisms is structurally analogous), but
the near-miss was not followed through. This is the clearest path forward for AC1.
Follow-up: read arXiv 2103.10881 in full. Attempt signature morphism construction for
Organon's layer transitions using Event-B as the template. Session 4 Priority 1.

**[SIGNIFICANT]: AC4 TypeScript CLI vs. dependent types comparison incomplete**
The SHACL vs. DT comparison is resolved. SHACL's limitations for Organon are documented.
DT subsumes SHACL confirmed. Remaining gap: the CLI's validation semantics relative to
dependent type theory fragments is uncharacterized. Can the CLI's correctness be formally
verified by Lean 4? This question constitutes AC4's remaining ceiling.
Follow-up: analyze CLI validation logic against SHACL primitive features and Lean 4 model
feasibility. Session 4 Priority 2.

**[SIGNIFICANT]: Lamport-Paulson domain distinction asserted, not formally proved**
The boundary "Organon is structured data validation, not mathematical theorem proving,
therefore Lamport's arguments don't apply" is conceptually plausible but not rigorously
defended. A positive argument for why Lean 4 is the right tool for Organon's specific
validation semantics is needed, not just a category distinction deflecting Lamport's critique.
Follow-up: construct the positive Lean 4 argument drawing on Cedar VGD as the analogical
case. Read Lamport-Paulson sections 4–5 directly. Session 4 Priority 3.

**[SIGNIFICANT]: BPMN Protocol novelty claim — informal window narrowed, formal encoding
not produced**
arXiv 2412.05958 (BPMN human-agentic extension, 2024) narrows the informal novelty window.
The Protocol novelty claim survives on conditional automation semantics (conditional vs.
static), but this survival is a semantics argument, not a formal result. Until a formal
institution-theoretic or process-algebraic encoding of Organon's conditional automation
tier is produced and compared against E↓-logic and CoCASL, the claim is credible but
unconfirmed.
Follow-up: produce a formal encoding sketch of Organon's Protocol component. Session 4
Priority 2 (joint with AC4 CLI gap).

**[SIGNIFICANT]: Cedar closed-world assumption not verified for Organon's scope**
Organon's protocols reference open-world properties (file system state, runtime behavior).
The closed-world assumption must be demonstrated before applying Cedar's VGD pattern.
Follow-up: identify which components of Organon's schema are closed-world. Restrict formal
verification scope accordingly.

**[OPEN]: LLM agents + formal methods (arXiv 2412.06512) not investigated**
Directly relevant to the novelty sub-claim about LLMs as constructors of formally verified
schema instances.
Follow-up: read in Session 4.

---

## Session 4 Scope

Ordered by priority:

**Priority 1: AC1 — attempt signature morphism construction via Event-B institution near-miss**
Specific tasks: read arXiv 2103.10881 (Event-B institution) in full. Identify the specific
signature morphism definition for Event-B's three-layer decomposition. Attempt to construct
an Organon analog for ETHOS→protocol→tool transitions. Determine whether Organon-instances
satisfy contravariant functoriality along this morphism, or explicitly downgrade the
institution framing to structural analogy in algebra-of-methodologies-research.md.

**Priority 2: AC4 — TypeScript CLI vs. dependent types; AC2 — formal encoding sketch**
Specific tasks (AC4): analyze the CLI's validation logic against the four SHACL primitive
features. Determine whether a Lean 4 model of the CLI's validation semantics is feasible
and what the proof complexity would be.
Specific tasks (AC2): produce an informal but precise sketch of an institution-theoretic or
process-algebraic encoding of Organon's Protocol component. Demonstrate whether conditional
automation tier semantics can or cannot be expressed in E↓-logic.

**Priority 3: AC3 — read Lamport-Paulson sections 4–5 directly; construct positive Lean 4
argument**
Specific tasks: obtain and read sections 4–5 of the Lamport-Paulson paper (Cambridge URL).
Construct a positive argument for Lean 4 as the tool for Organon's validation layer, drawing
on Cedar VGD as the analogical case and the Pavlyshyn Agda encoding as the SHACL subsumption
demonstration.

**Priority 4: LLM agents + formal methods (arXiv 2412.06512)**
Specific tasks: read Dec 2024 roadmap paper. Determine whether Organon's LLM-as-verifier
sub-claim has been addressed in the literature.

**Priority 5: Cedar closed-world assumption for Organon's schema domain**
Specific tasks: analyze each of the seven Cedar proved properties against Organon's frontmatter
schema domain. Identify which invariants are provably closed-world. Identify which require
open-world assumptions and whether those can be scoped out.

---

## Sources Consulted

Sources read directly (Sessions 1–3):
- Disselkoen et al. (2024) "How We Built Cedar" — arxiv.org/html/2407.01688v1 (FSE 2024)
- IEP "Institution Theory" — iep.utm.edu/insti-th/
- Goguen project page — cseweb.ucsd.edu/~goguen/projs/inst.html
- lean-lang.org/use-cases/cedar/
- Cedar language paper — arxiv.org/abs/2403.04651
- nLab institution page
- Pavlyshyn (Nov 2025) — Agda formalization of OWL/SHACL semantics (Substack, Session 3)
- arXiv 2103.10881 (Event-B institution, Session 3)
- arXiv 2412.05958 (BPMN human-agentic extension, Session 3)

Sources accessed via secondary sources or partially read (not directly read in full):
- Goguen & Burstall (1992) "Institutions" JACM — behind paywall
- Lamport & Paulson (1999) "Should Your Specification Language Be Typed?" — located at
  Microsoft Research (Cambridge URL); central arguments reconstructed via secondary synthesis
  (Session 3); sections 4–5 not read directly
- Sannella & Tarlecki (2012) — Springer monograph, not accessible
- E↓-logic — located, not directly read
- CSP-as-institution (Mossakowski et al.) — located, not directly read
- TypeQL SIGMOD 2024 — located, not directly read
- Lam et al. (2019) "Runtime Verification of Business Cloud Workflow Temporal Conformance" —
  IEEE TSC, accessed via secondary synthesis (Session 3)
- Dagstuhl ICDT 2022 (SHACL expressiveness primitives) — accessed via secondary sources
  (Session 3)

Sources not investigated (flagged for Session 4):
- Meseguer (1989) "General Logics"
- Chareonsuk & Vatanawood — BPMN formalization
- arXiv 2412.06512 — LLM agents + formal methods integration roadmap (Dec 2024)
- Idris 2 production deployment cases
- Hets (Heterogeneous Tool Set) — institution theory tooling
