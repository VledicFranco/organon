---
type: rationale
scope: meta
name: methodology-overview
version: "1.0"
summary: Bird's-eye view of what problems Organon solves, where solutions live, and what gaps remain
token_estimate: 2026
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
| 10 | **Methodology evolution** | How the methodology itself changes without drift | [RFC-driven evolution](./patterns.md#rfc-driven-evolution-pattern), methodology version pinning, meta-organon pattern ([patterns.md](./patterns.md)) | Solved |
| 11 | **Invariant-to-test tracking** | No mechanism to track which invariants have tests | Stable invariant IDs in frontmatter, `@organon-invariant` annotation contract, `organon coverage` CLI, `invariant-coverage` verification gate. Note: Judgment-call invariant review mechanism specified but not automated (V1 manual process) ([invariant-tracking.md](./invariant-tracking.md)) | Solved |
| 12 | **Workflow authoring guidance** | What makes a good workflow vs a bad one? | Quality attributes (completeness, traceability, context sufficiency, error recoverability), archetypes, error handling patterns, anti-patterns, `workflow-quality` verification gate ([workflow-authoring.md](./workflow-authoring.md)) | Solved |

---

## Known Gaps

| ID | Gap | Problem | Current State | Suggested Priority |
|----|-----|---------|---------------|--------------------|
| G2 | **Methodology effectiveness metrics** | No way to track whether the methodology is actually working over time | Health dashboard exists for point-in-time checks; no longitudinal tracking | v1 |
| G4 | **Sibling scope conflict resolution** | Two organons at the same scope level give contradictory guidance | Parent-child inheritance is specified; sibling conflicts have no resolution rule | Later |

---

## Gap Prioritization

**v1 candidates** — address these to close the most impactful specification gaps:

- **G2 (Methodology effectiveness metrics):** "Is the methodology working?" is a meta question the methodology should answer, not leave to implementers.

**Later** — rare in practice:

- **G4 (Sibling scope conflicts):** Parent-child inheritance covers most cases; same-level conflicts are uncommon.

**Out of scope** — concerns left to implementers, just as Agile leaves sprint logistics to teams:

- Cross-project sharing (tooling/ecosystem concern; version pinning is the methodology's answer)
- Multi-agent coordination (infrastructure concern)
- Emergency override (operational decision)
- Rollback/recovery (git operations; RFCs cover forward evolution)
- Tool composition (tech-stack specific)
- Human review workflow (team-specific process)

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
| [invariant-tracking.md](./invariant-tracking.md) | Invariant-to-test tracking — stable IDs, annotations, coverage reports |
| [workflow-authoring.md](./workflow-authoring.md) | Workflow authoring guidance — quality attributes, archetypes, error handling patterns |
| [protocols/](./protocols/) | Operational procedures |
