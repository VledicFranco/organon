/**
 * assertCustom — Thin wrapper for user-defined validation functions.
 *
 * No pure validator layer needed — the validator IS the user's function.
 * This wrapper provides consistent error handling and labeling.
 *
 * Invariants:
 * - INV-TEST-2 (fail-fast): Re-throws user errors wrapped in CustomAssertionError
 * - INV-TEST-6 (always-async): Returns Promise<void>
 * - INV-TEST-7 (composable): No module-level mutable state
 */

/**
 * Options for assertCustom.
 */
export interface CustomAssertionOptions {
  /** Human-readable label for the assertion (used in error messages) */
  label: string;
  /** The validation function to execute. Throw to signal failure. */
  validate: () => Promise<void>;
}

/**
 * Error thrown when a custom assertion fails.
 * Wraps the original error with a label for context.
 */
export class CustomAssertionError extends Error {
  /** The label provided for this assertion */
  public readonly label: string;
  /** The original error thrown by the validation function */
  public readonly cause: Error;

  constructor(label: string, cause: Error) {
    super(`Custom assertion "${label}" failed: ${cause.message}`);
    this.name = 'CustomAssertionError';
    this.label = label;
    this.cause = cause;
  }
}

/**
 * Run a user-defined validation function with consistent error handling.
 *
 * If the validation function throws, the error is wrapped in a
 * CustomAssertionError with the provided label for context.
 * If it completes without throwing, the assertion passes.
 *
 * @param options - Configuration including label and validate function
 * @throws {CustomAssertionError} if the validate function throws
 */
export async function assertCustom(
  options: CustomAssertionOptions,
): Promise<void> {
  const { label, validate } = options;

  try {
    await validate();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    throw new CustomAssertionError(label, error);
  }
}
