# Testing Invariants

This guide covers tier-4 testing: writing automated tests that verify your organon invariants hold true in code. The `@organon-methodology/testing` package provides assertions purpose-built for this.

---

## Table of Contents

- [What Are Invariant Tests?](#what-are-invariant-tests)
- [Setup](#setup)
- [testInvariant() Wrapper](#testinvariant-wrapper)
- [Assertions](#assertions)
  - [assertMaxValue](#assertmaxvalue)
  - [assertFileExists](#assertfileexists)
  - [assertNoSideEffects](#assertnosideeffects)
  - [assertNamingConvention](#assertnamingconvention)
  - [assertExportsPresent](#assertexportspresent)
  - [assertCustom](#assertcustom)
- [Invariant IDs](#invariant-ids)
- [Coverage Workflow](#coverage-workflow)
- [Real-World Example](#real-world-example)
- [Monorepo Considerations](#monorepo-considerations)

---

## What Are Invariant Tests?

The Organon methodology uses a 4-tier testing model:

| Tier | Scope | What it tests |
|------|-------|---------------|
| Tier 1: Unit | Individual functions | Isolated behavior |
| Tier 2: Integration | Cross-module | Module boundaries |
| Tier 3: End-to-end | User paths | System behavior |
| **Tier 4: Organon** | **Invariant compliance** | **That ETHOS.md constraints hold in code** |

Tier-4 tests are the novel concept. They verify that your codebase satisfies the invariants declared in ETHOS.md files. If your ETHOS.md says "cache TTL max 24 hours," a tier-4 test scans your config files and asserts no TTL exceeds 86400 seconds.

Two sub-types:
- **Structural** — verify metadata, references, file organization (automatable, universal)
- **Semantic** — verify code behavior satisfies invariants (project-specific, someone must write the mapping)

---

## Setup

Install `@organon-methodology/testing` as a dev dependency:

```bash
npm install --save-dev @organon-methodology/testing
```

The package has a peer dependency on `vitest` (optional). If you use vitest, import from the vitest adapter:

```typescript
// vitest adapter — tests run through vitest's it()
import { testInvariant, assertMaxValue } from '@organon-methodology/testing/vitest';
```

If you use a different test framework, import from the main entry point and provide your own test runner:

```typescript
// Framework-agnostic core
import { testInvariant, assertMaxValue } from '@organon-methodology/testing';
```

---

## testInvariant() Wrapper

Every tier-4 test should use `testInvariant()` instead of bare `it()` or `test()`. This wrapper:

1. Registers the test with its invariant ID for coverage tracking
2. Adds the `@organon-invariant` annotation automatically
3. Produces structured error messages with invariant ID on failure

```typescript
import { testInvariant, assertMaxValue } from '@organon-methodology/testing/vitest';

// @organon-invariant INV-CACHE-1
testInvariant('INV-CACHE-1', 'cache TTL must not exceed 24 hours', async () => {
  await assertMaxValue({
    files: ['src/config/*.ts'],
    pattern: /ttl:\s*(\d+)/,
    maxValue: 86400,
  });
});
```

**Parameters:**
- `invariantId` — Stable ID matching an entry in ETHOS.md frontmatter (e.g., `INV-CACHE-1`)
- `description` — Human-readable description of what's being verified
- `testFn` — Async function containing assertions

The `@organon-invariant INV-CACHE-1` comment is required for coverage tracking. The `organon coverage` command scans test files for this annotation to determine which invariants have tests.

---

## Assertions

The package provides 6 pre-built assertions for common semantic test patterns.

### assertMaxValue

Verify that numeric values in files don't exceed a maximum. Useful for config limits, timeouts, thresholds.

```typescript
import { assertMaxValue } from '@organon-methodology/testing/vitest';

await assertMaxValue({
  files: ['src/config/**/*.ts'],        // Glob patterns
  pattern: /ttl:\s*(\d+)/,             // Regex with capture group
  maxValue: 86400,                      // Maximum allowed value
  // requireMatches: true,              // Default: true — fails if no matches found
});
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `files` | string[] | required | Glob patterns for files to scan |
| `pattern` | RegExp | required | Regex with a capture group extracting the numeric value |
| `maxValue` | number | required | Maximum allowed value |
| `requireMatches` | boolean | `true` | Fail if no matches found (prevents silent passes from typos) |
| `cwd` | string | `process.cwd()` | Working directory for glob resolution |

### assertFileExists

Verify that required files exist. Useful for structural invariants like "every domain has an ETHOS.md."

```typescript
import { assertFileExists } from '@organon-methodology/testing/vitest';

await assertFileExists({
  patterns: ['organon/domains/*/ETHOS.md'],   // Must match at least one file
  // requireMatches: true,                     // Default: true
});
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `patterns` | string[] | required | Glob patterns that must match existing files |
| `requireMatches` | boolean | `true` | Fail if no matches found |
| `cwd` | string | `process.cwd()` | Working directory |

### assertNoSideEffects

Verify that files don't contain forbidden imports or patterns. Useful for "modules must be pure" invariants.

```typescript
import { assertNoSideEffects } from '@organon-methodology/testing/vitest';

await assertNoSideEffects({
  files: ['src/core/**/*.ts'],
  forbidden: [
    /import.*from\s+['"]fs['"]/,          // No direct fs imports
    /process\.exit/,                        // No process.exit calls
    /console\.(log|warn|error)/,           // No console statements
  ],
});
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `files` | string[] | required | Glob patterns for files to scan |
| `forbidden` | RegExp[] | required | Patterns that must not appear |
| `requireMatches` | boolean | `true` | Fail if no files match the glob |
| `cwd` | string | `process.cwd()` | Working directory |

### assertNamingConvention

Verify that file names or exported names follow a naming convention.

```typescript
import { assertNamingConvention } from '@organon-methodology/testing/vitest';

await assertNamingConvention({
  files: ['src/commands/*.ts'],
  convention: 'kebab-case',          // kebab-case | camelCase | PascalCase | SCREAMING_SNAKE
});
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `files` | string[] | required | Glob patterns for files to check |
| `convention` | Convention | required | Naming convention to enforce |
| `requireMatches` | boolean | `true` | Fail if no files match |
| `cwd` | string | `process.cwd()` | Working directory |

### assertExportsPresent

Verify that specified exports exist in a module. Useful for public API invariants.

```typescript
import { assertExportsPresent } from '@organon-methodology/testing/vitest';

await assertExportsPresent({
  file: 'src/index.ts',
  exports: ['validateFrontmatter', 'resolveConfig', 'NodeFileSystem'],
});
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `file` | string | required | File to check for exports |
| `exports` | string[] | required | Expected export names |
| `cwd` | string | `process.cwd()` | Working directory |

### assertCustom

Escape hatch for invariants that don't fit the pre-built assertions.

```typescript
import { assertCustom } from '@organon-methodology/testing/vitest';

await assertCustom({
  name: 'no-circular-dependencies',
  check: async () => {
    // Your custom logic here
    const cycles = await detectCycles('src/');
    return {
      passed: cycles.length === 0,
      message: cycles.length > 0
        ? `Found ${cycles.length} circular dependencies: ${cycles.join(', ')}`
        : 'No circular dependencies found',
    };
  },
});
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `name` | string | Name for the check (used in error messages) |
| `check` | () => Promise<{passed, message}> | Async function returning pass/fail and message |

---

## Invariant IDs

Invariant IDs follow the format `INV-{SCOPE}-{N}`:

- `INV-META-1` — Meta-organon invariant #1
- `INV-PRODUCT-3` — Product-level invariant #3
- `INV-BILLING-2` — Billing domain invariant #2

**Rules:**
- IDs are declared in ETHOS.md frontmatter (in the `invariants` array)
- IDs are stable — once assigned, never reused
- Each invariant can be flagged `judgment_call: true` if it requires human review rather than automated testing
- Judgment-call invariants don't count as "uncovered" in coverage reports

**Example ETHOS.md frontmatter:**

```yaml
invariants:
  - id: INV-CACHE-1
    name: ttl-max-24h
  - id: INV-CACHE-2
    name: keys-include-all-inputs
  - id: INV-CACHE-3
    name: miss-executes-normally
    judgment_call: true
```

---

## Coverage Workflow

Use the CLI to check which invariants have tests and generate scaffolds for those that don't.

### Check coverage

```bash
organon coverage
```

Output:

```
Organon Invariant Coverage

  ID                Name                          Status          Tests
  ──────────────────────────────────────────────────────────────────────────
  INV-CACHE-1       ttl-max-24h                   covered         cache.test.ts
  INV-CACHE-2       keys-include-all-inputs       uncovered       none
  INV-CACHE-3       miss-executes-normally        judgment        none

  ✗ 1/3 covered, 1 judgment calls, 1 uncovered
```

### Generate test scaffolds

```bash
organon generate-tests
```

This generates ready-to-use test files for uncovered invariants, suggesting appropriate assertions based on the invariant name and context.

### Verify coverage gate

```bash
organon verify --gate invariant-coverage
```

This gate fails if any non-judgment-call invariant lacks a tier-4 test.

---

## Real-World Example

From this project's own `meta-invariants.test.ts`:

```typescript
import { describe } from 'vitest';
import { testInvariant, assertFileExists } from '@organon-methodology/testing/vitest';

describe('Meta-organon invariants', () => {
  // @organon-invariant INV-META-1
  testInvariant('INV-META-1', 'ethos is required for every scope', async () => {
    await assertFileExists({
      patterns: [
        'book-llms/ETHOS.md',
        'organon/ETHOS.md',
        'organon/domains/*/ETHOS.md',
      ],
    });
  });

  // @organon-invariant INV-META-6
  testInvariant('INV-META-6', 'every organon file has YAML frontmatter', async () => {
    // Custom assertion: read files, check for frontmatter delimiter
    await assertCustom({
      name: 'frontmatter-present',
      check: async () => {
        // ... scan organon files for frontmatter
        return { passed: true, message: 'All files have frontmatter' };
      },
    });
  });
});
```

Key patterns:
- Each test maps to exactly one invariant ID
- The `@organon-invariant` comment enables coverage tracking
- `describe` groups related invariants
- Assertions are concise — the assertion library handles file scanning and error reporting

---

## Monorepo Considerations

If you're working in a monorepo (like this project), keep these in mind:

**Build order matters.** The `@organon-methodology/testing` package must be built before packages that import it:

```bash
cd packages/testing && npm run build
cd packages/tools && npm test    # Can now import @organon-methodology/testing
```

**Workspace dependencies** use `"*"` in package.json (npm workspaces), not `"workspace:*"` (pnpm syntax):

```json
{
  "devDependencies": {
    "@organon-methodology/testing": "*"
  }
}
```

**Subpath export:** Import from `@organon-methodology/testing/vitest` for the vitest adapter. Do not export vitest-specific code from the main `@organon-methodology/testing` entry point — it would fail in non-vitest contexts.

**`requireMatches: true`** (the default) prevents silent passes from incorrect glob patterns or file paths. This is intentional — a test that matches zero files should fail, not silently pass.

---

## Next Steps

- [CLI Reference](./03-cli-reference.md) — `coverage` and `generate-tests` command details
- [Project Structure](./06-project-structure.md) — Where test files live in this repo
- [Glossary](./07-glossary.md) — Term definitions
