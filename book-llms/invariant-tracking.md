---
type: rationale
scope: meta
name: invariant-tracking
version: "1.1"
summary: Invariant-to-test tracking specification — how to declare invariant IDs and verify test coverage
token_estimate: 3000
inherits_from: [meta-organon]
load_priority: high
required_for:
  - methodology_enforcement
  - organon_creation
audience: [llm, human, tooling]
---

# Invariant Tracking

> How to declare stable invariant IDs in ETHOS.md frontmatter and verify that tests cover each invariant.

---

## The Problem

The enforcement loop promises "100% invariant coverage" but has no mechanism to track which invariants have tests. Without tracking:
- New invariants are added without corresponding tests
- Test coverage of constraints is invisible to CI
- The `@organon-invariant` annotation is mentioned in docs but never specified

---

## The Solution

Three interlocking mechanisms:

1. **Invariant IDs** — declared in ETHOS.md frontmatter, providing stable references
2. **Test annotations** — `@organon-invariant` comments in test files linking tests to invariant IDs
3. **Coverage report** — automated analysis that joins invariant declarations with test annotations

---

## Invariant ID Scheme

IDs are declared in ETHOS.md frontmatter via the `invariants` array:

```yaml
invariants:
  - id: INV-META-1
    name: ethos-required
  - id: INV-META-2
    name: identity-first
    judgment_call: true    # requires human review, not automated testing
```

### Format

`INV-{SCOPE}-{N}` where:
- `SCOPE` matches the frontmatter `name` (uppercased, truncated for readability)
- `N` is a stable sequential number

### Rules

- IDs are **never reused** — if invariant 3 is removed, INV-META-3 is retired, not reassigned
- The `name` field is a short kebab-case label for human readability
- The `judgment_call` field (default false) marks invariants that require human review rather than automated testing

---

## Annotation Contract

Tests reference invariant IDs via a discoverable annotation pattern. The contract is language-agnostic:

```typescript
// TypeScript/JavaScript
// @organon-invariant INV-META-1
test('ethos is required', () => { ... });
```

```python
# Python
# @organon-invariant INV-META-1
def test_ethos_required():
```

```scala
// Scala 3
// @organon-invariant INV-META-1
testInvariant("INV-META-1", "ethos is required"):
  Assertions.assertFileExists(FileExistsOptions(files = Seq("organon/ETHOS.md")))
```

```rust
// Rust
// @organon-invariant INV-META-1
#[test]
fn test_ethos_required() {
```

### Pattern

The string `@organon-invariant {ID}` must appear in a comment within the test file. Multiple IDs can appear on the same line (space-separated) or on separate lines.

Default regex: `@organon-invariant\s+(INV-[\w-]+(?:\s+INV-[\w-]+)*)`

---

## Coverage Report Schema

Output of `organon coverage`:

```json
{
  "invariants": [
    { "id": "INV-META-1", "name": "ethos-required", "file": "book-llms/ETHOS.md",
      "status": "covered", "tests": ["src/core/verify.test.ts:14"] },
    { "id": "INV-META-2", "name": "identity-first", "file": "book-llms/ETHOS.md",
      "status": "judgment_call", "tests": [] },
    { "id": "INV-META-6", "name": "every-file-has-frontmatter", "file": "book-llms/ETHOS.md",
      "status": "uncovered", "tests": [] }
  ],
  "summary": { "total": 10, "covered": 7, "uncovered": 1, "judgment_call": 2 }
}
```

### Statuses

| Status | Meaning |
|--------|---------|
| `covered` | At least one test has `@organon-invariant` annotation for this ID |
| `uncovered` | No tests reference this ID, and it is not a judgment call |
| `judgment_call` | Marked as requiring human review — excluded from automated coverage checks |

---

## Relationship to Verification Gates

The coverage report feeds into the existing verify gate system. The `invariant-coverage` gate checks:

- Every non-judgment-call invariant has at least one annotated test
- Gate **passes** when `summary.uncovered === 0`
- Gate **fails** when any non-judgment invariant has zero annotated tests

### CLI Usage

```bash
# Coverage report
organon coverage
organon coverage --json

# As part of verify
organon verify --gate invariant-coverage
organon verify   # runs all gates including invariant-coverage
```

---

## Frontmatter Schema

