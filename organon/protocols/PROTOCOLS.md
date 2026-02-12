---
type: procedures
scope: product
name: protocols
version: "1.0"
summary: Seven development protocols backing the Organon project's workflow family — covers all 6 enforcement loop phases
token_estimate: 5800
protocols_count: 7
protocols:
  - id: PROTO-ORG-1
    name: RFC-Driven Design
    steps: 15
    automation_tier: automated
    workflow: domain-feature-design
    tools: [organon-validate, organon-verify]
    complexity: high
  - id: PROTO-ORG-2
    name: Tool Development
    steps: 10
    automation_tier: automated
    workflow: organon-tools-developer
    tools: [organon-verify, npm-test]
    complexity: high
  - id: PROTO-ORG-3
    name: Methodology Evolution
    steps: 12
    automation_tier: automated
    workflow: methodology-spec-evolution
    tools: [organon-verify, organon-find, organon-health]
    complexity: high
  - id: PROTO-ORG-4
    name: Verification and Health
    steps: 5
    automation_tier: automated
    workflow: verify-and-health
    tools: [organon-verify, organon-health]
    complexity: low
  - id: PROTO-ORG-5
    name: Session Compounding
    steps: 8
    automation_tier: automated
    workflow: session-compounding
    tools: [organon-verify, organon-health, organon-find]
    complexity: medium
  - id: PROTO-ORG-6
    name: Organon File Creation
    steps: 8
    automation_tier: automated
    workflow: organon-file-creation
    tools: [organon-generate, organon-validate, organon-verify]
    complexity: medium
  - id: PROTO-ORG-7
    name: Quality Review
    steps: 10
    automation_tier: automated
    workflow: quality-review
    tools: [organon-verify, organon-validate, organon-health]
    complexity: high
inherits_from: [organon-project]
audience: [llm, human, tooling]
related_files:
  - ../ETHOS.md
  - ../../CLAUDE.md
  - ../../book-llms/three-layer-architecture.md
  - ../../book-llms/workflow-authoring.md
---

# Organon Development Protocols

> Step-by-step procedures for all development activities in the Organon methodology repository. Each protocol has a corresponding workflow binding.

---

## Enforcement Loop Coverage

```
DEFINE:    PROTO-ORG-1  RFC-Driven Design .............. domain-feature-design
BIND:      PROTO-ORG-6  Organon File Creation .......... organon-file-creation
EXECUTE:   PROTO-ORG-2  Tool Development ............... organon-tools-developer
VERIFY:    PROTO-ORG-4  Verification and Health ........ verify-and-health
           PROTO-ORG-7  Quality Review ................. quality-review
COMPOUND:  PROTO-ORG-5  Session Compounding ............ session-compounding
EVOLVE:    PROTO-ORG-3  Methodology Evolution .......... methodology-spec-evolution
```

---

## PROTO-ORG-1: RFC-Driven Design

> Design new domains and features using RFC-Driven Evolution — ensures organon defines "should be" before code implements "what is."

### Goal

Produce a complete RFC with both organon mutation plan and technical implementation plan, ready for review and implementation.

### Preconditions

- [ ] Problem is understood and scope is classified (domain vs feature vs component)
- [ ] Parent scope ETHOS.md exists and has been read
- [ ] `book-llms/patterns.md` (RFC-Driven Evolution) has been loaded
- [ ] `book-llms/templates.md` (RFC Template) has been loaded

### Steps

1. **Load context.** Read `book-llms/patterns.md`, `book-llms/templates.md`, `book-llms/scopes.md`, parent ETHOS.md, `book-llms/frontmatter-system.md`.

2. **Classify scope.** Determine if this is a domain (bounded context), feature (cross-cutting capability), or component (code module).

3. **Answer design questions.** Why does the organon need to evolve? What will the organon define? How will code implement it?

4. **Create RFC file.** Determine next RFC number, create `rfcs/NNN-<feature-name>.md`.

5. **Copy RFC template.** Load from `book-llms/templates.md` → RFC Template section.

6. **Fill frontmatter.** Set type, scope, name, version, summary, token_estimate, status, created, author, related_files.

7. **Write ETHOS.md content.** Write exact identity statements, invariants (with enforcement mechanisms), prioritized principles, and decision heuristics.

8. **Write PHILOSOPHY.md content.** Write problem statement, the bet, trade-offs (minimum 5), alternatives considered, success criteria.

9. **Write update section.** List specific organon files that will be updated with exact changes.

10. **Write architecture.** Package structure, core abstractions (TypeScript interfaces), invariant-to-implementation mapping.

11. **Write API design.** Function signatures, interfaces, design rationale.

12. **Write implementation plan.** Week-by-week for Phase 1, clear deliverables per phase.

13. **Write design decisions.** Minimum 5 technical decisions, each linked to a domain principle.

