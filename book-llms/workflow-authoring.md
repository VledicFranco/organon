---
type: rationale
scope: meta
name: workflow-authoring
version: "1.0"
summary: Workflow authoring guidance — quality attributes, archetypes, error handling patterns, and anti-patterns for Layer 2 bindings
token_estimate: 3330
inherits_from: [meta-organon]
load_priority: high
required_for:
  - workflow_creation
  - workflow_review
  - methodology_enforcement
audience: [llm, human, tooling]
---

# Workflow Authoring

> What makes a good workflow? Quality attributes, common archetypes, error handling patterns, and anti-patterns for Layer 2 bindings.

---

## The Problem

The universal contract in [three-layer-architecture.md](./three-layer-architecture.md) defines five required properties for workflows (reference protocol, specify tools, provide context, handle errors, be discoverable). The [templates.md](./templates.md) provides a copy-paste scaffold. But neither answers:

- What separates a good workflow from a bad one?
- What shapes do workflows commonly take?
- How should error handling actually work in practice?
- What mistakes do authors make repeatedly?

---

## Quality Attributes

Six measurable properties of a well-written workflow. The first four are validated by the `workflow-quality` verification gate.

| Attribute | Definition | Automated? |
|-----------|-----------|------------|
| **Completeness** | Every protocol step has a corresponding workflow step or explicit skip-with-rationale | Yes — compare step counts |
| **Traceability** | `protocol_id` and `protocol_file` reference a real protocol that references back | Yes — triplets gate |
| **Context sufficiency** | `context` array lists all organon files the agent must load before execution | Yes — check paths resolve |
| **Error recoverability** | Workflow includes an error recovery section with failure/recovery table | Yes — section scan |
| **Idempotency awareness** | Each tool invocation is annotated as idempotent or not; non-idempotent steps include rollback guidance | No — guidance only |
| **Scope alignment** | Workflow scope matches its protocol scope | No — guidance only |

### How to apply

When writing a workflow, check each attribute:

1. Count your steps against the protocol. Missing steps? Add them or document why they're skipped.
2. Verify `protocol_id` and `protocol_file` are set. Run `organon verify --gate triplets` to confirm bidirectional binding.
3. List every organon file the agent needs in the `context` array. If you're unsure, err on the side of including more — context overload is a warning, missing context causes silent failures.
4. Add `## Error Recovery` with a failure/recovery table. Every tool invocation that can fail needs a recovery path.
5. For each step, ask: "Can I run this twice safely?" If not, note it and add rollback guidance.
6. Confirm your workflow operates within its protocol's scope. A methodology workflow shouldn't directly modify product code.

---

## Workflow Archetypes

Five common shapes. Each has a distinct step skeleton and error handling pattern.

### 1. Verification Workflow

**Purpose:** Check that invariants or constraints hold.

**Characteristics:** Idempotent, safe to re-run, no side effects, produces pass/fail result.

**Step skeleton:**
1. Load context (relevant ETHOS.md files)
2. Execute checks (run verification tools in sequence)
3. Aggregate results (collect pass/fail per check)
4. Report (surface results with fix suggestions)

**Error pattern:** Accumulate-and-report. Run all checks even if early ones fail.

**Examples:** `organon verify`, `organon validate`, `organon coverage`

### 2. Generation Workflow

**Purpose:** Create or update derived artifacts.

**Characteristics:** Idempotent output (re-generation produces same result), modifies files.

**Step skeleton:**
1. Load context (domain ETHOS.md, templates)
2. Discover sources (find input files)
3. Generate (run generation tool)
4. Verify (validate generated output)
5. Commit (stage and commit if verification passes)

**Error pattern:** Fail-fast gate. If generation fails, leave originals intact. If verification of output fails, report drift but don't commit.

**Examples:** `organon generate`, frontmatter auto-generation

### 3. Implementation Workflow

**Purpose:** Execute a multi-phase development protocol.

**Characteristics:** Non-idempotent phases, requires human judgment at decision points, longest workflows.

**Step skeleton:**
1. Load context (product organons, domain organons, protocol-specific context)
2. Execute phases in order (phase 0 through N)
3. Run inter-phase verification (catch issues between phases)
4. Run completion gate (full verification suite at the end)

**Error pattern:** Checkpoint-and-resume. Save progress after each phase. On failure, resume from the last successful phase rather than restarting.

**Examples:** RFC implementation, new domain setup

### 4. Migration Workflow

**Purpose:** Transform existing artifacts to a new format or structure.

**Characteristics:** Batch operations, partial success acceptable, progress tracking.

**Step skeleton:**
1. Discover targets (find all files matching migration criteria)
2. Transform each (apply transformation with per-file error capture)
3. Verify transformations (run validation on transformed files)
4. Report coverage (summary: transformed, skipped, failed)

**Error pattern:** Accumulate-and-report. Never abort the batch on a single-file failure. Track per-file results and report coverage at the end.

**Examples:** Adding frontmatter to all files, upgrading methodology version

### 5. Diagnostic Workflow

**Purpose:** Analyze health and surface recommendations.

**Characteristics:** Read-only, advisory output, no modifications.

**Step skeleton:**
1. Collect data (scan files, compute metrics)
2. Analyze (derive scores, identify outliers)
3. Recommend (generate actionable suggestions)
4. Report (formatted output with severity levels)

