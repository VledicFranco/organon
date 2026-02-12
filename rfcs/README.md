---
type: navigation
scope: product
name: rfcs
version: "1.0"
summary: Request for Comments (RFC) directory — proposals for changes to the Organon methodology and organon-tools implementation
token_estimate: 150
provides: [rfc-directory, proposal-tracking]
audience: [llm, human]
---

# RFCs (Requests for Comments)

> Formal proposals for changes to Organon methodology, organon-tools features, and project constraints.

---

## Purpose

RFCs provide a **deliberate, reviewable, traceable mechanism** for evolving the Organon project. Every RFC:
- Declares **organon impact** upfront (Create/Update/Delete)
- Goes through **review and approval** before implementation
- Implements the **Same-PR principle** (organon changes in same PR as code)

See [book-llms/patterns.md](../book-llms/patterns.md#rfc-driven-evolution-pattern) for the full RFC-Driven Evolution Pattern.

---

## RFC Lifecycle

| State | Meaning |
|-------|---------|
| **Draft** | RFC is being written |
| **Review** | Complete, awaiting team approval |
| **Accepted** | Team approved design, ready to implement |
| **Implementing** | Code is being written |
| **Implemented** | Code merged, tests passing, organon updated |
| **Superseded** | Replaced by newer RFC |
| **Withdrawn** | Abandoned (with explanation) |

---

## Active RFCs

| Number | Title | Status | Author | Created |
|--------|-------|--------|--------|---------|
| [001](./001-testing-framework.md) | @organon/testing Framework | Implemented | organon-tools-developer | 2026-02-10 |
| [002](./002-compound-engineering-integration.md) | Recursive Collaboration Pattern | Implemented | Claude Sonnet 4.5 | 2026-02-10 |
| [003](./003-explore-before-ethos.md) | Explore-Before-Ethos Pattern | Implemented | Claude Sonnet 4.5 | 2026-02-10 |
| [004](./004-workflow-context-field-collision.md) | Workflow Context Field Collision | Implemented | Claude Opus 4.6 | 2026-02-11 |
| [005](./005-observation-synthesis-loop.md) | Observation Accumulation Convention | Draft | Claude Opus 4.6 | 2026-02-11 |

---

## When to RFC

| Change Type | Mechanism |
|-------------|-----------|
| New product-level invariant | **RFC required** (high bar, team consensus) |
| New domain or feature organon | **RFC for the capability** |
| New organon-tools feature | **RFC for significant features** |
| Constraint evolution (same identity) | **RFC for the capability** |
| Clarifications, typos, reference updates | Direct commit (no RFC) |
| File path updates after refactor | Direct commit (no RFC) |

**Rule of thumb:** If the change introduces new constraints or modifies existing ones, use an RFC. If it's maintenance, commit directly.

---

## Creating an RFC

1. **Copy the structure** from an existing RFC (e.g., `001-testing-framework.md`)
2. **Use frontmatter** with `type: rationale`, `status: draft`
3. **Declare Organon Impact** (Create/Update/Delete sections)
4. **Submit for review** and iterate based on feedback
5. **Implement with Same-PR principle** (code + organon changes together)

**Key sections:**
- Problem Statement
- Proposed Solution
- Design Decisions (with rationale and trade-offs)
- Organon Impact (Create/Update/Delete)
- Implementation Plan
- Success Metrics
- Open Questions

---

## RFC Numbering

RFCs use sequential numbers: `001-name.md`, `002-name.md`, etc.

Numbers are never reused. If an RFC is withdrawn, the number is retired.

---

## Related Files

| File | Relationship |
|------|--------------|
| [book-llms/patterns.md](../book-llms/patterns.md) | RFC-Driven Evolution Pattern specification |
| [packages/tools/dev/](../packages/tools/dev/) | Pre-RFC design work and brainstorming |
