---
type: rationale
scope: meta
name: methodology-overview
version: "1.0"
summary: Bird's-eye view of what problems Organon solves, where solutions live, and what gaps remain
token_estimate: 3200
inherits_from: [meta-organon]
load_priority: high
required_for:
  - methodology_evaluation
  - organon_creation
audience: [llm, human]
---

# Methodology Overview

> Organon is a documentation methodology that makes human-LLM collaboration on complex systems consistent, enforceable, and token-efficient. This document maps the problem landscape to solution coverage and documents known gaps.

---

## The Challenges

When humans collaborate with LLMs on complex systems, a predictable set of problems emerges: decisions drift from intent, documentation goes stale, new sessions start from scratch, and constraints exist on paper but not in practice. The Organon methodology addresses each of these challenges directly. Each solution below links to the file that specifies it.

---

## Challenges with Solutions

| # | Challenge | Core Problem | Solution Mechanisms | Status |
|---|-----------|-------------|---------------------|--------|
| 1 | **Reality drift** | Code diverges from organon spec over time | Enforcement loop ([three-layer-architecture.md](./three-layer-architecture.md)), same-PR principle ([patterns.md](./patterns.md)), drift detection, verification as CI gate | Solved |
| 2 | **Design & implementation guidance** | Ad-hoc changes without architectural thinking | RFC-driven evolution, organon impact declaration, RFC lifecycle states ([patterns.md](./patterns.md)) | Solved |
| 3 | **Context efficiency** | LLMs waste tokens loading irrelevant content because they can't efficiently find and filter the right organons | Progressive disclosure, frontmatter-first querying, standardized section headings, README-as-router, code-to-organon mapping ([ETHOS.md](./ETHOS.md), [frontmatter-system.md](./frontmatter-system.md), [patterns.md](./patterns.md)) | Solved |
| 4 | **Fresh agent onboarding** | Each LLM session starts from scratch — no methodology awareness and no guidance on what to read first | Persistent workflow bindings, context loading strategy, structured onboarding pattern, scope-based navigation, identity boundaries ([patterns.md](./patterns.md), [three-layer-architecture.md](./three-layer-architecture.md)) | Solved |
| 5 | **Behavioral & decision inconsistency** | Different agents making locally reasonable but globally inconsistent decisions in the same situations | Prioritized principles, decision heuristic tables, identity boundaries ([ETHOS.md](./ETHOS.md)) | Solved |
| 6 | **Separation of concerns** | Constraints, reasoning, and procedures get mixed together | Three artifact types (ETHOS, PHILOSOPHY, PROTOCOL), methodology vs product scope separation ([PHILOSOPHY.md](./PHILOSOPHY.md), [patterns.md](./patterns.md)) | Solved |
| 7 | **Enforcement gap** | Documentation exists but isn't followed | Three-layer architecture, automation tiers, bidirectional references, verification gates ([three-layer-architecture.md](./three-layer-architecture.md)) | Solved |
| 8 | **Constraint inheritance** | Inconsistent rules across project levels | Scope hierarchy, inheritance rules, methodology scope ([scopes.md](./scopes.md)) | Solved |
| 9 | **Over/under-automation** | Not knowing what to automate vs keep manual | Automation tiers, decision factors, progressive automation ([three-layer-architecture.md](./three-layer-architecture.md)) | Solved |
| 10 | **Methodology evolution** | How the methodology itself changes without drift | RFC-driven evolution, methodology version pinning, meta-organon pattern ([patterns.md](./patterns.md)) | Solved |

---

## Known Gaps

