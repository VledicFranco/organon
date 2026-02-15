/**
 * Health dashboard.
 *
 * Reports coverage (% files with frontmatter), validation status,
 * token analysis, freshness, and overall health score.
 */

import { parseFrontmatter, estimateTokens, parseOrganonFile } from './frontmatter-parser.js';
import { validateFrontmatter } from './validate-frontmatter.js';
import { verifyPlaceholders } from './verify-placeholders.js';
import { joinPath } from './config.js';
import { discoverOrganonFiles } from './discover.js';
import type {
  DiagnosticMessage,
  FileSystem,
  HealthResult,
  OrganonConfig,
  ParsedOrganonFile,
} from './types.js';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface HealthOptions {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
  /** Include fix suggestions in issues */
  fixSuggestions?: boolean;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function health(options: HealthOptions): Promise<HealthResult> {
  const { projectRoot, config, fs } = options;
  const errors: DiagnosticMessage[] = [];
  const warnings: DiagnosticMessage[] = [];
  const issues: DiagnosticMessage[] = [];

  // Discover organon files
  const allFiles = await discoverOrganonFiles(projectRoot, config, fs);

  // Parse all files
  const parsed: ParsedOrganonFile[] = [];
  for (const file of allFiles) {
    const absPath = joinPath(projectRoot, file);
    try {
      const content = await fs.readFile(absPath);
      parsed.push(parseOrganonFile(file, content));
    } catch {
      errors.push({
        severity: 'error',
        code: 'FILE_READ_ERROR',
        message: `Cannot read file: ${file}`,
        file,
      });
    }
  }

  // Coverage
  const withFrontmatter = parsed.filter((f) => f.frontmatter !== null);
  const coverage = {
    totalFiles: parsed.length,
    withFrontmatter: withFrontmatter.length,
    percentage: parsed.length > 0 ? Math.round((withFrontmatter.length / parsed.length) * 100) : 0,
  };

  if (coverage.percentage < 100) {
    const missingFiles = parsed.filter((f) => f.frontmatter === null);
    for (const f of missingFiles) {
      issues.push({
        severity: 'warning',
        code: 'HEALTH_MISSING_FRONTMATTER',
        message: `Missing frontmatter: ${f.path}`,
        file: f.path,
        suggestion: options.fixSuggestions ? 'Run: organon generate <file>' : undefined,
      });
    }
  }

  // Validation
  const validationResult = await validateFrontmatter({
    projectRoot,
    config,
    fs,
    stages: [1, 3], // Schema + truthfulness only (faster than full validation)
  });

  const validation = {
    passing: validationResult.filesChecked - validationResult.filesWithErrors,
    failing: validationResult.filesWithErrors,
    warnings: validationResult.filesWithWarnings,
  };

  // Push validation issues
  for (const r of validationResult.results) {
    for (const e of r.errors) issues.push(e);
    for (const w of r.warnings) issues.push(w);
  }

  // Token analysis
  const tokenEstimates = withFrontmatter
    .map((f) => ({ file: f.path, tokens: f.frontmatter!.token_estimate ?? estimateTokens(f.content) }))
    .sort((a, b) => b.tokens - a.tokens);

  const totalTokens = tokenEstimates.reduce((sum, t) => sum + t.tokens, 0);
  const tokens = {
    total: totalTokens,
    average: tokenEstimates.length > 0 ? Math.round(totalTokens / tokenEstimates.length) : 0,
    largest: tokenEstimates.length > 0 ? tokenEstimates[0] : { file: '', tokens: 0 },
    smallest: tokenEstimates.length > 0 ? tokenEstimates[tokenEstimates.length - 1] : { file: '', tokens: 0 },
  };

  // Freshness
  const now = new Date();
  const thresholdMs = config.freshnessThresholdHours * 60 * 60 * 1000;
  let fresh = 0;
  let stale = 0;
  let unknown = 0;
  let stalestFile: { file: string; lastModified: Date } | undefined;

  for (const file of allFiles) {
    const absPath = joinPath(projectRoot, file);
    try {
      const stat = await fs.stat(absPath);
      const ageMs = now.getTime() - stat.mtime.getTime();
      if (ageMs > thresholdMs) {
        stale++;
        if (!stalestFile || stat.mtime < stalestFile.lastModified) {
          stalestFile = { file, lastModified: stat.mtime };
        }
      } else {
        fresh++;
      }
    } catch {
      unknown++;
    }
  }

  const freshness = { fresh, stale, unknown, stalestFile };

  // Placeholder penalty (A2): -5 per file with placeholders, capped at -20
  const placeholderResult = await verifyPlaceholders({ projectRoot, config, fs });
  const placeholderPenalty = Math.min(placeholderResult.filesWithPlaceholders * 5, 20);

  for (const pw of placeholderResult.warnings) {
    issues.push(pw);
  }

  // Score calculation (0-100)
  const coverageScore = coverage.percentage; // 0-100
  const validationScore = validationResult.filesChecked > 0
    ? Math.round(((validationResult.filesChecked - validationResult.filesWithErrors) / validationResult.filesChecked) * 100)
    : 100;
  const freshnessScore = allFiles.length > 0
    ? Math.round((fresh / allFiles.length) * 100)
    : 100;

  // Weighted average: coverage 40%, validation 40%, freshness 20%, minus placeholder penalty
  const score = Math.max(0, Math.round(
    coverageScore * 0.4 +
    validationScore * 0.4 +
    freshnessScore * 0.2,
  ) - placeholderPenalty);

  return {
    success: errors.length === 0,
    score,
    coverage,
    validation,
    tokens,
    freshness,
    issues,
    errors,
    warnings,
  };
}
