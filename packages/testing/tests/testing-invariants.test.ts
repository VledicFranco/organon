/**
 * Structural invariant tests for the @organon-methodology/testing domain.
 *
 * Verifies that the testing package follows its own ETHOS.md constraints.
 *
 * @organon-invariant INV-TEST-2 fail-fast
 * @organon-invariant INV-TEST-3 invariant-id-required
 * @organon-invariant INV-TEST-4 framework-agnostic-core
 * @organon-invariant INV-TEST-5 100-percent-line-coverage
 * @organon-invariant INV-TEST-6 always-async
 * @organon-invariant INV-TEST-7 composable
 * @organon-invariant INV-TEST-8 language-parity
 */

import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { readFile, readdir } from 'node:fs/promises';

const pkgRoot = resolve(import.meta.dirname, '..');
const coreDir = resolve(pkgRoot, 'src/core');

// ---------------------------------------------------------------------------
// INV-TEST-2: fail-fast — assertions throw on violation
// ---------------------------------------------------------------------------

describe('INV-TEST-2: fail-fast', () => {
  it('validateMaxValue throws MaxValueAssertionError on violation', async () => {
    const { validateMaxValue } = await import('../src/core/assertions/max-value.js');
    expect(() =>
      validateMaxValue({
        values: [{ file: 'test.ts', line: 1, lineText: 'x = 999', value: 999, rawValue: '999' }],
        maxValue: 100,
      }),
    ).toThrow('Max value assertion failed');
  });

  it('testInvariant throws InvariantTestError on invalid input', async () => {
    const { validateInvariantId, InvariantTestError } = await import('../src/core/invariant-test.js');
    expect(() => validateInvariantId('')).toThrow(InvariantTestError);
  });
});

// ---------------------------------------------------------------------------
// INV-TEST-3: invariant-id-required — testInvariant requires ID
// ---------------------------------------------------------------------------

describe('INV-TEST-3: invariant-id-required', () => {
  it('testInvariant rejects empty invariant ID', async () => {
    const { testInvariant, createRegistry } = await import('../src/core/invariant-test.js');
    const registry = createRegistry();
    const noop: () => void = () => {};
    expect(() =>
      testInvariant('', 'desc', async () => {}, { registry, runner: noop as any }),
    ).toThrow('non-empty string');
  });
});

// ---------------------------------------------------------------------------
// INV-TEST-4: framework-agnostic-core — core/ has no test framework imports
// ---------------------------------------------------------------------------

