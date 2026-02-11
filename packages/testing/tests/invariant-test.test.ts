import { describe, it, expect, beforeEach } from 'vitest';
import {
  testInvariant,
  createRegistry,
  getDefaultRegistry,
  validateInvariantId,
  validateDescription,
  validateTestFn,
  InvariantTestError,
} from '../src/core/invariant-test.js';
import type {
  InvariantTestMetadata,
  InvariantTestFn,
  TestRunner,
} from '../src/core/invariant-test.js';

describe('validateInvariantId', () => {
  it('accepts valid invariant IDs', () => {
    expect(() => validateInvariantId('INV-CACHE-1')).not.toThrow();
    expect(() => validateInvariantId('INV-TEST-42')).not.toThrow();
    expect(() => validateInvariantId('CUSTOM-ID')).not.toThrow();
    expect(() => validateInvariantId('a')).not.toThrow();
  });

  it('rejects empty string', () => {
    expect(() => validateInvariantId('')).toThrow(InvariantTestError);
    expect(() => validateInvariantId('')).toThrow('non-empty string');
  });

  it('rejects whitespace-only string', () => {
    expect(() => validateInvariantId('   ')).toThrow(InvariantTestError);
    expect(() => validateInvariantId('   ')).toThrow('must not be empty');
  });

  it('rejects string with leading/trailing whitespace', () => {
    expect(() => validateInvariantId(' INV-CACHE-1 ')).toThrow(InvariantTestError);
    expect(() => validateInvariantId(' INV-CACHE-1 ')).toThrow('leading or trailing whitespace');
  });

  it('rejects non-string values', () => {
    expect(() => validateInvariantId(null as unknown as string)).toThrow(InvariantTestError);
    expect(() => validateInvariantId(undefined as unknown as string)).toThrow(InvariantTestError);
    expect(() => validateInvariantId(42 as unknown as string)).toThrow(InvariantTestError);
  });
});

describe('validateDescription', () => {
  it('accepts valid descriptions', () => {
    expect(() => validateDescription('cache TTL max 24h')).not.toThrow();
    expect(() => validateDescription('x')).not.toThrow();
  });

  it('rejects empty string', () => {
    expect(() => validateDescription('')).toThrow(InvariantTestError);
    expect(() => validateDescription('')).toThrow('non-empty string');
  });

  it('rejects whitespace-only string', () => {
    expect(() => validateDescription('   ')).toThrow(InvariantTestError);
    expect(() => validateDescription('   ')).toThrow('must not be empty');
  });

  it('rejects non-string values', () => {
    expect(() => validateDescription(null as unknown as string)).toThrow(InvariantTestError);
    expect(() => validateDescription(undefined as unknown as string)).toThrow(InvariantTestError);
  });
});

describe('validateTestFn', () => {
  it('accepts functions', () => {
    expect(() => validateTestFn(async () => {})).not.toThrow();
    expect(() => validateTestFn(() => {})).not.toThrow();
  });

  it('rejects non-function values', () => {
    expect(() => validateTestFn(null)).toThrow(InvariantTestError);
    expect(() => validateTestFn('not a function')).toThrow(InvariantTestError);
    expect(() => validateTestFn(42)).toThrow(InvariantTestError);
    expect(() => validateTestFn(undefined)).toThrow(InvariantTestError);
  });

  it('error message includes the actual type', () => {
    expect(() => validateTestFn('hello')).toThrow('Got string');
    expect(() => validateTestFn(42)).toThrow('Got number');
  });
});

describe('createRegistry', () => {
  it('starts empty', () => {
    const registry = createRegistry();
    expect(registry.size()).toBe(0);
    expect(registry.getAll()).toEqual([]);
  });

  it('registers and retrieves test metadata', () => {
    const registry = createRegistry();
    registry.register({ invariantId: 'INV-A-1', description: 'test A' });
    registry.register({ invariantId: 'INV-B-2', description: 'test B' });

    expect(registry.size()).toBe(2);
    expect(registry.has('INV-A-1')).toBe(true);
    expect(registry.has('INV-B-2')).toBe(true);
    expect(registry.has('INV-C-3')).toBe(false);
  });

  it('getAll returns a snapshot (not a live reference)', () => {
    const registry = createRegistry();
    registry.register({ invariantId: 'INV-A-1', description: 'test A' });

    const snapshot1 = registry.getAll();
    registry.register({ invariantId: 'INV-B-2', description: 'test B' });
    const snapshot2 = registry.getAll();

    expect(snapshot1).toHaveLength(1);
    expect(snapshot2).toHaveLength(2);
  });

  it('getAll returns copies of entries (not originals)', () => {
    const registry = createRegistry();
    registry.register({ invariantId: 'INV-A-1', description: 'original' });

    const entries = registry.getAll();
    entries[0].description = 'mutated';

    const fresh = registry.getAll();
    expect(fresh[0].description).toBe('original');
  });

  it('clear removes all entries', () => {
    const registry = createRegistry();
    registry.register({ invariantId: 'INV-A-1', description: 'test A' });
    registry.register({ invariantId: 'INV-B-2', description: 'test B' });

    expect(registry.size()).toBe(2);
    registry.clear();
    expect(registry.size()).toBe(0);
    expect(registry.getAll()).toEqual([]);
    expect(registry.has('INV-A-1')).toBe(false);
  });

  it('coveredCount returns distinct invariant IDs', () => {
    const registry = createRegistry();
    registry.register({ invariantId: 'INV-A-1', description: 'test A1' });
    registry.register({ invariantId: 'INV-A-1', description: 'test A2' });
    registry.register({ invariantId: 'INV-B-1', description: 'test B' });

    expect(registry.size()).toBe(3);
    expect(registry.coveredCount()).toBe(2);
  });
});

