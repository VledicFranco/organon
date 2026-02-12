---
type: rationale
scope: domain
name: tools
version: "1.0"
summary: Why organon-tools is built with TypeScript/Node, command-based CLI, and pure-function core — design decisions and trade-offs
token_estimate: 1868
decision_count: 5
inherits_from: [meta-organon]
load_priority: low
required_for:
  - tool_architecture_decisions
audience: [llm, human]
---

# Organon Tools Philosophy

> Why organon-tools exists and the thinking behind its design.

---

## The Problem

The Organon methodology (book-llms/) defines verification gates, frontmatter schemas, invariant tracking, and progressive disclosure patterns. Without tooling, these are manual processes — humans eyeball frontmatter, guess token estimates, and forget to update counts. Manual enforcement creates drift: organons claim constraints exist but nothing verifies compliance.

**What's needed:** A CLI that automates verification gates, generates accurate frontmatter, and tracks invariant-to-test coverage. Must work with any codebase (any language), be composable in CI/CD pipelines, and match the spec exactly.

---

## The Solution: CLI-First Tooling

**Core decision:** Build a command-based CLI (not a library, not a service) using TypeScript/Node.js with pure-function core utilities.

---

## Design Decisions

### 1. CLI over Library

**Decision:** Organon-tools is a command-line tool (`organon generate`, `organon verify`), not a library you import.

**Rationale:**
- **Universal:** Works with any project in any language (Python, Rust, Scala, etc.)
- **CI/CD native:** Commands compose in pipelines (`organon verify || exit 1`)
- **Human-friendly:** `organon validate path/to/file.md` is discoverable; API is not
- **Single installation:** `npm install -g @organon/tools` vs per-project dependencies

**Trade-off:** CLI is less flexible than library API, but universality > flexibility for methodology enforcement.

---

### 2. TypeScript/Node.js over Other Stacks

**Decision:** Use TypeScript on Node.js, not Go/Rust/Python.

**Rationale:**
- **JSON/YAML native:** Frontmatter is YAML; markdown with frontmatter is our primary data structure
- **Ecosystem:** Existing markdown parsers (gray-matter), YAML parsers (js-yaml), glob/regex libraries
- **Type safety:** TypeScript ensures schema validation logic is correct
- **Contributor familiarity:** Most LLM-focused teams know TypeScript

**Trade-off:** Slower startup than Go/Rust, but startup time (<100ms) is acceptable for CLI tasks. Runtime performance isn't a bottleneck when validating 50-100 organon files.

---

### 3. Command-Based Architecture (yargs)

**Decision:** Each tool operation is a dedicated command (`generate`, `validate`, `verify`), not a monolithic script with flags.

**Rationale:**
- **Composability:** `organon find --scope meta | xargs organon validate` works naturally
- **Discoverability:** `organon --help` shows all commands; `organon verify --help` shows gate options
- **Separation of concerns:** Each command is a self-contained module
- **Extension pattern:** New gates = new commands (e.g., `organon verify --gate triplet-integrity`)

**Trade-off:** More boilerplate than a single script, but clarity and composability justify the structure.

---

### 4. Pure-Function Core with Thin CLI Wrappers

**Decision:** Core logic lives in pure functions (`src/core/*.ts`); CLI commands (`src/cli/commands/*.ts`) are thin wrappers.

**Rationale:**
- **Testability:** Pure functions are trivial to test (132 tests, >90% coverage)
- **Reusability:** Core utilities can be extracted to library later if needed
- **Correctness:** Pure functions = no hidden state, deterministic behavior
- **Refactoring safety:** Tests catch regressions when core logic changes

**Example:**
```typescript
// Core utility (pure function)
export function validateFrontmatter(content: string): ValidationResult {
  // Logic here
}

// CLI wrapper (thin)
export async function validateCommand(args: { file: string }) {
  const content = await fs.readFile(args.file, 'utf-8');
  const result = validateFrontmatter(content);
  console.log(formatResult(result));
}
```

**Trade-off:** More files, more structure. But testability and correctness are non-negotiable for enforcement tools.

---

### 5. Fail-Fast over Forgiving Defaults

**Decision:** When frontmatter is invalid or references are broken, commands fail with exit code 1. No "soft errors" or automatic fixes.

**Rationale:**
- **Enforcement gap prevention:** Warnings are ignored; failures force fixes
- **CI/CD integration:** `organon verify || exit 1` blocks merges automatically
- **Explicit intent:** Auto-fixing frontmatter could mask real issues (e.g., typo in invariant ID)
- **Matches methodology:** Verification gates fail builds, not warn (three-layer-architecture.md)

**Trade-off:** Less "helpful" for casual users, but this is an enforcement tool, not a suggestion tool. The methodology spec says "gates fail builds" — we implement that literally.

---

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| CLI over library | Universal (any language), CI/CD native | Less flexible than programmatic API |
| TypeScript/Node.js | JSON/YAML native, contributor familiarity | Slower startup than Go/Rust (acceptable for our use case) |
| Command-based (yargs) | Composable, discoverable, extensible | More boilerplate than monolith |
| Pure-function core | Testable, deterministic, refactor-safe | More files, more structure |
| Fail-fast | Enforcement works, CI integration clean | Less forgiving for experimentation |

---

## What This Is Not

- **Not a language-specific linter:** We validate Organon methodology structure, not code style
- **Not a content generator:** We generate/validate frontmatter, not organon prose
- **Not a workflow orchestrator:** Workflows are agent-specific (skills, rules, etc.)
- **Not a web service:** CLI only; web UIs are separate projects

---

## Related Files

| File | Relationship |
|------|--------------|
| [ETHOS.md](./ETHOS.md) | Constraints this philosophy explains |
| [book-llms/three-layer-architecture.md](../book-llms/three-layer-architecture.md) | Verification gates we implement |
| [book-llms/frontmatter-system.md](../book-llms/frontmatter-system.md) | Schema we validate |
| [book-llms/invariant-tracking.md](../book-llms/invariant-tracking.md) | Coverage tracking we support |
