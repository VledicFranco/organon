---
type: rationale
scope: product
name: epistemic-export-gaps
version: "1.0"
summary: Observations from implementing RFC 009 (epistemic model) — discovery gaps for non-standard organon files and methodology-spec-evolution value confirmation
token_estimate: 600
status: resolved
created: "2026-02-15"
author: Claude Opus 4.6
audience: [llm, human]
---

# Observation 005: Epistemic Export Gaps

> What we learned implementing the epistemic model: observations and RFCs were invisible to tooling until glob patterns were expanded.

---

## Context

RFC 009 added `organon export` and `organon query --category`. During testing, `--category assertion` returned zero results despite 4 observation files existing with valid frontmatter. Root cause: `organonGlobs` only matched standard file names (ETHOS.md, PHILOSOPHY.md, etc.), not numbered observation/RFC files.

---

## Observations

### O1: Observation files not in default discovery globs

- **Signal:** `organon query --category assertion` returned 0 results. Observation files exist at `organon/observations/001-*.md` but aren't named ETHOS.md/PHILOSOPHY.md/etc.
- **Implication:** Any feature that depends on discovering all organon files (export, category filter, health) silently ignores observations and RFCs. The progressive disclosure model breaks — you can't disclose what you can't discover.
- **Suggested Action:** Add `**/observations/*.md` and `**/rfcs/*.md` to both `DEFAULT_ORGANON_GLOBS` and `organon.config.json`.

### O2: Methodology-spec-evolution skill catches real drift

- **Signal:** Running the skill after implementation found two genuine issues: templates.md lacked an Observation template, and patterns.md used "evolved" instead of "resolved" for the terminal lifecycle state.
- **Implication:** The skill's propagation checklist is genuinely valuable, not ceremony. These would have been silent inconsistencies without it.
- **Suggested Action:** None needed — this confirms the skill's value. Continue using it after book-llms/ changes.

## Patterns to Watch

- After adding new organon file conventions (like observations), check that discovery globs cover them
- The `organon init` templates should include observation/RFC globs in generated `organon.config.json`