14. **Complete supporting sections.** Success metrics, risks & mitigations, open questions, dependencies.

15. **Self-review.** Run quality checklist: both organon and technical plans are detailed, invariants are testable, principles are prioritized.

### Verification

- [ ] RFC has both organon mutation plan AND technical implementation plan
- [ ] ETHOS.md content has ≥3 identity IS/IS NOT statements, ≥3 invariants with enforcement, ≥3 prioritized principles, ≥5 heuristics
- [ ] PHILOSOPHY.md content has problem, bet, ≥5 trade-offs, ≥3 alternatives, measurable success criteria
- [ ] Technical plan has architecture, API, phased implementation, ≥5 design decisions
- [ ] `organon validate` passes on the RFC file

### Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Can't classify scope | Re-read `book-llms/scopes.md`, ask: does it have ≥3 unique concepts? |
| Invariants are too vague | Apply "testable?" filter — if you can't write a verification gate, it's too vague |
| Missing technical plan | Stop and add architecture, API, implementation phases before proceeding |
| RFC too large | Split into multiple RFCs with dependency chain |

---

## PROTO-ORG-2: Tool Development

> Develop organon-tools CLI commands, verification gates, and MCP tools following the tool's own ETHOS.md constraints.

### Goal

Ship a tested, documented CLI command or verification gate that follows all 6 organon-tools invariants.

### Preconditions

- [ ] `organon/domains/tools/ETHOS.md` has been read (6 invariants, 5 principles)
- [ ] `organon/domains/tools/PHILOSOPHY.md` has been read (design decisions)
- [ ] If adding a gate: `book-llms/three-layer-architecture.md` verification section loaded

### Steps

1. **Load context.** Read `organon/domains/tools/ETHOS.md`, `organon/domains/tools/PHILOSOPHY.md`, and if relevant, `book-llms/three-layer-architecture.md`.

2. **Design.** Answer: What does it do? Is it idempotent? Does it support `--format json`? What exit codes? Does it compose?

3. **Update spec first.** If adding a gate or changing methodology: update `book-llms/` specification before implementation.

4. **Write tests.** Create `src/core/<feature>.test.ts` with test cases covering success, failure, and edge cases.

5. **Implement core logic.** Create `src/core/<feature>.ts` as pure function (no I/O, no console, no process.exit). Return structured results.

6. **Create CLI wrapper.** Create `src/cli/commands/<command>.ts` as thin wrapper: parse args → call core → format output.

7. **Register command.** Add to `src/cli/index.ts` command registry.

8. **Verify invariants.** Check: schema fidelity, tests exist, gates fail not warn, `--format json` works, idempotent, no breaking changes without version bump.

9. **Run test suite.** `npm test`, `npm run build`, `npm run organon verify`, coverage check (>90% core, 100% gates).

10. **Update documentation.** Update README.md with usage example, update CHANGELOG if applicable.

### Verification

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Coverage >90% for core, 100% for gates
- [ ] Command supports `--format json`
- [ ] Command is idempotent
- [ ] `organon verify` passes

### Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Tests fail | Fix implementation, do not skip tests |
| Coverage below threshold | Add missing test cases for uncovered branches |
| TypeScript errors | Fix type issues, do not use `any` or `@ts-ignore` |
| Gate warns instead of fails | Change to pass/fail exit codes, never soft warnings |

---

## PROTO-ORG-3: Methodology Evolution

> Evolve `book-llms/` methodology specification files with cross-file consistency.

### Goal

Update methodology specification while maintaining consistency across all related files and avoiding stale terminology.

### Preconditions

- [ ] `book-llms/ETHOS.md` loaded (meta-organon constraints)
- [ ] `book-llms/PHILOSOPHY.md` loaded (meta-organon reasoning)
- [ ] `book-llms/overview.md` loaded (methodology overview)
- [ ] `CLAUDE.md` loaded (project constraints)
- [ ] Change scope is understood (which files are affected)

### Steps

1. **Load context.** Read `book-llms/ETHOS.md`, `book-llms/PHILOSOPHY.md`, `book-llms/overview.md`, `CLAUDE.md`.

2. **Assess impact.** Run `organon find` to trace references to the concept being changed. Identify all files that reference the affected terminology or concept.

3. **Check backward compatibility.** Will this change break existing organon implementations? If yes, requires RFC and major version bump.

4. **Make primary change.** Edit the target file in `book-llms/`.

5. **Propagate to scopes.md.** If scope definitions changed, update `book-llms/scopes.md` (known to lag behind).

6. **Propagate to templates.md.** If structure templates changed, update `book-llms/templates.md`.

7. **Propagate to frontmatter-system.md.** If frontmatter schema changed, update `book-llms/frontmatter-system.md`.

8. **Propagate to patterns.md.** If patterns or anti-patterns changed, update `book-llms/patterns.md`.

