---
type: rationale
scope: product
name: skill-family-testing
version: "1.0"
summary: Observations from testing the 7-skill enforcement loop family through RFC 001 refinement and testing domain creation
token_estimate: 2800
status: complete
created: 2026-02-11
author: Claude Opus 4.6
audience: [llm, human]
---

# Learning 001: Skill Family Testing Observations

> What we learned by testing 7 skills (2 modified + 5 new) through real work: RFC 001 review, methodology hotfixes, and testing domain creation.

---

## Context

Tested the skill family by executing a planned 9-step sequence:

| Step | Skill | Task | Status |
|------|-------|------|--------|
| 1 | `/domain-feature-design` | Review RFC 001 | Done |
| 2 | `/organon-file-creation` | Create testing/ETHOS.md | Done |
| 3 | `/organon-file-creation` | Create testing/PHILOSOPHY.md | Done (same invocation as step 2) |
| 4 | `/quality-review` | Semantic review of created files | Done |
| 5 | `/verify-and-health` | Check project integrity | Done (82/100, 0 new regressions) |
| 6 | `/organon-tools-developer` | Implement testInvariant() + assertMaxValue() | Done (65 tests, 100% cov) |
| 7 | `/verify-and-health` | Re-check after code changes | Done (82/100, 0 new regressions) |
| 8 | `/methodology-spec-evolution` | Update book-llms/ references | Done (2 files updated, versions bumped) |
| 9 | `/session-compounding` | End-of-session review | Done (2 improvements: workflow fix + ignore pattern bug) |

---

## Observations

### O1: Quality review shows clear diminishing returns

**Pattern:** Pass 1 (via `/domain-feature-design`) found 19 findings including 1 architectural issue (purity contradiction). Pass 2 (via `/quality-review`) found 2 warnings + 5 suggestions, all refinement-level. A third pass was considered and correctly rejected — no new value expected.

**Implication:** Two review passes is likely the sweet spot for new organon files. First pass catches structural and semantic issues; second catches precision issues. Third pass is over-polishing.

**Possible methodology guidance:** "Review organon files twice before accepting: once for structure (automated + domain-feature-design), once for semantics (quality-review). Stop after two passes unless errors were found in the second."

### O2: Context field collision was a real production issue

**Pattern:** When adding organon workflow contract fields (`protocol_id`, `tools`, `context`) to existing Claude Code skills, the `context` field collided — Claude Code reserves it for `fork`/inline execution mode. This broke skill execution until caught.

**Implication:** The universal workflow contract in `three-layer-architecture.md` uses field names that may collide with agent-specific reserved fields. The contract was designed technology-agnostic but tested only in theory.

**Action taken:** Filed RFC 004, interim fix with `organon_context:` rename.

**Possible methodology guidance:** "When defining universal contracts, verify field names don't collide with target platforms. Test the contract against at least two real agent implementations before finalizing."

### O3: Token estimate drift is systematic, not random

**Pattern:** During the compliance review, 5 files had drifted token estimates. All 5 were **underestimates** on files that had grown through iterative editing (RFCs, design docs). No overestimates were found on growing files.

**Implication:** Files that evolve through review passes always grow (additions outnumber deletions). Token estimates set at creation time will systematically underestimate over time.

**Action taken:** Changed `TOKEN_TOLERANCE` from 0.3 to 1.0 (order-of-magnitude), aligning code with methodology's progressive disclosure philosophy.

**Possible methodology guidance:** "Update token_estimate in frontmatter when editing a file significantly. The estimate drifts toward underestimate as files grow through review."

### O4: Frontmatter count fields are the most fragile truthfulness check

**Pattern:** `decision_count: 13` in PHILOSOPHY.md was stale (actual: 19). `heuristics_count: 5` in RFC 001's proposed ETHOS.md was wrong (actual: 10). Both were caught by automation, not by human review.

**Implication:** Count fields drift every time content is added or removed. They're the most maintenance-intensive frontmatter fields. Without `organon validate`, they'd silently lie.

**Possible methodology guidance:** "Run `organon validate` after every content edit, not just at commit time. Count fields are the most likely to drift."

### O5: Validator has blind spots on inheritance resolution

**Pattern:** `inherits_from: [organon-tools]` in testing/ETHOS.md produces a warning because the validator resolves names by scanning file `name` fields, but the parent file is two directory levels up. The reference is semantically correct.

**Implication:** The validator's name-based resolution doesn't handle deep directory hierarchies well. It would need path-based or recursive scanning to resolve correctly.

**Possible tooling improvement:** `organon validate` should walk up the directory tree when resolving `inherits_from`, not just scan siblings and direct children.

### O6: organon-file-creation workflow is most valuable for preventing structural mistakes

**Pattern:** Following the workflow forced checking parent invariant compatibility before writing content (6 INV-TOOLS-* checks), running validation immediately after creation, and checking bidirectional references. Without the workflow, these steps are easily skipped.

**Implication:** The workflow's value isn't in the template selection (you can copy from the RFC) — it's in the **validation sequence** that prevents shipping structurally broken files.

**Possible methodology guidance:** "The organon-file-creation workflow's Steps 7-8 (validate + bidirectional check) are the highest-value steps. Never skip them even when creating files manually."

### O7: Automated gates and semantic review serve clearly different purposes (confirmed in step 4)

**Pattern:** `organon validate` catches: missing frontmatter, wrong counts, broken references, schema violations. `/quality-review` catches: vague invariants, wrong principle ordering, missing heuristics, terminology drift. Zero overlap in findings between the two.