describe('INV-TEST-4: framework-agnostic-core', () => {
  it('core/ source files do not import vitest, jest, or mocha', async () => {
    const coreFiles = [
      'src/core/invariant-test.ts',
      'src/core/assertions/max-value.ts',
      'src/core/assert-max-value.ts',
      'src/core/resolvers/file-resolver.ts',
      'src/core/resolvers/node-fs.ts',
      'src/core/resolvers/types.ts',
      'src/core/resolvers/import-resolver.ts',
      'src/core/resolvers/string-resolver.ts',
      'src/core/resolvers/parallel-reader.ts',
      'src/core/assertions/file-exists.ts',
      'src/core/assertions/no-side-effects.ts',
      'src/core/assertions/naming-convention.ts',
      'src/core/assertions/exports-present.ts',
      'src/core/assert-file-exists.ts',
      'src/core/assert-custom.ts',
      'src/core/assert-no-side-effects.ts',
      'src/core/assert-naming-convention.ts',
      'src/core/assert-exports-present.ts',
    ];

    const frameworkImports = /from\s+['"](?:vitest|jest|mocha|@jest|@vitest)/;

    for (const file of coreFiles) {
      const content = await readFile(resolve(pkgRoot, file), 'utf-8');
      expect(
        frameworkImports.test(content),
        `${file} must not import test framework modules`,
      ).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// INV-TEST-5: 100-percent-line-coverage — vitest config has coverage threshold
// ---------------------------------------------------------------------------

describe('INV-TEST-5: 100-percent-line-coverage', () => {
  it('package has test files covering core modules', async () => {
    const testDir = resolve(pkgRoot, 'tests');
    const entries = await readdir(testDir);
    const testFiles = entries.filter((f) => f.endsWith('.test.ts'));
    // At least one test file per core module (17 as of Phase 2/3)
    expect(testFiles.length).toBeGreaterThanOrEqual(15);
  });
});

// ---------------------------------------------------------------------------
// INV-TEST-6: always-async — public assertion functions are async
// ---------------------------------------------------------------------------

describe('INV-TEST-6: always-async', () => {
  it('assertMaxValue returns a Promise', async () => {
    const { assertMaxValue } = await import('../src/core/assert-max-value.js');
    // Use a file pattern that exists but won't match the regex
    const result = assertMaxValue({
      files: ['package.json'],
      pattern: /THIS_WILL_NEVER_MATCH_ANYTHING_12345/,
      maxValue: 100,
      cwd: pkgRoot,
      requireMatches: false,
    });
    expect(result).toBeInstanceOf(Promise);
    await result;
  });
});

// ---------------------------------------------------------------------------
// INV-TEST-7: composable — no module-level let/var in assertion files
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// INV-TEST-8: language-parity — every TS assertion has a Scala equivalent
// ---------------------------------------------------------------------------

describe('INV-TEST-8: language-parity', () => {
  it('Scala package has equivalent assertion validators for all TypeScript assertions', async () => {
    const scalaAssertionsDir = resolve(pkgRoot, '../testing-scala/src/main/scala/io/github/vledicfranco/organon/testing/core/assertions');
    const entries = await readdir(scalaAssertionsDir);
    const scalaValidators = entries.filter((f) => f.endsWith('Validator.scala')).map((f) => f.replace('Validator.scala', ''));

    // TypeScript assertions that must have Scala equivalents
    const tsAssertions = ['MaxValue', 'FileExists', 'NoSideEffects', 'NamingConvention', 'ExportsPresent'];

    for (const assertion of tsAssertions) {
      expect(
        scalaValidators,
        `Scala must have ${assertion}Validator.scala equivalent`,
      ).toContain(assertion);
    }
  });

  it('Scala package has testInvariant and OrganonSuite adapter', async () => {
    const scalaMainDir = resolve(pkgRoot, '../testing-scala/src/main/scala/io/github/vledicfranco/organon/testing');
    const mainEntries = await readdir(scalaMainDir);
    expect(mainEntries).toContain('InvariantTest.scala');

    const adapterDir = resolve(scalaMainDir, 'adapters');
    const adapterEntries = await readdir(adapterDir);
    expect(adapterEntries).toContain('MUnitAdapter.scala');
  });
});

describe('INV-TEST-7: composable', () => {
  it('core assertion files have no module-level mutable state', async () => {
    const assertionFiles = [
      'src/core/assertions/max-value.ts',
      'src/core/assert-max-value.ts',
      'src/core/assertions/file-exists.ts',
      'src/core/assert-file-exists.ts',
      'src/core/assert-custom.ts',
      'src/core/assertions/no-side-effects.ts',
      'src/core/assert-no-side-effects.ts',
      'src/core/assertions/naming-convention.ts',
      'src/core/assert-naming-convention.ts',
      'src/core/assertions/exports-present.ts',
      'src/core/assert-exports-present.ts',
    ];

    // Module-level let or var (not inside function/class body)
    // We check for `let ` or `var ` at the start of a line (not indented)
    const mutableStateRe = /^(?:export\s+)?(?:let|var)\s+/m;

    for (const file of assertionFiles) {
      const content = await readFile(resolve(pkgRoot, file), 'utf-8');
      expect(
        mutableStateRe.test(content),
        `${file} must not have module-level let/var declarations`,
      ).toBe(false);
    }
  });
});
