import { describe, it, expect } from 'vitest';
import {
  assertCustom,
  CustomAssertionError,
} from '../src/core/assert-custom.js';

describe('assertCustom', () => {
  it('passes when validate function completes without throwing', async () => {
    await expect(
      assertCustom({
        label: 'always passes',
        validate: async () => {},
      }),
    ).resolves.toBeUndefined();
  });

  it('throws CustomAssertionError when validate function throws', async () => {
    await expect(
      assertCustom({
        label: 'always fails',
        validate: async () => {
          throw new Error('validation failed');
        },
      }),
    ).rejects.toThrow(CustomAssertionError);
  });

  it('includes label in error message', async () => {
    try {
      await assertCustom({
        label: 'my custom check',
        validate: async () => {
          throw new Error('something wrong');
        },
      });
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as CustomAssertionError;
      expect(error.message).toContain('my custom check');
      expect(error.label).toBe('my custom check');
    }
  });

  it('includes original error message in error message', async () => {
    try {
      await assertCustom({
        label: 'check',
        validate: async () => {
          throw new Error('original message');
        },
      });
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as CustomAssertionError;
      expect(error.message).toContain('original message');
      expect(error.cause.message).toBe('original message');
    }
  });

  it('wraps non-Error thrown values', async () => {
    try {
      await assertCustom({
        label: 'string throw',
        validate: async () => {
          throw 'plain string error';
        },
      });
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as CustomAssertionError;
      expect(error.cause).toBeInstanceOf(Error);
      expect(error.cause.message).toBe('plain string error');
    }
  });

  it('error has name CustomAssertionError', async () => {
    try {
      await assertCustom({
        label: 'test',
        validate: async () => {
          throw new Error('fail');
        },
      });
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect((err as Error).name).toBe('CustomAssertionError');
    }
  });

  it('works with synchronous-style validate functions', async () => {
    // async functions that don't actually await are fine
    await expect(
      assertCustom({
        label: 'sync-style',
        validate: async () => {
          // Synchronous validation logic
          if (1 + 1 !== 2) throw new Error('math is broken');
        },
      }),
    ).resolves.toBeUndefined();
  });
});
