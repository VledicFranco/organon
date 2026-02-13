# @organon-methodology/testing

Semantic testing framework for automated tier-4 invariant verification in [Organon](https://github.com/VledicFranco/organon) projects.

## Install

```bash
npm install --save-dev @organon-methodology/testing
```

## Assertions

| Assertion | Purpose |
|-----------|---------|
| `assertMaxValue` | Enforce numeric limits (line counts, token estimates, array lengths) |
| `assertFileExists` | Verify required files are present (globs supported) |
| `assertNamingConvention` | Enforce naming patterns (kebab-case, snake_case, custom regex) |
| `assertExportsPresent` | Verify modules export expected symbols |
| `assertNoSideEffects` | Detect forbidden patterns in source files |
| `assertCustom` | Escape hatch for arbitrary validation logic |

All assertions resolve files from disk using glob patterns and provide structured violation reports.

## Usage with Vitest

```ts
import { testInvariant } from '@organon-methodology/testing/vitest';
import { assertMaxValue } from '@organon-methodology/testing';

testInvariant('INV-EXAMPLE-1', 'README files stay under 100 lines', async () => {
  await assertMaxValue({
    pattern: '**/README.md',
    extract: /\n/g,      // count newlines
    max: 100,
    cwd: process.cwd(),
  });
});
```

The `testInvariant` adapter wraps your test runner (Vitest) so invariant tests are tracked in a registry and tagged with structured IDs.

## API

### `testInvariant(id, description, fn)`

Registers and runs an invariant test. The `id` must match the pattern `INV-<SCOPE>-<N>`.

### `assertMaxValue(options)`

Resolves files matching `pattern`, extracts numeric values, and fails if any exceed `max`. Options:

- `pattern` — glob pattern for files
- `extract` — regex or function to extract a count from each file
- `max` — maximum allowed value
- `cwd` — working directory for glob resolution
- `requireMatches` — fail if no files match (default: `true`)

### `assertFileExists(options)`

Verifies that files matching the given patterns exist.

### `assertNamingConvention(options)`

Checks that file names or extracted strings conform to a naming convention (`kebab-case`, `snake_case`, `camelCase`, `PascalCase`, or custom regex).

### `assertExportsPresent(options)`

Parses source files and verifies that expected export names are present.

### `assertNoSideEffects(options)`

Scans files for forbidden patterns (e.g., `console.log`, `process.exit`) and fails if any are found.

### `assertCustom(options)`

Runs an arbitrary validation function. Use when no built-in assertion fits.

## License

MIT