describe('getDefaultRegistry', () => {
  beforeEach(() => {
    getDefaultRegistry().clear();
  });

  it('returns a singleton registry', () => {
    const reg1 = getDefaultRegistry();
    const reg2 = getDefaultRegistry();
    expect(reg1).toBe(reg2);
  });

  it('is used by testInvariant when no custom registry is provided', () => {
    const registry = getDefaultRegistry();
    expect(registry.size()).toBe(0);

    testInvariant('INV-DEFAULT-1', 'default test', async () => {});

    expect(registry.size()).toBe(1);
    expect(registry.has('INV-DEFAULT-1')).toBe(true);
  });
});

describe('testInvariant', () => {
  beforeEach(() => {
    getDefaultRegistry().clear();
  });

  it('registers a test in the default registry', () => {
    testInvariant('INV-CACHE-1', 'cache TTL max 24h', async () => {});

    const registry = getDefaultRegistry();
    expect(registry.size()).toBe(1);
    const all = registry.getAll();
    expect(all[0].invariantId).toBe('INV-CACHE-1');
    expect(all[0].description).toBe('cache TTL max 24h');
  });

  it('registers a test in a custom registry', () => {
    const customRegistry = createRegistry();

    testInvariant('INV-CUSTOM-1', 'custom test', async () => {}, {
      registry: customRegistry,
    });

    expect(customRegistry.size()).toBe(1);
    expect(customRegistry.has('INV-CUSTOM-1')).toBe(true);
    // Default registry should NOT have this entry
    expect(getDefaultRegistry().has('INV-CUSTOM-1')).toBe(false);
  });

  it('delegates to the provided test runner', () => {
    const calls: Array<{ name: string; metadata: InvariantTestMetadata }> = [];
    const customRunner: TestRunner = (name, _fn, metadata) => {
      calls.push({ name, metadata });
    };

    testInvariant('INV-RUN-1', 'runner test', async () => {}, {
      runner: customRunner,
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].name).toBe('[INV-RUN-1] runner test');
    expect(calls[0].metadata.invariantId).toBe('INV-RUN-1');
    expect(calls[0].metadata.description).toBe('runner test');
  });

  it('formats test name as [INVARIANT_ID] description', () => {
    const names: string[] = [];
    const runner: TestRunner = (name) => {
      names.push(name);
    };

    testInvariant('INV-FORMAT-1', 'formatted test', async () => {}, { runner });

    expect(names[0]).toBe('[INV-FORMAT-1] formatted test');
  });

  it('throws InvariantTestError for invalid invariant ID', () => {
    expect(() =>
      testInvariant('', 'test', async () => {}),
    ).toThrow(InvariantTestError);
  });

  it('throws InvariantTestError for invalid description', () => {
    expect(() =>
      testInvariant('INV-X-1', '', async () => {}),
    ).toThrow(InvariantTestError);
  });

  it('throws InvariantTestError for non-function test', () => {
    expect(() =>
      testInvariant('INV-X-1', 'test', 'not a function' as unknown as InvariantTestFn),
    ).toThrow(InvariantTestError);
  });

  it('allows multiple tests for the same invariant ID', () => {
    const registry = createRegistry();

    testInvariant('INV-MULTI-1', 'test A', async () => {}, { registry });
    testInvariant('INV-MULTI-1', 'test B', async () => {}, { registry });

    expect(registry.size()).toBe(2);
    expect(registry.has('INV-MULTI-1')).toBe(true);
  });

  it('passes the test function to the runner', () => {
    let capturedFn: InvariantTestFn | null = null;
    const runner: TestRunner = (_name, fn) => {
      capturedFn = fn;
    };

    const myTestFn = async () => {};
    testInvariant('INV-FN-1', 'fn test', myTestFn, { runner });

    expect(capturedFn).toBe(myTestFn);
  });

  it('default runner executes the test function', async () => {
    let executed = false;

    testInvariant('INV-EXEC-1', 'execution test', async () => {
      executed = true;
    });

    // Default runner calls testFn() asynchronously, give it a tick to resolve
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(executed).toBe(true);
  });
});