9. **Propagate to CLAUDE.md.** If project-level guidance changed, update `CLAUDE.md`.

10. **Bump versions.** Update `version` in frontmatter of ALL modified files, not just the primary target.

11. **Grep for stale terminology.** Search ALL files (including CLAUDE.md, README.md) for old terminology that should have been updated.

12. **Run full verification.** `organon verify` (all gates), `organon health`.

### Verification

- [ ] All modified files have bumped version numbers
- [ ] `organon verify` passes all gates
- [ ] `organon health` score has not decreased
- [ ] No stale terminology found in grep sweep
- [ ] scopes.md is in sync with core concept changes

### Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Stale terminology found after commit | Run full grep sweep again, update all instances |
| scopes.md out of sync | Re-read scopes.md, update to match current concepts |
| Version not bumped in a file | Check all files touched in this change, bump any missed |
| Backward compatibility broken | Create RFC for the breaking change, bump major version |
| `organon verify` fails | Fix reported issues before committing |

---

## PROTO-ORG-4: Verification and Health

> Run all verification gates and health checks, interpret results, guide fixes, and re-verify.

### Goal

Confirm project integrity. Surface all issues with actionable fix guidance.

### Preconditions

- [ ] Working directory is the organon repository root
- [ ] `organon-tools` is built and available (`npm run build` in packages/tools/)

### Steps

1. **Run verification.** Execute `organon verify` (all 5 gates: frontmatter, references, triplets, coverage, workflow-quality).

2. **Run health check.** Execute `organon health` for overall project health score.

3. **Interpret failures.** Map each failure to a fix action using the decision table:

   | Gate | Common Failure | Fix |
   |------|---------------|-----|
   | frontmatter | Missing or invalid fields | Add required fields per `frontmatter-system.md` |
   | references | Broken file path | Update path or create missing file |
   | triplets | Orphaned workflow or phantom automation | Add missing protocol↔workflow reference |
   | coverage | Invariant without test | Create tier-4 test for the invariant |
   | workflow-quality | Missing protocol_id, tools, context, or error recovery | Add missing fields to workflow frontmatter/body |

4. **Guide fixes.** For each failure, provide the specific file, field, and value to add or change.

5. **Re-verify.** After fixes, run `organon verify` again to confirm all gates pass.

### Verification

- [ ] All 5 gates pass
- [ ] Health score is reported
- [ ] No regressions from previous health score

### Recovery

| Failure | Recovery Action |
|---------|-----------------|
| `organon verify` command not found | Build organon-tools: `cd packages/tools && npm run build` |
| Gate failure not in decision table | Read gate source code to understand the check, add new entry to table |
| Fix introduces new failure | Re-run full verification, fix cascading issues |

---

## PROTO-ORG-5: Session Compounding

> Review a work session's output, detect improvable patterns, and execute the highest-priority improvement.

### Goal

Capture session learnings and convert at least one into a durable improvement (tool candidate, protocol update, heuristic addition, or workflow refinement).

### Preconditions

- [ ] A significant work session has just completed (meaningful changes made)
- [ ] `CLAUDE.md` loaded
- [ ] `book-llms/patterns.md` loaded (Recursive Collaboration section)

### Steps

1. **Review session work.** Examine `git diff` of the session's changes. Identify what was done, what patterns emerged.

2. **Detect patterns.** Look for: repeated manual steps, unclear workflows, new heuristics discovered during work, terminology inconsistencies.

3. **Classify improvements.** Categorize each finding:
   - **Tool candidate** — repeated operation that could be automated
   - **Protocol update** — procedure that was followed but isn't documented
   - **Heuristic addition** — decision that was made repeatedly
   - **Workflow refinement** — existing workflow that was awkward or incomplete

4. **Prioritize.** Rank by frequency × impact. Most frequent + highest impact = do first.

5. **Generate improvement plan.** For the top improvement, draft the specific change needed.

6. **Execute improvement.** With user confirmation, implement the highest-priority improvement.

7. **Grep for stale terminology.** Search ALL files for old terminology that should have been updated during the session.

8. **Run verification.** `organon verify` and `organon health` to confirm the improvement didn't break anything.

### Verification

- [ ] At least one improvement identified
- [ ] Highest-priority improvement either executed or documented for future action
- [ ] `organon verify` passes after any changes
- [ ] No stale terminology found

### Recovery

| Failure | Recovery Action |
|---------|-----------------|
| No patterns detected | Session may have been too small; note for next session |
| Improvement breaks verification | Revert improvement, re-analyze the approach |
| User declines execution | Document the improvement in a TODO or RFC for future action |

---

## PROTO-ORG-6: Organon File Creation

> Create a new organon file (ETHOS.md, PHILOSOPHY.md, PROTOCOL.md, or README.md) with correct structure, frontmatter, and inheritance.

### Goal

