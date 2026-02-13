---
type: constraints
scope: product
name: organon-project
version: "1.1"
summary: Project-level invariants for the Organon methodology repository — formalizes CLAUDE.md constraints with stable IDs
token_estimate: 1800
invariants_count: 6
principles_count: 7
heuristics_count: 10
invariants:
  - id: INV-ORG-1
    name: dogfood-methodology
  - id: INV-ORG-2
    name: code-is-source-of-truth
  - id: INV-ORG-3
    name: every-file-has-frontmatter
  - id: INV-ORG-4
    name: three-artifact-separation
  - id: INV-ORG-5
    name: backward-compatible-methodology
    judgment_call: true
  - id: INV-ORG-6
    name: bidirectional-references
inherits_from: [meta-organon]
load_priority: high
required_for:
  - project_development
  - methodology_evolution
  - protocol_creation
audience: [llm, human]
related_files:
  - ../CLAUDE.md
  - ../book-llms/ETHOS.md
  - protocols/PROTOCOLS.md
---

# Organon Project Ethos

> Behavioral constraints for agents developing the Organon Methodology repository.

---

## Identity

### What This Project IS

- A methodology repository: documentation + CLI tooling for the Organon documentation system
- A meta-organon: it documents itself using its own rules
- Three deliverables: `book-llms/` (LLM reference), `book-humans/` (narrative guide), `packages/tools/` (CLI)
- The canonical definition of the Organon methodology
- A three-layer system: protocols (knowledge) → workflows (agent bindings) → tools (operations)

### What This Project IS NOT

- Not an application codebase — no runtime services, no databases
- Not a library consumers import — the tooling is a standalone CLI
- Not Agent Tavern — that is the reference *implementation*, this is the reference *specification*
- Not a tutorial — `book-llms/` is a technical reference, `book-humans/` is the planned narrative

---

## Invariants

1. **INV-ORG-1: dogfood-methodology.** This repo must use Organon to govern itself. If the methodology says it, we follow it here.
   - Enforced by: `organon verify` gates, protocol↔workflow bidirectional references, this ETHOS.md file existing

2. **INV-ORG-2: code-is-source-of-truth.** `packages/tools/` source code is authoritative. Documentation about the CLI describes what the code does, never aspirations.
   - Enforced by: `organon-tools-developer` workflow (PROTO-ORG-2), test suite (456 tests across both packages)

3. **INV-ORG-3: every-file-has-frontmatter.** Every organon file has YAML frontmatter. Frontmatter enables progressive disclosure — agents discover, filter, and budget before loading full content.
   - Enforced by: `organon verify --gate frontmatter` gate, `organon validate` 4-stage validation

4. **INV-ORG-4: three-artifact-separation.** ETHOS.md = constraints, PHILOSOPHY.md = reasoning, PROTOCOL.md = procedures. Never mix concerns across artifact types.
   - Enforced by: `organon validate` type-specific section checks, `quality-review` workflow (PROTO-ORG-7)

5. **INV-ORG-5: backward-compatible-methodology.** Changes to core methodology must not break existing organon implementations in other projects.
   - Enforced by: `methodology-spec-evolution` workflow (PROTO-ORG-3), RFC process for breaking changes

6. **INV-ORG-6: bidirectional-references.** When a protocol declares `automation_tier: automated`, the referenced workflow must exist and reference back. No orphans in either direction.
   - Enforced by: `organon verify --gate triplets` gate, `verify-and-health` workflow (PROTO-ORG-4)

---

## Principles (Prioritized)

1. **LLM-centric design.** This methodology is built for LLM consumption and execution. Every design decision optimizes for LLM parsing and action.

2. **Enforcement through automation.** Organons that aren't enforced become fiction. The enforcement loop — Define → Bind → Execute → Verify → Compound → Evolve — is what makes this methodology real.

3. **Clarity over completeness.** A clear document beats a comprehensive but vague one.

4. **Progressive disclosure over arbitrary limits.** Files can be any size as long as they support layered access. Token efficiency comes from not loading what you don't need.

5. **Constraints over explanations.** State what to do, not why. Put "why" in philosophy files.

6. **Specificity over generality.** Concrete examples beat abstract descriptions.

7. **Protocols before workflows, workflows before tools.** Document the procedure first. Only create a workflow when the protocol is complex enough.

---

## Decision Heuristics

| Situation | Action |
|-----------|--------|
| Creating any organon file | Add YAML frontmatter first. Include `type`, `scope`, `name`, `version`, `summary`, `token_estimate` at minimum. |
| File growing large | Ensure frontmatter has accurate `token_estimate`. Ensure sections use standardized headings. Do NOT split just for size. |
| Editing `book-llms/` content | Use `methodology-spec-evolution` workflow (PROTO-ORG-3). Follow section structure from `book-llms/ETHOS.md`. |
| Adding a new pattern | Add to `book-llms/patterns.md` if universal. Create a protocol in `book-llms/protocols/` if procedural. |
| Modifying `packages/tools/` | Use `organon-tools-developer` workflow (PROTO-ORG-2). TypeScript only. Use yargs for CLI. |
| Creating new methodology content | Ask: does it constrain (ethos), explain (philosophy), or instruct (protocol)? File accordingly. |
| Unsure if something belongs here vs Agent Tavern | Specification and methodology go here. Implementation-specific patterns stay in Agent Tavern. |
| README exceeds 100 lines | READMEs are routers, not content. Split content into dedicated files. |
| Starting a new work session | Run `verify-and-health` workflow (PROTO-ORG-4) to check project integrity. |
| Ending a significant work session | Run `session-compounding` workflow (PROTO-ORG-5) to capture improvements. |

---

## Verification Checklist

- [ ] Frontmatter present with all required fields
- [ ] Frontmatter counts match actual content (6 invariants, 7 principles, 10 heuristics)
- [ ] Identity boundaries are specific and testable
- [ ] Principles are numbered by priority
- [ ] No conflicts with meta-organon constraints (book-llms/ETHOS.md)
- [ ] All invariant IDs follow INV-ORG-N format
- [ ] All enforcement mechanisms reference real tools or workflows
