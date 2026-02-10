---
type: rationale
scope: meta
name: invariant-tracking
version: "1.0"
summary: Invariant-to-test tracking specification — how to declare invariant IDs and verify test coverage
token_estimate: 2200
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

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| IDs in frontmatter (not inline) | Prose stays clean, machine-readable registry | Invariant text and ID are in different locations |
| Never-reuse policy | Stable references across time | Gaps in numbering after removals |
| judgment_call flag | Acknowledges not everything is automatable | Requires honest assessment of what can be tested |
| Language-agnostic regex | Works across any tech stack | Less precise than language-specific tooling |

---

## Related Files

| File | Relationship |
|------|-------------|
| [overview.md](./overview.md) | High-level methodology overview |
| [ETHOS.md](./ETHOS.md) | Source of truth for meta-organon invariants (first file to get IDs) |
| [frontmatter-system.md](./frontmatter-system.md) | Schema definition for the `invariants` field |
| [three-layer-architecture.md](./three-layer-architecture.md) | Verification gates that consume coverage data |
| [templates.md](./templates.md) | Ethos template includes `invariants` field |
