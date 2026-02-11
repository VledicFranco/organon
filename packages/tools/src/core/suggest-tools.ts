/**
 * Automation suggestion heuristics.
 *
 * Analyzes protocols and suggests which ones should be upgraded
 * from manual → semi-automated → automated, based on step count,
 * complexity, frequency indicators, and error-proneness.
 */

import { parseFrontmatter } from './frontmatter-parser.js';
import { joinPath } from './config.js';
import type {
  AutomationTier,
  Complexity,
  DiagnosticMessage,
  FileSystem,
  OrganonConfig,
  SuggestToolsResult,
  ToolSuggestion,
} from './types.js';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface SuggestToolsOptions {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEP_THRESHOLD_AUTOMATED = 5;
const STEP_THRESHOLD_SEMI = 2;

// Keywords that indicate error-proneness or frequency
const ERROR_PRONE_KEYWORDS = [
  'careful', 'ensure', 'verify', 'must', 'critical',
  'never', 'always', 'exactly', 'precisely',
];
const FREQUENCY_KEYWORDS = [
  'every', 'each', 'always', 'regularly', 'frequently',
  'before each', 'after each', 'on every',
];
const CROSS_DOMAIN_KEYWORDS = [
  'across', 'multiple', 'all domains', 'cross-cutting',
  'throughout', 'every domain',
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function suggestTools(
  options: SuggestToolsOptions,
): Promise<SuggestToolsResult> {
  const { projectRoot, config, fs } = options;
  const errors: DiagnosticMessage[] = [];
  const warnings: DiagnosticMessage[] = [];
  const suggestions: ToolSuggestion[] = [];

  // Discover protocol files
  const organonFiles = await discoverOrganonFiles(projectRoot, config, fs);

  for (const file of organonFiles) {
    const absPath = joinPath(projectRoot, file);
    let content: string;
    try {
      content = await fs.readFile(absPath);
    } catch {
      continue;
    }

    const { frontmatter, body } = parseFrontmatter(content);
    if (frontmatter?.type !== 'procedures' || !frontmatter.protocols) continue;

    for (const proto of frontmatter.protocols) {
      const suggestedTier = suggestTier(proto.steps, proto.automation_tier, body);

      if (suggestedTier && suggestedTier !== proto.automation_tier) {
        const reason = buildReason(proto.steps, proto.automation_tier, suggestedTier, body);
        suggestions.push({
          protocolId: proto.id,
          protocolFile: file,
          currentTier: proto.automation_tier,
          suggestedTier,
          reason,
          steps: proto.steps,
          complexity: proto.complexity,
        });
      }
    }
  }

  return {
    success: errors.length === 0,
    suggestions,
    errors,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Suggestion logic
// ---------------------------------------------------------------------------

function suggestTier(
  steps: number,
  currentTier: AutomationTier,
  body: string,
): AutomationTier | null {
  const lower = body.toLowerCase();

  const errorProneScore = ERROR_PRONE_KEYWORDS.reduce(
    (count, kw) => count + (lower.includes(kw) ? 1 : 0),
    0,
  );
  const frequencyScore = FREQUENCY_KEYWORDS.reduce(
    (count, kw) => count + (lower.includes(kw) ? 1 : 0),
    0,
  );
  const crossDomainScore = CROSS_DOMAIN_KEYWORDS.reduce(
    (count, kw) => count + (lower.includes(kw) ? 1 : 0),
    0,
  );

  const totalScore = errorProneScore + frequencyScore + crossDomainScore;

  // Suggest upgrade based on step count + heuristic score
  if (currentTier === 'manual') {
    if (steps >= STEP_THRESHOLD_AUTOMATED || totalScore >= 4) {
      return 'automated';
    }
    if (steps >= STEP_THRESHOLD_SEMI || totalScore >= 2) {
      return 'semi-automated';
    }
  }

  if (currentTier === 'semi-automated') {
    if (steps >= STEP_THRESHOLD_AUTOMATED || totalScore >= 4) {
      return 'automated';
    }
  }

  return null;
}

function buildReason(
  steps: number,
  currentTier: AutomationTier,
  suggestedTier: AutomationTier,
  body: string,
): string {
  const reasons: string[] = [];
  const lower = body.toLowerCase();

  if (steps >= STEP_THRESHOLD_AUTOMATED) {
    reasons.push(`${steps} steps (threshold: ${STEP_THRESHOLD_AUTOMATED})`);
  } else if (steps >= STEP_THRESHOLD_SEMI) {
    reasons.push(`${steps} steps`);
  }

  const hasErrorProne = ERROR_PRONE_KEYWORDS.some((kw) => lower.includes(kw));
  if (hasErrorProne) reasons.push('error-prone language detected');

  const hasFrequency = FREQUENCY_KEYWORDS.some((kw) => lower.includes(kw));
  if (hasFrequency) reasons.push('frequent execution indicated');

  const hasCrossDomain = CROSS_DOMAIN_KEYWORDS.some((kw) => lower.includes(kw));
  if (hasCrossDomain) reasons.push('cross-domain scope');

  return reasons.length > 0
    ? `Upgrade ${currentTier} → ${suggestedTier}: ${reasons.join(', ')}`
    : `Consider upgrading from ${currentTier} to ${suggestedTier}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function discoverOrganonFiles(
  projectRoot: string,
  config: OrganonConfig,
  fs: FileSystem,
): Promise<string[]> {
  const allFiles = new Set<string>();

  for (const organonPath of config.organonPaths) {
    for (const pattern of config.organonGlobs) {
      const fullPattern = organonPath === '.' ? pattern : `${organonPath}/${pattern}`;
      const matches = await fs.glob(fullPattern, {
        cwd: projectRoot,
        ignore: config.ignorePatterns,
      });
      for (const m of matches) {
        allFiles.add(m);
      }
    }
  }

  return [...allFiles].sort();
}
