---
type: rationale
scope: product
name: skill-family-testing
version: "1.0"
summary: Observations from testing the 7-skill enforcement loop family through RFC 001 refinement and testing domain creation
token_estimate: 2000
status: in-progress
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
| 5 | `/verify-and-health` | Check project integrity | Pending |
| 6 | `/organon-tools-developer` | Implement testInvariant() + assertMaxValue() | Pending |
| 7 | `/verify-and-health` | Re-check after code changes | Pending |
| 8 | `/methodology-spec-evolution` | Update book-llms/ references | Pending |
| 9 | `/session-compounding` | End-of-session review | Pending |

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

### O7: Automated gates and semantic review serve clearly different purposes

**Pattern:** `organon validate` catches: missing frontmatter, wrong counts, broken references, schema violations. `/quality-review` catches: vague invariants, wrong principle ordering, missing heuristics, terminology drift. Zero overlap in findings between the two.

**Implication:** Both are needed. Automated gates are necessary but not sufficient. Semantic review catches meaning issues that no schema validator can detect.

**Possible methodology guidance:** "Automated verification (VERIFY phase) and semantic review (also VERIFY phase) are complementary, not redundant. The verify-and-health workflow handles the first; quality-review handles the second."

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