The `invariants` array is a type-specific field for ETHOS.md (`type: constraints`):

```yaml
invariants:                      # Stable invariant registry
  - id: string                   # Stable ID: INV-{SCOPE}-{N} (never reused)
    name: string                 # Short kebab-case label
    judgment_call: boolean       # true = requires human review (default: false)
```

### Validation Rules

- `invariants` array length must match `invariants_count`
- Each `id` must follow `INV-{SCOPE}-{N}` format (regex: `/^INV-[\w]+-\d+$/`)
- No duplicate IDs within the array

---

## Human Review of Judgment-Call Invariants

Invariants marked with `judgment_call: true` require human review rather than automated testing. These invariants represent constraints that cannot be mechanically verified (e.g., "identity boundaries are specific and testable," "LLMs are the primary interface").

### Review Mechanisms

**During Development** (Pre-merge):
- **PR Review:** Reviewer explicitly confirms judgment-call invariants hold for the change
- **Design Doc Annotation:** RFCs that introduce or modify judgment-call invariants must document how compliance will be maintained

**During Audit** (Post-merge):
- **Manual Checklist:** Periodic audits (quarterly, release milestones) verify judgment-call invariants across the codebase
- **Issue Annotation:** When judgment-call invariants are violated, issues are tagged with `organon-invariant: INV-{SCOPE}-{N}` for tracking

### Tracking Judgment-Call Review

Judgment-call invariants are **excluded from automated coverage checks** (no `@organon-invariant` annotations required in test files). Instead, track review via:

1. **PR reviews:** Reviewer confirms "Judgment-call invariants reviewed" as part of PR checklist
2. **Audit log:** Quarterly audit creates an issue documenting all judgment-call invariants and their current compliance status
3. **Optional annotation:** For critical judgment calls, add `@organon-invariant-reviewed YYYY-MM-DD` in design docs or architecture decision records

### Verification Gate

The `judgment-calls` verification gate (V2 planned) will check:
- All invariants with `judgment_call: true` have corresponding audit issue or design doc annotation within the last 90 days
- Warnings (not errors) when judgment-call invariants lack recent review

**V1 Status:** Judgment-call review is manual process. No automated gate yet.

---

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| IDs in frontmatter (not inline) | Prose stays clean, machine-readable registry | Invariant text and ID are in different locations |
| Never-reuse policy | Stable references across time | Gaps in numbering after removals |
| judgment_call flag | Acknowledges not everything is automatable | Requires honest assessment of what can be tested |
| Language-agnostic regex | Works across any tech stack | Less precise than language-specific tooling |

---

## Reference Implementation

Two language-specific implementations of tier-4 testing are available:

**TypeScript** (`@organon-methodology/testing`):
- **Source:** `packages/testing/` | **RFC:** [001-testing-framework](../rfcs/001-testing-framework.md)
- Vitest adapter, 7 assertions, 204 tests

**Scala 3** (`io.github.vledicfranco:organon-testing_3`):
- **Source:** `packages/testing-scala/` | **RFC:** [008-scala-testing-library](../rfcs/008-scala-testing-library.md)
- MUnit adapter, 6 assertions, 66 tests

Both implementations provide:
- **`testInvariant(id, description, fn)`** — wrapper that links test execution to invariant IDs
- **Pre-built assertions** — `assertMaxValue()`, `assertNoSideEffects()`, `assertFileExists()`, etc.
- **I/O separation** — pure assertion logic (no file system imports), resolver layer handles file reading
- **Coverage tracking** — registry maps tested invariant IDs to test results

**Domain organon:** `organon/domains/testing/`

Future language implementations (Python, Rust) should follow the same pattern: language-specific assertion libraries that use the universal `@organon-invariant` annotation contract defined above.

---

## Related Files

| File | Relationship |
|------|-------------|
| [overview.md](./overview.md) | High-level methodology overview |
| [ETHOS.md](./ETHOS.md) | Source of truth for meta-organon invariants (first file to get IDs) |
| [frontmatter-system.md](./frontmatter-system.md) | Schema definition for the `invariants` field |
| [three-layer-architecture.md](./three-layer-architecture.md) | Verification gates that consume coverage data |
| [templates.md](./templates.md) | Ethos template includes `invariants` field |