**Implication:** Both are needed. Automated gates are necessary but not sufficient. Semantic review catches meaning issues that no schema validator can detect.

**Possible methodology guidance:** "Automated verification (VERIFY phase) and semantic review (also VERIFY phase) are complementary, not redundant. The verify-and-health workflow handles the first; quality-review handles the second."

### O8: verify-and-health is most useful as a regression detector, not a fixer

**Pattern:** Running `/verify-and-health` after creating testing domain files confirmed zero new regressions. All failures (20 total) were pre-existing and fell into three clean categories: pre-existing (2), RFC 004 field collision (7), invariant coverage gap (11). The skill correctly identified "no action needed on this branch."

**Implication:** The skill's highest value is **confirming no regressions** after changes, not finding new issues. It's a confidence gate: "my changes didn't break anything." The diagnostic table in the skill made categorization fast — each failure mapped to a known root cause immediately.

**Health baseline:** 82/100 (7/9 frontmatter coverage, 7 passing / 2 failing validation, all files fresh).

### O8b: Forked skill execution works well for substantial implementation

**Pattern:** `/organon-tools-developer` ran in forked mode (`context: fork`), loaded the domain ETHOS.md and PHILOSOPHY.md, then autonomously implemented 15 files (4 source modules + 4 test files + helpers + config) with 65 tests at 100% coverage. The agent correctly enforced all 7 INV-TEST-* invariants without manual intervention.

**Implication:** Forked execution is the right mode for implementation skills — the agent needs full autonomy to make architectural decisions (e.g., how to structure the resolver layer, what test patterns to use). Inline execution would have been too interactive.

**Observation:** The forked agent created a `package-lock.json` (3K+ lines) — worth checking if that should be gitignored for the packages/ directory.

### O9: Three failure categories have different fix timelines

**Pattern:** The 20 failures from `organon verify` naturally segment into: (1) pre-existing debt (fix anytime), (2) blocked by RFC 004 (fix when RFC is implemented), (3) blocked by RFC 001 (fix when testing framework exists). No ad-hoc fixes possible — each category needs its own planned work.

**Implication:** Verification output should ideally group failures by root cause, not by gate. An agent seeing 20 failures needs to quickly distinguish "3 categories, none are my fault" from "1 new failure I just introduced."

**Possible tooling improvement:** `organon verify --since <commit>` to show only new failures since a baseline.

### O10: methodology-spec-evolution workflow prevents the most common drift pattern

**Pattern:** The workflow's Step 1 (impact assessment) correctly identified the two files needing updates (`invariant-tracking.md` and `three-layer-architecture.md`) via grep. Step 4 (propagation checklist) forced checking all 6 propagation targets even though only 2 needed changes. Step 5 (version bumps) caught that both files needed `1.0 → 1.1`. Step 7 (verification) confirmed no regressions.

**Implication:** The workflow's highest value is the **propagation checklist** — without it, updating `invariant-tracking.md` would likely happen, but `three-layer-architecture.md` would be forgotten. The checklist forces checking files you wouldn't naturally think to check. However, the `organon find --term` command referenced in the workflow doesn't exist — had to use direct grep instead.

**Tooling gap:** The workflow references `organon find --term "<concept>"` for impact assessment, but the actual CLI uses `--name`, `--scope`, `--type`, `--file` flags. Either the workflow should reference the correct flags or `organon find` should gain a `--term` option for free-text search.

### O11: session-compounding found a real bug through dogfooding

**Pattern:** During the session compounding verification step, `organon verify` showed 61 FRONTMATTER_MISSING failures (up from ~2 pre-existing). Root cause: the default ignore pattern `node_modules/**` only matches top-level `node_modules/`, but the forked agent in step 6 created `packages/testing/node_modules/` which is nested. Fixed by changing to `**/node_modules/**` (also applied to `dist/**`, `.git/**`, `coverage/**`).

**Implication:** Session compounding's verification step is the safety net that catches cascading effects from earlier steps. Without running verify at the end, the nested `node_modules/` contamination would have been invisible — health score would appear to drop from 82 to much lower on next session start.

**Result:** Health score jumped from 82/100 to 91/100 after the fix. The session also fixed 3 skill files referencing the non-existent `organon find --term` flag, replacing with correct Grep tool + `organon find --name` guidance.

**Bonus observation:** The session compounding workflow itself referenced `organon find --term` — it was part of the problem it detected. Self-referential bug fix.

---

## Patterns to Watch

These are early signals — not enough data to generalize yet:

1. **Two-pass review convergence** — Does the "two passes then stop" pattern hold for all file types, or only RFCs?
2. **Skill invocation friction** — How much context does each skill actually need? Are we overloading `organon_context` arrays?
3. **Workflow step compliance** — Do agents follow all workflow steps, or skip the "boring" validation steps?
4. **Cross-skill handoff** — When one skill's output feeds another's input (e.g., domain-feature-design → organon-file-creation), is the handoff smooth or lossy?

---

## Changelog

| Date | Entry | Author |
|------|-------|--------|
| 2026-02-11 | Initial observations (O1-O7) from steps 1-4 of skill testing | Claude Opus 4.6 |
| 2026-02-11 | Added O8-O9 from step 5 (verify-and-health) | Claude Opus 4.6 |
| 2026-02-11 | Added O8b from step 6 (organon-tools-developer forked execution) | Claude Opus 4.6 |
| 2026-02-11 | Added O10 from step 8 (methodology-spec-evolution) | Claude Opus 4.6 |
| 2026-02-11 | Added O11 from step 9 (session-compounding): nested node_modules bug + workflow --term fix | Claude Opus 4.6 |