| ID | Gap | Problem | Current State | Suggested Priority |
|----|-----|---------|---------------|--------------------|
| G1 | **Cross-project methodology sharing** | Multiple projects adopt Organon but have no way to share patterns, sync methodology updates, or contribute back | Version pinning exists but there is no sync mechanism, shared registry, or migration tooling | v2 |
| G2 | **Sibling scope conflict resolution** | Two organons at the same scope level give contradictory guidance | Parent-child inheritance is specified; sibling conflicts have no resolution rule | Later |
| G3 | **Invariant-to-test tracking** | No concrete mechanism to track which invariants have tier-4 tests and which don't | `@organon-invariant` annotation is mentioned but not specified; no coverage report format | v1 |
| G4 | **Human review workflow** | When manual-tier protocols need human judgment, there is no structured pattern for how that review happens | Methodology focuses on automation; human review is "keep at manual tier" with no further guidance | Later |
| G5 | **Multi-agent coordination** | Multiple LLM sessions working concurrently on the same project may produce conflicting changes | No concurrency model, no lock/claim mechanism, no conflict avoidance pattern | v2 |
| G6 | **Rollback / recovery** | When an organon change turns out to be wrong, what is the recovery process? | RFCs handle forward evolution; no explicit rollback pattern | Later |
| G7 | **Methodology effectiveness metrics** | No way to track whether the methodology is actually working over time | Health dashboard exists for point-in-time checks; no longitudinal tracking | v2 |
| G8 | **Workflow authoring guidance** | What makes a good workflow vs a bad one? | Universal contract defines required fields but not quality attributes, error handling patterns, or common workflow shapes | v1 |
| G9 | **Tool composition patterns** | Tools must be "composable" but there is no pattern for how they compose | Workflows orchestrate tools, but no composition primitives are defined | Later |
| G10 | **Emergency override** | What happens when you need to bypass the enforcement loop? (hotfix, CI down) | No documented escape hatch or override mechanism | v1 |

---

## Gap Prioritization

**v1 candidates** — address these to close the most impactful specification gaps:

- **G3 (Invariant-to-test tracking):** Core to the enforcement promise. Without a concrete tracking mechanism, "100% invariant coverage" is aspirational.
- **G8 (Workflow authoring guidance):** Workflows are what users actually create most. The universal contract says *what fields* are required but not *what good looks like*.
- **G10 (Emergency override):** Every enforcement system needs a documented escape hatch. Without one, teams bypass the system ad-hoc.

**v2 candidates** — address once there is real multi-project or multi-team usage data:

- **G1 (Cross-project sharing):** Requires registry infrastructure and migration tooling.
- **G5 (Multi-agent coordination):** Requires concurrency patterns that depend on real collision data.
- **G7 (Methodology effectiveness metrics):** Requires longitudinal data to design meaningful metrics.

**Later** — edge cases that can wait for maturity:

- **G2 (Sibling scope conflicts):** Rare in practice; parent-child covers most cases.
- **G4 (Human review workflow):** Low frequency; manual-tier protocols are inherently judgment-heavy.
- **G6 (Rollback/recovery):** Git revert is the implicit mechanism; explicit documentation is nice-to-have.
- **G9 (Tool composition):** Workflow orchestration handles most cases; primitives can emerge from usage patterns.

---

## Related Files

| File | Role in Methodology |
|------|---------------------|
| [ETHOS.md](./ETHOS.md) | Core invariants, principles, and heuristics — the foundational rules |
| [PHILOSOPHY.md](./PHILOSOPHY.md) | Design decisions and trade-offs — why the methodology works this way |
| [patterns.md](./patterns.md) | Concrete patterns: progressive disclosure, enforcement loop, RFC evolution, onboarding |
| [scopes.md](./scopes.md) | Scope hierarchy and inheritance rules |
| [templates.md](./templates.md) | Copy-paste scaffolds for ETHOS, PHILOSOPHY, PROTOCOL, and WORKFLOW files |
| [frontmatter-system.md](./frontmatter-system.md) | YAML frontmatter specification — the mechanism for progressive disclosure |
| [three-layer-architecture.md](./three-layer-architecture.md) | Protocols → Workflows → Tools enforcement loop with verification, testing, and drift detection |
| [protocols/](./protocols/) | Operational procedures |
