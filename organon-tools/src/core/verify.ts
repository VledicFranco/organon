/**
 * Verification orchestrator with extensible gate registry.
 *
 * Built-in gates: frontmatter, triplets, freshness.
 * Projects can register custom gates via registerGate().
 * The orchestrator runs all registered gates (or a named subset).
 */

import { validateFrontmatter } from './validate-frontmatter.js';
import { verifyTriplets } from './verify-triplets.js';
import { health as runHealth } from './health.js';
import type {
  DiagnosticMessage,
  FileSystem,
  OrganonConfig,
  VerifyGateFn,
  VerifyGateResult,
  VerifyResult,
} from './types.js';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface VerifyOptions {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
  /** Run only these gates. If empty/undefined, runs all registered gates. */
  gates?: string[];
}

// ---------------------------------------------------------------------------
// Gate registry
// ---------------------------------------------------------------------------

const gateRegistry = new Map<string, VerifyGateFn>();

export function registerGate(name: string, fn: VerifyGateFn): void {
  gateRegistry.set(name, fn);
}

export function getRegisteredGates(): string[] {
  return [...gateRegistry.keys()];
}

// ---------------------------------------------------------------------------
// Built-in gates
// ---------------------------------------------------------------------------

const frontmatterGate: VerifyGateFn = async ({ projectRoot, config, fs }) => {
  const result = await validateFrontmatter({ projectRoot, config, fs });
  return {
    gate: 'frontmatter',
    passed: result.success,
    errors: result.errors,
    warnings: result.warnings,
  };
};

const tripletsGate: VerifyGateFn = async ({ projectRoot, config, fs }) => {
  const result = await verifyTriplets({ projectRoot, config, fs });
  return {
    gate: 'triplets',
    passed: result.success,
    errors: result.errors,
    warnings: result.warnings,
  };
};

const freshnessGate: VerifyGateFn = async ({ projectRoot, config, fs }) => {
  const result = await runHealth({ projectRoot, config, fs });
  const errors: DiagnosticMessage[] = [];
  const warnings: DiagnosticMessage[] = [];

  if (result.freshness.stale > 0) {
    warnings.push({
      severity: 'warning',
      code: 'FRESHNESS_STALE_FILES',
      message: `${result.freshness.stale} organon file(s) exceed the freshness threshold of ${config.freshnessThresholdHours}h`,
    });
  }

  if (result.freshness.stalestFile) {
    warnings.push({
      severity: 'warning',
      code: 'FRESHNESS_STALEST',
      message: `Stalest file: ${result.freshness.stalestFile.file} (last modified: ${result.freshness.stalestFile.lastModified.toISOString()})`,
      file: result.freshness.stalestFile.file,
    });
  }

  return {
    gate: 'freshness',
    passed: true, // Freshness is advisory, not blocking
    errors,
    warnings,
  };
};

// Register built-in gates
registerGate('frontmatter', frontmatterGate);
registerGate('triplets', tripletsGate);
registerGate('freshness', freshnessGate);

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function verify(options: VerifyOptions): Promise<VerifyResult> {
  const { gates: requestedGates } = options;
  const allErrors: DiagnosticMessage[] = [];
  const allWarnings: DiagnosticMessage[] = [];
  const gateResults: VerifyGateResult[] = [];

  const gatesToRun = requestedGates && requestedGates.length > 0
    ? requestedGates
    : [...gateRegistry.keys()];

  for (const gateName of gatesToRun) {
    const gateFn = gateRegistry.get(gateName);
    if (!gateFn) {
      allErrors.push({
        severity: 'error',
        code: 'UNKNOWN_GATE',
        message: `Unknown verification gate: '${gateName}'. Available: ${[...gateRegistry.keys()].join(', ')}`,
      });
      continue;
    }

    try {
      const result = await gateFn({
        projectRoot: options.projectRoot,
        config: options.config,
        fs: options.fs,
      });
      gateResults.push(result);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      gateResults.push({
        gate: gateName,
        passed: false,
        errors: [{
          severity: 'error',
          code: 'GATE_EXECUTION_ERROR',
          message: `Gate '${gateName}' failed: ${message}`,
        }],
        warnings: [],
      });
      allErrors.push({
        severity: 'error',
        code: 'GATE_EXECUTION_ERROR',
        message: `Gate '${gateName}' failed: ${message}`,
      });
    }
  }

  return {
    success: gateResults.every((g) => g.passed),
    gates: gateResults,
    errors: allErrors,
    warnings: allWarnings,
  };
}
