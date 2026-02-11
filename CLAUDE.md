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

1. **Dogfood the methodology.** This repo must use Organon to govern itself. If the methodology says it, we follow it here.

2. **Code is the source of truth.** `packages/tools/` source code is authoritative. Documentation about the CLI describes what the code does, never aspirations.

3. **Every organon file has YAML frontmatter.** Frontmatter enables progressive disclosure — agents discover, filter, and budget before loading full content. See `book-llms/frontmatter-system.md` for the schema.

4. **Three artifact separation.** ETHOS.md = constraints, PHILOSOPHY.md = reasoning, PROTOCOL.md = procedures. Never mix concerns across artifact types.

5. **Backward-compatible methodology.** Changes to core methodology must not break existing organon implementations in other projects.

6. **Bidirectional references.** When a protocol declares `automation_tier: automated`, the referenced workflow must exist and reference back. No orphans in either direction.

---

## Principles (Prioritized)

1. **LLM-centric design.** This methodology is built for LLM consumption and execution. LLMs are the interface between human intent and automated enforcement. Every design decision — frontmatter, standardized sections, decision heuristics — optimizes for LLM parsing and action. Humans define "what" and "why"; LLMs execute "how."

2. **Enforcement through automation.** Organons that aren't enforced become fiction. The enforcement loop — Define (organon) → Bind (workflow) → Execute (tools) → Verify (automated checks) → Evolve (update organon) — is what makes this methodology real. Every constraint should have a path to automated verification.

3. **Clarity over completeness.** A clear document beats a comprehensive but vague one. Applies to both methodology docs and code.

4. **Progressive disclosure over arbitrary limits.** Files can be any size as long as they support layered access. Token efficiency comes from *not loading what you don't need*, not from keeping files small. The mechanism:
   - **Frontmatter** (~25-50 tokens): type, scope, summary, token_estimate, relationships — enough to decide "should I load this?"
   - **Section structure** (standardized headings): agents can load specific sections (e.g., just `## Invariants`) without reading the whole file
   - **README-as-router**: directory-level navigation remains lightweight (<100 lines)

5. **Constraints over explanations.** State what to do, not why. Put "why" in philosophy files or code comments.

6. **Specificity over generality.** Concrete examples beat abstract descriptions. Reference Agent Tavern patterns when illustrating.

7. **Protocols before workflows, workflows before tools.** Document the procedure (protocol) first. Only create a workflow when the protocol is complex enough (≥5 steps, error-prone, frequent). Only create tools for atomic operations the workflow orchestrates. Technology-agnostic: workflows can be Claude skills, Cursor rules, or any agent-native format.

---

## Decision Heuristics

| Situation | Action |
|-----------|--------|
| Creating any organon file | Add YAML frontmatter first. Include `type`, `scope`, `name`, `version`, `summary`, `token_estimate` at minimum. |
| File growing large | Ensure frontmatter has accurate `token_estimate`. Ensure sections use standardized headings so agents can load partially. Do NOT split just for size — split only when content serves different scopes or audiences. |
| Editing `book-llms/` content | Follow section structure from `book-llms/ETHOS.md`. Update frontmatter counts if invariants/principles/heuristics changed. |
| Adding a new pattern | Add to `book-llms/patterns.md` if universal. Create a protocol in `book-llms/protocols/` if procedural. |
| Modifying `packages/tools/` | TypeScript only. Use yargs for CLI. Keep command files self-contained. |
| Creating new methodology content | Ask: does it constrain (ethos), explain (philosophy), or instruct (protocol)? File accordingly. |
| Unsure if something belongs here vs Agent Tavern | Specification and methodology go here. Implementation-specific patterns stay in Agent Tavern. |
| README exceeds 100 lines | READMEs are still routers, not content. Split content into dedicated files. |
| Adding a new scope/directory | Include a README.md as router. Follow Pattern A (dedicated `organon/` directory). |
| Deciding automation tier for a protocol | Manual: judgment required. Semi-automated: 1-2 steps, single tool. Automated (workflow): ≥5 steps, cross-domain, error-prone, frequent. |

---

## Progressive Disclosure Model

The core mechanism for token-efficient big files:

```
Layer 0: README-as-Router        ~50 tokens    "What files exist in this directory?"
    ↓
Layer 1: Frontmatter             ~25-50 tokens "What is this file? Should I load it?"
    ↓
Layer 2: Section Headings        ~100 tokens   "What sections does it have?"
    ↓
Layer 3: Specific Section        variable      "Load just ## Invariants"
    ↓
Layer 4: Full File               full cost     "Load everything"
```

An agent working on a genesis tool implementation doesn't need to load all 49 organon files. It:
1. Queries frontmatter: `required_for: genesis_tool_implementation` → 3 files
2. Checks `token_estimate` → fits in budget
3. Loads only those 3 files

**This replaces hard line limits.** Quality and completeness of content are never sacrificed for brevity. Token efficiency is achieved through navigation, not truncation.

---

## Project Structure

```
organon/
├── CLAUDE.md                         ← You are here (product-level agent guidance)
├── README.md                         ← Public-facing project overview
├── book-llms/                        ← LLM technical reference (methodology spec)
│   ├── ETHOS.md                      ← Meta-organon constraints
│   ├── PHILOSOPHY.md                 ← Meta-organon reasoning
│   ├── patterns.md                   ← Pattern catalog
│   ├── scopes.md                     ← Scope hierarchy
│   ├── templates.md                  ← Copy-paste scaffolds
│   ├── frontmatter-system.md         ← YAML frontmatter specification
│   ├── three-layer-architecture.md   ← Protocols → Workflows → Tools
│   └── protocols/                    ← Step-by-step procedures
├── book-humans/                      ← Narrative guide (planned, outline only)
├── organon/                          ← This project's own organon hierarchy
│   ├── ETHOS.md                      ← Meta-organon for the organon system
│   ├── README.md                     ← Navigation
│   ├── domains/                      ← Bounded contexts of this project
│   ├── features/                     ← Cross-cutting capabilities
│   └── protocols/                    ← Development procedures
└── packages/
    ├── tools/                        ← CLI tooling (TypeScript, yargs)
    │   ├── src/commands/             ← generate, verify, find
    │   └── package.json              ← @organon/tools
    └── testing/                      ← Test utilities and shared test infrastructure
```

---

## Development Workflow

1. **Read the organon first.** Before working in any area, read its ETHOS.md (if one exists) plus this file.
2. **Ethos-first for new work.** When creating a new domain, feature, or component — write the ethos before implementing.
3. **Frontmatter on every organon file.** Add frontmatter when creating, update when modifying (especially counts and token_estimate).
4. **Verify after changes.** Check that content follows its own patterns (required sections, frontmatter accuracy, no contradictions with parent scope).
5. **Commit style.** Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`.
6. **No force-push to master.** Branch and PR for non-trivial changes.

---

## Out of Scope

Do not do the following in this repository:

- Add runtime application code (services, APIs, databases)
- Implement Agent Tavern-specific patterns — those belong in that repo
- Write extended tutorials — that's `book-humans/` work, which has its own planned timeline
- Publish `@organon/tools` to npm — tooling is not ready yet
- Split files just because they're long — split only when content serves different scopes or audiences