**Error pattern:** Missing data produces warnings, not errors. Partial results are acceptable.

**Examples:** `organon health`, `organon suggest-tools`

---

## Error Handling Patterns

Three patterns for how workflows should handle failures. Choose based on step dependencies.

### Pattern A: Fail-Fast Gate

**When to use:** A step fails and remaining steps are meaningless without it.

**Behavior:** Stop execution immediately. Report what failed and why. Suggest a fix.

**Example:** Frontmatter validation fails before generation — there's nothing to generate from.

```
## Steps
1. Validate frontmatter → if fails, STOP and report errors
2. Generate output (only runs if step 1 passes)
3. Verify output
```

### Pattern B: Accumulate-and-Report

**When to use:** Multiple independent checks or operations that should all run regardless of individual failures.

**Behavior:** Run all steps. Collect all errors. Report aggregated result at the end.

**Example:** Verifying 10 files — don't stop at the first failure, check all 10.

```
## Steps
1. For each file:
   a. Run validation (record pass/fail)
   b. Continue regardless
2. Report: "7/10 passed, 3 failed" with details
```

### Pattern C: Checkpoint-and-Resume

**When to use:** Multi-phase workflows where phases are expensive and somewhat independent.

**Behavior:** Save progress after each phase. On failure, allow resumption from the last successful phase.

**Example:** RFC implementation across 5 phases — don't redo phases 1-3 when phase 4 fails.

```
## Steps
1. Phase 1: scaffolding → checkpoint
2. Phase 2: implementation → checkpoint
3. Phase 3: testing → checkpoint
4. Phase 4: documentation → if fails, resume here
5. Phase 5: review
```

---

## Anti-Patterns

Workflow-specific anti-patterns. These complement the general anti-patterns in [ETHOS.md](./ETHOS.md) and [patterns.md](./patterns.md).

| Anti-Pattern | Description | Fix |
|--------------|-------------|-----|
| **Context overload** | Workflow loads all organon files instead of the relevant subset | Use `context` array to list only required files; use frontmatter filtering |
| **Silent failure** | Tool invocation fails but workflow continues without reporting | Every tool invocation must check its result; use fail-fast or accumulate-and-report |
| **Missing error recovery** | No `## Error Recovery` section; agent improvises when things go wrong | Add error recovery table with failure modes and recovery actions |
| **Protocol drift** | Workflow steps diverge from protocol steps without updating the protocol | Re-sync workflow to protocol or update protocol to reflect evolved understanding |
| **Tool-free workflow** | Workflow describes steps in prose but references no tools | Every step should reference a specific tool; if no tool exists, the protocol should be `manual` tier |
| **Monolithic workflow** | Single workflow covers multiple protocols | One workflow per protocol; compose via workflow chaining if needed |
| **Implicit context** | Workflow assumes agent "knows" things not in the `context` array | Make all required context explicit in `context` |
| **Orphaned verification** | Workflow runs verification but does not act on the result | Verification results must gate the next step or be surfaced to the user |

---

## Programmatic Validation

The `workflow-quality` verification gate checks the automatable quality attributes. Run via:

```bash
organon verify --gate workflow-quality
organon verify   # runs all gates including workflow-quality
```

### Checks performed

| Check | Severity | Diagnostic Code |
|-------|----------|-----------------|
| `protocol_id` present and non-empty | error | `WORKFLOW_MISSING_PROTOCOL_ID` |
| `protocol_file` present and non-empty | error | `WORKFLOW_MISSING_PROTOCOL_FILE` |
| `tools` array present and non-empty | error | `WORKFLOW_MISSING_TOOLS` |
| `context` array present and non-empty | error | `WORKFLOW_MISSING_CONTEXT` |
| Each path in `context` resolves to a file | error | `WORKFLOW_BROKEN_CONTEXT_REF` |
| Body contains `## Error Recovery` or `## Recovery` | warning | `WORKFLOW_NO_ERROR_RECOVERY` |
| Recovery section contains a failure/recovery table | warning | `WORKFLOW_RECOVERY_NO_TABLE` |
| Workflow step count >= protocol step count | warning | `WORKFLOW_STEP_COUNT_LOW` |
| `context` array has <= 10 entries | warning | `WORKFLOW_CONTEXT_OVERLOAD` |
| Each tool in `tools` is referenced in body | warning | `WORKFLOW_UNREFERENCED_TOOL` |

Errors block the gate. Warnings are advisory.

---

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| Six quality attributes | Concrete, measurable standard | Some attributes (idempotency, scope) can't be automated |
| Five archetypes | Covers most real workflows | Novel workflow shapes may not fit neatly |
| Three error patterns | Clear guidance for common scenarios | Real workflows may need hybrid patterns |
| Separate gate from triplets | Single responsibility (structure vs quality) | One more gate to run |

---

## Related Files

| File | Relationship |
|------|-------------|
| [three-layer-architecture.md](./three-layer-architecture.md) | Universal contract that this document extends with quality guidance |
| [templates.md](./templates.md) | Workflow template scaffold |
| [ETHOS.md](./ETHOS.md) | General anti-patterns table |
| [patterns.md](./patterns.md) | Broader pattern catalog |
| [invariant-tracking.md](./invariant-tracking.md) | Verification gate pattern this follows |