Produce a valid organon file in the correct location with proper frontmatter, section structure, and parent scope references.

### Preconditions

- [ ] Target scope is known (product, domain, feature, component)
- [ ] Parent scope ETHOS.md exists (if not product-level)
- [ ] `book-llms/scopes.md` loaded (scope classification)
- [ ] `book-llms/templates.md` loaded (file templates)

### Steps

1. **Classify scope.** Load `book-llms/scopes.md`. Determine if target is product, domain, feature, or component scope.

2. **Check parent scope.** Load the parent scope's ETHOS.md. New file must inherit, never contradict parent constraints.

3. **Select template.** Load `book-llms/templates.md`. Choose the correct template for the artifact type (ethos, philosophy, protocol, or README router).

4. **Determine file placement.** Place under the correct directory following Pattern A (dedicated `organon/` directory).

5. **Generate frontmatter.** Fill in all required fields: type, scope, name, version, summary, token_estimate. Use `organon generate` if available.

6. **Write content.** Follow the template's section structure exactly. Include identity, invariants, principles, heuristics (for ethos); problem, bet, trade-offs (for philosophy); goal, preconditions, steps, verification, recovery (for protocol).

7. **Validate.** Run `organon validate` with all 4 stages (schema, content, references, relationships).

8. **Check bidirectional references.** If this file references other organon files, ensure those files reference back. Run `organon verify --gate triplets` if this is a protocol with workflows.

### Verification

- [ ] `organon validate` passes all 4 stages
- [ ] File is in the correct directory per scope classification
- [ ] Frontmatter has all required fields
- [ ] Section headings match the template for this artifact type
- [ ] Parent scope constraints are inherited, not contradicted

### Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Wrong scope classification | Re-read `scopes.md`, apply the decision heuristic (≥3 concepts → domain, cross-cutting → feature) |
| `organon validate` fails | Read error messages, fix each reported issue, re-validate |
| Parent scope contradiction | Remove or weaken the contradicting constraint; add constraints only |
| Missing template section | Re-read template, add missing section |

---

## PROTO-ORG-7: Quality Review

> Semantic review of organon files that goes beyond automated gates to check meaning, testability, and completeness.

### Goal

Identify quality issues that automated gates cannot detect: vague invariants, misordered principles, missing heuristics, inconsistent terminology.

### Preconditions

- [ ] Review scope selected (specific file, directory, or project-wide)
- [ ] `book-llms/ETHOS.md` loaded (quality standards)
- [ ] `book-llms/patterns.md` loaded (anti-patterns to check against)
- [ ] `book-llms/workflow-authoring.md` loaded (workflow quality attributes)

### Steps

1. **Select review scope.** Choose what to review: a single file, a directory, or the entire project.

2. **Run automated gates first.** Execute `organon verify` and `organon validate` on the scope. Fix any automated failures before proceeding to semantic review.

3. **Review invariants.** For each invariant, ask:
   - Is this testable? Can you write a verification gate for it?
   - Is the enforcement mechanism specific and real?
   - Is this a genuine constraint, or a vague aspiration?

4. **Review principle ordering.** For each principle list, ask:
   - If principle 3 conflicts with principle 1, does 1 genuinely win?
   - Are the principles actually prioritized, or just listed?

5. **Review identity statements.** For each IS/IS NOT section, ask:
   - Are the IS statements specific enough to distinguish this from similar things?
   - Are the IS NOT statements defining real boundaries, not obvious negations?

6. **Review heuristics.** For each decision heuristic table, ask:
   - Do these cover the decisions that actually recur?
   - Are there common decisions missing from the table?
   - Are the actions specific enough to follow?

7. **Check cross-file terminology.** Grep for key terms across all organon files. Flag inconsistent usage (e.g., "skill" vs "workflow" for the generic term).

8. **Check anti-patterns.** Compare content against `book-llms/ETHOS.md` and `book-llms/patterns.md` anti-pattern tables. Flag any matches.

9. **Generate review report.** List findings by severity (error, warning, suggestion) with specific file:line references and fix recommendations.

10. **Track improvements.** If fixes are made during the review, re-run automated gates to confirm no regressions.

### Verification

- [ ] All automated gates pass (prerequisite for semantic review)
- [ ] Every invariant passes the "testable?" filter
- [ ] Principle ordering is defensible (1 genuinely beats 2 in conflicts)
- [ ] No anti-pattern matches found
- [ ] Terminology is consistent across all files reviewed

### Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Invariant is untestable | Rewrite to be more specific, or move to principles (aspirational, not invariant) |
| Principles not truly prioritized | Reorder with explicit trade-off reasoning |
| Identity too generic | Add specifics: names, technologies, scope boundaries |
| Anti-pattern found | Apply the fix from the anti-pattern table |
| Terminology inconsistent | Choose canonical term, grep-and-replace across all files |
