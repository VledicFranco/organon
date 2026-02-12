---
type: constraints
scope: domain
name: tools
version: "1.0"
summary: Behavioral constraints for developing the Organon CLI tooling — verification gates, frontmatter generation, and invariant tracking
token_estimate: 1561
invariants_count: 6
principles_count: 5
heuristics_count: 8
invariants:
  - id: INV-TOOLS-1
    name: schema-fidelity
  - id: INV-TOOLS-2
    name: every-command-has-tests
  - id: INV-TOOLS-3
    name: gates-fail-not-warn
  - id: INV-TOOLS-4
    name: machine-parsable-output
  - id: INV-TOOLS-5
    name: idempotent-operations
  - id: INV-TOOLS-6
    name: breaking-changes-major-version
inherits_from: [organon-self-governance]
load_priority: high
required_for:
  - tool_development
  - verification_implementation
  - frontmatter_tooling
audience: [llm, human]
---

# Organon Tools Ethos

> Behavioral constraints for agents developing the Organon CLI tooling.

---

## Identity

### What Organon Tools IS

- A TypeScript/Node.js CLI for enforcing Organon methodology
- Command-based architecture using yargs (generate, validate, verify, coverage, find, query, health)
- Implementation of verification gates from three-layer-architecture.md
- Frontmatter generator and validator matching book-llms/ schema exactly
- Invariant-to-test coverage tracker with `@organon-invariant` annotation parsing
- A universal tool (works with any project using Organon, any language)

### What Organon Tools IS NOT

- Not the Organon specification (that's book-llms/ — this implements it)
- Not a library or framework to import into applications
- Not language-specific (CLI is universal, works with any codebase)
- Not a documentation generator (validates/generates metadata, not prose)
- Not a runtime service (command-line tool only)

---

## Invariants

1. **Schema fidelity.** The frontmatter parser and validator must match book-llms/frontmatter-system.md schema exactly. Any deviation breaks compatibility with the methodology spec.

2. **Every command has tests.** All CLI commands and core utilities must have comprehensive test coverage. Untested code creates enforcement gaps.

3. **Gates fail builds, not warn.** Verification gates produce pass/fail results. Warnings are invitations to ignore — failures are constraints.

4. **Machine-parsable output.** All commands support `--format json` for programmatic consumption. CI/CD pipelines rely on structured output.

5. **Idempotent operations.** Re-running generate/validate/verify commands with same inputs produces same outputs. No hidden state, no side effects.

6. **Breaking changes require major version bump.** CLI interface, JSON output schema, frontmatter schema compatibility — breaking any requires semver major increment.

---

## Principles (Prioritized)

1. **Schema fidelity over convenience.** When book-llms/ spec conflicts with ease-of-use, spec wins. We implement the methodology exactly, not a convenient approximation.

2. **Fail-fast over forgiving.** Invalid frontmatter blocks generation. Missing invariants block coverage. Broken references block verification. Errors surface immediately.

3. **Composability over monoliths.** Each command does one thing. Commands work in Unix pipelines. `organon find --scope meta | organon validate` should compose cleanly.

4. **Testability over implementation speed.** All core logic is pure functions with tests. CLI commands are thin wrappers. If it can't be tested, it doesn't land.

5. **Clarity over brevity.** Error messages explain what failed and how to fix it. `WORKFLOW_MISSING_PROTOCOL_ID` error includes file path, line number, and fix suggestion.

---

## Decision Heuristics

| Situation | Action |
|-----------|--------|
| Book-llms/ spec unclear | File issue in book-llms/, block implementation until clarified |
| Command behavior ambiguous | Default to strictest interpretation (fail, don't guess) |
| Adding new verification gate | Update three-layer-architecture.md first, implement second |
| Output format decision | Support both human-readable (default) and JSON (`--format json`) |
| Error code naming | Use `CATEGORY_SPECIFIC_ISSUE` pattern (e.g., `FRONTMATTER_INVALID_TYPE`) |
| Test coverage target | >90% for core utilities, 100% for verification gate logic |
| Breaking CLI change | Only in major versions; document migration path |
| Performance vs correctness | Correctness wins. Slow correct tools > fast incorrect tools |

---

## Out of Scope

Do not implement in organon-tools:

- Workflow execution (that's agent-specific: Claude skills, Cursor rules, etc.)
- Code generation beyond frontmatter (organon content is human-written)
- GUI or web interface (CLI only; UIs are separate projects)
- Organon content validation (semantic checks like "is this principle well-written?" — we validate structure, not quality)
- Project-specific business logic (tools are methodology-agnostic)

---

## Verification Checklist

Before releasing a version:

- [ ] All tests passing (132+ tests)
- [ ] No TypeScript compilation errors
- [ ] All commands have `--help` output
- [ ] All commands support `--format json`
- [ ] Frontmatter schema matches book-llms/frontmatter-system.md exactly
- [ ] README.md documents all commands with examples
- [ ] CHANGELOG.md updated with version changes
- [ ] Semver bumped correctly (breaking = major, features = minor, fixes = patch)
