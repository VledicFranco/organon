---
type: rationale
scope: product
name: pre-publish-validation-gaps
version: "1.0"
summary: Observations from v0.5.0 release — gaps between automated gates and real-world quality validation, warning accumulation without review
token_estimate: 800
status: signal
created: "2026-02-16"
author: Claude Opus 4.6
audience: [llm, human]
---

# Observation 006: Pre-publish Validation Gaps

> What we learned from the v0.5.0 release: automated gates pass but integration quality requires manual validation; warnings accumulate without suppression.

---

## Context

During the v0.5.0 release (RFC 009: epistemic model + export command), `/pre-publish-qa` passed all 8 checks immediately. However, the real QA value came from manually running `organon export` against the live repo and writing a custom validation script (`tmp/validate-export.js`). That validation caught a real bug: `inherits_from` names weren't resolved to entity IDs. Additionally, 8 false-positive warnings had accumulated across prior sessions without systematic review.

---

## Observations

### O1: Unit tests pass but integration quality requires manual validation

- **Signal:** Export unit tests (11 tests) all passed. The `inherits_from` resolution bug was only caught by running export against the real repo with 29 entities and checking relationship targets. Unit test fixtures had too few entities for resolution to matter.
- **Implication:** Same pattern as Observation 001-O2 (context collision caught late). Unit tests verify behavior in isolation; integration quality at scale requires real-data validation.
- **Suggested Action:** For core CLI commands that process the full organon graph (export, query, verify), consider integration tests against the canonical repo as part of pre-publish QA. Medium priority.

### O2: False-positive warnings accumulated without review

- **Signal:** 8 warnings existed across sessions: 4 `FRONTMATTER_MISSING_TYPE_FIELD` (decision_count on RFCs), 1 `FRONTMATTER_BROKEN_RFC_REF` (lookup pattern gap), 1 `FRONTMATTER_TOKEN_DRIFT`, 2 `PLACEHOLDER_DETECTED` (documentation quoting placeholders). All were fixable but had been treated as "known."
- **Implication:** Without periodic warning review, signal-to-noise degrades. A developer seeing 8+ warnings on every run learns to ignore them, potentially missing new real warnings.
- **Suggested Action:** Periodic warning triage (e.g., during session-compounding). If a warning persists across 3+ sessions, either fix it or add a suppression mechanism. Low priority — all were fixed in this session.

### O3: CHANGELOG population is manual

- **Signal:** Release script transforms `[Unreleased]` into versioned entry but doesn't populate it. Developer must manually curate entries before running release.
- **Implication:** A developer unfamiliar with the flow might run release with empty `[Unreleased]`. Current pre-publish-qa checks for non-empty entry, but the curation step itself is manual.
- **Suggested Action:** Document in release-publish skill that CHANGELOG curation happens before running the script. Low priority — one-time learning.

---

## Patterns to Watch

- If unit-test-pass-but-integration-fail recurs for another command, upgrade to pattern and mandate integration tests for all graph-processing commands
- If warning accumulation recurs after the v0.5.0 cleanup, consider a `knownWarnings` suppression mechanism in organon.config.json
